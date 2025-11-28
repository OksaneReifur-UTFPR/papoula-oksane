// ===================================================
// ARQUIVO: pagamento.js (Revisado para Geração de Boleto)
// ===================================================

// --- Funções Auxiliares de UX (Máscaras de Input) ---

function applyExpiryMask(input) {
    let value = input.value.replace(/\D/g, '').substring(0, 4); 
    if (value.length > 2) {
        value = value.substring(0, 2) + '/' + value.substring(2);
    }
    input.value = value;
}

function applyCvvMask(input) {
    input.value = input.value.replace(/\D/g, '').substring(0, 4); 
}

// --- Lógica Visual (Corações Flutuantes) ---

function createFloatingHearts() {
    const container = document.querySelector('.floating-hearts');
    if (!container) return;

    const heartEmojis = ['💖', '💕', '💗', '💓', '💞'];
    const heartsToCreate = 40;

    for (let i = 0; i < heartsToCreate; i++) {
        const heart = document.createElement('div');
        heart.classList.add('heart');
        heart.innerText = heartEmojis[Math.floor(Math.random() * heartEmojis.length)];
        heart.style.top = `${Math.random() * 100}vh`;
        heart.style.left = `${Math.random() * 100}vw`;
        heart.style.fontSize = `${Math.random() * 1.0 + 0.6}rem`;
        heart.style.opacity = Math.random() * 0.3 + 0.1; 
        const animationDuration = Math.random() * 8 + 8;
        const animationDelay = Math.random() * 8;
        heart.style.animation = `float ${animationDuration}s ease-in-out ${animationDelay}s infinite`;
        container.appendChild(heart);
    }
}

// --- Lógica Principal de Pagamento (Troca de Abas) ---

function switchPaymentMethod(targetId) {
    const paymentOptions = document.querySelectorAll('.payment-option');
    const paymentDetails = document.querySelectorAll('.payment-details');

    paymentDetails.forEach(detail => detail.classList.remove('active'));
    paymentOptions.forEach(option => option.classList.remove('active'));

    const targetDetail = document.getElementById(`content-${targetId}`);
    if (targetDetail) {
        targetDetail.classList.add('active');
    }

    const targetButton = document.querySelector(`[data-target='${targetId}']`);
    if (targetButton) {
        targetButton.classList.add('active');
    }
}

/**
 * Função REAL que será chamada ao clicar em Finalizar Pagamento com Boleto
 * para gerar o boleto no servidor.
 */
async function generateBoletoAndOpenPDF() {
    alert('Tentando gerar o boleto no servidor...');
    
    // =========================================================================
    //  !!! PONTO DE INTEGRAÇÃO CRÍTICO: CHAME SUA API AQUI !!!
    // =========================================================================
    /* Em um sistema real, você faria uma chamada FETCH para o seu servidor. 
    O servidor (backend) faria:
    1. Coleta de dados do pedido (valor, cliente).
    2. Envio da requisição para o gateway de pagamento (ex: PagSeguro, Gerencianet).
    3. Recebimento da URL do PDF do boleto gerado.
    */
   
    const API_URL_BOLETO = '/api/generate-boleto'; // Exemplo de endpoint

    try {
        // SIMULAÇÃO DE CHAMADA DE API (MANTIDA para o funcionamento do front-end)
        // Substitua este bloco pelo seu 'fetch()' real:
        // const response = await fetch(API_URL_BOLETO, { method: 'POST', /* body com dados do pedido */ });
        // const data = await response.json();
        // const boletoPdfUrl = data.pdf_url; // URL REAL do boleto

        // URL de simulação (URL REAL seria gerada pelo servidor):
        const boletoPdfUrl = 'https://www.w3.org/WAI/ER/tests/xhtml/testfiles/resources/pdf/dummy.pdf'; 
        
        // Abre o PDF real na nova aba
        window.open(boletoPdfUrl, '_blank');
        
    } catch (error) {
        console.error('Erro ao gerar boleto:', error);
        alert('Erro ao gerar boleto. Tente novamente mais tarde.');
    }
}


// --- Inicialização da Aplicação ---

document.addEventListener('DOMContentLoaded', () => {
    
    createFloatingHearts();
    
    // --- Referências de Elementos ---
    const paymentOptions = document.querySelectorAll('.payment-option');
    const finalizeButton = document.getElementById('btn-finalizar-pagamento');
    const cardExpiryInput = document.getElementById('card-expiry');
    const cardCvvInput = document.getElementById('card-cvv');
    const printBoletoButton = document.getElementById('btn-imprimir-boleto');

    // --- 1. Aplica Máscaras de Input ---
    cardExpiryInput.addEventListener('input', (e) => applyExpiryMask(e.target));
    cardCvvInput.addEventListener('input', (e) => applyCvvMask(e.target));

    // --- 2. Evento de Troca de Abas ---
    paymentOptions.forEach(option => {
        option.addEventListener('click', () => {
            const target = option.getAttribute('data-target');
            switchPaymentMethod(target);
        });
    });
    
    // --- 3. Funcionalidade de Imprimir Boleto (Atualizada) ---
    if (printBoletoButton) {
        // Ao clicar em 'Visualizar e Imprimir', o sistema agora simula a chamada
        // da função que gera o boleto dinamicamente (generateBoletoAndOpenPDF)
        printBoletoButton.addEventListener('click', generateBoletoAndOpenPDF);
    }

    // --- 4. Lógica do botão "Finalizar Pagamento" ---
    finalizeButton.addEventListener('click', () => {
        const activeMethodElement = document.querySelector('.payment-option.active');
        if (!activeMethodElement) {
             alert('Por favor, selecione uma forma de pagamento.');
             return;
        }
        
        const activeMethod = activeMethodElement.getAttribute('data-target');

        console.log(`Método de pagamento selecionado: ${activeMethod}`);
        
        if (activeMethod === 'cartao') {
            const cardData = {
                number: document.getElementById('card-number').value,
                name: document.getElementById('card-name').value,
                expiry: document.getElementById('card-expiry').value,
                cvv: document.getElementById('card-cvv').value,
            };
            
            if (cardData.number.length < 16) {
                alert('O número do cartão parece incompleto.');
                return;
            }
            console.log("Dados do Cartão:", cardData);
            alert(`Pagamento com Cartão simulado com sucesso!`);


        } else if (activeMethod === 'pix') {
            console.log("Aguardando confirmação do pagamento Pix via webhook...");
            alert(`Instruções Pix enviadas! Aguardando pagamento...`);
            
        } else if (activeMethod === 'boleto') {
            console.log("Gerando boleto (via servidor)...");
            alert(`Boleto gerado! Clique em 'Visualizar e Imprimir' para abrir.`);
            
        }
    });

    switchPaymentMethod('cartao');
});
