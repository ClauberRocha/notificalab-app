import { createFileRoute, useNavigate } from "@tanstack/react-router";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { Children, type ReactNode } from "react";
import { supabase } from "@/integrations/supabase/client";
import { deleteCase, updateCase } from "@/lib/offline/db";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { ArrowLeft, Trash2, Loader2, CheckCircle, Bug } from "lucide-react";
import { useAuth } from "@/hooks/use-auth";
import { format, differenceInDays } from "date-fns";
import { toast } from "sonner";
import { getSemanaEpidemiologica } from "@/data/semana-epd";
import { getSeNumber } from "@/lib/seUtils";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from "@/components/ui/alert-dialog";

export const Route = createFileRoute(
  "/_authenticated/fichas/coqueluche/$id",
)({
  head: () => ({ meta: [{ title: "Detalhes da Ficha — Coqueluche" }] }),
  component: FichaCoquelucheDetalhesPage,
});

function getSE(dateStr: string | null | undefined): string {
  if (!dateStr) return "";
  const isoDate = dateStr.slice(0, 10);
  const mapped = getSemanaEpidemiologica(isoDate);
  if (mapped !== null) return String(mapped);
  const dateObj = new Date(dateStr);
  const computed = getSeNumber(dateObj);
  return computed > 0 ? String(computed) : "";
}

const LABEL_MAP: Record<string, string> = {
  sim: "Sim",
  nao: "Não",
  ignorado: "Ignorado",
  masculino: "Masculino",
  feminino: "Feminino",
  em_investigacao: "Em investigação",
  encerrado: "Encerrado",
  confirmado: "Confirmado",
  descartado: "Descartado",
  cura: "Cura",
  obito: "Óbito",
  obito_coqueluche: "Óbito por Coqueluche",
  obito_outras_causas: "Óbito por Outras Causas",
  laboratorial: "Laboratorial",
  clinico_epidemiologico: "Clínico-epidemiológico",
  clinico: "Clínico",
  positiva: "Positiva",
  negativa: "Negativa",
  nao_realizada: "Não Realizada",
  bloqueio_vacinal: "Bloqueio Vacinal",
  quimioprofilaxia: "Quimioprofilaxia",
  ambos: "Ambos",
  uma: "1 Dose",
  duas: "2 Doses",
  tres: "3 Doses",
  tres_um_reforco: "3 + 1 Reforço",
  tres_dois_reforcos: "3 + 2 Reforços",
  nunca_vacinado: "Nunca Vacinado",
  nenhum: "Nenhum",
  um: "Um",
  dois_ou_mais: "Dois ou mais",
  anos: "anos",
  meses: "meses",
  dias: "dias",
  horas: "horas",
  urbana: "Urbana",
  rural: "Rural",
  periurbana: "Periurbana",
  branca: "Branca",
  preta: "Preta",
  amarela: "Amarela",
  parda: "Parda",
  indigena: "Indígena",
};

const lbl = (v: unknown): string => {
  if (v === null || v === undefined || v === "") return "";
  const s = String(v);
  return LABEL_MAP[s] ?? s;
};

function InfoItem({ label, value }: { label: string; value: unknown }) {
  if (value === null || value === undefined || value === "") return null;
  return (
    <div>
      <p className="text-[11px] font-medium text-muted-foreground uppercase tracking-wide">
        {label}
      </p>
      <p className="text-sm font-medium text-foreground mt-0.5">{lbl(value)}</p>
    </div>
  );
}

function SectionCard({ title, children }: { title: string; children: ReactNode }) {
  const hasContent = Children.toArray(children).some(Boolean);
  if (!hasContent) return null;
  return (
    <Card>
      <CardHeader className="pb-3">
        <CardTitle className="text-sm font-semibold">{title}</CardTitle>
      </CardHeader>
      <CardContent className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
        {children}
      </CardContent>
    </Card>
  );
}

type AnyObj = Record<string, unknown>;
const asObj = (v: unknown): AnyObj =>
  v && typeof v === "object" ? (v as AnyObj) : {};

