// src/features/admin/eventos/types.ts

export interface Atracao {
  id: string;
  nomeArtista: string;
  horario: string; // datetime-local (ex: 2026-07-20T23:00)
  fotoUrl: string;
}

export type LoteTipo = 'ingresso' | 'mesa' | 'camarote';

export interface Lote {
  id: string;
  nome: string;
  quantidade: number;
  preco: number;          // 0 = gratuito
  dataInicio: string;
  dataFim: string;
  visivel: boolean;
  tipo: LoteTipo;
  capacidadePessoas: number | null; // nº de pessoas — só relevante pra mesa/camarote
}

// Etapa 1 — dados do evento pai
export interface EventoFormData {
  nome: string;
  descricao: string;
  banner: File | null;
  bannerPreview: string;
  dataInicio: string;
  dataFim: string;
  local: string;
  modalidade: 'presencial' | 'online' | 'hibrido';
  capacidadeTotal: number;
  categorias: string[];
}

// Etapa 2 — atrações / line-up
export interface AtracoesFormData {
  atracoes: Atracao[];
}

// Etapa 3 — lotes de ingressos
export interface LotesFormData {
  lotes: Lote[];
}

// Estado global do wizard
export interface WizardState {
  evento: EventoFormData;
  atracoes: AtracoesFormData;
  lotes: LotesFormData;
}
