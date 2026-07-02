// src/features/admin/certificados/components/PainelEmissao.tsx
'use client';

import { useState } from 'react';
import {
  ChevronDown, Users, UserCheck, Mail,
  Award, CheckCircle, Clock, AlertCircle, Loader2,
} from 'lucide-react';
import type { EventoConcluido, HistoricoEmissao } from '../types';
import { MOCK_EVENTOS_CONCLUIDOS, MOCK_HISTORICO } from '../types';

// ─── Helpers ──────────────────────────────────────────────────────────────────

function fmtData(iso: string) {
  return new Date(iso).toLocaleDateString('pt-BR', {
    day: '2-digit', month: 'long', year: 'numeric',
  });
}

function fmtDataHora(iso: string) {
  const d = new Date(iso);
  return (
    d.toLocaleDateString('pt-BR', { day: '2-digit', month: '2-digit', year: '2-digit' })
    + ' às '
    + d.toLocaleTimeString('pt-BR', { hour: '2-digit', minute: '2-digit' })
  );
}

// ─── Subcomponentes ───────────────────────────────────────────────────────────

function MetricaCard({
  label, value, sub, icon: Icon, variant,
}: {
  label: string; value: string | number; sub: string;
  icon: React.ElementType;
  variant: 'default' | 'primary' | 'success';
}) {
  const iconBg =
    variant === 'primary' ? 'bg-primary/10 text-primary' :
    variant === 'success' ? 'bg-success-bg text-success-fg' :
                            'bg-border text-muted';

  return (
    <div className="bg-background border border-border rounded-xl p-4 flex items-start gap-3">
      <div className={`w-9 h-9 rounded-lg flex items-center justify-center shrink-0 ${iconBg}`}>
        <Icon size={17} strokeWidth={1.8} />
      </div>
      <div>
        <p className="text-xs text-muted">{label}</p>
        <p className="text-xl font-bold text-foreground leading-tight">{value}</p>
        <p className="text-[11px] text-muted mt-0.5">{sub}</p>
      </div>
    </div>
  );
}

const HISTORICO_STATUS: Record<
  HistoricoEmissao['status'],
  { label: string; icon: React.ElementType; className: string }
> = {
  enviado:      { label: 'Enviado',      icon: CheckCircle,  className: 'text-success-fg'                                              },
  processando:  { label: 'Processando',  icon: Clock,        className: 'text-yellow-600 dark:text-yellow-400'                        },
  erro:         { label: 'Erro',         icon: AlertCircle,  className: 'text-error-fg'                                                },
};

function CardHistorico({ item }: { item: HistoricoEmissao }) {
  const cfg = HISTORICO_STATUS[item.status];
  const StatusIcon = cfg.icon;

  return (
    <div className="flex items-center gap-4 bg-card border border-border rounded-xl px-4 py-3.5">
      <div className="w-9 h-9 rounded-full bg-primary/10 flex items-center justify-center shrink-0">
        <Award size={16} className="text-primary" />
      </div>
      <div className="flex-1 min-w-0">
        <p className="text-sm font-medium text-foreground truncate">{item.eventoNome}</p>
        <p className="text-xs text-muted mt-0.5">
          <strong className="text-foreground">{item.quantidade}</strong> certificados · {fmtDataHora(item.emitidoEm)}
        </p>
      </div>
      <span className={`flex items-center gap-1.5 text-xs font-medium shrink-0 ${cfg.className}`}>
        <StatusIcon size={13} />
        {cfg.label}
      </span>
    </div>
  );
}

// ─── Componente principal ─────────────────────────────────────────────────────

