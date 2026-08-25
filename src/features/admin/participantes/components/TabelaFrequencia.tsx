// src/features/admin/participantes/components/TabelaFrequencia.tsx
'use client';

import { useState, useTransition } from 'react';
import { Calendar, Check, X, SlidersHorizontal, Loader2 } from 'lucide-react';
import type { Inscrito } from '../types';
import { alternarFrequencia } from '../actions';

interface Props {
  inscritos: Inscrito[];
}

export function TabelaFrequencia({ inscritos }: Props) {
  const [isPending, startTransition] = useTransition();
  const [participanteSelecionado, setParticipanteSelecionado] = useState<Inscrito | null>(null);

  function handleCheckin(inscricaoId: string, diaNumero: number, presenteAtual: boolean) {
    startTransition(async () => {
      try {
        await alternarFrequencia(inscricaoId, diaNumero, presenteAtual);
        
        // Atualiza também o estado local do modal aberto para refletir na hora
        if (participanteSelecionado && participanteSelecionado.id === inscricaoId) {
          const freqAtuais = participanteSelecionado.frequencias ?? [];
          const jaExiste = freqAtuais.find((f) => f.diaNumero === diaNumero);
          
          let novasFreq;
          if (jaExiste) {
            novasFreq = freqAtuais.map((f) => 
              f.diaNumero === diaNumero ? { ...f, presente: !presenteAtual } : f
            );
          } else {
            novasFreq = [...freqAtuais, { diaNumero, presente: !presenteAtual }];
          }

          setParticipanteSelecionado({
            ...participanteSelecionado,
            frequencias: novasFreq,
          });
        }
      } catch (err) {
        alert('Erro ao marcar presença.');
      }
    });
  }

  return (
    <div className="space-y-4">
      <div className="bg-white border border-slate-200 rounded-2xl overflow-hidden shadow-sm">
        <div className="overflow-x-auto">
          <table className="w-full text-sm text-left">
            <thead className="bg-slate-50 text-xs uppercase text-slate-500 font-semibold border-b border-slate-200">
              <tr>
                <th className="px-6 py-4">Participante</th>
                <th className="px-6 py-4">Evento</th>
                <th className="px-6 py-4 text-center">Progresso Geral</th>
                <th className="px-6 py-4 text-right">Ações</th>
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

                    <td className="px-6 py-4 text-right">
                      <button
                        type="button"
                        onClick={() => setParticipanteSelecionado(p)}
                        className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl border border-slate-200 bg-white text-slate-700 text-xs font-semibold hover:bg-slate-50 transition-all cursor-pointer shadow-xs"
                      >
                        <SlidersHorizontal size={14} className="text-slate-500" />
                        Gerenciar Dias
                      </button>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      </div>

      {/* Modal de Gerenciamento de Frequência por Dias */}
      {participanteSelecionado && (
        <div className="fixed inset-0 z-50 bg-slate-900/40 backdrop-blur-xs flex items-center justify-center p-4 animate-in fade-in duration-200">
          <div className="bg-white border border-slate-200 rounded-2xl max-w-md w-full p-6 space-y-5 shadow-xl animate-in zoom-in-95 duration-200">
            <div className="flex items-start justify-between">
              <div>
                <h3 className="text-base font-bold text-slate-900">Frequência por Dias</h3>
                <p className="text-xs text-slate-500 mt-0.5">
                  {participanteSelecionado.nome} · {participanteSelecionado.evento}
                </p>
              </div>
              <button
                onClick={() => setParticipanteSelecionado(null)}
                className="w-8 h-8 rounded-full bg-slate-100 hover:bg-slate-200 flex items-center justify-center text-slate-500 transition-all cursor-pointer"
              >
                <X size={16} />
              </button>
            </div>

            <div className="space-y-2.5 max-h-[60vh] overflow-y-auto pr-1">
              {Array.from({ length: participanteSelecionado.diasEvento ?? 1 }, (_, i) => i + 1).map((dia) => {
                const mapaFreq = new Map(participanteSelecionado.frequencias?.map((f) => [f.diaNumero, f.presente]));
                const presente = mapaFreq.get(dia) ?? false;

                return (
                  <label
                    key={dia}
                    className={`flex items-center justify-between p-3.5 rounded-xl border transition-all cursor-pointer ${
                      presente
                        ? 'bg-emerald-50/60 border-emerald-200 text-emerald-900'
                        : 'bg-slate-50/60 border-slate-200 text-slate-700 hover:bg-slate-100/80'
                    }`}
                  >
                    <div className="flex items-center gap-3">
                      <div
                        className={`w-8 h-8 rounded-lg flex items-center justify-center ${
                          presente ? 'bg-emerald-100 text-emerald-700' : 'bg-slate-200 text-slate-600'
                        }`}
                      >
                        <Calendar size={16} />
                      </div>
                      <div>
                        <p className="text-xs font-bold uppercase tracking-wider">Dia {dia}</p>
                        <p className="text-[11px] text-slate-500">
                          {presente ? 'Presença confirmada' : 'Ausente'}
                        </p>
                      </div>
                    </div>

                    <input
                      type="checkbox"
                      disabled={isPending}
                      checked={presente}
                      onChange={() => handleCheckin(participanteSelecionado.id, dia, presente)}
                      className="w-5 h-5 text-emerald-600 rounded border-slate-300 focus:ring-emerald-500/20 focus:ring-2 cursor-pointer disabled:opacity-50"
                    />
                  </label>
                );
              })}
            </div>

            <div className="pt-2">
              <button
                type="button"
                onClick={() => setParticipanteSelecionado(null)}
                className="w-full py-2.5 rounded-xl bg-slate-900 text-white text-xs font-semibold hover:bg-slate-800 transition-all cursor-pointer shadow-xs"
              >
                Concluir
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}