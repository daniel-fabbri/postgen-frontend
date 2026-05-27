import React from 'react';
import { Link } from 'react-router-dom';
import { useAuth } from '../AuthContext';
import PublicHeader from '../components/PublicHeader';
import PublicFooter from '../components/PublicFooter';

const Section = ({ title, children }) => (
  <div className="py-5 border-b border-gray-100 dark:border-gray-700 last:border-0">
    <h2 className="text-lg font-semibold mb-3 text-gray-900 dark:text-white">{title}</h2>
    <div className="space-y-2 text-sm text-gray-600 dark:text-gray-400 leading-relaxed">
      {children}
    </div>
  </div>
);

const PrivacyPage = () => {
  const { user } = useAuth();
  return (
  <>
    {!user && <PublicHeader />}
  <div className={`max-w-3xl mx-auto space-y-6 ${!user ? 'pt-24 px-4 pb-12' : ''}`}>
    <div>
      <h1 className="text-3xl font-bold">Política de Privacidade</h1>
      <p className="text-gray-500 dark:text-gray-400 mt-1 text-sm">Última atualização: 26 de maio de 2026</p>
    </div>

    <div className="bg-white dark:bg-gray-800 rounded-xl shadow-lg border border-gray-200 dark:border-gray-700 px-8 py-2">

      <Section title="1. Introdução">
        <p>
          Esta Política de Privacidade descreve como o <strong>PostGen</strong> coleta, armazena e utiliza as informações inseridas na plataforma. Ao utilizar o PostGen, você concorda com as práticas descritas neste documento.
        </p>
      </Section>

      <Section title="2. Dados Coletados">
        <p>O PostGen armazena apenas os dados necessários para seu funcionamento:</p>
        <ul className="list-disc list-inside space-y-1 mt-2 ml-2">
          <li><strong>Configurações de canais:</strong> nome, objetivo, prompts de geração de texto e imagem;</li>
          <li><strong>Avatares:</strong> imagens de perfil geradas ou enviadas para cada canal;</li>
          <li><strong>Posts gerados:</strong> textos e imagens criados pela IA, incluindo metadados (data de criação, status de publicação);</li>
          <li><strong>Credenciais de integração:</strong> chaves de API da Azure OpenAI e tokens de acesso do Instagram (armazenados localmente no servidor);</li>
          <li><strong>Configurações gerais:</strong> endpoint e parâmetros da Azure OpenAI, URL pública do servidor.</li>
        </ul>
      </Section>

      <Section title="3. Como os Dados são Armazenados">
        <p>
          Todos os dados são armazenados <strong>localmente no servidor</strong> onde a aplicação está hospedada, em arquivos JSON e arquivos de imagem. O PostGen não transmite seus dados para servidores externos próprios nem utiliza bancos de dados em nuvem.
        </p>
        <p className="mt-2">
          Você tem controle total sobre os dados armazenados — eles residem na sua infraestrutura.
        </p>
      </Section>

      <Section title="4. Uso dos Dados">
        <p>Os dados armazenados são utilizados exclusivamente para:</p>
        <ul className="list-disc list-inside space-y-1 mt-2 ml-2">
          <li>Exibir e gerenciar seus canais e posts na interface;</li>
          <li>Enviar prompts à Azure OpenAI para geração de conteúdo;</li>
          <li>Publicar posts no Instagram via Graph API, mediante sua ação explícita;</li>
          <li>Servir imagens geradas ao Instagram no momento da publicação.</li>
        </ul>
      </Section>

      <Section title="5. Compartilhamento com Terceiros">
        <p>O PostGen envia dados a terceiros apenas nas seguintes situações e sempre por ação sua:</p>

        <p className="mt-3 font-medium text-gray-700 dark:text-gray-300">Azure OpenAI (Microsoft)</p>
        <p>
          Ao gerar um post ou avatar, os prompts configurados no canal são enviados à Azure OpenAI para geração de texto e imagem. Os dados enviados incluem o prompt e o contexto do canal. Consulte a{' '}
          <a href="https://privacy.microsoft.com/pt-br/privacystatement" target="_blank" rel="noopener noreferrer" className="text-primary-600 dark:text-primary-400 hover:underline">
            Política de Privacidade da Microsoft
          </a>.
        </p>

        <p className="mt-3 font-medium text-gray-700 dark:text-gray-300">Meta / Instagram Graph API</p>
        <p>
          Ao publicar um post, o texto, a URL da imagem e o token de acesso são enviados à API do Instagram. Consulte a{' '}
          <a href="https://www.facebook.com/privacy/policy/" target="_blank" rel="noopener noreferrer" className="text-primary-600 dark:text-primary-400 hover:underline">
            Política de Privacidade da Meta
          </a>.
        </p>
      </Section>

      <Section title="6. Credenciais e Segurança">
        <p>
          Tokens de acesso do Instagram e chaves de API da Azure OpenAI são armazenados em arquivo local no servidor. Recomendamos:
        </p>
        <ul className="list-disc list-inside space-y-1 mt-2 ml-2">
          <li>Manter o servidor seguro e com acesso restrito;</li>
          <li>Usar tokens de acesso de longa duração com as permissões mínimas necessárias;</li>
          <li>Renovar tokens periodicamente e revogar imediatamente em caso de suspeita de comprometimento.</li>
        </ul>
      </Section>

      <Section title="7. Seus Direitos">
        <p>
          Como os dados ficam na sua própria infraestrutura, você tem controle total sobre eles. Você pode acessar, editar ou excluir qualquer informação diretamente pela interface do PostGen ou removendo os arquivos do servidor.
        </p>
      </Section>

      <Section title="8. Retenção de Dados">
        <p>
          Os dados são mantidos enquanto você os conservar no servidor. Não há exclusão automática. Posts, avatares e configurações de canais permanecem armazenados até que você os exclua manualmente.
        </p>
      </Section>

      <Section title="9. Cookies e Rastreamento">
        <p>
          O PostGen não utiliza cookies de rastreamento, analytics externos nem qualquer forma de monitoramento de comportamento do usuário.
        </p>
      </Section>

      <Section title="10. Alterações nesta Política">
        <p>
          Esta Política de Privacidade pode ser atualizada periodicamente. A data de última atualização estará sempre indicada no topo deste documento.
        </p>
      </Section>

      <Section title="11. Contato">
        <p>
          Em caso de dúvidas sobre esta Política de Privacidade, entre em contato através dos canais disponíveis na plataforma.
        </p>
      </Section>
    </div>

    <p className="text-center text-sm text-gray-500 dark:text-gray-400 pb-4">
      Consulte também nossos{' '}
      <Link to="/terms" className="text-primary-600 dark:text-primary-400 hover:underline">
        Termos de Uso
      </Link>
      .
    </p>
  </div>
  {!user && <PublicFooter />}
  </>
  );
};

export default PrivacyPage;
