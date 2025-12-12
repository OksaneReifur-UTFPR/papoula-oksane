// ===================================================================================
// ARQUIVO: produtos.js (COMPLETO E ATUALIZADO PARA CARROSSEL)
// Inclui a lógica de filtro de produtos e a lógica de carrossel.
// ===================================================================================

// ==================== DADOS: LISTA SIMULADA DE PRODUTOS ====================
// Inicializa como array vazio. Será preenchido pela função assíncrona.
const produtos = [];
// alert( "produtos " + JSON.stringify(produtos));

// ==================== CARREGAMENTO DOS DADOS (ASSÍNCRONO) ===================
async function carregarProdutos() {
    const url = 'http://localhost:3000/planta';
    const container = document.getElementById('products-carousel'); // Usado para exibir erro

    try {      
        // 1. Acionar a rota e buscar os dados
        const response = await fetch(url);

        if (!response.ok) {
            throw new Error(`Erro na requisição: ${response.status} ${response.statusText}`);
        }

        // 2. Converter a resposta para JSON
        const dadosDoBanco = await response.json();

        // 3. Ajustar/Mapear os dados e preencher a variável 'produtos'
        for (const planta of dadosDoBanco) {
            const precoFormatado = parseFloat(planta.preco_unitario).toLocaleString('pt-BR', { 
                style: 'currency', 
                currency: 'BRL' 
            });
            
            const produto = {             
                nome: planta.nome_popular,             
                nomeCientifico: planta.nome_cientifico,
                descricao: planta.descricao,
                id: planta.id_planta,
                estoque: planta.quantidade_estoque,              
                preco: precoFormatado,
                // Tratamento da imagem: usa a url ou o placeholder
                imagem: planta.url_imagem || 'https://placehold.co/300x200/ffd6e0/ffffff?text=Planta'
            };
        
            produtos.push(produto);
        }

        return produtos;

    } catch (error) {
        console.error("Houve um erro ao carregar os produtos:", error);
        // Exibe uma mensagem de erro no container
        if (container) {
            container.innerHTML = `<p class="error-message">Não foi possível carregar os produtos. Verifique o servidor.</p>`;
        }
    }
}

// ==================== LÓGICA DE GERENCIAMENTO ====================
function exibeBotaoGerenciamento() {
    const usuarioString = localStorage.getItem('usuario');
    if (usuarioString) {
      const usuario = JSON.parse(usuarioString);
      const btnGerenciamento = document.getElementById('btn-gerenciamento');
      if (usuario && usuario.tipo === 'gerente' && btnGerenciamento) {
        btnGerenciamento.style.display = 'block'; 
      }
    }
}

// ==================== LÓGICA DE EXIBIÇÃO DE PRODUTOS (CARROSSEL) ====================

// Variáveis para controle do carrossel
let currentIndex = 0;
let itemWidth = 0;

/**
* Filtra e exibe os produtos na tela, usando a estrutura de carrossel.
* @param {string} searchTerm O termo de pesquisa digitado pelo usuário.
*/
function exibeProdutos(searchTerm = '') {
    // O container agora é a faixa (track) que será movida no carrossel
    const carrosselContainer = document.getElementById('carousel-track');
    // O container principal, usado para mensagens de erro/filtro
    const mainContainer = document.getElementById('products-carousel');
    
    if (!carrosselContainer || !mainContainer) {
        console.error("Elementos do carrossel não encontrados. Verifique o HTML.");
        return;
    }
    
    carrosselContainer.innerHTML = "";
    
    const term = searchTerm.toLowerCase().trim();

    // Filtra os produtos
    const produtosFiltrados = produtos.filter(produto => {
        if (!term) return true;
        return produto.nome.toLowerCase().includes(term) || 
               produto.descricao.toLowerCase().includes(term);
    });

    if (produtosFiltrados.length === 0) {
        mainContainer.innerHTML = `
            <p style="text-align: center; font-size: 1.5rem; color: #ff6b9d; margin-top: 30px;">
                💔 Que pena! Nenhuma flor com o nome ou descrição de "${searchTerm}" foi encontrada. 
            </p>
        `;
        return;
    }
    
    // Se o filtro retornar resultados, remove qualquer mensagem de erro anterior
    // e garante que a estrutura do carrossel esteja visível.
    if (term) {
        // Se houver um termo de busca, exibe apenas os resultados da busca sem o carrossel (opcional)
        mainContainer.innerHTML = `<div id="carousel-track" class="carousel-track-grid"></div>`; // Volta para grade temporariamente
        const gridContainer = document.getElementById('carousel-track');
        produtosFiltrados.forEach(produto => renderProdutoCard(produto, gridContainer, "product-grid-item"));
        return;
    }
    
    // Se NÃO houver termo de busca, exibe como carrossel
    mainContainer.innerHTML = `
        <button id="carousel-prev" class="carousel-button prev">❮</button>
        <div class="carousel-viewport">
            <div id="carousel-track" class="carousel-track"></div>
        </div>
        <button id="carousel-next" class="carousel-button next">❯</button>
    `;
    const finalTrack = document.getElementById('carousel-track');
    produtosFiltrados.forEach(produto => renderProdutoCard(produto, finalTrack, "carousel-item"));
    
    // Inicializa a navegação
    setupCarouselNavigation();
}

