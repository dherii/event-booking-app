'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { createSupabaseBrowserClient } from '@/src/config/supabase-browser';
import { ArrowRight, Loader2 } from 'lucide-react';

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
  label = 'Garantir Ingresso',
  className = '',
}: BotaoComprarLoteProps) {
  const router = useRouter();
  const [loading, setLoading] = useState(false);

  async function handleComprar() {
    setLoading(true);

    try {
      const supabase = createSupabaseBrowserClient();

      const {
        data: { session },
      } = await supabase.auth.getSession();

      if (!session) {
        const redirectTo = `/eventos/${eventoId}`;
        router.push(`/auth/login?redirect=${encodeURIComponent(redirectTo)}`);
        return;
      }

      const response = await fetch('/api/checkout', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          loteId,
        }),
      });

      const dados: {
        error?: string;
        requiresLogin?: boolean;
        inscricaoId?: string;
        checkoutUrl?: string; 
      } = await response.json();

      if (!response.ok) {
        if (dados.requiresLogin) {
          router.push(`/auth/login?redirect=${encodeURIComponent(`/eventos/${eventoId}`)}`);
          return;
        }
        alert(dados.error || 'Erro ao realizar inscrição');
        return;
      }

      if (dados.checkoutUrl) {
        // Redireciona o usuário para a página segura do Mercado Pago
        window.location.href = dados.checkoutUrl;
      } else if (dados.inscricaoId) {
        // Fallback para ingressos gratuitos que não passam pelo gateway
        router.push(`/checkout/${dados.inscricaoId}?status=pago`);
      } else {
        alert('Erro: Link de pagamento não retornado.');
      }

    } catch (err) {
      console.error(err);
      alert('Erro na conexão com o servidor.');
    } finally {
      setLoading(false);
    }
  }

  const desabilitado = esgotado || loading;

  return (
    <button
      onClick={handleComprar}
      disabled={desabilitado}
      className={`
        inline-flex min-h-[48px] w-full items-center justify-center gap-2.5
        rounded-2xl px-5 py-3 text-xs font-black uppercase tracking-wider
        transition-all duration-200

        ${desabilitado
            ? 'cursor-not-allowed bg-border text-muted-subtle shadow-none'
            : 'bg-primary text-primary-fg shadow-neon hover:bg-primary-hover active:scale-[0.98]'
        }

        ${className}
      `}
    >
      {loading ? (
        <>
          <Loader2 size={16} className="animate-spin" />
          Processando...
        </>
      ) : esgotado ? (
        'Esgotado'
      ) : (
        <>
          {label}
          <ArrowRight size={16} strokeWidth={2.5} />
        </>
      )}
    </button>
  );
}