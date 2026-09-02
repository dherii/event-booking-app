'use client';

import { useTransition } from 'react';
import { Trash2 } from 'lucide-react';
import { deletarEvento } from '@/src/features/admin/eventos/actions';

interface BotaoDeletarEventoProps {
  eventoId: string;
  nomeEvento: string;
}

export function BotaoDeletarEvento({ eventoId, nomeEvento }: BotaoDeletarEventoProps) {
  const [isPending, startTransition] = useTransition();

  function handleDelete(e: React.MouseEvent) {
    e.preventDefault();
    e.stopPropagation();

    if (confirm(`Tem certeza que deseja deletar o evento "${nomeEvento}"?`)) {
      startTransition(async () => {
        try {
          await deletarEvento(eventoId);
        } catch (err) {
          alert(err instanceof Error ? err.message : 'Erro ao deletar evento.');
        }
      });
    }
  }

  return (
    <button
      type="button"
      onClick={handleDelete}
      disabled={isPending}
      className="p-1.5 rounded-lg text-muted-subtle hover:text-error-fg hover:bg-error-bg transition-colors disabled:opacity-50 shrink-0"
      title="Deletar evento"
    >
      <Trash2 size={16} />
    </button>
  );
}