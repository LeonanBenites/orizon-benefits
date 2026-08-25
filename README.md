# Orizon Benefits — V1 / Reunião estratégica corrigida

Correção desta versão:
- a imagem da seção “Muito além da corretagem” agora fica corretamente na coluna esquerda, logo abaixo do eyebrow;
- headline e texto ficam na coluna direita;
- os quatro pilares permanecem abaixo ocupando toda a largura;
- a quebra responsiva foi corrigida para tablet e mobile;
- nenhuma outra seção foi redesenhada.


## Ajuste do Hero
O hero foi estabilizado no desktop:
- proporção fixa aproximada de 48% texto / 52% fotografia;
- foto ocupa sempre toda a altura e largura da área direita;
- `object-fit: cover` e posição do recorte travada;
- altura visual estável entre 680 e 800 px;
- breakpoint de empilhamento reduzido para 820 px, evitando mudanças de layout com zoom moderado.


## Hero com proporção fixa
Esta versão troca o comportamento responsivo anterior por uma composição proporcional:
- desktop sempre em duas colunas;
- proporção aproximada 46,5% texto / 53,5% foto;
- hero com aspect-ratio fixo;
- tipografia passa a responder prioritariamente à altura do hero;
- foto mantém o mesmo recorte;
- só muda para layout empilhado abaixo de 900 px.


## Margem esquerda do Hero
A margem do conteúdo textual em relação à borda esquerda foi estabilizada.
Em desktop amplo, o texto acompanha um eixo central de até 1500 px; em notebooks mantém 42 px.
Isso evita que o texto encoste na borda ou mude de posição de forma excessiva com o zoom.


## Hero — composição aprovada
A composição foi ajustada para reproduzir o print de referência:
- painel claro ocupa 48% da largura;
- fotografia ocupa 52%;
- bloco textual tem largura fixa e fica alinhado à direita do painel claro;
- grande área de respiro permanece à esquerda;
- foto permanece full-bleed;
- fade entre texto e fotografia preservado;
- desktop menor reduz escala sem puxar o conteúdo para a borda esquerda.
