// Opções (enums) para fichas de Meningite (doença meningocócica / outras meningites)

export const opt = (value: string, label: string) => ({ value, label });

export const SIM_NAO_IGN = [
  opt("sim", "Sim"),
  opt("nao", "Não"),
  opt("ignorado", "Ignorado"),
];

export const TIPO_IDADE = [
  opt("hora", "Hora"),
  opt("dia", "Dia"),
  opt("mes", "Mês"),
  opt("ano", "Ano"),
];

export const SEXO = [
  opt("masculino", "Masculino"),
  opt("feminino", "Feminino"),
  opt("ignorado", "Ignorado"),
];

export const GESTANTE = [
  opt("1_trimestre", "1º trimestre"),
  opt("2_trimestre", "2º trimestre"),
  opt("3_trimestre", "3º trimestre"),
  opt("idade_gestacional_ignorada", "Idade gestacional ignorada"),
  opt("nao", "Não"),
  opt("nao_se_aplica", "Não se aplica"),
  opt("ignorado", "Ignorado"),
];

export const RACA_COR = [
  opt("branca", "Branca"),
  opt("preta", "Preta"),
  opt("amarela", "Amarela"),
  opt("parda", "Parda"),
  opt("indigena", "Indígena"),
  opt("ignorado", "Ignorado"),
];

export const ESCOLARIDADE = [
  opt("analfabeto", "Analfabeto"),
  opt("1a_4a_incompleta", "1ª a 4ª série incompleta"),
  opt("4a_completa", "4ª série completa"),
  opt("5a_8a_incompleta", "5ª a 8ª série incompleta"),
  opt("fundamental_completo", "Ensino fundamental completo"),
  opt("medio_incompleto", "Ensino médio incompleto"),
  opt("medio_completo", "Ensino médio completo"),
  opt("superior_incompleto", "Ensino superior incompleto"),
  opt("superior_completo", "Ensino superior completo"),
  opt("ignorado", "Ignorado"),
  opt("nao_se_aplica", "Não se aplica"),
];

export const ZONA = [
  opt("urbana", "Urbana"),
  opt("rural", "Rural"),
  opt("periurbana", "Periurbana"),
  opt("ignorado", "Ignorado"),
];

export const CONTATO_CASO = [
  opt("domicilio", "Domicílio"),
  opt("vizinhanca", "Vizinhança"),
  opt("trabalho", "Trabalho"),
  opt("creche_escola", "Creche/Escola"),
  opt("posto_saude_hospital", "Posto de Saúde/Hospital"),
  opt("outro_estado_municipio", "Outro estado/município"),
  opt("sem_historia_contato", "Sem história de contato"),
  opt("outro_pais", "Outro país"),
  opt("ignorado", "Ignorado"),
];

export const ASPECTO_LIQUOR = [
  opt("limpido", "Límpido"),
  opt("purulento", "Purulento"),
  opt("hemorragico", "Hemorrágico"),
  opt("turvo", "Turvo"),
  opt("xantocromico", "Xantocrômico"),
  opt("outro", "Outro"),
  opt("ignorado", "Ignorado"),
];

export const CLASSIFICACAO_CASO = [
  opt("confirmado", "Confirmado"),
  opt("descartado", "Descartado"),
];

export const ESPECIFICACAO_CONFIRMADO = [
  opt("meningococemia", "Meningococemia"),
  opt("meningite_meningococica", "Meningite meningocócica"),
  opt("meningite_meningococica_com_meningococemia", "Meningite meningocócica c/ meningococemia"),
  opt("meningite_tuberculosa", "Meningite tuberculosa"),
  opt("meningite_outras_bacterias", "Meningite por outras bactérias"),
  opt("meningite_nao_especificada", "Meningite não especificada"),
  opt("meningite_asseptica", "Meningite asséptica"),
  opt("meningite_outra_etiologia", "Meningite por outra etiologia"),
  opt("meningite_hemofilo", "Meningite por hemófilo"),
  opt("meningite_pneumococos", "Meningite por pneumococos"),
  opt("meningite_viral", "Meningite viral"),
  opt("meningite_asseptica_criptococos", "Meningite asséptica p/ criptococos"),
];

