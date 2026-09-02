// src/features/admin/configuracoes/components/EquipeStaff.tsx
'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { UserPlus, Loader2, ShieldOff, Crown, Users } from 'lucide-react';
import { convidarStaff, revogarAcesso } from '../actions';
import type { MembroEquipe } from '../actions';

export function EquipeStaff({ membros }: { membros: MembroEquipe[] }) {
  const router = useRouter();
  const [email, setEmail] = useState('');
  const [convidando, setConvidando] = useState(false);
  const [revogandoId, setRevogandoId] = useState<string | null>(null);
  const [erro, setErro] = useState<string | null>(null);
  const [sucesso, setSucesso] = useState<string | null>(null);

  async function handleConvidar(e: React.FormEvent) {
    e.preventDefault();
    setConvidando(true);
    setErro(null);
    setSucesso(null);

    try {
      await convidarStaff(email);
      setSucesso(`Convite enviado para ${email}.`);
      setEmail('');
      router.refresh();
    } catch (err) {
      setErro(err instanceof Error ? err.message : 'Erro ao convidar.');
    } finally {
      setConvidando(false);
    }
  }

  async function handleRevogar(membro: MembroEquipe) {
    if (!confirm(`Remover o acesso de ${membro.nome ?? membro.email} ao painel?`)) return;

    setRevogandoId(membro.id);
    setErro(null);

    try {
      await revogarAcesso(membro.id);
      router.refresh();
    } catch (err) {
      setErro(err instanceof Error ? err.message : 'Erro ao revogar acesso.');
    } finally {
      setRevogandoId(null);
    }
  }

  return (
    <div className="bg-card border border-border rounded-2xl p-6 text-foreground shadow-sm space-y-5">
      <div className="flex items-center justify-between border-b border-border-light pb-4">
        <div>
          <div className="flex items-center gap-2">
            <Users size={18} className="text-primary" />
            <h2 className="text-base font-semibold text-foreground">Equipe do estabelecimento</h2>
          </div>
          <p className="text-xs text-muted mt-1">
            Convide pessoas para fazer check-in no dia do evento. Elas só terão acesso ao modo Check-in.
          </p>
        </div>
        <span className="text-xs text-muted bg-background-tertiary px-2.5 py-1 rounded-md font-medium shrink-0">
          {membros.length} {membros.length === 1 ? 'membro' : 'membros'}
        </span>
      </div>

      {/* Form de Convite */}
      <form onSubmit={handleConvidar} className="flex flex-col sm:flex-row gap-2.5">
        <input
          type="email"
          required
          placeholder="email@exemplo.com"
          className="input-base flex-1"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
        />
        <button
          type="submit"
          disabled={convidando}
          className="flex items-center justify-center gap-2 px-5 py-2.5 rounded-xl text-sm font-semibold bg-primary hover:bg-primary-hover text-primary-fg transition-all shadow-sm disabled:opacity-60 cursor-pointer shrink-0"
        >
          {convidando ? <Loader2 size={16} className="animate-spin" /> : <UserPlus size={16} />}
          Convidar
        </button>
      </form>

      {erro && (
        <p role="alert" className="bg-error-bg border border-error-fg/20 text-error-fg text-sm px-4 py-3 rounded-xl">
          {erro}
        </p>
      )}

      {sucesso && (
        <p className="bg-success-bg border border-success-fg/20 text-success-fg text-sm px-4 py-3 rounded-xl">
          {sucesso}
        </p>
      )}

      {/* Lista de membros */}
      <div className="divide-y divide-border-light border-t border-border-light pt-3">
        {membros.length === 0 ? (
          <p className="text-sm text-muted-subtle py-6 text-center">Nenhum membro na equipe ainda.</p>
        ) : (
          membros.map((m) => (
            <div key={m.id} className="flex items-center justify-between py-3">
              <div className="flex items-center gap-3 min-w-0">
                <div className="w-9 h-9 rounded-full bg-primary/10 border border-primary/15 text-primary flex items-center justify-center text-xs font-bold shrink-0">
                  {(m.nome ?? m.email).charAt(0).toUpperCase()}
                </div>
                <div className="min-w-0">
                  <p className="text-sm font-medium text-foreground truncate">{m.nome ?? m.email}</p>
                  <p className="text-xs text-muted truncate">{m.email}</p>
                </div>
              </div>

              <div className="flex items-center gap-2 shrink-0">
                {['dono_estabelecimento', 'super_admin'].includes(m.role) ? (
                  <span className="flex items-center gap-1.5 text-xs font-medium text-warning-fg bg-warning-bg border border-warning-fg/20 px-2.5 py-1 rounded-lg">
                    <Crown size={13} className="text-warning-fg" />
                    Dono
                  </span>
                ) : (
                  <>
                    <span className="text-xs font-medium text-muted bg-background-tertiary px-2.5 py-1 rounded-lg border border-border">
                      Check-in
                    </span>
                    <button
                      type="button"
                      onClick={() => handleRevogar(m)}
                      disabled={revogandoId === m.id}
                      className="p-1.5 rounded-lg text-muted-subtle hover:text-error-fg hover:bg-error-bg transition-colors disabled:opacity-50 cursor-pointer"
                      aria-label="Revogar acesso"
                      title="Revogar acesso"
                    >
                      {revogandoId === m.id ? <Loader2 size={16} className="animate-spin" /> : <ShieldOff size={16} />}
                    </button>
                  </>
                )}
              </div>
            </div>
          ))
        )}
      </div>
    </div>
  );
}