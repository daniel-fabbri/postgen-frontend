import React from 'react';
import { Link } from 'react-router-dom';

const Section = ({ title, children }) => (
  <div className="py-5 border-b border-gray-100 dark:border-gray-700 last:border-0">
    <h2 className="text-lg font-semibold mb-3 text-gray-900 dark:text-white">{title}</h2>
    <div className="space-y-2 text-sm text-gray-600 dark:text-gray-400 leading-relaxed">
      {children}
    </div>
  </div>
);

const TermsPage = () => (
  <div className="max-w-3xl mx-auto space-y-6">
    <div>
      <h1 className="text-3xl font-bold">Termos de Uso</h1>
      <p className="text-gray-500 dark:text-gray-400 mt-1 text-sm">Última atualização: 26 de maio de 2026</p>
    </div>

    <div className="bg-white dark:bg-gray-800 rounded-xl shadow-lg border border-gray-200 dark:border-gray-700 px-8 py-2">

      <Section title="1. Aceitação dos Termos">
        <p>
          Ao acessar e utilizar o <strong>PostGen</strong>, você concorda com estes Termos de Uso. Se não concordar com qualquer disposição, não utilize a plataforma.
        </p>
      </Section>

      <Section title="2. Descrição do Serviço">
        <p>
          O PostGen é uma plataforma de geração e gestão de conteúdo para redes sociais assistida por inteligência artificial. O serviço permite criar canais, gerar textos e imagens via IA (Azure OpenAI) e publicar conteúdo diretamente no Instagram através da Graph API da Meta.
        </p>
      </Section>

      <Section title="3. Uso Permitido">
        <p>Você se compromete a utilizar o PostGen exclusivamente para fins lícitos e em conformidade com as leis aplicáveis, bem como com os Termos de Serviço das plataformas integradas (Meta/Instagram). É vedado:</p>
        <ul className="list-disc list-inside space-y-1 mt-2 ml-2">
          <li>Gerar ou publicar conteúdo ilegal, difamatório, discriminatório ou enganoso;</li>
          <li>Utilizar a plataforma para spam ou práticas abusivas;</li>
          <li>Compartilhar credenciais de acesso com terceiros não autorizados;</li>
          <li>Tentar acessar sistemas ou dados além do escopo do seu uso legítimo.</li>
        </ul>
      </Section>

      <Section title="4. Conteúdo Gerado por IA">
        <p>
          Todo o conteúdo (textos e imagens) é gerado por modelos de inteligência artificial da Azure OpenAI. O PostGen não garante precisão, adequação ou originalidade do conteúdo produzido. <strong>É de sua responsabilidade revisar, editar e aprovar qualquer conteúdo antes de publicá-lo.</strong>
        </p>
        <p className="mt-2">
          Você é o único responsável pelo conteúdo publicado em suas redes sociais, independentemente de ter sido gerado por IA.
        </p>
      </Section>

      <Section title="5. Credenciais e Segurança">
        <p>
          Você é responsável pela guarda e segurança de todas as credenciais configuradas na plataforma, incluindo chaves de API da Azure OpenAI e tokens de acesso do Instagram. Não compartilhe essas informações com terceiros. Qualquer atividade realizada com suas credenciais é de sua responsabilidade.
        </p>
      </Section>

      <Section title="6. Propriedade Intelectual">
        <p>
          Os direitos sobre o código-fonte e a interface do PostGen pertencem aos seus desenvolvedores. O conteúdo gerado pela IA a partir das suas instruções é de sua propriedade, respeitados os Termos de Uso dos modelos da Azure OpenAI e as políticas da Meta.
        </p>
      </Section>

      <Section title="7. Limitação de Responsabilidade">
        <p>
          O PostGen é fornecido "no estado em que se encontra", sem garantias de disponibilidade contínua ou ausência de erros. Não nos responsabilizamos por perdas ou danos decorrentes de falhas na geração de conteúdo, indisponibilidade de APIs de terceiros (Azure OpenAI, Meta/Instagram) ou uso indevido da plataforma.
        </p>
      </Section>

      <Section title="8. Serviços de Terceiros">
        <p>O PostGen integra-se a serviços de terceiros sujeitos a seus próprios termos:</p>
        <ul className="list-disc list-inside space-y-1 mt-2 ml-2">
          <li>Azure OpenAI (Microsoft) — geração de texto e imagens;</li>
          <li>Instagram Graph API (Meta) — publicação de conteúdo.</li>
        </ul>
        <p className="mt-2">O uso desses serviços está sujeito às respectivas políticas de cada fornecedor.</p>
      </Section>

      <Section title="9. Alterações nos Termos">
        <p>
          Reservamo-nos o direito de atualizar estes Termos a qualquer momento. Alterações relevantes serão comunicadas na plataforma. O uso continuado após as alterações implica aceitação dos novos termos.
        </p>
      </Section>

      <Section title="10. Contato">
        <p>
          Em caso de dúvidas sobre estes Termos de Uso, entre em contato através dos canais disponíveis na plataforma.
        </p>
      </Section>
    </div>

    <p className="text-center text-sm text-gray-500 dark:text-gray-400 pb-4">
      Consulte também nossa{' '}
      <Link to="/privacy" className="text-primary-600 dark:text-primary-400 hover:underline">
        Política de Privacidade
      </Link>
      .
    </p>
  </div>
);

export default TermsPage;
