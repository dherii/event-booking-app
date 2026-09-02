'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { CheckCircle, Loader2, Copy, Wallet, ChevronDown, ChevronUp } from 'lucide-react';
import type { SaldoEstabelecimento } from '../repasses-actions';
import { liquidarRepasse } from '../repasses-actions';

function fmt(v: number) {
  return v.toLocaleString('pt-BR', { style: 'currency', currency: 'BRL' });
}

export function RepassesDashboard({ saldos }: { saldos: SaldoEstabelecimento[] }) {
  const router = useRouter();
  const [loadingId, setLoadingId] = useState<string | null>(null);
  const [copiado, setCopiado] = useState<string | null>(null);
  const [expandedId, setExpandedId] = useState<string | null>(null);

  async function handleCopiarPix(chave: string) {
    await navigator.clipboard.writeText(chave);
    setCopiado(chave);
    setTimeout(() => setCopiado(null), 2000);
  }

  async function handleLiquidar(saldo: SaldoEstabelecimento) {
    if (!confirm(`Confirmar o repasse de ${fmt(saldo.valorLiquido)} para ${saldo.nome}?`)) return;

    setLoadingId(saldo.estabelecimentoId);
    try {
      await liquidarRepasse(saldo.estabelecimentoId, saldo.inscricoesIds, saldo.valorBruto);
      router.refresh();
    } catch (err) {
      alert(err instanceof Error ? err.message : 'Erro ao processar repasse.');
    } finally {
      setLoadingId(null);
    }
  }

  if (saldos.length === 0) {
    return (
      <div className="border-2 border-dashed border-border rounded-2xl py-16 text-center bg-card">
        <Wallet size={36} className="mx-auto text-muted-subtle mb-3" strokeWidth={1.3} />
        <p className="text-sm font-medium text-foreground">Tudo em dia!</p>
        <p className="text-xs text-muted mt-1">Não há nenhum valor pendente de repasse para os CAs no momento.</p>
      </div>
    );
  }

  return (
    <div className="flex flex-col gap-4">
      {saldos.map((saldo) => {
        const isExpanded = expandedId === saldo.estabelecimentoId;

        return (
          <div key={saldo.estabelecimentoId} className="bg-card border border-border rounded-2xl shadow-sm overflow-hidden transition-all duration-200 hover:border-input-border-hover">

            {/* Cabeçalho Compacto (Sempre visível) */}
            <div
              onClick={() => setExpandedId(isExpanded ? null : saldo.estabelecimentoId)}
              className="flex items-center justify-between p-5 cursor-pointer hover:bg-background-secondary transition-colors"
            >
              <div className="flex flex-col sm:flex-row sm:items-center gap-2 sm:gap-4 min-w-0">
                <h3 className="text-base font-bold text-foreground truncate">{saldo.nome}</h3>
                <span className="text-xs font-medium text-muted bg-background-tertiary px-2.5 py-1 rounded-md w-fit whitespace-nowrap">
                  {saldo.qtdIngressos} ingressos
                </span>
              </div>

              <div className="flex items-center gap-4 sm:gap-6 shrink-0 pl-4">
                <div className="text-right">
                  <p className="text-[10px] font-bold text-muted-subtle uppercase tracking-wider hidden sm:block">A Repassar</p>
                  <p className="text-base font-black text-success-fg">{fmt(saldo.valorLiquido)}</p>
                </div>
                <div className="text-muted bg-background-tertiary p-1.5 rounded-lg shrink-0">
                  {isExpanded ? <ChevronUp size={18} /> : <ChevronDown size={18} />}
                </div>
              </div>
            </div>

            {/* Conteúdo Expandido */}
            {isExpanded && (
              <div className="p-5 border-t border-border-light bg-background-secondary/60">
                <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">

                  {/* Resumo de Valores */}
                  <div className="space-y-4">
                    <p className="text-xs font-semibold text-muted-subtle uppercase tracking-wider mb-2">Detalhamento Financeiro</p>
                    <div className="flex justify-between text-sm border-b border-border-light pb-2">
                      <span className="text-muted">Arrecadação Bruta:</span>
                      <span className="font-medium text-foreground">{fmt(saldo.valorBruto)}</span>
                    </div>
                    <div className="flex justify-between text-sm border-b border-border-light pb-2">
                      <span className="text-muted">Taxa da Plataforma (5%):</span>
                      <span className="font-medium text-error-fg">-{fmt(saldo.taxaPlataforma)}</span>
                    </div>
                    <div className="flex justify-between text-base pt-1">
                      <span className="font-bold text-foreground">Líquido a Transferir:</span>
                      <span className="font-black text-success-fg">{fmt(saldo.valorLiquido)}</span>
                    </div>
                  </div>

                  {/* Dados Bancários e Ação */}
                  <div className="flex flex-col justify-end gap-4">
                    <div className="bg-card border border-border rounded-xl p-3.5 space-y-2.5 shadow-sm">
                      <p className="text-[10px] font-bold text-muted-subtle uppercase tracking-wider">Chave Pix Favorecida</p>
                      <div className="flex items-center gap-2">
                        <p className="flex-1 text-sm font-mono text-foreground truncate">{saldo.chavePix}</p>
                        <button
                          onClick={() => handleCopiarPix(saldo.chavePix)}
                          className={`shrink-0 flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-semibold transition-colors ${
                            copiado === saldo.chavePix ? 'bg-success-bg text-success-fg' : 'bg-background-secondary border border-border text-muted hover:bg-background-tertiary'
                          }`}
                        >
                          {copiado === saldo.chavePix ? <><CheckCircle size={14}/> Copiado</> : <><Copy size={14}/> Copiar</>}
                        </button>
                      </div>
                      <p className="text-xs text-muted flex flex-wrap gap-1">
                        <span className="font-medium text-foreground">{saldo.favorecido}</span>
                        <span>•</span>
                        <span>Banco: {saldo.banco}</span>
                      </p>
                    </div>

                    <button
                      onClick={() => handleLiquidar(saldo)}
                      disabled={loadingId === saldo.estabelecimentoId}
                      className="w-full flex items-center justify-center gap-2 py-3 rounded-xl bg-primary text-primary-fg text-sm font-semibold hover:bg-primary-hover transition-all disabled:opacity-50 cursor-pointer shadow-sm"
                    >
                      {loadingId === saldo.estabelecimentoId ? <Loader2 size={18} className="animate-spin" /> : <CheckCircle size={18} />}
                      {loadingId === saldo.estabelecimentoId ? 'Processando baixa no sistema…' : 'Liquidar e Marcar como Repassado'}
                    </button>
                  </div>
                </div>
              </div>
            )}
          </div>
        );
      })}
    </div>
  );
}