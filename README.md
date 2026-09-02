# Orizon Benefits — Homepage V5

Refinamento editorial e de UX da V4.

- notas internas removidas
- copy reduzida e nomenclaturas harmonizadas
- dashboard conceitual refinado
- mobile funcional mais compacto
- prefers-reduced-motion implementado
- formulário preparado para endpoint real via `window.ORIZON_FORM_ENDPOINT`; nenhum backend foi inventado


## Tesseract vetorial
O GIF foi removido. A seção agora usa um SVG animado em tempo real, com rotação matemática 4D→3D→2D, fundo transparente, sem ruído e sem perda de resolução.

## Formulário de contato — envio por e-mail

O formulário agora envia `POST /api/contato` e a Vercel Function encaminha o lead por e-mail usando a API da Resend.

### Variáveis de ambiente na Vercel

- `RESEND_API_KEY`: chave criada na Resend.
- `EMAIL_TO`: `comercial@orizonbenefits.com.br`.
- `EMAIL_FROM`: remetente autorizado no domínio, por exemplo `Orizon Benefits <site@orizonbenefits.com.br>`.

O domínio `orizonbenefits.com.br` precisa estar verificado na Resend para usar um remetente `@orizonbenefits.com.br`.
O `Reply-To` é preenchido automaticamente com o e-mail informado pelo lead.
