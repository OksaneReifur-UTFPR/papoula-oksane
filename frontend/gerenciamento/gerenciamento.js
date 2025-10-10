document.addEventListener('DOMContentLoaded', () => {
    const emojiContainer = document.querySelector('.emoji-container');
    const emojis = ['🌸', '💕', '🌸', '💓', '💞']; // Lista de corações a serem usados
    const totalEmojis = 40; // Quantidade de corações na tela

    // Cria a quantidade definida de corações
    for (let i = 0; i < totalEmojis; i++) {
        createHeart();
    }

    function createHeart() {
        const heart = document.createElement('div');
        heart.classList.add('emoji');
        
        // Escolhe um coração aleatório da lista
        heart.innerText = emojis[Math.floor(Math.random() * emojis.length)];
        
        // Define uma posição aleatória em qualquer lugar da tela
        heart.style.top = `${Math.random() * 100}vh`;
        heart.style.left = `${Math.random() * 100}vw`;
        
        // Define um tamanho aleatório para mais variedade
        heart.style.fontSize = `${Math.random() * 1.5 + 0.8}rem`;
        
        // Define uma duração e um atraso de animação aleatórios
        const animationDuration = Math.random() * 5 + 5; // Duração entre 5s e 10s
        const animationDelay = Math.random() * 5; // Atraso de até 5s
        
        // Aplica a animação definida no CSS com os valores aleatórios
        heart.style.animation = `pulsingFloat ${animationDuration}s ease-in-out ${animationDelay}s infinite`;
        
        // Adiciona o coração criado ao contêiner na página
        emojiContainer.appendChild(heart);
    }
});
