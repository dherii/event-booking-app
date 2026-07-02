// src/features/admin/certificados/types.ts

export interface VariavelTemplate {
  chave: string;       // ex: {{NOME_ALUNO}}
  label: string;       // ex: "Nome do aluno"
  exemplo: string;     // ex: "Ana Beatriz Silva"
}

export interface TemplateConfig {
  backgroundUrl: string;
  backgroundFile: File | null;
  nomeFontSize: number;       // px
  nomeColor: string;          // hex
  nomePosX: number;           // % do width
  nomePosY: number;           // % do height
  eventoFontSize: number;
  eventoColor: string;
  textAlign: 'left' | 'center' | 'right';
  fontFamily: 'serif' | 'sans-serif' | 'monospace';
}

export interface EventoConcluido {
  id: string;
  nome: string;
  data: string;
  totalInscritos: number;
  totalCheckin: number;
  cargaHoraria: number;       // horas
}

export interface HistoricoEmissao {
  id: string;
  eventoNome: string;
  quantidade: number;
  emitidoEm: string;          // ISO string
  status: 'enviado' | 'processando' | 'erro';
}

// ─── Variáveis disponíveis no template ────────────────────────────────────────

export const VARIAVEIS_TEMPLATE: VariavelTemplate[] = [
  { chave: '{{NOME_ALUNO}}',      label: 'Nome do aluno',       exemplo: 'Ana Beatriz Silva'        },
  { chave: '{{NOME_EVENTO}}',     label: 'Nome do evento',      exemplo: 'Semana de TI 2025'        },
  { chave: '{{CARGA_HORARIA}}',   label: 'Carga horária',       exemplo: '20 horas'                 },
  { chave: '{{DATA_EVENTO}}',     label: 'Data do evento',      exemplo: '25 e 26 de junho de 2025' },
  { chave: '{{DATA_EMISSAO}}',    label: 'Data de emissão',     exemplo: '26 de junho de 2025'      },
  { chave: '{{NOME_INSTITUICAO}}',label: 'Nome da instituição', exemplo: 'Unicatólica de Quixadá'   },
  { chave: '{{CODIGO_VALIDACAO}}',label: 'Código de validação', exemplo: 'TI25-A001-CERT'           },
];

// ─── Mock: eventos concluídos ─────────────────────────────────────────────────

export const MOCK_EVENTOS_CONCLUIDOS: EventoConcluido[] = [
  {
    id:             'ti-2025',
    nome:           'Semana de Tecnologia da Informação 2025',
    data:           '2025-06-25',
    totalInscritos: 108,
    totalCheckin:   94,
    cargaHoraria:   20,
  },
  {
    id:             'ux-2025',
    nome:           'Workshop de UX — Design de Produtos',
    data:           '2025-06-18',
    totalInscritos: 42,
    totalCheckin:   38,
    cargaHoraria:   8,
  },
  {
    id:             'empreend-2025',
    nome:           'Jornada de Empreendedorismo',
    data:           '2025-05-30',
    totalInscritos: 76,
    totalCheckin:   61,
    cargaHoraria:   12,
  },
];

// ─── Mock: histórico de emissões ──────────────────────────────────────────────

export const MOCK_HISTORICO: HistoricoEmissao[] = [
  {
    id:          'h3',
    eventoNome:  'Jornada de Empreendedorismo',
    quantidade:  61,
    emitidoEm:   '2025-06-01T10:22:00',
    status:      'enviado',
  },
  {
    id:          'h2',
    eventoNome:  'Workshop de UX — Design de Produtos',
    quantidade:  38,
    emitidoEm:   '2025-06-19T14:05:00',
    status:      'enviado',
  },
  {
    id:          'h1',
    eventoNome:  'Semana de Tecnologia da Informação 2025',
    quantidade:  94,
    emitidoEm:   '2025-06-26T09:30:00',
    status:      'processando',
  },
];

// ─── Template padrão ──────────────────────────────────────────────────────────

export const TEMPLATE_DEFAULT: TemplateConfig = {
  backgroundUrl:  '',
  backgroundFile: null,
  nomeFontSize:   36,
  nomeColor:      '#1e3a5f',
  nomePosX:       50,
  nomePosY:       52,
  eventoFontSize: 18,
  eventoColor:    '#374151',
  textAlign:      'center',
  fontFamily:     'serif',
};