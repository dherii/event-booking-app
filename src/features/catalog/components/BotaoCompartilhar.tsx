'use client';

import { useState } from 'react';
import { Share2, Check } from 'lucide-react';

export function BotaoCompartilhar({ eventoNome, eventoId }: { eventoNome: string; eventoId: string }) {
  const [copiado, setCopiado] = useState(false);

  async function compartilhar() {
    const url = `${window.location.origin}/eventos/${eventoId}`;

    if (navigator.share) {
      try {
        await navigator.share({ title: eventoNome, text: `Dá uma olhada nesse evento: ${eventoNome}`, url });
      } catch {
        // usuário cancelou
      }
      return;
    }

    await navigator.clipboard.writeText(url);
    setCopiado(true);
    setTimeout(() => setCopiado(false), 1500);
  }

  return (
    <button
      onClick={compartilhar}
      className="flex items-center gap-2 rounded-xl bg-card border border-border px-3.5 py-2 text-xs font-bold text-muted hover:text-foreground hover:border-primary/40 transition-all shadow-sm cursor-pointer"
    >
      {copiado ? <Check size={15} className="text-success-fg" /> : <Share2 size={15} />}
      {copiado ? 'Link copiado!' : 'Compartilhar'}
    </button>
  );
}