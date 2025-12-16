// login-app.js — Responsivo para todos os dispositivos
// Adiciona detecção de tela e comportamentos adaptativos

import { login as authLogin, registrar as authRegistrar, mostrarMensagem } from './auth.js';

// **CONFIGURAÇÕES RESPONSIVAS**
const ScreenConfig = {
    MOBILE: { maxWidth: 768, name: 'mobile' },
    TABLET: { maxWidth: 1024, name: 'tablet' },
    DESKTOP: { maxWidth: 1920, name: 'desktop' },
    PROJECTOR: { maxWidth: Infinity, name: 'projector' }
};

// **UTILITIES RESPONSIVAS**
function getCurrentScreenType() {
    const width = window.innerWidth;
    if (width <= ScreenConfig.MOBILE.maxWidth) return ScreenConfig.MOBILE.name;
    if (width <= ScreenConfig.TABLET.maxWidth) return ScreenConfig.TABLET.name;
    if (width <= ScreenConfig.DESKTOP.maxWidth) return ScreenConfig.DESKTOP.name;
    return ScreenConfig.PROJECTOR.name;
}

function adjustUIForScreen() {
    const screenType = getCurrentScreenType();
    const body = document.body;
    
    // Remove classes anteriores
    body.classList.remove('mobile-view', 'tablet-view', 'desktop-view', 'projector-view');
    
    // Adiciona classe atual
    body.classList.add(`${screenType}-view`);
    
    // Ajusta número de emojis flutuantes baseado na tela
    adjustFloatingEmojis(screenType);
    
    // Ajusta animações baseado no tipo de tela
    adjustAnimations(screenType);
    
    console.log(`🌐 Modo de tela: ${screenType} (${window.innerWidth}px x ${window.innerHeight}px)`);
}

function adjustFloatingEmojis(screenType) {
    const emojiContainer = document.querySelector('.emoji-background');
    if (!emojiContainer) return;
    
    // Remove todos os emojis existentes
    emojiContainer.innerHTML = '';
    
    // Define quantidade baseado no tamanho da tela
    let emojiCount;
    switch(screenType) {
        case 'mobile':
            emojiCount = 8;
            break;
        case 'tablet':
            emojiCount = 12;
            break;
        case 'desktop':
            emojiCount = 15;
            break;
        case 'projector':
            emojiCount = 20;
            break;
        default:
            emojiCount = 10;
    }
    
    // Emojis disponíveis
    const emojis = ['🌸', '💐', '🌺', '🌹', '💮', '🌷', '🥀', '💖', '🌼', '🌻', '💐', '🌺', '🌸', '🌹', '🌷'];
    
    // Cria novos emojis
    for (let i = 0; i < emojiCount; i++) {
        const emoji = document.createElement('div');
        emoji.className = 'floating-emoji';
        emoji.textContent = emojis[i % emojis.length];
        
        // Posições aleatórias baseadas no tamanho da tela
        const top = Math.random() * 100;
        const left = Math.random() * 100;
        const size = 1.5 + Math.random() * 2; // Tamanhos variados
        
        emoji.style.cssText = `
            top: ${top}%;
            left: ${left}%;
            font-size: ${size}rem;
            animation-delay: ${i * 0.5}s;
            opacity: ${0.15 + Math.random() * 0.25};
        `;
        
        emojiContainer.appendChild(emoji);
    }
}

function adjustAnimations(screenType) {
    const prefersReducedMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
    
    if (prefersReducedMotion) {
        // Usuário prefere menos animações
        document.body.classList.add('reduced-motion');
    } else {
        document.body.classList.remove('reduced-motion');
        
        // Ajusta velocidade baseado no tamanho da tela
        let animationSpeed = '15s';
        if (screenType === 'mobile') animationSpeed = '20s';
        if (screenType === 'projector') animationSpeed = '25s';
        
        // Atualiza CSS custom property
        document.documentElement.style.setProperty('--float-speed', animationSpeed);
    }
}

// **UTILS DE NEXT PATH**
function setNextPath(path) { 
    localStorage.setItem('nextPathAfterAuth', path); 
}

function getNextPath() { 
    return localStorage.getItem('nextPathAfterAuth'); 
}

function clearNextPath() { 
    localStorage.removeItem('nextPathAfterAuth'); 
}

