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

// ─── Helpers ──────────────────────────────────────────────────────────────────

function cls(...args: (string | false | undefined)[]) {
  return args.filter(Boolean).join(' ');
}

// ─── Painel de variáveis ──────────────────────────────────────────────────────

function PainelVariaveis() {
  const [copiado, setCopiado] = useState<string | null>(null);

  async function copiar(chave: string) {
    await navigator.clipboard.writeText(chave);
    setCopiado(chave);
    setTimeout(() => setCopiado(null), 1500);
  }

  return (
    <div className="bg-card border border-border rounded-xl overflow-hidden">
      <div className="px-4 py-3 border-b border-border">
        <p className="text-xs font-semibold text-foreground uppercase tracking-wide">Variáveis disponíveis</p>
        <p className="text-xs text-muted mt-0.5">Clique para copiar e colar no seu template</p>
      </div>
      <ul className="divide-y divide-border">
        {VARIAVEIS_TEMPLATE.map((v) => {
          const copied = copiado === v.chave;
          return (
            <li key={v.chave} className="flex items-center justify-between gap-2 px-4 py-2.5 hover:bg-border/30 transition-colors">
              <div className="min-w-0">
                <p className="text-xs font-mono font-semibold text-primary truncate">{v.chave}</p>
                <p className="text-[11px] text-muted truncate">{v.label}</p>
              </div>
              <button
                type="button"
                onClick={() => copiar(v.chave)}
                className={cls(
                  'p-1.5 rounded-lg transition-colors shrink-0',
                  copied
                    ? 'bg-success-bg text-success-fg'
                    : 'text-muted hover:text-foreground hover:bg-border',
                )}
                aria-label={`Copiar ${v.chave}`}
              >
                {copied ? <Check size={13} /> : <Copy size={13} />}
              </button>
            </li>
          );
        })}
      </ul>
    </div>
  );
}

// ─── Preview do certificado ───────────────────────────────────────────────────

interface PreviewProps {
  config: TemplateConfig;
}

const EXEMPLO: Record<string, string> = Object.fromEntries(
  VARIAVEIS_TEMPLATE.map((v) => [v.chave, v.exemplo]),
);

function CertificadoPreview({ config }: PreviewProps) {
  const {
    backgroundUrl, nomeFontSize, nomeColor,
    eventoFontSize, eventoColor, textAlign, fontFamily,
    nomePosX, nomePosY,
  } = config;

  const alignClass =
    textAlign === 'left'   ? 'text-left'   :
    textAlign === 'right'  ? 'text-right'  :
                             'text-center';

  return (
    <div
      className="relative w-full rounded-xl overflow-hidden border border-border shadow-lg"
      style={{ aspectRatio: '1.414 / 1', background: backgroundUrl ? 'transparent' : '#f8f4ec' }}
    >
      {/* Fundo */}
      {backgroundUrl ? (
        <img src={backgroundUrl} alt="Fundo do certificado" className="absolute inset-0 w-full h-full object-cover" />
      ) : (
        /* Placeholder de fundo — visual de certificado quando não há imagem */
        <div className="absolute inset-0 flex flex-col items-center justify-center"
          style={{ background: 'linear-gradient(135deg, #fdf6e3 0%, #f5e9c8 50%, #fdf6e3 100%)' }}
        >
          {/* Borda decorativa */}
          <div className="absolute inset-3 border-2 border-amber-300/40 rounded-lg pointer-events-none" />
          <div className="absolute inset-4 border border-amber-200/30 rounded-md pointer-events-none" />
        </div>
      )}

      {/* Camada de conteúdo — posicionamento absoluto com % */}
      <div
        className="absolute inset-0 flex flex-col"
        style={{ fontFamily }}
      >
        {/* Cabeçalho fixo */}
        <div className={cls('pt-[6%] px-[8%]', alignClass)}>
          <p
            className="font-bold tracking-widest uppercase"
            style={{ fontSize: `clamp(10px, ${eventoFontSize * 0.35}px, 18px)`, color: eventoColor, letterSpacing: '0.2em' }}
          >
            {EXEMPLO['{{NOME_INSTITUICAO}}']}
          </p>
          <p
            className="mt-1 font-medium"
            style={{ fontSize: `clamp(8px, ${eventoFontSize * 0.28}px, 13px)`, color: eventoColor, opacity: 0.7 }}
          >
            Certifica que
          </p>
        </div>

        {/* Nome do aluno — posicionado via nomePosY */}
        <div
          className={cls('px-[8%]', alignClass)}
          style={{ marginTop: `${nomePosY - 20}%` }}
        >
          <p
            className="font-bold leading-tight"
            style={{ fontSize: `clamp(14px, ${nomeFontSize * 0.55}px, 42px)`, color: nomeColor }}
          >
            {EXEMPLO['{{NOME_ALUNO}}']}
          </p>
        </div>

        {/* Dados do evento */}
        <div className={cls('px-[8%] mt-[3%]', alignClass)}>
          <p
            className="font-medium"
            style={{ fontSize: `clamp(8px, ${eventoFontSize * 0.4}px, 16px)`, color: eventoColor, opacity: 0.75 }}
          >
            participou de
          </p>
          <p
            className="font-semibold mt-0.5 leading-snug"
            style={{ fontSize: `clamp(10px, ${eventoFontSize * 0.48}px, 20px)`, color: eventoColor }}
          >
            {EXEMPLO['{{NOME_EVENTO}}']}
          </p>
          <p
            className="mt-0.5"
            style={{ fontSize: `clamp(7px, ${eventoFontSize * 0.32}px, 13px)`, color: eventoColor, opacity: 0.6 }}
          >
            {EXEMPLO['{{DATA_EVENTO}}']} · {EXEMPLO['{{CARGA_HORARIA}}']}
          </p>
        </div>

        {/* Rodapé */}
        <div className={cls('absolute bottom-[6%] left-0 right-0 px-[8%]', alignClass)}>
          <p style={{ fontSize: `clamp(6px, ${eventoFontSize * 0.26}px, 11px)`, color: eventoColor, opacity: 0.4 }}>
            Código: {EXEMPLO['{{CODIGO_VALIDACAO}}']} · Emitido em {EXEMPLO['{{DATA_EMISSAO}}']}
          </p>
        </div>
      </div>
    </div>
  );
}

