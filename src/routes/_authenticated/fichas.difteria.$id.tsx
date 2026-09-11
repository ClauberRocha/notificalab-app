import { createFileRoute, useNavigate } from "@tanstack/react-router";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { Children, type ReactNode } from "react";
import { supabase } from "@/integrations/supabase/client";
import { deleteCase, updateCase } from "@/lib/offline/db";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { ArrowLeft, Trash2, Loader2, CheckCircle, Syringe } from "lucide-react";
import { useAuth } from "@/hooks/use-auth";
import { format, differenceInDays } from "date-fns";
import { getSeNumber } from "@/lib/seUtils";
import { toast } from "sonner";
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

export const Route = createFileRoute("/_authenticated/fichas/difteria/$id")({
  head: () => ({ meta: [{ title: "Detalhes da Ficha — Difteria" }] }),
  component: FichaDifteriaDetalhesPage,
});

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
  cura_com_sequela: "Cura com Sequela",
  cura_sem_sequela: "Cura sem Sequela",
  obito_difteria: "Óbito por Difteria",
  obito_outras_causas: "Óbito por Outras Causas",
  cultura_com_toxigenicidade: "Cultura c/ Prova de Toxigenicidade",
  cultura_sem_toxigenicidade: "Cultura s/ Prova de Toxigenicidade",
  clinico_epidemiologico: "Clínico-epidemiológico",
  morte_pos_clinica_compativel: "Morte Pós Clínica Compatível",
  clinico: "Clínico",
  necropsia: "Necrópsia",
  orofaringe: "Orofaringe",
  nasofaringe: "Nasofaringe",
  orofaringe_nasofaringe: "Orofaringe e Nasofaringe",
  nao_coletado: "Não Coletado",
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

