'use client';

import { useState, useEffect } from 'react';
import { Save, Loader2, Info, ChevronDown } from 'lucide-react';
import { listarEventosParaCertificados, salvarRegrasCertificado } from '../actions';

type RegraEmissao = 'apenas_compra' | 'presenca_minima';

interface EventoCertificadoConfig {
  id: string;
  nome: string;
  diasEvento: number;
  emiteCertificado: boolean;
  cargaHoraria: number;
  regraEmissao: RegraEmissao;
  percentualPresenca: number;
  diasLiberacao: number;
}

interface RegrasForm {
  emiteCertificado: boolean;
  cargaHoraria: number;
  regraEmissao: RegraEmissao;
  percentualPresenca: number;
  diasLiberacao: number;
}

export function RegrasEmissao() {
  const [eventos, setEventos] = useState<EventoCertificadoConfig[]>([]);
  const [eventoId, setEventoId] = useState<string>('');
  const [loading, setLoading] = useState(false);
  const [loadingInitial, setLoadingInitial] = useState(true);
  const [salvo, setSalvo] = useState(false);
  const [erro, setErro] = useState<string | null>(null);

  useEffect(() => {
    listarEventosParaCertificados()
      .then((data) => {
        setEventos(data as EventoCertificadoConfig[]);
        setLoadingInitial(false);
      })
      .catch(() => {
        setErro('Erro ao carregar eventos.');
        setLoadingInitial(false);
      });
  }, []);

  const eventoSelecionado = eventos.find((e) => e.id === eventoId);
  const totalDias = eventoSelecionado?.diasEvento ?? 1;

  const [form, setForm] = useState<RegrasForm>({
    emiteCertificado: false,
    cargaHoraria: 0,
    regraEmissao: 'apenas_compra',
    percentualPresenca: 75,
    diasLiberacao: 0,
  });

  const diasExigidos = Math.max(1, Math.round((form.percentualPresenca / 100) * totalDias));

  function handleSelectEvento(id: string) {
    setEventoId(id);
    setSalvo(false);
    setErro(null);
    const ev = eventos.find((e) => e.id === id);
    if (ev) {
      setForm({
        emiteCertificado: ev.emiteCertificado,
        cargaHoraria: ev.cargaHoraria,
        regraEmissao: ev.regraEmissao,
        percentualPresenca: ev.percentualPresenca,
        diasLiberacao: ev.diasLiberacao,
      });
    }
  }

  async function handleSalvar(e: React.FormEvent) {
    e.preventDefault();
    if (!eventoId) return;

    setLoading(true);
    setErro(null);
    setSalvo(false);

    try {
      await salvarRegrasCertificado(eventoId, form);
      setEventos((prev) => prev.map((ev) => (ev.id === eventoId ? { ...ev, ...form } : ev)));
      setSalvo(true);
    } catch (err) {
      setErro(err instanceof Error ? err.message : 'Erro ao salvar regras.');
    } finally {
      setLoading(false);
    }
  }

  if (loadingInitial) {
    return (
      <div className="py-20 text-center flex flex-col items-center gap-3 text-primary font-semibold">
        <Loader2 className="animate-spin" size={28} />
        Carregando eventos...
      </div>
    );
  }

  return (
    <div className="space-y-6 max-w-4xl">
      <div className="clubber-card p-6">
        <label className="block text-base font-bold text-foreground mb-3">Selecione o evento para configurar</label>
        <div className="relative">
          <select
            className="input-base appearance-none pr-10 font-medium"
            value={eventoId}
            onChange={(e) => handleSelectEvento(e.target.value)}
          >
            <option value="">Escolha um evento…</option>
            {eventos.map((ev) => (
              <option key={ev.id} value={ev.id}>{ev.nome}</option>
            ))}
          </select>
          <ChevronDown size={16} className="absolute right-3.5 top-1/2 -translate-y-1/2 text-muted-subtle pointer-events-none" />
        </div>
      </div>

      {erro && (
        <div className="bg-error-bg text-error-fg text-sm font-bold p-4 rounded-xl border border-error-fg/30 flex items-center gap-2 shadow-sm">
          <Info size={18} />
          {erro}
        </div>
      )}

      {eventoSelecionado && (
        <form onSubmit={handleSalvar} className="clubber-card p-6 sm:p-8 space-y-8 animate-in fade-in slide-in-from-bottom-2 duration-300">

          {/* Toggle Principal */}
          <div className="flex items-center justify-between pb-6 border-b border-border">
            <div className="pr-4">
              <h3 className="text-lg font-bold text-foreground">Habilitar emissão de certificados</h3>
              <p className="text-sm font-medium text-muted mt-1 leading-relaxed">
                Ative para permitir que os participantes baixem o certificado deste evento após a conclusão.
              </p>
            </div>
            <label className="relative inline-flex items-center cursor-pointer shrink-0">
              <input
                type="checkbox"
                className="sr-only peer"
                checked={form.emiteCertificado}
                onChange={(e) => setForm({ ...form, emiteCertificado: e.target.checked })}
              />
              <div className="w-14 h-7 bg-background-tertiary border border-border peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-border after:border after:rounded-full after:h-6 after:w-6 after:transition-all peer-checked:bg-primary peer-checked:border-primary shadow-inner"></div>
            </label>
          </div>

          {form.emiteCertificado && (
            <div className="space-y-8 animate-in fade-in duration-300">
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
                <div>
                  <label className="block text-sm font-bold text-foreground mb-2">Carga Horária Total (h)</label>
                  <input
                    type="number"
                    min={1}
                    className="input-base font-semibold"
                    value={form.cargaHoraria}
                    onChange={(e) => setForm({ ...form, cargaHoraria: Number(e.target.value) })}
                    required
                  />
                </div>
                <div>
                  <label className="block text-sm font-bold text-foreground mb-2">Liberação após o evento (Dias)</label>
                  <div className="relative">
                    <input
                      type="number"
                      min={0}
                      className="input-base pr-12 font-semibold"
                      value={form.diasLiberacao}
                      onChange={(e) => setForm({ ...form, diasLiberacao: Number(e.target.value) })}
                    />
                    <span className="absolute right-4 top-1/2 -translate-y-1/2 text-sm font-medium text-muted">dias</span>
                  </div>
                  <p className="text-[11px] font-medium text-muted-subtle mt-1.5">Use 0 para liberar no mesmo dia.</p>
                </div>
              </div>

              <div>
                <label className="block text-sm font-bold text-foreground mb-3">Critério de Liberação</label>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <label className={`flex items-start gap-3 p-4 rounded-xl border-2 cursor-pointer transition-all ${form.regraEmissao === 'apenas_compra' ? 'bg-primary/5 border-primary text-primary shadow-sm' : 'border-border text-foreground hover:bg-background-secondary'}`}>
                    <input
                      type="radio"
                      name="regra"
                      checked={form.regraEmissao === 'apenas_compra'}
                      onChange={() => setForm({ ...form, regraEmissao: 'apenas_compra' })}
                      className="mt-1 w-4 h-4 text-primary bg-background border-border focus:ring-primary focus:ring-2"
                    />
                    <div>
                      <p className="text-sm font-bold">Apenas Compra</p>
                      <p className={`text-xs font-medium mt-1 ${form.regraEmissao === 'apenas_compra' ? 'text-primary/80' : 'text-muted'}`}>
                        Basta o ingresso estar pago para o aluno poder emitir o certificado.
                      </p>
                    </div>
                  </label>

                  <label className={`flex items-start gap-3 p-4 rounded-xl border-2 cursor-pointer transition-all ${form.regraEmissao === 'presenca_minima' ? 'bg-primary/5 border-primary text-primary shadow-sm' : 'border-border text-foreground hover:bg-background-secondary'}`}>
                    <input
                      type="radio"
                      name="regra"
                      checked={form.regraEmissao === 'presenca_minima'}
                      onChange={() => setForm({ ...form, regraEmissao: 'presenca_minima' })}
                      className="mt-1 w-4 h-4 text-primary bg-background border-border focus:ring-primary focus:ring-2"
                    />
                    <div>
                      <p className="text-sm font-bold">Presença Mínima</p>
                      <p className={`text-xs font-medium mt-1 ${form.regraEmissao === 'presenca_minima' ? 'text-primary/80' : 'text-muted'}`}>
                        Exige validação de check-in em múltiplos dias de evento.
                      </p>
                    </div>
                  </label>
                </div>
              </div>

              {form.regraEmissao === 'presenca_minima' && (
                <div className="bg-background-secondary border border-border rounded-xl p-5 animate-in fade-in zoom-in-95 duration-200">
                  <div className="flex justify-between items-center mb-4">
                    <label className="text-sm font-bold text-foreground">Mínimo de Presença Exigido</label>
                    <span className="text-sm font-black text-primary bg-primary/10 px-3 py-1 rounded-lg">{form.percentualPresenca}%</span>
                  </div>

                  <input
                    type="range"
                    min="1"
                    max={totalDias}
                    step="1"
                    value={diasExigidos}
                    onChange={(e) => {
                      const diasSelecionados = Number(e.target.value);
                      const novaPorcentagem = Math.round((diasSelecionados / totalDias) * 100);
                      setForm({ ...form, percentualPresenca: novaPorcentagem });
                    }}
                    className="w-full h-2 rounded-full appearance-none bg-border cursor-pointer accent-primary focus:outline-none focus:ring-2 focus:ring-primary/30"
                  />
                  <div className="flex items-start gap-2 mt-4 text-xs font-medium text-muted bg-background p-3 rounded-lg border border-border">
                    <Info size={16} className="text-primary shrink-0" />
                    <span>
                      O evento possui um total de <strong className="text-foreground">{totalDias} {totalDias === 1 ? 'dia' : 'dias'}</strong>.
                      Configurar a exigência para {form.percentualPresenca}% equivale a exigir a presença do aluno em <strong className="text-foreground">{diasExigidos} {diasExigidos === 1 ? 'dia' : 'dias'}</strong>.                    </span>
                  </div>
                </div>
              )}
            </div>
          )}

          <div className="flex flex-col-reverse sm:flex-row items-center justify-end gap-4 pt-6 border-t border-border">
            {salvo && <span className="text-sm font-bold text-success-fg animate-in fade-in">✔ Regras salvas com sucesso</span>}
            <button
              type="submit"
              disabled={loading}
              className="clubber-button w-full sm:w-auto"
            >
              {loading ? <Loader2 size={18} className="animate-spin" /> : <Save size={18} />}
              Salvar Regras de Emissão
            </button>
          </div>

        </form>
      )}
    </div>
  );
}