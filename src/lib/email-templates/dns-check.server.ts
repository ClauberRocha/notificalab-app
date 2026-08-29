// Server-only: valida, via consulta DNS pública, se os registros TXT/NS do
// domínio de envio já estão publicados. Sem isso, nenhum e-mail é disparado.

const ROOT_DOMAIN = 'consulti.slz.br'
const SENDER_SUBDOMAIN = `notify.${ROOT_DOMAIN}`
const VERIFY_TXT_NAME = `_lovable-email.${ROOT_DOMAIN}`
const VERIFY_TXT_VALUE =
  'lovable_email_verify=12c35913ee4f43861d130a480b82f7c67bbc788d785bfe356d520757ab49b9dd'
const EXPECTED_NS = ['ns5.lovable.cloud', 'ns6.lovable.cloud']

export type DnsRecordType = 'TXT' | 'NS'

export interface SenderDnsRecord {
  type: DnsRecordType
  /** Nome curto para digitar no Registro.br (ex.: "_lovable-email", "notify"). */
  shortName: string
  /** Nome completo (FQDN). */
  name: string
  expected: string
  found: boolean
}

export interface SenderDnsStatus {
  ready: boolean
  /** Descrição dos registros ausentes (vazio quando ready). */
  missing: string[]
  /** Detalhamento de cada registro esperado. */
  records: SenderDnsRecord[]
  senderDomain: string
  rootDomain: string
  checkedAt: string
}

export const READY_TTL_MS = 10 * 60 * 1000
export const NOT_READY_TTL_MS = 60 * 1000

let cache: { status: SenderDnsStatus; expiresAt: number } | null = null

/** Resolvedor DNS: recebe nome + tipo e devolve os valores encontrados. */
export type DnsResolver = (
  name: string,
  type: DnsRecordType,
) => Promise<string[]>

interface DohAnswer {
  name: string
  type: number
  data: string
}

export const dohResolver: DnsResolver = async (name, type) => {
  const endpoints = [
    `https://dns.google/resolve?name=${encodeURIComponent(name)}&type=${type}`,
    `https://cloudflare-dns.com/dns-query?name=${encodeURIComponent(name)}&type=${type}`,
  ]

  for (const url of endpoints) {
    try {
      const res = await fetch(url, {
        headers: { accept: 'application/dns-json' },
      })
      if (!res.ok) continue
      const json = (await res.json()) as { Answer?: DohAnswer[] }
      const answers = json.Answer ?? []
      return answers.map((a) =>
        a.data
          .replace(/^"|"$/g, '')
          .replace(/\\"/g, '"')
          .replace(/\.$/, '')
          .trim(),
      )
    } catch {
      // tenta o próximo resolver
    }
  }
  return []
}

/**
 * Avalia o estado dos registros com um resolvedor arbitrário — sem cache.
 * Exportado para permitir testes sem rede.
 */
export async function evaluateSenderDns(
  resolver: DnsResolver = dohResolver,
): Promise<SenderDnsStatus> {
  const [txtRecords, nsRecords] = await Promise.all([
    resolver(VERIFY_TXT_NAME, 'TXT'),
    resolver(SENDER_SUBDOMAIN, 'NS'),
  ])

  const nsLower = nsRecords.map((r) => r.toLowerCase().replace(/\.$/, ''))

  const records: SenderDnsRecord[] = [
    {
      type: 'TXT',
      shortName: '_lovable-email',
      name: VERIFY_TXT_NAME,
      expected: VERIFY_TXT_VALUE,
      found: txtRecords.some((r) => r === VERIFY_TXT_VALUE),
    },
    ...EXPECTED_NS.map<SenderDnsRecord>((ns) => ({
      type: 'NS',
      shortName: 'notify',
      name: SENDER_SUBDOMAIN,
      expected: ns,
      found: nsLower.includes(ns),
    })),
  ]

  const missing = records
    .filter((r) => !r.found)
    .map((r) =>
      r.type === 'TXT' ? `TXT ${r.name}` : `NS ${r.name} -> ${r.expected}`,
    )

  return {
    ready: missing.length === 0,
    missing,
    records,
    senderDomain: SENDER_SUBDOMAIN,
    rootDomain: ROOT_DOMAIN,
    checkedAt: new Date().toISOString(),
  }
}

/**
 * Verifica se os registros necessários estão publicados e visíveis
 * publicamente. Resultado fica em cache para não consultar a cada envio.
 */
export async function checkSenderDnsReady(
  options: { force?: boolean; resolver?: DnsResolver } = {},
): Promise<SenderDnsStatus> {
  if (!options.force && cache && cache.expiresAt > Date.now()) {
    return cache.status
  }

  const status = await evaluateSenderDns(options.resolver ?? dohResolver)

  cache = {
    status,
    expiresAt: Date.now() + (status.ready ? READY_TTL_MS : NOT_READY_TTL_MS),
  }

  return status
}

/** Limpa o cache (usado em testes). */
export function resetSenderDnsCache() {
  cache = null
}