// ─── Painel de controles ──────────────────────────────────────────────────────

interface ControlesProps {
  config: TemplateConfig;
  onChange: (patch: Partial<TemplateConfig>) => void;
}

function SliderField({
  label, value, min, max, onChange,
}: {
  label: string; value: number; min: number; max: number;
  onChange: (v: number) => void;
}) {
  return (
    <div>
      <div className="flex justify-between mb-1">
        <span className="text-xs font-medium text-foreground">{label}</span>
        <span className="text-xs text-muted">{value}px</span>
      </div>
      <input
        type="range"
        min={min}
        max={max}
        value={value}
        onChange={(e) => onChange(Number(e.target.value))}
        className="w-full h-1.5 rounded-full appearance-none bg-border cursor-pointer accent-primary"
      />
    </div>
  );
}

function ControlesPainel({ config, onChange }: ControlesProps) {
  return (
    <div className="bg-card border border-border rounded-xl overflow-hidden">
      <div className="px-4 py-3 border-b border-border">
        <p className="text-xs font-semibold text-foreground uppercase tracking-wide">Controles visuais</p>
      </div>

      <div className="p-4 space-y-5">
        {/* Tipografia */}
        <div>
          <p className="text-[11px] font-semibold text-muted uppercase tracking-wide mb-3">Tipografia</p>

          <div className="mb-4 relative">
            <label className="block text-xs font-medium text-foreground mb-1">Família</label>
            <select
              className="input-base text-sm appearance-none pr-8"
              value={config.fontFamily}
              onChange={(e) => onChange({ fontFamily: e.target.value as TemplateConfig['fontFamily'] })}
            >
              <option value="serif">Serif (clássico)</option>
              <option value="sans-serif">Sans-serif (moderno)</option>
              <option value="monospace">Monospace (técnico)</option>
            </select>
            <ChevronDown size={13} className="absolute right-3 top-[58%] text-muted pointer-events-none" />
          </div>

          <SliderField
            label="Tamanho — Nome do aluno"
            value={config.nomeFontSize}
            min={20} max={72}
            onChange={(v) => onChange({ nomeFontSize: v })}
          />

          <div className="mt-4">
            <SliderField
              label="Tamanho — Textos secundários"
              value={config.eventoFontSize}
              min={10} max={36}
              onChange={(v) => onChange({ eventoFontSize: v })}
            />
          </div>
        </div>

        {/* Cores */}
        <div>
          <p className="text-[11px] font-semibold text-muted uppercase tracking-wide mb-3">Cores</p>
          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="block text-xs font-medium text-foreground mb-1">Nome do aluno</label>
              <div className="flex items-center gap-2">
                <input
                  type="color"
                  value={config.nomeColor}
                  onChange={(e) => onChange({ nomeColor: e.target.value })}
                  className="w-8 h-8 rounded-lg border border-border cursor-pointer bg-transparent p-0.5"
                />
                <input
                  type="text"
                  value={config.nomeColor}
                  onChange={(e) => onChange({ nomeColor: e.target.value })}
                  className="input-base text-xs font-mono py-1.5"
                />
              </div>
            </div>
            <div>
              <label className="block text-xs font-medium text-foreground mb-1">Textos gerais</label>
              <div className="flex items-center gap-2">
                <input
                  type="color"
                  value={config.eventoColor}
                  onChange={(e) => onChange({ eventoColor: e.target.value })}
                  className="w-8 h-8 rounded-lg border border-border cursor-pointer bg-transparent p-0.5"
                />
                <input
                  type="text"
                  value={config.eventoColor}
                  onChange={(e) => onChange({ eventoColor: e.target.value })}
                  className="input-base text-xs font-mono py-1.5"
                />
              </div>
            </div>
          </div>
        </div>

        {/* Alinhamento */}
        <div>
          <p className="text-[11px] font-semibold text-muted uppercase tracking-wide mb-3">Alinhamento</p>
          <div className="flex gap-2">
            {(
              [
                { v: 'left',   icon: AlignLeft   },
                { v: 'center', icon: AlignCenter  },
                { v: 'right',  icon: AlignRight   },
              ] as const
            ).map(({ v, icon: Icon }) => (
              <button
                key={v}
                type="button"
                onClick={() => onChange({ textAlign: v })}
                className={cls(
                  'flex-1 flex items-center justify-center py-2 rounded-lg border text-sm transition-all',
                  config.textAlign === v
                    ? 'bg-primary/10 border-primary text-primary'
                    : 'border-border text-muted hover:text-foreground hover:border-input-border-focus',
                )}
                aria-label={`Alinhar ${v}`}
              >
                <Icon size={15} />
              </button>
            ))}
          </div>
        </div>

        {/* Posição vertical do nome */}
        <div>
          <p className="text-[11px] font-semibold text-muted uppercase tracking-wide mb-3">Posição</p>
          <SliderField
            label="Posição vertical do nome"
            value={config.nomePosY}
            min={30} max={70}
            onChange={(v) => onChange({ nomePosY: v })}
          />
        </div>
      </div>
    </div>
  );
}

