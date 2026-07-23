// src/features/admin/configuracoes/actions.ts
'use server'

import { getSupabaseAdmin } from '@/src/config/supabase';
import { createSupabaseServerClient } from '@/src/config/supabase-server';

// ─── Helper: confirma que o usuário é dono/super_admin e retorna o estabelecimento_id ──

async function exigirDono() {
  const supabaseAuth = await createSupabaseServerClient();
  const { data: { user } } = await supabaseAuth.auth.getUser();
  if (!user) throw new Error('Você precisa estar logado.');

  const { data: profile } = await supabaseAuth
    .from('profiles')
    .select('estabelecimento_id, role')
    .eq('id', user.id)
    .single();

  if (!profile || !['super_admin', 'dono_estabelecimento'].includes(profile.role)) {
    throw new Error('Apenas o dono do estabelecimento pode acessar isso.');
  }

  if (!profile.estabelecimento_id) {
    throw new Error('Seu usuário não está vinculado a nenhum estabelecimento.');
  }

  return { userId: user.id, estabelecimentoId: profile.estabelecimento_id, role: profile.role };
}

// ─── Dados do estabelecimento ────────────────────────────────────────────────

export async function buscarEstabelecimento() {
  const { estabelecimentoId } = await exigirDono();
  const supabase = getSupabaseAdmin();

  const { data, error } = await supabase
    .from('estabelecimentos')
    .select('*')
    .eq('id', estabelecimentoId)
    .single();

  if (error || !data) throw new Error('Estabelecimento não encontrado.');
  return data;
}

interface AtualizarEstabelecimentoInput {
  nome: string;
  descricao: string;
  cidade: string;
  instagramHandle: string;
  corTema: string;
  logoUrl?: string | null;
}

export async function atualizarEstabelecimento(data: AtualizarEstabelecimentoInput) {
  const { estabelecimentoId } = await exigirDono();
  const supabase = getSupabaseAdmin();

  const payload: Record<string, unknown> = {
    nome: data.nome,
    descricao: data.descricao,
    cidade: data.cidade,
    instagram_handle: data.instagramHandle,
    cor_tema: data.corTema,
  };

  if (data.logoUrl !== undefined) {
    payload.logo_url = data.logoUrl;
  }

  const { error } = await supabase
    .from('estabelecimentos')
    .update(payload)
    .eq('id', estabelecimentoId);

  if (error) throw new Error(error.message);
  return { success: true };
}

// ─── Equipe (staff_checkin) ──────────────────────────────────────────────────

export interface MembroEquipe {
  id: string;
  nome: string | null;
  email: string;
  role: string;
}

export async function listarEquipe(): Promise<MembroEquipe[]> {
  const { estabelecimentoId } = await exigirDono();
  const supabase = getSupabaseAdmin();

  const { data: profiles, error } = await supabase
    .from('profiles')
    .select('id, nome, role')
    .eq('estabelecimento_id', estabelecimentoId)
    .in('role', ['dono_estabelecimento', 'staff_checkin', 'super_admin']);

  if (error) throw new Error(error.message);
  if (!profiles || profiles.length === 0) return [];

  // E-mail vive em auth.users — busca um por um (lista pequena, ok pro MVP)
  const membros: MembroEquipe[] = [];
  for (const p of profiles) {
    const { data: authUser } = await supabase.auth.admin.getUserById(p.id);
    membros.push({
      id: p.id,
      nome: p.nome,
      email: authUser?.user?.email ?? '—',
      role: p.role,
    });
  }

  return membros;
}

export async function convidarStaff(email: string) {
  const { estabelecimentoId } = await exigirDono();
  const supabase = getSupabaseAdmin();

  const { data, error } = await supabase.auth.admin.inviteUserByEmail(email);

  if (error) {
    // Já existe usuário com esse e-mail — trata como caso conhecido
    if (error.message.toLowerCase().includes('already registered')) {
      throw new Error('Já existe uma conta com esse e-mail. Peça pra pessoa se cadastrar normalmente e depois vincule manualmente.');
    }
    throw new Error(error.message);
  }

  if (!data.user) throw new Error('Convite enviado, mas não foi possível vincular o perfil.');

  // O trigger handle_new_user() já criou o profile com role padrão 'cliente' —
  // agora promovemos pra staff_checkin do estabelecimento certo.
  const { error: errPerfil } = await supabase
    .from('profiles')
    .update({ role: 'staff_checkin', estabelecimento_id: estabelecimentoId })
    .eq('id', data.user.id);

  if (errPerfil) throw new Error(errPerfil.message);

  return { success: true };
}

export async function revogarAcesso(userId: string) {
  const { estabelecimentoId, userId: meuId } = await exigirDono();

  if (userId === meuId) {
    throw new Error('Você não pode revogar o próprio acesso.');
  }

  const supabase = getSupabaseAdmin();

  const { error } = await supabase
    .from('profiles')
    .update({ role: 'cliente', estabelecimento_id: null })
    .eq('id', userId)
    .eq('estabelecimento_id', estabelecimentoId); // trava extra de segurança

  if (error) throw new Error(error.message);
  return { success: true };
}
