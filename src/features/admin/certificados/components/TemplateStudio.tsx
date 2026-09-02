// src/features/admin/certificados/components/TemplateStudio.tsx
'use client';

import { useRef, useState } from 'react';
import {
  ImagePlus, X, Copy, Check,
  AlignLeft, AlignCenter, AlignRight,
  ChevronDown,
} from 'lucide-react';
import type { TemplateConfig, VariavelTemplate } from '../types';
import { VARIAVEIS_TEMPLATE } from '../types';

function cls(...args: (string | false | undefined)[]) {
  return args.filter(Boolean).join(' ');
}

function ListaVariaveis({ copiado, onCopiar }: { copiado: string | null, onCopiar: (c: string) => void }) {
  return (
    <ul className="divide-y divide-border bg-card max-h-[350px] overflow-y-auto hide-scrollbar">
      {VARIAVEIS_TEMPLATE.map((v) => {
        const copied = copiado === v.chave;
        return (
          <li key={v.chave} className="flex items-center justify-between gap-3 px-5 py-3.5 hover:bg-background-secondary transition-colors group">
            <div className="min-w-0 flex-1">
              <p className="text-xs font-mono font-bold text-primary truncate">{v.chave}</p>
              <p className="text-[11px] font-medium text-muted truncate mt-0.5">{v.label}</p>
            </div>
            <button
              type="button"
              onClick={() => onCopiar(v.chave)}
              className={cls(
                'p-2.5 rounded-xl transition-all shrink-0',
                copied
                  ? 'bg-success-bg text-success-fg border border-success-fg/20 shadow-sm'
                  : 'bg-background-tertiary text-muted border border-border hover:text-primary hover:border-primary/30',
              )}
              aria-label={`Copiar ${v.chave}`}
            >
              {copied ? <Check size={16} strokeWidth={3} /> : <Copy size={16} />}
            </button>
          </li>
        );
      })}
    </ul>
  );
}

function PainelVariaveisDesktop() {
  const [copiado, setCopiado] = useState<string | null>(null);

  async function copiar(chave: string) {
    await navigator.clipboard.writeText(chave);
    setCopiado(chave);
    setTimeout(() => setCopiado(null), 1500);
  }

  return (
    <div className="clubber-card overflow-hidden shadow-sm hidden xl:block">
      <div className="px-5 py-4 border-b border-border bg-background-secondary/50">
        <p className="text-xs font-bold text-foreground uppercase tracking-wider">Variáveis Dinâmicas</p>
        <p className="text-[11px] font-medium text-muted mt-1">Clique no ícone para copiar a tag</p>
      </div>
      <ListaVariaveis copiado={copiado} onCopiar={copiar} />
    </div>
  );
}

function PainelVariaveisMobile() {
  const [copiado, setCopiado] = useState<string | null>(null);

  async function copiar(chave: string) {
    await navigator.clipboard.writeText(chave);
    setCopiado(chave);
    setTimeout(() => setCopiado(null), 1500);
  }

  return (
    <details className="clubber-card group overflow-hidden cursor-pointer shadow-sm [&_summary::-webkit-details-marker]:hidden xl:hidden">
      <summary className="px-5 py-4 flex items-center justify-between bg-background-secondary/50 focus:outline-none focus-visible:ring-2 focus-visible:ring-primary/50">
        <div>
          <p className="text-xs font-bold text-foreground uppercase tracking-wider">Variáveis Dinâmicas</p>
          <p className="text-[11px] font-medium text-muted mt-1">Toque para ver as tags disponíveis</p>
        </div>
        <ChevronDown size={18} className="text-muted group-open:rotate-180 transition-transform duration-300" />
      </summary>
      <div className="border-t border-border">
        <ListaVariaveis copiado={copiado} onCopiar={copiar} />
      </div>
    </details>
  );
}

const EXEMPLO: Record<string, string> = Object.fromEntries(
  VARIAVEIS_TEMPLATE.map((v) => [v.chave, v.exemplo]),
);

