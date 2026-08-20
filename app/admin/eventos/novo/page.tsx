'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { ArrowLeft, ArrowRight, Rocket } from 'lucide-react';

import { WizardStepper } from '@/src/features/admin/eventos/components/WizardStepper';
import { StepEvento }     from '@/src/features/admin/eventos/components/StepEvento';
import { StepAtracoes }   from '@/src/features/admin/eventos/components/StepAtracoes';
import { StepLotes }      from '@/src/features/admin/eventos/components/StepLotes';
import { criarEventoComLotes } from '@/src/features/admin/eventos/actions';
import { createSupabaseBrowserClient } from '@/src/config/supabase-browser';

import type { WizardState } from '@/src/features/admin/eventos/types';

// ─── Configuração dos steps ───────────────────────────────────────────────────

const STEPS = [
  { label: 'Evento',    description: 'Informações gerais'  },
  { label: 'Atrações',  description: 'Line-up e horários'  },
  { label: 'Ingressos', description: 'Lotes e preços'      },
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
  atracoes: {
    atracoes: [],
  },
  lotes: {
    lotes: [
      {
        id:                crypto.randomUUID(),
        nome:              'Lote 1',
        quantidade:        100,
        preco:             0,
        dataInicio:        '',
        dataFim:           '',
        visivel:           true,
        tipo:              'ingresso',
        capacidadePessoas: null,
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
    const semNome = state.atracoes.atracoes.some((a) => !a.nomeArtista.trim());
    if (semNome) return 'Toda atração ou atividade precisa de um nome — ou remova a linha em branco.';
  }
  if (step === 2) {
  if (state.lotes.lotes.length === 0) return 'Adicione ao menos um lote de ingressos.';
  const semVagas = state.lotes.lotes.some((l) => !l.quantidade || l.quantidade < 1);
  if (semVagas)  return 'Todos os lotes precisam ter ao menos 1 vaga.';
  
  const precoInvalido = state.lotes.lotes.some((l) => l.preco > 0 && l.preco < 5);
  if (precoInvalido) return 'Lotes pagos devem custar no mínimo R$ 5,00 devido às taxas fixas de processamento do Pix.';
  
  const semCapacidade = state.lotes.lotes.some(
    (l) => l.tipo !== 'ingresso' && (!l.capacidadePessoas || l.capacidadePessoas < 1)
  );
  if (semCapacidade) return 'Mesas e camarotes precisam informar quantas pessoas cabem.';
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

  function updateEvento(patch: Partial<WizardState['evento']>) {
    setState((prev) => ({ ...prev, evento: { ...prev.evento, ...patch } }));
  }
  function updateAtracoes(patch: Partial<WizardState['atracoes']>) {
    setState((prev) => ({ ...prev, atracoes: { ...prev.atracoes, ...patch } }));
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
      let bannerUrl: string | null = null;

      if (state.evento.banner) {
        const supabase = createSupabaseBrowserClient();
        const { data: { user } } = await supabase.auth.getUser();

        if (!user) {
          throw new Error('Sessão expirada — faça login novamente.');
        }

        const file = state.evento.banner;
        const extensao = file.name.split('.').pop() ?? 'jpg';
        const caminho = `${user.id}/${crypto.randomUUID()}.${extensao}`;

        const { error: uploadError } = await supabase.storage
          .from('banners')
          .upload(caminho, file, { cacheControl: '3600', upsert: false });

        if (uploadError) {
          throw new Error(`Erro ao enviar a imagem do banner: ${uploadError.message}`);
        }

        const { data: publicUrlData } = supabase.storage.from('banners').getPublicUrl(caminho);
        bannerUrl = publicUrlData.publicUrl;
      }

      await criarEventoComLotes({
        nome:                state.evento.nome,
        descricao:           state.evento.descricao,
        dataInicio:          state.evento.dataInicio,
        dataFim:             state.evento.dataFim,
        local:               state.evento.local,
        modalidade:          state.evento.modalidade,
        categoria:           state.evento.categorias[0] ?? undefined,
        classificacaoEtaria: 18,
        bannerUrl,
        lotes: state.lotes.lotes.map((l) => ({
          nome:              l.nome,
          preco:             l.preco,
          quantidade:        l.quantidade,
          tipo:              l.tipo,
          capacidadePessoas: l.capacidadePessoas,
        })),
        atracoes: state.atracoes.atracoes
          .filter((a) => a.nomeArtista.trim())
          .map((a) => ({
            nomeArtista: a.nomeArtista,
            horario:     a.horario || null,
            fotoUrl:     a.fotoUrl || null,
            localSala:   a.localSala || null,
            vagasTotais: a.vagasTotais || 60,
            descricao:   a.descricao || null,
          })),
      });

      router.push('/admin/eventos');
      router.refresh();
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Ocorreu um erro ao salvar o evento. Tente novamente.');
    } finally {
      setLoading(false);
    }
  }

  const isLastStep = step === STEPS.length - 1;

  return (
    <div className="max-w-2xl mx-auto space-y-8">
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

      <WizardStepper steps={STEPS} current={step} />

      <div className="bg-card border border-border rounded-2xl p-6 shadow-sm">
        <div className="mb-6 pb-4 border-b border-border">
          <h2 className="text-base font-semibold text-foreground">{STEPS[step].label}</h2>
          <p className="text-sm text-muted mt-0.5">{STEPS[step].description}</p>
        </div>

        {step === 0 && (
          <StepEvento data={state.evento} onChange={updateEvento} />
        )}
        {step === 1 && (
          <StepAtracoes data={state.atracoes} onChange={updateAtracoes} />
        )}
        {step === 2 && (
          <StepLotes
            data={state.lotes}
            dataInicioEvento={state.evento.dataInicio}
            dataFimEvento={state.evento.dataFim}
            onChange={updateLotes}
          />
        )}

        {error && (
          <p role="alert" className="mt-4 bg-error-bg text-error-fg text-sm px-4 py-3 rounded-lg">
            {error}
          </p>
        )}

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