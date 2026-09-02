'use client';

import { useState, useEffect } from 'react';
import Image from 'next/image';
import Link from 'next/link';
import { ChevronLeft, ChevronRight, Calendar, MapPin, ArrowRight } from 'lucide-react';

interface EventoBanner {
  id: string;
  titulo: string;
  bannerUrl: string;
  data: string;
  local: string;
  linkHref: string;
}

interface BannerCarrosselProps {
  eventos: EventoBanner[];
  /** Quando true, o banner ocupa a largura inteira da viewport (edge-to-edge). */
  fullBleed?: boolean;
}

export function BannerCarrossel({ eventos, fullBleed = false }: BannerCarrosselProps) {
  const [indiceAtual, setIndiceAtual] = useState(0);

  // Troca automática de banner a cada 12 segundos
  useEffect(() => {
    if (eventos.length <= 1) return;
    const intervalo = setInterval(() => {
      setIndiceAtual((prev) => (prev + 1) % eventos.length);
    }, 12000);
    return () => clearInterval(intervalo);
  }, [eventos.length]);

  if (!eventos || eventos.length === 0) return null;

  const eventoAtivo = eventos[indiceAtual];

  return (
    <div
      className={`relative w-full overflow-hidden bg-card group ${
        fullBleed ? '' : 'rounded-2xl shadow-card border border-border'
      }`}
    >
      {/* Container com proporção responsiva */}
      <div
        className={`relative w-full overflow-hidden ${
          fullBleed
            ? 'h-[340px] sm:h-[440px] md:h-[540px] lg:h-[620px]'
            : 'h-[280px] sm:h-[360px] md:h-[420px]' // Aumentei levemente a altura base do mobile para dar mais respiro
        }`}
      >
        <Image
          src={eventoAtivo.bannerUrl}
          alt={eventoAtivo.titulo || "Banner do evento"}
          fill
          priority
          className="object-cover object-center transition-transform duration-700 ease-in-out group-hover:scale-105"
        />

        {/* Overlay cinemático escuro: cobre mais área (via-70%) e protege o texto no mobile */}
        <div className="absolute inset-0 bg-gradient-to-t from-zinc-950 via-zinc-950/70 to-transparent pointer-events-none z-0" />

        {/* Selo da seção usando a classe .glass */}
        <div className="absolute left-4 top-4 sm:left-5 sm:top-5 flex items-center gap-1.5 rounded-full glass px-3 py-1.5 shadow-sm z-10">
          <span className="text-[10px] font-bold uppercase tracking-wider text-foreground">
            Destaques da Semana
          </span>
        </div>
      </div>

      {/* Conteúdo Informativo sobre o Banner */}
      <div
        className={`absolute bottom-0 left-0 right-0 flex flex-col sm:flex-row sm:items-end justify-between gap-5 z-10 ${
          fullBleed
            ? 'mx-auto max-w-7xl px-4 py-6 sm:px-6 sm:py-9 lg:px-8 lg:py-12'
            : 'p-5 sm:p-8'
        }`}
      >
        <div className="space-y-3 max-w-xl">
          {/* Texto forçado para branco para garantir contraste com o gradiente escuro */}
          <h2 className="text-3xl sm:text-4xl md:text-5xl font-black tracking-tight text-white line-clamp-2">
            {eventoAtivo.titulo}
          </h2>
          <div className="flex flex-wrap items-center gap-4 text-xs sm:text-sm text-zinc-300 font-medium">
            <span className="flex items-center gap-1.5">
              <Calendar size={15} className="text-primary" />
              {eventoAtivo.data}
            </span>
            <span className="flex items-center gap-1.5">
              <MapPin size={15} className="text-primary" />
              {eventoAtivo.local}
            </span>
          </div>
        </div>

        <Link
          href={eventoAtivo.linkHref}
          className="clubber-button shrink-0 !text-white w-full sm:w-auto"
        >
          Garantir Ingresso
          <ArrowRight size={16} strokeWidth={2.5} />
        </Link>
      </div>

      {/* Botões de Navegação Manual */}
      {eventos.length > 1 && (
        <>
          <button
            onClick={() => setIndiceAtual((prev) => (prev === 0 ? eventos.length - 1 : prev - 1))}
            className={`absolute top-1/2 -translate-y-1/2 flex h-10 w-10 items-center justify-center rounded-full glass text-foreground opacity-0 group-hover:opacity-100 transition-all hover:scale-105 cursor-pointer shadow-sm z-10 ${
              fullBleed ? 'left-4 sm:left-8' : 'left-4'
            }`}
            aria-label="Anterior"
          >
            <ChevronLeft size={20} />
          </button>
          <button
            onClick={() => setIndiceAtual((prev) => (prev + 1) % eventos.length)}
            className={`absolute top-1/2 -translate-y-1/2 flex h-10 w-10 items-center justify-center rounded-full glass text-foreground opacity-0 group-hover:opacity-100 transition-all hover:scale-105 cursor-pointer shadow-sm z-10 ${
              fullBleed ? 'right-4 sm:right-8' : 'right-4'
            }`}
            aria-label="Próximo"
          >
            <ChevronRight size={20} />
          </button>

          {/* Indicadores (Pagination Dots) */}
          <div
            className={`absolute top-4 flex items-center gap-2 glass px-3 py-2 rounded-full shadow-sm z-10 ${
              fullBleed ? 'right-4 sm:right-8' : 'right-4'
            }`}
          >
            {eventos.map((_, idx) => (
              <button
                key={idx}
                onClick={() => setIndiceAtual(idx)}
                className={`h-2 rounded-full transition-all cursor-pointer ${
                  idx === indiceAtual ? 'bg-primary w-6' : 'bg-foreground/30 hover:bg-foreground/60 w-2'
                }`}
                aria-label={`Ir para slide ${idx + 1}`}
              />
            ))}
          </div>
        </>
      )}
    </div>
  );
}