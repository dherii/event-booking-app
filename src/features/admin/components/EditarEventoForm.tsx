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
      <div className="bg-card border border-border rounded-2xl p-6 shadow-sm space-y-4">
        <h2 className="text-base font-semibold text-foreground border-b border-border-light pb-3">Informações gerais</h2>

        <div>
          <label className="block text-xs font-medium text-foreground mb-1.5">Nome do evento</label>
          <input
            className="input-base"
            value={nome}
            onChange={(e) => setNome(e.target.value)}
            required
          />
        </div>

        <div>
          <label className="block text-xs font-medium text-foreground mb-1.5">Descrição</label>
          <textarea
            className="input-base resize-none"
            rows={3}
            value={descricao}
            onChange={(e) => setDescricao(e.target.value)}
          />
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <div>
            <label className="block text-xs font-medium text-foreground mb-1.5">Data de início</label>
            <input
              type="date"
              className="input-base"
              value={dataInicio}
              onChange={(e) => setDataInicio(e.target.value)}
              required
            />
          </div>
          <div>
            <label className="block text-xs font-medium text-foreground mb-1.5">Data de encerramento</label>
            <input
              type="date"
              className="input-base"
              value={dataFim}
              min={dataInicio}
              onChange={(e) => setDataFim(e.target.value)}
              required
            />
          </div>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <div>
            <label className="block text-xs font-medium text-foreground mb-1.5">Local</label>
            <input
              className="input-base"
              value={local}
              onChange={(e) => setLocal(e.target.value)}
            />
          </div>
          <div>
            <label className="block text-xs font-medium text-foreground mb-1.5">Categoria</label>
            <input
              className="input-base"
              value={categoria}
              onChange={(e) => setCategoria(e.target.value)}
              placeholder="Festa, Show, Open Bar..."
            />
          </div>
        </div>
      </div>

      {/* Lotes */}
      <div className="bg-card border border-border rounded-2xl p-6 shadow-sm space-y-4">
        <h2 className="text-base font-semibold text-foreground border-b border-border-light pb-3">Lotes</h2>

        {lotes.map((lote) => (
          <div key={lote.id} className="border border-border rounded-xl p-4 bg-background-secondary/50 space-y-3">
            <input
              className="w-full text-sm font-semibold text-foreground bg-transparent border-b border-transparent hover:border-input-border focus:border-input-border-focus outline-none pb-1 transition-all"
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
                      ? 'bg-primary/10 border-primary text-primary font-semibold'
                      : 'bg-card border-border text-muted hover:border-input-border-hover hover:text-foreground'
                  }`}
                >
                  <Icon size={13} />
                  {label}
                </button>
              ))}
            </div>

            <div className={`grid grid-cols-1 sm:grid-cols-2 ${lote.tipo !== 'ingresso' ? 'lg:grid-cols-3' : 'lg:grid-cols-2'} gap-3`}>
              <div>
                <label className="block text-xs font-medium text-foreground mb-1">Preço (R$)</label>
                <input
                  type="number"
                  min={0}
                  step={0.01}
                  className="input-base py-2 text-sm"
                  value={lote.preco}
                  onChange={(e) => updateLote(lote.id, { preco: Number(e.target.value) })}
                />
              </div>
              <div>
                <label className="block text-xs font-medium text-foreground mb-1">Quantidade total</label>
                <input
                  type="number"
                  min={1}
                  className="input-base py-2 text-sm"
                  value={lote.quantidade_total}
                  onChange={(e) => updateLote(lote.id, { quantidade_total: Number(e.target.value) })}
                />
              </div>
              {lote.tipo !== 'ingresso' && (
                <div>
                  <label className="block text-xs font-medium text-foreground mb-1">Pessoas por mesa/camarote</label>
                  <input
                    type="number"
                    min={1}
                    className="input-base py-2 text-sm"
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
        <p role="alert" className="bg-error-bg border border-error-fg/20 text-error-fg text-sm px-4 py-3 rounded-xl">
          {error}
        </p>
      )}

      <div className="flex items-center justify-end gap-3 pt-2">
        {salvo && <span className="text-sm text-success-fg font-medium">Salvo com sucesso!</span>}
        <button
          type="submit"
          disabled={loading}
          className="flex items-center gap-2 px-5 py-2.5 rounded-xl text-sm font-semibold bg-primary hover:bg-primary-hover text-primary-fg transition-all shadow-sm disabled:opacity-60 cursor-pointer"
        >
          {loading ? <Loader2 size={16} className="animate-spin" /> : <Save size={16} />}
          {loading ? 'Salvando…' : 'Salvar alterações'}
        </button>
      </div>
    </form>
  );
}