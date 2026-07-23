// src/features/admin/eventos/components/StepAtracoes.tsx
'use client';

import { Plus, Trash2, Mic2 } from 'lucide-react';
import type { Atracao, AtracoesFormData } from '../types';

interface StepAtracoesProps {
  data: AtracoesFormData;
  onChange: (data: Partial<AtracoesFormData>) => void;
}

function novaAtracao(): Atracao {
  return {
    id: crypto.randomUUID(),
    nomeArtista: '',
    horario: '',
    fotoUrl: '',
  };
}

export function StepAtracoes({ data, onChange }: StepAtracoesProps) {
  function addAtracao() {
    onChange({ atracoes: [...data.atracoes, novaAtracao()] });
  }

  function removeAtracao(id: string) {
    onChange({ atracoes: data.atracoes.filter((a) => a.id !== id) });
  }

  function updateAtracao(id: string, patch: Partial<Atracao>) {
    onChange({
      atracoes: data.atracoes.map((a) => (a.id === id ? { ...a, ...patch } : a)),
    });
  }

  return (
    <div className="space-y-4">

      <p className="text-sm text-muted">
        Cadastre as atrações (DJs, bandas, artistas) que vão se apresentar no evento.
        Essa etapa é opcional — se o evento não tiver line-up definido, pode pular.
      </p>

      {data.atracoes.length === 0 ? (
        <div className="border-2 border-dashed border-border rounded-xl py-10 text-center">
          <Mic2 size={28} className="mx-auto text-muted mb-2" strokeWidth={1.3} />
          <p className="text-sm text-muted">Nenhuma atração adicionada ainda.</p>
          <p className="text-xs text-muted mt-1">Clique em Adicionar atração para começar.</p>
        </div>
      ) : (
        <div className="space-y-3">
          {data.atracoes.map((atracao, index) => (
            <div key={atracao.id} className="bg-card border border-border rounded-xl p-4 flex items-start gap-3">
              <div className="w-7 h-7 rounded-full bg-primary/10 text-primary text-xs font-bold flex items-center justify-center shrink-0 mt-0.5">
                {index + 1}
              </div>

              <div className="flex-1 grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-medium text-foreground mb-1">
                    Nome do artista/DJ <span className="text-error-fg">*</span>
                  </label>
                  <input
                    type="text"
                    className="input-base"
                    placeholder="Ex: DJ Fulano"
                    value={atracao.nomeArtista}
                    onChange={(e) => updateAtracao(atracao.id, { nomeArtista: e.target.value })}
                  />
                </div>
                <div>
                  <label className="block text-xs font-medium text-foreground mb-1">
                    Horário de apresentação
                  </label>
                  <input
                    type="datetime-local"
                    className="input-base"
                    value={atracao.horario}
                    onChange={(e) => updateAtracao(atracao.id, { horario: e.target.value })}
                  />
                </div>
              </div>

              <button
                type="button"
                onClick={() => removeAtracao(atracao.id)}
                className="p-1.5 rounded-lg text-muted hover:text-error-fg hover:bg-error-bg transition-colors shrink-0 mt-0.5"
                aria-label="Remover atração"
              >
                <Trash2 size={15} />
              </button>
            </div>
          ))}
        </div>
      )}

      <button
        type="button"
        onClick={addAtracao}
        className="w-full flex items-center justify-center gap-2 py-2.5 rounded-xl border border-dashed border-border text-sm text-muted hover:text-primary hover:border-primary transition-colors"
      >
        <Plus size={16} />
        Adicionar atração
      </button>
    </div>
  );
}
