'use client';

import { useMemo, useState } from 'react';
import { useSearchParams } from 'next/navigation';
import {
  Zap, CalendarDays, GraduationCap, Beer, Home, Navigation, ArrowUpDown,
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

    if (ordem === 'proximos') {
      lista = [...lista].sort((a, b) => new Date(a.data_inicio).getTime() - new Date(b.data_inicio).getTime());
    } else if (ordem === 'baratos') {
      const menorPreco = (e: Evento) => Math.min(...(e.lotes?.map((l) => Number(l.preco)) ?? [Infinity]));
      lista = [...lista].sort((a, b) => menorPreco(a) - menorPreco(b));
    }

    return lista;
  }, [eventos, filtro, busca, ordem]);

  function IconeFiltro({ categoria }: { categoria: string }) {
    if (categoria === 'Hoje') return <CalendarDays size={16} />;
    if (categoria === 'Universitário') return <GraduationCap size={16} />;
    if (categoria === 'Pub / Bar') return <Beer size={16} />;
    if (categoria === 'Festa') return <Home size={16} />;
    if (categoria === 'Perto de mim') return <Navigation size={16} />;
    return null;
  }

  return (
    <div className="space-y-8">
      {/* Filtros em Pílulas (Chips) */}
      <div className="-mx-1 flex gap-2.5 overflow-x-auto px-1 pb-2 [scrollbar-width:none] [&::-webkit-scrollbar]:hidden">
        {categorias.map((cat) => {
          const ativo = filtro === cat;
          return (
            <button
              key={cat}
              onClick={() => setFiltro(cat)}
              className={`flex shrink-0 items-center gap-2 rounded-2xl border px-4.5 py-3 text-sm font-bold whitespace-nowrap transition-all shadow-sm ${
                ativo
                  ? 'border-transparent bg-primary text-primary-fg shadow-neon scale-105'
                  : 'border-border/80 bg-card/80 text-muted hover:border-primary/40 hover:bg-card hover:text-foreground'
              }`}
            >
              <IconeFiltro categoria={cat} />
              {cat}
            </button>
          );
        })}
      </div>

      {/* Cabeçalho de Resultados e Ordenação */}
      <div className="flex flex-col sm:flex-row sm:items-end justify-between gap-4 border-b border-border/60 pb-4">
        <div>
          <h2 className="flex items-center gap-2.5 text-2xl font-black text-foreground tracking-tight">
            <Zap size={22} className="fill-primary text-primary" />
            {busca ? `Resultados para "${searchParams.get('q')}"` : 'Seu próximo evento começa aqui'}
          </h2>
          {!busca && <p className="mt-1 text-sm text-muted">Encontre eventos acadêmicos e viva novas experiências.</p>}
        </div>

        <div className="flex items-center gap-3.5">
          <div className="relative">
            <ArrowUpDown size={14} className="absolute left-3 top-1/2 -translate-y-1/2 text-muted-subtle pointer-events-none" />
            <select
              value={ordem}
              onChange={(e) => setOrdem(e.target.value as typeof ordem)}
              className="appearance-none bg-card border border-border/80 rounded-xl pl-8 pr-8 py-2 text-xs font-semibold text-muted focus:border-primary outline-none cursor-pointer shadow-sm"
            >
              <option value="recentes">Mais recentes</option>
              <option value="proximos">Data mais próxima</option>
              <option value="baratos">Mais baratos</option>
            </select>
          </div>
          <span className="text-xs font-bold text-muted bg-card px-3 py-2 rounded-xl border border-border/60 shadow-sm whitespace-nowrap">
            {eventosFiltrados.length} {eventosFiltrados.length === 1 ? 'evento' : 'eventos'}
          </span>
        </div>
      </div>

      {/* Grid de Eventos */}
      {eventosFiltrados.length === 0 ? (
        <div className="glass-card-premium flex min-h-[300px] items-center justify-center rounded-3xl border-dashed text-center p-8">
          <div>
            <div className="mx-auto mb-4 flex h-14 w-14 items-center justify-center rounded-2xl bg-primary/10 text-primary shadow-sm">
              <Zap size={24} />
            </div>
            <p className="text-base font-bold text-foreground">
              {busca ? 'Nenhum evento encontrado para esta busca.' : 'Nenhum evento encontrado com este filtro.'}
            </p>
            <p className="mt-1 text-xs text-muted">Tente buscar por outro termo ou categoria.</p>
          </div>
        </div>
      ) : (
        <div className="grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
          {eventosFiltrados.map((evento) => (
            <CardEvento key={evento.id} evento={evento} favoritadoInicial={favoritosIds.includes(evento.id)} />
          ))}
        </div>
      )}
    </div>
  );
}