// **INICIALIZAÇÃO RESPONSIVA**
document.addEventListener('DOMContentLoaded', () => {
    console.log('🌷 Lindos Detalles - Sistema Responsivo Iniciado');
    
    // Configura detecção de tela
    setupResponsiveDesign();
    
    // Inicializa tabs
    setupTabs();
    
    // Configura formulários
    setupForms();
    
    // Verifica orientação
    setupOrientationDetection();
    
    // Inicializa ajustes para a tela atual
    adjustUIForScreen();
});

function setupResponsiveDesign() {
    // Ajusta UI quando a janela é redimensionada
    window.addEventListener('resize', debounce(() => {
        adjustUIForScreen();
        updateViewportMeta();
    }, 250));
    
    // Detecta mudanças de preferências do usuário
    window.matchMedia('(prefers-color-scheme: dark)').addListener(adjustUIForScreen);
    window.matchMedia('(prefers-reduced-motion: reduce)').addListener(adjustUIForScreen);
    
    // Atualiza meta viewport para diferentes dispositivos
    updateViewportMeta();
}

function updateViewportMeta() {
    const screenType = getCurrentScreenType();
    const viewport = document.querySelector('meta[name="viewport"]');
    
    if (screenType === 'mobile' || screenType === 'tablet') {
        viewport.setAttribute('content', 'width=device-width, initial-scale=1.0, maximum-scale=5.0, user-scalable=yes');
    } else {
        viewport.setAttribute('content', 'width=device-width, initial-scale=1.0, maximum-scale=3.0, user-scalable=yes');
    }
}

function setupOrientationDetection() {
    const handleOrientation = () => {
        const isPortrait = window.innerHeight > window.innerWidth;
        document.body.classList.toggle('portrait', isPortrait);
        document.body.classList.toggle('landscape', !isPortrait);
        
        if (isPortrait) {
            console.log('📱 Modo Retrato Ativo');
        } else {
            console.log('🖥️ Modo Paisagem Ativo');
        }
    };
    
    window.addEventListener('resize', debounce(handleOrientation, 200));
    window.addEventListener('orientationchange', handleOrientation);
    handleOrientation(); // Executa inicialmente
}

function setupTabs() {
    const btnLoginTab = document.getElementById('tab-login');
    const btnCadastroTab = document.getElementById('tab-register');
    const formLogin = document.getElementById('login-form');
    const formCadastro = document.getElementById('register-form');
    const messageDiv = document.getElementById('login-message');
    const switchToLogin = document.getElementById('switch-to-login');

    // Função para alternar com animação suave
    const switchTab = (tab) => {
        const isLoginTab = tab === 'login';
        
        // Atualiza estado visual
        btnLoginTab.classList.toggle('active', isLoginTab);
        btnLoginTab.classList.toggle('inactive', !isLoginTab);
        btnLoginTab.setAttribute('aria-selected', isLoginTab.toString());
        
        btnCadastroTab.classList.toggle('active', !isLoginTab);
        btnCadastroTab.classList.toggle('inactive', isLoginTab);
        btnCadastroTab.setAttribute('aria-selected', (!isLoginTab).toString());
        
        // Animação de transição
        if (isLoginTab) {
            formCadastro.style.opacity = '0';
            formCadastro.style.transform = 'translateX(20px)';
            setTimeout(() => {
                formCadastro.classList.add('hidden');
                formLogin.classList.remove('hidden');
                setTimeout(() => {
                    formLogin.style.opacity = '1';
                    formLogin.style.transform = 'translateX(0)';
                }, 50);
            }, 300);
        } else {
            formLogin.style.opacity = '0';
            formLogin.style.transform = 'translateX(-20px)';
            setTimeout(() => {
                formLogin.classList.add('hidden');
                formCadastro.classList.remove('hidden');
                setTimeout(() => {
                    formCadastro.style.opacity = '1';
                    formCadastro.style.transform = 'translateX(0)';
                }, 50);
            }, 300);
        }
        
        // Limpa mensagens
        mostrarMensagem(messageDiv, '', 'limpar');
    };
// Alternar para login
btnLoginTab.addEventListener('click', () => switchTab('login'));
// Alternar para cadastro
btnCadastroTab.addEventListener('click', () => switchTab('register'));  
    if (switchToLogin) {
        switchToLogin.addEventListener('click', (e) => {
            e.preventDefault();
            switchTab('login');
        });
    }
}