// ─── Componente principal ─────────────────────────────────────────────────────

interface TemplateStudioProps {
  config: TemplateConfig;
  onChange: (patch: Partial<TemplateConfig>) => void;
}

export function TemplateStudio({ config, onChange }: TemplateStudioProps) {
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
    <div className="space-y-6">

      {/* Upload do fundo */}
      <div className="bg-card border border-border rounded-xl p-5">
        <div className="flex items-center justify-between mb-3">
          <div>
            <p className="text-sm font-semibold text-foreground">Imagem de fundo</p>
            <p className="text-xs text-muted mt-0.5">PNG ou JPG · Proporção recomendada: A4 paisagem (1414×1000)</p>
          </div>
          {config.backgroundUrl && (
            <button
              type="button"
              onClick={removeBackground}
              className="flex items-center gap-1.5 text-xs text-error-fg hover:underline"
            >
              <X size={13} />
              Remover
            </button>
          )}
        </div>

        {config.backgroundUrl ? (
          <div className="relative rounded-lg overflow-hidden border border-border h-24">
            <img src={config.backgroundUrl} alt="Fundo" className="w-full h-full object-cover" />
            <div className="absolute inset-0 bg-black/20 flex items-center justify-center">
              <span className="text-white text-xs font-medium bg-black/40 px-2 py-1 rounded">Fundo carregado</span>
            </div>
          </div>
        ) : (
          <button
            type="button"
            onClick={() => fileRef.current?.click()}
            className="w-full border-2 border-dashed border-border hover:border-primary rounded-xl py-6 flex flex-col items-center gap-2 text-muted hover:text-primary transition-colors group"
          >
            <ImagePlus size={24} strokeWidth={1.5} className="group-hover:scale-110 transition-transform" />
            <span className="text-sm font-medium">Clique para enviar a imagem de fundo</span>
          </button>
        )}
        <input ref={fileRef} type="file" accept="image/*" className="hidden" onChange={handleBackground} />
      </div>

      {/* Layout principal: Preview + painéis laterais */}
      <div className="grid grid-cols-1 xl:grid-cols-[1fr_280px] gap-5">

        {/* Coluna esquerda: preview + variáveis (mobile: empilhado) */}
        <div className="space-y-5 min-w-0">
          <div>
            <div className="flex items-center justify-between mb-2">
              <p className="text-sm font-semibold text-foreground">Preview</p>
              <span className="text-xs text-muted bg-border px-2 py-0.5 rounded-full">Não é o tamanho real</span>
            </div>
            <CertificadoPreview config={config} />
          </div>

          {/* Variáveis — visível em mobile aqui, oculto no xl (fica na coluna direita) */}
          <div className="xl:hidden">
            <PainelVariaveis />
          </div>
        </div>

        {/* Coluna direita: controles + variáveis (apenas xl+) */}
        <div className="space-y-4">
          <ControlesPainel config={config} onChange={onChange} />
          <div className="hidden xl:block">
            <PainelVariaveis />
          </div>
        </div>
      </div>
    </div>
  );
}