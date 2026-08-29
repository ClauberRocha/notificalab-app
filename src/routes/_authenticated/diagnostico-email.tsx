import { createFileRoute, redirect } from "@tanstack/react-router";
import { useQuery } from "@tanstack/react-query";
import { useServerFn } from "@tanstack/react-start";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import {
  MailCheck,
  RefreshCw,
  CheckCircle2,
  XCircle,
  Copy,
  AlertTriangle,
} from "lucide-react";
import { toast } from "sonner";
import { getSenderDnsStatus } from "@/lib/users.functions";

export const Route = createFileRoute("/_authenticated/diagnostico-email")({
  head: () => ({
    meta: [
      { title: "Diagnóstico de E-mail | Notifica-MA Intelligence" },
      {
        name: "description",
        content:
          "Status dos registros DNS (TXT e NS) do domínio de envio de e-mails da plataforma.",
      },
      { property: "og:title", content: "Diagnóstico de E-mail" },
      {
        property: "og:description",
        content:
          "Verifique a propagação dos registros DNS do domínio de envio de e-mails.",
      },
      { property: "og:type", content: "website" },
      { name: "twitter:card", content: "summary" },
    ],
  }),
  beforeLoad: ({ context }) => {
    const role = (context as { role?: string }).role;
    if (role !== "admin") throw redirect({ to: "/" });
  },
  component: DiagnosticoEmailPage,
});

function copy(value: string) {
  navigator.clipboard
    .writeText(value)
    .then(() => toast.success("Valor copiado."))
    .catch(() => toast.error("Não foi possível copiar."));
}

function DiagnosticoEmailPage() {
  const dnsStatusFn = useServerFn(getSenderDnsStatus);
  const { data, isLoading, isFetching, refetch } = useQuery({
    queryKey: ["sender-dns-status"],
    queryFn: () => dnsStatusFn({ data: {} }),
    staleTime: 60_000,
  });

  const ready = data?.ready ?? false;

  return (
    <div className="space-y-6 max-w-4xl mx-auto px-4 py-6">
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3">
        <div>
          <h1 className="text-2xl font-bold text-foreground flex items-center gap-2">
            <MailCheck className="w-6 h-6 text-primary" /> Diagnóstico de E-mail
          </h1>
          <p className="text-sm text-muted-foreground mt-1">
            Status dos registros DNS necessários para o envio de e-mails
          </p>
        </div>
        <Button
          variant="outline"
          className="gap-2"
          onClick={async () => {
            await dnsStatusFn({ data: { force: true } });
            await refetch();
            toast.success("Verificação concluída.");
          }}
          disabled={isFetching}
        >
          <RefreshCw
            className={`w-4 h-4 ${isFetching ? "animate-spin" : ""}`}
          />
          Verificar agora
        </Button>
      </div>

      <Card>
        <CardHeader className="pb-3">
          <CardTitle className="text-base flex items-center gap-2">
            Situação geral
            {!isLoading && (
              <Badge
                variant="outline"
                className={
                  ready
                    ? "border-green-300 bg-green-50 text-green-700"
                    : "border-amber-300 bg-amber-50 text-amber-800"
                }
              >
                {ready ? "Pronto" : "Pendente"}
              </Badge>
            )}
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-2 text-sm">
          <p>
            Domínio de envio:{" "}
            <span className="font-mono">{data?.senderDomain ?? "—"}</span>
          </p>
          <p className="text-muted-foreground">
            Última verificação:{" "}
            {data?.checkedAt
              ? new Date(data.checkedAt).toLocaleString("pt-BR")
              : "—"}
          </p>
          {!isLoading && !ready && (
            <p className="text-amber-800">
              Enquanto os registros abaixo não estiverem publicados, nenhum
              e-mail automático é disparado — as tentativas ficam registradas em
              Logs do Sistema.
            </p>
          )}
        </CardContent>
      </Card>

      <Card>
        <CardHeader className="pb-3">
          <CardTitle className="text-base">Registros esperados</CardTitle>
        </CardHeader>
        <CardContent className="p-0">
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead className="bg-muted/50 text-xs uppercase text-muted-foreground">
                <tr>
                  <th className="px-4 py-2 text-left">Tipo</th>
                  <th className="px-4 py-2 text-left">Nome (curto)</th>
                  <th className="px-4 py-2 text-left">Valor</th>
                  <th className="px-4 py-2 text-left">Status</th>
                </tr>
              </thead>
              <tbody>
                {(data?.records ?? []).map((r) => (
                  <tr
                    key={`${r.type}-${r.expected}`}
                    className="border-t border-border"
                  >
                    <td className="px-4 py-2 font-mono">{r.type}</td>
                    <td className="px-4 py-2 font-mono">{r.shortName}</td>
                    <td className="px-4 py-2">
                      <div className="flex items-start gap-2">
                        <span className="font-mono break-all text-xs">
                          {r.expected}
                        </span>
                        <Button
                          variant="ghost"
                          size="icon"
                          className="w-7 h-7 shrink-0"
                          onClick={() => copy(r.expected)}
                          aria-label="Copiar valor"
                        >
                          <Copy className="w-3.5 h-3.5" />
                        </Button>
                      </div>
                    </td>
                    <td className="px-4 py-2">
                      {r.found ? (
                        <span className="inline-flex items-center gap-1 text-green-700">
                          <CheckCircle2 className="w-4 h-4" /> Encontrado
                        </span>
                      ) : (
                        <span className="inline-flex items-center gap-1 text-destructive">
                          <XCircle className="w-4 h-4" /> Não encontrado
                        </span>
                      )}
                    </td>
                  </tr>
                ))}
                {isLoading && (
                  <tr>
                    <td
                      className="px-4 py-6 text-center text-muted-foreground"
                      colSpan={4}
                    >
                      Consultando o DNS público...
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
        </CardContent>
      </Card>

      <Card>
        <CardHeader className="pb-3">
          <CardTitle className="text-base">
            Como cadastrar no Registro.br
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-3 text-sm">
          <div className="flex gap-2 rounded-lg border border-amber-300 bg-amber-50 p-3 text-amber-900">
            <AlertTriangle className="w-4 h-4 mt-0.5 shrink-0" />
            <p>
              Não use a tela <strong>“Alterar servidores DNS”</strong> — ela
              troca o DNS do domínio inteiro. Use{" "}
              <strong>DNS → Configurar zona DNS → Modo avançado</strong>.
            </p>
          </div>
          <ol className="list-decimal space-y-1 pl-5">
            <li>Acesse o painel do Registro.br e abra a zona do domínio.</li>
            <li>
              Adicione o registro TXT usando apenas o nome curto{" "}
              <span className="font-mono">_lovable-email</span>.
            </li>
            <li>
              Adicione os dois registros NS com o nome curto{" "}
              <span className="font-mono">notify</span> (o ponto final no valor
              pode ser exigido: <span className="font-mono">ns5.lovable.cloud.</span>
              ).
            </li>
            <li>Salve/publique a zona e aguarde a propagação (~15 min).</li>
            <li>
              Volte aqui e clique em <strong>Verificar agora</strong>.
            </li>
          </ol>
        </CardContent>
      </Card>
    </div>
  );
}
