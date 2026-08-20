// app/admin/configuracoes/page.tsx
import { buscarEstabelecimento, listarEquipe } from '@/src/features/admin/configuracoes/actions';
import { ConfiguracoesForm } from '@/src/features/admin/configuracoes/components/ConfiguracoesForm';
import { EquipeStaff } from '@/src/features/admin/configuracoes/components/EquipeStaff';

export default async function ConfiguracoesPage() {
  let estabelecimento = null;
  let equipe: Awaited<ReturnType<typeof listarEquipe>> = [];

  try {
    const [estabRes, equipeRes] = await Promise.all([
      buscarEstabelecimento().catch(() => null),
      listarEquipe().catch(() => []),
    ]);
    estabelecimento = estabRes;
    equipe = equipeRes ?? [];
  } catch (err) {
    console.error('Erro ao carregar configurações:', err);
  }

  return (
    <div className="min-h-screen bg-slate-50/60 text-slate-800 p-6">
      <div className="max-w-3xl mx-auto space-y-8">
        <div>
          <h1 className="text-2xl font-bold text-slate-900 tracking-tight">Configurações</h1>
          <p className="text-sm text-slate-500 mt-1">
            Gestão do estabelecimento e controle da equipe.
          </p>
        </div>

        <ConfiguracoesForm estabelecimento={estabelecimento} />
        <EquipeStaff membros={equipe} />
      </div>
    </div>
  );
}