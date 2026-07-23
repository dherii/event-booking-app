// app/transferir/[token]/page.tsx
import { redirect } from 'next/navigation';
import { createSupabaseServerClient } from '@/src/config/supabase-server';
import { buscarTransferencia } from '@/src/features/cliente/actions';
import { AceitarTransferenciaButton } from '@/src/features/cliente/components/AceitarTransferenciaButton';

interface PageProps {
  params: Promise<{ token: string }>;
}

export default async function TransferirPage({ params }: PageProps) {
  const { token } = await params;

  const supabase = await createSupabaseServerClient();
  const { data: { user } } = await supabase.auth.getUser();

  if (!user) {
    redirect(`/auth/login?redirect=${encodeURIComponent(`/transferir/${token}`)}`);
  }

  let detalhe;
  try {
    detalhe = await buscarTransferencia(token);
  } catch (err) {
    return (
      <main className="min-h-screen bg-gray-950 text-white flex items-center justify-center p-4">
        <div className="max-w-sm w-full bg-gray-900 border border-gray-800 rounded-2xl p-6 text-center">
          <p className="text-red-400 font-medium">
            {err instanceof Error ? err.message : 'Link inválido.'}
          </p>
        </div>
      </main>
    );
  }

  return (
    <main className="min-h-screen bg-gray-950 text-white flex items-center justify-center p-4">
      <div className="max-w-sm w-full bg-gray-900 border border-gray-800 rounded-2xl p-6 space-y-5 text-center">
        <div>
          <span className="text-xs font-semibold bg-blue-500/10 text-blue-400 px-3 py-1 rounded-full uppercase tracking-wider">
            Transferência de ingresso
          </span>
          <h1 className="text-xl font-bold mt-4">{detalhe.eventoNome}</h1>
          <p className="text-sm text-gray-400 mt-1">{detalhe.loteNome}</p>
        </div>

        {detalhe.jaEDono ? (
          <p className="text-sm text-gray-400">Este ingresso já está na sua conta.</p>
        ) : (
          <>
            <p className="text-sm text-gray-400">
              Alguém está transferindo esse ingresso pra você. Ao aceitar, ele passa a valer na sua conta.
            </p>
            <AceitarTransferenciaButton token={token} />
          </>
        )}
      </div>
    </main>
  );
}