function CertificadoPreview({ config }: { config: TemplateConfig }) {
  const {
    backgroundUrl, nomeFontSize, nomeColor,
    eventoFontSize, eventoColor, textAlign, fontFamily,
    nomePosY,
  } = config;

  const alignClass =
    textAlign === 'left' ? 'text-left' :
      textAlign === 'right' ? 'text-right' :
        'text-center';

  return (
    <div
      className="relative w-full rounded-xl sm:rounded-2xl overflow-hidden border border-border shadow-card mx-auto max-w-3xl"
      style={{ aspectRatio: '1.414 / 1', background: backgroundUrl ? 'transparent' : '#f8f4ec' }}
    >
      {backgroundUrl ? (
        <img src={backgroundUrl} alt="Fundo do certificado" className="absolute inset-0 w-full h-full object-cover" />
      ) : (
        <div className="absolute inset-0 flex flex-col items-center justify-center"
          style={{ background: 'linear-gradient(135deg, #fdf6e3 0%, #f5e9c8 50%, #fdf6e3 100%)' }}
        >
          <div className="absolute inset-2 sm:inset-4 border-2 border-amber-300/50 rounded-xl pointer-events-none" />
          <div className="absolute inset-3 sm:inset-5 border border-amber-200/40 rounded-lg pointer-events-none" />
        </div>
      )}

      <div className="absolute inset-0 flex flex-col" style={{ fontFamily }}>
        <div className={cls('pt-[8%] px-[10%]', alignClass)}>
          <p
            className="font-bold tracking-[0.2em] uppercase"
            style={{ fontSize: `clamp(10px, ${eventoFontSize * 0.35}px, 18px)`, color: eventoColor }}
          >
            {EXEMPLO['{{NOME_INSTITUICAO}}']}
          </p>
          <p
            className="mt-1 font-medium"
            style={{ fontSize: `clamp(8px, ${eventoFontSize * 0.28}px, 13px)`, color: eventoColor, opacity: 0.75 }}
          >
            Certifica que
          </p>
        </div>

        <div
          className={cls('px-[10%]', alignClass)}
          style={{ marginTop: `${nomePosY - 20}%` }}
        >
          <p
            className="font-black leading-tight"
            style={{ fontSize: `clamp(14px, ${nomeFontSize * 0.55}px, 42px)`, color: nomeColor }}
          >
            {EXEMPLO['{{NOME_ALUNO}}']}
          </p>
        </div>

        <div className={cls('px-[10%] mt-[4%]', alignClass)}>
          <p
            className="font-medium"
            style={{ fontSize: `clamp(8px, ${eventoFontSize * 0.4}px, 16px)`, color: eventoColor, opacity: 0.8 }}
          >
            participou de
          </p>
          <p
            className="font-bold mt-1 leading-snug"
            style={{ fontSize: `clamp(10px, ${eventoFontSize * 0.48}px, 20px)`, color: eventoColor }}
          >
            {EXEMPLO['{{NOME_EVENTO}}']}
          </p>
          <p
            className="mt-1 font-medium"
            style={{ fontSize: `clamp(7px, ${eventoFontSize * 0.32}px, 13px)`, color: eventoColor, opacity: 0.65 }}
          >
            {EXEMPLO['{{DATA_EVENTO}}']} · {EXEMPLO['{{CARGA_HORARIA}}']}
          </p>
        </div>

        <div className={cls('absolute bottom-[6%] left-0 right-0 px-[10%]', alignClass)}>
          <p className="font-semibold" style={{ fontSize: `clamp(6px, ${eventoFontSize * 0.26}px, 11px)`, color: eventoColor, opacity: 0.45 }}>
            Cód. Autenticidade: {EXEMPLO['{{CODIGO_VALIDACAO}}']} · Emitido em {EXEMPLO['{{DATA_EMISSAO}}']}
          </p>
        </div>
      </div>
    </div>
  );
}

function SliderField({
  label, value, min, max, onChange,
}: {
  label: string; value: number; min: number; max: number;
  onChange: (v: number) => void;
}) {
  return (
    <div>
      <div className="flex justify-between mb-3">
        <span className="text-xs font-bold text-foreground">{label}</span>
        <span className="text-xs font-semibold text-primary bg-primary/10 px-2 py-0.5 rounded-md">{value}px</span>
      </div>
      <input
        type="range"
        min={min}
        max={max}
        value={value}
        onChange={(e) => onChange(Number(e.target.value))}
        className="w-full h-2 rounded-full appearance-none bg-border cursor-pointer accent-primary focus:outline-none focus:ring-2 focus:ring-primary/30"
      />
    </div>
  );
}

