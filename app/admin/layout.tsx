// src/app/admin/layout.tsx
import { redirect } from 'next/navigation';
import { cookies } from 'next/headers';
import { createSupabaseServerClient } from '@/src/config/supabase-server';
import { AdminShell } from '@/src/features/admin/components/AdminShell';
import { listarTodosEstabelecimentos } from '@/src/features/admin/configuracoes/actions';
import { EstabelecimentoSwitcher } from '@/src/features/admin/configuracoes/components/EstabelecimentoSwitcher';

export default async function AdminLayout({ children }: { children: React.ReactNode }) {
  const supabase = await createSupabaseServerClient();

  const { data: { user } } = await supabase.auth.getUser();
  if (!user) {
    redirect('/auth/login');
  }

  const { data: profile } = await supabase
    .from('profiles')
    .select('nome, role, estabelecimento_id')
    .eq('id', user.id)
    .single();

  const papeisPermitidos = ['super_admin', 'dono_estabelecimento', 'staff_checkin', 'cliente'];

  if (!profile || !papeisPermitidos.includes(profile.role)) {
    redirect('/');
  }

  let estabelecimentos: Array<{ id: string; nome: string }> = [];
  let estabelecimentoAtualId = '';

  // 1. Se for Super Admin, ele busca todos os estabelecimentos da plataforma
  if (profile.role === 'super_admin') {
    estabelecimentos = await listarTodosEstabelecimentos();
    const cookieStore = await cookies();
    const cookieEstabelecimento = cookieStore.get('admin_estabelecimento_id')?.value;

    estabelecimentoAtualId =
      cookieEstabelecimento ||
      profile.estabelecimento_id ||
      estabelecimentos[0]?.id ||
      '';
  } else {
    // 2. Se for dono de estabelecimento comum, busca apenas o estabelecimento dele pelo ID do perfil
    if (profile.estabelecimento_id) {
      const { data: estData } = await supabase
        .from('estabelecimentos')
        .select('id, nome')
        .eq('id', profile.estabelecimento_id)
        .single();

      if (estData) {
        estabelecimentos = [estData];
        estabelecimentoAtualId = estData.id;
      }
    }
  }

  // Nome do estabelecimento exibido no painel
  let nomeEstabelecimento = 'Painel Admin';
  if (estabelecimentoAtualId === 'Todos') {
    nomeEstabelecimento = 'Visão Global';
  } else {
    const estabelecimentoAtual = estabelecimentos.find((e) => e.id === estabelecimentoAtualId);
    nomeEstabelecimento = estabelecimentoAtual?.nome ?? 'Painel Admin';
  }

  // Renderiza o seletor apenas se for super_admin
  const headerExtra = profile.role === 'super_admin' ? (
    <EstabelecimentoSwitcher
      estabelecimentos={estabelecimentos}
      estabelecimentoAtualId={estabelecimentoAtualId}
      isSuperAdmin={true}
    />
  ) : undefined;

  return (
    <AdminShell
      userNome={profile.nome ?? user.email ?? 'Usuário'}
      userEmail={user.email ?? ''}
      estabelecimentoNome={nomeEstabelecimento}
      userRole={profile.role}
      headerAction={headerExtra}
    >
      {children}
    </AdminShell>
  );
}