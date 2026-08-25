// src/features/admin/participantes/components/TabelaFrequencia.tsx
'use client';

import { useState, useTransition, useMemo } from 'react';
import { Search, Loader2 } from 'lucide-react';
import type { Inscrito } from '../types';
import { alternarFrequencia } from '../actions';

interface Props {
  inscritos: Inscrito[];
}

export function TabelaFrequencia({ inscritos: inscritosIniciais }: Props) {
  const [isPending, startTransition] = useTransition();
  const [busca, setBusca] = useState('');
  
  // Estado local para otimização otimista (UI atualiza antes do servidor responder)
  const [lista, setLista] = useState<Inscrito[]>(inscritosIniciais);

  // Filtra por nome ou CPF
  const filtrados = useMemo(() => {
    const q = busca.toLowerCase().trim();
    if (!q) return lista;
    return lista.filter((i) => 
      i.nome.toLowerCase().includes(q) || 
      i.cpf.includes(q)
    );
  }, [lista, busca]);

  function handleCheckin(inscricaoId: string, diaNumero: number, presenteAtual: boolean) {
    // Atualização Otimista na UI
    setLista((prev) => prev.map((inscrito) => {
      if (inscrito.id !== inscricaoId) return inscrito;
      
      const freqAtuais = inscrito.frequencias ?? [];
      const jaExiste = freqAtuais.find((f) => f.diaNumero === diaNumero);
      
      const novasFreq = jaExiste 
        ? freqAtuais.map((f) => f.diaNumero === diaNumero ? { ...f, presente: !presenteAtual } : f)
        : [...freqAtuais, { diaNumero, presente: !presenteAtual }];

      return { ...inscrito, frequencias: novasFreq };
    }));

    // Chamada ao servidor
    startTransition(async () => {
      try {
        await alternarFrequencia(inscricaoId, diaNumero, presenteAtual);
      } catch (err) {
        alert('Erro ao registrar presença. Recarregue a página.');
      }
    });
  }

  // Componente interno para renderizar os dias em linha
  const DiasFrequencia = ({ inscrito }: { inscrito: Inscrito }) => {
    const totalDias = inscrito.diasEvento ?? 1;
    const mapaFreq = new Map(inscrito.frequencias?.map((f) => [f.diaNumero, f.presente]));

    return (
      <div className="flex flex-wrap gap-3">
        {Array.from({ length: totalDias }, (_, i) => i + 1).map((dia) => {
          const presente = mapaFreq.get(dia) ?? false;
          return (
            <label 
              key={dia} 
              className={`flex items-center gap-2 px-3 py-2 rounded-lg border transition-all cursor-pointer ${
                presente 
                  ? 'bg-emerald-50 border-emerald-200 text-emerald-800' 
                  : 'bg-slate-50 border-slate-200 text-slate-600 hover:bg-slate-100'
              }`}
            >
              <input
                type="checkbox"
                disabled={isPending || inscrito.status !== 'pago'}
                checked={presente}
                onChange={() => handleCheckin(inscrito.id, dia, presente)}
                className="w-4 h-4 text-emerald-600 rounded border-slate-300 focus:ring-emerald-500 cursor-pointer disabled:opacity-50"
              />
              <span className="text-xs font-bold whitespace-nowrap">Dia {dia}</span>
            </label>
          );
        })}
      </div>
    );
  };

  return (
    <div className="space-y-4">
      {/* Barra de Busca */}
      <div className="relative max-w-md">
        <Search size={16} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400 pointer-events-none" />
        <input
          type="text"
          className="w-full bg-white border border-slate-200 rounded-xl pl-10 pr-4 py-2.5 text-sm text-slate-900 placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 transition-all shadow-sm"
          placeholder="Buscar participante por nome ou CPF..."
          value={busca}
          onChange={(e) => setBusca(e.target.value)}
        />
        {isPending && <Loader2 size={16} className="absolute right-3.5 top-1/2 -translate-y-1/2 text-blue-500 animate-spin" />}
      </div>

      {/* Visualização Híbrida: Tabela para Desktop / Cards para Mobile */}
      <div className="bg-white border border-slate-200 rounded-2xl overflow-hidden shadow-sm">
        
        {/* Layout Desktop */}
        <div className="hidden md:block overflow-x-auto">
          <table className="w-full text-sm text-left">
            <thead className="bg-slate-50 text-xs uppercase text-slate-500 font-semibold border-b border-slate-200">
              <tr>
                <th className="px-6 py-4">Participante</th>
                <th className="px-6 py-4">Status</th>
                <th className="px-6 py-4">Frequência</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {filtrados.map((p) => (
                <tr key={p.id} className={`hover:bg-slate-50/80 transition-colors ${p.status !== 'pago' ? 'opacity-60' : ''}`}>
                  <td className="px-6 py-4">
                    <p className="font-semibold text-slate-900">{p.nome}</p>
                    <p className="text-xs text-slate-500">{p.cpf}</p>
                  </td>
                  <td className="px-6 py-4">
                    <span className={`text-xs font-semibold px-2.5 py-1 rounded-full ${
                      p.status === 'pago' ? 'bg-emerald-100 text-emerald-700' : 'bg-amber-100 text-amber-700'
                    }`}>
                      {p.status === 'pago' ? 'Confirmado' : 'Pendente'}
                    </span>
                  </td>
                  <td className="px-6 py-4">
                    <DiasFrequencia inscrito={p} />
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>

        {/* Layout Mobile */}
        <div className="md:hidden flex flex-col divide-y divide-slate-100">
          {filtrados.map((p) => (
            <div key={p.id} className={`p-4 space-y-3 ${p.status !== 'pago' ? 'opacity-60' : ''}`}>
              <div className="flex justify-between items-start">
                <div>
                  <p className="font-bold text-slate-900 text-sm">{p.nome}</p>
                  <p className="text-xs text-slate-500">{p.cpf}</p>
                </div>
                <span className={`text-[10px] font-semibold px-2 py-0.5 rounded-full ${
                  p.status === 'pago' ? 'bg-emerald-100 text-emerald-700' : 'bg-amber-100 text-amber-700'
                }`}>
                  {p.status === 'pago' ? 'Confirmado' : 'Pendente'}
                </span>
              </div>
              
              <div className="pt-2 border-t border-slate-50">
                <p className="text-[10px] uppercase text-slate-400 font-bold mb-2 tracking-wider">Marcar Presença</p>
                <DiasFrequencia inscrito={p} />
              </div>
            </div>
          ))}
        </div>

        {filtrados.length === 0 && (
          <div className="p-8 text-center text-sm text-slate-500">
            Nenhum participante encontrado com os filtros atuais.
          </div>
        )}
      </div>
    </div>
  );
}