function ControlesPainel({ config, onChange }: { config: TemplateConfig, onChange: (patch: Partial<TemplateConfig>) => void }) {
  return (
    <div className="clubber-card overflow-hidden shadow-sm">
      <div className="px-5 py-4 border-b border-border bg-background-secondary/50">
        <p className="text-xs font-bold text-foreground uppercase tracking-wider">Ajustes de Design</p>
      </div>

      <div className="p-5 sm:p-6 space-y-8 bg-card">
        {/* Tipografia */}
        <div>
          <p className="text-[10px] font-black text-muted-subtle uppercase tracking-widest mb-4">Tipografia</p>
          <div className="mb-6 relative">
            <label className="block text-xs font-bold text-foreground mb-2">Família da Fonte</label>
            <select
              className="input-base text-sm font-medium appearance-none pr-10 min-h-[44px]"
              value={config.fontFamily}
              onChange={(e) => onChange({ fontFamily: e.target.value as TemplateConfig['fontFamily'] })}
            >
              <option value="serif">Serif (Clássico)</option>
              <option value="sans-serif">Sans-serif (Moderno)</option>
              <option value="monospace">Monospace (Técnico)</option>
            </select>
            <ChevronDown size={16} className="absolute right-3.5 top-[58%] text-muted pointer-events-none" />
          </div>

          <SliderField
            label="Tamanho do Nome do Aluno"
            value={config.nomeFontSize}
            min={20} max={72}
            onChange={(v) => onChange({ nomeFontSize: v })}
          />

          <div className="mt-6">
            <SliderField
              label="Tamanho dos Textos Secundários"
              value={config.eventoFontSize}
              min={10} max={36}
              onChange={(v) => onChange({ eventoFontSize: v })}
            />
          </div>
        </div>

        {/* Cores */}
        <div>
          <p className="text-[10px] font-black text-muted-subtle uppercase tracking-widest mb-4">Cores das Fontes</p>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-bold text-foreground mb-2">Nome do Aluno</label>
              <div className="flex items-center gap-2 bg-background border border-border p-1.5 rounded-xl focus-within:border-primary transition-colors min-h-[44px]">
                <input
                  type="color"
                  value={config.nomeColor}
                  onChange={(e) => onChange({ nomeColor: e.target.value })}
                  className="w-8 h-8 rounded-lg cursor-pointer bg-transparent border-0 p-0 ml-1"
                />
                <input
                  type="text"
                  value={config.nomeColor}
                  onChange={(e) => onChange({ nomeColor: e.target.value })}
                  className="w-full text-sm font-mono font-bold bg-transparent outline-none uppercase"
                />
              </div>
            </div>
            <div>
              <label className="block text-xs font-bold text-foreground mb-2">Textos Gerais</label>
              <div className="flex items-center gap-2 bg-background border border-border p-1.5 rounded-xl focus-within:border-primary transition-colors min-h-[44px]">
                <input
                  type="color"
                  value={config.eventoColor}
                  onChange={(e) => onChange({ eventoColor: e.target.value })}
                  className="w-8 h-8 rounded-lg cursor-pointer bg-transparent border-0 p-0 ml-1"
                />
                <input
                  type="text"
                  value={config.eventoColor}
                  onChange={(e) => onChange({ eventoColor: e.target.value })}
                  className="w-full text-sm font-mono font-bold bg-transparent outline-none uppercase"
                />
              </div>
            </div>
          </div>
        </div>

        {/* Alinhamento */}
        <div>
          <p className="text-[10px] font-black text-muted-subtle uppercase tracking-widest mb-4">Alinhamento Textual</p>
          <div className="flex gap-3">
            {(
              [
                { v: 'left', icon: AlignLeft },
                { v: 'center', icon: AlignCenter },
                { v: 'right', icon: AlignRight },
              ] as const
            ).map(({ v, icon: Icon }) => (
              <button
                key={v}
                type="button"
                onClick={() => onChange({ textAlign: v })}
                className={cls(
                  'flex-1 flex items-center justify-center py-3 rounded-xl border text-sm transition-all shadow-sm min-h-[44px]',
                  config.textAlign === v
                    ? 'bg-primary border-primary text-primary-fg'
                    : 'bg-card border-border text-muted hover:text-foreground hover:border-border-hover hover:bg-background-secondary',
                )}
                aria-label={`Alinhar ${v}`}
              >
                <Icon size={18} />
              </button>
            ))}
          </div>
        </div>

        {/* Posição Vertical */}
        <div>
          <p className="text-[10px] font-black text-muted-subtle uppercase tracking-widest mb-4">Ajuste de Altura</p>
          <SliderField
            label="Margem Superior do Nome"
            value={config.nomePosY}
            min={20} max={50}
            onChange={(v) => onChange({ nomePosY: v })}
          />
        </div>
      </div>
    </div>
  );
}

