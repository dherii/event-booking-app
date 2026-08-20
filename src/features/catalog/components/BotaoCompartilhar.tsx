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
        // usuário cancelou o compartilhamento — não faz nada
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
      className="flex items-center gap-1.5 text-xs font-medium text-muted hover:text-primary transition-colors"
    >
      {copiado ? <Check size={14} className="text-success-fg" /> : <Share2 size={14} />}
      {copiado ? 'Link copiado!' : 'Compartilhar'}
    </button>
  );
}
