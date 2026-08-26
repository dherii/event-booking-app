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
  latitude?: number | null;
  longitude?: number | null;
}

// Função matemática para calcular a distância em KM (Fórmula de Haversine)
function calcularDistanciaKm(lat1: number, lon1: number, lat2: number, lon2: number) {
  const R = 6371; // Raio da Terra em km
  const dLat = (lat2 - lat1) * (Math.PI / 180);
  const dLon = (lon2 - lon1) * (Math.PI / 180);
  const a =
    Math.sin(dLat / 2) * Math.sin(dLat / 2) +
    Math.cos(lat1 * (Math.PI / 180)) * Math.cos(lat2 * (Math.PI / 180)) *
    Math.sin(dLon / 2) * Math.sin(dLon / 2);
  const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
  return R * c;
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
  
  // Estados para geolocalização do usuário
  const [localizacaoUsuario, setLocalizacaoUsuario] = useState<{ lat: number; lon: number } | null>(null);
  const [carregandoLocal, setCarregandoLocal] = useState(false);

  const busca = (searchParams.get('q') ?? '').toLowerCase().trim();

  // Categorias dinâmicas + garantindo a pílula "Perto de mim"
  const categorias = useMemo(() => {
    const unicas = Array.from(new Set(eventos.map((e) => e.categoria).filter(Boolean))) as string[];
    const base = ['Tudo', 'Hoje', 'Perto de mim'];
    for (const cat of unicas) {
      if (!base.includes(cat)) base.push(cat);
    }
    return base;
  }, [eventos]);

  // Função disparada ao clicar em "Perto de mim"
  const lidarComCliqueFiltro = (cat: string) => {
    if (cat === 'Perto de mim') {
      if (!navigator.geolocation) {
        alert('Seu navegador não suporta geolocalização.');
        return;
      }
      setCarregandoLocal(true);
      navigator.geolocation.getCurrentPosition(
        (position) => {
          setLocalizacaoUsuario({
            lat: position.coords.latitude,
            lon: position.coords.longitude,
          });
          setFiltro('Perto de mim');
          setCarregandoLocal(false);
        },
        (error) => {
          console.error(error);
          setCarregandoLocal(false);
          alert('Não foi possível obter sua localização. Verifique as permissões do navegador.');
        }
      );
    } else {
      setFiltro(cat);
    }
  };

  const eventosFiltrados = useMemo(() => {
    let lista = [...eventos];

    // Filtros por Categoria / Hoje / Perto de mim
    if (filtro === 'Hoje') {
      lista = lista.filter((e) => ehHoje(e.data_inicio));
    } else if (filtro === 'Perto de mim' && localizacaoUsuario) {
      // Aqui não excluímos nenhum evento, apenas garantimos que eles mantenham todos visíveis
      // A ordenação logo abaixo vai priorizar os mais perto
    } else if (filtro !== 'Tudo' && filtro !== 'Perto de mim') {
      lista = lista.filter((e) => e.categoria === filtro);
    }

    // Filtro de Busca por Texto
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

    // Ordenação
    if (filtro === 'Perto de mim' && localizacaoUsuario) {
      // Ordena especificamente por proximidade geográfica se o usuário ativou
      lista.sort((a, b) => {
        const distA = (a.latitude && a.longitude) ? calcularDistanciaKm(localizacaoUsuario.lat, localizacaoUsuario.lon, a.latitude, a.longitude) : 999999;
        const distB = (b.latitude && b.longitude) ? calcularDistanciaKm(localizacaoUsuario.lat, localizacaoUsuario.lon, b.latitude, b.longitude) : 999999;
        return distA - distB;
      });
    } else if (ordem === 'proximos') {
      lista.sort((a, b) => new Date(a.data_inicio).getTime() - new Date(b.data_inicio).getTime());
    } else if (ordem === 'baratos') {
      const menorPreco = (e: Evento) => Math.min(...(e.lotes?.map((l) => Number(l.preco)) ?? [Infinity]));
      lista.sort((a, b) => menorPreco(a) - menorPreco(b));
    }

    return lista;
  }, [eventos, filtro, busca, ordem, localizacaoUsuario]);

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
              onClick={() => lidarComCliqueFiltro(cat)}
              disabled={cat === 'Perto de mim' && carregandoLocal}
              className={`flex shrink-0 items-center gap-2 rounded-2xl border px-4.5 py-3 text-sm font-bold whitespace-nowrap transition-all shadow-sm ${
                ativo
                  ? 'border-transparent bg-primary text-primary-fg shadow-neon scale-105'
                  : 'border-border/80 bg-card/80 text-muted hover:border-primary/40 hover:bg-card hover:text-foreground'
              }`}
            >
              <IconeFiltro categoria={cat} />
              {cat === 'Perto de mim' && carregandoLocal ? 'Obtendo local...' : cat}
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
          {eventosFiltrados.map((evento) => {
            // Se o usuário clicou em "Perto de mim", podemos calcular a distância e mostrar no card
            let distanciaTexto = null;
            if (filtro === 'Perto de mim' && localizacaoUsuario && evento.latitude && evento.longitude) {
              const km = calcularDistanciaKm(localizacaoUsuario.lat, localizacaoUsuario.lon, evento.latitude, evento.longitude);
              distanciaTexto = `${km.toFixed(1)} km de você`;
            }

            return (
              <div key={evento.id} className="flex flex-col">
                <CardEvento evento={evento} favoritadoInicial={favoritosIds.includes(evento.id)} />
                {distanciaTexto && (
                  <span className="mt-1.5 text-xs font-medium text-primary px-1">
                    📍 {distanciaTexto}
                  </span>
                )}
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}