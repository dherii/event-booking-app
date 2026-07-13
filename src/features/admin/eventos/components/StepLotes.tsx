// src/features/admin/eventos/components/StepLotes.tsx
'use client';

import { Plus, Trash2, Eye, EyeOff, Ticket, UtensilsCrossed, Crown } from 'lucide-react';
import type { Lote, LoteTipo, LotesFormData } from '../types';

interface StepLotesProps {
  data: LotesFormData;
  dataInicioEvento: string;
  dataFimEvento: string;
  onChange: (data: Partial<LotesFormData>) => void;
}

const TIPOS_LOTE: { value: LoteTipo; label: string; icon: React.ElementType }[] = [
  { value: 'ingresso', label: 'Ingresso',  icon: Ticket           },
  { value: 'mesa',     label: 'Mesa',      icon: UtensilsCrossed  },
  { value: 'camarote', label: 'Camarote',  icon: Crown            },
];

function novoLote(index: number): Lote {
  return {
    id:                crypto.randomUUID(),
    nome:              `Lote ${index + 1}`,
    quantidade:        50,
    preco:             0,
    dataInicio:        '',
    dataFim:           '',
    visivel:           true,
    tipo:              'ingresso',
    capacidadePessoas: null,
  };
}

function formatCurrency(value: number) {
  if (value === 0) return 'Gratuito';
  return value.toLocaleString('pt-BR', { style: 'currency', currency: 'BRL' });
}

function LoteCard({
  lote,
  index,
  onUpdate,
  onRemove,
  dataMin,
  dataMax,
  totalLotes,
}: {
  lote: Lote;
  index: number;
  onUpdate: (patch: Partial<Lote>) => void;
  onRemove: () => void;
  dataMin: string;
  dataMax: string;
  totalLotes: number;
}) {
  const isGratuito = lote.preco === 0;
  const precisaCapacidade = lote.tipo !== 'ingresso';

  return (
    <div className={`bg-card border rounded-xl overflow-hidden transition-all ${lote.visivel ? 'border-border' : 'border-dashed border-border opacity-60'}`}>

      {/* Header do lote */}
      <div className="flex items-center gap-3 px-4 py-3 border-b border-border">
        <div className="w-7 h-7 rounded-full bg-primary/10 text-primary text-xs font-bold flex items-center justify-center shrink-0">
          {index + 1}
        </div>

        <input
          type="text"
          className="flex-1 text-sm font-medium text-foreground bg-transparent outline-none placeholder:text-muted min-w-0"
          placeholder="Nome do lote"
          value={lote.nome}
          onChange={(e) => onUpdate({ nome: e.target.value })}
        />

        <span className={`hidden sm:inline text-xs px-2.5 py-0.5 rounded-full font-medium shrink-0 ${isGratuito ? 'bg-success-bg text-success-fg' : 'bg-primary/10 text-primary'}`}>
          {formatCurrency(lote.preco)}
        </span>

        <button
          type="button"
          onClick={() => onUpdate({ visivel: !lote.visivel })}
          className={`p-1.5 rounded-lg transition-colors shrink-0 ${lote.visivel ? 'text-muted hover:text-foreground hover:bg-border' : 'text-primary bg-primary/10'}`}
          aria-label={lote.visivel ? 'Ocultar lote' : 'Exibir lote'}
          title={lote.visivel ? 'Lote visível na página de vendas' : 'Lote oculto'}
        >
          {lote.visivel ? <Eye size={15} /> : <EyeOff size={15} />}
        </button>

        <button
          type="button"
          onClick={onRemove}
          disabled={totalLotes === 1}
          className="p-1.5 rounded-lg text-muted hover:text-error-fg hover:bg-error-bg transition-colors shrink-0 disabled:opacity-30 disabled:cursor-not-allowed"
          aria-label="Remover lote"
        >
          <Trash2 size={15} />
        </button>
      </div>

      {/* Seletor de tipo — ingresso / mesa / camarote */}
      <div className="px-4 pt-3 flex gap-2">
        {TIPOS_LOTE.map(({ value, label, icon: Icon }) => (
          <button
            key={value}
            type="button"
            onClick={() => onUpdate({
              tipo: value,
              capacidadePessoas: value === 'ingresso' ? null : (lote.capacidadePessoas ?? 4),
            })}
            className={`
              flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-medium border transition-all
              ${lote.tipo === value
                ? 'bg-primary/10 border-primary text-primary'
                : 'border-border text-muted hover:border-input-border-focus hover:text-foreground'
              }
            `}
          >
            <Icon size={13} />
            {label}
          </button>
        ))}
      </div>

      {/* Corpo do lote */}
      <div className={`px-4 py-4 grid grid-cols-1 sm:grid-cols-2 gap-4 ${precisaCapacidade ? 'lg:grid-cols-5' : 'lg:grid-cols-4'}`}>

        {/* Preço */}
        <div>
          <label className="block text-xs font-medium text-foreground mb-1">
            Preço (R$)
          </label>
          <div className="relative">
            <span className="absolute left-3 top-1/2 -translate-y-1/2 text-sm text-muted pointer-events-none">
              R$
            </span>
            <input
              type="number"
              min={0}
              step={0.01}
              className="input-base pl-9"
              placeholder="0,00"
              value={lote.preco || ''}
              onChange={(e) => onUpdate({ preco: Number(e.target.value) })}
            />
          </div>
          {isGratuito && (
            <p className="text-[11px] text-success-fg mt-1">✓ Ingresso gratuito</p>
          )}
        </div>

        {/* Quantidade */}
        <div>
          <label className="block text-xs font-medium text-foreground mb-1">
            {precisaCapacidade ? 'Qtd. de mesas/camarotes' : 'Vagas disponíveis'}
          </label>
          <input
            type="number"
            min={1}
            className="input-base"
            placeholder="50"
            value={lote.quantidade || ''}
            onChange={(e) => onUpdate({ quantidade: Number(e.target.value) })}
          />
        </div>

        {/* Capacidade de pessoas — só pra mesa/camarote */}
        {precisaCapacidade && (
          <div>
            <label className="block text-xs font-medium text-foreground mb-1">
              Pessoas por mesa
            </label>
            <input
              type="number"
              min={1}
              className="input-base"
              placeholder="4"
              value={lote.capacidadePessoas ?? ''}
              onChange={(e) => onUpdate({ capacidadePessoas: Number(e.target.value) })}
            />
          </div>
        )}

        {/* Data de início das vendas */}
        <div>
          <label className="block text-xs font-medium text-foreground mb-1">
            Venda a partir de
          </label>
          <input
            type="date"
            className="input-base"
            value={lote.dataInicio}
            min={new Date().toISOString().split('T')[0]}
            max={dataMax}
            onChange={(e) => onUpdate({ dataInicio: e.target.value })}
          />
        </div>

        {/* Data de encerramento das vendas */}
        <div>
          <label className="block text-xs font-medium text-foreground mb-1">
            Encerra em
          </label>
          <input
            type="date"
            className="input-base"
            value={lote.dataFim}
            min={lote.dataInicio || new Date().toISOString().split('T')[0]}
            max={dataMax}
            onChange={(e) => onUpdate({ dataFim: e.target.value })}
          />
        </div>
      </div>
    </div>
  );
}

