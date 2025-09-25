// Lista de produtos do seu projeto original
const produtos = [
  {
    nome: "Muda de Cosmos Chocolate",
    preco: "R$ 15,00",
    descricao: "(Cosmos atrosanguineus) Uma flor de aroma de chocolate, originária do México, com pétalas de cor marrom-avermelhada intensa.",
    imagem: "../images/cosmoschocolate.jpg"
  },
  {
    nome: "Muda de Girassol",
    preco: "R$ 12,00",
    descricao: "(Helianthus annuus) é uma planta ornamental e produtiva. Suas grandes flores amarelas seguem o movimento do sol e são muito utilizadas em jardins e para produção de sementes.",
    imagem: "../images/girassol.jpg"
  },
  {
    nome: "Muda de Rosa Rubra",
    preco: "R$ 13,00",
    descricao: "(Rosa spp.) é uma planta ornamental clássica e muito apreciada. Suas flores vermelhas vibrantes simbolizam amor e beleza, sendo usadas em jardins e arranjos.",
    imagem: "../images/rosa-rubra.jpg"
  },
  {
    nome: "Muda de Aconito",
    preco: "R$ 14,00",
    descricao: "(Aconitum napellus) é uma planta ornamental de clima frio. Produz flores em forma de elmo, geralmente azul-violeta, mas é altamente tóxica.",
    imagem: "../images/aconito.jpg"
  },
  {
    nome: "Muda de Afelandra Coral",
    preco: "R$ 15,00",
    descricao: "(Aphelandra sinclairiana) é um arbusto tropical ornamental. Suas flores em tons de coral a alaranjado se destacam entre as folhas verdes brilhantes.",
    imagem: "../images/afelandra-coral.jpg"
  },
  {
    nome: "Muda de Anemona",
    preco: "R$ 16,00",
    descricao: "(Anemone coronaria) é uma flor ornamental muito apreciada. Apresenta pétalas coloridas e delicadas, geralmente em tons de vermelho, rosa, roxo ou white.",
    imagem: "../images/anemona.jpg"
  },
  {
    nome: "Muda de Begonia Negra",
    preco: "R$ 17,00",
    descricao: "(Begonia pavonina) é uma planta ornamental rara. Destaca-se por suas folhas escuras e brilhantes que refletem tons azulados sob a luz.",
    imagem: "../images/begonia-negra.jpg"
  },
  {
    nome: "Muda de Beldroega Grande",
    preco: "R$ 18,00",
    descricao: "(Portulaca oleracea) é uma planta suculenta de crescimento rasteiro. Possui folhas carnudas e flores pequenas, usada tanto como ornamental quanto na alimentação.",
    imagem: "../images/beldroega-grande.jpg"
  },
  {
    nome: "Muda de Chapeu Chines",
    preco: "R$ 19,00",
    descricao: "(Holmskioldia sanguinea) é um arbusto ornamental. Suas flores em forma de chapéu apresentam tons alaranjados a vermelhos bem marcantes.",
    imagem: "../images/chapeu-chines.jpg"
  },
  {
    nome: "Muda de Cipo de Sao Joao",
    preco: "R$ 20,00",
    descricao: "(Pyrostegia venusta) Um cipó com flores de um laranja intenso que florescem na estação seca, como se fossem chamas.",
    imagem: "../images/cipo-de-sao-joao.jpg"
  },
  {
    nome: "Muda de Crossandra",
    preco: "R$ 21,00",
    descricao: "(Crossandra infundibuliformis) é uma planta tropical ornamental. Suas flores em tons de laranja ou vermelho têm pétalas delicadas em formato de leque.",
    imagem: "../images/crossandra.jpg"
  },
  {
    nome: "Muda de Escovinha",
    preco: "R$ 22,00",
    descricao: "(Callistemon spp.) é um arbusto ornamental originário da Austrália. Destaca-se por suas flores em forma de escova, geralmente vermelhas, atraindo pássaros e beija-flores.",
    imagem: "../images/escovinha.jpg"
  },
  {
    nome: "Muda de Espirradeira",
    preco: "R$ 23,00",
    descricao: "(Nerium oleander) é um arbusto ornamental resistente. Apresenta flores vistosas em tons de rosa, white ou vermelho, mas todas as partes da planta são tóxicas.",
    imagem: "../images/espirradeira.jpg"
  },
  {
    nome: "Muda de Heliconia",
    preco: "R$ 24,00",
    descricao: "(Heliconia spp.) é uma planta tropical ornamental. Suas flores coloridas e exóticas, em tons de vermelho, laranja ou amarelo, atraem beija-flores.",
    imagem: "../images/heliconia.jpg"
  },
  {
    nome: "Muda de Jacaranda",
    preco: "R$ 25,00",
    descricao: "(Jacaranda mimosifolia) é uma árvore ornamental de clima tropical e subtropical. Produz flores roxas em cachos vistosos, muito apreciadas por sua beleza e sombra.",
    imagem: "../images/jacaranda.jpg"
  },
  {
    nome: "Muda de Flor de Sao Jose",
    preco: "R$ 26,00",
    descricao: "(Saxifraga stolonifera) é uma planta ornamental de folhas arredondadas e flores delicadas. Produz pequenas flores white com detalhes rosados, sendo muito usada em jardins e vasos suspensos.",
    imagem: "../images/flor-de-sao-jose.jpg"
  },
  {
    nome: "Muda de Orquidea Fantasma",
    preco: "R$ 27,00",
    descricao: "(Dendrophylax lindenii) Uma orquídea sem clorofila, dependente de fungos, que floresce em pântanos da América do Norte, mas sua raridade a torna pouco conhecida.",
    imagem: "../images/orquideafantasma.jpg"
  },
  {
    nome: "Muda de Vine Jade",
    preco: "R$ 28,00",
    descricao: "(Strongylodon macrobotrys) é uma trepadeira tropical ornamental. Suas flores em cachos pendentes exibem um tom raro de azul-turquesa brilhante.",
    imagem: "../images/vinejade.jpg"
  },
  {
    nome: "Muda de Flor de Carajás",
    preco: "R$ 29,00",
    descricao: "(Ipomoea cavalcantei) é uma trepadeira ornamental rara da Amazônia. Apresenta flores grandes em tons de vermelho vivo, sendo símbolo da região de Carajás.",
    imagem: "../images/flordecarajás.jpeg"
  },
  {
    nome: "Muda de Rosa Juliet",
    preco: "R$ 30,00",
    descricao: "(Rosa spp. – Juliet Rose) é uma das rosas mais famosas e valiosas do mundo. Destaca-se por suas pétalas em tom pêssego-rosado, com formato delicado e romântico.",
    imagem: "../images/rosajulieta.jpeg"
  }
];

