// src/features/onboarding/actions.ts
'use server'

import { getSupabaseAdmin } from '@/src/config/supabase';
import { createSupabaseServerClient } from '@/src/config/supabase-server';

function gerarSlug(nome: string) {
  return nome
    .toLowerCase()
    .normalize('NFD')
    .replace(/[\u0300-\u036f]/g, '') 
    .replace(/[^a-z0-9\s-]/g, '')
    .trim()
    .replace(/\s+/g, '-')
    .replace(/-+/g, '-');
}

interface CriarEstabelecimentoInput {
  nome: string;
  slug?: string;
  cidade: string;
  instagramHandle?: string;
}

export async function criarEstabelecimento(data: CriarEstabelecimentoInput) {
  const supabaseAuth = await createSupabaseServerClient();
  const { data: { user } } = await supabaseAuth.auth.getUser();
  if (!user) throw new Error('Você precisa estar logado.');

  const { data: profile } = await supabaseAuth
    .from('profiles')
    .select('estabelecimento_id')
    .eq('id', user.id)
    .single();

  if (profile?.estabelecimento_id) {
    throw new Error('Sua conta já está vinculada a um estabelecimento.');
  }

  if (!data.nome.trim()) {
    throw new Error('Informe o nome do estabelecimento.');
  }

  const supabase = getSupabaseAdmin();
  const slugBase = gerarSlug(data.slug?.trim() || data.nome);

  if (!slugBase) {
    throw new Error('Não foi possível gerar um identificador válido a partir do nome informado.');
  }

  // Garante slug único — tenta o base e, se já existir, sufixa com número
  let slugFinal = slugBase;
  let tentativa = 1;
  while (true) {
    const { data: existente } = await supabase
      .from('estabelecimentos')
      .select('id')
      .eq('slug', slugFinal)
      .maybeSingle();

    if (!existente) break;
    tentativa += 1;
    slugFinal = `${slugBase}-${tentativa}`;
    if (tentativa > 20) throw new Error('Não foi possível gerar um identificador único. Tente outro nome.');
  }

  const { data: estabelecimento, error: errEstab } = await supabase
    .from('estabelecimentos')
    .insert({
      owner_user_id: user.id,
      nome: data.nome,
      slug: slugFinal,
      cidade: data.cidade,
      instagram_handle: data.instagramHandle || null,
    })
    .select()
    .single();

  if (errEstab || !estabelecimento) {
    throw new Error(errEstab?.message ?? 'Erro ao criar o estabelecimento.');
  }

  const { error: errPerfil } = await supabase
    .from('profiles')
    .update({
      role: 'dono_estabelecimento',
      estabelecimento_id: estabelecimento.id,
    })
    .eq('id', user.id);

  if (errPerfil) {
    // rollback do estabelecimento se não conseguir vincular o dono
    await supabase.from('estabelecimentos').delete().eq('id', estabelecimento.id);
    throw new Error(errPerfil.message);
  }

  return { success: true, estabelecimentoId: estabelecimento.id, slug: slugFinal };
}