export function TemplateStudio({ config, onChange }: { config: TemplateConfig, onChange: (patch: Partial<TemplateConfig>) => void }) {
  const fileRef = useRef<HTMLInputElement>(null);

  function handleBackground(e: React.ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0];
    if (!file) return;
    if (config.backgroundUrl) URL.revokeObjectURL(config.backgroundUrl);
    onChange({ backgroundFile: file, backgroundUrl: URL.createObjectURL(file) });
  }

  function removeBackground() {
    if (config.backgroundUrl) URL.revokeObjectURL(config.backgroundUrl);
    onChange({ backgroundFile: null, backgroundUrl: '' });
    if (fileRef.current) fileRef.current.value = '';
  }

  return (
    <div className="space-y-6 lg:space-y-8">
      {/* Upload do fundo */}
      <div className="clubber-card p-5 sm:p-6">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-4">
          <div>
            <p className="text-base font-bold text-foreground">Imagem de Fundo do Certificado</p>
            <p className="text-xs font-medium text-muted mt-1">Formatos aceitos: PNG ou JPG · Proporção recomendada: A4 (1414 × 1000 pixels)</p>
          </div>
          {config.backgroundUrl && (
            <button
              type="button"
              onClick={removeBackground}
              className="clubber-chip bg-error-bg text-error-fg border-error-fg/20 hover:bg-error-bg hover:text-error-fg hover:border-error-fg/40 shrink-0"
            >
              <X size={14} strokeWidth={3} />
              Remover Imagem
            </button>
          )}
        </div>

        {config.backgroundUrl ? (
          <div className="relative rounded-xl overflow-hidden border border-border h-32 md:h-48 shadow-inner bg-background">
            <img src={config.backgroundUrl} alt="Fundo do Template" className="w-full h-full object-cover" />
            <div className="absolute inset-0 bg-black/30 flex items-center justify-center backdrop-blur-[2px]">
              <span className="text-white text-xs font-bold uppercase tracking-wider bg-black/60 px-4 py-2 rounded-lg border border-white/20">
                Fundo Carregado
              </span>
            </div>
          </div>
        ) : (
          <button
            type="button"
            onClick={() => fileRef.current?.click()}
            className="w-full border-2 border-dashed border-border hover:border-primary bg-background-secondary hover:bg-primary/5 rounded-2xl py-12 flex flex-col items-center gap-3 text-muted hover:text-primary transition-all group min-h-[140px]"
          >
            <div className="w-14 h-14 rounded-full bg-background border border-border group-hover:border-primary/40 flex items-center justify-center shadow-sm group-hover:scale-105 transition-transform">
              <ImagePlus size={24} strokeWidth={2} />
            </div>
            <span className="text-sm font-bold px-4 text-center">Clique para enviar a imagem base do layout</span>
          </button>
        )}
        <input ref={fileRef} type="file" accept="image/png, image/jpeg" className="hidden" onChange={handleBackground} />
      </div>
      <div className="grid grid-cols-1 xl:grid-cols-[1fr_340px] gap-6 items-start">
        {/* Coluna Esquerda: Preview (Sticky no Mobile para ficar sempre visível) */}
        <div className="space-y-6 min-w-0">
          <div className="sticky top-0 z-30 pt-2 pb-4 sm:pt-4 xl:static xl:pb-0 bg-background/95 xl:bg-transparent backdrop-blur-xl xl:backdrop-blur-none border-b border-border xl:border-none -mx-4 px-4 xl:mx-0 xl:px-0 shadow-[0_10px_20px_-10px_rgba(0,0,0,0.05)] xl:shadow-none">            <div className="clubber-card p-3 sm:p-5 bg-background-secondary/30">
            <div className="flex items-center justify-between mb-3 sm:mb-4">
              <p className="text-sm font-bold text-foreground">Visualização em Tempo Real</p>
              <span className="text-[10px] font-bold text-muted bg-border px-2.5 py-1 rounded-md uppercase tracking-wider">
                Demonstração
              </span>
            </div>
            <CertificadoPreview config={config} />
          </div>
          </div>
        </div>
        {/* Coluna Direita: Controles e Variáveis (Empilham naturalmente no mobile) */}
        <div className="space-y-6">
          <ControlesPainel config={config} onChange={onChange} />
          <PainelVariaveisMobile />
        </div>
      </div>
    </div>
  );
}