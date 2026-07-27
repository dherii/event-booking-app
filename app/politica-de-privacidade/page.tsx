import Link from 'next/link';
import { ArrowLeft } from 'lucide-react';

export const metadata = { title: 'Termos de Uso' };

export default function TermosDeUsoPage() {
  return (
    <main className="min-h-screen bg-background text-foreground">
      <div className="max-w-3xl mx-auto px-4 sm:px-8 py-10">
        <Link href="/" className="flex items-center gap-1.5 text-sm text-muted hover:text-primary transition-colors mb-8">
          <ArrowLeft size={14} />
          Voltar
        </Link>

        <h1 className="text-2xl sm:text-3xl font-black mb-2">Termos de Uso</h1>
        <p className="text-sm text-muted mb-8">Última atualização: [DATA]</p>

        <div className="space-y-8 text-sm leading-relaxed text-muted [&_h2]:text-foreground [&_h2]:font-bold [&_h2]:text-base [&_h2]:mb-2 [&_strong]:text-foreground">

          <section>
            <h2>1. Quem somos</h2>
            <p>
              Esta plataforma (&quot;Plataforma&quot;) é operada por <strong>[RAZÃO SOCIAL / SEU NOME]</strong>,
              inscrito(a) no CPF/CNPJ <strong>[CPF OU CNPJ]</strong>, doravante &quot;nós&quot;. Contato: <strong>[E-MAIL DE CONTATO]</strong>.
            </p>
          </section>

          <section>
            <h2>2. O que a Plataforma faz</h2>
            <p>
              Somos um <strong>marketplace de ingressos</strong>: fornecemos a tecnologia para que casas de eventos,
              bares, baladas e organizadores (&quot;Estabelecimentos&quot;) cadastrem seus próprios eventos e vendam
              ingressos, mesas e camarotes diretamente aos usuários finais (&quot;Compradores&quot;).
            </p>
            <p className="mt-2">
              <strong>A Plataforma não organiza, promove nem é responsável pela realização dos eventos.</strong> Cada
              Estabelecimento é o único responsável pela veracidade das informações do evento, pela infraestrutura,
              segurança do local, cumprimento de leis aplicáveis (incluindo classificação etária) e pela experiência
              no dia do evento.
            </p>
          </section>

          <section>
            <h2>3. Cadastro</h2>
            <p>
              Para comprar ingressos ou cadastrar um Estabelecimento, é necessário criar uma conta com informações
              verdadeiras, completas e atualizadas. Você é responsável por manter a confidencialidade da sua senha e
              por todas as atividades realizadas na sua conta.
            </p>
          </section>

          <section>
            <h2>4. Compra de ingressos, mesas e camarotes</h2>
            <p>
              Os preços exibidos são definidos livremente por cada Estabelecimento. A Plataforma cobra uma
              <strong> taxa de conveniência de 5%</strong> sobre o valor de ingressos pagos, retida automaticamente no
              momento do repasse ao Estabelecimento. Ingressos gratuitos (cortesia) não geram cobrança de taxa.
            </p>
            <p className="mt-2">
              A confirmação da compra depende da confirmação do pagamento via Pix. Reservas com pagamento pendente
              podem ser canceladas automaticamente após o prazo de validade do Pix, liberando a vaga para outros
              Compradores.
            </p>
          </section>

          <section>
            <h2>5. Cancelamento e reembolso</h2>
            <p>
              O Comprador pode solicitar o cancelamento da própria inscrição em até <strong>48 (quarenta e oito)
              horas antes do início do evento</strong>, diretamente pela área &quot;Meus Ingressos&quot;. Após esse
              prazo, cancelamentos ficam a critério exclusivo do Estabelecimento responsável pelo evento.
            </p>
            <p className="mt-2">
              Em caso de cancelamento ou adiamento do evento pelo próprio Estabelecimento, a política de reembolso
              aplicável é definida por ele; a Plataforma atuará para viabilizar o processo, mas não garante o
              reembolso quando a responsabilidade pelo cancelamento do evento for do Estabelecimento.
            </p>
          </section>

          <section>
            <h2>6. Transferência de ingressos</h2>
            <p>
              Ingressos com pagamento confirmado podem ser transferidos para outra pessoa através do recurso de
              transferência disponível na conta do Comprador. A transferência é de responsabilidade exclusiva de
              quem a realiza; a Plataforma não medeia nem garante negociações financeiras entre Compradores fora do
              ambiente oficial.
            </p>
          </section>

          <section>
            <h2>7. Limite de compra</h2>
            <p>
              Para coibir revenda não autorizada (cambismo), a Plataforma pode limitar a quantidade de ingressos por
              pessoa/CPF em um mesmo lote ou evento.
            </p>
          </section>

          <section>
            <h2>8. Condutas proibidas</h2>
            <p>
              É proibido: usar a Plataforma para fins ilícitos; revender ingressos com sobrepreço fora do ambiente
              oficial; burlar limites de compra criando múltiplas contas; tentar acessar dados de outros usuários ou
              Estabelecimentos sem autorização; e qualquer conduta que viole a lei ou direitos de terceiros.
            </p>
          </section>

          <section>
            <h2>9. Responsabilidade dos Estabelecimentos</h2>
            <p>
              Ao cadastrar um evento, o Estabelecimento declara ter todas as licenças, autorizações e condições
              legais necessárias para realizá-lo, incluindo classificação etária informada, capacidade do local e
              segurança dos participantes. O Estabelecimento é o único responsável perante os Compradores e
              autoridades por qualquer questão relacionada à execução do evento.
            </p>
          </section>

          <section>
            <h2>10. Limitação de responsabilidade</h2>
            <p>
              A Plataforma não se responsabiliza por danos decorrentes da realização, cancelamento, adiamento ou
              qualidade dos eventos anunciados por terceiros, tampouco por indisponibilidades temporárias do serviço
              decorrentes de manutenção, falhas de terceiros (incluindo provedores de infraestrutura e pagamento) ou
              motivos de força maior.
            </p>
          </section>

          <section>
            <h2>11. Alterações destes Termos</h2>
            <p>
              Podemos atualizar estes Termos periodicamente. Alterações relevantes serão comunicadas pelos canais
              oficiais da Plataforma. O uso continuado após a atualização implica concordância com os novos termos.
            </p>
          </section>

          <section>
            <h2>12. Lei aplicável e foro</h2>
            <p>
              Estes Termos são regidos pelas leis da República Federativa do Brasil. Fica eleito o foro da comarca
              de <strong>[SUA CIDADE/COMARCA]</strong> para dirimir eventuais controvérsias, com renúncia a
              qualquer outro, por mais privilegiado que seja.
            </p>
          </section>

          <section>
            <h2>13. Contato</h2>
            <p>
              Dúvidas sobre estes Termos podem ser enviadas para <strong>[E-MAIL DE CONTATO]</strong>.
            </p>
          </section>

        </div>
      </div>
    </main>
  );
}
