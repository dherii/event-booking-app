// src/features/admin/financeiro/components/FormDadosBancarios.tsx
'use client';

import { useState } from 'react';
import { ShieldCheck, Info, ChevronDown, Check, Loader2 } from 'lucide-react';
import type { DadosBancarios } from '../types';

// ─── Dados dos bancos (amostra) ───────────────────────────────────────────────

const BANCOS = [
  { codigo: '001', nome: 'Banco do Brasil'           },
  { codigo: '033', nome: 'Santander'                 },
  { codigo: '104', nome: 'Caixa Econômica Federal'   },
  { codigo: '237', nome: 'Bradesco'                  },
  { codigo: '341', nome: 'Itaú'                      },
  { codigo: '260', nome: 'Nu Pagamentos (Nubank)'    },
  { codigo: '290', nome: 'PagBank'                   },
  { codigo: '323', nome: 'Mercado Pago'              },
  { codigo: '077', nome: 'Banco Inter'               },
  { codigo: '756', nome: 'Sicoob'                    },
  { codigo: '748', nome: 'Sicredi'                   },
];

const TIPOS_CHAVE = [
  { value: 'cpf',       label: 'CPF'           },
  { value: 'cnpj',      label: 'CNPJ'          },
  { value: 'email',     label: 'E-mail'        },
  { value: 'telefone',  label: 'Celular'       },
  { value: 'aleatoria', label: 'Chave Aleatória' },
] as const;

// ─── Estado inicial ───────────────────────────────────────────────────────────

const INITIAL: DadosBancarios = {
  tipoConta:    'pj',
  nomeRazao:    '',
  cpfCnpj:      '',
  banco:        '',
  agencia:      '',
  conta:        '',
  digitoConta:  '',
  chavePix:     '',
  tipoChavePix: 'cnpj',
};

// ─── Helpers de UI ────────────────────────────────────────────────────────────

function Label({ children, required }: { children: React.ReactNode; required?: boolean }) {
  return (
    <label className="block text-sm font-medium text-foreground mb-1">
      {children}
      {required && <span className="text-error-fg ml-0.5">*</span>}
    </label>
  );
}

function SelectWrapper({ children }: { children: React.ReactNode }) {
  return (
    <div className="relative">
      {children}
      <ChevronDown size={14} className="absolute right-3 top-1/2 -translate-y-1/2 text-muted pointer-events-none" />
    </div>
  );
}

// ─── Card explicativo ─────────────────────────────────────────────────────────

function CardExplicativo() {
  return (
    <div className="bg-primary/5 border border-primary/20 rounded-xl p-5 space-y-4">
      <div className="flex items-start gap-3">
        <div className="w-8 h-8 rounded-lg bg-primary/10 flex items-center justify-center shrink-0 mt-0.5">
          <ShieldCheck size={16} className="text-primary" />
        </div>
        <div>
          <p className="text-sm font-semibold text-foreground">Repasse automático e seguro</p>
          <p className="text-xs text-muted mt-1 leading-relaxed">
            Seus repasses são processados automaticamente após cada pagamento confirmado. A plataforma retém <strong className="text-foreground">5%</strong> para manutenção do sistema, e o restante é transferido diretamente para esta conta.
          </p>
        </div>
      </div>

      <div className="border-t border-primary/10 pt-4 space-y-2">
        {[
          ['Frequência', 'Diária, dias úteis'],
          ['Prazo',      'D+1 após confirmação Pix'],
          ['Taxa',       '5% sobre ingressos pagos'],
          ['Gratuitos',  'Sem taxa de conveniência'],
        ].map(([k, v]) => (
          <div key={k} className="flex justify-between text-xs">
            <span className="text-muted">{k}</span>
            <span className="font-medium text-foreground">{v}</span>
          </div>
        ))}
      </div>

      <div className="flex items-start gap-2 bg-card rounded-lg px-3 py-2.5 border border-border">
        <Info size={13} className="text-muted shrink-0 mt-0.5" />
        <p className="text-xs text-muted leading-relaxed">
          Os dados bancários são criptografados e utilizados apenas para o processamento dos repasses via API de split de pagamento.
        </p>
      </div>
    </div>
  );
}

// ─── Componente principal ─────────────────────────────────────────────────────

