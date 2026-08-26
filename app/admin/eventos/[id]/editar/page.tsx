import { notFound } from 'next/navigation';
import { buscarEvento } from '@/src/features/admin/eventos/actions';
import { EditarEventoForm } from '@/src/features/admin/components/EditarEventoForm';
import Link from 'next/link';
import { ArrowLeft } from 'lucide-react';

export default async function EditarEventoPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  let evento;

  try {
    evento = await buscarEvento(id);
  } catch {
    notFound();
  }

  return (
    <div className="max-w-4xl mx-auto space-y-6">
      <div className="flex items-center gap-3 mb-6">
        <Link
          href="/admin/eventos"
          className="p-2 rounded-lg text-slate-400 hover:text-slate-900 hover:bg-slate-100 transition-colors"
        >
          <ArrowLeft size={18} />
        </Link>
        <div>
          <h1 className="text-xl font-bold text-slate-900">Editar Evento</h1>
          <p className="text-sm text-slate-500">{evento.nome}</p>
        </div>
      </div>

      <EditarEventoForm evento={evento} />
    </div>
  );
}