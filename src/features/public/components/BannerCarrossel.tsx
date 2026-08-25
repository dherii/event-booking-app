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

export function BannerCarrossel({ eventos }: { eventos: EventoBanner[] }) {
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
    <div className="relative w-full rounded-2xl overflow-hidden shadow-2xl bg-card border border-border/80 group">
      {/* Container com proporção responsiva e ajuste automático de imagem */}
      <div className="relative w-full h-[240px] sm:h-[360px] md:h-[420px] overflow-hidden">
        <Image
          src={eventoAtivo.bannerUrl}
          alt={eventoAtivo.titulo || "Banner do evento"}
          fill
          priority
          className="object-cover object-center transition-transform duration-700 ease-in-out group-hover:scale-105"
        />
        {/* Gradiente escuro sobre a imagem para destacar os textos */}
        <div className="absolute inset-0 bg-gradient-to-t from-black/90 via-black/40 to-black/10" />
      </div>

      {/* Conteúdo Informativo sobre o Banner */}
      <div className="absolute bottom-0 left-0 right-0 p-5 sm:p-8 text-white flex flex-col sm:flex-row sm:items-end justify-between gap-4">
        <div className="space-y-2.5 max-w-xl">
          <span className="inline-flex items-center px-3.5 py-1 rounded-full bg-primary text-primary-fg text-[10px] sm:text-xs font-black uppercase tracking-wider shadow-neon">
            Destaque
          </span>
          <h2 className="text-xl sm:text-2xl md:text-3xl font-black tracking-tight drop-shadow-md text-white line-clamp-2">
            {eventoAtivo.titulo}
          </h2>
          <div className="flex flex-wrap items-center gap-4 text-xs sm:text-sm text-slate-200 font-medium">
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
          className="flex items-center justify-center gap-2 px-5 py-3 rounded-2xl bg-primary text-primary-fg text-xs sm:text-sm font-black uppercase tracking-wider hover:bg-primary-hover transition-all shadow-neon text-center shrink-0 active:scale-[0.98]"
        >
          Garantir Ingresso
          <ArrowRight size={16} strokeWidth={2.5} />
        </Link>
      </div>

      {/* Botões de Navegação Manual (Aparecem ao passar o mouse) */}
      {eventos.length > 1 && (
        <>
          <button
            onClick={() => setIndiceAtual((prev) => (prev === 0 ? eventos.length - 1 : prev - 1))}
            className="absolute left-4 top-1/2 -translate-y-1/2 flex h-10 w-10 items-center justify-center rounded-full border border-white/20 bg-black/50 text-white opacity-0 group-hover:opacity-100 transition-all hover:bg-black/70 hover:scale-105 cursor-pointer backdrop-blur-md shadow-lg"
            aria-label="Anterior"
          >
            <ChevronLeft size={20} />
          </button>
          <button
            onClick={() => setIndiceAtual((prev) => (prev + 1) % eventos.length)}
            className="absolute right-4 top-1/2 -translate-y-1/2 flex h-10 w-10 items-center justify-center rounded-full border border-white/20 bg-black/50 text-white opacity-0 group-hover:opacity-100 transition-all hover:bg-black/70 hover:scale-105 cursor-pointer backdrop-blur-md shadow-lg"
            aria-label="Próximo"
          >
            <ChevronRight size={20} />
          </button>

          {/* Indicadores de bolinhas (Pagination Dots) */}
          <div className="absolute top-4 right-4 flex items-center gap-1.5 bg-black/50 px-3 py-2 rounded-full backdrop-blur-md border border-white/10 shadow-lg">
            {eventos.map((_, idx) => (
              <button
                key={idx}
                onClick={() => setIndiceAtual(idx)}
                className={`h-2 rounded-full transition-all cursor-pointer ${
                  idx === indiceAtual ? 'bg-primary w-6' : 'bg-white/50 w-2 hover:bg-white'
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