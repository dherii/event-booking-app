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
  const [aceitouTermos, setAceitouTermos] = useState(false);
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

    if (!aceitouTermos) {
      setErro('Você precisa aceitar os Termos de Uso e a Política de Privacidade para continuar.');
      setLoading(false);
      return;
    }

    const supabase = createSupabaseBrowserClient();
    const { error } = await supabase.auth.signUp({
      email,
      password: senha,
      options: { data: { nome } },
    });

    if (error) {
      setErro(error.message);
      setLoading(false);
      return;
    }

    router.push(`/auth/login?cadastro=sucesso&redirect=${encodeURIComponent(redirectTo)}`);
  }

  return (
    <div className="min-h-screen flex items-center justify-center bg-background text-foreground p-4">
      <div className="w-full max-w-sm">
        <div className="flex items-center justify-center gap-2 mb-8">
          <div className="w-8 h-8 rounded-xl bg-gradient-to-br from-accent-purple to-accent-pink flex items-center justify-center shadow-purple">
            <span className="text-white font-black text-sm">C</span>
          </div>
          <span className="text-lg font-black text-brand-gradient">Clubber</span>
        </div>

        <div className="clubber-card p-8 space-y-6">
          <div>
            <h1 className="text-xl font-black">
              {criandoEstabelecimento ? 'Cadastre seu estabelecimento' : 'Criar conta'}
            </h1>
            <p className="text-sm text-muted mt-1">
              {criandoEstabelecimento
                ? 'Primeiro crie sua conta — no próximo passo você cadastra os dados da sua casa de eventos.'
                : 'Cadastre-se para comprar ingressos, mesas e camarotes.'}
            </p>
          </div>

          <form onSubmit={handleSubmit} className="space-y-4">
            <div>
              <label className="block text-xs font-semibold uppercase text-muted-subtle mb-1">Nome</label>
              <input type="text" value={nome} onChange={(e) => setNome(e.target.value)} className="input-base" required />
            </div>

            <div>
              <label className="block text-xs font-semibold uppercase text-muted-subtle mb-1">E-mail</label>
              <input type="email" value={email} onChange={(e) => setEmail(e.target.value)} className="input-base" required />
            </div>

            <div>
              <label className="block text-xs font-semibold uppercase text-muted-subtle mb-1">Senha</label>
              <input type="password" value={senha} onChange={(e) => setSenha(e.target.value)} className="input-base" required minLength={6} />
            </div>

            <label className="flex items-start gap-2.5 text-xs text-muted cursor-pointer">
              <input
                type="checkbox"
                checked={aceitouTermos}
                onChange={(e) => setAceitouTermos(e.target.checked)}
                className="mt-0.5 accent-primary"
                required
              />
              <span>
                Li e concordo com os{' '}
                <Link href="/termos-de-uso" target="_blank" className="text-primary hover:underline">Termos de Uso</Link>{' '}
                e a{' '}
                <Link href="/politica-de-privacidade" target="_blank" className="text-primary hover:underline">Política de Privacidade</Link>.
              </span>
            </label>

            {erro && (
              <p role="alert" className="text-sm text-error-fg bg-error-bg rounded-lg px-3 py-2">
                {erro}
              </p>
            )}

            <button
              type="submit"
              disabled={loading || !aceitouTermos}
              className="clubber-button w-full disabled:opacity-50"
            >
              {loading ? <Loader2 size={16} className="animate-spin" /> : null}
              {loading ? 'Criando conta…' : 'Criar conta'}
            </button>
          </form>

          <p className="text-center text-sm text-muted">
            Já tem conta?{' '}
            <Link href={`/auth/login${criandoEstabelecimento ? '?redirect=/onboarding' : ''}`} className="text-primary hover:underline">
              Entrar
            </Link>
          </p>
        </div>
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