// Função para exibir os produtos na tela
function exibeProdutos() {
  const container = document.getElementById('products-grid');
  container.innerHTML = "";

  produtos.forEach(produto => {
    const card = document.createElement("div");
    card.className = "product-card";
    card.innerHTML = `
      <div class="product-image">
        <img src="${produto.imagem}" alt="${produto.nome}" onerror="this.src='https://placehold.co/300x200/ffd6e0/ffffff?text=${encodeURIComponent(produto.nome)}'">
      </div>
      <div class="product-info">
        <h3 class="product-title">${produto.nome}</h3>
        <p class="product-description">${produto.descricao}</p>
        <p class="product-price">${produto.preco}</p>
        <button class="add-to-cart" onclick="adicionarAoCarrinho('${produto.nome.replace(/'/g, "\\'")}')">Adicionar ao Carrinho</button>
      </div>
    `;
    container.appendChild(card);
  });
}

// Função para adicionar produto ao carrinho
function adicionarAoCarrinho(nomeProduto) {
  alert(`"${nomeProduto}" adicionado ao carrinho!`);
  // Futuramente aqui você pode implementar localStorage ou integração com backend
}

// Função para criar corações flutuantes decorados
function createHearts() {
  // Limpa corações antigos se estiver recarregando
  document.querySelector('.floating-hearts').innerHTML = '';
  document.querySelector('.side-hearts').innerHTML = '';
  const floating = document.querySelector('.floating-hearts');
  const side = document.querySelector('.side-hearts');
  const heartEmojis = ['💗', '💕', '💞', '💖'];

  // Corações flutuantes centrais (quantidade, posições e delays como no cadastro)
  const floatHearts = [
    {top: '8%', left: '2%', delay: '0s'},
    {top: '15%', right: '3%', delay: '1s'},
    {top: '25%', left: '5%', delay: '2s'},
    {top: '35%', right: '7%', delay: '3s'},
    {top: '45%', left: '3%', delay: '4s'},
    {top: '55%', right: '4%', delay: '5s'},
    {top: '65%', left: '6%', delay: '1.5s'},
    {top: '75%', right: '2%', delay: '2.5s'},
    {top: '85%', left: '4%', delay: '3.5s'},
    {top: '20%', left: '8%', delay: '4.5s'},
    {top: '50%', right: '8%', delay: '0.5s'},
    {top: '70%', left: '2%', delay: '1.8s'},
  ];
  floatHearts.forEach((pos, i) => {
    const heart = document.createElement('span');
    heart.className = `heart heart-${i+1}`;
    heart.innerHTML = heartEmojis[i % heartEmojis.length];
    Object.assign(heart.style, pos);
    heart.style.animationDelay = pos.delay;
    floating.appendChild(heart);
  });

  // Corações laterais
  const leftPositions = [
    {top: '12%', left: '0.5%', delay: '0s'},
    {top: '30%', left: '1%', delay: '2s'},
    {top: '48%', left: '0.8%', delay: '4s'},
    {top: '66%', left: '1.2%', delay: '6s'},
    {top: '84%', left: '0.7%', delay: '1s'},
  ];
  const rightPositions = [
    {top: '18%', right: '0.5%', delay: '3s'},
    {top: '36%', right: '1%', delay: '5s'},
    {top: '54%', right: '0.8%', delay: '1s'},
    {top: '72%', right: '1.2%', delay: '3s'},
    {top: '90%', right: '0.7%', delay: '7s'},
  ];
  leftPositions.forEach((pos, i) => {
    const heart = document.createElement('span');
    heart.className = `side-heart left-${i+1}`;
    heart.innerHTML = heartEmojis[i % heartEmojis.length];
    Object.assign(heart.style, pos);
    heart.style.animationDelay = pos.delay;
    side.appendChild(heart);
  });
  rightPositions.forEach((pos, i) => {
    const heart = document.createElement('span');
    heart.className = `side-heart right-${i+1}`;
    heart.innerHTML = heartEmojis[(i+1) % heartEmojis.length];
    Object.assign(heart.style, pos);
    heart.style.animationDelay = pos.delay;
    side.appendChild(heart);
  });
}

// Inicializar a página quando carregar
window.addEventListener('DOMContentLoaded', function() {
  exibeProdutos();
  createHearts();
});