/**
 * Cria e insere o card de produto no container especificado.
 * @param {object} produto O objeto produto.
 * @param {HTMLElement} container O container onde o card será adicionado.
 * @param {string} className A classe CSS do item (carousel-item ou product-grid-item).
 */
function renderProdutoCard(produto, container, className) {
    const item = document.createElement("div");
    item.className = className;

    // 1. Defina a URL base do seu servidor (backend)
    const API_BASE_URL = 'http://localhost:3000'; 
    
    // 2. Constrói a URL usando o ID do produto
    // IMPORTANTE: Verifique se o seu objeto 'produto' usa 'id' ou 'id_produto' ou 'cod_produto'.
    // Estou assumindo que é 'id'. Se for outro, altere abaixo.
    const imageUrl = `${API_BASE_URL}/imagens/view/${produto.id}`;

    item.innerHTML = `
        <div class="product-card">
            <div class="product-image">
                <img 
                    src="${imageUrl}" 
                    alt="${produto.nome}" 
                    onerror="this.src='https://placehold.co/300x200/ffd6e0/ffffff?text=${encodeURIComponent(produto.nome)}'"
                >
            </div>
            <div class="product-info">
                <h3 class="product-title">${produto.nome}</h3>
                <p class="product-description">${produto.descricao}</p>
                <p class="product-price">${produto.preco}</p>
                <button class="add-to-cart" onclick="adicionarAoCarrinho('${produto.nome.replace(/'/g, "\\'")}')">Adicionar ao Carrinho</button>
            </div>
        </div>
    `;
    container.appendChild(item);
}

// ==================== LÓGICA DE NAVEGAÇÃO DO CARROSSEL ====================

/**
 * Configura os listeners para os botões de navegação e calcula o tamanho dos itens.
 */
function setupCarouselNavigation() {
    const track = document.getElementById('carousel-track');
    const prevButton = document.getElementById('carousel-prev');
    const nextButton = document.getElementById('carousel-next');

    // Se a track não existir (ex: modo busca), não faz nada.
    if (!track) return;
    
    const items = track.querySelectorAll('.carousel-item');
    currentIndex = 0; // Reseta o índice ao configurar

    const updateCarousel = () => {
        if (items.length === 0) return;

        // Recalcula a largura do item em tempo de execução para responsividade
        const firstItem = items[0];
        // Pega a largura real do item (incluindo padding/border)
        itemWidth = firstItem.offsetWidth; 
        
        // Pega o valor do margin-right (gap) do item
        const style = window.getComputedStyle(firstItem);
        const marginRight = parseFloat(style.marginRight);
        
        // Largura total de deslocamento
        const totalShift = itemWidth + marginRight; 
        
        // Aplica a translação
        track.style.transform = `translateX(-${currentIndex * totalShift}px)`;

        // Lógica para esconder/mostrar botões
        prevButton.style.display = currentIndex > 0 ? 'block' : 'none';
        
        // Verifica se chegamos ao fim (ajustar conforme quantos itens cabem na viewport)
        // Lógica simplificada: se o índice é menor que o número total de itens - 1
        nextButton.style.display = currentIndex < items.length - 1 ? 'block' : 'none';
    };
    
    // Listener para o botão 'Próximo'
    if (nextButton) {
        nextButton.onclick = () => {
            if (currentIndex < items.length - 1) {
                currentIndex++;
                updateCarousel();
            }
        };
    }
    
    // Listener para o botão 'Anterior'
    if (prevButton) {
        prevButton.onclick = () => {
            if (currentIndex > 0) {
                currentIndex--;
                updateCarousel();
            }
        };
    }
    
    // Inicializa a posição e os botões
    updateCarousel(); 
    
    // Recalcula a largura e posição ao redimensionar a tela
    window.addEventListener('resize', updateCarousel);
}


