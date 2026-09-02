'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { QrCode, Search, CheckCircle, XCircle, UserCheck, Loader2 } from 'lucide-react';
import type { Inscrito } from '../types';
import { realizarCheckin } from '../actions';

type ScanResult =
  | { tipo: 'sucesso'; inscrito: Inscrito }
  | { tipo: 'ja-feito'; inscrito: Inscrito }
  | { tipo: 'erro'; mensagem: string };

function ResultCard({ result, onDismiss }: { result: ScanResult; onDismiss: () => void }) {
  if (result.tipo === 'erro') {
    return (
      <div className="bg-error-bg border border-error-fg/20 rounded-2xl p-5 text-center space-y-3 animate-in fade-in slide-in-from-bottom-2 duration-300">
        <div className="w-12 h-12 rounded-full bg-error-bg border border-error-fg/20 flex items-center justify-center mx-auto">
          <XCircle size={26} className="text-error-fg" />
        </div>
        <div>
          <p className="font-semibold text-error-fg text-sm">Não foi possível fazer check-in</p>
          <p className="text-xs text-error-fg/80 mt-1">{result.mensagem}</p>
        </div>
        <button
          onClick={onDismiss}
          className="w-full py-2.5 rounded-xl border border-error-fg/30 bg-card text-error-fg text-xs font-semibold hover:bg-error-bg transition-all cursor-pointer"
        >
          Tentar novamente
        </button>
      </div>
    );
  }

  const { inscrito } = result;
  const jaFeito = result.tipo === 'ja-feito';

  return (
    <div
      className={`border rounded-2xl p-5 text-center space-y-3 animate-in fade-in slide-in-from-bottom-2 duration-300 ${
        jaFeito ? 'bg-warning-bg/80 border-warning-fg/20' : 'bg-success-bg/80 border-success-fg/20'
      }`}
    >
      <div
        className={`w-12 h-12 rounded-full flex items-center justify-center mx-auto ${
          jaFeito ? 'bg-warning-bg' : 'bg-success-bg'
        }`}
      >
        {jaFeito ? (
          <UserCheck size={26} className="text-warning-fg" />
        ) : (
          <CheckCircle size={26} className="text-success-fg" />
        )}
      </div>

      <div>
        <p className={`font-semibold text-base ${jaFeito ? 'text-warning-fg' : 'text-success-fg'}`}>
          {jaFeito ? 'Check-in já realizado' : 'Check-in confirmado!'}
        </p>
        <p className="text-sm font-medium text-foreground mt-2">{inscrito.nome}</p>
        <p className="text-xs text-muted">{inscrito.evento} · {inscrito.atividade}</p>
        <p className="text-xs text-muted-subtle mt-0.5">{inscrito.lote}</p>
      </div>

      {jaFeito && inscrito.checkinAt && (
        <p className="text-xs text-warning-fg font-medium">
          Registrado às {new Date(inscrito.checkinAt).toLocaleTimeString('pt-BR', { hour: '2-digit', minute: '2-digit' })}
        </p>
      )}

      <button
        onClick={onDismiss}
        className={`w-full py-2.5 rounded-xl text-xs font-semibold transition-all cursor-pointer ${
          jaFeito
            ? 'bg-card border border-warning-fg/30 text-warning-fg hover:bg-warning-bg/50'
            : 'bg-success-action text-white hover:bg-success-action-hover shadow-xs'
        }`}
      >
        {jaFeito ? 'Entendido' : 'Próximo'}
      </button>
    </div>
  );
}

function CardInscrito({
  inscrito,
  onCheckin,
  loading,
}: {
  inscrito: Inscrito;
  onCheckin: (id: string) => void;
  loading: boolean;
}) {
  return (
    <div className="bg-card border border-border rounded-xl flex items-center gap-3 px-4 py-3 shadow-xs">
      <div className="w-9 h-9 rounded-full bg-primary/10 border border-primary/15 text-primary text-xs font-bold flex items-center justify-center shrink-0">
        {inscrito.nome.charAt(0).toUpperCase()}
      </div>

      <div className="flex-1 min-w-0">
        <p className="text-sm font-medium text-foreground truncate">{inscrito.nome}</p>
        <p className="text-xs text-muted truncate">{inscrito.evento} · {inscrito.lote}</p>
      </div>

      {inscrito.checkin ? (
        <span className="flex items-center gap-1 text-xs text-success-fg font-semibold shrink-0">
          <CheckCircle size={14} />
          Feito
        </span>
      ) : (
        <button
          type="button"
          onClick={() => onCheckin(inscrito.id)}
          disabled={loading || inscrito.status === 'cancelado'}
          className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-primary text-primary-fg text-xs font-semibold hover:bg-primary-hover transition-all cursor-pointer disabled:opacity-50 disabled:cursor-not-allowed shrink-0 shadow-xs"
        >
          {loading ? <Loader2 size={13} className="animate-spin" /> : <UserCheck size={13} />}
          Check-in
        </button>
      )}
    </div>
  );
}

interface CheckinScannerProps {
  inscritos: Inscrito[];
}

