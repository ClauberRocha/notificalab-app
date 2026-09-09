import { Link, useNavigate } from "@tanstack/react-router";
import { useMemo, useState } from "react";
import { ArrowLeft, ArrowRight, Check, Loader2 } from "lucide-react";
import { toast } from "sonner";
import { supabase } from "@/integrations/supabase/client";
import { insertCase } from "@/lib/offline/db";
import { useAuth } from "@/hooks/use-auth";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { renderSmartField } from "@/components/smart-fields";
import { AntecedentesEpidemiologicosPanel } from "@/components/antecedentes-epi";
import { DadosClinicosPanel } from "@/components/dados-clinicos";
import { CaseImporter } from "@/components/case-importer";
import {
  SIM_NAO_IGN,
  SEXO,
  GESTANTE,
  RACA_COR,
  ESCOLARIDADE,
  ZONA,
  CONTATO_CASO,
  ASPECTO_LIQUOR,
  CLASSIFICACAO_CASO,
  ESPECIFICACAO_CONFIRMADO,
  CRITERIO_CONFIRMACAO,
  EVOLUCAO_CASO,
  STATUS,
  SINAIS_SINTOMAS_KEYS,
  VACINAS_KEYS,
  DOENCAS_PREEXISTENTES_KEYS,
  RESULTADOS_LAB_KEYS,
  QUIMIOCITOLOGICO_KEYS,
} from "@/lib/meningite-options";

export type MeningiteAgravo = "outras_meningites";

const LABEL_MAP: Record<MeningiteAgravo, string> = {
  outras_meningites: "Outras Meningites",
};

type Opt = { value: string; label: string };
type FieldDef =
  | { name: string; label: string; type: "text" | "date" | "number" | "textarea"; required?: boolean; col?: 1 | 2 | 3 }
  | { name: string; label: string; type: "select"; options: Opt[]; required?: boolean; col?: 1 | 2 | 3 };

type Step = {
  title: string;
  description?: string;
  fields?: FieldDef[];
  custom?: "sintomas" | "vacinas" | "doencas" | "resultados_lab" | "quimiocitologico" | "antecedentes_epi" | "dados_clinicos";
};