function setupForms() {
    const formLogin = document.getElementById('login-form');
    const formCadastro = document.getElementById('register-form');
    
    // Previne envio duplo
    formLogin.addEventListener('submit', (e) => {
        e.preventDefault();
        handleLoginSubmit(e);
    });
    
    formCadastro.addEventListener('submit', (e) => {
        e.preventDefault();
        handleCadastroSubmit(e);
    });
    
    // Validação em tempo real responsiva
    setupRealTimeValidation();
}

function setupRealTimeValidation() {
    // Aplica validação baseada no tipo de tela
    const inputs = document.querySelectorAll('.form-input');
    
    inputs.forEach(input => {
        input.addEventListener('input', function() {
            const screenType = getCurrentScreenType();
            const isValid = this.checkValidity();
            
            // Feedback visual adaptativo
            if (isValid) {
                this.classList.add('valid');
                this.classList.remove('invalid');
                
                // Feedback suave para mobile
                if (screenType === 'mobile') {
                    this.style.borderColor = '#A8D5BA';
                }
            } else {
                this.classList.add('invalid');
                this.classList.remove('valid');
            }
        });
        
        // Feedback no blur (melhor UX para touch)
        input.addEventListener('blur', function() {
            if (!this.value) return;
            
            const isValid = this.checkValidity();
            if (!isValid) {
                // Mostra dica baseada no tipo de tela
                const screenType = getCurrentScreenType();
                let message = 'Por favor, verifique este campo';
                
                if (screenType === 'mobile') {
                    // Mensagens mais curtas para mobile
                    message = 'Campo inválido';
                }
                
                mostrarMensagem(document.getElementById('login-message'), message, 'erro', 3000);
            }
        });
    });
}

// **HANDLE LOGIN SUBMIT (Adaptado)**
async function handleLoginSubmit(e) {
    const email = (document.getElementById('login-email').value || '').trim();
    const senha = (document.getElementById('login-password').value || '').toString();
    const btn = document.querySelector('#login-form .btn-primary');
    const messageDiv = document.getElementById('login-message');

    if (!email || !senha) {
        mostrarMensagem(messageDiv, 'Preencha e-mail e senha', 'erro');
        return;
    }

    const originalText = btn.textContent;
    btn.textContent = 'Entrando... 🌸';
    btn.disabled = true;
    btn.classList.add('loading');

    try {
        const data = await authLogin(email, senha);
        if (data && data.auth) {
            mostrarMensagem(messageDiv, 'Login realizado com sucesso!', 'sucesso');
            checkAndRedirect(data.user);
        } else {
            mostrarMensagem(messageDiv, data.message || data.error || 'Email ou senha incorretos', 'erro');
        }
    } catch (err) {
        console.error('Erro no login:', err);
        mostrarMensagem(messageDiv, 'Erro na conexão com o servidor', 'erro');
    } finally {
        btn.textContent = originalText;
        btn.disabled = false;
        btn.classList.remove('loading');
    }
}

// **HANDLE CADASTRO SUBMIT (Adaptado)**
async function handleCadastroSubmit(e) {
    const nome = (document.getElementById('reg-nome').value || '').trim();
    const email = (document.getElementById('reg-email').value || '').trim();
    const senha = (document.getElementById('reg-password').value || '').toString();
    const btn = document.querySelector('#register-form .btn-primary');
    const messageDiv = document.getElementById('login-message');

    // Validação responsiva
    const screenType = getCurrentScreenType();
    if (!nome || !email || !senha) {
        const msg = screenType === 'mobile' 
            ? 'Preencha todos os campos' 
            : 'Preencha todos os campos obrigatórios do cadastro';
        mostrarMensagem(messageDiv, msg, 'erro');
        return;
    }

    if (senha.length < 6 || senha.length > 20) {
        mostrarMensagem(messageDiv, 'Senha deve ter entre 6 e 20 caracteres', 'erro');
        return;
    }

    const originalText = btn.textContent;
    btn.textContent = 'Cadastrando... 🌺';
    btn.disabled = true;
    btn.classList.add('loading');

    try {
        const payload = { 
            nome_pessoa: nome, 
            email_pessoa: email, 
            senha_pessoa: senha 
        };
        
        const data = await authRegistrar(payload);
        
        if (data && data.role === 'Cliente') {
            mostrarMensagem(messageDiv, 'Cadastro realizado com sucesso!', 'sucesso');
            checkAndRedirect(data);
        } else {
            mostrarMensagem(messageDiv, data.error || data.message || 'Erro no cadastro. Tente novamente.', 'erro');
        }
    } catch (err) {
        console.error('Erro no cadastro:', err);
        mostrarMensagem(messageDiv, 'Erro na conexão com o servidor', 'erro');
    } finally {
        btn.textContent = originalText;
        btn.disabled = false;
        btn.classList.remove('loading');
    }
}

