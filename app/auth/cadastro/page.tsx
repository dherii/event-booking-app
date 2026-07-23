// app/auth/cadastro/page.tsx
'use client';

import { useState, Suspense } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import Link from 'next/link';
import { Loader2 } from 'lucide-react';
import { createSupabaseBrowserClient } from '@/src/config/supabase-browser';

function CadastroForm() {
  const router = useRouter();
  const searchParams = useSearchParams();
const redirectTo = searchParams.get('redirect') || '/';
  const [nome, setNome] = useState('');
  const [email, setEmail] = useState('');
  const [senha, setSenha] = useState('');
  const [loading, setLoading] = useState(false);
  const [erro, setErro] = useState<string | null>(null);

  const criandoEstabelecimento = redirectTo === '/onboarding';

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setLoading(true);
    setErro(null);

    if (senha.length < 6) {
      setErro('A senha precisa ter pelo menos 6 caracteres.');
      setLoading(false);
      return;
    }

    const supabase = createSupabaseBrowserClient();
    const { error } = await supabase.auth.signUp({
      email,
      password: senha,
      options: {
        data: { nome }, // o trigger handle_new_user() lê isso pra criar o profile
      },
    });

    if (error) {
      setErro(error.message);
      setLoading(false);
      return;
    }

    // Por padrão o novo usuário nasce com role 'cliente' (default da tabela
    // profiles). Se veio pelo link de "cadastrar estabelecimento", o
    // redirect leva pro /onboarding, onde ele mesmo cria o estabelecimento
    // e é promovido a dono_estabelecimento automaticamente.
    router.push(`/auth/login?cadastro=sucesso&redirect=${encodeURIComponent(redirectTo)}`);
  }

  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-950 text-white p-4">
      <div className="w-full max-w-sm bg-gray-900 border border-gray-800 rounded-2xl p-8 space-y-6">
        <div>
          <h1 className="text-xl font-bold">
            {criandoEstabelecimento ? 'Cadastre seu estabelecimento' : 'Criar conta'}
          </h1>
          <p className="text-sm text-gray-400 mt-1">
            {criandoEstabelecimento
              ? 'Primeiro crie sua conta — no próximo passo você cadastra os dados da sua casa de eventos.'
              : 'Cadastre-se para comprar ingressos, mesas e camarotes.'}
          </p>
        </div>

        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="block text-xs font-semibold uppercase text-gray-400 mb-1">
              Nome
            </label>
            <input
              type="text"
              value={nome}
              onChange={(e) => setNome(e.target.value)}
              className="w-full bg-gray-950 border border-gray-800 rounded-lg p-2.5 text-sm text-white focus:outline-none focus:border-blue-500 transition-colors"
              required
            />
          </div>

          <div>
            <label className="block text-xs font-semibold uppercase text-gray-400 mb-1">
              E-mail
            </label>
            <input
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              className="w-full bg-gray-950 border border-gray-800 rounded-lg p-2.5 text-sm text-white focus:outline-none focus:border-blue-500 transition-colors"
              required
            />
          </div>

          <div>
            <label className="block text-xs font-semibold uppercase text-gray-400 mb-1">
              Senha
            </label>
            <input
              type="password"
              value={senha}
              onChange={(e) => setSenha(e.target.value)}
              className="w-full bg-gray-950 border border-gray-800 rounded-lg p-2.5 text-sm text-white focus:outline-none focus:border-blue-500 transition-colors"
              required
              minLength={6}
            />
          </div>

          {erro && (
            <p role="alert" className="text-sm text-red-400 bg-red-900/20 border border-red-900/40 rounded-lg px-3 py-2">
              {erro}
            </p>
          )}

          <button
            type="submit"
            disabled={loading}
            className="w-full flex items-center justify-center gap-2 bg-blue-600 hover:bg-blue-500 text-white font-semibold py-2.5 rounded-lg transition-all active:scale-[0.99] disabled:opacity-50"
          >
            {loading ? <Loader2 size={16} className="animate-spin" /> : null}
            {loading ? 'Criando conta…' : 'Criar conta'}
          </button>
        </form>

        <p className="text-center text-sm text-gray-500">
          Já tem conta?{' '}
          <Link href={`/auth/login${criandoEstabelecimento ? '?redirect=/onboarding' : ''}`} className="text-blue-400 hover:underline">
            Entrar
          </Link>
        </p>
      </div>
    </div>
  );
}

export default function CadastroPage() {
  return (
    <Suspense>
      <CadastroForm />
    </Suspense>
  );
}
