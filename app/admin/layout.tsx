// app/admin/layout.tsx
import { redirect } from 'next/navigation';
import { createSupabaseServerClient } from '@/src/config/supabase-server';
import { AdminShell } from '@/src/features/admin/components/AdminShell';

export default async function AdminLayout({ children }: { children: React.ReactNode }) {
  const supabase = await createSupabaseServerClient();

  const { data: { user } } = await supabase.auth.getUser();
  if (!user) redirect('/auth/login');

  const { data: profile } = await supabase
    .from('profiles')
    .select('nome, role, estabelecimento_id, estabelecimentos(nome)')
    .eq('id', user.id)
    .single();

  const papeisPermitidos = ['super_admin', 'dono_estabelecimento', 'staff_checkin'];
  if (!profile || !papeisPermitidos.includes(profile.role)) {
    redirect('/');
  }

  const nomeEstabelecimento =
    // @ts-expect-error -- supabase infere array em joins, mas é 1:1 aqui
    profile.estabelecimentos?.nome ?? 'Painel Admin';

  return (
    <AdminShell
      userNome={profile.nome ?? user.email ?? 'Usuário'}
      userEmail={user.email ?? ''}
      estabelecimentoNome={nomeEstabelecimento}
    >
      {children}
    </AdminShell>
  );
}
