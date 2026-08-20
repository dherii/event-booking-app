// src/app/admin/layout.tsx
import { redirect } from 'next/navigation';
import { createSupabaseServerClient } from '@/src/config/supabase-server';
import { AdminShell } from '@/src/features/admin/components/AdminShell';

export default async function AdminLayout({ children }: { children: React.ReactNode }) {
  const supabase = await createSupabaseServerClient();

  const { data: { user } } = await supabase.auth.getUser();
  if (!user) {
    console.log('DEBUG ADMIN: Usuário não autenticado. Redirecionando para login.');
    redirect('/auth/login');
  }

  const { data: profile, error } = await supabase
    .from('profiles')
    .select('nome, role, estabelecimento_id, estabelecimentos(nome)')
    .eq('id', user.id)
    .single();

  // Vamos imprimir isso no terminal do Node.js para ver o que está vindo
  console.log('DEBUG ADMIN - User ID:', user.id);
  console.log('DEBUG ADMIN - Profile retornado:', profile);
  console.log('DEBUG ADMIN - Erro no profile (se houver):', error);

  const papeisPermitidos = ['super_admin', 'dono_estabelecimento', 'staff_checkin', 'cliente'];
  
  if (!profile || !papeisPermitidos.includes(profile.role)) {
    console.log('DEBUG ADMIN: Role negada ou perfil não encontrado. Role atual:', profile?.role);
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
      userRole={profile.role}
    >
      {children}
    </AdminShell>
  );
}