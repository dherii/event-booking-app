'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { createSupabaseBrowserClient } from '@/src/config/supabase-browser';
import { ArrowRight, Loader2, FileText, Phone, X, AlertCircle } from 'lucide-react';
import { completarPerfilCheckout } from '@/src/features/cliente/actions';

// ─── Helpers de Máscara ───────────────────────────────────────────────────────
function formatCPF(value: string) {
  return value
    .replace(/\D/g, '')
    .replace(/(\d{3})(\d)/, '$1.$2')
    .replace(/(\d{3})(\d)/, '$1.$2')
    .replace(/(\d{3})(\d{1,2})/, '$1-$2')
    .replace(/(-\d{2})\d+?$/, '$1');
}

function formatPhone(value: string) {
  return value
    .replace(/\D/g, '')
    .replace(/(\d{2})(\d)/, '($1) $2')
    .replace(/(\d{5})(\d{4}).*/, '$1-$2');
}

// ─── Componente Principal ─────────────────────────────────────────────────────
interface BotaoComprarLoteProps {
  eventoId: string;
  loteId: string;
  esgotado: boolean;
  label?: string;
  className?: string;
}

export default function BotaoComprarLote({
  eventoId,
  loteId,
  esgotado,
  label = 'Garantir Ingresso',
  className = '',
}: BotaoComprarLoteProps) {
  const router = useRouter();

  // Estados do botão de compra
  const [loading, setLoading] = useState(false);

  // Estados do Modal Hard Wall
  const [showModal, setShowModal] = useState(false);
  const [cpf, setCpf] = useState('');
  const [telefone, setTelefone] = useState('');
  const [modalLoading, setModalLoading] = useState(false);
  const [modalErro, setModalErro] = useState<string | null>(null);

  // ─── 1. Fluxo de Compra Padrão ──────────────────────────────────────────────
  async function handleComprar() {
    setLoading(true);

    try {
      const supabase = createSupabaseBrowserClient();

      const {
        data: { session },
      } = await supabase.auth.getSession();

      if (!session) {
        const redirectTo = `/eventos/${eventoId}`;
        router.push(`/auth/login?redirect=${encodeURIComponent(redirectTo)}`);
        return;
      }

      const response = await fetch('/api/checkout', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          loteId,
        }),
      });

      const dados: {
        error?: string;
        requiresLogin?: boolean;
        requiresProfileCompletion?: boolean;
        inscricaoId?: string;
        checkoutUrl?: string;
      } = await response.json();

      if (!response.ok) {
        // INTERCEPTAÇÃO: Se faltar CPF/Telefone, abre o modal
        if (response.status === 403 && dados.requiresProfileCompletion) {
          setShowModal(true);
          setLoading(false);
          return;
        }

        if (dados.requiresLogin) {
          router.push(`/auth/login?redirect=${encodeURIComponent(`/eventos/${eventoId}`)}`);
          return;
        }

        alert(dados.error || 'Erro ao realizar inscrição');
        return;
      }

      if (dados.checkoutUrl) {
        // Redireciona o usuário para a página segura do Mercado Pago
        window.location.href = dados.checkoutUrl;
      } else if (dados.inscricaoId) {
        // Fallback para ingressos gratuitos que não passam pelo gateway
        router.push(`/checkout/${dados.inscricaoId}?status=pago`);
      } else {
        alert('Erro: Link de pagamento não retornado.');
      }
    } catch (err) {
      console.error(err);
      alert('Erro na conexão com o servidor.');
    } finally {
      setLoading(false);
    }
  }

  // ─── 2. Fluxo de Preenchimento de Perfil ────────────────────────────────────
  async function handleCompletarPerfil(e: React.FormEvent) {
    e.preventDefault();
    setModalLoading(true);
    setModalErro(null);

    if (cpf.length !== 14) {
      setModalErro('CPF incompleto.');
      setModalLoading(false);
      return;
    }

    if (telefone.length < 14) {
      setModalErro('Telefone incompleto.');
      setModalLoading(false);
      return;
    }

    try {
      // Salva no banco via Server Action
      await completarPerfilCheckout(cpf, telefone);

      // Se deu certo, fecha o modal e tenta comprar novamente sozinho!
      setShowModal(false);
      handleComprar();
    } catch (error) {
      setModalErro(error instanceof Error ? error.message : 'Erro ao salvar dados.');
      setModalLoading(false);
    }
  }

  const desabilitado = esgotado || loading;

  return (
    <>
      {/* Botão de Compra Principal */}
      <button
        onClick={handleComprar}
        disabled={desabilitado}
        className={`
          inline-flex min-h-[48px] w-full items-center justify-center gap-2.5
          rounded-2xl px-5 py-3 text-xs font-black uppercase tracking-wider
          transition-all duration-200

          ${desabilitado
              ? 'cursor-not-allowed bg-border text-muted-subtle shadow-none'
              : 'bg-primary text-primary-fg shadow-neon hover:bg-primary-hover active:scale-[0.98]'
          }

          ${className}
        `}
      >
        {loading ? (
          <>
            <Loader2 size={16} className="animate-spin" />
            Processando...
          </>
        ) : esgotado ? (
          'Esgotado'
        ) : (
          <>
            {label}
            <ArrowRight size={16} strokeWidth={2.5} />
          </>
        )}
      </button>

      {/* Modal Hard Wall de Cadastro */}
      {showModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm animate-in fade-in duration-200">
          <div
            className="bg-card rounded-2xl w-full max-w-md shadow-2xl overflow-hidden animate-in zoom-in-95 duration-200"
            onClick={(e) => e.stopPropagation()}
          >
            {/* Header do Modal */}
            <div className="flex items-start justify-between p-5 border-b border-border bg-background-secondary/50">
              <div>
                <h3 className="text-lg font-bold text-foreground">Falta pouco!</h3>
                <p className="text-xs text-muted mt-1">
                  Precisamos de mais dois dados para emitir seu ingresso com segurança.
                </p>
              </div>
              <button
                onClick={() => setShowModal(false)}
                className="w-8 h-8 rounded-full bg-background-tertiary text-muted flex items-center justify-center hover:bg-border transition-colors cursor-pointer"
              >
                <X size={16} />
              </button>
            </div>

            {/* Corpo do Modal (Formulário) */}
            <form onSubmit={handleCompletarPerfil} className="p-5 space-y-4">

              {modalErro && (
                <div className="flex items-center gap-2 bg-error-bg border border-error-fg/20 text-error-fg px-3 py-2 rounded-lg text-xs font-medium">
                  <AlertCircle size={14} className="shrink-0" />
                  {modalErro}
                </div>
              )}

              <div>
                <label className="block text-[10px] font-black uppercase tracking-[0.14em] text-muted mb-1.5">
                  CPF
                </label>
                <div className="relative">
                  <span className="absolute inset-y-0 left-0 flex items-center pl-3.5 text-muted-subtle">
                    <FileText size={16} />
                  </span>
                  <input
                    type="text"
                    value={cpf}
                    onChange={(e) => setCpf(formatCPF(e.target.value))}
                    placeholder="000.000.000-00"
                    maxLength={14}
                    className="input-base pl-10"
                    required
                  />
                </div>
                <p className="text-[10px] text-muted-subtle mt-1.5">
                  Usado para segurança do pagamento e emissão de certificados.
                </p>
              </div>

              <div>
                <label className="block text-[10px] font-black uppercase tracking-[0.14em] text-muted mb-1.5">
                  Celular / WhatsApp
                </label>
                <div className="relative">
                  <span className="absolute inset-y-0 left-0 flex items-center pl-3.5 text-muted-subtle">
                    <Phone size={16} />
                  </span>
                  <input
                    type="tel"
                    value={telefone}
                    onChange={(e) => setTelefone(formatPhone(e.target.value))}
                    placeholder="(00) 00000-0000"
                    maxLength={15}
                    className="input-base pl-10"
                    required
                  />
                </div>
              </div>

              <div className="pt-3">
                <button
                  type="submit"
                  disabled={modalLoading}
                  className="w-full flex min-h-[48px] items-center justify-center gap-2 bg-primary hover:bg-primary-hover text-primary-fg text-sm font-bold py-3 px-4 rounded-xl shadow-neon transition-all disabled:opacity-50 cursor-pointer"
                >
                  {modalLoading ? (
                    <>
                      <Loader2 size={16} className="animate-spin" />
                      Salvando...
                    </>
                  ) : (
                    'Salvar e continuar compra'
                  )}
                </button>
                <button
                  type="button"
                  onClick={() => setShowModal(false)}
                  className="w-full py-3 text-xs font-semibold text-muted hover:text-foreground transition-colors mt-1 cursor-pointer"
                >
                  Cancelar
                </button>
              </div>

            </form>
          </div>
        </div>
      )}
    </>
  );
}