function FichaDifteriaDetalhesPage() {
  const { id } = Route.useParams();
  const navigate = useNavigate();
  const queryClient = useQueryClient();
  const { can } = useAuth();
  const canDelete = can("fichas.delete");

  const { data: ficha, isLoading } = useQuery({
    queryKey: ["difteria-case", id],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("difteria_cases")
        .select("*")
        .eq("id", id)
        .maybeSingle();
      if (error) throw error;
      return data as AnyObj | null;
    },
  });

  const deleteMutation = useMutation({
    mutationFn: async () => {
      const { error } = await deleteCase("difteria_cases", id);
      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["difteria-cases"] });
      toast.success("Ficha excluída.");
      navigate({ to: "/fichas/difteria" });
    },
    onError: (e: Error) => toast.error(e.message),
  });

  const encerrarMutation = useMutation({
    mutationFn: async () => {
      const { error } = await updateCase("difteria_cases", id, {
        status: "encerrado",
        data_encerramento: new Date().toISOString().split("T")[0],
      });
      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["difteria-case", id] });
      queryClient.invalidateQueries({ queryKey: ["difteria-cases"] });
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
          onClick={() => navigate({ to: "/fichas/difteria" })}
        >
          Voltar
        </Button>
      </div>
    );
  }

  const sint = asObj(ficha.sinais_sintomas);
  const loc = asObj(ficha.localizacao_pseudomembrana);
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

  const seNotif = ficha.data_notificacao
    ? `SE ${String(getSeNumber(new Date(ficha.data_notificacao as string))).padStart(2, "0")}`
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
            <div className="w-10 h-10 rounded-xl bg-chart-4/10 flex items-center justify-center">
              <Syringe className="w-5 h-5 text-chart-4" />
            </div>
            <div>
              <h1 className="text-xl font-bold text-foreground">
                {(ficha.nome_paciente as string) || "(sem nome)"}
              </h1>
              <div className="flex items-center gap-2 mt-1">
                <Badge className="bg-chart-4/10 text-chart-4 border border-chart-4/20">
                  Difteria
                </Badge>
                <Badge
                  className={
                    status === "encerrado"
                      ? "bg-accent/10 text-accent border-accent/20 border"
                      : "bg-chart-3/10 text-chart-3 border-chart-3/20 border"
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
        <InfoItem label="Agravo" value="Difteria (A36.9)" />
        <InfoItem label="Data Notificação" value={fmtDate(ficha.data_notificacao)} />
        <InfoItem label="Sem.Epd." value={seNotif ? seNotif.replace("SE ", "") : null} />
        <InfoItem label="UF" value={ficha.uf_notificacao} />
        <InfoItem label="Município" value={ficha.municipio_notificacao} />
        <InfoItem label="Unidade de Saúde" value={ficha.unidade_saude} />
        <InfoItem
          label="Data Primeiros Sintomas"
          value={fmtDate(ficha.data_primeiros_sintomas)}
        />
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
        <InfoItem label="Contato com Caso Suspeito" value={ficha.contato_caso_suspeito} />
        <InfoItem label="Nome do Contato" value={ficha.nome_contato} />
        <InfoItem label="Endereço do Contato" value={ficha.endereco_contato} />
        <InfoItem label="Doses Vacina DTP/Tetravalente" value={ficha.doses_vacina} />
        <InfoItem label="Data Última Dose" value={fmtDate(ficha.data_ultima_dose)} />
      </SectionCard>

      <SectionCard title="Sinais e Sintomas">
        <InfoItem label="Edema Ganglionar" value={sint.edema_ganglionar} />
        <InfoItem label="Prostração" value={sint.prostacao} />
        <InfoItem label="Edema de Pescoço" value={sint.edema_pescoco} />
        <InfoItem label="Pseudomembrana" value={sint.pseudomembrana} />
        <InfoItem label="Febre" value={sint.febre} />
        <InfoItem label="Palidez" value={sint.palidez} />
        <InfoItem
          label="Temperatura Corporal"
          value={ficha.temperatura_corporal ? `${ficha.temperatura_corporal}°C` : null}
        />
      </SectionCard>

      <SectionCard title="Localização da Pseudomembrana">
        <InfoItem label="Cavidade Nasal" value={loc.cavidade_nasal} />
        <InfoItem label="Amígdalas" value={loc.amigdalas} />
        <InfoItem label="Cordão Umbilical" value={loc.cordao_umbilical} />
        <InfoItem label="Faringe" value={loc.faringe} />
        <InfoItem label="Laringe" value={loc.laringe} />
        <InfoItem label="Órgãos Genitais" value={loc.orgaos_genitais} />
        <InfoItem label="Pálato" value={loc.palato} />
        <InfoItem label="Conduto Auditivo" value={loc.conduto_auditivo} />
        <InfoItem label="Traquéia" value={loc.traqueia} />
        <InfoItem label="Pele" value={loc.pele} />
        <InfoItem label="Conjuntiva" value={loc.conjuntiva} />
      </SectionCard>

      <SectionCard title="Complicações">
        <InfoItem label="Existiram Complicações" value={comp.existiram} />
        <InfoItem label="Miocardite" value={comp.miocardite} />
        <InfoItem label="Nefrite" value={comp.nefrite} />
        <InfoItem label="Arritmias Cardíacas" value={comp.arritmias_cardiacas} />
        <InfoItem
          label="Paralisia Músculos Intercostais"
          value={comp.paralisia_musculos_intercostais}
        />
        <InfoItem label="Paralisia do Palato" value={comp.paralisia_palato} />
        <InfoItem
          label="Paralisia Bilateral Extremidades"
          value={comp.paralisia_bilateral_extremidades}
        />
        {comp.outras ? <InfoItem label="Outras" value={comp.outras} /> : null}
      </SectionCard>

      <SectionCard title="Atendimento e Laboratório">
        <InfoItem label="Hospitalização" value={ficha.ocorreu_hospitalizacao} />
        <InfoItem label="Data Internação" value={fmtDate(ficha.data_internacao)} />
        <InfoItem label="Nome do Hospital" value={ficha.nome_hospital} />
        <InfoItem label="Material Coletado" value={ficha.material_coletado} />
        <InfoItem label="Resultado Cultura" value={ficha.resultado_cultura} />
        <InfoItem label="Provas de Toxigenicidade" value={ficha.provas_toxigenicidade} />
        <InfoItem label="Data Aplicação do Soro" value={fmtDate(ficha.data_aplicacao_soro)} />
        <InfoItem label="Utilizou Antibiótico" value={ficha.utilizou_antibiotico} />
        <InfoItem label="Medidas de Prevenção" value={ficha.medidas_prevencao} />
        <InfoItem label="Nº Comunicantes" value={ficha.numero_comunicantes} />
        <InfoItem label="Casos Secundários" value={ficha.casos_secundarios_confirmados} />
        <InfoItem label="Portadores Identificados" value={ficha.portadores_identificados} />
      </SectionCard>

      <SectionCard title="Conclusão">
        <InfoItem label="Agravo/Doença" value="Difteria" />
        <InfoItem
          label="Status"
          value={status === "em_investigacao" ? "Em Aberto" : "Encerrado"}
        />
        <InfoItem label="Classificação Final" value={ficha.classificacao_final} />
        <InfoItem label="Critério de Confirmação" value={ficha.criterio_confirmacao} />
        <InfoItem label="Evolução" value={ficha.evolucao} />
        <InfoItem label="Data do Óbito" value={fmtDate(ficha.data_obito)} />
        <InfoItem label="Data Encerramento" value={fmtDate(ficha.data_encerramento)} />
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
              Informações Complementares e Observações
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
