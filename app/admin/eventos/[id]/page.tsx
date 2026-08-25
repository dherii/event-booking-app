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
    <main className="min-h-screen bg-background text-foreground bg-grid-pattern relative pb-28 lg:pb-16">
      {/* Luzes difusas ambientais */}
      <div className="ambient-glow left-10 top-20" />
      <div className="ambient-glow right-10 top-96" />

      {/* Header Fixo / Barra Superior */}
      <header className="sticky top-0 z-30 bg-background/80 backdrop-blur-md border-b border-border/80">
        <div className="max-w-6xl mx-auto px-4 h-16 flex items-center justify-between">
          <Link
            href="/"
            className="inline-flex items-center gap-2 text-xs font-black uppercase tracking-wider text-muted hover:text-foreground transition-colors"
          >
            <ArrowLeft size={16} />
            <span className="hidden sm:inline">Voltar ao catálogo</span>
          </Link>

          <BotaoCompartilhar eventoNome={evento.nome} eventoId={evento.id} />
        </div>
      </header>

      <div className="max-w-6xl mx-auto px-4 pt-6 sm:pt-10 relative">
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
          
          {/* Coluna Principal da Esquerda */}
          <div className="lg:col-span-7 space-y-6">
            
            {/* Banner Principal com Glassmorphism e Badges */}
            <div className="relative w-full aspect-[16/9] rounded-3xl overflow-hidden border border-border/80 shadow-2xl bg-card">
              {evento.banner_url ? (
                // eslint-disable-next-line @next/next/no-img-element
                <img
                  src={evento.banner_url}
                  alt={evento.nome}
                  className="w-full h-full object-cover transition-transform duration-700 hover:scale-105"
                />
              ) : (
                <div className="w-full h-full bg-gradient-to-br from-accent-purple/40 via-card to-accent-pink/40 flex items-center justify-center p-6 text-white text-center">
                  <h2 className="text-2xl font-black">{evento.nome}</h2>
                </div>
              )}

              <div className="absolute inset-0 bg-gradient-to-t from-black/90 via-black/30 to-black/10" />

              {/* Data Badge */}
              <div className="absolute top-4 left-4 min-w-[56px] rounded-2xl border border-white/15 bg-black/60 px-2.5 py-2 text-center leading-none backdrop-blur-md shadow-sm">
                <span className="block text-xs font-black text-primary">{dateBadge.dia}</span>
                <span className="block mt-1 text-[10px] font-extrabold text-white">{dateBadge.mes}</span>
              </div>

              {/* Informações sobrepostas */}
              <div className="absolute bottom-5 left-5 right-5 text-white space-y-2">
                {evento.categoria && (
                  <span className="inline-block rounded-full border border-white/20 bg-primary px-3 py-1 text-[10px] font-black uppercase tracking-wider shadow-neon">
                    {evento.categoria}
                  </span>
                )}
                <h1 className="text-xl sm:text-3xl font-black leading-tight drop-shadow-md text-white">
                  {evento.nome}
                </h1>
              </div>
            </div>

            {/* Grid de Informações Rápidas (Data, Hora, Local) Refinado */}
            <div className="glass-card-premium rounded-3xl p-5 shadow-card grid grid-cols-3 gap-3 text-center divide-x divide-border/60">
              <div className="flex flex-col items-center justify-center p-1 group transition-colors">
                <div className="w-8 h-8 rounded-xl bg-primary/10 text-primary flex items-center justify-center mb-1.5 group-hover:scale-110 transition-transform">
                  <CalendarDays size={16} />
                </div>
                <span className="text-xs font-bold text-foreground leading-tight">
                  {fmtDataCompleta(evento.data_inicio)}
                </span>
              </div>

              <div className="flex flex-col items-center justify-center p-1 group transition-colors">
                <div className="w-8 h-8 rounded-xl bg-primary/10 text-primary flex items-center justify-center mb-1.5 group-hover:scale-110 transition-transform">
                  <Clock size={16} />
                </div>
                <span className="text-xs font-bold text-foreground leading-tight">
                  {fmtHora(evento.data_inicio)}
                </span>
              </div>

              <div className="flex flex-col items-center justify-center p-1 group transition-colors">
                <div className="w-8 h-8 rounded-xl bg-primary/10 text-primary flex items-center justify-center mb-1.5 group-hover:scale-110 transition-transform">
                  <MapPin size={16} />
                </div>
                <span className="text-xs font-bold text-foreground leading-tight truncate max-w-full">
                  {evento.local || 'Local a definir'}
                </span>
              </div>
            </div>

            {/* Descrição do Evento */}
            {evento.descricao && (
              <div className="glass-card-premium rounded-3xl p-6 sm:p-8 shadow-card space-y-3">
                <h3 className="text-base font-black text-foreground">Sobre o evento</h3>
                <p className="text-muted text-sm leading-relaxed whitespace-pre-line font-medium">
                  {evento.descricao}
                </p>
              </div>
            )}

            {/* Atividades / Programação */}
            {atividades.length > 0 && (
              <div className="glass-card-premium rounded-3xl p-6 sm:p-8 shadow-card space-y-4">
                <h3 className="flex items-center gap-2.5 text-base font-black text-foreground">
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
                        className={`p-4 rounded-2xl border transition-all ${
                          esgotada
                            ? 'bg-background-secondary/50 border-border opacity-70'
                            : 'bg-background-secondary border-border/80 hover:border-primary/40'
                        }`}
                      >
                        <div className="flex items-start justify-between gap-3">
                          <div className="space-y-1">
                            <h4 className="text-sm font-bold text-foreground">{atv.titulo}</h4>
                            {atv.local_sala && (
                              <p className="text-xs text-muted font-medium flex items-center gap-1.5">
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
                              <span className="inline-block text-[10px] font-black uppercase tracking-wide bg-error-bg text-error-fg px-2.5 py-1 rounded-full border border-error-fg/20">
                                Indisponível
                              </span>
                            ) : ultimasVagas ? (
                              <span className="badge-urgency px-2.5 py-1 text-[10px]">
                                ÚLTIMAS {atv.vagas_disponiveis} VAGAS
                              </span>
                            ) : (
                              <span className="inline-block text-[10px] font-black uppercase tracking-wide bg-success-bg text-success-fg px-2.5 py-1 rounded-full border border-success-fg/20">
                                {atv.vagas_disponiveis} vagas
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

            {/* Destaques / Benefícios com hover refinado */}
            <div className="glass-card-premium rounded-3xl p-6 sm:p-8 shadow-card space-y-4">
              <h3 className="text-base font-black text-foreground">O que você vai encontrar</h3>
              <div className="grid grid-cols-3 gap-3">
                <div className="bg-background-secondary rounded-2xl p-4 border border-border/80 flex flex-col items-center text-center transition-all hover:border-primary/40 hover:-translate-y-1">
                  <div className="w-10 h-10 rounded-xl bg-primary/10 text-primary flex items-center justify-center mb-2.5 shadow-sm">
                    <Compass size={18} />
                  </div>
                  <span className="text-xs font-bold text-foreground leading-tight">
                    Conteúdo Exclusivo
                  </span>
                </div>

                <div className="bg-background-secondary rounded-2xl p-4 border border-border/80 flex flex-col items-center text-center transition-all hover:border-primary/40 hover:-translate-y-1">
                  <div className="w-10 h-10 rounded-xl bg-primary/10 text-primary flex items-center justify-center mb-2.5 shadow-sm">
                    <Users size={18} />
                  </div>
                  <span className="text-xs font-bold text-foreground leading-tight">
                    Networking
                  </span>
                </div>

                <div className="bg-background-secondary rounded-2xl p-4 border border-border/80 flex flex-col items-center text-center transition-all hover:border-primary/40 hover:-translate-y-1">
                  <div className="w-10 h-10 rounded-xl bg-primary/10 text-primary flex items-center justify-center mb-2.5 shadow-sm">
                    <Sparkles size={18} />
                  </div>
                  <span className="text-xs font-bold text-foreground leading-tight">
                    Experiências
                  </span>
                </div>
              </div>
            </div>
          </div>

          {/* Sidebar Desktop (Ingressos e Lotes) com detalhe superior em destaque */}
          <div className="hidden lg:block lg:col-span-5 lg:sticky lg:top-24 space-y-4">
            <div className="glass-card-premium rounded-3xl p-6 sm:p-8 border-t-2 border-primary/60 border-x border-b border-border/85 shadow-2xl space-y-6">
              <div>
                <h2 className="text-lg font-black text-foreground">Ingressos e Reservas</h2>
                <p className="text-xs text-muted mt-1 font-medium">
                  Escolha a opção desejada para garantir sua participação.
                </p>
              </div>

              {lotes.length === 0 ? (
                <div className="p-8 text-center rounded-2xl border border-dashed border-border bg-background-secondary">
                  <Ticket size={28} className="mx-auto text-muted-subtle mb-2" />
                  <p className="text-sm text-muted font-bold">Nenhum lote disponível no momento.</p>
                </div>
              ) : (
                <div className="space-y-3.5">
                  {lotes.map((lote) => {
                    const Icon = ICONE_TIPO[lote.tipo] ?? Ticket;
                    const esgotado = lote.quantidade_disponivel <= 0;

                    return (
                      <div
                        key={lote.id}
                        className="flex flex-col gap-3.5 bg-background border border-border/80 hover:border-primary/40 rounded-2xl p-4.5 transition-all shadow-sm"
                      >
                        <div className="flex items-start justify-between gap-3">
                          <div className="flex items-center gap-3.5 min-w-0">
                            <div className="w-10 h-10 rounded-xl bg-primary/10 text-primary flex items-center justify-center shrink-0">
                              <Icon size={18} />
                            </div>
                            <div className="min-w-0">
                              <p className="text-sm font-bold text-foreground truncate">{lote.nome}</p>
                              <p className="text-xs text-muted font-semibold">
                                {LABEL_TIPO[lote.tipo] ?? lote.tipo}
                              </p>
                            </div>
                          </div>

                          <div className="text-right shrink-0">
                            <span className="text-base font-black text-primary">
                              {formatCurrency(lote.preco)}
                            </span>
                            <span className="block text-[11px] text-muted font-medium">
                              {esgotado ? (
                                <span className="text-error-fg font-bold">Esgotado</span>
                              ) : (
                                `${lote.quantidade_disponivel} disponíveis`
                              )}
                            </span>
                          </div>
                        </div>

                        <div className="pt-2 border-t border-border/60">
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

              {/* Selos de segurança */}
              <div className="pt-5 border-t border-border/80 space-y-3 text-xs text-muted font-medium">
                <div className="flex items-center gap-2.5">
                  <ShieldCheck size={16} className="text-primary shrink-0" />
                  <span>Pagamento 100% seguro via Pix ou cartão</span>
                </div>
                <div className="flex items-center gap-2.5">
                  <Zap size={16} className="text-primary shrink-0" />
                  <span>Confirmação instantânea do lote</span>
                </div>
                <div className="flex items-center gap-2.5">
                  <QrCode size={16} className="text-primary shrink-0" />
                  <span>Ingresso digital direto no seu celular</span>
                </div>
              </div>
            </div>
          </div>

        </div>
      </div>

      {/* Barra Inferior Fixa para Mobile */}
      {primeiroLote && (
        <div className="lg:hidden fixed bottom-0 left-0 right-0 z-40 bg-card/95 border-t border-border/80 p-4 shadow-[0_-4px_25px_rgba(0,0,0,0.12)] backdrop-blur-xl">
          <div className="max-w-md mx-auto flex items-center justify-between gap-4">
            <div>
              <span className="block text-xs font-bold text-foreground truncate max-w-[160px]">
                {primeiroLote.nome}
              </span>
              <span className="text-[11px] text-success-fg font-bold">
                {primeiroLote.quantidade_disponivel <= 0
                  ? 'Esgotado'
                  : `${primeiroLote.quantidade_disponivel} disponíveis`}
              </span>
              <div className="text-base font-black text-primary leading-tight mt-0.5">
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