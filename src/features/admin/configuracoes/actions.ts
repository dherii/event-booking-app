// src/features/admin/configuracoes/actions.ts
'use server';

import { getSupabaseAdmin } from '@/src/config/supabase';
import { createSupabaseServerClient } from '@/src/config/supabase-server';
import { cookies } from 'next/headers';

// ─── Helper: Verifica permissões e gerencia o contexto do Estabelecimento ───

export async function exigirDonoOuAdmin() {
  const supabaseAuth = await createSupabaseServerClient();

  const {
    data: { user },
  } = await supabaseAuth.auth.getUser();

  if (!user) {
    throw new Error('Você precisa estar logado.');
  }

  const { data: profile, error: profileError } = await supabaseAuth
    .from('profiles')
    .select('estabelecimento_id, role')
    .eq('id', user.id)
    .single();

  if (profileError || !profile) {
    throw new Error('Perfil não encontrado.');
  }

  if (
    !['super_admin', 'dono_estabelecimento'].includes(profile.role)
  ) {
    throw new Error('Acesso negado.');
  }

  const isSuperAdmin = profile.role === 'super_admin';

  const cookieStore = await cookies();

  const cookieEstabelecimento =
    cookieStore.get('admin_estabelecimento_id')?.value;

  // Se for super admin e o cookie for 'Todos', permitimos o modo global
  const isGlobal = isSuperAdmin && cookieEstabelecimento === 'Todos';

  let estabelecimentoId: string | null =
    isSuperAdmin && cookieEstabelecimento
      ? cookieEstabelecimento
      : profile.estabelecimento_id;

  if (isSuperAdmin && !estabelecimentoId && !isGlobal) {
    const supabase = getSupabaseAdmin();

    const { data: primeiroEstabelecimento, error } = await supabase
      .from('estabelecimentos')
      .select('id')
      .limit(1)
      .single();

    if (error) {
      throw new Error('Não foi possível encontrar um estabelecimento.');
    }

    estabelecimentoId = primeiroEstabelecimento?.id ?? null;
  }

  if (!estabelecimentoId && !isGlobal) {
    throw new Error('Nenhum estabelecimento encontrado para gerenciar.');
  }

  return {
    userId: user.id,
    estabelecimentoId: isGlobal ? 'Todos' : estabelecimentoId,
    role: profile.role,
    isSuperAdmin,
    isGlobal,
  };
}

// ─── Selecionar estabelecimento (Corrigido para evitar conflito de token) ───

export async function selecionarEstabelecimentoAction(
  estabelecimentoId: string
) {
  const cookieStore = await cookies();

  cookieStore.set('admin_estabelecimento_id', estabelecimentoId, {
    path: '/',
    maxAge: 60 * 60 * 24 * 30,
    httpOnly: true,
    sameSite: 'lax',
    secure: process.env.NODE_ENV === 'production',
  });

  return {
    success: true,
  };
}

// ─── Listar estabelecimentos para o seletor ──────────────────────────────────

export async function listarTodosEstabelecimentos() {
  const supabaseAuth = await createSupabaseServerClient();

  const {
    data: { user },
  } = await supabaseAuth.auth.getUser();

  if (!user) {
    throw new Error('Você precisa estar logado.');
  }

  const { data: profile } = await supabaseAuth
    .from('profiles')
    .select('role')
    .eq('id', user.id)
    .single();

  if (!profile || profile.role !== 'super_admin') {
    throw new Error('Apenas super administradores podem listar estabelecimentos.');
  }

  const supabase = getSupabaseAdmin();

  const { data, error } = await supabase
    .from('estabelecimentos')
    .select('id, nome')
    .order('nome', { ascending: true });

  if (error) {
    throw new Error(error.message);
  }

  return data ?? [];
}

// ─── Dados do estabelecimento ────────────────────────────────────────────────