export const CRITERIO_CONFIRMACAO = [
  opt("cultura", "Cultura"),
  opt("cie", "CIE"),
  opt("ag_latex", "Ag. Látex"),
  opt("clinico", "Clínico"),
  opt("bacterioscopia", "Bacterioscopia"),
  opt("quimiocitologico_liquor", "Quimiocitológico do líquor"),
  opt("clinico_epidemiologico", "Clínico-epidemiológico"),
  opt("isolamento_viral", "Isolamento viral"),
  opt("pcr", "PCR"),
  opt("necropsia", "Necropsia"),
  opt("outros", "Outros"),
];

export const EVOLUCAO_CASO = [
  opt("internado", "Internado(a)"),
  opt("alta", "Alta"),
  opt("obito_meningite", "Óbito por meningite"),
  opt("obito_outra_causa", "Óbito por outra causa"),
  opt("ignorado", "Ignorado"),
];

export const STATUS = [
  opt("em_investigacao", "Em investigação"),
  opt("encerrado", "Encerrado"),
];

export const SINAIS_SINTOMAS_KEYS = [
  { key: "cefaleia", label: "Cefaleia" },
  { key: "febre", label: "Febre" },
  { key: "vomitos", label: "Vômitos" },
  { key: "convulsoes", label: "Convulsões" },
  { key: "rigidez_nuca", label: "Rigidez de nuca" },
  { key: "kernig_brudzinski", label: "Kernig / Brudzinski" },
  { key: "abaulamento_fontanela", label: "Abaulamento da fontanela" },
  { key: "petequias_sufusoes", label: "Petéquias / sufusões" },
  { key: "coma", label: "Coma" },
] as const;

export const VACINAS_KEYS = [
  { key: "polissacaridica_ac", label: "Polissacarídica A/C" },
  { key: "polissacaridica_bc", label: "Polissacarídica B/C" },
  { key: "conjugada_meningo_c", label: "Conjugada Meningo C" },
  { key: "bcg", label: "BCG" },
  { key: "triplice_viral", label: "Tríplice viral" },
  { key: "hemofilo", label: "Hemófilo" },
  { key: "pneumococo", label: "Pneumococo" },
] as const;

export const DOENCAS_PREEXISTENTES_KEYS = [
  { key: "aids_hiv", label: "AIDS/HIV" },
  { key: "outras_imunodepressoras", label: "Outras imunodepressoras" },
  { key: "ira", label: "IRA" },
  { key: "tuberculose", label: "Tuberculose" },
  { key: "traumatismo", label: "Traumatismo" },
  { key: "infeccao_hospitalar", label: "Infecção hospitalar" },
] as const;

export const RESULTADOS_LAB_KEYS = [
  { key: "cultura_liquor", label: "Cultura — líquor" },
  { key: "cultura_lesao_petequial", label: "Cultura — lesão petequial" },
  { key: "cultura_sangue_soro", label: "Cultura — sangue/soro" },
  { key: "cultura_escarro", label: "Cultura — escarro" },
  { key: "cie_liquor", label: "CIE — líquor" },
  { key: "cie_sangue_soro", label: "CIE — sangue/soro" },
  { key: "latex_liquor", label: "Látex — líquor" },
  { key: "latex_sangue_soro", label: "Látex — sangue/soro" },
  { key: "bacterioscopia_liquor", label: "Bacterioscopia — líquor" },
  { key: "bacterioscopia_lesao_petequial", label: "Bacterioscopia — lesão petequial" },
  { key: "bacterioscopia_sangue_soro", label: "Bacterioscopia — sangue/soro" },
  { key: "bacterioscopia_escarro", label: "Bacterioscopia — escarro" },
  { key: "isolamento_viral_liquor", label: "Isolamento viral — líquor" },
  { key: "isolamento_viral_fezes", label: "Isolamento viral — fezes" },
  { key: "pcr_liquor", label: "PCR — líquor" },
  { key: "pcr_lesao_petequial", label: "PCR — lesão petequial" },
  { key: "pcr_sangue_soro", label: "PCR — sangue/soro" },
  { key: "pcr_escarro", label: "PCR — escarro" },
] as const;

export const QUIMIOCITOLOGICO_KEYS = [
  { key: "hemacias", label: "Hemácias" },
  { key: "leucocitos", label: "Leucócitos" },
  { key: "monocitos", label: "Monócitos" },
  { key: "neutrofilos", label: "Neutrófilos" },
  { key: "eosinofilos", label: "Eosinófilos" },
  { key: "linfocitos", label: "Linfócitos" },
  { key: "glicose", label: "Glicose" },
  { key: "proteinas", label: "Proteínas" },
  { key: "cloreto", label: "Cloreto" },
] as const;
