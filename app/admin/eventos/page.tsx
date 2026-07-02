// app/admin/eventos/novo/page.tsx
'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { ArrowLeft, ArrowRight, Rocket } from 'lucide-react';

import { WizardStepper } from '@/src/features/admin/eventos/components/WizardStepper';
import { StepEvento }     from '@/src/features/admin/eventos/components/StepEvento';
import { StepCronograma } from '@/src/features/admin/eventos/components/StepCronograma';
import { StepLotes }      from '@/src/features/admin/eventos/components/StepLotes';

import type { WizardState } from '@/src/features/admin/eventos/types';

// ─── Configuração dos steps ───────────────────────────────────────────────────

const STEPS = [
  { label: 'Evento',       description: 'Informações gerais'  },
  { label: 'Cronograma',   description: 'Atividades e datas'  },
  { label: 'Ingressos',    description: 'Lotes e preços'      },
];

// ─── Estado inicial ───────────────────────────────────────────────────────────

const INITIAL_STATE: WizardState = {
  evento: {
    nome:             '',
    descricao:        '',
    banner:           null,
    bannerPreview:    '',
    dataInicio:       '',
    dataFim:          '',
    local:            '',
    modalidade:       'presencial',
    capacidadeTotal:  0,
    categorias:       [],
  },
  cronograma: {
    atividades: [],
  },
  lotes: {
    lotes: [
      {
        id:         crypto.randomUUID(),
        nome:       'Lote 1',
        quantidade: 100,
        preco:      0,
        dataInicio: '',
        dataFim:    '',
        visivel:    true,
      },
    ],
  },
};

// ─── Validação por step ───────────────────────────────────────────────────────

function validateStep(step: number, state: WizardState): string | null {
  if (step === 0) {
    if (!state.evento.nome.trim())       return 'O nome do evento é obrigatório.';
    if (!state.evento.dataInicio)        return 'Informe a data de início.';
    if (!state.evento.dataFim)           return 'Informe a data de encerramento.';
    if (state.evento.dataFim < state.evento.dataInicio)
      return 'A data de encerramento deve ser após o início.';
  }
  if (step === 1) {
    const semTitulo = state.cronograma.atividades.some((a) => !a.titulo.trim());
    if (semTitulo) return 'Todas as atividades precisam de um título.';
    const semData   = state.cronograma.atividades.some((a) => !a.data);
    if (semData)   return 'Todas as atividades precisam de uma data.';
  }
  if (step === 2) {
    if (state.lotes.lotes.length === 0) return 'Adicione ao menos um lote de ingressos.';
    const semVagas = state.lotes.lotes.some((l) => !l.quantidade || l.quantidade < 1);
    if (semVagas)  return 'Todos os lotes precisam ter ao menos 1 vaga.';
  }
  return null;
}

// ─── Page ─────────────────────────────────────────────────────────────────────

