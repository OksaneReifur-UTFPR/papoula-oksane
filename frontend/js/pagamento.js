// ===================================================
// NOVO: Lógica para criar os corações flutuantes
// ===================================================
function createFloatingHearts() {
    const container = document.querySelector('.floating-hearts');
    if (!container) return; // Não faz nada se o contêiner não existir

    const heartEmojis = ['💖', '💕', '💗', '💓', '💞'];
    const heartsToCreate = 30; // Quantidade de corações na tela

    for (let i = 0; i < heartsToCreate; i++) {
        const heart = document.createElement('div');
        heart.classList.add('heart');
        
        // Escolhe um emoji de coração aleatório
        heart.innerText = heartEmojis[Math.floor(Math.random() * heartEmojis.length)];
        
        // Posição aleatória na tela
        heart.style.top = `${Math.random() * 100}vh`;
        heart.style.left = `${Math.random() * 100}vw`;
        
        // Tamanho e opacidade aleatórios para mais naturalidade
        heart.style.fontSize = `${Math.random() * 1.2 + 0.8}rem`; // entre 0.8rem e 2.0rem
        heart.style.opacity = Math.random() * 0.5 + 0.2; // entre 0.2 e 0.7
        
        // Duração e atraso da animação aleatórios
        const animationDuration = Math.random() * 6 + 7; // entre 7s e 13s
        const animationDelay = Math.random() * 7;
        
        heart.style.animation = `float ${animationDuration}s ease-in-out ${animationDelay}s infinite`;
        
        container.appendChild(heart);
    }
}

document.addEventListener('DOMContentLoaded', () => {
     // Chama a função para criar os corações assim que a página carregar
    createFloatingHearts();
    const paymentOptions = document.querySelectorAll('.payment-option');
    const paymentDetails = document.querySelectorAll('.payment-details');
    const finalizeButton = document.getElementById('btn-finalizar-pagamento');

    // Função para trocar a aba de pagamento visível
    function switchPaymentMethod(targetId) {
        // Esconde todos os detalhes de pagamento
        paymentDetails.forEach(detail => {
            detail.classList.remove('active');
        });

        // Remove a classe 'active' de todos os botões de opção
        paymentOptions.forEach(option => {
            option.classList.remove('active');
        });

        // Mostra o detalhe de pagamento correto
        const targetDetail = document.getElementById(`content-${targetId}`);
        if (targetDetail) {
            targetDetail.classList.add('active');
        }

        // Adiciona a classe 'active' ao botão clicado
        const targetButton = document.querySelector(`[data-target='${targetId}']`);
        if (targetButton) {
            targetButton.classList.add('active');
        }
    }

    // Adiciona o evento de clique para cada botão de opção
    paymentOptions.forEach(option => {
        option.addEventListener('click', () => {
            const target = option.getAttribute('data-target');
            switchPaymentMethod(target);
        });
    });

    // Lógica do botão "Finalizar Pagamento"
    finalizeButton.addEventListener('click', () => {
        // Identifica qual método de pagamento está ativo
        const activeMethod = document.querySelector('.payment-option.active').getAttribute('data-target');

        console.log(`Método de pagamento selecionado: ${activeMethod}`);
        alert(`Simulando finalização do pagamento via ${activeMethod}. Verifique o console para os dados.`);

        // Aqui você faria a chamada para o seu backend (API)
        if (activeMethod === 'cartao') {
            const cardData = {
                number: document.getElementById('card-number').value,
                name: document.getElementById('card-name').value,
                expiry: document.getElementById('card-expiry').value,
                cvv: document.getElementById('card-cvv').value,
            };
            console.log("Dados do Cartão:", cardData);
            // Exemplo de chamada:
            // fetch('/api/pagamento/cartao', { method: 'POST', body: JSON.stringify(cardData) })
            //     .then(response => response.json())
            //     .then(data => console.log(data));
        } else if (activeMethod === 'pix') {
            console.log("Aguardando confirmação do pagamento Pix via webhook...");
            // A lógica do Pix geralmente envolve um webhook do provedor de pagamento
        } else if (activeMethod === 'boleto') {
            console.log("Gerando boleto...");
            // fetch('/api/pagamento/boleto', { method: 'POST' })
            //     .then(...)
        }
        
        // Após o sucesso, redirecionar para uma página de confirmação
        // window.location.href = 'pedido-confirmado.html';
    });

    // Inicia com a aba 'cartao' visível
    switchPaymentMethod('cartao');
});