function fmtDate(d: unknown): string | null {
  if (!d || typeof d !== "string") return null;
  const dt = new Date(d);
  return isNaN(dt.getTime()) ? null : format(dt, "dd/MM/yyyy");
}

function FichaCoquelucheDetalhesPage() {
  const { id } = Route.useParams();
  const navigate = useNavigate();
  const queryClient = useQueryClient();
  const { can } = useAuth();
  const canDelete = can("fichas.delete");

  const { data: ficha, isLoading } = useQuery({
    queryKey: ["coqueluche-case", id],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("coqueluche_cases")
        .select("*")
        .eq("id", id)
        .maybeSingle();
      if (error) throw error;
      return data as AnyObj | null;
    },
  });

  const deleteMutation = useMutation({
    mutationFn: async () => {
      const { error } = await deleteCase("coqueluche_cases", id);
      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["coqueluche-cases"] });
      toast.success("Ficha excluída.");
      navigate({ to: "/fichas/coqueluche" });
    },
    onError: (e: Error) => toast.error(e.message),
  });

  const encerrarMutation = useMutation({
    mutationFn: async () => {
      const { error } = await updateCase("coqueluche_cases", id, {
        status: "encerrado",
        data_encerramento: new Date().toISOString().split("T")[0],
      });
      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["coqueluche-case", id] });
      queryClient.invalidateQueries({ queryKey: ["coqueluche-cases"] });
      toast.success("Caso encerrado.");
    },
    onError: (e: Error) => toast.error(e.message),
  });

  if (isLoading) {
    return (
      <div className="flex items-center justify-center py-20">
        <Loader2 className="w-8 h-8 animate-spin text-primary" />
      </div>
    );
  }

  if (!ficha) {
    return (
      <div className="text-center py-20">
        <p className="text-muted-foreground">Ficha não encontrada.</p>
        <Button
          variant="outline"
          className="mt-4"
          onClick={() => navigate({ to: "/fichas/coqueluche" })}
        >
          Voltar
        </Button>
      </div>
    );
  }

  const sint = asObj(ficha.sinais_sintomas);
  const comp = asObj(ficha.complicacoes);

  const encerDias =
    ficha.data_encerramento && ficha.data_primeiros_sintomas
      ? differenceInDays(
          new Date(ficha.data_encerramento as string),
          new Date(ficha.data_primeiros_sintomas as string),
        )
      : null;
  const prazo =
    encerDias === null
      ? null
      : encerDias <= 30
        ? "Até 30 dias"
        : encerDias <= 60
          ? "Até 60 dias"
          : "Mais de 60 dias";

  const status = ficha.status as string | undefined;
  const idade =
    ficha.idade != null
      ? `${ficha.idade}${ficha.tipo_idade ? ` ${lbl(ficha.tipo_idade)}` : ""}`
      : null;

  return (
    <div className="max-w-5xl mx-auto px-4 py-6 space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div className="flex items-center gap-4">
          <Button
            variant="outline"
            size="icon"
            onClick={() => navigate({ to: "/fichas" })}
          >
            <ArrowLeft className="w-4 h-4" />
          </Button>
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-purple-500/10 flex items-center justify-center">
              <Bug className="w-5 h-5 text-purple-600" />
            </div>
            <div>
              <h1 className="text-xl font-bold text-foreground">
                {(ficha.nome_paciente as string) || "(sem nome)"}
              </h1>
              <div className="flex items-center gap-2 mt-1">
                <Badge className="bg-purple-500/10 text-purple-700 border border-purple-500/20">
                  Coqueluche
                </Badge>
                <Badge
                  className={
                    status === "encerrado"
                      ? "bg-emerald-500/10 text-emerald-700 border-emerald-500/20 border"
                      : "bg-amber-500/10 text-amber-700 border-amber-500/20 border"
                  }
                >
                  {lbl(status)}
                </Badge>
              </div>
            </div>
          </div>
        </div>
        <div className="flex gap-2">
          {status !== "encerrado" && (
            <Button
              variant="outline"
              className="gap-2"
              onClick={() => encerrarMutation.mutate()}
              disabled={encerrarMutation.isPending}
            >
              <CheckCircle className="w-4 h-4" /> Encerrar
            </Button>
          )}
          {canDelete && (
            <AlertDialog>
              <AlertDialogTrigger asChild>
                <Button
                  variant="outline"
                  className="gap-2 text-destructive hover:text-destructive"
                >
                  <Trash2 className="w-4 h-4" /> Excluir
                </Button>
              </AlertDialogTrigger>
              <AlertDialogContent>
                <AlertDialogHeader>
                  <AlertDialogTitle>Excluir ficha?</AlertDialogTitle>
                  <AlertDialogDescription>
                    Essa ação não pode ser desfeita.
                  </AlertDialogDescription>
                </AlertDialogHeader>
                <AlertDialogFooter>
                  <AlertDialogCancel>Cancelar</AlertDialogCancel>
                  <AlertDialogAction onClick={() => deleteMutation.mutate()}>
                    Excluir
                  </AlertDialogAction>
                </AlertDialogFooter>
              </AlertDialogContent>
            </AlertDialog>
          )}
        </div>
      </div>

      <SectionCard title="Dados Gerais">
        <InfoItem label="Agravo" value="Coqueluche (A37.9)" />
        <InfoItem label="Data Notificação" value={fmtDate(ficha.data_notificacao)} />
        <InfoItem label="Sem.Epd." value={ficha.data_notificacao ? getSE(String(ficha.data_notificacao)) : "—"} />
        <InfoItem label="UF" value={ficha.uf_notificacao} />
        <InfoItem label="Município" value={ficha.municipio_notificacao} />
        <InfoItem label="Unidade de Saúde" value={ficha.unidade_saude} />
        <InfoItem
          label="Data Primeiros Sintomas"
          value={fmtDate(ficha.data_primeiros_sintomas)}
        />
        <InfoItem label="Unidade Sentinela" value={ficha.unidade_sentinela} />
        <InfoItem label="Nº da Notificação" value={ficha.numero_ficha} />
      </SectionCard>

      <SectionCard title="Paciente">
        <InfoItem label="Nome" value={ficha.nome_paciente} />
        <InfoItem label="Data Nascimento" value={fmtDate(ficha.data_nascimento)} />
        <InfoItem label="Idade" value={idade} />
        <InfoItem label="Sexo" value={ficha.sexo} />
        <InfoItem label="Raça/Cor" value={ficha.raca_cor} />
        <InfoItem label="Nome da Mãe" value={ficha.nome_mae} />
        <InfoItem label="Cartão SUS" value={ficha.numero_cartao_sus} />
        <InfoItem label="Ocupação" value={ficha.ocupacao} />
      </SectionCard>

      <SectionCard title="Residência">
        <InfoItem label="UF" value={ficha.uf_residencia} />
        <InfoItem label="Município" value={ficha.municipio_residencia} />
        <InfoItem label="Bairro" value={ficha.bairro} />
        <InfoItem label="Logradouro" value={ficha.logradouro} />
        <InfoItem label="Número" value={ficha.numero_endereco} />
        <InfoItem label="CEP" value={ficha.cep} />
        <InfoItem label="Telefone" value={ficha.telefone} />
        <InfoItem label="Zona" value={ficha.zona} />
      </SectionCard>

      <SectionCard title="Antecedentes / Vacinação">
        <InfoItem label="Contato com Caso" value={ficha.contato_caso_suspeito} />
        <InfoItem label="Nome do Contato" value={ficha.nome_contato} />
        <InfoItem
          label="Doses Vacina DTP/Tetravalente"
          value={ficha.doses_vacina_triplice}
        />
        <InfoItem label="Data Última Dose" value={fmtDate(ficha.data_ultima_dose)} />
        <InfoItem
          label="Data Início da Tosse"
          value={fmtDate(ficha.data_inicio_tosse)}
        />
      </SectionCard>

      <SectionCard title="Sinais e Sintomas">
        <InfoItem label="Tosse" value={sint.tosse} />
        <InfoItem label="Tosse Paroxística" value={sint.tosse_paroxistica} />
        <InfoItem
          label="Respiração Ruidosa (Guincho)"
          value={sint.respiracao_ruidosa}
        />
        <InfoItem label="Apnéia" value={sint.apneia} />
        <InfoItem label="Vômitos" value={sint.vomitos} />
        <InfoItem label="Cianose" value={sint.cianose} />
        <InfoItem label="Temperatura < 38ºC" value={sint.temperatura_menor_38} />
        <InfoItem label="Temperatura ≥ 38ºC" value={sint.temperatura_maior_38} />
      </SectionCard>

      <SectionCard title="Complicações">
        <InfoItem label="Pneumonia/Broncopneumonia" value={comp.pneumonia} />
        <InfoItem label="Encefalopatia (convulsões)" value={comp.encefalopatia} />
        <InfoItem label="Desidratação" value={comp.desidratacao} />
        <InfoItem label="Otite" value={comp.otite} />
        <InfoItem label="Desnutrição" value={comp.desnutricao} />
        {comp.outros ? (
          <InfoItem label="Outras Complicações" value={comp.outros} />
        ) : null}
      </SectionCard>

      <SectionCard title="Atendimento e Laboratório">
        <InfoItem label="Hospitalização" value={ficha.ocorreu_hospitalizacao} />
        {ficha.ocorreu_hospitalizacao === "sim" ? (
          <>
            <InfoItem label="Data Internação" value={fmtDate(ficha.data_internacao)} />
            <InfoItem label="Nome do Hospital" value={ficha.nome_hospital} />
          </>
        ) : null}
        <InfoItem label="Utilizou Antibiótico" value={ficha.utilizou_antibiotico} />
        <InfoItem label="Coleta Nasofaringe" value={ficha.coleta_nasofaringe} />
        <InfoItem label="Resultado Cultura" value={ficha.resultado_cultura} />
        <InfoItem label="Medidas de Prevenção" value={ficha.medidas_prevencao} />
        <InfoItem label="Nº Comunicantes" value={ficha.numero_comunicantes} />
        <InfoItem
          label="Casos Secundários"
          value={ficha.casos_secundarios_confirmados}
        />
      </SectionCard>

      <SectionCard title="Conclusão">
        <InfoItem label="Agravo/Doença" value="Coqueluche" />
        <InfoItem
          label="Status"
          value={status === "em_investigacao" ? "Em Aberto" : "Encerrado"}
        />
        <InfoItem
          label="Classificação Final"
          value={ficha.classificacao_final}
        />
        <InfoItem
          label="Critério de Confirmação"
          value={ficha.criterio_confirmacao}
        />
        <InfoItem label="Evolução" value={ficha.evolucao} />
        <InfoItem label="Data do Óbito" value={fmtDate(ficha.data_obito)} />
        <InfoItem
          label="Data Encerramento"
          value={fmtDate(ficha.data_encerramento)}
        />
        {encerDias !== null ? (
          <InfoItem label="Encer./Dias" value={String(encerDias)} />
        ) : null}
        {prazo ? <InfoItem label="Prazo" value={prazo} /> : null}
        <InfoItem
          label="Doença Relacionada ao Trabalho"
          value={ficha.doenca_relacionada_trabalho}
        />
      </SectionCard>

      {ficha.observacoes_adicionais ? (
        <Card>
          <CardHeader className="pb-3">
            <CardTitle className="text-sm font-semibold">
              Observações Complementares
            </CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-sm text-muted-foreground whitespace-pre-wrap">
              {String(ficha.observacoes_adicionais)}
            </p>
          </CardContent>
        </Card>
      ) : null}
    </div>
  );
}
