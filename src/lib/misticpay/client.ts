// src/lib/misticpay/client.ts
// Funções utilitárias para a API da MisticPay.
// Autenticação: headers `ci` (Client ID) e `cs` (Client Secret).
// Sem SDK — apenas fetch nativo com tipagem completa.
//
// Variáveis de ambiente necessárias:
//   MISTICPAY_CI   — Client ID
//   MISTICPAY_CS   — Client Secret
//   MISTICPAY_WEBHOOK_URL — URL pública do nosso webhook (opcional por transação)
//
// Base URL: https://api.misticpay.com/api

// ─── Validação de env ─────────────────────────────────────────────────────────

function requireEnv(key: string): string {
  const v = process.env[key];
  if (!v) throw new Error(`Variável de ambiente obrigatória ausente: ${key}`);
  return v;
}

const MISTICPAY_BASE = 'https://api.misticpay.com/api';

// ─── Headers padrão ───────────────────────────────────────────────────────────

function getHeaders(): Record<string, string> {
  return {
    'ci':           requireEnv('MISTICPAY_CI'),
    'cs':           requireEnv('MISTICPAY_CS'),
    'Content-Type': 'application/json',
  };
}

// ─── Helper de request ────────────────────────────────────────────────────────

async function misticRequest<T>(
  method: 'GET' | 'POST',
  path: string,
  body?: unknown,
): Promise<T> {
  const url = `${MISTICPAY_BASE}${path}`;

  const response = await fetch(url, {
    method,
    headers: getHeaders(),
    body: body ? JSON.stringify(body) : undefined,
  });

  const json = await response.json();

  if (!response.ok) {
    const msg = json?.message ?? `MisticPay error ${response.status}`;
    console.error(`[misticpay] ${method} ${path} → ${response.status}:`, json);
    throw new Error(`MisticPay: ${msg}`);
  }

  return json as T;
}

// ─── Tipos da API ─────────────────────────────────────────────────────────────

export interface MisticPayCobrancaResponse {
  message: string;
  data: {
    transactionId:     string;
    payer: {
      name:     string;
      document: string;
    };
    transactionFee:    number;   // em centavos
    transactionType:   string;   // "DEPOSITO"
    transactionMethod: string;   // "PIX"
    transactionAmount: number;   // em centavos
    transactionState:  string;   // "PENDENTE"
    qrCodeBase64:      string;   // data:image/png;base64,...
    qrcodeUrl:         string;   // URL externa do QR (fallback)
    copyPaste:         string;   // código Pix copia e cola
  };
}

export interface MisticPayConsultaResponse {
  message: string;
  transaction: {
    transactionId:     string;
    value:             number;   // em reais (float)
    fee:               number;
    transactionState:  'PENDENTE' | 'COMPLETO' | 'FALHA';
    transactionType:   string;
    transactionMethod: string;
    createdAt:         string;
    updatedAt:         string;
  };
}

// ─── Payload do webhook (estrutura real da MisticPay) ─────────────────────────

export interface MisticPayWebhookPayload {
  transactionId:     number;
  transactionType:   'DEPOSITO' | 'RETIRADA';
  transactionMethod: 'PIX';
  clientName:        string;
  clientDocument:    string;
  status:            'PENDENTE' | 'COMPLETO' | 'FALHA';
  value:             number;   // em CENTAVOS — ex: 8000 = R$ 80,00
  fee:               number;
  e2e:               string;
}

// ─── Função principal: criar cobrança Pix ────────────────────────────────────

export interface CriarCobrancaPixParams {
  /** Valor em reais (ex: 80.00 = R$ 80,00). A API aceita float. */
  amount:          number;
  payerName:       string;
  /** CPF sem formatação. Use '00000000000' se não disponível. */
  payerDocument:   string;
  /** ID único da nossa aplicação — usamos o inscricao.id */
  transactionId:   string;
  description:     string;
}

export interface CobrancaPixResult {
  /** transactionId retornado pela MisticPay (string numérica) */
  mpTransactionId: string;
  /** Código Pix copia e cola */
  copyPaste:       string;
  /** QR Code em base64 (data:image/png;base64,...) */
  qrCodeBase64:    string;
  /** URL alternativa do QR Code */
  qrcodeUrl:       string;
}

/**
 * Cria uma cobrança Pix na MisticPay.
 *
 * ⚠️  ATENÇÃO: `amount` deve ser em REAIS (float), não em centavos.
 *     A API MisticPay recebe o valor em reais (ex: 4.55 = R$ 4,55).
 *     O retorno `transactionAmount` e `value` no webhook vêm em CENTAVOS.
 */
export async function criarCobrancaPix(
  params: CriarCobrancaPixParams,
): Promise<CobrancaPixResult> {
  const { amount, payerName, payerDocument, transactionId, description } = params;

  const payload = {
    amount,
    payerName,
    payerDocument,
    transactionId,
    description,
    // URL do webhook da nossa plataforma — opcional por transação
    ...(process.env.MISTICPAY_WEBHOOK_URL && {
      projectWebhook: process.env.MISTICPAY_WEBHOOK_URL,
    }),
  };

  const response = await misticRequest<MisticPayCobrancaResponse>(
    'POST',
    '/transactions/create',
    payload,
  );

  return {
    mpTransactionId: response.data.transactionId,
    copyPaste:       response.data.copyPaste,
    qrCodeBase64:    response.data.qrCodeBase64,
    qrcodeUrl:       response.data.qrcodeUrl,
  };
}

/**
 * Consulta o status atual de uma transação pelo ID da MisticPay.
 * Rate limit: 60 req/min por IP — usar com parcimônia (polling com intervalo).
 */
export async function consultarTransacao(
  mpTransactionId: string,
): Promise<MisticPayConsultaResponse['transaction']> {
  const response = await misticRequest<MisticPayConsultaResponse>(
    'POST',
    '/transactions/check',
    { transactionId: mpTransactionId },
  );

  return response.transaction;
}