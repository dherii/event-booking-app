// src/lib/asaas/client.ts
const ASAAS_BASE_URL = process.env.ASAAS_API_URL || 'https://sandbox.asaas.com/api/v3';

function hojeBrasil(): string {
  return new Intl.DateTimeFormat('en-CA', { timeZone: 'America/Sao_Paulo' }).format(new Date());
  // en-CA formata como YYYY-MM-DD
}

function getHeaders() {
  const apiKey = process.env.ASAAS_API_KEY;

  if (!apiKey) throw new Error('ASAAS_API_KEY não configurada');

  return {
    'access_token': apiKey,
    'Content-Type': 'application/json',
  };
}

export async function criarClienteAsaas(nome: string, cpfCnpj: string, email: string) {
  // Tenta localizar cliente já existente no Asaas por CPF antes de criar um novo
  const buscaResponse = await fetch(`${ASAAS_BASE_URL}/customers?cpfCnpj=${cpfCnpj}`, {
    method: 'GET',
    headers: getHeaders(),
  });

  if (buscaResponse.ok) {
    const busca = await buscaResponse.json();
    if (busca.data?.length > 0) {
      return busca.data[0].id;
    }
  }

  const response = await fetch(`${ASAAS_BASE_URL}/customers`, {
    method: 'POST',
    headers: getHeaders(),
    body: JSON.stringify({ name: nome, cpfCnpj, email }),
  });
  const data = await response.json();
  if (!response.ok) throw new Error(data.errors?.[0]?.description || 'Erro ao criar cliente');
  return data.id;
}

export interface CriarCobrancaParams {
  customerId: string;
  valor: number;
  descricao: string;
  externalReference: string;
  carteiraOrganizadorId?: string;
}

export async function criarCobrancaPixComSplit({
  customerId,
  valor,
  descricao,
  externalReference,
  carteiraOrganizadorId
}: CriarCobrancaParams) {

  const splitRule = carteiraOrganizadorId ? [
    { walletId: carteiraOrganizadorId, percentualValue: 90 },
  ] : [];

  const payload = {
    customer: customerId,
    billingType: 'PIX',
    value: valor,
    dueDate: hojeBrasil(),
    description: descricao,
    externalReference,
    split: splitRule.length > 0 ? splitRule : undefined,
  };

  const response = await fetch(`${ASAAS_BASE_URL}/payments`, {
    method: 'POST',
    headers: getHeaders(),
    body: JSON.stringify(payload),
  });

  const data = await response.json();
  if (!response.ok) throw new Error(data.errors?.[0]?.description || 'Erro ao criar cobrança');

  const qrCode = await buscarPixQrCodeComRetry(data.id);

  return {
    asaasPaymentId: data.id,
    copyPaste: qrCode.payload,
    qrCodeBase64: `data:image/png;base64,${qrCode.encodedImage}`, // Asaas devolve sem o prefixo data:
  };
}

// ─── Busca o QR Code com retry — geração é assíncrona no Asaas ─────────────
async function buscarPixQrCodeComRetry(
  paymentId: string,
  tentativas = 4,
  esperaMs = 800,
): Promise<{ payload: string; encodedImage: string }> {
  let ultimoErro: string = 'Motivo desconhecido.';

  for (let i = 0; i < tentativas; i++) {
    const response = await fetch(`${ASAAS_BASE_URL}/payments/${paymentId}/pixQrCode`, {
      method: 'GET',
      headers: getHeaders(),
    });

    const data = await response.json().catch(() => null);

    if (response.ok && data?.encodedImage && data?.payload) {
      return { payload: data.payload, encodedImage: data.encodedImage };
    }

    // Guarda o motivo real retornado pelo Asaas pra diagnóstico
    ultimoErro = data?.errors?.[0]?.description || JSON.stringify(data) || `HTTP ${response.status}`;
    console.warn(`[asaas] Tentativa ${i + 1}/${tentativas} de buscar QR Code falhou:`, ultimoErro);

    if (i < tentativas - 1) {
      await new Promise((resolve) => setTimeout(resolve, esperaMs));
    }
  }

  throw new Error(`QR Code Pix indisponível: ${ultimoErro}`);
}