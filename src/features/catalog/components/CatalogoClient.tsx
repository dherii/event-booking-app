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
    const iconProps = { size: 15 };
    switch (categoria) {
      case 'Hoje': return <CalendarDays {...iconProps} />;
      case 'Universitário': return <GraduationCap {...iconProps} />;
      case 'Pub / Bar': return <Beer {...iconProps} />;
      case 'Festa': return <Home {...iconProps} />;
      case 'Perto de mim': return <Navigation {...iconProps} />;
      default: return null;
    }
  }

  return (
    <div className="space-y-6 sm:space-y-8">
      {/* Filtros — pílulas roláveis full-bleed no mobile, abas com sublinhado no desktop */}
      <div className="-mx-4 flex gap-2 overflow-x-auto px-4 pb-1 [scrollbar-width:none] [&::-webkit-scrollbar]:hidden sm:mx-0 sm:gap-1 sm:overflow-visible sm:border-b sm:border-border sm:px-0 sm:pb-0">
        {categorias.map((cat) => {
          const ativo = filtro === cat;
          return (
            <button
              key={cat}
              onClick={() => lidarComCliqueFiltro(cat)}
              disabled={cat === 'Perto de mim' && carregandoLocal}
              className={`flex min-h-11 shrink-0 items-center gap-1.5 whitespace-nowrap rounded-full border px-4 text-sm font-medium transition-colors sm:min-h-0 sm:rounded-none sm:border-0 sm:border-b-2 sm:px-2.5 sm:py-2.5 sm:text-[13px] ${ativo
                  ? 'border-primary bg-primary text-primary-fg sm:border-primary sm:bg-transparent sm:text-foreground'
                  : 'border-border bg-card text-muted hover:border-input-border-hover hover:text-foreground sm:border-transparent sm:bg-transparent sm:hover:border-transparent'
                }`}
            >
              <IconeFiltro categoria={cat} />
              {cat === 'Perto de mim' && carregandoLocal ? 'Obtendo local...' : cat}
            </button>
          );
        })}
      </div>

      {/* Cabeçalho de Resultados e Ordenação */}
      <div className="flex flex-col gap-3 sm:flex-row sm:items-end sm:justify-between">
        <div>
          <h2 className="flex items-center gap-2 text-xl font-semibold tracking-tight text-foreground">
            <Zap size={18} className="text-primary" />
            {busca ? `Resultados para "${searchParams.get('q')}"` : 'Seu próximo evento começa aqui'}
          </h2>
          {!busca && <p className="mt-1 text-sm text-muted">Encontre eventos acadêmicos e viva novas experiências.</p>}
        </div>

        <div className="flex items-center gap-2">
          <div className="relative flex-1 sm:flex-none">
            <ArrowUpDown size={13} className="absolute left-3 top-1/2 -translate-y-1/2 text-muted-subtle pointer-events-none" />
            <select
              value={ordem}
              onChange={(e) => setOrdem(e.target.value as typeof ordem)}
              className="h-9 w-full appearance-none rounded-lg border border-border bg-card pl-8 pr-8 text-xs font-medium text-muted focus:border-input-border-focus outline-none cursor-pointer sm:w-auto">
              <option value="recentes">Mais recentes</option>
              <option value="proximos">Data mais próxima</option>
              <option value="baratos">Mais baratos</option>
            </select>
          </div>
          <span className="h-9 hidden shrink-0 items-center rounded-lg border border-border bg-card px-4 text-xs font-medium text-muted sm:inline-flex">
            {eventosFiltrados.length} {eventosFiltrados.length === 1 ? 'evento' : 'eventos'}
          </span>
        </div>
      </div>

      {/* Grid de Eventos — colunas mais largas para acomodar o card horizontal */}
      {eventosFiltrados.length === 0 ? (
        <div className="glass-card-premium flex min-h-[280px] items-center justify-center rounded-2xl border-dashed text-center p-8">
          <div>
            <div className="mx-auto mb-4 flex h-12 w-12 items-center justify-center rounded-xl bg-primary/10 text-primary">
              <Zap size={22} />
            </div>
            <p className="text-base font-semibold text-foreground">
              {busca ? 'Nenhum evento encontrado para esta busca.' : 'Nenhum evento encontrado com este filtro.'}
            </p>
            <p className="mt-1 text-xs text-muted">Tente buscar por outro termo ou categoria.</p>
          </div>
        </div>
      ) : (
        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 sm:gap-5 xl:grid-cols-3 xl:gap-6">
          {eventosFiltrados.map((evento) => {
            // Se o usuário clicou em "Perto de mim", podemos calcular a distância e mostrar no card
            let distanciaTexto = null;
            if (filtro === 'Perto de mim' && localizacaoUsuario && evento.latitude && evento.longitude) {
              const km = calcularDistanciaKm(localizacaoUsuario.lat, localizacaoUsuario.lon, evento.latitude, evento.longitude);
              distanciaTexto = `${km.toFixed(1)} km de você`;
            }

            return (
              <div key={evento.id} className="flex flex-col gap-1.5">
                <CardEvento evento={evento} favoritadoInicial={favoritosIds.includes(evento.id)} />
                {distanciaTexto && (
                  <span className="px-1 text-xs font-medium text-primary">
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