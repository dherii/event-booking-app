// src/features/onboarding/components/OnboardingForm.tsx
'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { Loader2, Rocket } from 'lucide-react';
import { criarEstabelecimento } from '../actions';

function gerarSlugPreview(nome: string) {
  return nome
    .toLowerCase()
    .normalize('NFD')
    .replace(/[\u0300-\u036f]/g, '')
    .replace(/[^a-z0-9\s-]/g, '')
    .trim()
    .replace(/\s+/g, '-')
    .replace(/-+/g, '-');
}

export function OnboardingForm() {
  const router = useRouter();
  const [nome, setNome] = useState('');
  const [cidade, setCidade] = useState('');
  const [instagram, setInstagram] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const slugPreview = gerarSlugPreview(nome) || 'seu-estabelecimento';

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setLoading(true);
    setError(null);

    try {
      await criarEstabelecimento({ nome, cidade, instagramHandle: instagram });
      router.push('/admin');
      router.refresh();
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Erro ao criar o estabelecimento.');
      setLoading(false);
    }
  }

  return (
    <form onSubmit={handleSubmit} className="bg-gray-900 border border-gray-800 rounded-2xl p-6 space-y-4">
      <div>
        <label className="block text-xs font-semibold uppercase text-gray-400 mb-1">
          Nome do estabelecimento *
        </label>
        <input
          type="text"
          value={nome}
          onChange={(e) => setNome(e.target.value)}
          placeholder="Ex: UOU Pub"
          className="w-full bg-gray-950 border border-gray-800 rounded-lg p-2.5 text-sm text-white focus:outline-none focus:border-blue-500 transition-colors"
          required
        />
        <p className="text-xs text-gray-500 mt-1">
          Sua página ficará em: <span className="text-blue-400 font-mono">/{slugPreview}</span>
        </p>
      </div>

      <div>
        <label className="block text-xs font-semibold uppercase text-gray-400 mb-1">
          Cidade
        </label>
        <input
          type="text"
          value={cidade}
          onChange={(e) => setCidade(e.target.value)}
          placeholder="Quixadá - CE"
          className="w-full bg-gray-950 border border-gray-800 rounded-lg p-2.5 text-sm text-white focus:outline-none focus:border-blue-500 transition-colors"
        />
      </div>

      <div>
        <label className="block text-xs font-semibold uppercase text-gray-400 mb-1">
          Instagram
        </label>
        <input
          type="text"
          value={instagram}
          onChange={(e) => setInstagram(e.target.value)}
          placeholder="uoupub"
          className="w-full bg-gray-950 border border-gray-800 rounded-lg p-2.5 text-sm text-white focus:outline-none focus:border-blue-500 transition-colors"
        />
      </div>

      {error && (
        <p role="alert" className="text-sm text-red-400 bg-red-900/20 border border-red-900/40 rounded-lg px-3 py-2">
          {error}
        </p>
      )}

      <button
        type="submit"
        disabled={loading}
        className="w-full flex items-center justify-center gap-2 bg-blue-600 hover:bg-blue-500 text-white font-semibold py-2.5 rounded-lg transition-all active:scale-[0.99] disabled:opacity-50"
      >
        {loading ? <Loader2 size={16} className="animate-spin" /> : <Rocket size={16} />}
        {loading ? 'Criando…' : 'Criar meu estabelecimento'}
      </button>
    </form>
  );
}
