import Link from 'next/link';
import { Plus, CalendarDays, MapPin, Ticket, UtensilsCrossed, Crown } from 'lucide-react';
import { listarEventos } from '@/src/features/admin/eventos/actions';
import { BotaoDeletarEvento } from '@/src/features/admin/eventos/components/BotaoDeletarEvento';

function fmtData(iso: string) {
  return new Date(iso).toLocaleDateString('pt-BR', { day: '2-digit', month: 'short', year: 'numeric' });
}

const ICONE_TIPO: Record<string, React.ElementType> = {
  ingresso: Ticket,
  mesa: UtensilsCrossed,
  camarote: Crown,
};

export default async function EventosPage() {
  const eventos = await listarEventos();

  return (
    <div className="space-y-6 max-w-7xl mx-auto pb-10">

      {/* Cabeçalho */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-slate-900 tracking-tight">Eventos</h1>
          <p className="text-sm text-slate-500 mt-1">Gerencie os eventos do seu estabelecimento.</p>
        </div>
        <Link
          href="/admin/eventos/novo"
          className="flex items-center gap-2 px-4 py-2.5 rounded-xl text-sm font-semibold bg-blue-600 hover:bg-blue-700 text-white transition-all shadow-sm cursor-pointer"
        >
          <Plus size={16} />
          Novo evento
        </Link>
      </div>

      {/* Lista */}
      {!eventos || eventos.length === 0 ? (
        <div className="border-2 border-dashed border-slate-200 rounded-2xl py-16 text-center bg-white">
          <CalendarDays size={36} className="mx-auto text-slate-400 mb-3" strokeWidth={1.3} />
          <p className="text-sm font-medium text-slate-900">Nenhum evento criado ainda.</p>
          <p className="text-xs text-slate-500 mt-1">Clique em &quot;Novo evento&quot; para publicar o primeiro.</p>
        </div>
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
          {eventos.map((evento) => {
            const lotes: Array<{ tipo: string; quantidade_disponivel: number; preco: number }> =
              evento.lotes ?? [];
            const tiposPresentes = Array.from(new Set(lotes.map((l) => l.tipo)));

            return (
              <Link
                key={evento.id}
                href={`/admin/eventos/${evento.id}`}
                className="bg-white border border-slate-200/80 rounded-2xl p-5 hover:border-blue-500 hover:shadow-md transition-all flex flex-col gap-3 group relative"
              >
                <div className="flex items-start justify-between gap-2">
                  <div className="flex-1">
                    <h2 className="text-sm font-semibold text-slate-900 group-hover:text-blue-600 transition-colors line-clamp-2">
                      {evento.nome}
                    </h2>
                    {evento.categoria && (
                      <span className="inline-block mt-2 text-[11px] px-2.5 py-0.5 rounded-full bg-blue-50 text-blue-600 font-medium border border-blue-100">
                        {evento.categoria}
                      </span>
                    )}
                  </div>

                  {/* Botão para deletar evento */}
                  <BotaoDeletarEvento eventoId={evento.id} nomeEvento={evento.nome} />
                </div>

                <div className="space-y-1.5 text-xs text-slate-500">
                  <div className="flex items-center gap-1.5">
                    <CalendarDays size={13} className="text-slate-400" />
                    {fmtData(evento.data_inicio)}
                    {evento.data_fim && evento.data_fim !== evento.data_inicio && (
                      <> — {fmtData(evento.data_fim)}</>
                    )}
                  </div>
                  {evento.local && (
                    <div className="flex items-center gap-1.5">
                      <MapPin size={13} className="text-slate-400" />
                      <span className="truncate">{evento.local}</span>
                    </div>
                  )}
                </div>

                {tiposPresentes.length > 0 && (
                  <div className="flex items-center gap-2 pt-3 border-t border-slate-100 mt-auto">
                    {tiposPresentes.map((tipo) => {
                      const Icon = ICONE_TIPO[tipo] ?? Ticket;
                      return (
                        <span key={tipo} className="flex items-center gap-1 text-[11px] text-slate-500 capitalize">
                          <Icon size={12} className="text-slate-400" />
                          {tipo}
                        </span>
                      );
                    })}
                  </div>
                )}
              </Link>
            );
          })}
        </div>
      )}
    </div>
  );
}