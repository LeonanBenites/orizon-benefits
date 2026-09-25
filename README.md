# Orizon Benefits — site revisado

Nova versão do site enviado, mantendo a marca, as imagens e as frentes de atuação da Orizon. HTML, CSS e JavaScript sem dependências de instalação ou etapa de compilação.

## O que mudou

- Nova composição visual com tipografia editorial, paleta clara, dourado e verde escuro, hierarquia mais evidente e adaptação para celular.
- Oferta apresentada em quatro frentes: benefícios, operação, inteligência e saúde. Os sete programas de saúde e as cinco soluções complementares foram preservados.
- Textos mais objetivos, chamadas para conversa e uma seção de perguntas frequentes. Sem depoimentos, estatísticas comerciais ou garantias inventadas.
- Abas com navegação por teclado, seções expansíveis, menu móvel com Escape e retorno de foco, link para pular ao conteúdo e respeito à preferência por movimento reduzido.
- Formulário com apenas três campos obrigatórios, detalhes opcionais, validação, mensagens de erro e preservação dos dados quando o envio falha. Links de soluções preenchem o interesse correspondente.
- Endpoint de contato com validação no servidor, proteção de conteúdo HTML, campo antispam, limite de tempo e inclusão da mensagem do visitante no e-mail.
- Arquivos duplicados e estilos acumulados removidos da nova entrega. O ZIP original não foi alterado.

## Visualizar localmente

Com Node.js 22 ou superior, dentro desta pasta:

```sh
node serve.mjs
```

Abra http://127.0.0.1:4173. Para usar outra porta, configure a variável `PORT`. Também é possível abrir `index.html` para consultar o visual, mas a prévia via servidor é recomendada.

A prévia local não envia e-mails. O formulário exibe sua mensagem de indisponibilidade e oferece o contato direto. Nenhum teste dispara mensagens reais.

## Publicação e envio por e-mail

O projeto mantém a estrutura da integração existente: Vercel Function em `api/contato.js`, com a API da Resend. Na Vercel, use esta pasta como raiz, framework “Other”, sem comando de build e sem instalação de dependências.

Configure no ambiente de produção as variáveis listadas em `env.example`:

- `RESEND_API_KEY`: chave válida da Resend.
- `EMAIL_TO`: endereço que receberá as solicitações.
- `EMAIL_FROM`: remetente autorizado e verificado na Resend.

Não coloque credenciais em arquivos públicos. O remetente deve estar autorizado no serviço de e-mail. O campo Reply-To usa o endereço do visitante. O endpoint só confirma sucesso após a resposta de aceite do provedor; isso não garante entrega na caixa de entrada.

Se a página for hospedada em outro serviço, será necessário hospedar também o endpoint ou configurar `window.ORIZON_FORM_ENDPOINT` antes de carregar `script.js`. Uma hospedagem apenas estática não executa a função de e-mail.

Nenhuma publicação foi feita nesta entrega e as credenciais de produção não foram acessadas. Antes de substituir o site em produção, configure o envio e faça um teste de recebimento com um endereço da equipe.

## Validação realizada

```sh
node --test tests/contato.test.js
```

Nove testes de servidor cobrem campos, mensagem, escape de HTML, e-mail inválido, tipos e limites, antispam, configuração ausente e falhas do provedor. A chamada à Resend é simulada nos testes.

Revisão no navegador em 320, 390, 768, 1024 e 1440 pixels, sem rolagem horizontal. Verificados: abas de operação, inteligência e saúde, navegação por teclado, cartões expansíveis, FAQ, menu móvel, obrigatoriedade dos campos, seleção exclusiva de “Nenhum atualmente” e preservação dos dados em falha de envio. Links internos, arquivos e imagens também foram conferidos. Na revisão do dashboard, os cinco painéis foram comparados ao arquivo original e conferidos novamente nas cinco larguras: todos os valores, pontos da curva e linhas de referência foram preservados.

## Observações de conteúdo

Os dados institucionais e o e-mail comercial foram mantidos conforme o material fornecido. O dashboard preserva os dados reais do material original, confirmados pelo responsável pelo site, nos cinco painéis: Sinistralidade, Visão geral, Utilização, Financeiro e Representatividade. Foram mantidos os valores, as referências e o histórico de junho de 2025 a maio de 2026. As chamadas de contato usam “Fale com a Orizon”. O documento “Prompt - Landing Pages” foi tratado como referência de redação, sem substituir o pedido de melhorar o site.

As fontes DM Sans e DM Serif Display são carregadas do Google Fonts, com fontes de sistema como alternativa quando não há conexão.

