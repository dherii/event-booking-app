'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { createSupabaseBrowserClient } from '@/src/config/supabase-browser';

interface BotaoComprarLoteProps {
  eventoId: string;
  loteId: string;
  esgotado: boolean;
  label?: string;
  className?: string;
}

export default function BotaoComprarLote({
  eventoId,
  loteId,
  esgotado,
  label = 'Garantir',
  className = '',
}: BotaoComprarLoteProps) {
  const router = useRouter();
  const [loading, setLoading] = useState(false);

  async function handleComprar() {
    setLoading(true);

    try {
      const supabase = createSupabaseBrowserClient();
      const { data: { session } } = await supabase.auth.getSession();

      if (!session) {
        const redirectTo = `/eventos/${eventoId}`;
        router.push(`/auth/login?redirect=${encodeURIComponent(redirectTo)}`);
        return;
      }

      const response = await fetch('/api/checkout', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ loteId }),
      });

      const dados: {
        error?: string;
        requiresLogin?: boolean;
        inscricaoId?: string;
      } = await response.json();

      if (!response.ok) {
        if (dados.requiresLogin) {
          router.push(`/auth/login?redirect=${encodeURIComponent(`/eventos/${eventoId}`)}`);
          return;
        }
        alert(dados.error || 'Erro ao realizar inscrição');
        return;
      }

      if (dados.inscricaoId) {
        router.push(`/checkout/${dados.inscricaoId}`);
      } else {
        alert('Inscrição gerada, mas o identificador não foi retornado.');
      }
    } catch (err) {
      console.error(err);
      alert('Erro na conexão com o servidor.');
    } finally {
      setLoading(false);
    }
  }

  return (
    <button
      onClick={handleComprar}
      disabled={esgotado || loading}
      className={`py-2.5 px-4 rounded-lg font-semibold text-sm transition-all ${
        esgotado || loading
          ? 'bg-gray-800 text-gray-500 cursor-not-allowed'
          : 'bg-blue-600 hover:bg-blue-500 text-white active:scale-[0.98]'
      } ${className}`}
    >
      {loading ? 'Processando...' : esgotado ? 'Esgotado' : label}
    </button>
  );
}
