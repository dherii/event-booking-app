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
    <form onSubmit={handleSubmit} className="clubber-card p-6 space-y-4">
      <div>
        <label className="block text-xs font-semibold uppercase text-muted-subtle mb-1">
          Nome do estabelecimento *
        </label>
        <input
          type="text"
          value={nome}
          onChange={(e) => setNome(e.target.value)}
          placeholder="Ex: UOU Pub"
          className="input-base"
          required
        />
        <p className="text-xs text-muted-subtle mt-1">
          Sua página ficará em: <span className="text-primary font-mono">/{slugPreview}</span>
        </p>
      </div>

      <div>
        <label className="block text-xs font-semibold uppercase text-muted-subtle mb-1">
          Cidade
        </label>
        <input
          type="text"
          value={cidade}
          onChange={(e) => setCidade(e.target.value)}
          placeholder="Quixadá - CE"
          className="input-base"
        />
      </div>

      <div>
        <label className="block text-xs font-semibold uppercase text-muted-subtle mb-1">
          Instagram
        </label>
        <input
          type="text"
          value={instagram}
          onChange={(e) => setInstagram(e.target.value)}
          placeholder="uoupub"
          className="input-base"
        />
      </div>

      {error && (
        <p role="alert" className="text-sm text-error-fg bg-error-bg rounded-lg px-3 py-2">
          {error}
        </p>
      )}

      <button
        type="submit"
        disabled={loading}
        className="clubber-button w-full disabled:opacity-50"
      >
        {loading ? <Loader2 size={16} className="animate-spin" /> : <Rocket size={16} />}
        {loading ? 'Criando…' : 'Criar meu estabelecimento'}
      </button>
    </form>
  );
}
