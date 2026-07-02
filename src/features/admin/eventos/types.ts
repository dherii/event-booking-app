// src/features/admin/eventos/types.ts

export interface Atividade {
  id: string;
  titulo: string;
  descricao: string;
  data: string;
  horarioInicio: string;
  horarioFim: string;
  local: string;
  tipo: 'palestra' | 'oficina' | 'mesa-redonda' | 'outro';
}

export interface Lote {
  id: string;
  nome: string;
  quantidade: number;
  preco: number;          // 0 = gratuito
  dataInicio: string;
  dataFim: string;
  visivel: boolean;
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

// Etapa 2 — cronograma de atividades
export interface CronogramaFormData {
  atividades: Atividade[];
}

// Etapa 3 — lotes de ingressos
export interface LotesFormData {
  lotes: Lote[];
}

// Estado global do wizard
export interface WizardState {
  evento: EventoFormData;
  cronograma: CronogramaFormData;
  lotes: LotesFormData;
}