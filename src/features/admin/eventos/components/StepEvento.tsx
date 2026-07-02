// src/features/admin/eventos/components/StepEvento.tsx
'use client';

import { useRef } from 'react';
import { ImagePlus, X } from 'lucide-react';
import type { EventoFormData } from '../types';

interface StepEventoProps {
  data: EventoFormData;
  onChange: (data: Partial<EventoFormData>) => void;
}

const CATEGORIAS_OPCOES = [
  'Tecnologia', 'Design', 'Empreendedorismo', 'Saúde',
  'Direito', 'Engenharia', 'Educação', 'Cultura', 'Outro',
];

const MODALIDADES = [
  { value: 'presencial', label: 'Presencial' },
  { value: 'online',     label: 'Online'     },
  { value: 'hibrido',    label: 'Híbrido'    },
] as const;

export function StepEvento({ data, onChange }: StepEventoProps) {
  const fileRef = useRef<HTMLInputElement>(null);

  function handleBanner(e: React.ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0];
    if (!file) return;
    const preview = URL.createObjectURL(file);
    onChange({ banner: file, bannerPreview: preview });
  }

  function removeBanner() {
    if (data.bannerPreview) URL.revokeObjectURL(data.bannerPreview);
    onChange({ banner: null, bannerPreview: '' });
    if (fileRef.current) fileRef.current.value = '';
  }

  function toggleCategoria(cat: string) {
    const next = data.categorias.includes(cat)
      ? data.categorias.filter((c) => c !== cat)
      : [...data.categorias, cat];
    onChange({ categorias: next });
  }

  return (
    <div className="space-y-6">

      {/* Banner */}
      <div>
        <label className="block text-sm font-medium text-foreground mb-2">
          Banner do evento
        </label>

        {data.bannerPreview ? (
          <div className="relative rounded-xl overflow-hidden border border-border aspect-[3/1]">
            <img
              src={data.bannerPreview}
              alt="Banner preview"
              className="w-full h-full object-cover"
            />
            <button
              type="button"
              onClick={removeBanner}
              className="absolute top-2 right-2 p-1.5 rounded-full bg-black/60 text-white hover:bg-black/80 transition-colors"
              aria-label="Remover banner"
            >
              <X size={14} />
            </button>
          </div>
        ) : (
          <button
            type="button"
            onClick={() => fileRef.current?.click()}
            className="w-full border-2 border-dashed border-border hover:border-primary rounded-xl aspect-[3/1] flex flex-col items-center justify-center gap-2 text-muted hover:text-primary transition-colors group"
          >
            <ImagePlus size={28} strokeWidth={1.5} className="group-hover:scale-110 transition-transform" />
            <span className="text-sm font-medium">Clique para enviar o banner</span>
            <span className="text-xs">PNG ou JPG · Recomendado 1200×400px</span>
          </button>
        )}

        <input
          ref={fileRef}
          type="file"
          accept="image/png,image/jpeg,image/webp"
          className="hidden"
          onChange={handleBanner}
        />
      </div>

      {/* Nome */}
      <div>
        <label className="block text-sm font-medium text-foreground mb-1">
          Nome do evento <span className="text-error-fg">*</span>
        </label>
        <input
          type="text"
          className="input-base"
          placeholder="Ex: Semana de Tecnologia da Informação 2025"
          value={data.nome}
          onChange={(e) => onChange({ nome: e.target.value })}
          required
        />
      </div>

      {/* Descrição */}
      <div>
        <label className="block text-sm font-medium text-foreground mb-1">
          Descrição
        </label>
        <textarea
          className="input-base resize-none"
          placeholder="Descreva o evento, seus objetivos e público-alvo..."
          rows={3}
          value={data.descricao}
          onChange={(e) => onChange({ descricao: e.target.value })}
        />
      </div>

      {/* Datas */}
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
        <div>
          <label className="block text-sm font-medium text-foreground mb-1">
            Data de início <span className="text-error-fg">*</span>
          </label>
          <input
            type="date"
            className="input-base"
            value={data.dataInicio}
            onChange={(e) => onChange({ dataInicio: e.target.value })}
            required
          />
        </div>
        <div>
          <label className="block text-sm font-medium text-foreground mb-1">
            Data de encerramento <span className="text-error-fg">*</span>
          </label>
          <input
            type="date"
            className="input-base"
            value={data.dataFim}
            min={data.dataInicio}
            onChange={(e) => onChange({ dataFim: e.target.value })}
            required
          />
        </div>
      </div>

      {/* Modalidade */}
      <div>
        <label className="block text-sm font-medium text-foreground mb-2">
          Modalidade <span className="text-error-fg">*</span>
        </label>
        <div className="flex gap-3 flex-wrap">
          {MODALIDADES.map((m) => (
            <button
              key={m.value}
              type="button"
              onClick={() => onChange({ modalidade: m.value })}
              className={`
                px-4 py-2 rounded-lg text-sm font-medium border transition-all
                ${data.modalidade === m.value
                  ? 'bg-primary/10 border-primary text-primary'
                  : 'border-border text-muted hover:border-input-border-focus hover:text-foreground'
                }
              `}
            >
              {m.label}
            </button>
          ))}
        </div>
      </div>

      {/* Local e Capacidade */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        <div className="sm:col-span-2">
          <label className="block text-sm font-medium text-foreground mb-1">
            Local {data.modalidade === 'online' ? '(link da transmissão)' : ''}
          </label>
          <input
            type="text"
            className="input-base"
            placeholder={data.modalidade === 'online' ? 'https://meet.google.com/...' : 'Auditório principal, bloco B'}
            value={data.local}
            onChange={(e) => onChange({ local: e.target.value })}
          />
        </div>
        <div>
          <label className="block text-sm font-medium text-foreground mb-1">
            Capacidade total
          </label>
          <input
            type="number"
            min={1}
            className="input-base"
            placeholder="200"
            value={data.capacidadeTotal || ''}
            onChange={(e) => onChange({ capacidadeTotal: Number(e.target.value) })}
          />
        </div>
      </div>

      {/* Categorias */}
      <div>
        <label className="block text-sm font-medium text-foreground mb-2">
          Categorias
        </label>
        <div className="flex flex-wrap gap-2">
          {CATEGORIAS_OPCOES.map((cat) => {
            const selected = data.categorias.includes(cat);
            return (
              <button
                key={cat}
                type="button"
                onClick={() => toggleCategoria(cat)}
                className={`
                  px-3 py-1.5 rounded-full text-xs font-medium border transition-all
                  ${selected
                    ? 'bg-primary text-white border-primary'
                    : 'border-border text-muted hover:border-input-border-focus hover:text-foreground'
                  }
                `}
              >
                {cat}
              </button>
            );
          })}
        </div>
      </div>

    </div>
  );
}