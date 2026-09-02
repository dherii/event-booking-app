'use client';

import { useState, useEffect } from 'react';
import Image from 'next/image';
import Link from 'next/link';
import { ChevronLeft, ChevronRight, Calendar, MapPin, ArrowRight, Sparkles } from 'lucide-react';

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
        fullBleed ? '' : 'rounded-2xl shadow-2xl border border-border/80'
      }`}
    >
      {/* Container com proporção responsiva e ajuste automático de imagem */}
      <div
        className={`relative w-full overflow-hidden ${
          fullBleed
            ? 'h-[340px] sm:h-[440px] md:h-[540px] lg:h-[620px]'
            : 'h-[240px] sm:h-[360px] md:h-[420px]'
        }`}
      >
        <Image
          src={eventoAtivo.bannerUrl}
          alt={eventoAtivo.titulo || "Banner do evento"}
          fill
          priority
          className="object-cover object-center transition-transform duration-700 ease-in-out group-hover:scale-105"
        />
        {/* Gradiente escuro sobre a imagem para destacar os textos */}
        <div className="absolute inset-0 bg-gradient-to-t from-black/90 via-black/40 to-black/10" />

        {/* Selo da seção — estilo consistente com os outros badges do site (fundo escuro translúcido),
            funciona bem em cima de qualquer imagem sem precisar adaptar cor por banner */}
        <div className="absolute left-4 top-4 sm:left-5 sm:top-5 flex items-center gap-1.5 rounded-full border border-white/15 bg-black/55 px-3 py-1.5 backdrop-blur-md shadow-sm">
          <Sparkles size={13} className="text-primary shrink-0" />
          <span className="text-[10px] font-bold uppercase tracking-wider text-white">Destaques da Semana</span>
        </div>
      </div>

      {/* Conteúdo Informativo sobre o Banner — alinhado à mesma grade do restante da página */}
      <div
        className={`absolute bottom-0 left-0 right-0 text-white flex flex-col sm:flex-row sm:items-end justify-between gap-4 ${
          fullBleed
            ? 'mx-auto max-w-7xl px-4 py-6 sm:px-6 sm:py-9 lg:px-8 lg:py-12'
            : 'p-5 sm:p-8'
        }`}
      >
        <div className="space-y-2.5 max-w-xl">
          <span className="inline-flex items-center px-3.5 py-1 rounded-full bg-primary text-primary-fg text-[10px] sm:text-xs font-black uppercase tracking-wider shadow-neon">
            Destaque
          </span>
          <h2 className="text-2xl sm:text-3xl md:text-4xl font-black tracking-tight drop-shadow-md text-white line-clamp-2">
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
            className={`absolute top-1/2 -translate-y-1/2 flex h-10 w-10 items-center justify-center rounded-full border border-white/20 bg-black/50 text-white opacity-0 group-hover:opacity-100 transition-all hover:bg-black/70 hover:scale-105 cursor-pointer backdrop-blur-md shadow-lg ${
              fullBleed ? 'left-4 sm:left-8' : 'left-4'
            }`}
            aria-label="Anterior"
          >
            <ChevronLeft size={20} />
          </button>
          <button
            onClick={() => setIndiceAtual((prev) => (prev + 1) % eventos.length)}
            className={`absolute top-1/2 -translate-y-1/2 flex h-10 w-10 items-center justify-center rounded-full border border-white/20 bg-black/50 text-white opacity-0 group-hover:opacity-100 transition-all hover:bg-black/70 hover:scale-105 cursor-pointer backdrop-blur-md shadow-lg ${
              fullBleed ? 'right-4 sm:right-8' : 'right-4'
            }`}
            aria-label="Próximo"
          >
            <ChevronRight size={20} />
          </button>

          {/* Indicadores de bolinhas (Pagination Dots) */}
          <div
            className={`absolute top-4 flex items-center gap-1.5 bg-black/50 px-3 py-2 rounded-full backdrop-blur-md border border-white/10 shadow-lg ${
              fullBleed ? 'right-4 sm:right-8' : 'right-4'
            }`}
          >
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