export function StepLotes({
  data,
  dataInicioEvento,
  dataFimEvento,
  onChange,
}: StepLotesProps) {
  function addLote() {
    onChange({ lotes: [...data.lotes, novoLote(data.lotes.length)] });
  }

  function removeLote(id: string) {
    onChange({ lotes: data.lotes.filter((l) => l.id !== id) });
  }

  function updateLote(id: string, patch: Partial<Lote>) {
    onChange({
      lotes: data.lotes.map((l) => (l.id === id ? { ...l, ...patch } : l)),
    });
  }

  const totalVagas = data.lotes.reduce((sum, l) => sum + (l.quantidade || 0), 0);
  const receitaPotencial = data.lotes.reduce((sum, l) => sum + (l.preco * l.quantidade), 0);

  return (
    <div className="space-y-4">

      <p className="text-sm text-muted">
        Defina os lotes de ingressos, mesas ou camarotes. Lotes com preço zero geram ingressos gratuitos.
        A ordem dos lotes é a ordem exibida na página de vendas.
      </p>

      {/* Resumo */}
      <div className="grid grid-cols-2 gap-3">
        <div className="bg-card border border-border rounded-lg px-4 py-3">
          <p className="text-xs text-muted">Total de vagas/mesas</p>
          <p className="text-lg font-bold text-foreground mt-0.5">{totalVagas}</p>
        </div>
        <div className="bg-card border border-border rounded-lg px-4 py-3">
          <p className="text-xs text-muted">Receita potencial</p>
          <p className="text-lg font-bold text-foreground mt-0.5">
            {receitaPotencial > 0
              ? receitaPotencial.toLocaleString('pt-BR', { style: 'currency', currency: 'BRL' })
              : '—'
            }
          </p>
        </div>
      </div>

      {/* Lotes */}
      <div className="space-y-3">
        {data.lotes.map((lote, index) => (
          <LoteCard
            key={lote.id}
            lote={lote}
            index={index}
            onUpdate={(patch) => updateLote(lote.id, patch)}
            onRemove={() => removeLote(lote.id)}
            dataMin={dataInicioEvento}
            dataMax={dataFimEvento}
            totalLotes={data.lotes.length}
          />
        ))}
      </div>

      {/* Adicionar lote */}
      <button
        type="button"
        onClick={addLote}
        className="w-full flex items-center justify-center gap-2 py-2.5 rounded-xl border border-dashed border-border text-sm text-muted hover:text-primary hover:border-primary transition-colors"
      >
        <Plus size={16} />
        Adicionar lote
      </button>

      {/* Aviso de lotes ocultos */}
      {data.lotes.some((l) => !l.visivel) && (
        <p className="text-xs text-muted text-center">
          Lotes ocultos não aparecem na página de vendas mas ainda podem ser acessados via link direto.
        </p>
      )}
    </div>
  );
}
