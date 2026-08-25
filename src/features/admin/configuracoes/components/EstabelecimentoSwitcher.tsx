// src/features/admin/configuracoes/components/EstabelecimentoSwitcher.tsx
'use client';

import { useState, useTransition } from 'react';
import { Building2, ChevronDown, Loader2 } from 'lucide-react';
import { selecionarEstabelecimentoAction } from '../actions';

interface Estabelecimento {
  id: string;
  nome: string;
}

export function EstabelecimentoSwitcher({
  estabelecimentos,
  estabelecimentoAtualId,
  isSuperAdmin,
}: {
  estabelecimentos: Estabelecimento[];
  estabelecimentoAtualId: string;
  isSuperAdmin?: boolean;
}) {
  const [selected, setSelected] = useState(estabelecimentoAtualId);
  const [isPending, startTransition] = useTransition();

  function handleChange(e: React.ChangeEvent<HTMLSelectElement>) {
    const novoId = e.target.value;
    setSelected(novoId);
    
    startTransition(async () => {
      await selecionarEstabelecimentoAction(novoId);
      window.location.reload();
    });
  }

  if (!estabelecimentos || estabelecimentos.length === 0) return null;

  return (
    <div className="flex items-center gap-2 bg-slate-100 border border-slate-200 px-3 py-1.5 rounded-xl">
      <Building2 size={16} className="text-blue-600 shrink-0" />
      <div className="relative flex items-center">
        <select
          value={selected}
          onChange={handleChange}
          disabled={isPending}
          className="bg-transparent text-xs font-semibold text-slate-800 focus:outline-none cursor-pointer appearance-none pr-6"
        >
          {isSuperAdmin && (
            <option value="Todos">Todos</option>
          )}

          {estabelecimentos.map((est) => (
            <option key={est.id} value={est.id}>
              {est.nome}
            </option>
          ))}
        </select>
        {isPending ? (
          <Loader2 size={14} className="animate-spin text-slate-400 absolute right-0 pointer-events-none" />
        ) : (
          <ChevronDown size={14} className="text-slate-400 absolute right-0 pointer-events-none" />
        )}
      </div>
    </div>
  );
}