const STEPS: Step[] = [
  {
    title: "Notificação",
    fields: [
      { name: "numero_ficha", label: "Nº da Notificação", type: "text" },
      { name: "data_notificacao", label: "Data da notificação", type: "date", required: true },
      { name: "semana_epidemiologica", label: "Semana Epidemiológica", type: "text" },
      { name: "data_primeiros_sintomas", label: "Data dos primeiros sintomas", type: "date" },
      { name: "data_investigacao", label: "Data da investigação", type: "date" },
      { name: "ocupacao", label: "Ocupação", type: "text" },
      { name: "uf_notificacao", label: "UF da notificação", type: "text" },
      { name: "municipio_notificacao", label: "Município da notificação", type: "text" },
      { name: "codigo_ibge_notificacao", label: "Código IBGE", type: "text" },
      { name: "regional", label: "Regional", type: "text" },
      { name: "macroregiao", label: "Macroregião", type: "text" },
      { name: "unidade_saude", label: "Unidade de saúde", type: "text", col: 2 },
      { name: "codigo_unidade_saude", label: "Código da unidade", type: "text" },
    ],
  },
  {
    title: "Paciente",
    fields: [
      { name: "nome_paciente", label: "Nome do paciente", type: "text", required: true, col: 2 },
      { name: "data_nascimento", label: "Data de nascimento", type: "date" },
      { name: "idade", label: "Idade", type: "number" },
      { name: "faixa_etaria", label: "Faixa Etária", type: "text" },
      { name: "sexo", label: "Sexo", type: "select", options: SEXO },
      { name: "gestante", label: "Gestante", type: "select", options: GESTANTE },
      { name: "raca_cor", label: "Raça/Cor", type: "select", options: RACA_COR },
      { name: "escolaridade", label: "Escolaridade", type: "select", options: ESCOLARIDADE, col: 2 },
      { name: "numero_cartao_sus", label: "Cartão SUS", type: "text" },
      { name: "nome_mae", label: "Nome da mãe", type: "text", col: 2 },
    ],
  },
  {
    title: "Endereço",
    fields: [
      { name: "uf_residencia", label: "UF", type: "text" },
      { name: "municipio_residencia", label: "Município", type: "text" },
      { name: "codigo_ibge_residencia", label: "Código IBGE", type: "text" },
      { name: "cep", label: "CEP", type: "text" },
      { name: "distrito", label: "Distrito", type: "text" },
      { name: "bairro", label: "Bairro", type: "text" },
      { name: "logradouro", label: "Logradouro", type: "text", col: 2 },
      { name: "numero_endereco", label: "Número", type: "text" },
      { name: "complemento", label: "Complemento", type: "text" },
      { name: "ponto_referencia", label: "Ponto de referência", type: "text", col: 2 },
      { name: "telefone", label: "Telefone", type: "text" },
      { name: "zona", label: "Zona", type: "select", options: ZONA },
      { name: "pais", label: "País", type: "text" },
    ],
  },
  { title: "Vacinação", description: "Vacinas recebidas (sim/não/ignorado, doses e data).", custom: "vacinas" },
  { title: "Doenças pré-existentes", custom: "doencas" },
  {
    title: "Contato e caso secundário",
    fields: [
      { name: "contato_caso_suspeito", label: "Contato com caso suspeito", type: "select", options: CONTATO_CASO, col: 2 },
      { name: "nome_contato", label: "Nome do contato", type: "text", col: 2 },
      { name: "telefone_contato", label: "Telefone do contato", type: "text" },
      { name: "endereco_contato", label: "Endereço do contato", type: "text", col: 2 },
      { name: "caso_secundario", label: "Caso secundário?", type: "select", options: SIM_NAO_IGN },
    ],
  },
  {
    title: "Hospitalização",
    fields: [
      { name: "ocorreu_hospitalizacao", label: "Houve hospitalização?", type: "select", options: SIM_NAO_IGN },
      { name: "data_internacao", label: "Data da internação", type: "date" },
      { name: "uf_hospital", label: "UF do hospital", type: "text" },
      { name: "municipio_hospital", label: "Município do hospital", type: "text" },
      { name: "nome_hospital", label: "Nome do hospital", type: "text", col: 2 },
      { name: "codigo_hospital", label: "Código do hospital", type: "text" },
    ],
  },
  {
    title: "Líquor",
    fields: [
      { name: "puncao_lombar", label: "Punção lombar?", type: "select", options: SIM_NAO_IGN },
      { name: "data_puncao", label: "Data da punção", type: "date" },
      { name: "aspecto_liquor", label: "Aspecto do líquor", type: "select", options: ASPECTO_LIQUOR, col: 2 },
    ],
  },
  { title: "Resultados laboratoriais", description: "Resultados por exame e material.", custom: "resultados_lab" },
  { title: "Quimiocitológico", description: "Exame quimiocitológico do líquor.", custom: "quimiocitologico" },
  {
    title: "Conclusão",
    fields: [
      { name: "classificacao_caso", label: "Classificação do caso", type: "select", options: CLASSIFICACAO_CASO },
      { name: "especificacao_confirmado", label: "Especificação (se confirmado)", type: "select", options: ESPECIFICACAO_CONFIRMADO, col: 2 },
      { name: "criterio_confirmacao", label: "Critério de confirmação", type: "select", options: CRITERIO_CONFIRMACAO },
      { name: "sorogrupo_meningitidis", label: "Sorogrupo N. meningitidis", type: "text" },
      { name: "numero_comunicantes", label: "Nº de comunicantes", type: "number" },
      { name: "quimioprofilaxia_comunicantes", label: "Quimioprofilaxia em comunicantes?", type: "select", options: SIM_NAO_IGN },
      { name: "data_quimioprofilaxia", label: "Data da quimioprofilaxia", type: "date" },
      { name: "doenca_relacionada_trabalho", label: "Doença relacionada ao trabalho?", type: "select", options: SIM_NAO_IGN },
      { name: "evolucao_caso", label: "Evolução do caso", type: "select", options: EVOLUCAO_CASO },
      { name: "data_evolucao", label: "Data da evolução", type: "date" },
      { name: "data_encerramento", label: "Data de encerramento", type: "date" },
      { name: "status", label: "Status", type: "select", options: STATUS },
      { name: "observacoes_adicionais", label: "Observações adicionais", type: "textarea", col: 3 },
      { name: "nome_investigador", label: "Nome do investigador", type: "text", col: 2 },
      { name: "funcao_investigador", label: "Função do investigador", type: "text" },
    ],
  },
  { title: "Dados Clínicos", description: "Sinais, sintomas, hospitalização e evolução.", custom: "dados_clinicos" },
  { title: "Antecedentes Epidemiológicos", description: "Doenças pré-existentes e vacinas recebidas.", custom: "antecedentes_epi" },
];

