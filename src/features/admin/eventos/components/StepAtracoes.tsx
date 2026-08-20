'use client';

import { Plus, Trash2, Mic2 } from 'lucide-react';
import type { Atracao, AtracoesFormData } from '@/src/features/admin/eventos/types';

interface StepAtracoesProps {
  data: AtracoesFormData;
  onChange: (data: AtracoesFormData) => void;
}

function novaAtracao(): Atracao {
  return {
    id: crypto.randomUUID(),
    nomeArtista: '',
    horario: '',
    fotoUrl: '',
    localSala: '',
    vagasTotais: 60,
    descricao: '',
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
        Cadastre as atividades, oficinas, palestras ou atrações do evento com o local e o limite de vagas de cada uma.
      </p>

      {data.atracoes.length === 0 ? (
        <div className="border-2 border-dashed border-border rounded-xl py-10 text-center">
          <Mic2 size={28} className="mx-auto text-muted mb-2" strokeWidth={1.3} />
          <p className="text-sm text-muted">Nenhuma atividade ou atração adicionada ainda.</p>
          <p className="text-xs text-muted mt-1">
            Clique em <strong>Adicionar atividade</strong> para começar.
          </p>
        </div>
      ) : (
        <div className="space-y-4">
          {data.atracoes.map((atracao, index) => (
            <div key={atracao.id} className="bg-card border border-border rounded-xl p-4 flex items-start gap-3">
              <div className="w-7 h-7 rounded-full bg-primary/10 text-primary text-xs font-bold flex items-center justify-center shrink-0 mt-0.5">
                {index + 1}
              </div>

              <div className="flex-1 grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div className="sm:col-span-2">
                  <label className="block text-xs font-medium text-foreground mb-1">
                    Título da atividade / oficina <span className="text-error-fg">*</span>
                  </label>
                  <input
                    type="text"
                    className="input-base"
                    placeholder="Ex: Oficina de Desenho Técnico ou Palestra Bloco B"
                    value={atracao.nomeArtista}
                    onChange={(e) => updateAtracao(atracao.id, { nomeArtista: e.target.value })}
                  />
                </div>

                <div>
                  <label className="block text-xs font-medium text-foreground mb-1">
                    Local / Sala / Auditório
                  </label>
                  <input
                    type="text"
                    className="input-base"
                    placeholder="Ex: Bloco B - Sala 102"
                    value={atracao.localSala ?? ''}
                    onChange={(e) => updateAtracao(atracao.id, { localSala: e.target.value })}
                  />
                </div>

                <div>
                  <label className="block text-xs font-medium text-foreground mb-1">
                    Vagas totais da sala <span className="text-error-fg">*</span>
                  </label>
                  <input
                    type="number"
                    min={1}
                    className="input-base"
                    placeholder="Ex: 60"
                    value={atracao.vagasTotais ?? ''}
                    onChange={(e) => updateAtracao(atracao.id, { vagasTotais: Number(e.target.value) })}
                  />
                </div>

                <div>
                  <label className="block text-xs font-medium text-foreground mb-1">
                    Data e Horário
                  </label>
                  <input
                    type="datetime-local"
                    className="input-base"
                    value={atracao.horario ?? ''}
                    onChange={(e) => updateAtracao(atracao.id, { horario: e.target.value })}
                  />
                </div>

                <div>
                  <label className="block text-xs font-medium text-foreground mb-1">
                    Descrição curta (opcional)
                  </label>
                  <input
                    type="text"
                    className="input-base"
                    placeholder="Ex: Traga seu próprio notebook"
                    value={atracao.descricao ?? ''}
                    onChange={(e) => updateAtracao(atracao.id, { descricao: e.target.value })}
                  />
                </div>
              </div>

              <button
                type="button"
                onClick={() => removeAtracao(atracao.id)}
                className="p-1.5 rounded-lg text-muted hover:text-error-fg hover:bg-error-bg transition-colors shrink-0 mt-0.5"
                aria-label="Remover atividade"
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
        Adicionar atividade / oficina
      </button>
    </div>
  );
}