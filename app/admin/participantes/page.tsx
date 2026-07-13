// app/admin/participantes/page.tsx
import { listarParticipantes } from '@/src/features/admin/participantes/actions';
import { ParticipantesTabs } from '@/src/features/admin/participantes/components/ParticipantesTabs';

export default async function ParticipantesPage() {
  const inscritos = await listarParticipantes();

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-xl font-bold text-foreground">Participantes</h1>
        <p className="text-sm text-muted mt-0.5">Gerencie inscrições e realize o credenciamento no dia do evento.</p>
      </div>

      <ParticipantesTabs inscritos={inscritos} />
    </div>
  );
}