// ==================== LÓGICA DE PESQUISA ====================

/**
* Adiciona o listener para o campo de pesquisa e chama o filtro a cada digitação.
*/
function setupSearchListener() {
    const searchInput = document.getElementById('search-input');
    
    if (searchInput) {
        searchInput.addEventListener('input', (event) => {
            exibeProdutos(event.target.value);
        });
    }
}


// ==================== LÓGICA DO CARRINHO ====================

function getCarrinho() {
    return JSON.parse(localStorage.getItem('carrinho')) || [];
}

function setCarrinho(carrinho) {
    localStorage.setItem('carrinho', JSON.stringify(carrinho));
}

function getPedidos() {
    return JSON.parse(localStorage.getItem('pedidos')) || [];
}

function setPedidos(pedidos) {
    localStorage.setItem('pedidos', JSON.stringify(pedidos));
}

function atualizarContadorCarrinho() {
    const carrinho = getCarrinho();
    const count = carrinho.length;
    const countSpan = document.getElementById('cart-count');
    if (countSpan) {
      if (count > 0) {
        countSpan.textContent = `(${count})`;
      } else {
        countSpan.textContent = '';
      }
    }
}

function adicionarAoCarrinho(nomeProduto) {
    const carrinho = getCarrinho();
    carrinho.push(nomeProduto);
    setCarrinho(carrinho);

    const pedidos = getPedidos();
    pedidos.push({
      nome: nomeProduto,
      data: new Date().toLocaleString('pt-BR')
    });
    setPedidos(pedidos);

    const msgDiv = document.getElementById('cart-message');
    if (msgDiv) {
        msgDiv.className = 'cart-message';
        msgDiv.innerHTML = `<span class="heart">💖</span> Seu pedido de <b>${nomeProduto}</b> foi adicionado com sucesso ao carrinho! <span class="heart">💕</span>`;
        msgDiv.style.display = 'flex';

        setTimeout(() => {
          msgDiv.style.display = 'none';
        }, 2200);
    }

    atualizarContadorCarrinho();
}


// ==================== CORAÇÕES FLUTUANTES ====================
function createHearts() {
    const floating = document.querySelector('.floating-hearts');
    const side = document.querySelector('.side-hearts');
    const heartEmojis = ['💗', '💕', '💞', '💖'];

    if(floating) floating.innerHTML = '';
    if(side) side.innerHTML = '';

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
    if(floating) {
        floatHearts.forEach((pos, i) => {
          const heart = document.createElement('span');
          heart.className = `heart heart-${i+1}`;
          heart.innerHTML = heartEmojis[i % heartEmojis.length];
          Object.assign(heart.style, pos);
          heart.style.animationDelay = pos.delay;
          floating.appendChild(heart);
        });
    }

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
    if(side) {
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
}


// ==================== INICIALIZAÇÃO ====================
window.addEventListener('DOMContentLoaded', async function() {
    // 1. Carrega os produtos do servidor e espera a conclusão
    await carregarProdutos(); 
    
    // 2. Exibe os produtos (no carrossel)
    exibeProdutos(); 
    
    // 3. Configura a barra de pesquisa
    setupSearchListener(); 
    
    // 4. Cria os corações
    createHearts(); 
    
    // 5. Atualiza o contador do carrinho
    atualizarContadorCarrinho(); 
    
    // 6. Exibe o botão de gerenciamento (se for gerente)
    exibeBotaoGerenciamento(); 
});