// src/features/cliente/components/PerfilForm.tsx
'use client';

import { useRef, useState } from 'react';
import { useRouter } from 'next/navigation';
import { Loader2, Save, Camera } from 'lucide-react';
import { atualizarPerfil } from '../actions';
import { createSupabaseBrowserClient } from '@/src/config/supabase-browser';
import type { MeuPerfil } from '../actions';

export function PerfilForm({ perfil }: { perfil: MeuPerfil }) {
  const router = useRouter();
  const fileRef = useRef<HTMLInputElement>(null);

  const [nome, setNome] = useState(perfil.nome ?? '');
  const [avatarUrl, setAvatarUrl] = useState(perfil.avatarUrl ?? '');
  const [avatarPreview, setAvatarPreview] = useState(perfil.avatarUrl ?? '');
  const [uploadingAvatar, setUploadingAvatar] = useState(false);

  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [salvo, setSalvo] = useState(false);

  async function handleAvatarChange(e: React.ChangeEvent<HTMLInputElement>) {
  const file = e.target.files?.[0];
  if (!file) return;

  if (!file.type.startsWith('image/')) {
    setError('Por favor, selecione um arquivo de imagem válido.');
    return;
  }

  if (file.size > 5 * 1024 * 1024) {
    setError('A imagem deve ter no máximo 5MB.');
    return;
  }

    

    setUploadingAvatar(true);
    setError(null);


    try {
      const supabase = createSupabaseBrowserClient();
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) throw new Error('Sessão expirada — faça login novamente.');

      const extensao = file.name.split('.').pop() ?? 'jpg';
      const caminho = `${user.id}/avatar-${crypto.randomUUID()}.${extensao}`;

      const { error: uploadError } = await supabase.storage
        .from('banners') // reaproveita o bucket já configurado
        .upload(caminho, file, { cacheControl: '3600', upsert: false });

      if (uploadError) throw new Error(uploadError.message);

      const { data: publicUrlData } = supabase.storage.from('banners').getPublicUrl(caminho);
      setAvatarUrl(publicUrlData.publicUrl);
      setAvatarPreview(publicUrlData.publicUrl);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Erro ao enviar a foto.');
    } finally {
      setUploadingAvatar(false);
    }
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setLoading(true);
    setError(null);
    setSalvo(false);

    try {
      await atualizarPerfil({ nome, avatarUrl: avatarUrl || null });
      setSalvo(true);
      router.refresh();
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Erro ao salvar o perfil.');
    } finally {
      setLoading(false);
    }
  }

  function iniciais(n: string) {
    return n.trim().split(/\s+/).slice(0, 2).map((p) => p[0]?.toUpperCase()).join('') || '?';
  }

  return (
    <form onSubmit={handleSubmit} className="clubber-card p-6 space-y-5">

      {/* Avatar */}
      <div className="flex flex-col items-center gap-3">
        <div className="relative">
          {avatarPreview ? (
            // eslint-disable-next-line @next/next/no-img-element
            <img
              src={avatarPreview}
              alt="Foto de perfil"
              className="w-24 h-24 rounded-full object-cover border-2 border-border"
            />
          ) : (
            <div className="w-24 h-24 rounded-full bg-gradient-to-br from-accent-purple to-accent-pink flex items-center justify-center text-white text-2xl font-black">
              {iniciais(nome || 'Você')}
            </div>
          )}

          <button
            type="button"
            onClick={() => fileRef.current?.click()}
            disabled={uploadingAvatar}
            className="absolute bottom-0 right-0 w-8 h-8 rounded-full bg-primary text-primary-fg flex items-center justify-center shadow-neon hover:bg-primary-hover transition-colors disabled:opacity-60"
            aria-label="Trocar foto"
          >
            {uploadingAvatar ? <Loader2 size={14} className="animate-spin" /> : <Camera size={14} />}
          </button>
        </div>

        <input ref={fileRef} type="file" accept="image/*" className="hidden" onChange={handleAvatarChange} />
        <p className="text-xs text-muted-subtle">Clique no ícone pra trocar a foto</p>
      </div>

      <div>
        <label className="block text-xs font-semibold uppercase text-muted-subtle mb-1">Nome</label>
        <input value={nome} onChange={(e) => setNome(e.target.value)} className="input-base" required />
      </div>

      <div>
        <label className="block text-xs font-semibold uppercase text-muted-subtle mb-1">E-mail</label>
        <input value={perfil.email} disabled className="input-base opacity-60 cursor-not-allowed" />
      </div>

      {error && (
        <p role="alert" className="text-sm text-error-fg bg-error-bg rounded-lg px-3 py-2">{error}</p>
      )}

      <div className="flex items-center justify-end gap-3">
        {salvo && <span className="text-sm text-success-fg font-medium">Salvo!</span>}
        <button
          type="submit"
          disabled={loading || uploadingAvatar}
          className="clubber-button disabled:opacity-60"
        >
          {loading ? <Loader2 size={16} className="animate-spin" /> : <Save size={16} />}
          {loading ? 'Salvando…' : 'Salvar alterações'}
        </button>
      </div>
    </form>
  );
}
