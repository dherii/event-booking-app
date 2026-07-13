import { notFound } from 'next/navigation';
import Link from 'next/link';
import { ArrowLeft, MapPin, CalendarDays, Ticket, UtensilsCrossed, Crown, Mic2 } from 'lucide-react';
import { supabase } from '@/src/config/supabase';
import BotaoComprarLote from '@/src/features/catalog/components/BotaoComprarLote';

interface EventoPageProps {
  params: Promise<{ id: string }>;
}

export const revalidate = 0;

function fmtData(iso: string) {
  return new Date(iso).toLocaleDateString('pt-BR', {
    day: '2-digit', month: 'long', year: 'numeric',
  });
}

function formatCurrency(v: number) {
  if (v === 0) return 'Grátis';
  return v.toLocaleString('pt-BR', { style: 'currency', currency: 'BRL' });
}

const ICONE_TIPO: Record<string, React.ElementType> = {
  ingresso: Ticket,
  mesa: UtensilsCrossed,
  camarote: Crown,
};

const LABEL_TIPO: Record<string, string> = {
  ingresso: 'Ingresso',
  mesa: 'Mesa',
  camarote: 'Camarote',
};

export default async function EventoPage({ params }: EventoPageProps) {
  const { id } = await params;

  const { data: evento } = await supabase
    .from('eventos')
    .select(`
      *,
      estabelecimentos ( nome, slug, logo_url ),
      lotes ( * ),
      atracoes ( * )
    `)
    .eq('id', id)
    .single();

  if (!evento) notFound();

  const lotes: Array<{
    id: string;
    nome: string;
    preco: number;
    tipo: string;
    capacidade_pessoas: number | null;
    quantidade_disponivel: number;
  }> = evento.lotes ?? [];

  const atracoes: Array<{ id: string; nome_artista: string; horario: string | null }> =
    (evento.atracoes ?? []).sort((a: { ordem?: number }, b: { ordem?: number }) => (a.ordem ?? 0) - (b.ordem ?? 0));

  const estabelecimento = Array.isArray(evento.estabelecimentos)
    ? evento.estabelecimentos[0]
    : evento.estabelecimentos;

  return (
    <main className="min-h-screen bg-gray-950 text-white">
      {/* Banner */}
      <div className="relative w-full h-56 sm:h-72 bg-gradient-to-br from-blue-950 via-gray-900 to-purple-950 overflow-hidden">
        {evento.banner_url && (
          // eslint-disable-next-line @next/next/no-img-element
          <img src={evento.banner_url} alt={evento.nome} className="absolute inset-0 w-full h-full object-cover opacity-70" />
        )}
        <div className="absolute inset-0 bg-gradient-to-t from-gray-950 via-gray-950/40 to-transparent" />

        <div className="absolute top-4 left-4">
          <Link
            href="/"
            className="flex items-center gap-1.5 text-sm text-gray-300 hover:text-white bg-black/40 backdrop-blur px-3 py-1.5 rounded-full transition-colors"
          >
            <ArrowLeft size={14} />
            Voltar
          </Link>
        </div>
      </div>

      <div className="max-w-3xl mx-auto px-4 sm:px-8 -mt-10 relative">
        <div className="bg-gray-900 border border-gray-800 rounded-2xl p-6 sm:p-8 space-y-6">

          {/* Cabeçalho */}
          <div>
            <div className="flex items-center gap-2 flex-wrap mb-2">
              {evento.categoria && (
                <span className="text-xs font-semibold bg-blue-500/10 text-blue-400 px-2.5 py-1 rounded-full uppercase tracking-wider">
                  {evento.categoria}
                </span>
              )}
              {evento.classificacao_etaria ? (
                <span className="text-xs font-semibold bg-red-500/10 text-red-400 px-2.5 py-1 rounded-full">
                  {evento.classificacao_etaria}+
                </span>
              ) : null}
              {estabelecimento?.nome && (
                <span className="text-xs text-gray-500">por {estabelecimento.nome}</span>
              )}
            </div>

            <h1 className="text-2xl sm:text-3xl font-extrabold text-white">{evento.nome}</h1>

            <div className="flex flex-col sm:flex-row sm:items-center gap-2 sm:gap-4 mt-3 text-sm text-gray-400">
              <span className="flex items-center gap-1.5">
                <CalendarDays size={14} />
                {fmtData(evento.data_inicio)}
                {evento.data_fim && evento.data_fim !== evento.data_inicio && (
                  <> — {fmtData(evento.data_fim)}</>
                )}
              </span>
              {evento.local && (
                <span className="flex items-center gap-1.5">
                  <MapPin size={14} />
                  {evento.local}
                </span>
              )}
            </div>
          </div>

          {/* Descrição */}
          {evento.descricao && (
            <p className="text-gray-300 text-sm leading-relaxed whitespace-pre-line">
              {evento.descricao}
            </p>
          )}

          {/* Line-up */}
          {atracoes.length > 0 && (
            <div className="border-t border-gray-800 pt-5">
              <h2 className="flex items-center gap-2 text-sm font-semibold text-white mb-3">
                <Mic2 size={15} className="text-blue-400" />
                Atrações
              </h2>
              <div className="flex flex-wrap gap-2">
                {atracoes.map((a) => (
                  <span key={a.id} className="text-sm bg-gray-800 px-3 py-1.5 rounded-lg text-gray-200">
                    {a.nome_artista}
                    {a.horario && (
                      <span className="text-gray-500 ml-1.5 text-xs">
                        {new Date(a.horario).toLocaleTimeString('pt-BR', { hour: '2-digit', minute: '2-digit' })}
                      </span>
                    )}
                  </span>
                ))}
              </div>
            </div>
          )}

          {/* Lotes */}
          <div className="border-t border-gray-800 pt-5 space-y-3">
            <h2 className="text-sm font-semibold text-white mb-1">Ingressos, mesas e camarotes</h2>

            {lotes.length === 0 ? (
              <p className="text-sm text-gray-500">Nenhum lote disponível para este evento no momento.</p>
            ) : (
              lotes.map((lote) => {
                const Icon = ICONE_TIPO[lote.tipo] ?? Ticket;
                const esgotado = lote.quantidade_disponivel <= 0;

                return (
                  <div
                    key={lote.id}
                    className="flex items-center justify-between gap-4 bg-gray-950 border border-gray-800 rounded-xl px-4 py-3.5"
                  >
                    <div className="flex items-center gap-3 min-w-0">
                      <div className="w-9 h-9 rounded-lg bg-blue-500/10 text-blue-400 flex items-center justify-center shrink-0">
                        <Icon size={16} />
                      </div>
                      <div className="min-w-0">
                        <p className="text-sm font-medium text-white truncate">{lote.nome}</p>
                        <p className="text-xs text-gray-500">
                          {LABEL_TIPO[lote.tipo] ?? lote.tipo}
                          {lote.capacidade_pessoas ? ` · até ${lote.capacidade_pessoas} pessoas` : ''}
                          {' · '}
                          {esgotado ? 'esgotado' : `${lote.quantidade_disponivel} disponíveis`}
                        </p>
                      </div>
                    </div>

                    <div className="flex items-center gap-3 shrink-0">
                      <span className="text-sm font-bold text-green-400 whitespace-nowrap">
                        {formatCurrency(lote.preco)}
                      </span>
                      <BotaoComprarLote
                        eventoId={evento.id}
                        loteId={lote.id}
                        esgotado={esgotado}
                        label="Garantir"
                      />
                    </div>
                  </div>
                );
              })
            )}
          </div>
        </div>
      </div>
    </main>
  );
}
