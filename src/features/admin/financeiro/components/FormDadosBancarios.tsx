'use client';

import { useState, useEffect } from 'react';
import { ShieldCheck, ChevronDown, Info, Loader2, Check } from 'lucide-react';
import { DadosBancarios } from '../types';
import { salvarDadosBancarios, buscarDadosBancarios } from '../actions';

const BANCOS = [
  { codigo: '001', nome: 'Banco do Brasil' },
  { codigo: '033', nome: 'Santander' },
  { codigo: '104', nome: 'Caixa Econômica Federal' },
  { codigo: '237', nome: 'Bradesco' },
  { codigo: '341', nome: 'Itaú' },
  { codigo: '260', nome: 'Nu Pagamentos (Nubank)' },
  { codigo: '290', nome: 'PagBank' },
  { codigo: '323', nome: 'Mercado Pago' },
  { codigo: '077', nome: 'Banco Inter' },
  { codigo: '756', nome: 'Sicoob' },
  { codigo: '748', nome: 'Sicredi' },
];

const TIPOS_CHAVE = [
  { value: 'cpf', label: 'CPF' },
  { value: 'cnpj', label: 'CNPJ' },
  { value: 'email', label: 'E-mail' },
  { value: 'telefone', label: 'Celular' },
  { value: 'aleatoria', label: 'Chave Aleatória' },
] as const;

const INITIAL: DadosBancarios = {
  tipoConta: 'pj',
  nomeRazao: '',
  cpfCnpj: '',
  banco: '',
  agencia: '',
  conta: '',
  digitoConta: '',
  chavePix: '',
  tipoChavePix: 'cnpj',
};

function Label({ children, required }: { children: React.ReactNode; required?: boolean }) {
  return (
    <label className="block text-xs font-medium text-foreground mb-1.5">
      {children}
      {required && <span className="text-error-fg ml-0.5">*</span>}
    </label>
  );
}

function SelectWrapper({ children }: { children: React.ReactNode }) {
  return (
    <div className="relative">
      {children}
      <ChevronDown size={14} className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-subtle pointer-events-none" />
    </div>
  );
}

function CardExplicativo() {
  return (
    <div className="bg-primary/5 border border-primary/15 rounded-2xl p-5 space-y-4">
      <div className="flex items-start gap-3">
        <div className="w-8 h-8 rounded-xl bg-primary/10 flex items-center justify-center shrink-0 mt-0.5">
          <ShieldCheck size={16} className="text-primary" />
        </div>
        <div>
          <p className="text-sm font-semibold text-foreground">Repasse automático e seguro</p>
          <p className="text-xs text-muted mt-1 leading-relaxed">
            Seus repasses são processados automaticamente. A plataforma retém <strong className="text-foreground">5%</strong> para manutenção, e o restante é transferido diretamente para esta conta.
          </p>
        </div>
      </div>

      <div className="border-t border-primary/15 pt-4 space-y-2">
        {[
          ['Frequência', 'Diária, dias úteis'],
          ['Prazo', 'D+1 após confirmação Pix'],
          ['Taxa', '5% sobre ingressos pagos'],
          ['Gratuitos', 'Sem taxa de conveniência'],
        ].map(([k, v]) => (
          <div key={k} className="flex justify-between text-xs">
            <span className="text-muted">{k}</span>
            <span className="font-medium text-foreground">{v}</span>
          </div>
        ))}
      </div>

      <div className="flex items-start gap-2 bg-card rounded-xl px-3 py-2.5 border border-border">
        <Info size={14} className="text-muted-subtle shrink-0 mt-0.5" />
        <p className="text-xs text-muted leading-relaxed">
          Os dados bancários são criptografados e utilizados apenas para o processamento dos repasses via API de split de pagamento.
        </p>
      </div>
    </div>
  );
}

