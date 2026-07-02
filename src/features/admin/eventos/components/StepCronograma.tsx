// src/features/admin/eventos/components/StepCronograma.tsx
'use client';

import { Plus, Trash2, GripVertical, ChevronDown, ChevronUp } from 'lucide-react';
import { useState } from 'react';
import type { Atividade, CronogramaFormData } from '../types';

interface StepCronogramaProps {
  data: CronogramaFormData;
  dataInicioEvento: string;
  dataFimEvento: string;
  onChange: (data: Partial<CronogramaFormData>) => void;
}

const TIPOS_ATIVIDADE: { value: Atividade['tipo']; label: string }[] = [
  { value: 'palestra',     label: 'Palestra'      },
  { value: 'oficina',      label: 'Oficina'        },
  { value: 'mesa-redonda', label: 'Mesa-redonda'   },
  { value: 'outro',        label: 'Outro'          },
];

function novaAtividade(): Atividade {
  return {
    id:            crypto.randomUUID(),
    titulo:        '',
    descricao:     '',
    data:          '',
    horarioInicio: '',
    horarioFim:    '',
    local:         '',
    tipo:          'palestra',
  };
}

function AtividadeCard({
  atividade,
  index,
  expanded,
  onToggle,
  onUpdate,
  onRemove,
  dataMin,
  dataMax,
}: {
  atividade: Atividade;
  index: number;
  expanded: boolean;
  onToggle: () => void;
  onUpdate: (patch: Partial<Atividade>) => void;
  onRemove: () => void;
  dataMin: string;
  dataMax: string;
}) {
  return (
    <div className="bg-card border border-border rounded-xl overflow-hidden transition-all">

      {/* Header do card */}
      <div className="flex items-center gap-3 px-4 py-3">
        <GripVertical size={16} className="text-muted shrink-0 cursor-grab" />

        <div className="flex-1 min-w-0">
          <p className="text-sm font-medium text-foreground truncate">
            {atividade.titulo || `Atividade ${index + 1}`}
          </p>
          {!expanded && atividade.data && (
            <p className="text-xs text-muted">
              {atividade.data} · {atividade.horarioInicio || '--:--'} – {atividade.horarioFim || '--:--'}
            </p>
          )}
        </div>

        {/* Badge tipo */}
        <span className="hidden sm:inline text-[11px] px-2 py-0.5 rounded-full bg-primary/10 text-primary font-medium shrink-0">
          {TIPOS_ATIVIDADE.find((t) => t.value === atividade.tipo)?.label}
        </span>

        <button
          type="button"
          onClick={onRemove}
          className="p-1.5 rounded-lg text-muted hover:text-error-fg hover:bg-error-bg transition-colors shrink-0"
          aria-label="Remover atividade"
        >
          <Trash2 size={15} />
        </button>

        <button
          type="button"
          onClick={onToggle}
          className="p-1.5 rounded-lg text-muted hover:text-foreground hover:bg-border transition-colors shrink-0"
          aria-label={expanded ? 'Recolher' : 'Expandir'}
        >
          {expanded ? <ChevronUp size={15} /> : <ChevronDown size={15} />}
        </button>
      </div>

      {/* Formulário expansível */}
      {expanded && (
        <div className="px-4 pb-4 pt-1 border-t border-border space-y-4">

          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
            {/* Título */}
            <div className="sm:col-span-2">
              <label className="block text-xs font-medium text-foreground mb-1">
                Título <span className="text-error-fg">*</span>
              </label>
              <input
                type="text"
                className="input-base"
                placeholder="Ex: Palestra de abertura"
                value={atividade.titulo}
                onChange={(e) => onUpdate({ titulo: e.target.value })}
                required
              />
            </div>

            {/* Tipo */}
            <div>
              <label className="block text-xs font-medium text-foreground mb-1">Tipo</label>
              <select
                className="input-base"
                value={atividade.tipo}
                onChange={(e) => onUpdate({ tipo: e.target.value as Atividade['tipo'] })}
              >
                {TIPOS_ATIVIDADE.map((t) => (
                  <option key={t.value} value={t.value}>{t.label}</option>
                ))}
              </select>
            </div>
          </div>

          {/* Data e horários */}
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
            <div>
              <label className="block text-xs font-medium text-foreground mb-1">
                Data <span className="text-error-fg">*</span>
              </label>
              <input
                type="date"
                className="input-base"
                value={atividade.data}
                min={dataMin}
                max={dataMax}
                onChange={(e) => onUpdate({ data: e.target.value })}
                required
              />
            </div>
            <div>
              <label className="block text-xs font-medium text-foreground mb-1">Início</label>
              <input
                type="time"
                className="input-base"
                value={atividade.horarioInicio}
                onChange={(e) => onUpdate({ horarioInicio: e.target.value })}
              />
            </div>
            <div>
              <label className="block text-xs font-medium text-foreground mb-1">Fim</label>
              <input
                type="time"
                className="input-base"
                value={atividade.horarioFim}
                min={atividade.horarioInicio}
                onChange={(e) => onUpdate({ horarioFim: e.target.value })}
              />
            </div>
          </div>

          {/* Local */}
          <div>
            <label className="block text-xs font-medium text-foreground mb-1">Local / sala</label>
            <input
              type="text"
              className="input-base"
              placeholder="Ex: Auditório A, Sala 201..."
              value={atividade.local}
              onChange={(e) => onUpdate({ local: e.target.value })}
            />
          </div>

          {/* Descrição */}
          <div>
            <label className="block text-xs font-medium text-foreground mb-1">Descrição</label>
            <textarea
              className="input-base resize-none"
              placeholder="Informações adicionais sobre a atividade..."
              rows={2}
              value={atividade.descricao}
              onChange={(e) => onUpdate({ descricao: e.target.value })}
            />
          </div>
        </div>
      )}
    </div>
  );
}