type FormState = Record<string, string>;

const NUMERIC_FIELDS = new Set(["idade", "numero_comunicantes"]);

type Vacina = { status: string; doses: string; data: string };
type Quimio = Record<string, string>;
type Lab = Record<string, string>;

const NOVA_PATH: Record<MeningiteAgravo, "/nova-ficha/outras-meningites"> = {
  outras_meningites: "/nova-ficha/outras-meningites",
};

const FICHAS_PATH: Record<MeningiteAgravo, "/fichas/outras-meningites"> = {
  outras_meningites: "/fichas/outras-meningites",
};

export function MeningiteForm({ agravo }: { agravo: MeningiteAgravo }) {
  const navigate = useNavigate();
  const { user } = useAuth();
  const [step, setStep] = useState(0);
  const [form, setForm] = useState<FormState>({
    tipo_notificacao: "individual",
    agravo,
    status: "em_investigacao",
    pais: "Brasil",
  });
  const [sintomas, setSintomas] = useState<Record<string, string>>({});
  const [sintomasOutras, setSintomasOutras] = useState("");
  const [vacinas, setVacinas] = useState<Record<string, Vacina>>({});
  const [doencas, setDoencas] = useState<Record<string, string>>({});
  const [doencasOutro, setDoencasOutro] = useState("");
  const [lab, setLab] = useState<Lab>({});
  const [quimio, setQuimio] = useState<Quimio>({});
  const [saving, setSaving] = useState(false);

  const current = STEPS[step];
  const isLast = step === STEPS.length - 1;

  const updateField = (name: string, value: string) => {
    setForm((p) => ({ ...p, [name]: value }));
  };

  const validateStep = (): boolean => {
    if (!current.fields) return true;
    for (const f of current.fields) {
      if ("required" in f && f.required && !form[f.name]?.trim()) {
        toast.error(`Preencha: ${f.label}`);
        return false;
      }
    }
    return true;
  };

  const next = () => {
    if (!validateStep()) return;
    setStep((s) => Math.min(s + 1, STEPS.length - 1));
    window.scrollTo({ top: 0, behavior: "smooth" });
  };
  const prev = () => {
    setStep((s) => Math.max(s - 1, 0));
    window.scrollTo({ top: 0, behavior: "smooth" });
  };

  const handleSubmit = async () => {
    if (!validateStep()) return;
    if (!form.nome_paciente?.trim() || !form.data_notificacao?.trim()) {
      toast.error("Nome do paciente e data da notificação são obrigatórios.");
      return;
    }
    if (!user) {
      toast.error("Sessão expirada. Faça login novamente.");
      return;
    }
    setSaving(true);
    try {
      const payload: Record<string, unknown> = { user_id: user.id, agravo };
      for (const [k, v] of Object.entries(form)) {
        if (v === "" || v === undefined) continue;
        if (NUMERIC_FIELDS.has(k)) {
          const n = Number(v);
          if (!Number.isNaN(n)) payload[k] = n;
        } else {
          payload[k] = v;
        }
      }

      // sinais_sintomas (with "outras" free text)
      payload.sinais_sintomas = {
        ...sintomas,
        ...(sintomasOutras ? { outras: sintomasOutras } : {}),
      };

      // vacinacao -> flatten to {<vac>: 'sim', <vac>_doses: n, <vac>_data: '...'}
      const vac: Record<string, unknown> = {};
      for (const [k, v] of Object.entries(vacinas)) {
        if (v.status) vac[k] = v.status;
        if (v.doses) {
          const n = Number(v.doses);
          if (!Number.isNaN(n)) vac[`${k}_doses`] = n;
        }
        if (v.data) vac[`${k}_data`] = v.data;
      }
      payload.vacinacao = vac;

      payload.doencas_preexistentes = {
        ...doencas,
        ...(doencasOutro ? { outro: doencasOutro } : {}),
      };
      payload.resultados_laboratoriais = lab;

      const quimioNum: Record<string, number> = {};
      for (const [k, v] of Object.entries(quimio)) {
        const n = Number(v);
        if (v !== "" && !Number.isNaN(n)) quimioNum[k] = n;
      }
      payload.exame_quimiocitologico = quimioNum;

      const { error } = await insertCase("meningite_cases", payload as Record<string, unknown>);
      if (error) throw error;
      toast.success("Ficha salva com sucesso!");
      navigate({ to: FICHAS_PATH[agravo] });
    } catch (err) {
      toast.error(err instanceof Error ? err.message : "Erro ao salvar ficha");
    } finally {
      setSaving(false);
    }
  };

  const progress = useMemo(() => Math.round(((step + 1) / STEPS.length) * 100), [step]);

  return (
    <div className="max-w-4xl mx-auto px-4 py-8">
      <div className="mb-6 flex flex-wrap items-start justify-between gap-4">
        <div>
          <Link to="/nova-ficha" className="text-sm text-muted-foreground hover:text-foreground inline-flex items-center gap-1">
            <ArrowLeft className="w-4 h-4" /> Voltar
          </Link>
          <h1 className="text-2xl font-bold mt-2">Nova ficha — {LABEL_MAP[agravo]}</h1>
          <p className="text-sm text-muted-foreground">Notificação individual de meningite</p>
          <p className="text-xs text-muted-foreground mt-1">
            Caminho: <span className="font-mono">{NOVA_PATH[agravo]}</span>
          </p>
        </div>
        <CaseImporter agravo="outras_meningites" />
      </div>

      <div className="mb-6">
        <div className="flex items-center justify-between text-xs text-muted-foreground mb-2">
          <span>Etapa {step + 1} de {STEPS.length}: <span className="text-foreground font-medium">{current.title}</span></span>
          <span>{progress}%</span>
        </div>
        <div className="h-2 bg-muted rounded-full overflow-hidden">
          <div className="h-full bg-primary transition-all" style={{ width: `${progress}%` }} />
        </div>
      </div>

      <div className="bg-card border rounded-2xl p-6">
        {current.description && (
          <p className="text-sm text-muted-foreground mb-4">{current.description}</p>
        )}

        {current.fields && (
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
            {(() => {
              const nodes: React.ReactNode[] = [];
              const fields = current.fields;
              for (let i = 0; i < fields.length; i++) {
                const f = fields[i];
                const next = fields[i + 1];
                if (f.name === "data_investigacao" && next?.name === "ocupacao") {
                  nodes.push(
                    <div key="data_investigacao__ocupacao" className="grid grid-cols-2 gap-4 sm:contents">
                      {renderSmartField(f, form, setForm) ?? (
                        <FieldRenderer field={f} value={form[f.name] ?? ""} onChange={(v) => updateField(f.name, v)} />
                      )}
                      {renderSmartField(next, form, setForm) ?? (
                        <FieldRenderer field={next} value={form[next.name] ?? ""} onChange={(v) => updateField(next.name, v)} />
                      )}
                    </div>
                  );
                  i++;
                  continue;
                }
                nodes.push(
                  renderSmartField(f, form, setForm) ?? (
                    <FieldRenderer key={f.name} field={f} value={form[f.name] ?? ""} onChange={(v) => updateField(f.name, v)} />
                  )
                );
              }
              return nodes;
            })()}
          </div>
        )}

        {current.custom === "sintomas" && (
          <div>
            <SimNaoGrid items={SINAIS_SINTOMAS_KEYS} values={sintomas} onChange={setSintomas} />
            <div className="mt-4">
              <Label className="text-xs">Outras</Label>
              <Textarea
                value={sintomasOutras}
                onChange={(e) => setSintomasOutras(e.target.value)}
                rows={2}
                className="mt-1"
                placeholder="Descreva outros sinais/sintomas"
              />
            </div>
          </div>
        )}

        {current.custom === "doencas" && (
          <div>
            <SimNaoGrid items={DOENCAS_PREEXISTENTES_KEYS} values={doencas} onChange={setDoencas} />
            <div className="mt-4">
              <Label className="text-xs">Outro</Label>
              <Input
                value={doencasOutro}
                onChange={(e) => setDoencasOutro(e.target.value)}
                className="mt-1"
                placeholder="Outra doença pré-existente"
              />
            </div>
          </div>
        )}

        {current.custom === "vacinas" && (
          <VacinasGrid values={vacinas} onChange={setVacinas} />
        )}

        {current.custom === "resultados_lab" && (
          <ResultadosLabGrid values={lab} onChange={setLab} />
        )}

        {current.custom === "quimiocitologico" && (
          <QuimioGrid values={quimio} onChange={setQuimio} />
        )}
                {current.custom === "dados_clinicos" && (
          <DadosClinicosPanel form={form} setForm={setForm} />
        )}

        {current.custom === "antecedentes_epi" && (
          <AntecedentesEpidemiologicosPanel form={form} setForm={setForm} />
        )}

      </div>

      <div className="flex justify-between mt-6">
        <Button type="button" variant="outline" onClick={prev} disabled={step === 0 || saving}>
          <ArrowLeft className="w-4 h-4 mr-1" /> Anterior
        </Button>
        {isLast ? (
          <Button type="button" onClick={handleSubmit} disabled={saving}>
            {saving ? <Loader2 className="w-4 h-4 mr-1 animate-spin" /> : <Check className="w-4 h-4 mr-1" />}
            Salvar ficha
          </Button>
        ) : (
          <Button type="button" onClick={next} disabled={saving}>
            Próximo <ArrowRight className="w-4 h-4 ml-1" />
          </Button>
        )}
      </div>
    </div>
  );
}

