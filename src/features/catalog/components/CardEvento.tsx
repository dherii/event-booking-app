'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { MapPin, Heart, ArrowRight, CalendarDays } from 'lucide-react';
import { createSupabaseBrowserClient } from '@/src/config/supabase-browser';
import { toggleFavorito } from '../actions';

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
  local?: string | null;
  data_inicio: string;
  banner_url?: string | null;
  estabelecimentos?: Estabelecimento | Estabelecimento[] | null;
  lotes?: Lote[];
}

interface CardEventoProps {
  evento: Evento;
  favoritadoInicial?: boolean;
}

function formatarDataBadge(iso: string) {
  const d = new Date(iso);
  return {
    dia: d.toLocaleDateString('pt-BR', { day: '2-digit' }),
    mes: d.toLocaleDateString('pt-BR', { month: 'short' }).replace('.', '').toUpperCase(),
    hora: d.toLocaleTimeString('pt-BR', { hour: '2-digit', minute: '2-digit' }).replace(':', 'H'),
  };
}

export default function CardEvento({ evento, favoritadoInicial = false }: CardEventoProps) {
  const router = useRouter();
  const [loading, setLoading] = useState(false);
  const [favorito, setFavorito] = useState(favoritadoInicial);
  const [favoritando, setFavoritando] = useState(false);

  const loteAtivo = evento.lotes?.[0];
  const estabelecimento = Array.isArray(evento.estabelecimentos)
    ? evento.estabelecimentos[0]
    : evento.estabelecimentos;

  const precoFormatado = loteAtivo
    ? Number(loteAtivo.preco) === 0
      ? 'Grátis'
      : Number(loteAtivo.preco).toLocaleString('pt-BR', { style: 'currency', currency: 'BRL' })
    : 'Não informado';

  const quantidadeDisponivel = loteAtivo ? loteAtivo.quantidade_disponivel : 0;
  const esgotado = quantidadeDisponivel <= 0;
  const poucosIngressos = quantidadeDisponivel > 0 && quantidadeDisponivel <= 10;

  const { dia, mes, hora } = formatarDataBadge(evento.data_inicio);

  function irParaEvento() {
    router.push(`/eventos/${evento.id}`);
  }

  async function handleFavoritar(e: React.MouseEvent) {
    e.stopPropagation();
    if (favoritando) return;

    const supabase = createSupabaseBrowserClient();
    const { data: { session } } = await supabase.auth.getSession();

    if (!session) {
      router.push(`/auth/login?redirect=${encodeURIComponent(`/eventos/${evento.id}`)}`);
      return;
    }

    setFavoritando(true);
    const anterior = favorito;
    setFavorito(!anterior);

    try {
      const resultado = await toggleFavorito(evento.id);
      setFavorito(resultado.favoritado);
    } catch {
      setFavorito(anterior);
    } finally {
      setFavoritando(false);
    }
  }

  async function handleComprar() {
    if (!loteAtivo) return;
    setLoading(true);

    try {
      const supabase = createSupabaseBrowserClient();
      const { data: { session } } = await supabase.auth.getSession();

      if (!session) {
        router.push(`/auth/login?redirect=${encodeURIComponent(`/eventos/${evento.id}`)}`);
        return;
      }

      const response = await fetch('/api/checkout', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ loteId: loteAtivo.id }),
      });

      const dados: { error?: string; requiresLogin?: boolean; inscricaoId?: string } = await response.json();

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
      }
    } catch (err) {
      console.error(err);
      alert('Erro na conexão com o servidor.');
    } finally {
      setLoading(false);
    }
  }

  return (
    <article className="group relative flex flex-col overflow-hidden rounded-2xl border border-border bg-card transition-shadow duration-200 hover:shadow-card-hover sm:flex-row sm:items-stretch">

      {/* Imagem — "canhoto" do ticket. Empilhada no mobile, coluna fixa a partir de sm */}
      <div
        onClick={irParaEvento}
        role="button"
        tabIndex={0}
        onKeyDown={(e) => {
          if (e.key === 'Enter' || e.key === ' ') irParaEvento();
        }}
        className="relative aspect-[16/10] w-full shrink-0 cursor-pointer overflow-hidden bg-background-tertiary sm:aspect-auto sm:w-[38%] sm:min-w-[136px] sm:max-w-[220px]"
      >
        {evento.banner_url ? (
          // eslint-disable-next-line @next/next/no-img-element
          <img
            src={evento.banner_url}
            alt={evento.nome}
            className="event-image absolute inset-0 h-full w-full object-cover"
          />
        ) : (
          <div className="absolute inset-0 bg-gradient-to-br from-accent-purple/15 via-card to-accent-pink/15" />
        )}

        <div className="absolute inset-0 bg-gradient-to-t from-black/30 via-transparent to-transparent" />

        {/* Data */}
        <div className="absolute left-2.5 top-2.5 rounded-md bg-white/95 px-2 py-1 leading-none shadow-sm">
          <p className="text-[10px] font-semibold text-zinc-900">{dia} {mes}</p>
        </div>

        {/* Urgência */}
        {poucosIngressos && (
          <span className="badge-urgency absolute bottom-2.5 left-2.5">
            Últimos ingressos
          </span>
        )}
      </div>

      {/* Divisor pontilhado — detalhe de "talão de ingresso", só no layout horizontal */}
      <div
        aria-hidden
        className="hidden w-px shrink-0 self-stretch bg-[repeating-linear-gradient(to_bottom,var(--border)_0,var(--border)_6px,transparent_6px,transparent_12px)] sm:block"
      />

      {/* Conteúdo */}
      <div className="flex flex-1 min-w-0 flex-col gap-3 p-4">
        <div className="flex items-start justify-between gap-2">
          <button onClick={irParaEvento} className="min-w-0 text-left">
            {evento.categoria && (
              <p className="mb-0.5 text-[10px] font-semibold uppercase tracking-wider text-primary/80">
                {evento.categoria}
              </p>
            )}
            <h2 className="line-clamp-2 text-[15px] font-semibold leading-snug tracking-tight text-foreground transition-colors group-hover:text-primary">
              {evento.nome}
            </h2>
          </button>

          <button
            type="button"
            aria-label="Favoritar evento"
            onClick={handleFavoritar}
            disabled={favoritando}
            className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full text-zinc-400 transition-colors -mr-1.5 -mt-1 hover:bg-background-secondary hover:text-zinc-600 disabled:opacity-70"
          >
            <Heart size={17} fill={favorito ? 'currentColor' : 'none'} className={favorito ? 'text-accent-pink' : ''} />
          </button>
        </div>

        <div className="flex flex-wrap items-center gap-x-3 gap-y-1 text-xs font-medium text-zinc-500">
          <span className="flex shrink-0 items-center gap-1">
            <CalendarDays size={12} className="shrink-0 text-muted-subtle" />
            {dia} {mes} · {hora}
          </span>
          {(evento.local || estabelecimento?.nome) && (
            <span className="flex min-w-0 flex-1 items-center gap-1">
              <MapPin size={12} className="shrink-0 text-muted-subtle" />
              <span className="truncate">{evento.local || estabelecimento?.nome}</span>
            </span>
          )}
        </div>

        <div className="mt-auto flex flex-col gap-2.5 pt-1 sm:flex-row sm:items-center sm:justify-between">
          <div>
            <p className="text-[10px] font-medium uppercase tracking-wide text-muted-subtle">A partir de</p>
            <p className="text-base font-semibold text-foreground">{precoFormatado}</p>
          </div>

          <button
            onClick={handleComprar}
            disabled={esgotado || loading}
            className={`inline-flex min-h-11 w-full items-center justify-center gap-1.5 rounded-lg border px-4 text-xs font-semibold uppercase tracking-wide transition-colors sm:w-auto ${esgotado || loading
              ? 'cursor-not-allowed border-border text-muted-subtle'
              : 'border-border text-foreground hover:border-primary/50 hover:bg-primary/5 hover:text-primary active:bg-primary/10'
              }`}
          >
            {loading ? 'Processando...' : esgotado ? 'Esgotado' : (
              <>
                Garantir Ingresso
                <ArrowRight size={14} strokeWidth={2.25} />
              </>
            )}
          </button>
        </div>
      </div>
    </article>
  );
}