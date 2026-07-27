'use client';

import { useMemo, useState } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import {
  MapPin, Zap, ChevronRight, CalendarDays, GraduationCap, Beer, Home, Navigation, ArrowUpDown,
} from 'lucide-react';
import CardEvento from './CardEvento';

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

function ehHoje(iso: string) {
  const hoje = new Date();
  const data = new Date(iso);
  return data.toDateString() === hoje.toDateString();
}

export function CatalogoClient({ eventos, favoritosIds = [] }: { eventos: Evento[]; favoritosIds?: string[] }) {
  const router = useRouter();
  const searchParams = useSearchParams();
  const [filtro, setFiltro] = useState('Tudo');
  const [ordem, setOrdem] = useState<'recentes' | 'proximos' | 'baratos'>('recentes');

  const busca = (searchParams.get('q') ?? '').toLowerCase().trim();

  const categorias = useMemo(() => {
    const unicas = Array.from(new Set(eventos.map((e) => e.categoria).filter(Boolean))) as string[];
    return ['Tudo', 'Hoje', ...unicas];
  }, [eventos]);

  const eventosFiltrados = useMemo(() => {
    let lista = eventos;

    if (filtro === 'Hoje') {
      lista = lista.filter((e) => ehHoje(e.data_inicio));
    } else if (filtro !== 'Tudo') {
      lista = lista.filter((e) => e.categoria === filtro);
    }

    if (busca) {
      lista = lista.filter((e) => {
        const estabelecimento = Array.isArray(e.estabelecimentos) ? e.estabelecimentos[0] : e.estabelecimentos;
        return (
          e.nome.toLowerCase().includes(busca) ||
          (e.local ?? '').toLowerCase().includes(busca) ||
          (e.categoria ?? '').toLowerCase().includes(busca) ||
          (estabelecimento?.nome ?? '').toLowerCase().includes(busca)
        );
      });
    }

    // Ordenação — "recentes" já vem assim do servidor (order by created_at),
    // então só precisamos reordenar quando o usuário escolher outra coisa.
    if (ordem === 'proximos') {
      lista = [...lista].sort((a, b) => new Date(a.data_inicio).getTime() - new Date(b.data_inicio).getTime());
    } else if (ordem === 'baratos') {
      const menorPreco = (e: Evento) => Math.min(...(e.lotes?.map((l) => Number(l.preco)) ?? [Infinity]));
      lista = [...lista].sort((a, b) => menorPreco(a) - menorPreco(b));
    }

    return lista;
  }, [eventos, filtro, busca, ordem]);

  const destaque = eventos[0];
  const dataHero = destaque
    ? new Date(destaque.data_inicio).toLocaleDateString('pt-BR', { weekday: 'short', day: '2-digit', month: 'short' })
    : '';

  function IconeFiltro({ categoria }: { categoria: string }) {
    if (categoria === 'Hoje') return <CalendarDays size={15} />;
    if (categoria === 'Universitário') return <GraduationCap size={15} />;
    if (categoria === 'Pub / Bar') return <Beer size={15} />;
    if (categoria === 'Festa') return <Home size={15} />;
    if (categoria === 'Perto de mim') return <Navigation size={15} />;
    return null;
  }

  return (
    <div className="space-y-8">

      {/* Hero — só mostra se não tiver busca ativa, pra não confundir com resultado filtrado */}
      {destaque && !busca && (
        <button
          onClick={() => router.push(`/eventos/${destaque.id}`)}
          className="group relative block h-[280px] w-full overflow-hidden rounded-3xl border border-border text-left shadow-card transition-all duration-300 hover:border-accent-purple/60 hover:shadow-purple sm:h-[360px]"
        >
          {destaque.banner_url ? (
            // eslint-disable-next-line @next/next/no-img-element
            <img
              src={destaque.banner_url}
              alt={destaque.nome}
              className="absolute inset-0 h-full w-full object-cover transition-transform duration-700 group-hover:scale-105"
            />
          ) : (
            <div className="absolute inset-0 bg-gradient-to-br from-accent-purple/60 via-background-secondary to-accent-pink/50" />
          )}

          <div className="absolute inset-0 bg-gradient-to-t from-black via-black/50 to-black/10" />

          <div className="absolute inset-x-0 bottom-0 p-5 sm:p-8">
            <span className="block text-xs font-black uppercase tracking-wider text-primary">{dataHero}</span>
            <h1 className="mt-2 max-w-2xl text-3xl font-black leading-none text-white sm:text-5xl">{destaque.nome}</h1>
            {destaque.local && (
              <p className="mt-3 flex items-center gap-1.5 text-sm text-white/70">
                <MapPin size={15} />
                {destaque.local}
              </p>
            )}
            <span className="mt-5 inline-flex items-center gap-2 rounded-xl bg-primary px-5 py-3 text-xs font-black uppercase tracking-wide text-primary-fg shadow-neon transition-all group-hover:bg-primary-hover">
              Garantir Ingresso
              <ChevronRight size={16} />
            </span>
          </div>
        </button>
      )}

      {/* Filtros */}
      <div className="-mx-1 flex gap-2 overflow-x-auto px-1 pb-2 [scrollbar-width:none] [&::-webkit-scrollbar]:hidden">
        {categorias.map((cat) => {
          const ativo = filtro === cat;
          return (
            <button
              key={cat}
              onClick={() => setFiltro(cat)}
              className={`flex shrink-0 items-center gap-2 rounded-full border px-4 py-2.5 text-sm font-semibold whitespace-nowrap transition-all ${
                ativo
                  ? 'border-transparent bg-gradient-to-r from-accent-purple to-accent-pink text-white shadow-purple'
                  : 'border-border bg-card/60 text-muted hover:border-accent-purple/50 hover:bg-card hover:text-foreground'
              }`}
            >
              <IconeFiltro categoria={cat} />
              {cat}
            </button>
          );
        })}
      </div>

      {/* Título */}
      <div className="flex items-end justify-between">
        <div>
          <h2 className="flex items-center gap-2 text-xl font-black text-foreground">
            <Zap size={20} className="fill-primary text-primary" />
            {busca ? `Resultados para "${searchParams.get('q')}"` : 'Festas em Alta'}
          </h2>
          {!busca && <p className="mt-1 text-sm text-muted">Encontre seu próximo rolê.</p>}
        </div>

        <div className="flex items-center gap-3">
          <div className="relative">
            <ArrowUpDown size={13} className="absolute left-2.5 top-1/2 -translate-y-1/2 text-muted-subtle pointer-events-none" />
            <select
              value={ordem}
              onChange={(e) => setOrdem(e.target.value as typeof ordem)}
              className="appearance-none bg-card border border-border rounded-lg pl-7 pr-6 py-1.5 text-xs text-muted focus:border-primary outline-none cursor-pointer"
            >
              <option value="recentes">Mais recentes</option>
              <option value="proximos">Data mais próxima</option>
              <option value="baratos">Mais baratos</option>
            </select>
          </div>
          <span className="text-xs font-medium text-muted whitespace-nowrap">
            {eventosFiltrados.length} {eventosFiltrados.length === 1 ? 'evento' : 'eventos'}
          </span>
        </div>
      </div>

      {/* Grid */}
      {eventosFiltrados.length === 0 ? (
        <div className="clubber-card flex min-h-[250px] items-center justify-center rounded-2xl border-dashed text-center">
          <div>
            <div className="mx-auto mb-4 flex h-12 w-12 items-center justify-center rounded-full bg-accent-purple/10 text-accent-purple">
              <Zap size={20} />
            </div>
            <p className="text-sm font-medium text-muted">
              {busca ? 'Nenhum evento encontrado pra essa busca.' : 'Nenhum evento encontrado com esse filtro.'}
            </p>
          </div>
        </div>
      ) : (
        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
          {eventosFiltrados.map((evento) => (
            <CardEvento key={evento.id} evento={evento} favoritadoInicial={favoritosIds.includes(evento.id)} />
          ))}
        </div>
      )}
    </div>
  );
}
