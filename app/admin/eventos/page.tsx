import Link from 'next/link';
import { Plus, CalendarDays, MapPin, Ticket, UtensilsCrossed, Crown, Pencil, History } from 'lucide-react';
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

// Extratificando o Card do Evento para reutilização nas duas listas
function EventoCard({ evento }: { evento: any }) {
  const lotes: Array<{ tipo: string; quantidade_disponivel: number; preco: number }> = evento.lotes ?? [];
  const tiposPresentes = Array.from(new Set(lotes.map((l) => l.tipo)));

  return (
    <div className="clubber-card p-5 flex flex-col gap-3 group relative cursor-pointer">
      <div className="flex items-start justify-between gap-2">
        <Link href={`/admin/eventos/${evento.id}`} className="flex-1 focus:outline-none">
          <h2 className="text-sm font-semibold text-foreground group-hover:text-primary transition-colors line-clamp-2">
            {evento.nome}
          </h2>
          {evento.categoria && (
            <span className="inline-block mt-2 text-[11px] px-2.5 py-0.5 rounded-full bg-primary/10 text-primary font-medium border border-primary/20">
              {evento.categoria}
            </span>
          )}
        </Link>

        {/* Ações do Card (Editar e Deletar) */}
        <div className="flex items-center gap-1 shrink-0 relative z-10">
          <Link
            href={`/admin/eventos/${evento.id}/editar`}
            className="p-1.5 rounded-lg text-muted hover:text-primary hover:bg-primary/10 transition-colors"
            title="Editar evento"
          >
            <Pencil size={16} />
          </Link>
          <BotaoDeletarEvento eventoId={evento.id} nomeEvento={evento.nome} />
        </div>
      </div>

      <Link href={`/admin/eventos/${evento.id}`} className="space-y-1.5 text-xs text-muted flex-1 focus:outline-none">
        <div className="flex items-center gap-1.5">
          <CalendarDays size={13} className="text-muted-subtle" />
          {fmtData(evento.data_inicio)}
          {evento.data_fim && evento.data_fim !== evento.data_inicio && (
            <> — {fmtData(evento.data_fim)}</>
          )}
        </div>
        {evento.local && (
          <div className="flex items-center gap-1.5">
            <MapPin size={13} className="text-muted-subtle" />
            <span className="truncate text-foreground">{evento.local}</span>
          </div>
        )}
      </Link>

      {tiposPresentes.length > 0 && (
        <div className="flex items-center gap-2 pt-3 border-t border-border mt-auto pointer-events-none">
          {tiposPresentes.map((tipo) => {
            const Icon = ICONE_TIPO[tipo] ?? Ticket;
            return (
              <span key={tipo} className="flex items-center gap-1 text-[11px] text-muted capitalize font-medium">
                <Icon size={12} className="text-muted-subtle" />
                {tipo}
              </span>
            );
          })}
        </div>
      )}
    </div>
  );
}

export default async function EventosPage() {
  const eventos = await listarEventos();

  const hoje = new Date().toISOString();

  const proximos = eventos?.filter((e) => {
    const dataReferencia = e.data_fim ? e.data_fim : e.data_inicio;
    return dataReferencia >= hoje;
  }) || [];

  const passados = eventos?.filter((e) => {
    const dataReferencia = e.data_fim ? e.data_fim : e.data_inicio;
    return dataReferencia < hoje;
  }) || [];

  return (
    <div className="space-y-8 max-w-7xl mx-auto pb-10">

      {/* Cabeçalho */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-border pb-5">
        <div>
          <h1 className="text-2xl font-bold text-foreground tracking-tight">Eventos</h1>
          <p className="text-sm text-muted mt-1">Gerencie os eventos do seu estabelecimento.</p>
        </div>
        <Link href="/admin/eventos/novo" className="clubber-button shrink-0">
          <Plus size={16} />
          Novo evento
        </Link>
      </div>

      {!eventos || eventos.length === 0 ? (
        <div className="clubber-card border-dashed py-16 text-center shadow-none bg-background-secondary/50">
          <CalendarDays size={36} className="mx-auto text-muted-subtle mb-3" strokeWidth={1.5} />
          <p className="text-sm font-semibold text-foreground">Nenhum evento criado ainda.</p>
          <p className="text-xs text-muted mt-1">Clique em &quot;Novo evento&quot; para publicar o primeiro.</p>
        </div>
      ) : (
        <div className="space-y-10">

          {/* Seção: Próximos Eventos */}
          <section>
            <div className="flex items-center gap-2 mb-4">
              <div className="w-8 h-8 rounded-lg bg-primary/10 text-primary flex items-center justify-center">
                <CalendarDays size={18} />
              </div>
              <h2 className="text-lg font-bold text-foreground">Próximos Eventos</h2>
            </div>

            {proximos.length === 0 ? (
              <p className="text-sm text-muted bg-background-secondary border border-border rounded-xl p-6 text-center font-medium">
                Nenhum evento programado para o futuro.
              </p>
            ) : (
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-5">
                {proximos.map((evento) => (
                  <EventoCard key={evento.id} evento={evento} />
                ))}
              </div>
            )}
          </section>

          {/* Seção: Eventos Passados */}
          {passados.length > 0 && (
            <section>
              <div className="flex items-center gap-2 mb-4">
                <div className="w-8 h-8 rounded-lg bg-background-tertiary text-muted-subtle flex items-center justify-center border border-border">
                  <History size={18} />
                </div>
                <h2 className="text-lg font-bold text-foreground">Histórico de Eventos</h2>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-5 opacity-70 hover:opacity-100 transition-opacity duration-300">
                {passados.map((evento) => (
                  <EventoCard key={evento.id} evento={evento} />
                ))}
              </div>
            </section>
          )}

        </div>
      )}
    </div>
  );
}