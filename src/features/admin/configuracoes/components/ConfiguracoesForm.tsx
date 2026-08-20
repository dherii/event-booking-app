// src/features/admin/configuracoes/components/ConfiguracoesForm.tsx
'use client';

import { useRef, useState } from 'react';
import { useRouter } from 'next/navigation';
import { Loader2, Save, ImagePlus } from 'lucide-react';
import { atualizarEstabelecimento } from '../actions';
import { createSupabaseBrowserClient } from '@/src/config/supabase-browser';

interface Estabelecimento {
  id: string;
  nome: string;
  descricao: string | null;
  cidade: string | null;
  instagram_handle: string | null;
  cor_tema: string | null;
  logo_url: string | null;
  slug: string;
}

export function ConfiguracoesForm({ estabelecimento }: { estabelecimento: Estabelecimento | null }) {
  const router = useRouter();
  const fileRef = useRef<HTMLInputElement>(null);

  const [nome, setNome] = useState(estabelecimento?.nome ?? '');
  const [descricao, setDescricao] = useState(estabelecimento?.descricao ?? '');
  const [cidade, setCidade] = useState(estabelecimento?.cidade ?? '');
  const [instagram, setInstagram] = useState(estabelecimento?.instagram_handle ?? '');
  const [corTema, setCorTema] = useState(estabelecimento?.cor_tema ?? '#3b82f6');
  const [logoUrl, setLogoUrl] = useState(estabelecimento?.logo_url ?? '');
  const [logoPreview, setLogoPreview] = useState(estabelecimento?.logo_url ?? '');
  const [uploadingLogo, setUploadingLogo] = useState(false);

  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [salvo, setSalvo] = useState(false);

  async function handleLogoChange(e: React.ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0];
    if (!file) return;

    setUploadingLogo(true);
    setError(null);

    try {
      const supabase = createSupabaseBrowserClient();
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) throw new Error('Sessão expirada — faça login novamente.');

      const extensao = file.name.split('.').pop() ?? 'jpg';
      const caminho = `${user.id}/logo-${crypto.randomUUID()}.${extensao}`;

      const { error: uploadError } = await supabase.storage
        .from('banners')
        .upload(caminho, file, { cacheControl: '3600', upsert: false });

      if (uploadError) throw new Error(uploadError.message);

      const { data: publicUrlData } = supabase.storage.from('banners').getPublicUrl(caminho);
      setLogoUrl(publicUrlData.publicUrl);
      setLogoPreview(publicUrlData.publicUrl);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Erro ao enviar a logo.');
    } finally {
      setUploadingLogo(false);
    }
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setLoading(true);
    setError(null);
    setSalvo(false);

    try {
      await atualizarEstabelecimento({
        nome,
        descricao,
        cidade,
        instagramHandle: instagram,
        corTema,
        logoUrl: logoUrl || null,
      });
      setSalvo(true);
      router.refresh();
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Erro ao salvar as configurações.');
    } finally {
      setLoading(false);
    }
  }

  return (
    <form onSubmit={handleSubmit} className="bg-white border border-slate-200/80 rounded-2xl p-6 space-y-5 text-slate-800 shadow-sm">
      <div className="flex items-center justify-between border-b border-slate-100 pb-4">
        <h2 className="text-base font-semibold text-slate-900">Dados do estabelecimento</h2>
        <span className="text-xs text-slate-500 bg-slate-100 px-2.5 py-1 rounded-md font-mono">
          /{estabelecimento?.slug ?? 'sem-slug'}
        </span>
      </div>

      {/* Logo */}
      <div className="flex items-center gap-4">
        <div className="w-16 h-16 rounded-xl bg-slate-100 border border-slate-200 overflow-hidden flex items-center justify-center shrink-0">
          {logoPreview ? (
            // eslint-disable-next-line @next/next/no-img-element
            <img src={logoPreview} alt="Logo" className="w-full h-full object-cover" />
          ) : (
            <ImagePlus size={22} className="text-slate-400" />
          )}
        </div>
        <div>
          <button
            type="button"
            onClick={() => fileRef.current?.click()}
            disabled={uploadingLogo}
            className="text-sm font-medium text-blue-600 hover:text-blue-700 hover:underline disabled:opacity-60 transition-colors"
          >
            {uploadingLogo ? 'Enviando…' : 'Trocar logo'}
          </button>
          <p className="text-xs text-slate-400 mt-0.5">PNG ou JPG, quadrada de preferência</p>
        </div>
        <input ref={fileRef} type="file" accept="image/*" className="hidden" onChange={handleLogoChange} />
      </div>

      <div>
        <label className="block text-xs font-medium text-slate-700 mb-1.5">Nome do estabelecimento</label>
        <input
          className="w-full bg-slate-50 border border-slate-200 rounded-lg px-3.5 py-2.5 text-sm text-slate-900 placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 transition-all"
          value={nome}
          onChange={(e) => setNome(e.target.value)}
          required
        />
      </div>

      <div>
        <label className="block text-xs font-medium text-slate-700 mb-1.5">Descrição</label>
        <textarea
          className="w-full bg-slate-50 border border-slate-200 rounded-lg px-3.5 py-2.5 text-sm text-slate-900 placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 transition-all resize-none"
          rows={3}
          value={descricao}
          onChange={(e) => setDescricao(e.target.value)}
        />
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
        <div>
          <label className="block text-xs font-medium text-slate-700 mb-1.5">Cidade</label>
          <input
            className="w-full bg-slate-50 border border-slate-200 rounded-lg px-3.5 py-2.5 text-sm text-slate-900 placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 transition-all"
            value={cidade}
            onChange={(e) => setCidade(e.target.value)}
            placeholder="Quixadá - CE"
          />
        </div>
        <div>
          <label className="block text-xs font-medium text-slate-700 mb-1.5">Instagram</label>
          <input
            className="w-full bg-slate-50 border border-slate-200 rounded-lg px-3.5 py-2.5 text-sm text-slate-900 placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 transition-all"
            value={instagram}
            onChange={(e) => setInstagram(e.target.value)}
            placeholder="uoupub"
          />
        </div>
      </div>

      <div>
        <label className="block text-xs font-medium text-slate-700 mb-1.5">Cor do tema</label>
        <div className="flex items-center gap-3">
          <input
            type="color"
            value={corTema}
            onChange={(e) => setCorTema(e.target.value)}
            className="w-10 h-10 rounded-lg border border-slate-200 cursor-pointer bg-slate-50 p-1"
          />
          <input
            type="text"
            className="w-36 bg-slate-50 border border-slate-200 rounded-lg px-3.5 py-2 text-sm text-slate-900 font-mono focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 transition-all"
            value={corTema}
            onChange={(e) => setCorTema(e.target.value)}
          />
        </div>
      </div>

      {error && (
        <p role="alert" className="bg-red-50 border border-red-200 text-red-600 text-sm px-4 py-3 rounded-xl">
          {error}
        </p>
      )}

      <div className="flex items-center justify-end gap-3 pt-3 border-t border-slate-100">
        {salvo && <span className="text-sm text-emerald-600 font-medium">Salvo com sucesso!</span>}
        <button
          type="submit"
          disabled={loading || uploadingLogo}
          className="flex items-center gap-2 px-5 py-2.5 rounded-xl text-sm font-semibold bg-blue-600 hover:bg-blue-700 text-white transition-all shadow-sm disabled:opacity-60 cursor-pointer"
        >
          {loading ? <Loader2 size={16} className="animate-spin" /> : <Save size={16} />}
          {loading ? 'Salvando…' : 'Salvar alterações'}
        </button>
      </div>
    </form>
  );
}