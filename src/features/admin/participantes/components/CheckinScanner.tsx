// src/features/admin/participantes/components/CheckinScanner.tsx
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
      <div className="bg-rose-50 border border-rose-200 rounded-2xl p-5 text-center space-y-3 animate-in fade-in slide-in-from-bottom-2 duration-300">
        <div className="w-12 h-12 rounded-full bg-rose-100 flex items-center justify-center mx-auto">
          <XCircle size={26} className="text-rose-600" />
        </div>
        <div>
          <p className="font-semibold text-rose-900 text-sm">Não foi possível fazer check-in</p>
          <p className="text-xs text-rose-600 mt-1">{result.mensagem}</p>
        </div>
        <button
          onClick={onDismiss}
          className="w-full py-2.5 rounded-xl border border-rose-300 bg-white text-rose-700 text-xs font-semibold hover:bg-rose-50 transition-all cursor-pointer"
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
        jaFeito ? 'bg-amber-50/80 border-amber-200' : 'bg-emerald-50/80 border-emerald-200'
      }`}
    >
      <div
        className={`w-12 h-12 rounded-full flex items-center justify-center mx-auto ${
          jaFeito ? 'bg-amber-100' : 'bg-emerald-100'
        }`}
      >
        {jaFeito ? (
          <UserCheck size={26} className="text-amber-700" />
        ) : (
          <CheckCircle size={26} className="text-emerald-600" />
        )}
      </div>

      <div>
        <p className={`font-semibold text-base ${jaFeito ? 'text-amber-900' : 'text-emerald-900'}`}>
          {jaFeito ? 'Check-in já realizado' : 'Check-in confirmado!'}
        </p>
        <p className="text-sm font-medium text-slate-900 mt-2">{inscrito.nome}</p>
        <p className="text-xs text-slate-500">{inscrito.evento} · {inscrito.atividade}</p>
        <p className="text-xs text-slate-400 mt-0.5">{inscrito.lote}</p>
      </div>

      {jaFeito && inscrito.checkinAt && (
        <p className="text-xs text-amber-700 font-medium">
          Registrado às {new Date(inscrito.checkinAt).toLocaleTimeString('pt-BR', { hour: '2-digit', minute: '2-digit' })}
        </p>
      )}

      <button
        onClick={onDismiss}
        className={`w-full py-2.5 rounded-xl text-xs font-semibold transition-all cursor-pointer ${
          jaFeito
            ? 'bg-white border border-amber-300 text-amber-800 hover:bg-amber-100/50'
            : 'bg-emerald-600 text-white hover:bg-emerald-700 shadow-xs'
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
    <div className="bg-white border border-slate-200/80 rounded-xl flex items-center gap-3 px-4 py-3 shadow-xs">
      <div className="w-9 h-9 rounded-full bg-blue-50 border border-blue-100 text-blue-600 text-xs font-bold flex items-center justify-center shrink-0">
        {inscrito.nome.charAt(0).toUpperCase()}
      </div>

      <div className="flex-1 min-w-0">
        <p className="text-sm font-medium text-slate-900 truncate">{inscrito.nome}</p>
        <p className="text-xs text-slate-500 truncate">{inscrito.evento} · {inscrito.lote}</p>
      </div>

      {inscrito.checkin ? (
        <span className="flex items-center gap-1 text-xs text-emerald-600 font-semibold shrink-0">
          <CheckCircle size={14} />
          Feito
        </span>
      ) : (
        <button
          type="button"
          onClick={() => onCheckin(inscrito.id)}
          disabled={loading || inscrito.status === 'cancelado'}
          className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-blue-600 text-white text-xs font-semibold hover:bg-blue-700 transition-all cursor-pointer disabled:opacity-50 disabled:cursor-not-allowed shrink-0 shadow-xs"
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
      <div className="bg-white border border-slate-200/80 rounded-2xl p-5 space-y-3 shadow-sm">
        <div className="flex items-center justify-between text-sm">
          <span className="font-semibold text-slate-700">Credenciados hoje</span>
          <span className="font-bold text-slate-900">{totalCheckin} / {totalAtivos}</span>
        </div>
        <div className="h-2.5 bg-slate-100 rounded-full overflow-hidden">
          <div
            className="h-full bg-blue-600 rounded-full transition-all duration-500"
            style={{ width: `${pct}%` }}
          />
        </div>
        <p className="text-xs text-slate-500 text-right font-medium">{pct}% credenciados</p>
      </div>

      {scanResult && (
        <ResultCard result={scanResult} onDismiss={() => setScanResult(null)} />
      )}

      {!scanResult && (
        <button
          type="button"
          onClick={handleSimularQR}
          disabled={simulando}
          className="w-full flex flex-col items-center justify-center gap-3 py-8 rounded-2xl border-2 border-dashed border-blue-200 bg-blue-50/50 hover:bg-blue-50/80 transition-all cursor-pointer disabled:opacity-60"
        >
          {simulando ? (
            <>
              <Loader2 size={36} className="text-blue-600 animate-spin" strokeWidth={1.8} />
              <span className="text-xs font-semibold text-blue-600">Lendo QR Code…</span>
            </>
          ) : (
            <>
              <QrCode size={36} className="text-blue-600" strokeWidth={1.8} />
              <span className="text-xs font-bold text-blue-600">Ler QR Code do Ingresso</span>
              <span className="text-xs text-slate-400">Toque para abrir a câmera</span>
            </>
          )}
        </button>
      )}

      <div className="space-y-3">
        <p className="text-xs font-semibold text-slate-400 uppercase tracking-wider">Ou busque manualmente</p>

        <div className="relative">
          <Search size={15} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400 pointer-events-none" />
          <input
            type="text"
            className="w-full bg-white border border-slate-200 rounded-xl pl-10 pr-3.5 py-2.5 text-sm text-slate-900 placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 transition-all shadow-xs"
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
          <p className="text-center text-xs text-slate-500 py-4">
            Nenhum inscrito encontrado.
          </p>
        )}
      </div>
    </div>
  );
}