export default function NovoEventoPage() {
  const router = useRouter();
  const [step,    setStep]    = useState(0);
  const [state,   setState]   = useState<WizardState>(INITIAL_STATE);
  const [error,   setError]   = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  // Atualiza uma seção do estado sem perder as demais
  function updateEvento(patch: Partial<WizardState['evento']>) {
    setState((prev) => ({ ...prev, evento: { ...prev.evento, ...patch } }));
  }
  function updateCronograma(patch: Partial<WizardState['cronograma']>) {
    setState((prev) => ({ ...prev, cronograma: { ...prev.cronograma, ...patch } }));
  }
  function updateLotes(patch: Partial<WizardState['lotes']>) {
    setState((prev) => ({ ...prev, lotes: { ...prev.lotes, ...patch } }));
  }

  function goNext() {
    const validationError = validateStep(step, state);
    if (validationError) {
      setError(validationError);
      return;
    }
    setError(null);
    setStep((s) => s + 1);
    window.scrollTo({ top: 0, behavior: 'smooth' });
  }

  function goBack() {
    setError(null);
    setStep((s) => s - 1);
    window.scrollTo({ top: 0, behavior: 'smooth' });
  }

  async function handleSubmit() {
    const validationError = validateStep(2, state);
    if (validationError) { setError(validationError); return; }

    setLoading(true);
    setError(null);

    try {
      // TODO: substituir pelo insert real no Supabase
      // const { data, error } = await supabase.from('eventos').insert({ ... })
      await new Promise((res) => setTimeout(res, 1500)); // simula latência
      router.push('/admin/eventos');
    } catch {
      setError('Ocorreu um erro ao salvar o evento. Tente novamente.');
    } finally {
      setLoading(false);
    }
  }

  const isLastStep = step === STEPS.length - 1;

  return (
    <div className="max-w-2xl mx-auto space-y-8">

      {/* Cabeçalho da página */}
      <div className="flex items-center gap-3">
        <button
          type="button"
          onClick={() => router.back()}
          className="p-2 rounded-lg text-muted hover:text-foreground hover:bg-border transition-colors"
          aria-label="Voltar"
        >
          <ArrowLeft size={18} />
        </button>
        <div>
          <h1 className="text-xl font-bold text-foreground">Novo Evento</h1>
          <p className="text-sm text-muted mt-0.5">
            Etapa {step + 1} de {STEPS.length} — {STEPS[step].label}
          </p>
        </div>
      </div>

      {/* Stepper */}
      <WizardStepper steps={STEPS} current={step} />

      {/* Card do conteúdo */}
      <div className="bg-card border border-border rounded-2xl p-6 shadow-sm">

        {/* Título da etapa */}
        <div className="mb-6 pb-4 border-b border-border">
          <h2 className="text-base font-semibold text-foreground">{STEPS[step].label}</h2>
          <p className="text-sm text-muted mt-0.5">{STEPS[step].description}</p>
        </div>

        {/* Conteúdo da etapa atual */}
        {step === 0 && (
          <StepEvento data={state.evento} onChange={updateEvento} />
        )}
        {step === 1 && (
          <StepCronograma
            data={state.cronograma}
            dataInicioEvento={state.evento.dataInicio}
            dataFimEvento={state.evento.dataFim}
            onChange={updateCronograma}
          />
        )}
        {step === 2 && (
          <StepLotes
            data={state.lotes}
            dataInicioEvento={state.evento.dataInicio}
            dataFimEvento={state.evento.dataFim}
            onChange={updateLotes}
          />
        )}

        {/* Erro de validação */}
        {error && (
          <p role="alert" className="mt-4 bg-error-bg text-error-fg text-sm px-4 py-3 rounded-lg">
            {error}
          </p>
        )}

        {/* Navegação */}
        <div className="flex items-center justify-between mt-8 pt-4 border-t border-border">
          <button
            type="button"
            onClick={goBack}
            disabled={step === 0}
            className="flex items-center gap-2 px-4 py-2.5 rounded-lg text-sm font-medium text-muted border border-border hover:text-foreground hover:bg-border transition-colors disabled:opacity-30 disabled:cursor-not-allowed"
          >
            <ArrowLeft size={16} />
            Voltar
          </button>

          {isLastStep ? (
            <button
              type="button"
              onClick={handleSubmit}
              disabled={loading}
              className="flex items-center gap-2 px-5 py-2.5 rounded-lg text-sm font-semibold bg-primary hover:bg-primary-hover text-primary-fg transition-colors disabled:opacity-60"
            >
              {loading ? (
                <>
                  <span className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                  Publicando…
                </>
              ) : (
                <>
                  <Rocket size={16} />
                  Publicar evento
                </>
              )}
            </button>
          ) : (
            <button
              type="button"
              onClick={goNext}
              className="flex items-center gap-2 px-5 py-2.5 rounded-lg text-sm font-semibold bg-primary hover:bg-primary-hover text-primary-fg transition-colors"
            >
              Próximo
              <ArrowRight size={16} />
            </button>
          )}
        </div>
      </div>
    </div>
  );
}