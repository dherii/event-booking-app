import { getSupabaseAdmin } from '@/src/config/supabase';
import { notFound } from 'next/navigation';
import Link from 'next/link';
import PixCopyButton from '@/src/features/checkout/components/PixCopyButton';
import { Clock, ShieldCheck, ArrowLeft, QrCode } from 'lucide-react';

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
  const lote = inscricao.lotes;
  const valorTotal = Number(lote?.preco || 0);

  return (
    <main className="min-h-screen bg-background-secondary text-foreground flex flex-col items-center justify-center p-4 py-8">
      
      {/* Botão topo para voltar */}
      <div className="max-w-md w-full mb-4">
        <Link
          href={`/evento/${evento?.id || ''}`}
          className="inline-flex items-center gap-1.5 text-xs font-semibold text-muted hover:text-foreground transition-colors"
        >
          <ArrowLeft size={14} />
          Voltar para o evento
        </Link>
      </div>

      <div className="max-w-md w-full bg-card border border-border rounded-2xl p-6 sm:p-8 shadow-card text-center space-y-6">
        
        {/* Header com Alerta de Status */}
        <div className="space-y-3">
          <span className="inline-flex items-center gap-1.5 text-xs font-bold bg-warning-bg text-warning-fg px-3 py-1 rounded-full uppercase tracking-wider border border-warning-fg/20">
            <Clock size={13} />
            Aguardando Pagamento
          </span>

          <h1 className="text-2xl font-black text-foreground">Falta pouco!</h1>

          <p className="text-sm text-muted">
            Reserve seu lugar em{' '}
            <strong className="text-foreground font-semibold">{evento?.nome || 'Inscrição'}</strong>
          </p>
        </div>

        {/* Resumo do Lote Comprado */}
        <div className="bg-background-secondary border border-border rounded-xl p-3.5 flex items-center justify-between text-left">
          <div>
            <p className="text-xs text-muted">Item selecionado</p>
            <p className="text-sm font-bold text-foreground">{lote?.nome || 'Ingresso'}</p>
          </div>
          <div className="text-right">
            <p className="text-xs text-muted">Total a pagar</p>
            <p className="text-base font-extrabold text-success-fg">
              R$ {valorTotal.toFixed(2)}
            </p>
          </div>
        </div>

        {/* Área do QR Code Pix */}
        <div className="space-y-3">
          <div className="p-4 bg-white rounded-2xl border border-border shadow-inner inline-block mx-auto">
            {/* Box simulado visual de QR Code com bordas estruturadas */}
            <div className="w-48 h-48 bg-slate-50 flex flex-col items-center justify-center border-2 border-dashed border-slate-300 rounded-xl p-3 text-slate-500 relative">
              <QrCode size={40} className="text-primary mb-2 opacity-80" />
              <span className="text-[11px] font-bold uppercase tracking-wider text-center text-slate-700">
                Escaneie o QR Code no seu banco
              </span>
            </div>
          </div>

          <p className="text-xs text-muted">
            Abra o aplicativo do seu banco, escolha <strong>Pix</strong> e escaneie o código acima.
          </p>
        </div>

        {/* Campo Copia e Cola */}
        <div className="text-left bg-background-secondary p-4 rounded-xl border border-border space-y-2">
          <span className="text-xs font-semibold text-muted block">
            Ou use o código Pix Copia e Cola:
          </span>
          <PixCopyButton codigo={inscricao.txid_pix} />
        </div>

        {/* Ação principal */}
        <div className="space-y-3 pt-2">
          <Link
            href="/"
            className="w-full flex items-center justify-center gap-2 bg-primary hover:bg-primary-hover text-white font-bold py-3 px-4 rounded-xl shadow-neon transition-all active:scale-[0.99]"
          >
            Voltar ao Catálogo
          </Link>

          <div className="flex items-center justify-center gap-1.5 text-xs text-muted-subtle pt-1">
            <ShieldCheck size={14} className="text-success-fg" />
            <span>Confirmação automática do lote após o Pix.</span>
          </div>
        </div>

      </div>
    </main>
  );
}