export function PainelEmissao() {
  const [eventoId,   setEventoId]   = useState<string>('');
  const [emitindo,   setEmitindo]   = useState(false);
  const [historico,  setHistorico]  = useState<HistoricoEmissao[]>(MOCK_HISTORICO);
  const [sucesso,    setSucesso]    = useState<string | null>(null);

  const eventoSelecionado = MOCK_EVENTOS_CONCLUIDOS.find((e) => e.id === eventoId) ?? null;
  const pctCheckin = eventoSelecionado
    ? Math.round((eventoSelecionado.totalCheckin / eventoSelecionado.totalInscritos) * 100)
    : 0;

  async function handleEmitir() {
    if (!eventoSelecionado) return;
    setEmitindo(true);
    setSucesso(null);

    // Simula chamada à Edge Function do Supabase
    await new Promise((r) => setTimeout(r, 2000));

    const novoItem: HistoricoEmissao = {
      id:          Date.now().toString(),
      eventoNome:  eventoSelecionado.nome,
      quantidade:  eventoSelecionado.totalCheckin,
      emitidoEm:   new Date().toISOString(),
      status:      'enviado',
    };

    setHistorico((prev) => [novoItem, ...prev]);
    setSucesso(`${eventoSelecionado.totalCheckin} certificados gerados e enviados com sucesso!`);
    setEmitindo(false);
  }

  return (
    <div className="space-y-6">

      {/* Seletor de evento */}
      <div className="bg-card border border-border rounded-xl p-5 space-y-4">
        <div>
          <p className="text-sm font-semibold text-foreground">Selecione o evento</p>
          <p className="text-xs text-muted mt-0.5">
            Apenas eventos com check-in encerrado aparecem aqui.
          </p>
        </div>

        <div className="relative">
          <select
            className="input-base appearance-none pr-8 text-sm"
            value={eventoId}
            onChange={(e) => { setEventoId(e.target.value); setSucesso(null); }}
          >
            <option value="">Escolha um evento concluído…</option>
            {MOCK_EVENTOS_CONCLUIDOS.map((ev) => (
              <option key={ev.id} value={ev.id}>
                {ev.nome} — {fmtData(ev.data)}
              </option>
            ))}
          </select>
          <ChevronDown size={14} className="absolute right-3 top-1/2 -translate-y-1/2 text-muted pointer-events-none" />
        </div>
      </div>

      {/* Métricas do evento selecionado */}
      {eventoSelecionado && (
        <div className="space-y-4">
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
            <MetricaCard
              label="Total de inscritos"
              value={eventoSelecionado.totalInscritos}
              sub="pagamentos confirmados"
              icon={Users}
              variant="default"
            />
            <MetricaCard
              label="Realizaram check-in"
              value={eventoSelecionado.totalCheckin}
              sub="elegíveis ao certificado"
              icon={UserCheck}
              variant="success"
            />
            <MetricaCard
              label="Carga horária"
              value={`${eventoSelecionado.cargaHoraria}h`}
              sub="constará no certificado"
              icon={Award}
              variant="primary"
            />
          </div>

          {/* Barra de elegibilidade */}
          <div className="bg-card border border-border rounded-xl p-4 space-y-2">
            <div className="flex justify-between text-xs">
              <span className="text-muted">Elegíveis ao certificado</span>
              <span className="font-semibold text-foreground">
                {eventoSelecionado.totalCheckin} de {eventoSelecionado.totalInscritos} ({pctCheckin}%)
              </span>
            </div>
            <div className="h-2 bg-border rounded-full overflow-hidden">
              <div
                className="h-full bg-success-action rounded-full transition-all duration-700"
                style={{ width: `${pctCheckin}%` }}
              />
            </div>
            <p className="text-[11px] text-muted">
              {eventoSelecionado.totalInscritos - eventoSelecionado.totalCheckin} inscritos sem check-in não receberão o certificado.
            </p>
          </div>

          {/* Aviso de template */}
          <div className="flex items-start gap-3 bg-primary/5 border border-primary/20 rounded-xl px-4 py-3.5">
            <Award size={16} className="text-primary shrink-0 mt-0.5" />
            <p className="text-xs text-muted leading-relaxed">
              O certificado será gerado com o template configurado na aba <strong className="text-foreground">Design do Template</strong>. Certifique-se de salvar o template antes de emitir.
            </p>
          </div>

          {/* Feedback de sucesso */}
          {sucesso && (
            <div className="flex items-center gap-3 bg-success-bg border border-success-fg/20 rounded-xl px-4 py-3.5">
              <CheckCircle size={16} className="text-success-fg shrink-0" />
              <p className="text-sm font-medium text-success-fg">{sucesso}</p>
            </div>
          )}

          {/* Botão principal */}
          <button
            type="button"
            onClick={handleEmitir}
            disabled={emitindo}
            className="w-full flex items-center justify-center gap-3 py-4 rounded-xl bg-primary hover:bg-primary-hover text-primary-fg font-semibold text-base transition-all active:scale-[0.99] disabled:opacity-60"
          >
            {emitindo ? (
              <>
                <Loader2 size={20} className="animate-spin" />
                Gerando e enviando certificados…
              </>
            ) : (
              <>
                <Mail size={20} />
                Gerar e Enviar {eventoSelecionado.totalCheckin} Certificados por E-mail
              </>
            )}
          </button>

          <p className="text-center text-xs text-muted">
            Os certificados serão enviados individualmente para o e-mail de cada aluno.
          </p>
        </div>
      )}

      {/* Estado vazio */}
      {!eventoSelecionado && (
        <div className="flex flex-col items-center justify-center py-16 gap-3 text-muted">
          <Award size={36} strokeWidth={1.2} />
          <p className="text-sm font-medium">Selecione um evento para continuar</p>
          <p className="text-xs">As métricas de elegibilidade aparecerão aqui</p>
        </div>
      )}

      {/* Histórico */}
      <div className="space-y-3">
        <div className="flex items-center justify-between">
          <p className="text-sm font-semibold text-foreground">Histórico de emissões</p>
          <span className="text-xs text-muted">{historico.length} emissão{historico.length !== 1 ? 'ões' : ''}</span>
        </div>

        {historico.length === 0 ? (
          <p className="text-sm text-muted text-center py-6">Nenhum certificado emitido ainda.</p>
        ) : (
          <div className="space-y-2">
            {historico.map((item) => (
              <CardHistorico key={item.id} item={item} />
            ))}
          </div>
        )}
      </div>
    </div>
  );
}