export function CheckinScanner({ inscritos: initialInscritos }: CheckinScannerProps) {
  const router = useRouter();
  const [inscritos, setInscritos] = useState<Inscrito[]>(initialInscritos);
  const [busca, setBusca] = useState('');
  const [scanResult, setScanResult] = useState<ScanResult | null>(null);
  const [loadingId, setLoadingId] = useState<string | null>(null);
  const [simulando, setSimulando] = useState(false);

  const buscaFiltrada = busca.trim()
    ? inscritos.filter((i) => {
        const q = busca.toLowerCase();
        return (
          i.nome.toLowerCase().includes(q) ||
          i.cpf.includes(q) ||
          i.codigoIngresso.toLowerCase().includes(q)
        );
      })
    : [];

  async function processarCheckin(id: string): Promise<ScanResult> {
    const inscrito = inscritos.find((i) => i.id === id);
    if (!inscrito) return { tipo: 'erro', mensagem: 'Ingresso não encontrado no sistema.' };

    const resultado = await realizarCheckin(id);

    if (resultado.tipo === 'erro') {
      return { tipo: 'erro', mensagem: resultado.mensagem };
    }

    const atualizado: Inscrito = {
      ...inscrito,
      checkin: true,
      checkinAt: resultado.checkinAt,
    };

    if (resultado.tipo === 'sucesso') {
      setInscritos((prev) => prev.map((i) => (i.id === id ? atualizado : i)));
      router.refresh();
    }

    return { tipo: resultado.tipo, inscrito: atualizado };
  }

  async function handleCheckinManual(id: string) {
    setLoadingId(id);
    const result = await processarCheckin(id);
    setLoadingId(null);
    setScanResult(result);
    setBusca('');
  }

  async function handleSimularQR() {
    setSimulando(true);
    setScanResult(null);

    await new Promise((r) => setTimeout(r, 800));

    const semCheckin = inscritos.filter((i) => !i.checkin && i.status !== 'cancelado');
    if (semCheckin.length === 0) {
      setScanResult({ tipo: 'erro', mensagem: 'Nenhum ingresso pendente de check-in.' });
      setSimulando(false);
      return;
    }

    const alvo = semCheckin[Math.floor(Math.random() * semCheckin.length)];
    const result = await processarCheckin(alvo.id);
    setScanResult(result);
    setSimulando(false);
  }

  const totalCheckin = inscritos.filter((i) => i.checkin).length;
  const totalAtivos = inscritos.filter((i) => i.status !== 'cancelado').length;
  const pct = totalAtivos > 0 ? Math.round((totalCheckin / totalAtivos) * 100) : 0;

  return (
    <div className="max-w-sm mx-auto space-y-5">
      <div className="bg-card border border-border rounded-2xl p-5 space-y-3 shadow-sm">
        <div className="flex items-center justify-between text-sm">
          <span className="font-semibold text-muted">Credenciados hoje</span>
          <span className="font-bold text-foreground">{totalCheckin} / {totalAtivos}</span>
        </div>
        <div className="h-2.5 bg-background-tertiary rounded-full overflow-hidden">
          <div
            className="h-full bg-primary rounded-full transition-all duration-500"
            style={{ width: `${pct}%` }}
          />
        </div>
        <p className="text-xs text-muted text-right font-medium">{pct}% credenciados</p>
      </div>

      {scanResult && (
        <ResultCard result={scanResult} onDismiss={() => setScanResult(null)} />
      )}

      {!scanResult && (
        <button
          type="button"
          onClick={handleSimularQR}
          disabled={simulando}
          className="w-full flex flex-col items-center justify-center gap-3 py-8 rounded-2xl border-2 border-dashed border-primary/25 bg-primary/5 hover:bg-primary/10 transition-all cursor-pointer disabled:opacity-60"
        >
          {simulando ? (
            <>
              <Loader2 size={36} className="text-primary animate-spin" strokeWidth={1.8} />
              <span className="text-xs font-semibold text-primary">Lendo QR Code…</span>
            </>
          ) : (
            <>
              <QrCode size={36} className="text-primary" strokeWidth={1.8} />
              <span className="text-xs font-bold text-primary">Ler QR Code do Ingresso</span>
              <span className="text-xs text-muted-subtle">Toque para abrir a câmera</span>
            </>
          )}
        </button>
      )}

      <div className="space-y-3">
        <p className="text-xs font-semibold text-muted-subtle uppercase tracking-wider">Ou busque manualmente</p>

        <div className="relative">
          <Search size={15} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-muted-subtle pointer-events-none" />
          <input
            type="text"
            className="input-base pl-10"
            placeholder="Nome, CPF ou código do ingresso…"
            value={busca}
            onChange={(e) => setBusca(e.target.value)}
          />
        </div>

        {buscaFiltrada.length > 0 && (
          <div className="space-y-2 pt-1">
            {buscaFiltrada.map((inscrito) => (
              <CardInscrito
                key={inscrito.id}
                inscrito={inscrito}
                onCheckin={handleCheckinManual}
                loading={loadingId === inscrito.id}
              />
            ))}
          </div>
        )}

        {busca.trim() && buscaFiltrada.length === 0 && (
          <p className="text-center text-xs text-muted py-4">
            Nenhum inscrito encontrado.
          </p>
        )}
      </div>
    </div>
  );
}