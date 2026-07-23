// app/admin/configuracoes/page.tsx
import { buscarEstabelecimento, listarEquipe } from '@/src/features/admin/configuracoes/actions';
import { ConfiguracoesForm } from '@/src/features/admin/configuracoes/components/ConfiguracoesForm';
import { EquipeStaff } from '@/src/features/admin/configuracoes/components/EquipeStaff';

export default async function ConfiguracoesPage() {
  const [estabelecimento, equipe] = await Promise.all([
    buscarEstabelecimento(),
    listarEquipe(),
  ]);

  return (
    <div className="max-w-2xl mx-auto space-y-8">
      <div>
        <h1 className="text-xl font-bold text-foreground">Configurações</h1>
        <p className="text-sm text-muted mt-0.5">
          Dados do estabelecimento e gestão da equipe.
        </p>
      </div>

      <ConfiguracoesForm estabelecimento={estabelecimento} />
      <EquipeStaff membros={equipe} />
    </div>
  );
}
