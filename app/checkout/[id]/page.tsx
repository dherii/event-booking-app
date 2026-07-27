import { getSupabaseAdmin } from '@/src/config/supabase';
import { notFound } from 'next/navigation';
import Link from 'next/link';
import PixCopyButton from '@/src/features/checkout/components/PixCopyButton';
import { Clock } from 'lucide-react';

interface CheckoutPageProps {
  params: Promise<{ id: string }>;
}

export const revalidate = 0;

export default async function CheckoutPage({ params }: CheckoutPageProps) {
  const { id } = await params;

  const supabaseAdmin = getSupabaseAdmin();

  const { data: inscricao } = await supabaseAdmin
    .from('inscricoes')
    .select('*, lotes(*, eventos(*))')
    .eq('id', id)
    .single();

  if (!inscricao) {
    notFound();
  }

  const evento = inscricao.lotes?.eventos;
  const valorTotal = Number(inscricao.lotes?.preco || 0);

  return (
    <main className="min-h-screen bg-background text-foreground flex flex-col items-center justify-center p-4">
      <div className="max-w-md w-full clubber-card p-6 text-center">
        <span className="inline-flex items-center gap-1.5 text-xs font-bold bg-warning-bg text-warning-fg px-3 py-1 rounded-full uppercase tracking-wider">
          <Clock size={12} />
          Aguardando Pagamento
        </span>

        <h1 className="text-2xl font-black mt-4">Falta pouco!</h1>

        <p className="text-muted text-sm mt-1">
          Reserve seu lugar em <strong className="text-foreground">{evento?.nome || 'Inscrição'}</strong>
        </p>

        {/* QR Code Simulado */}
        <div className="my-6 p-4 bg-white rounded-xl inline-block mx-auto">
          <div className="w-48 h-48 bg-gray-200 flex flex-col items-center justify-center text-gray-800 border-2 border-dashed border-gray-400 rounded-lg">
            <span className="text-xs font-bold uppercase tracking-widest text-center px-2">
              [ QR Code Pix Simulado ]
            </span>
          </div>
        </div>

        <div className="text-left bg-background p-4 rounded-xl border border-border mb-6">
          <div className="flex justify-between text-sm mb-3">
            <span className="text-muted">Total a pagar:</span>
            <span className="font-bold text-success-fg">R$ {valorTotal.toFixed(2)}</span>
          </div>

          <div className="flex flex-col gap-2 text-xs">
            <span className="text-muted">Código Copia e Cola:</span>
            <PixCopyButton codigo={inscricao.txid_pix} />
          </div>
        </div>

        <Link
          href="/"
          className="w-full block bg-primary hover:bg-primary-hover text-primary-fg text-center font-bold py-2.5 px-4 rounded-lg shadow-neon transition-all active:scale-[0.99]"
        >
          Voltar ao Catálogo
        </Link>

        <p className="text-xs text-muted mt-4">
          O lote será liberado imediatamente após a confirmação do Pix.
        </p>
      </div>
    </main>
  );
}
