// src/features/catalog/actions.ts
'use server'

import { getSupabaseAdmin } from '@/src/config/supabase';
import { createSupabaseServerClient } from '@/src/config/supabase-server';

export async function listarMeusFavoritosIds(): Promise<string[]> {
  const supabaseAuth = await createSupabaseServerClient();
  const { data: { user } } = await supabaseAuth.auth.getUser();
  if (!user) return [];

  const supabase = getSupabaseAdmin();
  const { data } = await supabase
    .from('favoritos')
    .select('evento_id')
    .eq('usuario_id', user.id);

  return (data ?? []).map((f) => f.evento_id);
}

export async function toggleFavorito(eventoId: string): Promise<{ favoritado: boolean }> {
  const supabaseAuth = await createSupabaseServerClient();
  const { data: { user } } = await supabaseAuth.auth.getUser();
  if (!user) throw new Error('Você precisa estar logado.');

  const supabase = getSupabaseAdmin();

  const { data: existente } = await supabase
    .from('favoritos')
    .select('id')
    .eq('usuario_id', user.id)
    .eq('evento_id', eventoId)
    .maybeSingle();

  if (existente) {
    await supabase.from('favoritos').delete().eq('id', existente.id);
    return { favoritado: false };
  }

  await supabase.from('favoritos').insert({ usuario_id: user.id, evento_id: eventoId });
  return { favoritado: true };
}

export async function listarMeusFavoritos() {
  const supabaseAuth = await createSupabaseServerClient();
  const { data: { user } } = await supabaseAuth.auth.getUser();
  if (!user) return [];

  const supabase = getSupabaseAdmin();
  const { data, error } = await supabase
    .from('favoritos')
    .select(`
      evento_id,
      eventos!inner ( *, estabelecimentos ( id, nome, slug, logo_url ), lotes ( * ) )
    `)
    .eq('usuario_id', user.id)
    .order('created_at', { ascending: false });

  if (error) {
    console.error('Erro ao buscar favoritos:', error);
    return [];
  }

  return (data ?? []).map((f) => (Array.isArray(f.eventos) ? f.eventos[0] : f.eventos));
}
