import { notFound } from 'next/navigation';
import Link from 'next/link';
import {
  ArrowLeft,
  MapPin,
  CalendarDays,
  Clock,
  Ticket,
  UtensilsCrossed,
  Crown,
  Building2,
  ShieldCheck,
  Zap,
  QrCode,
  Compass,
  Users,
  Sparkles,
  BookOpen,
} from 'lucide-react';
import { createSupabaseServerClient } from '@/src/config/supabase-server';
import BotaoComprarLote from '@/src/features/catalog/components/BotaoComprarLote';
import { BotaoCompartilhar } from '@/src/features/catalog/components/BotaoCompartilhar';

interface EventoPageProps {
  params: Promise<{ id: string }>;
}

export const revalidate = 0;

function fmtDataBadge(iso: string) {
  const d = new Date(iso);
  const dia = d.getDate().toString().padStart(2, '0');
  const mes = d.toLocaleDateString('pt-BR', { month: 'short' }).replace('.', '').toUpperCase();
  return { dia, mes };
}

function fmtDataCompleta(iso: string) {
  return new Date(iso).toLocaleDateString('pt-BR', {
    day: '2-digit',
    month: 'long',
    year: 'numeric',
  });
}

function fmtHora(iso: string) {
  return new Date(iso).toLocaleTimeString('pt-BR', { hour: '2-digit', minute: '2-digit' });
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

  // Correção aplicada: Inicializando o cliente Supabase de servidor corretamente
  const supabase = await createSupabaseServerClient();

  const { data: evento } = await supabase
    .from('eventos')
    .select(`
      *,
      estabelecimentos ( nome, slug, logo_url ),
      lotes ( * ),
      atividades ( * )
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

  const primeiroLote = lotes[0];

  const atividades: Array<{
    id: string;
    titulo: string;
    descricao?: string | null;
    local_sala?: string | null;
    data_horario?: string | null;
    vagas_totais: number;
    vagas_disponiveis: number;
  }> = evento.atividades ?? [];

  const dateBadge = fmtDataBadge(evento.data_inicio);

  return (
    <main className="min-h-screen bg-background-secondary text-foreground pb-28 lg:pb-16">
      <header className="sticky top-0 z-30 bg-background/80 backdrop-blur-md border-b border-border">
        <div className="max-w-6xl mx-auto px-4 h-14 flex items-center justify-between">
          <Link
            href="/"
            className="inline-flex items-center gap-2 text-sm font-semibold text-muted hover:text-foreground transition-colors"
          >
            <ArrowLeft size={18} />
            <span className="hidden sm:inline">Voltar ao catálogo</span>
          </Link>

          <BotaoCompartilhar eventoNome={evento.nome} eventoId={evento.id} />
        </div>
      </header>

      <div className="max-w-6xl mx-auto px-4 pt-4 sm:pt-8">
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 lg:gap-8 items-start">
          
          <div className="lg:col-span-7 space-y-6">
            
            <div className="relative w-full aspect-[16/9] rounded-2xl overflow-hidden border border-border shadow-sm bg-card">
              {evento.banner_url ? (
                // eslint-disable-next-line @next/next/no-img-element
                <img
                  src={evento.banner_url}
                  alt={evento.nome}
                  className="w-full h-full object-cover"
                />
              ) : (
                <div className="w-full h-full bg-gradient-to-br from-accent-purple via-primary to-accent-pink flex items-center justify-center p-6 text-white text-center">
                  <h2 className="text-2xl font-black">{evento.nome}</h2>
                </div>
              )}

              <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/20 to-transparent" />

              <div className="absolute top-4 left-4 bg-black/75 backdrop-blur text-white rounded-xl px-3 py-1.5 text-center shadow-lg border border-white/20">
                <span className="block text-lg font-black leading-none">{dateBadge.dia}</span>
                <span className="block text-[9px] font-bold uppercase tracking-wider opacity-90 mt-0.5">
                  {dateBadge.mes}
                </span>
              </div>

              <div className="absolute bottom-4 left-4 right-4 text-white space-y-1">
                {evento.categoria && (
                  <span className="inline-block text-[10px] font-extrabold bg-primary text-white px-2.5 py-0.5 rounded-full uppercase tracking-wider mb-1">
                    {evento.categoria}
                  </span>
                )}
                <h1 className="text-xl sm:text-3xl font-black leading-tight drop-shadow">
                  {evento.nome}
                </h1>
              </div>
            </div>

            <div className="bg-card rounded-2xl p-4 sm:p-5 border border-border shadow-card grid grid-cols-3 gap-2 text-center divide-x divide-border">
              <div className="flex flex-col items-center justify-center p-1">
                <CalendarDays size={18} className="text-primary mb-1" />
                <span className="text-xs font-bold text-foreground leading-tight">
                  {fmtDataCompleta(evento.data_inicio)}
                </span>
              </div>

              <div className="flex flex-col items-center justify-center p-1">
                <Clock size={18} className="text-primary mb-1" />
                <span className="text-xs font-bold text-foreground leading-tight">
                  {fmtHora(evento.data_inicio)}
                </span>
              </div>

              <div className="flex flex-col items-center justify-center p-1">
                <MapPin size={18} className="text-primary mb-1" />
                <span className="text-xs font-bold text-foreground leading-tight truncate max-w-full">
                  {evento.local || 'Local a definir'}
                </span>
              </div>
            </div>

            {evento.descricao && (
              <div className="bg-card rounded-2xl p-5 sm:p-6 border border-border shadow-card space-y-3">
                <h3 className="text-base font-bold text-foreground">Sobre o evento</h3>
                <p className="text-muted text-sm leading-relaxed whitespace-pre-line">
                  {evento.descricao}
                </p>
              </div>
            )}

            {atividades.length > 0 && (
              <div className="bg-card rounded-2xl p-5 sm:p-6 border border-border shadow-card space-y-4">
                <h3 className="flex items-center gap-2 text-base font-bold text-foreground">
                  <BookOpen size={18} className="text-primary" />
                  Programação de Oficinas & Atividades
                </h3>
                <div className="space-y-3">
                  {atividades.map((atv) => {
                    const esgotada = atv.vagas_disponiveis <= 0;
                    const ultimasVagas = atv.vagas_disponiveis > 0 && atv.vagas_disponiveis <= 5;

                    return (
                      <div
                        key={atv.id}
                        className={`p-4 rounded-xl border transition-all ${
                          esgotada
                            ? 'bg-background-secondary/50 border-border opacity-70'
                            : 'bg-background-secondary border-border hover:border-primary/40'
                        }`}
                      >
                        <div className="flex items-start justify-between gap-3">
                          <div className="space-y-1">
                            <h4 className="text-sm font-bold text-foreground">{atv.titulo}</h4>
                            {atv.local_sala && (
                              <p className="text-xs text-muted font-medium flex items-center gap-1">
                                <Building2 size={13} className="text-primary shrink-0" />
                                {atv.local_sala}
                              </p>
                            )}
                            {atv.descricao && (
                              <p className="text-xs text-muted-subtle mt-1">{atv.descricao}</p>
                            )}
                          </div>

                          <div className="text-right shrink-0">
                            {esgotada ? (
                              <span className="inline-block text-[11px] font-bold bg-error-bg text-error-fg px-2.5 py-1 rounded-full border border-error-fg/20">
                                Indisponível
                              </span>
                            ) : ultimasVagas ? (
                              <span className="inline-block text-[11px] font-bold bg-warning-bg text-warning-fg px-2.5 py-1 rounded-full border border-warning-fg/20">
                                ÚLTIMAS {atv.vagas_disponiveis} VAGAS
                              </span>
                            ) : (
                              <span className="inline-block text-[11px] font-bold bg-success-bg text-success-fg px-2.5 py-1 rounded-full border border-success-fg/20">
                                {atv.vagas_disponiveis} vagas restantes
                              </span>
                            )}
                          </div>
                        </div>
                      </div>
                    );
                  })}
                </div>
              </div>
            )}

            <div className="bg-card rounded-2xl p-5 sm:p-6 border border-border shadow-card space-y-4">
              <h3 className="text-base font-bold text-foreground">O que você vai encontrar</h3>
              <div className="grid grid-cols-3 gap-3">
                <div className="bg-background-secondary rounded-xl p-3 border border-border flex flex-col items-center text-center">
                  <div className="w-9 h-9 rounded-lg bg-primary/10 text-primary flex items-center justify-center mb-2">
                    <Compass size={18} />
                  </div>
                  <span className="text-xs font-bold text-foreground leading-tight">
                    Conteúdo Exclusivo
                  </span>
                </div>

                <div className="bg-background-secondary rounded-xl p-3 border border-border flex flex-col items-center text-center">
                  <div className="w-9 h-9 rounded-lg bg-primary/10 text-primary flex items-center justify-center mb-2">
                    <Users size={18} />
                  </div>
                  <span className="text-xs font-bold text-foreground leading-tight">
                    Networking
                  </span>
                </div>

                <div className="bg-background-secondary rounded-xl p-3 border border-border flex flex-col items-center text-center">
                  <div className="w-9 h-9 rounded-lg bg-primary/10 text-primary flex items-center justify-center mb-2">
                    <Sparkles size={18} />
                  </div>
                  <span className="text-xs font-bold text-foreground leading-tight">
                    Experiências
                  </span>
                </div>
              </div>
            </div>
          </div>

          <div className="hidden lg:block lg:col-span-5 lg:sticky lg:top-20 space-y-4">
            <div className="bg-card rounded-2xl p-6 border border-border shadow-card space-y-5">
              <div>
                <h2 className="text-lg font-bold text-foreground">Ingressos e Reservas</h2>
                <p className="text-xs text-muted mt-1">
                  Escolha a opção desejada para garantir sua participação.
                </p>
              </div>

              {lotes.length === 0 ? (
                <div className="p-6 text-center rounded-xl border border-dashed border-border bg-background-secondary">
                  <Ticket size={24} className="mx-auto text-muted-subtle mb-2" />
                  <p className="text-sm text-muted font-medium">Nenhum lote disponível no momento.</p>
                </div>
              ) : (
                <div className="space-y-3">
                  {lotes.map((lote) => {
                    const Icon = ICONE_TIPO[lote.tipo] ?? Ticket;
                    const esgotado = lote.quantidade_disponivel <= 0;

                    return (
                      <div
                        key={lote.id}
                        className="flex flex-col gap-3 bg-background border border-border hover:border-primary/40 rounded-xl p-4 transition-all"
                      >
                        <div className="flex items-start justify-between gap-3">
                          <div className="flex items-center gap-3 min-w-0">
                            <div className="w-10 h-10 rounded-xl bg-primary/10 text-primary flex items-center justify-center shrink-0">
                              <Icon size={18} />
                            </div>
                            <div className="min-w-0">
                              <p className="text-sm font-bold text-foreground truncate">{lote.nome}</p>
                              <p className="text-xs text-muted">
                                {LABEL_TIPO[lote.tipo] ?? lote.tipo}
                              </p>
                            </div>
                          </div>

                          <div className="text-right shrink-0">
                            <span className="text-base font-extrabold text-primary">
                              {formatCurrency(lote.preco)}
                            </span>
                            <span className="block text-[11px] text-muted">
                              {esgotado ? (
                                <span className="text-error-fg font-semibold">Esgotado</span>
                              ) : (
                                `${lote.quantidade_disponivel} disponíveis`
                              )}
                            </span>
                          </div>
                        </div>

                        <div className="pt-2 border-t border-border/50">
                          <BotaoComprarLote
                            eventoId={evento.id}
                            loteId={lote.id}
                            esgotado={esgotado}
                            label="Garantir meu ingresso"
                          />
                        </div>
                      </div>
                    );
                  })}
                </div>
              )}

              <div className="pt-4 border-t border-border space-y-2.5 text-xs text-muted">
                <div className="flex items-center gap-2">
                  <ShieldCheck size={15} className="text-primary shrink-0" />
                  <span>Pagamento 100% seguro via Pix</span>
                </div>
                <div className="flex items-center gap-2">
                  <Zap size={15} className="text-primary shrink-0" />
                  <span>Confirmação instantânea do lote</span>
                </div>
                <div className="flex items-center gap-2">
                  <QrCode size={15} className="text-primary shrink-0" />
                  <span>Ingresso digital no seu celular</span>
                </div>
              </div>
            </div>
          </div>

        </div>
      </div>

      {primeiroLote && (
        <div className="lg:hidden fixed bottom-0 left-0 right-0 z-40 bg-card border-t border-border p-3.5 px-4 shadow-[0_-4px_20px_rgba(0,0,0,0.08)] backdrop-blur-lg bg-card/95">
          <div className="max-w-md mx-auto flex items-center justify-between gap-3">
            <div>
              <span className="block text-[11px] font-bold text-foreground truncate">
                {primeiroLote.nome}
              </span>
              <span className="text-xs text-success-fg font-semibold">
                {primeiroLote.quantidade_disponivel <= 0
                  ? 'Esgotado'
                  : `${primeiroLote.quantidade_disponivel} disponíveis`}
              </span>
              <div className="text-base font-extrabold text-primary leading-none mt-0.5">
                {formatCurrency(primeiroLote.preco)}
              </div>
            </div>

            <div className="w-1/2">
              <BotaoComprarLote
                eventoId={evento.id}
                loteId={primeiroLote.id}
                esgotado={primeiroLote.quantidade_disponivel <= 0}
                label="Garantir Ingresso"
              />
            </div>
          </div>
        </div>
      )}
    </main>
  );
}