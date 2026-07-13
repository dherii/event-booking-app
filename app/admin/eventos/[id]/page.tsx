// app/admin/eventos/[id]/page.tsx
import Link from 'next/link';
import { ArrowLeft } from 'lucide-react';
import { buscarEvento } from '@/src/features/admin/eventos/actions';
import { EditarEventoForm } from '@/src/features/admin/components/EditarEventoForm';

interface PageProps {
  params: Promise<{ id: string }>;
}

export default async function EditarEventoPage({ params }: PageProps) {
  const { id } = await params;
  const evento = await buscarEvento(id);

  return (
    <div className="max-w-2xl mx-auto space-y-6">
      <div className="flex items-center gap-3">
        <Link
          href="/admin/eventos"
          className="p-2 rounded-lg text-muted hover:text-foreground hover:bg-border transition-colors"
          aria-label="Voltar"
        >
          <ArrowLeft size={18} />
        </Link>
        <div>
          <h1 className="text-xl font-bold text-foreground">Editar Evento</h1>
          <p className="text-sm text-muted mt-0.5">{evento.nome}</p>
        </div>
      </div>

      <EditarEventoForm evento={evento} />
    </div>
  );
}
