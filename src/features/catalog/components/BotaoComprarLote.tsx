'use client';

import { useState, useEffect } from 'react';
import { createPortal } from 'react-dom';
import { useRouter } from 'next/navigation';
import { createSupabaseBrowserClient } from '@/src/config/supabase-browser';
import { ArrowRight, Loader2, FileText, Phone, X, AlertCircle } from 'lucide-react';
import { completarPerfilCheckout } from '@/src/features/cliente/actions';
import { validarCPF } from '@/src/lib/validators/cpf';

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

  // Garante que o Portal só renderize no lado do cliente (SSR Safety)
  const [mounted, setMounted] = useState(false);
  useEffect(() => setMounted(true), []);

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
        setLoading(false);
        return;
      }

      if (dados.checkoutUrl) {
        window.location.href = dados.checkoutUrl;
      } else if (dados.inscricaoId) {
        router.push(`/checkout/${dados.inscricaoId}`);
      } else {
        alert('Erro: Link de pagamento não retornado.');
      }

    } catch (err) {
      console.error(err);
      alert('Erro na conexão com o servidor.');
    } finally {
      if (!showModal) setLoading(false);
    }
  }

  // ─── 2. Fluxo de Preenchimento de Perfil ────────────────────────────────────
  async function handleCompletarPerfil(e: React.FormEvent) {
    e.preventDefault();
    setModalLoading(true);
    setModalErro(null);

    if (!validarCPF(cpf)) {
      setModalErro('CPF inválido. Confira os números digitados.');
      setModalLoading(false);
      return;
    }

    if (telefone.length < 14) {
      setModalErro('Telefone incompleto.');
      setModalLoading(false);
      return;
    }

    try {
      await completarPerfilCheckout(cpf, telefone);
      setShowModal(false);
      handleComprar();
    } catch (error) {
      setModalErro(error instanceof Error ? error.message : 'Erro ao salvar dados.');
      setModalLoading(false);
    }
  }

  const desabilitado = esgotado || loading;

  // ─── Renderização do Modal via Portal ───────────────────────────────────────
  const ModalPortal = mounted && showModal ? createPortal(
    <div className="fixed inset-0 z-[9999] flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-sm animate-in fade-in duration-200">
      <div
        className="bg-white rounded-2xl w-full max-w-md shadow-2xl overflow-hidden animate-in zoom-in-95 duration-200"
        onClick={(e) => e.stopPropagation()}
      >
        <div className="flex items-start justify-between p-5 border-b border-slate-100 bg-slate-50/50">
          <div>
            <h3 className="text-lg font-bold text-slate-900">Falta pouco!</h3>
            <p className="text-xs text-slate-500 mt-1">
              Precisamos de mais dois dados para emitir seu ingresso com segurança.
            </p>
          </div>
          <button
            onClick={() => {
              setShowModal(false);
              setLoading(false);
            }}
            className="w-8 h-8 rounded-full bg-slate-200/50 text-slate-500 flex items-center justify-center hover:bg-slate-200 transition-colors cursor-pointer"
          >
            <X size={16} />
          </button>
        </div>

        <form onSubmit={handleCompletarPerfil} className="p-5 space-y-4">
          {modalErro && (
            <div className="flex items-center gap-2 bg-rose-50 border border-rose-200 text-rose-700 px-3 py-2 rounded-lg text-xs font-medium">
              <AlertCircle size={14} className="shrink-0" />
              {modalErro}
            </div>
          )}

          <div>
            <label className="block text-[10px] font-black uppercase tracking-[0.14em] text-slate-500 mb-1.5">
              CPF
            </label>
            <div className="relative">
              <span className="absolute inset-y-0 left-0 flex items-center pl-3.5 text-slate-400">
                <FileText size={16} />
              </span>
              <input
                type="text"
                value={cpf}
                onChange={(e) => setCpf(formatCPF(e.target.value))}
                placeholder="000.000.000-00"
                maxLength={14}
                className="w-full bg-slate-50 border border-slate-200 rounded-xl py-3 pl-10 pr-4 text-sm font-medium outline-none focus:border-blue-500 focus:bg-white focus:ring-2 focus:ring-blue-500/20 transition-all text-slate-900"
                required
              />
            </div>
            <p className="text-[10px] text-slate-400 mt-1.5">
              Usado para segurança do pagamento e emissão de certificados.
            </p>
          </div>

          <div>
            <label className="block text-[10px] font-black uppercase tracking-[0.14em] text-slate-500 mb-1.5">
              Celular / WhatsApp
            </label>
            <div className="relative">
              <span className="absolute inset-y-0 left-0 flex items-center pl-3.5 text-slate-400">
                <Phone size={16} />
              </span>
              <input
                type="tel"
                value={telefone}
                onChange={(e) => setTelefone(formatPhone(e.target.value))}
                placeholder="(00) 00000-0000"
                maxLength={15}
                className="w-full bg-slate-50 border border-slate-200 rounded-xl py-3 pl-10 pr-4 text-sm font-medium outline-none focus:border-blue-500 focus:bg-white focus:ring-2 focus:ring-blue-500/20 transition-all text-slate-900"
                required
              />
            </div>
          </div>

          <div className="pt-3">
            <button
              type="submit"
              disabled={modalLoading}
              className="w-full flex items-center justify-center gap-2 bg-blue-600 hover:bg-blue-700 text-white text-sm font-bold py-3 px-4 rounded-xl shadow-sm transition-all disabled:opacity-50 cursor-pointer"
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
              onClick={() => {
                setShowModal(false);
                setLoading(false);
              }}
              className="w-full py-3 text-xs font-semibold text-slate-500 hover:text-slate-700 transition-colors mt-1 cursor-pointer"
            >
              Cancelar
            </button>
          </div>
        </form>
      </div>
    </div>,
    document.body
  ) : null;

  return (
    <>
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
        {loading && !showModal ? (
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

      {ModalPortal}
    </>
  );
}