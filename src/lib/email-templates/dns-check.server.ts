// Server-only: valida, via consulta DNS pública, se os registros TXT/NS do
// domínio de envio já estão publicados. Sem isso, nenhum e-mail é disparado.

const ROOT_DOMAIN = 'consulti.slz.br'
const SENDER_SUBDOMAIN = `notify.${ROOT_DOMAIN}`
const VERIFY_TXT_NAME = `_lovable-email.${ROOT_DOMAIN}`
const VERIFY_TXT_VALUE =
  'lovable_email_verify=12c35913ee4f43861d130a480b82f7c67bbc788d785bfe356d520757ab49b9dd'
const EXPECTED_NS = ['ns5.lovable.cloud', 'ns6.lovable.cloud']

export interface SenderDnsStatus {
  ready: boolean
  /** Descrição dos registros ausentes (vazio quando ready). */
  missing: string[]
  senderDomain: string
  checkedAt: string
}

const READY_TTL_MS = 10 * 60 * 1000
const NOT_READY_TTL_MS = 60 * 1000

let cache: { status: SenderDnsStatus; expiresAt: number } | null = null

interface DohAnswer {
  name: string
  type: number
  data: string
}

async function resolve(name: string, type: 'TXT' | 'NS'): Promise<string[]> {
  const endpoints = [
    `https://dns.google/resolve?name=${encodeURIComponent(name)}&type=${type}`,
    `https://cloudflare-dns.com/dns-query?name=${encodeURIComponent(name)}&type=${type}`,
  ]

  for (const url of endpoints) {
    try {
      const res = await fetch(url, { headers: { accept: 'application/dns-json' } })
      if (!res.ok) continue
      const json = (await res.json()) as { Answer?: DohAnswer[] }
      const answers = json.Answer ?? []
      return answers.map((a) =>
        a.data.replace(/^"|"$/g, '').replace(/\\"/g, '"').replace(/\.$/, '').trim(),
      )
    } catch {
      // tenta o próximo resolver
    }
  }
  return []
}

/**
 * Verifica se os registros necessários estão publicados e visíveis
 * publicamente. Resultado fica em cache para não consultar a cada envio.
 */
export async function checkSenderDnsReady(
  options: { force?: boolean } = {},
): Promise<SenderDnsStatus> {
  if (!options.force && cache && cache.expiresAt > Date.now()) {
    return cache.status
  }

  const [txtRecords, nsRecords] = await Promise.all([
    resolve(VERIFY_TXT_NAME, 'TXT'),
    resolve(SENDER_SUBDOMAIN, 'NS'),
  ])

  const missing: string[] = []

  const txtOk = txtRecords.some((r) => r === VERIFY_TXT_VALUE)
  if (!txtOk) {
    missing.push(`TXT ${VERIFY_TXT_NAME}`)
  }

  const nsLower = nsRecords.map((r) => r.toLowerCase())
  for (const ns of EXPECTED_NS) {
    if (!nsLower.includes(ns)) {
      missing.push(`NS ${SENDER_SUBDOMAIN} -> ${ns}`)
    }
  }

  const status: SenderDnsStatus = {
    ready: missing.length === 0,
    missing,
    senderDomain: SENDER_SUBDOMAIN,
    checkedAt: new Date().toISOString(),
  }

  cache = {
    status,
    expiresAt: Date.now() + (status.ready ? READY_TTL_MS : NOT_READY_TTL_MS),
  }

  return status
}
