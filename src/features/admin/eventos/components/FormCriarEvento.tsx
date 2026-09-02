'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';

export default function FormCriarEvento() {
  const router = useRouter();
  const [loading, setLoading] = useState(false);

  const [nome, setNome] = useState('');
  const [descricao, setDescricao] = useState('');
  const [siglaCurso, setSiglaCurso] = useState('ENGCOMP');
  const [preco, setPreco] = useState('');
  const [vagas, setVagas] = useState('');

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (!nome || preco === '' || !vagas) {
      alert('Por favor, preencha os campos obrigatórios.');
      return;
    }

    setLoading(true);

    try {
      const response = await fetch('/api/admin/eventos', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          nome,
          descricao,
          siglaCurso,
          preco,
          vagas,
        }),
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.error || 'Erro ao salvar o evento.');
      }

      alert('🎉 Evento e lote publicados com sucesso!');

      setNome('');
      setDescricao('');
      setPreco('');
      setVagas('');

      router.push('/admin');
      router.refresh();
    } catch (error) {
      if (error instanceof Error) {
        alert(error.message);
      } else {
        alert('Ocorreu um erro inesperado.');
      }
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="bg-card border border-border p-6 rounded-xl shadow-md">
      <h3 className="text-lg font-bold text-foreground mb-4">Criar Novo Evento</h3>

      <form onSubmit={handleSubmit} className="space-y-4">
        <div>
          <label className="block text-xs font-semibold uppercase text-muted mb-1">
            Nome do Evento *
          </label>
          <input
            type="text"
            value={nome}
            onChange={(e) => setNome(e.target.value)}
            placeholder="Ex: Semana Acadêmica de Engenharia de Computação"
            className="input-base py-2 text-sm"
            required
          />
        </div>

        <div>
          <label className="block text-xs font-semibold uppercase text-muted mb-1">
            Descrição
          </label>
          <textarea
            value={descricao}
            onChange={(e) => setDescricao(e.target.value)}
            placeholder="Descreva o cronograma do evento..."
            rows={3}
            className="input-base resize-none text-sm"
          />
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
          <div>
            <label className="block text-xs font-semibold uppercase text-muted mb-1">
              Curso Alvo
            </label>
            <select
              value={siglaCurso}
              onChange={(e) => setSiglaCurso(e.target.value)}
              className="input-base py-2 text-sm"
            >
              <option value="ENGCOMP">ENGCOMP</option>
              <option value="DIREITO">DIREITO</option>
              <option value="ADMIN">ADMIN</option>
              <option value="GERAL">GERAL</option>
            </select>
          </div>

          <div>
            <label className="block text-xs font-semibold uppercase text-muted mb-1">
              Preço do Lote (R$) *
            </label>
            <input
              type="number"
              step="0.01"
              value={preco}
              onChange={(e) => setPreco(e.target.value)}
              placeholder="0.00"
              className="input-base py-2 text-sm"
              required
            />
          </div>

          <div>
            <label className="block text-xs font-semibold uppercase text-muted mb-1">
              Vagas Iniciais *
            </label>
            <input
              type="number"
              value={vagas}
              onChange={(e) => setVagas(e.target.value)}
              placeholder="Ex: 100"
              className="input-base py-2 text-sm"
              required
            />
          </div>
        </div>

        <button
          type="submit"
          disabled={loading}
          className="w-full mt-2 bg-primary hover:bg-primary-hover text-primary-fg font-semibold py-2.5 px-4 rounded-lg transition-all active:scale-[0.99] disabled:opacity-50"
        >
          {loading ? 'Publicando...' : 'Salvar e Publicar Evento'}
        </button>
      </form>
    </div>
  );
}