export function StepCronograma({
  data,
  dataInicioEvento,
  dataFimEvento,
  onChange,
}: StepCronogramaProps) {
  const [expandedId, setExpandedId] = useState<string | null>(
    data.atividades[0]?.id ?? null,
  );

  function addAtividade() {
    const nova = novaAtividade();
    onChange({ atividades: [...data.atividades, nova] });
    setExpandedId(nova.id);
  }

  function removeAtividade(id: string) {
    onChange({ atividades: data.atividades.filter((a) => a.id !== id) });
    if (expandedId === id) setExpandedId(null);
  }

  function updateAtividade(id: string, patch: Partial<Atividade>) {
    onChange({
      atividades: data.atividades.map((a) => (a.id === id ? { ...a, ...patch } : a)),
    });
  }

  return (
    <div className="space-y-4">

      {/* Intro */}
      <p className="text-sm text-muted">
        Adicione as atividades que compõem o evento. Você pode incluir palestras, oficinas e mesas-redondas em qualquer dia do período selecionado.
      </p>

      {/* Lista de atividades */}
      {data.atividades.length === 0 ? (
        <div className="border-2 border-dashed border-border rounded-xl py-10 text-center">
          <p className="text-sm text-muted">Nenhuma atividade adicionada ainda.</p>
          <p className="text-xs text-muted mt-1">Clique em Adicionar atividade para começar.</p>
        </div>
      ) : (
        <div className="space-y-3">
          {data.atividades.map((atividade, index) => (
            <AtividadeCard
              key={atividade.id}
              atividade={atividade}
              index={index}
              expanded={expandedId === atividade.id}
              onToggle={() => setExpandedId(expandedId === atividade.id ? null : atividade.id)}
              onUpdate={(patch) => updateAtividade(atividade.id, patch)}
              onRemove={() => removeAtividade(atividade.id)}
              dataMin={dataInicioEvento}
              dataMax={dataFimEvento}
            />
          ))}
        </div>
      )}

      {/* Botão adicionar */}
      <button
        type="button"
        onClick={addAtividade}
        className="w-full flex items-center justify-center gap-2 py-2.5 rounded-xl border border-dashed border-border text-sm text-muted hover:text-primary hover:border-primary transition-colors"
      >
        <Plus size={16} />
        Adicionar atividade
      </button>
    </div>
  );
}