export function FormDadosBancarios() {
  const [form, setForm] = useState<DadosBancarios>(INITIAL);
  const [saved, setSaved] = useState(false);
  const [loading, setLoading] = useState(false);
  const [loadingInit, setLoadingInit] = useState(true);
  const [erro, setErro] = useState<string | null>(null);

  useEffect(() => {
    buscarDadosBancarios().then((dadosNoBanco) => {
      if (dadosNoBanco) {
        setForm(dadosNoBanco);
      }
      setLoadingInit(false);
    });
  }, []);

  function update(patch: Partial<DadosBancarios>) {
    setSaved(false);
    setErro(null);
    setForm((prev) => ({ ...prev, ...patch }));
  }

  async function handleSave(e: React.FormEvent) {
    e.preventDefault();
    setLoading(true);
    setErro(null);

    try {
      await salvarDadosBancarios(form);
      setSaved(true);
      setTimeout(() => setSaved(false), 3000);
    } catch (err) {
      setErro(err instanceof Error ? err.message : 'Erro ao salvar os dados.');
    } finally {
      setLoading(false);
    }
  }

  const isPJ = form.tipoConta === 'pj';

  if (loadingInit) {
    return <div className="py-10 flex justify-center"><Loader2 className="animate-spin text-primary" /></div>;
  }

  return (
    <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
      <form onSubmit={handleSave} className="lg:col-span-2 space-y-5 bg-card border border-border rounded-2xl p-6 shadow-sm">
        <div>
          <Label>Tipo de conta</Label>
          <div className="flex gap-3">
            {(['pj', 'pf'] as const).map((tipo) => (
              <button
                key={tipo}
                type="button"
                onClick={() => update({ tipoConta: tipo, cpfCnpj: '', tipoChavePix: tipo === 'pj' ? 'cnpj' : 'cpf' })}
                className={`flex-1 py-2.5 rounded-xl text-xs font-medium border transition-all cursor-pointer ${form.tipoConta === tipo
                    ? 'bg-primary/10 border-primary text-primary font-semibold'
                    : 'bg-card border-border text-muted hover:border-input-border-hover'
                  }`}
              >
                {tipo === 'pj' ? 'Pessoa Jurídica (CA / Entidade)' : 'Pessoa Física'}
              </button>
            ))}
          </div>
        </div>

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

        <div className="border-t border-border-light pt-5">
          <p className="text-xs font-semibold text-muted-subtle uppercase tracking-wider mb-4">Dados bancários</p>

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

        <div className="border-t border-border-light pt-5">
          <p className="text-xs font-semibold text-muted-subtle uppercase tracking-wider mb-4">Chave Pix principal</p>

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
                  form.tipoChavePix === 'email' ? 'centro@unicatolica.edu.br' :
                    form.tipoChavePix === 'telefone' ? '+55 88 99999-0000' :
                      form.tipoChavePix === 'cpf' ? '000.000.000-00' :
                        form.tipoChavePix === 'cnpj' ? '00.000.000/0001-00' :
                          'Chave aleatória (UUID)'
                }
                value={form.chavePix}
                onChange={(e) => update({ chavePix: e.target.value })}
              />
            </div>
          </div>
        </div>

        {erro && <p className="text-sm text-error-fg font-medium">{erro}</p>}

        <div className="flex items-center justify-end gap-3 pt-4">
          {saved && (
            <span className="flex items-center gap-1.5 text-sm text-success-fg font-medium">
              <Check size={16} />
              Dados salvos com sucesso
            </span>
          )}
          <button
            type="submit"
            disabled={loading}
            className="flex items-center gap-2 px-5 py-2.5 rounded-xl text-sm font-semibold bg-primary hover:bg-primary-hover text-primary-fg transition-all shadow-sm cursor-pointer disabled:opacity-60"
          >
            {loading ? <><Loader2 size={16} className="animate-spin" /> Salvando…</> : 'Salvar dados bancários'}
          </button>
        </div>
      </form>

      <div className="lg:col-span-1">
        <CardExplicativo />
      </div>
    </div>
  );
}