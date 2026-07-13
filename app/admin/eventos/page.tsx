// app/admin/eventos/page.tsx
import Link from 'next/link';
import { Plus, CalendarDays, MapPin, Ticket, UtensilsCrossed, Crown } from 'lucide-react';
import { listarEventos } from '@/src/features/admin/eventos/actions';

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
    <div className="space-y-6">

      {/* Cabeçalho */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-xl font-bold text-foreground">Eventos</h1>
          <p className="text-sm text-muted mt-0.5">Gerencie os eventos do seu estabelecimento.</p>
        </div>
        <Link
          href="/admin/eventos/novo"
          className="flex items-center gap-2 px-4 py-2.5 rounded-lg text-sm font-semibold bg-primary hover:bg-primary-hover text-primary-fg transition-colors"
        >
          <Plus size={16} />
          Novo evento
        </Link>
      </div>

      {/* Lista */}
      {!eventos || eventos.length === 0 ? (
        <div className="border-2 border-dashed border-border rounded-2xl py-16 text-center">
          <CalendarDays size={32} className="mx-auto text-muted mb-3" strokeWidth={1.3} />
          <p className="text-sm font-medium text-foreground">Nenhum evento criado ainda.</p>
          <p className="text-xs text-muted mt-1">Clique em &quot;Novo evento&quot; para publicar o primeiro.</p>
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
                className="bg-card border border-border rounded-xl p-5 hover:border-primary/50 transition-colors flex flex-col gap-3"
              >
                <div>
                  <h2 className="text-sm font-semibold text-foreground line-clamp-2">{evento.nome}</h2>
                  {evento.categoria && (
                    <span className="inline-block mt-1.5 text-[11px] px-2 py-0.5 rounded-full bg-primary/10 text-primary font-medium">
                      {evento.categoria}
                    </span>
                  )}
                </div>

                <div className="space-y-1.5 text-xs text-muted">
                  <div className="flex items-center gap-1.5">
                    <CalendarDays size={13} />
                    {fmtData(evento.data_inicio)}
                    {evento.data_fim && evento.data_fim !== evento.data_inicio && (
                      <> — {fmtData(evento.data_fim)}</>
                    )}
                  </div>
                  {evento.local && (
                    <div className="flex items-center gap-1.5">
                      <MapPin size={13} />
                      <span className="truncate">{evento.local}</span>
                    </div>
                  )}
                </div>

                {tiposPresentes.length > 0 && (
                  <div className="flex items-center gap-2 pt-2 border-t border-border mt-auto">
                    {tiposPresentes.map((tipo) => {
                      const Icon = ICONE_TIPO[tipo] ?? Ticket;
                      return (
                        <span key={tipo} className="flex items-center gap-1 text-[11px] text-muted">
                          <Icon size={12} />
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
