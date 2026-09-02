'use client';

import { useState } from 'react';
import { Copy, Check } from 'lucide-react';

interface PixCopyButtonProps {
  codigo: string;
}

export default function PixCopyButton({ codigo }: PixCopyButtonProps) {
  const [copiado, setCopiado] = useState(false);
  const [erro, setErro] = useState(false);

  async function copiarPix() {
    try {
      await navigator.clipboard.writeText(codigo);
      setCopiado(true);
      setErro(false);
      setTimeout(() => setCopiado(false), 1800);
    } catch {
      setErro(true);
      setTimeout(() => setErro(false), 2500);
    }
  }

  return (
    <div className="space-y-1.5">
      <button
        onClick={copiarPix}
        className="flex min-h-[48px] w-full items-center gap-2.5 rounded-xl border border-border bg-background px-3 py-2.5 text-left transition-colors hover:border-primary/50"
      >
        <span className="flex-1 break-all font-mono text-xs text-foreground">{codigo}</span>
        <span className={`shrink-0 rounded-lg p-1.5 transition-colors ${copiado ? 'bg-success-bg text-success-fg' : 'text-muted'}`}>
          {copiado ? <Check size={16} /> : <Copy size={16} />}
        </span>
      </button>
      {copiado && <p className="text-xs text-success-fg text-center">Código Pix copiado!</p>}
      {erro && <p className="text-xs text-error-fg text-center">Não foi possível copiar o código.</p>}
    </div>
  );
}
