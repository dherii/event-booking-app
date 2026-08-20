'use client';

import { useTransition } from 'react';
import { Check, X } from 'lucide-react';
import type { Inscrito } from '../types';
import { alternarFrequencia } from '../actions';

interface Props {
  inscritos: Inscrito[];
}

export function TabelaFrequencia({ inscritos }: Props) {
  const [isPending, startTransition] = useTransition();

  const maxDias = Math.max(...inscritos.map((i) => i.diasEvento ?? 1), 1);
  const colunasDias = Array.from({ length: maxDias }, (_, i) => i + 1);

  function handleCheckin(inscricaoId: string, diaNumero: number, presenteAtual: boolean) {
    startTransition(async () => {
      try {
        await alternarFrequencia(inscricaoId, diaNumero, presenteAtual);
      } catch (err) {
        alert('Erro ao marcar presença.');
      }
    });
  }

  return (
    <div className="bg-white border border-slate-200 rounded-2xl overflow-hidden shadow-sm">
      <div className="overflow-x-auto">
        <table className="w-full text-sm text-left">
          <thead className="bg-slate-50 text-xs uppercase text-slate-500 font-semibold border-b border-slate-200">
            <tr>
              <th className="px-6 py-4">Participante</th>
              <th className="px-6 py-4">Evento</th>
              {colunasDias.map((dia) => (
                <th key={dia} className="px-3 py-4 text-center">
                  Dia {dia}
                </th>
              ))}
              <th className="px-6 py-4 text-center">Total</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-100">
            {inscritos.map((p) => {
              const totalDiasInscrito = p.diasEvento ?? 1;
              const mapaFreq = new Map(p.frequencias?.map((f) => [f.diaNumero, f.presente]));
              const totalPresencas = Array.from(mapaFreq.values()).filter(Boolean).length;
              const concluiuTodos = totalPresencas === totalDiasInscrito;

              return (
                <tr key={p.id} className="hover:bg-slate-50/80 transition-colors">
                  <td className="px-6 py-4">
                    <p className="font-semibold text-slate-900">{p.nome}</p>
                    <p className="text-xs text-slate-500">{p.email || p.codigoIngresso}</p>
                  </td>
                  <td className="px-6 py-4 text-xs text-slate-600">
                    <p className="font-medium text-slate-800">{p.evento}</p>
                    <span className="text-[11px] text-slate-400">
                      ({totalDiasInscrito} {totalDiasInscrito === 1 ? 'dia' : 'dias'})
                    </span>
                  </td>

                  {colunasDias.map((dia) => {
                    if (dia > totalDiasInscrito) {
                      return (
                        <td key={dia} className="px-3 py-4 text-center bg-slate-50/40">
                          <span className="text-slate-300 text-xs">—</span>
                        </td>
                      );
                    }

                    const presente = mapaFreq.get(dia) ?? false;
                    return (
                      <td key={dia} className="px-3 py-4 text-center">
                        <button
                          type="button"
                          disabled={isPending}
                          onClick={() => handleCheckin(p.id, dia, presente)}
                          className={`w-9 h-9 rounded-xl border flex items-center justify-center mx-auto transition-all cursor-pointer disabled:opacity-50 ${
                            presente
                              ? 'bg-emerald-500 border-emerald-600 text-white shadow-sm'
                              : 'bg-slate-50 border-slate-200 text-slate-300 hover:border-slate-400 hover:text-slate-500'
                          }`}
                          title={`Marcar/Desmarcar Dia ${dia}`}
                        >
                          {presente ? <Check size={16} strokeWidth={2.5} /> : <X size={14} className="opacity-40" />}
                        </button>
                      </td>
                    );
                  })}

                  <td className="px-6 py-4 text-center">
                    <span
                      className={`inline-flex items-center px-2.5 py-1 rounded-full text-xs font-bold ${
                        concluiuTodos
                          ? 'bg-emerald-50 text-emerald-700 border border-emerald-200'
                          : 'bg-slate-100 text-slate-600 font-medium'
                      }`}
                    >
                      {totalPresencas}/{totalDiasInscrito} {totalDiasInscrito === 1 ? 'dia' : 'dias'}
                    </span>
                  </td>
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>
    </div>
  );
}