'use client';

import { useState } from 'react';
import { ShieldCheck, CheckCircle } from 'lucide-react';

export function FormDadosBancarios() {
  const [chavePix, setChavePix] = useState('');
  const [salvo, setSalvo] = useState(false);

  const handleSalvar = (e: React.FormEvent) => {
    e.preventDefault();
    // Aqui no futuro você salva essa chavePix no Supabase
    setSalvo(true);
    setTimeout(() => setSalvo(false), 3000);
  };

  return (
    <div className="bg-card border border-border rounded-xl p-6">
      <div className="flex items-center gap-3 mb-4">
        <div className="p-2 bg-primary/10 text-primary rounded-lg">
          <ShieldCheck size={24} />
        </div>
        <div>
          <h2 className="text-lg font-semibold">Dados para Repasse (PIX)</h2>
          <p className="text-sm text-muted">Cadastre a chave PIX do Centro Acadêmico para receber suas vendas.</p>
        </div>
      </div>

      <form onSubmit={handleSalvar} className="space-y-4">
        <div>
          <label className="block text-sm font-medium mb-1">Chave PIX</label>
          <input
            type="text"
            placeholder="CPF, CNPJ, E-mail, Celular ou Chave Aleatória"
            className="w-full px-4 py-2 bg-background border border-border rounded-lg text-sm"
            value={chavePix}
            onChange={(e) => setChavePix(e.target.value)}
            required
          />
        </div>

        <button
          type="submit"
          className="px-4 py-2 bg-primary text-primary-fg font-semibold rounded-lg hover:bg-primary-hover flex items-center gap-2 transition-colors"
        >
          {salvo ? <><CheckCircle size={18} /> Salvo!</> : 'Salvar Chave PIX'}
        </button>
      </form>
    </div>
  );
}