export function FormDadosBancarios() {
  const [form,    setForm]    = useState<DadosBancarios>(INITIAL);
  const [saved,   setSaved]   = useState(false);
  const [loading, setLoading] = useState(false);

  function update(patch: Partial<DadosBancarios>) {
    setSaved(false);
    setForm((prev) => ({ ...prev, ...patch }));
  }

  async function handleSave(e: React.FormEvent) {
    e.preventDefault();
    setLoading(true);
    // TODO: upsert em supabase.from('dados_bancarios').upsert({ tenant_id, ...form })
    await new Promise((r) => setTimeout(r, 1000));
    setLoading(false);
    setSaved(true);
  }

  const isPJ = form.tipoConta === 'pj';

  return (
    <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">

      {/* Formulário */}
      <form onSubmit={handleSave} className="lg:col-span-2 space-y-5">

        {/* Tipo de conta */}
        <div>
          <Label>Tipo de conta</Label>
          <div className="flex gap-3">
            {(['pj', 'pf'] as const).map((tipo) => (
              <button
                key={tipo}
                type="button"
                onClick={() => update({ tipoConta: tipo, cpfCnpj: '', tipoChavePix: tipo === 'pj' ? 'cnpj' : 'cpf' })}
                className={`flex-1 py-2.5 rounded-lg text-sm font-medium border transition-all
                  ${form.tipoConta === tipo
                    ? 'bg-primary/10 border-primary text-primary'
                    : 'border-border text-muted hover:border-input-border-focus hover:text-foreground'
                  }`}
              >
                {tipo === 'pj' ? 'Pessoa Jurídica (CA / Entidade)' : 'Pessoa Física'}
              </button>
            ))}
          </div>
        </div>

        {/* Nome / Razão Social + CPF/CNPJ */}
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <div>
            <Label required>{isPJ ? 'Razão Social' : 'Nome completo'}</Label>
            <input
              type="text"
              className="input-base"
              placeholder={isPJ ? 'Centro Acadêmico de Sistemas' : 'Seu nome'}
              value={form.nomeRazao}
              onChange={(e) => update({ nomeRazao: e.target.value })}
              required
            />
          </div>
          <div>
            <Label required>{isPJ ? 'CNPJ' : 'CPF'}</Label>
            <input
              type="text"
              className="input-base"
              placeholder={isPJ ? '00.000.000/0001-00' : '000.000.000-00'}
              value={form.cpfCnpj}
              onChange={(e) => update({ cpfCnpj: e.target.value })}
              required
            />
          </div>
        </div>

        <div className="border-t border-border pt-5">
          <p className="text-xs font-semibold text-muted uppercase tracking-wide mb-4">Dados bancários</p>

          {/* Banco */}
          <div className="mb-4">
            <Label required>Banco</Label>
            <SelectWrapper>
              <select
                className="input-base appearance-none pr-8"
                value={form.banco}
                onChange={(e) => update({ banco: e.target.value })}
                required
              >
                <option value="">Selecione o banco</option>
                {BANCOS.map((b) => (
                  <option key={b.codigo} value={b.codigo}>
                    {b.codigo} — {b.nome}
                  </option>
                ))}
              </select>
            </SelectWrapper>
          </div>

          {/* Agência + Conta + Dígito */}
          <div className="grid grid-cols-3 gap-4">
            <div>
              <Label required>Agência</Label>
              <input
                type="text"
                className="input-base"
                placeholder="0001"
                maxLength={6}
                value={form.agencia}
                onChange={(e) => update({ agencia: e.target.value })}
                required
              />
            </div>
            <div>
              <Label required>Conta</Label>
              <input
                type="text"
                className="input-base"
                placeholder="00000000"
                value={form.conta}
                onChange={(e) => update({ conta: e.target.value })}
                required
              />
            </div>
            <div>
              <Label required>Dígito</Label>
              <input
                type="text"
                className="input-base"
                placeholder="0"
                maxLength={2}
                value={form.digitoConta}
                onChange={(e) => update({ digitoConta: e.target.value })}
                required
              />
            </div>
          </div>
        </div>

        {/* Chave Pix */}
        <div className="border-t border-border pt-5">
          <p className="text-xs font-semibold text-muted uppercase tracking-wide mb-4">Chave Pix principal</p>

          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
            <div>
              <Label>Tipo de chave</Label>
              <SelectWrapper>
                <select
                  className="input-base appearance-none pr-8"
                  value={form.tipoChavePix}
                  onChange={(e) => update({ tipoChavePix: e.target.value as DadosBancarios['tipoChavePix'] })}
                >
                  {TIPOS_CHAVE.map((t) => (
                    <option key={t.value} value={t.value}>{t.label}</option>
                  ))}
                </select>
              </SelectWrapper>
            </div>
            <div className="sm:col-span-2">
              <Label>Chave</Label>
              <input
                type="text"
                className="input-base"
                placeholder={
                  form.tipoChavePix === 'email'     ? 'centro@unicatolica.edu.br' :
                  form.tipoChavePix === 'telefone'  ? '+55 88 99999-0000'         :
                  form.tipoChavePix === 'cpf'       ? '000.000.000-00'            :
                  form.tipoChavePix === 'cnpj'      ? '00.000.000/0001-00'        :
                  'Chave aleatória (UUID)'
                }
                value={form.chavePix}
                onChange={(e) => update({ chavePix: e.target.value })}
              />
            </div>
          </div>
        </div>

        {/* Salvar */}
        <div className="flex items-center justify-end gap-3 pt-2">
          {saved && (
            <span className="flex items-center gap-1.5 text-sm text-success-fg font-medium">
              <Check size={15} />
              Dados salvos com sucesso
            </span>
          )}
          <button
            type="submit"
            disabled={loading}
            className="flex items-center gap-2 px-5 py-2.5 rounded-lg text-sm font-semibold bg-primary hover:bg-primary-hover text-primary-fg transition-colors disabled:opacity-60"
          >
            {loading
              ? <><Loader2 size={15} className="animate-spin" /> Salvando…</>
              : 'Salvar dados bancários'
            }
          </button>
        </div>
      </form>

      {/* Card lateral */}
      <div className="lg:col-span-1">
        <CardExplicativo />
      </div>
    </div>
  );
}