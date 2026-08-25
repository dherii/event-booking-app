// src/lib/asaas/client.ts

const ASAAS_BASE_URL = process.env.ASAAS_API_URL || 'https://sandbox.asaas.com/api/v3';
const ASAAS_API_KEY = process.env.ASAAS_API_KEY;

function getHeaders() {
  if (!ASAAS_API_KEY) throw new Error('ASAAS_API_KEY não configurada');
  return {
    'access_token': ASAAS_API_KEY,
    'Content-Type': 'application/json',
  };
}

export async function criarClienteAsaas(nome: string, cpfCnpj: string, email: string) {
  const response = await fetch(`${ASAAS_BASE_URL}/customers`, {
    method: 'POST',
    headers: getHeaders(),
    body: JSON.stringify({ name: nome, cpfCnpj, email }),
  });
  const data = await response.json();
  if (!response.ok) throw new Error(data.errors?.[0]?.description || 'Erro ao criar cliente');
  return data.id; // Retorna o customerId (ex: cus_000005)
}

export interface CriarCobrancaParams {
  customerId: string;
  valor: number;
  descricao: string;
  externalReference: string; // Nosso inscricao.id
  carteiraOrganizadorId?: string; // ID da subconta do produtor para o split
}

export async function criarCobrancaPixComSplit({
  customerId,
  valor,
  descricao,
  externalReference,
  carteiraOrganizadorId
}: CriarCobrancaParams) {
  
  // Exemplo de Split: 90% produtor, 10% plataforma
  const splitRule = carteiraOrganizadorId ? [
    { walletId: carteiraOrganizadorId, percentualValue: 90 },
    // O Asaas entende que o restante (10%) fica na conta Master (sua plataforma)
  ] : [];

  const payload = {
    customer: customerId,
    billingType: 'PIX',
    value: valor,
    dueDate: new Date().toISOString().split('T')[0], // Vence hoje
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

  // Para o PIX, precisamos fazer uma chamada extra para pegar o QR Code
  const qrCodeResponse = await fetch(`${ASAAS_BASE_URL}/payments/${data.id}/pixQrCode`, {
    method: 'GET',
    headers: getHeaders(),
  });
  
  const qrCodeData = await qrCodeResponse.json();

  return {
    asaasPaymentId: data.id,
    copyPaste: qrCodeData.payload,
    qrCodeBase64: qrCodeData.encodedImage,
  };
}