function FieldRenderer({
  field,
  value,
  onChange,
}: {
  field: FieldDef;
  value: string;
  onChange: (v: string) => void;
}) {
  const colClass = field.col === 3 ? "sm:col-span-3" : field.col === 2 ? "sm:col-span-2" : "sm:col-span-1";
  return (
    <div className={colClass}>
      <Label htmlFor={field.name} className="text-xs">
        {field.label}
        {"required" in field && field.required ? <span className="text-destructive"> *</span> : null}
      </Label>
      {field.type === "text" || field.type === "number" || field.type === "date" ? (
        <Input id={field.name} type={field.type} value={value} onChange={(e) => onChange(field.type === "text" || field.type === "textarea" ? e.target.value.toUpperCase() : e.target.value)} className="mt-1" />
      ) : field.type === "textarea" ? (
        <Textarea id={field.name} value={value} onChange={(e) => onChange(field.type === "text" || field.type === "textarea" ? e.target.value.toUpperCase() : e.target.value)} rows={3} className="mt-1" />
      ) : field.type === "select" ? (
        <Select value={value || undefined} onValueChange={onChange}>
          <SelectTrigger id={field.name} className="mt-1"><SelectValue placeholder="Selecione" /></SelectTrigger>
          <SelectContent>
            {field.options.map((o) => <SelectItem key={o.value} value={o.value}>{o.label}</SelectItem>)}
          </SelectContent>
        </Select>
      ) : null}
    </div>
  );
}