export async function buscarEstabelecimento() {
  const { estabelecimentoId, isGlobal } = await exigirDonoOuAdmin();

  if (isGlobal) {
    return {
      id: 'Todos',
      nome: 'Todos os Estabelecimentos (Visão Global)',
      descricao: 'Exibindo dados consolidados de todas as casas.',
      cidade: '—',
      instagram_handle: '—',
      cor_tema: '#3b82f6',
    };
  }

  const supabase = getSupabaseAdmin();

  const { data, error } = await supabase
    .from('estabelecimentos')
    .select('*')
    .eq('id', estabelecimentoId)
    .single();

  if (error || !data) {
    throw new Error('Estabelecimento não encontrado.');
  }

  return data;
}

// ─── Atualizar estabelecimento ───────────────────────────────────────────────

interface AtualizarEstabelecimentoInput {
  nome: string;
  descricao: string;
  cidade: string;
  instagramHandle: string;
  corTema: string;
  logoUrl?: string | null;
}

export async function atualizarEstabelecimento(
  data: AtualizarEstabelecimentoInput
) {
  const { estabelecimentoId, isGlobal } = await exigirDonoOuAdmin();

  if (isGlobal) {
    throw new Error('Não é possível editar dados no modo global.');
  }

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

  if (error) {
    throw new Error(error.message);
  }

  return {
    success: true,
  };
}

// ─── Equipe ──────────────────────────────────────────────────────────────────

export interface MembroEquipe {
  id: string;
  nome: string | null;
  email: string;
  role: string;
}

export async function listarEquipe(): Promise<MembroEquipe[]> {
  const { estabelecimentoId, isGlobal } = await exigirDonoOuAdmin();

  const supabase = getSupabaseAdmin();

  let query = supabase
    .from('profiles')
    .select('id, nome, role')
    .in('role', [
      'dono_estabelecimento',
      'staff_checkin',
      'super_admin',
    ]);

  if (!isGlobal) {
    query = query.eq('estabelecimento_id', estabelecimentoId);
  }

  const { data: profiles, error } = await query;

  if (error) {
    throw new Error(error.message);
  }

  if (!profiles || profiles.length === 0) {
    return [];
  }

  const membros: MembroEquipe[] = [];

  for (const p of profiles) {
    const { data: authUser } =
      await supabase.auth.admin.getUserById(p.id);

    membros.push({
      id: p.id,
      nome: p.nome,
      email: authUser?.user?.email ?? '—',
      role: p.role,
    });
  }

  return membros;
}

// ─── Convidar Staff ──────────────────────────────────────────────────────────

export async function convidarStaff(email: string) {
  const { estabelecimentoId, isGlobal } = await exigirDonoOuAdmin();

  if (isGlobal) {
    throw new Error('Selecione um estabelecimento específico para convidar staff.');
  }

  const supabase = getSupabaseAdmin();

  const { data, error } =
    await supabase.auth.admin.inviteUserByEmail(email);

  if (error) {
    if (
      error.message
        .toLowerCase()
        .includes('already registered')
    ) {
      throw new Error(
        'Já existe uma conta com esse e-mail. Peça pra pessoa se cadastrar normalmente e depois vincule manualmente.'
      );
    }

    throw new Error(error.message);
  }

  if (!data.user) {
    throw new Error(
      'Convite enviado, mas não foi possível vincular o perfil.'
    );
  }

  const { error: errPerfil } = await supabase
    .from('profiles')
    .update({
      role: 'staff_checkin',
      estabelecimento_id: estabelecimentoId,
    })
    .eq('id', data.user.id);

  if (errPerfil) {
    throw new Error(errPerfil.message);
  }

  return {
    success: true,
  };
}

// ─── Revogar acesso ─────────────────────────────────────────────────────────

export async function revogarAcesso(userId: string) {
  const {
    estabelecimentoId,
    userId: meuId,
    isGlobal,
  } = await exigirDonoOuAdmin();

  if (userId === meuId) {
    throw new Error('Você não pode revogar o próprio acesso.');
  }

  const supabase = getSupabaseAdmin();

  let query = supabase
    .from('profiles')
    .update({
      role: 'cliente',
      estabelecimento_id: null,
    })
    .eq('id', userId);

  if (!isGlobal) {
    query = query.eq('estabelecimento_id', estabelecimentoId);
  }

  const { error } = await query;

  if (error) {
    throw new Error(error.message);
  }

  return {
    success: true,
  };
}