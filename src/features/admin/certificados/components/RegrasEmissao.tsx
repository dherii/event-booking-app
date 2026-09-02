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
    return <div className="p-8 text-center text-muted flex flex-col items-center gap-2"><Loader2 className="animate-spin" size={24} /> Carregando eventos...</div>;
  }

  return (
    <div className="space-y-6">
      <div className="bg-card border border-border rounded-xl p-5">
        <p className="text-sm font-semibold text-foreground mb-3">Selecione o evento para configurar</p>
        <div className="relative">
          <select
            className="input-base appearance-none pr-8 text-sm"
            value={eventoId}
            onChange={(e) => handleSelectEvento(e.target.value)}
          >
            <option value="">Escolha um evento…</option>
            {eventos.map((ev) => (
              <option key={ev.id} value={ev.id}>{ev.nome}</option>
            ))}
          </select>
          <ChevronDown size={14} className="absolute right-3 top-1/2 -translate-y-1/2 text-muted pointer-events-none" />
        </div>
      </div>

      {erro && (
        <div className="bg-error-bg text-error-fg text-xs font-semibold p-3 rounded-lg border border-error-fg/20">
          {erro}
        </div>
      )}

      {eventoSelecionado && (
        <form onSubmit={handleSalvar} className="bg-card border border-border rounded-xl p-5 space-y-6 shadow-sm">

          {/* Toggle Principal */}
          <div className="flex items-center justify-between border-b border-border pb-4">
            <div>
              <p className="text-base font-semibold text-foreground">Habilitar emissão de certificados</p>
              <p className="text-xs text-muted mt-0.5">Ative para permitir que os participantes baixem o certificado deste evento.</p>
            </div>
            <label className="relative inline-flex items-center cursor-pointer p-2.5 -m-2.5">
              <input
                type="checkbox"
                className="sr-only peer"
                checked={form.emiteCertificado}
                onChange={(e) => setForm({ ...form, emiteCertificado: e.target.checked })}
              />
              <div className="w-11 h-6 bg-border peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-card after:border-input-border after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-primary"></div>
            </label>
          </div>

          {form.emiteCertificado && (
            <div className="space-y-5 animate-in fade-in slide-in-from-top-2 duration-300">

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-medium text-foreground mb-1.5">Carga Horária (h)</label>
                  <input
                    type="number"
                    min={1}
                    className="input-base"
                    value={form.cargaHoraria}
                    onChange={(e) => setForm({ ...form, cargaHoraria: Number(e.target.value) })}
                    required
                  />
                </div>
                <div>
                  <label className="block text-xs font-medium text-foreground mb-1.5">Liberação após o evento (Dias)</label>
                  <div className="relative">
                    <input
                      type="number"
                      min={0}
                      className="input-base pr-12"
                      value={form.diasLiberacao}
                      onChange={(e) => setForm({ ...form, diasLiberacao: Number(e.target.value) })}
                    />
                    <span className="absolute right-3 top-1/2 -translate-y-1/2 text-xs text-muted">dias</span>
                  </div>
                  <p className="text-[10px] text-muted mt-1">Use 0 para liberar no mesmo dia.</p>
                </div>
              </div>

              <div>
                <label className="block text-xs font-medium text-foreground mb-2">Critério de Liberação</label>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                  <label className={`flex items-start gap-3 p-3 rounded-xl border cursor-pointer transition-all ${form.regraEmissao === 'apenas_compra' ? 'bg-primary/5 border-primary text-primary' : 'border-border text-muted hover:bg-background-secondary'}`}>
                    <input
                      type="radio"
                      name="regra"
                      checked={form.regraEmissao === 'apenas_compra'}
                      onChange={() => setForm({ ...form, regraEmissao: 'apenas_compra' })}
                      className="mt-0.5 accent-primary"
                    />
                    <div>
                      <p className="text-sm font-semibold">Apenas Compra</p>
                      <p className="text-[10px] opacity-80 mt-0.5">Basta o ingresso estar pago para emitir.</p>
                    </div>
                  </label>

                  <label className={`flex items-start gap-3 p-3 rounded-xl border cursor-pointer transition-all ${form.regraEmissao === 'presenca_minima' ? 'bg-primary/5 border-primary text-primary' : 'border-border text-muted hover:bg-background-secondary'}`}>
                    <input
                      type="radio"
                      name="regra"
                      checked={form.regraEmissao === 'presenca_minima'}
                      onChange={() => setForm({ ...form, regraEmissao: 'presenca_minima' })}
                      className="mt-0.5 accent-primary"
                    />
                    <div>
                      <p className="text-sm font-semibold">Presença Mínima</p>
                      <p className="text-[10px] opacity-80 mt-0.5">Exige check-in em múltiplos dias.</p>
                    </div>
                  </label>
                </div>
              </div>

              {form.regraEmissao === 'presenca_minima' && (
                <div className="bg-background-secondary border border-border rounded-xl p-4 animate-in fade-in">
                  <div className="flex justify-between mb-2">
                    <label className="text-xs font-semibold text-foreground">Mínimo de Presença Exigido</label>
                    <span className="text-xs font-bold text-primary">{form.percentualPresenca}%</span>
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
                    className="w-full h-2 rounded-full appearance-none bg-border accent-primary cursor-pointer"
                  />
                  <p className="text-[10px] text-muted mt-2 flex items-center gap-1.5">
                    <Info size={12} />
                    <span>
                      O evento tem <strong>{totalDias} {totalDias === 1 ? 'dia' : 'dias'}</strong>.
                      Uma exigência de {form.percentualPresenca}% equivale a ir em <strong>{diasExigidos} {diasExigidos === 1 ? 'dia' : 'dias'}</strong>.
                    </span>
                  </p>
                </div>
              )}
            </div>
          )}

          <div className="flex items-center justify-end gap-3 pt-4 border-t border-border">
            {salvo && <span className="text-xs font-medium text-success-fg">Regras salvas com sucesso no banco!</span>}
            <button
              type="submit"
              disabled={loading}
              className="flex items-center gap-2 px-5 py-2.5 rounded-xl text-sm font-semibold bg-primary hover:bg-primary-hover text-primary-fg transition-all shadow-sm disabled:opacity-60 cursor-pointer"
            >
              {loading ? <Loader2 size={16} className="animate-spin" /> : <Save size={16} />}
              Salvar Regras
            </button>
          </div>

        </form>
      )}
    </div>
  );
}