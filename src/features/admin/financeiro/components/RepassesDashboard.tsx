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
      <div className="border-2 border-dashed border-slate-200 rounded-2xl py-16 text-center bg-white">
        <Wallet size={36} className="mx-auto text-slate-400 mb-3" strokeWidth={1.3} />
        <p className="text-sm font-medium text-slate-900">Tudo em dia!</p>
        <p className="text-xs text-slate-500 mt-1">Não há nenhum valor pendente de repasse para os CAs no momento.</p>
      </div>
    );
  }

  return (
    <div className="flex flex-col gap-4">
      {saldos.map((saldo) => {
        const isExpanded = expandedId === saldo.estabelecimentoId;

        return (
          <div key={saldo.estabelecimentoId} className="bg-white border border-slate-200 rounded-2xl shadow-sm overflow-hidden transition-all duration-200 hover:border-slate-300">
            
            {/* Cabeçalho Compacto (Sempre visível) */}
            <div
              onClick={() => setExpandedId(isExpanded ? null : saldo.estabelecimentoId)}
              className="flex items-center justify-between p-5 cursor-pointer hover:bg-slate-50 transition-colors"
            >
              <div className="flex flex-col sm:flex-row sm:items-center gap-2 sm:gap-4 min-w-0">
                <h3 className="text-base font-bold text-slate-900 truncate">{saldo.nome}</h3>
                <span className="text-xs font-medium text-slate-600 bg-slate-100 px-2.5 py-1 rounded-md w-fit whitespace-nowrap">
                  {saldo.qtdIngressos} ingressos
                </span>
              </div>

              <div className="flex items-center gap-4 sm:gap-6 shrink-0 pl-4">
                <div className="text-right">
                  <p className="text-[10px] font-bold text-slate-400 uppercase tracking-wider hidden sm:block">A Repassar</p>
                  <p className="text-base font-black text-emerald-600">{fmt(saldo.valorLiquido)}</p>
                </div>
                <div className="text-slate-400 bg-slate-100 p-1.5 rounded-lg shrink-0">
                  {isExpanded ? <ChevronUp size={18} /> : <ChevronDown size={18} />}
                </div>
              </div>
            </div>

            {/* Conteúdo Expandido */}
            {isExpanded && (
              <div className="p-5 border-t border-slate-100 bg-slate-50/40">
                <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
                  
                  {/* Resumo de Valores */}
                  <div className="space-y-4">
                    <p className="text-xs font-semibold text-slate-400 uppercase tracking-wider mb-2">Detalhamento Financeiro</p>
                    <div className="flex justify-between text-sm border-b border-slate-200/60 pb-2">
                      <span className="text-slate-500">Arrecadação Bruta:</span>
                      <span className="font-medium text-slate-900">{fmt(saldo.valorBruto)}</span>
                    </div>
                    <div className="flex justify-between text-sm border-b border-slate-200/60 pb-2">
                      <span className="text-slate-500">Taxa da Plataforma (5%):</span>
                      <span className="font-medium text-rose-600">-{fmt(saldo.taxaPlataforma)}</span>
                    </div>
                    <div className="flex justify-between text-base pt-1">
                      <span className="font-bold text-slate-900">Líquido a Transferir:</span>
                      <span className="font-black text-emerald-600">{fmt(saldo.valorLiquido)}</span>
                    </div>
                  </div>

                  {/* Dados Bancários e Ação */}
                  <div className="flex flex-col justify-end gap-4">
                    <div className="bg-white border border-slate-200 rounded-xl p-3.5 space-y-2.5 shadow-sm">
                      <p className="text-[10px] font-bold text-slate-400 uppercase tracking-wider">Chave Pix Favorecida</p>
                      <div className="flex items-center gap-2">
                        <p className="flex-1 text-sm font-mono text-slate-700 truncate">{saldo.chavePix}</p>
                        <button
                          onClick={() => handleCopiarPix(saldo.chavePix)}
                          className={`shrink-0 flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-semibold transition-colors ${
                            copiado === saldo.chavePix ? 'bg-emerald-100 text-emerald-700' : 'bg-slate-50 border border-slate-200 text-slate-600 hover:bg-slate-100'
                          }`}
                        >
                          {copiado === saldo.chavePix ? <><CheckCircle size={14}/> Copiado</> : <><Copy size={14}/> Copiar</>}
                        </button>
                      </div>
                      <p className="text-xs text-slate-500 flex flex-wrap gap-1">
                        <span className="font-medium text-slate-700">{saldo.favorecido}</span>
                        <span>•</span>
                        <span>Banco: {saldo.banco}</span>
                      </p>
                    </div>

                    <button
                      onClick={() => handleLiquidar(saldo)}
                      disabled={loadingId === saldo.estabelecimentoId}
                      className="w-full flex items-center justify-center gap-2 py-3 rounded-xl bg-slate-900 text-white text-sm font-semibold hover:bg-slate-800 transition-all disabled:opacity-50 cursor-pointer shadow-sm"
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