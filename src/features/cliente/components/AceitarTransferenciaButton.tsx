// src/features/cliente/components/AceitarTransferenciaButton.tsx
'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { Loader2, CheckCircle } from 'lucide-react';
import { aceitarTransferencia } from '../actions';

export function AceitarTransferenciaButton({ token }: { token: string }) {
  const router = useRouter();
  const [loading, setLoading] = useState(false);
  const [erro, setErro] = useState<string | null>(null);
  const [sucesso, setSucesso] = useState(false);

  async function handleAceitar() {
    setLoading(true);
    setErro(null);

    try {
      await aceitarTransferencia(token);
      setSucesso(true);
      setTimeout(() => router.push('/minhas-inscricoes'), 1200);
    } catch (err) {
      setErro(err instanceof Error ? err.message : 'Erro ao aceitar a transferência.');
      setLoading(false);
    }
  }

  if (sucesso) {
    return (
      <div className="flex flex-col items-center gap-2 text-green-400">
        <CheckCircle size={28} />
        <p className="text-sm font-medium">Ingresso transferido! Redirecionando…</p>
      </div>
    );
  }

  return (
    <div className="space-y-2">
      {erro && (
        <p className="text-sm text-red-400 bg-red-900/20 border border-red-900/40 rounded-lg px-3 py-2">
          {erro}
        </p>
      )}
      <button
        onClick={handleAceitar}
        disabled={loading}
        className="w-full flex items-center justify-center gap-2 bg-blue-600 hover:bg-blue-500 text-white font-semibold py-2.5 rounded-lg transition-all active:scale-[0.99] disabled:opacity-50"
      >
        {loading ? <Loader2 size={16} className="animate-spin" /> : null}
        {loading ? 'Aceitando…' : 'Aceitar ingresso'}
      </button>
    </div>
  );
}
