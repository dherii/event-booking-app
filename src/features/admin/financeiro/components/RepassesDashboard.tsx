// src/features/admin/financeiro/components/RepassesDashboard.tsx
'use client';

import React from 'react';
import type { SaldoPendente } from '../repasses-actions';

interface RepassesDashboardProps {
  saldos: SaldoPendente[];
}

export function RepassesDashboard({ saldos }: RepassesDashboardProps) {
  return (
    <div className="bg-white border border-slate-200 rounded-2xl p-6 shadow-sm">
      <h3 className="text-base font-semibold text-slate-900 mb-4">Lista de Repasses Pendentes</h3>
      
      {saldos.length === 0 ? (
        <p className="text-xs text-slate-500">Nenhum repasse pendente encontrado no momento.</p>
      ) : (
        <div className="space-y-3">
          {saldos.map((s) => (
            <div key={s.id} className="flex items-center justify-between p-4 border border-slate-100 rounded-xl">
              <div>
                <p className="font-medium text-slate-900">{s.nomeEstabelecimento}</p>
                <p className="text-xs text-slate-500">Total de vendas: {s.totalVendas.toLocaleString('pt-BR', { style: 'currency', currency: 'BRL' })}</p>
              </div>
              <div className="text-right">
                <p className="text-sm font-bold text-emerald-600">
                  {s.valorLiquido.toLocaleString('pt-BR', { style: 'currency', currency: 'BRL' })}
                </p>
                <p className="text-[10px] text-slate-400">Valor a repassar</p>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}