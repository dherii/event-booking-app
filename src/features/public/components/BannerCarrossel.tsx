'use client';

import { useState, useEffect } from 'react';
import Image from 'next/image';
import { ChevronLeft, ChevronRight, Calendar, MapPin } from 'lucide-react';

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

  // Troca automática de banner a cada 5 segundos
  useEffect(() => {
    if (eventos.length <= 1) return;
    const intervalo = setInterval(() => {
      setIndiceAtual((prev) => (prev + 1) % eventos.length);
    }, 5000);
    return () => clearInterval(intervalo);
  }, [eventos.length]);

  if (!eventos || eventos.length === 0) return null;

  const eventoAtivo = eventos[indiceAtual];

  return (
    <div className="relative w-full rounded-2xl overflow-hidden shadow-lg bg-slate-900 group">
      {/* Container com proporção responsiva e ajuste automático de imagem */}
      <div className="relative w-full h-[220px] sm:h-[350px] md:h-[420px]">
        <Image
          src={eventoAtivo.bannerUrl}
          alt={eventoAtivo.titulo || "Banner do evento"}
          fill
          priority
          className="object-cover object-center transition-all duration-700 ease-in-out"
        />
        {/* Gradiente escuro sobre a imagem para destacar os textos */}
        <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/30 to-transparent" />
      </div>

      {/* Conteúdo Informativo sobre o Banner */}
      <div className="absolute bottom-0 left-0 right-0 p-4 sm:p-8 text-white flex flex-col sm:flex-row sm:items-end justify-between gap-4">
        <div className="space-y-2 max-w-xl">
          <span className="inline-block px-3 py-1 rounded-full bg-primary text-white text-[10px] sm:text-xs font-bold uppercase tracking-wider">
            Destaque
          </span>
          <h2 className="text-lg sm:text-2xl md:text-3xl font-extrabold tracking-tight drop-shadow-md">
            {eventoAtivo.titulo}
          </h2>
          <div className="flex flex-wrap items-center gap-4 text-xs sm:text-sm text-slate-200">
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

        <a
          href={eventoAtivo.linkHref}
          className="px-5 py-2.5 rounded-xl bg-primary text-white text-xs sm:text-sm font-bold hover:bg-primary/90 transition-all shadow-lg text-center shrink-0"
        >
          Garantir Ingresso
        </a>
      </div>

      {/* Botões de Navegação Manual (Aparecem ao passar o mouse) */}
      {eventos.length > 1 && (
        <>
          <button
            onClick={() => setIndiceAtual((prev) => (prev === 0 ? eventos.length - 1 : prev - 1))}
            className="absolute left-3 top-1/2 -translate-y-1/2 p-2 rounded-full bg-black/50 text-white opacity-0 group-hover:opacity-100 transition-opacity hover:bg-black/70 cursor-pointer"
            aria-label="Anterior"
          >
            <ChevronLeft size={20} />
          </button>
          <button
            onClick={() => setIndiceAtual((prev) => (prev + 1) % eventos.length)}
            className="absolute right-3 top-1/2 -translate-y-1/2 p-2 rounded-full bg-black/50 text-white opacity-0 group-hover:opacity-100 transition-opacity hover:bg-black/70 cursor-pointer"
            aria-label="Próximo"
          >
            <ChevronRight size={20} />
          </button>

          {/* Indicadores de bolinhas (Pagination Dots) */}
          <div className="absolute top-4 right-4 flex items-center gap-1.5 bg-black/40 px-3 py-1.5 rounded-full backdrop-blur-sm">
            {eventos.map((_, idx) => (
              <button
                key={idx}
                onClick={() => setIndiceAtual(idx)}
                className={`w-2 h-2 rounded-full transition-all ${
                  idx === indiceAtual ? 'bg-white w-5' : 'bg-white/50'
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