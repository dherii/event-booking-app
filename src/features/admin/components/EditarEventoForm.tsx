// src/features/admin/components/EditarEventoForm.tsx
'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { Loader2, Save, Ticket, UtensilsCrossed, Crown } from 'lucide-react';
import { atualizarEvento } from '../eventos/actions';
import type { LoteTipo } from '../eventos/types';

interface LoteEditavel {
  id: string;
  nome: string;
  preco: number;
  quantidade_total: number;
  tipo: LoteTipo;
  capacidade_pessoas: number | null;
}

interface EventoEditavel {
  id: string;
  nome: string;
  descricao: string | null;
  data_inicio: string;
  data_fim: string;
  local: string | null;
  modalidade: string | null;
  categoria: string | null;
  classificacao_etaria: number | null;
  lotes: LoteEditavel[];
}

const TIPOS_LOTE: { value: LoteTipo; label: string; icon: React.ElementType }[] = [
  { value: 'ingresso', label: 'Ingresso', icon: Ticket          },
  { value: 'mesa',     label: 'Mesa',     icon: UtensilsCrossed },
  { value: 'camarote', label: 'Camarote', icon: Crown           },
];

export function EditarEventoForm({ evento }: { evento: EventoEditavel }) {
  const router = useRouter();
  const [nome, setNome] = useState(evento.nome);
  const [descricao, setDescricao] = useState(evento.descricao ?? '');
  const [dataInicio, setDataInicio] = useState(evento.data_inicio?.slice(0, 10) ?? '');
  const [dataFim, setDataFim] = useState(evento.data_fim?.slice(0, 10) ?? '');
  const [local, setLocal] = useState(evento.local ?? '');
  const [categoria, setCategoria] = useState(evento.categoria ?? '');
  const [lotes, setLotes] = useState<LoteEditavel[]>(evento.lotes);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [salvo, setSalvo] = useState(false);

  function updateLote(id: string, patch: Partial<LoteEditavel>) {
    setLotes((prev) => prev.map((l) => (l.id === id ? { ...l, ...patch } : l)));
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setLoading(true);
    setError(null);
    setSalvo(false);

    try {
      await atualizarEvento(evento.id, {
        nome,
        descricao,
        dataInicio,
        dataFim,
        local,
        modalidade: 'presencial',
        categoria,
        classificacaoEtaria: evento.classificacao_etaria ?? 18,
        lotes: lotes.map((l) => ({
          id: l.id,
          nome: l.nome,
          preco: l.preco,
          quantidade: l.quantidade_total,
          tipo: l.tipo,
          capacidadePessoas: l.capacidade_pessoas,
        })),
      });

      setSalvo(true);
      router.refresh();
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Erro ao salvar o evento.');
    } finally {
      setLoading(false);
    }
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-6">

      {/* Dados gerais */}
      <div className="bg-white border border-slate-200/80 rounded-2xl p-6 shadow-sm space-y-4">
        <h2 className="text-base font-semibold text-slate-900 border-b border-slate-100 pb-3">Informações gerais</h2>

        <div>
          <label className="block text-xs font-medium text-slate-700 mb-1.5">Nome do evento</label>
          <input
            className="w-full bg-slate-50 border border-slate-200 rounded-xl px-3.5 py-2.5 text-sm text-slate-900 placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 transition-all"
            value={nome}
            onChange={(e) => setNome(e.target.value)}
            required
          />
        </div>

        <div>
          <label className="block text-xs font-medium text-slate-700 mb-1.5">Descrição</label>
          <textarea
            className="w-full bg-slate-50 border border-slate-200 rounded-xl px-3.5 py-2.5 text-sm text-slate-900 placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 transition-all resize-none"
            rows={3}
            value={descricao}
            onChange={(e) => setDescricao(e.target.value)}
          />
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <div>
            <label className="block text-xs font-medium text-slate-700 mb-1.5">Data de início</label>
            <input
              type="date"
              className="w-full bg-slate-50 border border-slate-200 rounded-xl px-3.5 py-2.5 text-sm text-slate-900 focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 transition-all"
              value={dataInicio}
              onChange={(e) => setDataInicio(e.target.value)}
              required
            />
          </div>
          <div>
            <label className="block text-xs font-medium text-slate-700 mb-1.5">Data de encerramento</label>
            <input
              type="date"
              className="w-full bg-slate-50 border border-slate-200 rounded-xl px-3.5 py-2.5 text-sm text-slate-900 focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 transition-all"
              value={dataFim}
              min={dataInicio}
              onChange={(e) => setDataFim(e.target.value)}
              required
            />
          </div>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <div>
            <label className="block text-xs font-medium text-slate-700 mb-1.5">Local</label>
            <input
              className="w-full bg-slate-50 border border-slate-200 rounded-xl px-3.5 py-2.5 text-sm text-slate-900 placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 transition-all"
              value={local}
              onChange={(e) => setLocal(e.target.value)}
            />
          </div>
          <div>
            <label className="block text-xs font-medium text-slate-700 mb-1.5">Categoria</label>
            <input
              className="w-full bg-slate-50 border border-slate-200 rounded-xl px-3.5 py-2.5 text-sm text-slate-900 placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 transition-all"
              value={categoria}
              onChange={(e) => setCategoria(e.target.value)}
              placeholder="Festa, Show, Open Bar..."
            />
          </div>
        </div>
      </div>

      {/* Lotes */}
      <div className="bg-white border border-slate-200/80 rounded-2xl p-6 shadow-sm space-y-4">
        <h2 className="text-base font-semibold text-slate-900 border-b border-slate-100 pb-3">Lotes</h2>

        {lotes.map((lote) => (
          <div key={lote.id} className="border border-slate-200 rounded-xl p-4 bg-slate-50/50 space-y-3">
            <input
              className="w-full text-sm font-semibold text-slate-900 bg-transparent border-b border-transparent hover:border-slate-300 focus:border-blue-500 outline-none pb-1 transition-all"
              value={lote.nome}
              onChange={(e) => updateLote(lote.id, { nome: e.target.value })}
            />

            <div className="flex flex-wrap gap-2">
              {TIPOS_LOTE.map(({ value, label, icon: Icon }) => (
                <button
                  key={value}
                  type="button"
                  onClick={() => updateLote(lote.id, {
                    tipo: value,
                    capacidade_pessoas: value === 'ingresso' ? null : (lote.capacidade_pessoas ?? 4),
                  })}
                  className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-medium border transition-all cursor-pointer ${
                    lote.tipo === value
                      ? 'bg-blue-50 border-blue-600 text-blue-600 font-semibold shadow-xs'
                      : 'bg-white border-slate-200 text-slate-600 hover:border-slate-300 hover:text-slate-900'
                  }`}
                >
                  <Icon size={13} />
                  {label}
                </button>
              ))}
            </div>

            <div className={`grid grid-cols-1 sm:grid-cols-2 ${lote.tipo !== 'ingresso' ? 'lg:grid-cols-3' : 'lg:grid-cols-2'} gap-3`}>
              <div>
                <label className="block text-xs font-medium text-slate-700 mb-1">Preço (R$)</label>
                <input
                  type="number"
                  min={0}
                  step={0.01}
                  className="w-full bg-white border border-slate-200 rounded-lg px-3 py-2 text-sm text-slate-900 focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 transition-all"
                  value={lote.preco}
                  onChange={(e) => updateLote(lote.id, { preco: Number(e.target.value) })}
                />
              </div>
              <div>
                <label className="block text-xs font-medium text-slate-700 mb-1">Quantidade total</label>
                <input
                  type="number"
                  min={1}
                  className="w-full bg-white border border-slate-200 rounded-lg px-3 py-2 text-sm text-slate-900 focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 transition-all"
                  value={lote.quantidade_total}
                  onChange={(e) => updateLote(lote.id, { quantidade_total: Number(e.target.value) })}
                />
              </div>
              {lote.tipo !== 'ingresso' && (
                <div>
                  <label className="block text-xs font-medium text-slate-700 mb-1">Pessoas por mesa/camarote</label>
                  <input
                    type="number"
                    min={1}
                    className="w-full bg-white border border-slate-200 rounded-lg px-3 py-2 text-sm text-slate-900 focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 transition-all"
                    value={lote.capacidade_pessoas ?? ''}
                    onChange={(e) => updateLote(lote.id, { capacidade_pessoas: Number(e.target.value) })}
                  />
                </div>
              )}
            </div>
          </div>
        ))}
      </div>

      {error && (
        <p role="alert" className="bg-red-50 border border-red-200 text-red-600 text-sm px-4 py-3 rounded-xl">
          {error}
        </p>
      )}

      <div className="flex items-center justify-end gap-3 pt-2">
        {salvo && <span className="text-sm text-emerald-600 font-medium">Salvo com sucesso!</span>}
        <button
          type="submit"
          disabled={loading}
          className="flex items-center gap-2 px-5 py-2.5 rounded-xl text-sm font-semibold bg-blue-600 hover:bg-blue-700 text-white transition-all shadow-sm disabled:opacity-60 cursor-pointer"
        >
          {loading ? <Loader2 size={16} className="animate-spin" /> : <Save size={16} />}
          {loading ? 'Salvando…' : 'Salvar alterações'}
        </button>
      </div>
    </form>
  );
}