// **FUNÇÕES DE REDIRECIONAMENTO (Otimizadas)**
function checkAndRedirect(usuario) {
    const role = (usuario.role || '').toLowerCase();
    const screenType = getCurrentScreenType();
    
    // Atraso baseado no tipo de tela (melhor UX)
    const delay = screenType === 'mobile' ? 800 : 600;
    
    setTimeout(() => {
        if (role === 'gerente') {
            showGerenteModal();
        } else if (role === 'cliente' || role === 'funcionário') {
            showRecado(usuario);
        } else {
            const next = getNextPath();
            clearNextPath();
            if (next) window.location.href = next;
            else window.location.href = '../menu.html';
        }
    }, delay);
}

function showRecado(usuario) {
    const screenType = getCurrentScreenType();
    const overlay = document.createElement('div');
    overlay.className = 'recado-overlay';
    
    // Ajusta tamanho baseado na tela
    const boxSize = screenType === 'mobile' ? '90vw' : 
                   screenType === 'tablet' ? '70vw' : '400px';

    const box = document.createElement('div');
    box.className = 'recado-box';
    box.style.maxWidth = boxSize;
    
    const nomeUsuario = usuario.nome_pessoa || usuario.user?.nome_pessoa || 'amigo(a)';
    const firstName = nomeUsuario.split(' ')[0];
    
    box.innerHTML = `
        <div class="recado-icon">💗</div>
        <h2>Olá, ${firstName}!</h2>
        <p>Seu login foi realizado com sucesso. O que deseja fazer agora?</p>
        <div class="recado-botoes">
            <button id="btn-continuar-comprando" class="btn-recado">Continuar comprando</button>
            <button id="btn-finalizar-compra" class="btn-recado">Finalizar pedido</button>
        </div>
    `;

    document.body.appendChild(overlay);
    document.body.appendChild(box);

    // Animação de entrada
    setTimeout(() => box.classList.add('visible'), 10);

    // Event listeners responsivos
    document.getElementById('btn-continuar-comprando').addEventListener('click', () => {
        closeRecado();
        const next = getNextPath();
        clearNextPath();
        if (next) window.location.href = next;
        else window.location.href = '../menu/menu.html';
    });

    document.getElementById('btn-finalizar-compra').addEventListener('click', () => {
        closeRecado();
        const next = getNextPath();
        clearNextPath();
        if (next) window.location.href = next;
        else window.location.href = '../pagamento/final.html';
    });

    // Fecha ao clicar fora (não em mobile)
    if (screenType !== 'mobile') {
        overlay.addEventListener('click', (e) => {
            if (e.target === overlay) closeRecado();
        });
    }
}

function closeRecado() {
    const overlay = document.querySelector('.recado-overlay');
    const box = document.querySelector('.recado-box');
    
    if (box) box.classList.remove('visible');
    
    setTimeout(() => {
        if (overlay) overlay.remove();
        if (box) box.remove();
    }, 300);
}

// **UTILITÁRIOS**
function debounce(func, wait) {
    let timeout;
    return function executedFunction(...args) {
        const later = () => {
            clearTimeout(timeout);
            func(...args);
        };
        clearTimeout(timeout);
        timeout = setTimeout(later, wait);
    };
}

// **FUNÇÃO DE EXPORTAÇÃO**
export function ensureLoggedAndProceed(nextPath) {
    const userId = sessionStorage.getItem('userId') || localStorage.getItem('usuario');
    if (userId) {
        window.location.href = nextPath;
    } else {
        setNextPath(nextPath);
        window.location.href = '../login-ok/login.html' || window.location.href;
    }
}

// **EXPORTAÇÃO PARA WINDOW**
window.ensureLoggedAndProceed = ensureLoggedAndProceed;

// **INICIALIZAÇÃO GLOBAL**
console.log('🌸 Sistema Lindos Detalles carregado com sucesso!');