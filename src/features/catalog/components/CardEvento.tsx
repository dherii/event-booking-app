'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { MapPin, Heart, ArrowRight } from 'lucide-react';
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

const CORES_CATEGORIA: Record<string, string> = {
  'Universitário': 'bg-accent-purple/90 text-white border-accent-purple/40',
  'Pub / Bar':     'bg-orange-500/90 text-white border-orange-400/40',
  Sunset:          'bg-yellow-400/90 text-black border-yellow-300/40',
  Festa:           'bg-accent-pink/90 text-white border-accent-pink/40',
  Show:            'bg-primary/90 text-primary-fg border-primary/40',
};

const PALETA_FALLBACK = [
  'bg-accent-purple/90 text-white border-accent-purple/40',
  'bg-accent-pink/90 text-white border-accent-pink/40',
  'bg-orange-500/90 text-white border-orange-400/40',
  'bg-primary/90 text-primary-fg border-primary/40',
  'bg-yellow-400/90 text-black border-yellow-300/40',
];

function corCategoria(categoria: string) {
  if (CORES_CATEGORIA[categoria]) return CORES_CATEGORIA[categoria];
  const hash = Array.from(categoria).reduce((acc, c) => acc + c.charCodeAt(0), 0);
  return PALETA_FALLBACK[hash % PALETA_FALLBACK.length];
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
    <article className="group relative flex h-full flex-col overflow-hidden rounded-3xl border border-border/80 bg-card shadow-card transition-all duration-300 hover:-translate-y-1.5 hover:border-primary/40 hover:shadow-card-hover">

      <div
        onClick={irParaEvento}
        role="button"
        tabIndex={0}
        onKeyDown={(e) => {
          if (e.key === 'Enter' || e.key === ' ') irParaEvento();
        }}
        className="relative aspect-[4/3] w-full cursor-pointer overflow-hidden bg-background-secondary"
      >
        {evento.banner_url ? (
          // eslint-disable-next-line @next/next/no-img-element
          <img
            src={evento.banner_url}
            alt={evento.nome}
            className="event-image h-full w-full object-cover transition-transform duration-500 group-hover:scale-105"
          />
        ) : (
          <div className="h-full w-full bg-gradient-to-br from-accent-purple/30 via-card to-accent-pink/30" />
        )}

        <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/10 to-transparent" />

        {/* Data Badge */}
        <div className="absolute left-3.5 top-3.5 min-w-[56px] rounded-2xl border border-white/15 bg-black/60 px-2.5 py-2 text-center leading-none backdrop-blur-md shadow-sm">
          <p className="text-xs font-black text-primary">{dia}</p>
          <p className="mt-1 text-[10px] font-extrabold text-white">{mes}</p>
          <p className="mt-1 text-[9px] font-semibold text-white/70">{hora}</p>
        </div>

        {/* Categoria Badge */}
        {evento.categoria && (
          <span className={`absolute right-3.5 top-3.5 rounded-full border px-3 py-1 text-[10px] font-extrabold uppercase tracking-wide backdrop-blur-md ${corCategoria(evento.categoria)} shadow-sm`}>
            {evento.categoria}
          </span>
        )}

        {/* Urgência */}
        {poucosIngressos && (
          <span className="badge-urgency absolute bottom-3.5 left-3.5 px-2.5 py-1 text-[10px]">
            Últimos ingressos
          </span>
        )}

        {/* Favorito */}
        <button
          type="button"
          aria-label="Favoritar evento"
          onClick={handleFavoritar}
          disabled={favoritando}
          className="absolute bottom-3.5 right-3.5 flex h-10 w-10 items-center justify-center rounded-full border border-white/20 bg-black/50 text-white backdrop-blur-md transition-all hover:scale-110 hover:border-white/40 disabled:opacity-70 shadow-sm"
        >
          <Heart size={18} fill={favorito ? 'currentColor' : 'none'} className={favorito ? 'text-accent-pink' : ''} />
        </button>
      </div>

      <div className="flex flex-1 flex-col p-5">
        <button onClick={irParaEvento} className="text-left">
          <h2 className="line-clamp-2 font-bold leading-snug text-foreground transition-colors group-hover:text-primary text-base">
            {evento.nome}
          </h2>
        </button>

        {(evento.local || estabelecimento?.nome) && (
          <p className="mt-2.5 flex items-center gap-2 truncate text-xs text-muted font-medium">
            <MapPin size={14} className="shrink-0 text-primary" />
            <span className="truncate">{evento.local || estabelecimento?.nome}</span>
          </p>
        )}

        <div className="mt-5 mb-5 flex items-baseline justify-between border-t border-border/60 pt-4">
          <div>
            <p className="text-[10px] font-bold uppercase tracking-wider text-muted-subtle">A partir de</p>
            <p className="event-price mt-0.5 text-xl font-black">{precoFormatado}</p>
          </div>
        </div>

        <button
          onClick={handleComprar}
          disabled={esgotado || loading}
          className={`mt-auto flex min-h-[46px] w-full items-center justify-center gap-2 rounded-2xl px-4 py-3 text-xs font-black uppercase tracking-wide transition-all ${
            esgotado || loading
              ? 'cursor-not-allowed bg-border text-muted-subtle shadow-none'
              : 'bg-primary text-primary-fg shadow-neon hover:bg-primary-hover active:scale-[0.98]'
          }`}
        >
          {loading ? 'Processando...' : esgotado ? 'Esgotado' : (
            <>
              Garantir Ingresso
              <ArrowRight size={16} strokeWidth={2.5} />
            </>
          )}
        </button>
      </div>
    </article>
  );
}