// src/features/admin/participantes/types.ts

export type StatusPagamento = 'pago' | 'pendente' | 'cancelado' | 'cortesia';

export interface Inscrito {
  id: string;
  nome: string;
  email: string;
  cpf: string;
  telefone: string;
  evento: string;
  eventoId: string;
  atividade: string;
  lote: string;
  valor: number;
  status: StatusPagamento;
  checkin: boolean;
  checkinAt: string | null;
  criadoEm: string;
  codigoIngresso: string;
}

// ─── Mock data ────────────────────────────────────────────────────────────────

export const MOCK_INSCRITOS: Inscrito[] = [
  {
    id: '1',
    nome: 'Ana Beatriz Silva',
    email: 'ana@unicatolica.edu.br',
    cpf: '123.456.789-00',
    telefone: '(88) 99201-1234',
    evento: 'Semana de TI 2025',
    eventoId: 'ti-2025',
    atividade: 'Acesso Geral',
    lote: 'Lote 2',
    valor: 80,
    status: 'pago',
    checkin: true,
    checkinAt: '2025-06-25T08:42:00',
    criadoEm: '2025-06-10T14:23:00',
    codigoIngresso: 'TI25-A001',
  },
  {
    id: '2',
    nome: 'Carlos Eduardo Lima',
    email: 'carlos@unicatolica.edu.br',
    cpf: '987.654.321-00',
    telefone: '(88) 98872-5678',
    evento: 'Semana de TI 2025',
    eventoId: 'ti-2025',
    atividade: 'Acesso VIP',
    lote: 'Lote 1 — VIP',
    valor: 120,
    status: 'pendente',
    checkin: false,
    checkinAt: null,
    criadoEm: '2025-06-11T09:05:00',
    codigoIngresso: 'TI25-A002',
  },
  {
    id: '3',
    nome: 'Mariana Costa',
    email: 'mariana@unicatolica.edu.br',
    cpf: '456.789.123-00',
    telefone: '(88) 99334-9012',
    evento: 'Workshop de UX',
    eventoId: 'ux-2025',
    atividade: 'Acesso Geral',
    lote: 'Lote 1',
    valor: 40,
    status: 'pago',
    checkin: false,
    checkinAt: null,
    criadoEm: '2025-06-12T11:30:00',
    codigoIngresso: 'UX25-A001',
  },
  {
    id: '4',
    nome: 'Felipe Rocha',
    email: 'felipe@unicatolica.edu.br',
    cpf: '321.654.987-00',
    telefone: '(88) 99101-3456',
    evento: 'Semana de TI 2025',
    eventoId: 'ti-2025',
    atividade: 'Acesso Geral',
    lote: 'Lote 2',
    valor: 80,
    status: 'cancelado',
    checkin: false,
    checkinAt: null,
    criadoEm: '2025-06-08T16:14:00',
    codigoIngresso: 'TI25-A003',
  },
  {
    id: '5',
    nome: 'Isabela Ferreira',
    email: 'isa@unicatolica.edu.br',
    cpf: '654.321.987-00',
    telefone: '(88) 98765-7890',
    evento: 'Workshop de UX',
    eventoId: 'ux-2025',
    atividade: 'Acesso Geral',
    lote: 'Lote 1',
    valor: 40,
    status: 'pago',
    checkin: true,
    checkinAt: '2025-06-25T09:10:00',
    criadoEm: '2025-06-13T08:55:00',
    codigoIngresso: 'UX25-A002',
  },
  {
    id: '6',
    nome: 'Ricardo Alves',
    email: 'ricardo@unicatolica.edu.br',
    cpf: '789.123.456-00',
    telefone: '(88) 99556-2345',
    evento: 'Semana de TI 2025',
    eventoId: 'ti-2025',
    atividade: 'Acesso Geral',
    lote: 'Cortesia',
    valor: 0,
    status: 'cortesia',
    checkin: false,
    checkinAt: null,
    criadoEm: '2025-06-15T10:00:00',
    codigoIngresso: 'TI25-A004',
  },
  {
    id: '7',
    nome: 'Camila Nogueira',
    email: 'camila@unicatolica.edu.br',
    cpf: '111.222.333-44',
    telefone: '(88) 99887-6543',
    evento: 'Workshop de UX',
    eventoId: 'ux-2025',
    atividade: 'Acesso Geral',
    lote: 'Lote 1',
    valor: 40,
    status: 'pendente',
    checkin: false,
    checkinAt: null,
    criadoEm: '2025-06-14T13:22:00',
    codigoIngresso: 'UX25-A003',
  },
  {
    id: '8',
    nome: 'Thiago Mendonça',
    email: 'thiago@unicatolica.edu.br',
    cpf: '555.666.777-88',
    telefone: '(88) 99223-1122',
    evento: 'Semana de TI 2025',
    eventoId: 'ti-2025',
    atividade: 'Acesso VIP',
    lote: 'Lote 1 — VIP',
    valor: 120,
    status: 'pago',
    checkin: true,
    checkinAt: '2025-06-25T08:58:00',
    criadoEm: '2025-06-09T17:40:00',
    codigoIngresso: 'TI25-A005',
  },
];

export const MOCK_EVENTOS = [
  { id: 'ti-2025',  label: 'Semana de TI 2025' },
  { id: 'ux-2025',  label: 'Workshop de UX'    },
];