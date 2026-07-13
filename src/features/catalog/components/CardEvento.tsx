'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { createSupabaseBrowserClient } from '@/src/config/supabase-browser';

interface Lote {
  id: string;
  preco: number;
  quantidade_disponivel: number;
}

interface Estabelecimento {
  id: string;
  nome: string;
  slug: string;
  logo_url: string | null;
}

interface Evento {
  id: string;
  nome: string;
  descricao: string;
  categoria?: string | null;
  estabelecimentos?: Estabelecimento | Estabelecimento[] | null;
  lotes?: Lote[];
}

interface CardEventoProps {
  evento: Evento;
}

export default function CardEvento({ evento }: CardEventoProps) {
  const router = useRouter();
  const [loading, setLoading] = useState(false);

  const loteAtivo = evento.lotes?.[0];

  const precoFormatado = loteAtivo
    ? Number(loteAtivo.preco) === 0
      ? 'Grátis'
      : `R$ ${Number(loteAtivo.preco).toFixed(2)}`
    : 'Não informado';

  const esgotado = loteAtivo
    ? loteAtivo.quantidade_disponivel <= 0
    : true;

  async function handleComprar() {
    if (!loteAtivo) return;

    setLoading(true);

    try {
      // Confere sessão no client antes de bater na API — evita um round-trip
      // desnecessário quando já sabemos que o usuário não está logado.
      const supabase = createSupabaseBrowserClient();
      const { data: { session } } = await supabase.auth.getSession();

      if (!session) {
        const redirectTo = `/eventos/${evento.id}`; // volta pra cá depois do login
        router.push(`/auth/login?redirect=${encodeURIComponent(redirectTo)}`);
        return;
      }

      const response = await fetch('/api/checkout', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          loteId: loteAtivo.id,
        }),
      });

      const dados: {
        error?: string;
        requiresLogin?: boolean;
        message?: string;
        txid?: string;
        inscricaoId?: string;
      } = await response.json();

      if (!response.ok) {
        if (dados.requiresLogin) {
          router.push(`/auth/login?redirect=${encodeURIComponent(`/eventos/${evento.id}`)}`);
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

    } catch (err: unknown) {
      console.error(err);
      alert('Erro na conexão com o servidor.');
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="bg-gray-900 border border-gray-800 rounded-xl p-6 hover:border-gray-700 transition-all flex flex-col justify-between">
      <div>
        <span className="text-xs font-semibold bg-blue-500/10 text-blue-400 px-2.5 py-1 rounded-full uppercase tracking-wider">
          {evento.categoria
            || (Array.isArray(evento.estabelecimentos)
                ? evento.estabelecimentos[0]?.nome
                : evento.estabelecimentos?.nome)
            || 'Evento'}
        </span>

        <h2 className="text-xl font-bold mt-3 text-white">
          {evento.nome}
        </h2>

        <p className="text-gray-400 text-sm mt-2 line-clamp-3">
          {evento.descricao}
        </p>
      </div>

      <div className="mt-6 pt-4 border-t border-gray-800/60">
        <div className="flex justify-between items-center mb-4">
          <span className="text-xs text-gray-500">
            Restam: {loteAtivo?.quantidade_disponivel ?? 0} vagas
          </span>

          <span className="text-lg font-bold text-green-400">
            {precoFormatado}
          </span>
        </div>

        <button
          onClick={handleComprar}
          disabled={esgotado || loading}
          className={`w-full py-2.5 px-4 rounded-lg font-semibold text-sm transition-all ${
            esgotado || loading
              ? 'bg-gray-800 text-gray-500 cursor-not-allowed'
              : 'bg-blue-600 hover:bg-blue-500 text-white active:scale-[0.98]'
          }`}
        >
          {loading
            ? 'Processando...'
            : esgotado
            ? 'Esgotado'
            : 'Garantir Ingresso'}
        </button>
      </div>
    </div>
  );
}