function SimNaoGrid({
  items,
  values,
  onChange,
}: {
  items: readonly { key: string; label: string }[];
  values: Record<string, string>;
  onChange: (v: Record<string, string>) => void;
}) {
  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
      {items.map((it) => (
        <div key={it.key} className="flex items-center justify-between gap-3 border rounded-lg p-3">
          <span className="text-sm font-medium">{it.label}</span>
          <div className="flex gap-1">
            {SIM_NAO_IGN.map((o) => {
              const selected = values[it.key] === o.value;
              return (
                <button
                  key={o.value}
                  type="button"
                  onClick={() => onChange({ ...values, [it.key]: o.value })}
                  className={`text-xs px-2.5 py-1 rounded-md border transition ${
                    selected ? "bg-primary text-primary-foreground border-primary" : "bg-background hover:bg-accent"
                  }`}
                >
                  {o.label}
                </button>
              );
            })}
          </div>
        </div>
      ))}
    </div>
  );
}

function VacinasGrid({
  values,
  onChange,
}: {
  values: Record<string, Vacina>;
  onChange: (v: Record<string, Vacina>) => void;
}) {
  const update = (key: string, patch: Partial<Vacina>) => {
    const existing = values[key] ?? { status: "", doses: "", data: "" };
    onChange({
      ...values,
      [key]: { ...existing, ...patch },
    });
  };

  return (
    <div className="space-y-3">
      {VACINAS_KEYS.map((v) => {
        const item = values[v.key] ?? { status: "", doses: "", data: "" };
        return (
          <div key={v.key} className="border rounded-lg p-3 grid grid-cols-1 sm:grid-cols-4 gap-3 items-end">
            <div className="sm:col-span-1">
              <Label className="text-xs">{v.label}</Label>
              <div className="flex gap-1 mt-1">
                {SIM_NAO_IGN.map((o) => {
                  const sel = item.status === o.value;
                  return (
                    <button
                      key={o.value}
                      type="button"
                      onClick={() => update(v.key, { status: o.value })}
                      className={`text-xs px-2 py-1 rounded-md border transition ${
                        sel ? "bg-primary text-primary-foreground border-primary" : "bg-background hover:bg-accent"
                      }`}
                    >
                      {o.label}
                    </button>
                  );
                })}
              </div>
            </div>
            <div>
              <Label className="text-xs">Doses</Label>
              <Input
                type="number"
                value={item.doses}
                onChange={(e) => update(v.key, { doses: e.target.value })}
                className="mt-1"
              />
            </div>
            <div className="sm:col-span-2">
              <Label className="text-xs">Data da última dose</Label>
              <Input
                type="date"
                value={item.data}
                onChange={(e) => update(v.key, { data: e.target.value })}
                className="mt-1"
              />
            </div>
          </div>
        );
      })}
    </div>
  );
}

function ResultadosLabGrid({
  values,
  onChange,
}: {
  values: Record<string, string>;
  onChange: (v: Record<string, string>) => void;
}) {
  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
      {RESULTADOS_LAB_KEYS.map((it) => (
        <div key={it.key}>
          <Label className="text-xs">{it.label}</Label>
          <Input
            value={values[it.key] ?? ""}
            onChange={(e) => onChange({ ...values, [it.key]: e.target.value })}
            className="mt-1"
            placeholder="Resultado / agente"
          />
        </div>
      ))}
    </div>
  );
}

function QuimioGrid({
  values,
  onChange,
}: {
  values: Record<string, string>;
  onChange: (v: Record<string, string>) => void;
}) {
  return (
    <div className="grid grid-cols-2 sm:grid-cols-3 gap-3">
      {QUIMIOCITOLOGICO_KEYS.map((it) => (
        <div key={it.key}>
          <Label className="text-xs">{it.label}</Label>
          <Input
            type="number"
            value={values[it.key] ?? ""}
            onChange={(e) => onChange({ ...values, [it.key]: e.target.value })}
            className="mt-1"
          />
        </div>
      ))}
    </div>
  );
}
