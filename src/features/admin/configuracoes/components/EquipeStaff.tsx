// src/features/admin/configuracoes/components/EquipeStaff.tsx
'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { UserPlus, Loader2, ShieldOff, Crown } from 'lucide-react';
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
    <div className="bg-card border border-border rounded-2xl p-6 space-y-5">
      <div>
        <h2 className="text-sm font-semibold text-foreground">Equipe</h2>
        <p className="text-xs text-muted mt-0.5">
          Convide pessoas pra fazer check-in no dia do evento. Elas só terão acesso ao modo Check-in.
        </p>
      </div>

      {/* Convite */}
      <form onSubmit={handleConvidar} className="flex flex-col sm:flex-row gap-2">
        <input
          type="email"
          required
          placeholder="email@exemplo.com"
          className="input-base text-sm flex-1"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
        />
        <button
          type="submit"
          disabled={convidando}
          className="flex items-center justify-center gap-2 px-4 py-2.5 rounded-lg text-sm font-semibold bg-primary hover:bg-primary-hover text-primary-fg transition-colors disabled:opacity-60 shrink-0"
        >
          {convidando ? <Loader2 size={15} className="animate-spin" /> : <UserPlus size={15} />}
          Convidar
        </button>
      </form>

      {erro && <p role="alert" className="bg-error-bg text-error-fg text-sm px-4 py-3 rounded-lg">{erro}</p>}
      {sucesso && <p className="bg-success-bg text-success-fg text-sm px-4 py-3 rounded-lg">{sucesso}</p>}

      {/* Lista de membros */}
      <div className="divide-y divide-border border-t border-border pt-2">
        {membros.length === 0 ? (
          <p className="text-sm text-muted py-4 text-center">Nenhum membro na equipe ainda.</p>
        ) : (
          membros.map((m) => (
            <div key={m.id} className="flex items-center justify-between py-3">
              <div className="flex items-center gap-3 min-w-0">
                <div className="w-8 h-8 rounded-full bg-primary/10 text-primary flex items-center justify-center text-xs font-bold shrink-0">
                  {(m.nome ?? m.email).charAt(0).toUpperCase()}
                </div>
                <div className="min-w-0">
                  <p className="text-sm font-medium text-foreground truncate">{m.nome ?? m.email}</p>
                  <p className="text-xs text-muted truncate">{m.email}</p>
                </div>
              </div>

              <div className="flex items-center gap-2 shrink-0">
                {['dono_estabelecimento', 'super_admin'].includes(m.role) ? (
                  <span className="flex items-center gap-1 text-xs font-medium text-primary bg-primary/10 px-2 py-1 rounded-full">
                    <Crown size={12} />
                    Dono
                  </span>
                ) : (
                  <>
                    <span className="text-xs text-muted">Check-in</span>
                    <button
                      type="button"
                      onClick={() => handleRevogar(m)}
                      disabled={revogandoId === m.id}
                      className="p-1.5 rounded-lg text-muted hover:text-error-fg hover:bg-error-bg transition-colors disabled:opacity-50"
                      aria-label="Revogar acesso"
                      title="Revogar acesso"
                    >
                      {revogandoId === m.id ? <Loader2 size={14} className="animate-spin" /> : <ShieldOff size={14} />}
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
