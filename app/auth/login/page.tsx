'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { supabase } from '@/src/config/supabase';
import Link from 'next/link';

export default function LoginPage() {
    const router = useRouter();
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState<string | null>(null);
const [isDarkMode, setIsDarkMode] = useState(() => {
    if (typeof window === 'undefined') return false;

    const theme = localStorage.getItem('theme');
    const prefersDark = window.matchMedia('(prefers-color-scheme: dark)').matches;

    return theme === 'dark' || (!theme && prefersDark);
});
   useEffect(() => {
    document.documentElement.classList.toggle('dark', isDarkMode);
    localStorage.setItem('theme', isDarkMode ? 'dark' : 'light');
}, [isDarkMode]);

    const toggleTheme = () => {
    setIsDarkMode((prev) => !prev);
};

    const handleLogin = async (e: React.FormEvent) => {
        e.preventDefault();
        setLoading(true);
        setError(null);

        const { error } = await supabase.auth.signInWithPassword({ email, password });

        if (error) {
            setError(error.message);
            setLoading(false);
        } else {
            router.push('/ingressos');
        }
    };

    const handleOAuthLogin = async () => {
        const { error } = await supabase.auth.signInWithOAuth({
            provider: 'google',
            options: { redirectTo: `${window.location.origin}/api/auth/callback` },
        });
        if (error) setError(error.message);
    };

    return (
        <div className="min-h-screen flex items-center justify-center bg-background text-foreground transition-colors duration-300 px-4">

            {/* Botão de tema */}
            <button
                onClick={toggleTheme}
                className="absolute top-6 right-6 p-2 rounded-full bg-border text-foreground hover:scale-105 transition-transform"
                aria-label="Alternar tema"
            >
                {isDarkMode ? <SunIcon /> : <MoonIcon />}
            </button>

            {/* Card */}
            <div className="max-w-md w-full bg-card rounded-2xl shadow-xl p-8 space-y-6 border border-border">

                <div className="text-center">
                    <h1 className="text-3xl font-bold tracking-tight text-foreground">
                        Entre com sua conta
                    </h1>
                    <p className="text-sm text-muted mt-2">
                        Acesse sua conta para gerenciar seus ingressos
                    </p>
                </div>

                {error && (
                    <p role="alert" className="bg-error-bg text-error-fg px-4 py-3 rounded-lg text-sm text-center">
                        {error}
                    </p>
                )}

                <form onSubmit={handleLogin} className="space-y-4">
                    <Field label="E-mail acadêmico">
                        <input
                            type="email"
                            value={email}
                            onChange={(e) => setEmail(e.target.value)}
                            className="input-base"
                            placeholder="aluno@unicatolica.edu.br"
                            required
                            autoComplete="email"
                        />
                    </Field>

                    <Field
                        label="Senha"
                        action={
                            <Link href="/auth/recuperar-senha" className="text-xs text-primary hover:underline">
                                Esqueceu a senha?
                            </Link>
                        }
                    >
                        <input
                            type="password"
                            value={password}
                            onChange={(e) => setPassword(e.target.value)}
                            className="input-base"
                            placeholder="••••••••"
                            required
                            autoComplete="current-password"
                        />
                    </Field>

                    <button
                        type="submit"
                        disabled={loading}
                        className="w-full bg-primary hover:bg-primary-hover text-primary-fg font-medium py-2.5 rounded-lg transition-colors flex justify-center disabled:opacity-60"
                    >
                        {loading ? 'Entrando…' : 'Entrar'}
                    </button>
                </form>

                <Divider label="ou continue com" />

                <button
                    onClick={handleOAuthLogin}
                    type="button"
                    className="w-full flex items-center justify-center gap-2 px-4 py-2 border border-input-border rounded-lg hover:bg-border transition-colors text-sm font-medium text-foreground"
                >
                    <GoogleIcon />
                    Continuar com o Google
                </button>

                <p className="text-center text-sm text-muted">
                    Ainda não tem conta?{' '}
                    <Link href="/auth/signup" className="font-medium text-primary hover:underline">
                        Crie sua conta agora
                    </Link>
                </p>
            </div>
        </div>
    );
}

/* ─── Componentes auxiliares ─────────────────────────────────────────────── */

function Field({
    label,
    action,
    children,
}: {
    label: string;
    action?: React.ReactNode;
    children: React.ReactNode;
}) {
    return (
        <div>
            <div className="flex justify-between mb-1">
                <label className="block text-sm font-medium text-foreground">{label}</label>
                {action}
            </div>
            {children}
        </div>
    );
}

function Divider({ label }: { label: string }) {
    return (
        <div className="relative flex items-center py-2">
            <div className="flex-grow border-t border-border" />
            <span className="flex-shrink-0 mx-4 text-sm text-muted-subtle">{label}</span>
            <div className="flex-grow border-t border-border" />
        </div>
    );
}

function SunIcon() {
    return (
        <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" aria-hidden>
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 3v1m0 16v1m9-9h-1M4 12H3m15.364 6.364l-.707-.707M6.343 6.343l-.707-.707m12.728 0l-.707.707M6.343 17.657l-.707.707M16 12a4 4 0 11-8 0 4 4 0 018 0z" />
        </svg>
    );
}

function MoonIcon() {
    return (
        <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" aria-hidden>
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M20.354 15.354A9 9 0 018.646 3.646 9.003 9.003 0 0012 21a9.003 9.003 0 008.354-5.646z" />
        </svg>
    );
}

function GoogleIcon() {
    return (
        <svg className="w-5 h-5" viewBox="0 0 24 24" aria-hidden>
            <path d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z" fill="#4285F4" />
            <path d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z" fill="#34A853" />
            <path d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z" fill="#FBBC05" />
            <path d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z" fill="#EA4335" />
        </svg>
    );
}