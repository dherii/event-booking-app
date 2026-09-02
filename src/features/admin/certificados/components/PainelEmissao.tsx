'use client';

import { useState } from 'react';
import {
  ChevronDown, Users, UserCheck, Mail,
  Award, CheckCircle, Clock, AlertCircle, Loader2,
} from 'lucide-react';
import type { EventoConcluido, HistoricoEmissao } from '../types';
import { MOCK_EVENTOS_CONCLUIDOS, MOCK_HISTORICO } from '../types';

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
    'bg-background-tertiary text-muted-subtle border border-border';

  return (
    <div className="clubber-card p-4 flex items-start gap-3 shadow-none">
      <div className={`w-10 h-10 rounded-xl flex items-center justify-center shrink-0 ${iconBg}`}>
        <Icon size={18} strokeWidth={2} />
      </div>
      <div>
        <p className="text-xs font-semibold text-muted">{label}</p>
        <p className="text-2xl font-black text-foreground leading-tight mt-0.5">{value}</p>
        <p className="text-[11px] font-medium text-muted-subtle mt-1">{sub}</p>
      </div>
    </div>
  );
}

const HISTORICO_STATUS: Record<
  HistoricoEmissao['status'],
  { label: string; icon: React.ElementType; className: string }
> = {
  enviado:      { label: 'Enviado',      icon: CheckCircle,  className: 'text-success-fg bg-success-bg border-success-fg/20' },
  processando:  { label: 'Processando',  icon: Clock,        className: 'text-warning-fg bg-warning-bg border-warning-fg/20' },
  erro:         { label: 'Erro',         icon: AlertCircle,  className: 'text-error-fg bg-error-bg border-error-fg/20'   },
};

function CardHistorico({ item }: { item: HistoricoEmissao }) {
  const cfg = HISTORICO_STATUS[item.status];
  const StatusIcon = cfg.icon;

  return (
    <div className="flex items-center gap-4 clubber-card px-4 py-4 shadow-sm hover:border-primary/30 transition-colors">
      <div className="w-10 h-10 rounded-full bg-primary/10 flex items-center justify-center shrink-0 border border-primary/20">
        <Award size={18} className="text-primary" />
      </div>
      <div className="flex-1 min-w-0">
        <p className="text-sm font-bold text-foreground truncate">{item.eventoNome}</p>
        <p className="text-xs text-muted mt-0.5 font-medium">
          <strong className="text-foreground">{item.quantidade}</strong> certificados · {fmtDataHora(item.emitidoEm)}
        </p>
      </div>
      <span className={`flex items-center gap-1.5 text-[11px] font-bold shrink-0 px-2.5 py-1 rounded-full border ${cfg.className}`}>
        <StatusIcon size={12} strokeWidth={2.5} />
        {cfg.label.toUpperCase()}
      </span>
    </div>
  );
}

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
    <div className="space-y-6 max-w-4xl">

      <div className="clubber-card p-6 space-y-4">
        <div>
          <p className="text-base font-bold text-foreground">Selecione o evento</p>
          <p className="text-xs font-medium text-muted mt-0.5">
            Apenas eventos com check-in encerrado estão disponíveis para emissão.
          </p>
        </div>

        <div className="relative">
          <select
            className="input-base appearance-none pr-10 font-medium"
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
          <ChevronDown size={16} className="absolute right-3.5 top-1/2 -translate-y-1/2 text-muted-subtle pointer-events-none" />
        </div>
      </div>

      {eventoSelecionado && (
        <div className="space-y-5 animate-in fade-in slide-in-from-bottom-2 duration-300">
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
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

          <div className="clubber-card p-5 space-y-3">
            <div className="flex justify-between text-sm font-semibold">
              <span className="text-foreground">Progresso de Elegibilidade</span>
              <span className="text-primary">
                {eventoSelecionado.totalCheckin} de {eventoSelecionado.totalInscritos} ({pctCheckin}%)
              </span>
            </div>
            <div className="h-2.5 bg-background-tertiary rounded-full overflow-hidden border border-border">
              <div
                className="h-full bg-primary rounded-full transition-all duration-700 relative overflow-hidden"
                style={{ width: `${pctCheckin}%` }}
              >
                <div className="absolute inset-0 bg-white/20 animate-pulse" />
              </div>
            </div>
            <p className="text-xs font-medium text-muted">
              {eventoSelecionado.totalInscritos - eventoSelecionado.totalCheckin} inscritos não realizaram check-in e não receberão o certificado.
            </p>
          </div>

          <div className="flex items-start gap-3 bg-primary/5 border border-primary/20 rounded-xl px-5 py-4">
            <Award size={18} className="text-primary shrink-0 mt-0.5" />
            <p className="text-xs font-medium text-muted leading-relaxed">
              O certificado será gerado com o template configurado na aba <strong className="text-foreground">Design do Template</strong>. Certifique-se de salvar suas alterações antes de emitir.
            </p>
          </div>

          {sucesso && (
            <div className="flex items-center gap-3 bg-success-bg border border-success-fg/30 rounded-xl px-5 py-4 shadow-sm animate-in zoom-in-95 duration-300">
              <CheckCircle size={20} className="text-success-fg shrink-0" />
              <p className="text-sm font-bold text-success-fg">{sucesso}</p>
            </div>
          )}

          <button
            type="button"
            onClick={handleEmitir}
            disabled={emitindo}
            className="clubber-button w-full py-4 text-base shadow-lg"
          >
            {emitindo ? (
              <>
                <Loader2 size={20} className="animate-spin" />
                Gerando e enviando certificados…
              </>
            ) : (
              <>
                <Mail size={20} />
                Emitir e Enviar {eventoSelecionado.totalCheckin} Certificados
              </>
            )}
          </button>

          <p className="text-center text-xs font-medium text-muted-subtle">
            Os certificados serão processados em background e enviados individualmente para o e-mail de cada aluno.
          </p>
        </div>
      )}

      {!eventoSelecionado && (
        <div className="clubber-card flex flex-col items-center justify-center py-20 gap-3 border-dashed bg-background-secondary/50">
          <Award size={40} className="text-muted-subtle" strokeWidth={1.5} />
          <p className="text-base font-bold text-foreground">Aguardando seleção</p>
          <p className="text-sm font-medium text-muted">Selecione um evento acima para visualizar os dados de emissão.</p>
        </div>
      )}

      <div className="space-y-4 pt-6 border-t border-border">
        <div className="flex items-center justify-between">
          <h3 className="text-base font-bold text-foreground">Histórico de emissões</h3>
          <span className="clubber-chip py-1 px-3 min-h-0 text-[11px] font-bold uppercase pointer-events-none">
            {historico.length} Registro{historico.length !== 1 ? 's' : ''}
          </span>
        </div>

        {historico.length === 0 ? (
          <div className="clubber-card py-10 text-center shadow-none">
            <p className="text-sm font-medium text-muted">Nenhum certificado emitido no histórico.</p>
          </div>
        ) : (
          <div className="space-y-3">
            {historico.map((item) => (
              <CardHistorico key={item.id} item={item} />
            ))}
          </div>
        )}
      </div>
    </div>
  );
}