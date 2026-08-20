import { listarParticipantes } from '@/src/features/admin/participantes/actions';
import { ParticipantesTabs } from '@/src/features/admin/participantes/components/ParticipantesTabs';

export default async function ParticipantesPage() {
  const inscritos = await listarParticipantes();

  return (
    <div className="space-y-6 max-w-7xl mx-auto pb-10">
      <div>
        <h1 className="text-2xl font-bold text-slate-900 tracking-tight">Participantes</h1>
        <p className="text-sm text-slate-500 mt-1">
          Gerencie inscrições e realize o credenciamento no dia do evento.
        </p>
      </div>

      <ParticipantesTabs inscritos={inscritos} />
    </div>
  );
}