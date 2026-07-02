// src/features/admin/financeiro/types.ts

export type StatusTransacao = 'pago' | 'estornado' | 'pendente';

export interface Transacao {
  id: string;
  data: string;           // ISO string
  aluno: string;
  email: string;
  evento: string;
  lote: string;
  valorBruto: number;
  taxa: number;           // sempre 5% do bruto (0 se gratuito)
  valorLiquido: number;   // bruto - taxa
  status: StatusTransacao;
}

export interface DadosBancarios {
  tipoConta: 'pf' | 'pj';
  nomeRazao: string;
  cpfCnpj: string;
  banco: string;
  agencia: string;
  conta: string;
  digitoConta: string;
  chavePix: string;
  tipoChavePix: 'cpf' | 'cnpj' | 'email' | 'telefone' | 'aleatoria';
}

// ─── Constante de taxa ────────────────────────────────────────────────────────

export const TAXA_PLATAFORMA = 0.05;

export function calcularTaxa(bruto: number) {
  return parseFloat((bruto * TAXA_PLATAFORMA).toFixed(2));
}

// ─── Mock data ────────────────────────────────────────────────────────────────

function transacao(
  id: string,
  data: string,
  aluno: string,
  email: string,
  evento: string,
  lote: string,
  bruto: number,
  status: StatusTransacao,
): Transacao {
  const taxa        = status === 'estornado' ? 0 : calcularTaxa(bruto);
  const valorLiquido = status === 'estornado' ? 0 : bruto - taxa;
  return { id, data, aluno, email, evento, lote, valorBruto: bruto, taxa, valorLiquido, status };
}

export const MOCK_TRANSACOES: Transacao[] = [
  transacao('1',  '2025-06-25T14:32:00', 'Ana Beatriz Silva',    'ana@unicatolica.edu.br',      'Semana de TI 2025', 'Lote 2',       80,  'pago'),
  transacao('2',  '2025-06-25T11:55:00', 'Mariana Costa',        'mariana@unicatolica.edu.br',  'Workshop de UX',    'Lote 1',       40,  'pago'),
  transacao('3',  '2025-06-25T08:58:00', 'Thiago Mendonça',      'thiago@unicatolica.edu.br',   'Semana de TI 2025', 'Lote VIP',    120,  'pago'),
  transacao('4',  '2025-06-24T18:02:00', 'Felipe Rocha',         'felipe@unicatolica.edu.br',   'Semana de TI 2025', 'Lote 2',       80,  'estornado'),
  transacao('5',  '2025-06-24T16:44:00', 'Isabela Ferreira',     'isa@unicatolica.edu.br',      'Workshop de UX',    'Lote 1',       40,  'pago'),
  transacao('6',  '2025-06-23T10:20:00', 'Ricardo Alves',        'ricardo@unicatolica.edu.br',  'Semana de TI 2025', 'Lote 2',       80,  'pago'),
  transacao('7',  '2025-06-23T09:05:00', 'Camila Nogueira',      'camila@unicatolica.edu.br',   'Workshop de UX',    'Lote 1',       40,  'pago'),
  transacao('8',  '2025-06-22T15:30:00', 'Lucas Martins',        'lucas@unicatolica.edu.br',    'Semana de TI 2025', 'Lote VIP',    120,  'pago'),
  transacao('9',  '2025-06-22T13:10:00', 'Fernanda Lima',        'fernanda@unicatolica.edu.br', 'Semana de TI 2025', 'Lote 2',       80,  'pago'),
  transacao('10', '2025-06-21T11:00:00', 'Gabriel Santos',       'gabriel@unicatolica.edu.br',  'Workshop de UX',    'Lote 1',       40,  'pago'),
  transacao('11', '2025-06-21T09:45:00', 'Juliana Oliveira',     'juliana@unicatolica.edu.br',  'Semana de TI 2025', 'Lote 2',       80,  'pago'),
  transacao('12', '2025-06-20T17:22:00', 'Pedro Henrique Costa', 'pedro@unicatolica.edu.br',    'Semana de TI 2025', 'Lote VIP',    120,  'pago'),
  transacao('13', '2025-06-20T14:05:00', 'Vitória Mendes',       'vitoria@unicatolica.edu.br',  'Workshop de UX',    'Lote 1',       40,  'estornado'),
  transacao('14', '2025-06-19T10:30:00', 'Bruno Carvalho',       'bruno@unicatolica.edu.br',    'Semana de TI 2025', 'Lote 2',       80,  'pago'),
  transacao('15', '2025-06-19T08:15:00', 'Larissa Moura',        'larissa@unicatolica.edu.br',  'Workshop de UX',    'Lote 1',       40,  'pago'),
];

// ─── Dados para o gráfico (últimos 7 dias agregados) ─────────────────────────

export interface DiaReceita {
  dia: string;    // '19/06'
  liquido: number;
  bruto: number;
}

export function gerarDadosGrafico(): DiaReceita[] {
  const dias: Record<string, DiaReceita> = {};

  MOCK_TRANSACOES.forEach((t) => {
    if (t.status === 'estornado') return;
    const d   = new Date(t.data);
    const key = `${String(d.getDate()).padStart(2, '0')}/${String(d.getMonth() + 1).padStart(2, '0')}`;
    if (!dias[key]) dias[key] = { dia: key, liquido: 0, bruto: 0 };
    dias[key].bruto   += t.valorBruto;
    dias[key].liquido += t.valorLiquido;
  });

  return Object.values(dias).sort((a, b) => {
    const [da, ma] = a.dia.split('/').map(Number);
    const [db, mb] = b.dia.split('/').map(Number);
    return ma !== mb ? ma - mb : da - db;
  });
}