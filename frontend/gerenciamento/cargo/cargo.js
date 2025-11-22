document.addEventListener('DOMContentLoaded', () => {
    // --- CONFIGURAÇÃO INICIAL ---
    const API_BASE_URL = 'http://localhost:3000'; 
    let operacao = null; 

    // --- ELEMENTOS DO DOM ---
    const form = document.getElementById('cargoForm');
    const searchIdInput = document.getElementById('searchIdCargo');
    const nomeCargoInput = document.getElementById('nome_cargo');
    const cargoTableBody = document.getElementById('cargoTableBody');
    const messageContainer = document.getElementById('messageContainer');

    // Botões
    const btnBuscar = document.getElementById('btnBuscar');
    const btnCancelar = document.getElementById('btnCancelar');
    const btnIncluir = document.getElementById('btnIncluir');
    const btnAlterar = document.getElementById('btnAlterar');
    const btnExcluir = document.getElementById('btnExcluir');
    const btnSalvar = document.getElementById('btnSalvar');

    // --- FUNÇÕES DE CONTROLE DA UI (INTERFACE) ---

    /**
     * Gerencia a visibilidade dos botões de ação com base no estado da aplicação.
     */
    const gerenciarBotoes = ({ incluir = false, alterar = false, excluir = false, salvar = false }) => {
        if(btnIncluir) btnIncluir.style.display = incluir ? 'inline-flex' : 'none';
        if(btnAlterar) btnAlterar.style.display = alterar ? 'inline-flex' : 'none';
        if(btnExcluir) btnExcluir.style.display = excluir ? 'inline-flex' : 'none';
        if(btnSalvar) btnSalvar.style.display = salvar ? 'inline-flex' : 'none';
    };

    /**
     * Exibe uma mensagem de notificação temporária.
     */
    const mostrarMensagem = (texto, tempo = 3000) => {
        if (!messageContainer) return;
        messageContainer.textContent = texto;
        messageContainer.classList.add('show');
        setTimeout(() => messageContainer.classList.remove('show'), tempo);
    };

    /**
     * Configura o formulário e botões para o estado inicial (pronto para busca).
     */
    const configurarEstadoInicial = () => {
        if (form) form.reset();
        operacao = null;

        if (nomeCargoInput) nomeCargoInput.disabled = true;
        if (searchIdInput) searchIdInput.disabled = false;
        
        gerenciarBotoes({});
        if (searchIdInput) searchIdInput.focus();
    };

    // --- CARREGAR LISTA ---
    /**
     * Carrega a lista de cargos da API e popula a tabela.
     */
    const carregarCargos = async () => {
        try {
            const res = await fetch(`${API_BASE_URL}/cargo`);
            if (!res.ok) throw new Error('Falha ao carregar cargos.');
            const cargos = await res.json();

            if (cargoTableBody) cargoTableBody.innerHTML = '';
            
            cargos.forEach(cargo => {
                const row = document.createElement('tr');
                row.innerHTML = `
                    <td>${cargo.id_cargo}</td>
                    <td>${cargo.nome_cargo}</td>
                `;
                row.onclick = () => {
                    if (searchIdInput) searchIdInput.value = cargo.id_cargo;
                    buscarCargo();
                };
                if (cargoTableBody) cargoTableBody.appendChild(row);
            });
        } catch (err) {
            mostrarMensagem(err.message || 'Erro ao carregar lista de cargos.', 5000);
        }
    };

    // --- BUSCAR POR ID ---
    /**
     * Busca um cargo específico na API pelo ID digitado.
     */
    const buscarCargo = async () => {
        if (!searchIdInput) return;
        const id = String(searchIdInput.value).trim();
        if (!id) {
            mostrarMensagem('Por favor, digite um ID para buscar.');
            return;
        }

        try {
            const response = await fetch(`${API_BASE_URL}/cargo/${encodeURIComponent(id)}`);
            
            if (response.ok) {
                const cargo = await response.json();

                if (nomeCargoInput) nomeCargoInput.value = cargo.nome_cargo;
                
                gerenciarBotoes({ alterar: true, excluir: true });
                mostrarMensagem(`Cargo "${cargo.nome_cargo}" encontrado!`);
            } else if (response.status === 404) {
                if (nomeCargoInput) nomeCargoInput.value = '';
                
                gerenciarBotoes({ incluir: true });
                mostrarMensagem('Cargo não encontrado. Você pode incluir um novo.');
            } else {
                throw new Error('Erro ao buscar o cargo.');
            }
        } catch (err) {
            mostrarMensagem(err.message || 'Erro ao buscar.');
            configurarEstadoInicial();
        }
    };

    // --- PREPARAR OPERAÇÕES ---

    /**
     * Habilita a edição dos campos.
     */
    const habilitarEdicao = () => {
        if (nomeCargoInput) nomeCargoInput.disabled = false;
    };

    /**
     * Prepara o formulário para inclusão.
     */
    const prepararInclusao = () => {
        operacao = 'incluir';
        habilitarEdicao();
        
        if (nomeCargoInput) nomeCargoInput.value = '';
        if (searchIdInput) searchIdInput.disabled = true;
        
        gerenciarBotoes({ salvar: true });
        if (nomeCargoInput) nomeCargoInput.focus();
        mostrarMensagem('Preencha o nome e clique em Salvar para incluir.');
    };

    /**
     * Prepara o formulário para alteração.
     */
    const prepararAlteracao = () => {
        if (!searchIdInput || !searchIdInput.value) {
            mostrarMensagem('Primeiro busque o cargo para alterar.');
            return;
        }
        operacao = 'alterar';
        habilitarEdicao();
        
        if (searchIdInput) searchIdInput.disabled = true;
        
        gerenciarBotoes({ salvar: true });
        if (nomeCargoInput) nomeCargoInput.focus();
        mostrarMensagem('Altere o nome e clique em Salvar.');
    };

    /**
     * Prepara para a exclusão (requer confirmação).
     */
    const prepararExclusao = () => {
        if (!searchIdInput) return;
        const id = searchIdInput.value;
        if (!id) return mostrarMensagem('Primeiro busque o cargo a ser excluído.');

        if (confirm(`Tem certeza que deseja excluir o cargo ID ${id}?`)) {
            operacao = 'excluir';
            salvarOperacao(); 
        }
    };

    // --- SALVAR (INCLUIR / ALTERAR / EXCLUIR) ---
    /**
     * Executa a operação de CRUD na API (Salvar, Alterar ou Excluir).
     */
    const salvarOperacao = async () => {
        if (!searchIdInput || !nomeCargoInput) return;
        const id = searchIdInput.value && String(searchIdInput.value).trim();
        const nome_cargo = nomeCargoInput.value && nomeCargoInput.value.trim();
        
        // Validação
        if ((operacao === 'incluir' || operacao === 'alterar') && !nome_cargo) {
            mostrarMensagem('O nome do cargo não pode ficar vazio.');
            return;
        }

        let url = `${API_BASE_URL}/cargo`;
        let method = 'POST';
        let bodyObj = {};

        if (operacao === 'incluir') {
            bodyObj.nome_cargo = nome_cargo;
            if (id) bodyObj.id_cargo = id; // Pode permitir ID manual
        } else if (operacao === 'alterar') {
            if (!id) { mostrarMensagem('ID inválido para alteração.'); return; }
            url = `${API_BASE_URL}/cargo/${encodeURIComponent(id)}`;
            method = 'PUT';
            bodyObj.nome_cargo = nome_cargo;
        } else if (operacao === 'excluir') {
            if (!id) { mostrarMensagem('ID inválido para exclusão.'); return; }
            url = `${API_BASE_URL}/cargo/${encodeURIComponent(id)}`;
            method = 'DELETE';
            bodyObj = null;
        } else {
            mostrarMensagem('Operação inválida.');
            return;
        }

        try {
            const options = {
                method,
                headers: { 'Content-Type': 'application/json' },
                body: bodyObj ? JSON.stringify(bodyObj) : null
            };

            const response = await fetch(url, options);

            if (!response.ok) {
                let errText = `Falha na operação de ${operacao}.`;
                try { const j = await response.json(); errText = j.error || JSON.stringify(j); } catch(e){}
                throw new Error(errText);
            }
            
            mostrarMensagem(`Cargo ${operacao} com sucesso!`);
            configurarEstadoInicial();
            carregarCargos();

        } catch (error) {
            mostrarMensagem(error.message);
        }
    };

    // --- EVENT LISTENERS ---
    if (btnBuscar) btnBuscar.addEventListener('click', buscarCargo);
    if (btnCancelar) btnCancelar.addEventListener('click', configurarEstadoInicial);
    if (btnIncluir) btnIncluir.addEventListener('click', prepararInclusao);
    if (btnAlterar) btnAlterar.addEventListener('click', prepararAlteracao);
    if (btnExcluir) btnExcluir.addEventListener('click', prepararExclusao);
    if (btnSalvar) btnSalvar.addEventListener('click', salvarOperacao);

    // permitir buscar ao pressionar Enter no campo de busca
    if (searchIdInput) {
        searchIdInput.addEventListener('keydown', (e) => {
            if (e.key === 'Enter') {
                e.preventDefault();
                buscarCargo();
            }
        });
    }

    // --- INICIALIZAÇÃO ---
    configurarEstadoInicial();
    carregarCargos();
    createFloatingHearts(); 
});

// Função para criar corações flutuantes (Consistente com as outras telas)
function createFloatingHearts() {
    const container = document.querySelector('.floating-hearts');
    if (!container) return;
    const EMOJIS = ['💖', '💕', '🌸', '💓', '💞', '✨', '💖', '💕', '🌸', '💓', '💞']; 
    for (let i = 0; i < 20; i++) {
        const heart = document.createElement('div');
        heart.classList.add('heart');
        heart.innerText = EMOJIS[Math.floor(Math.random() * EMOJIS.length)];
        heart.style.left = `${Math.random() * 100}vw`;
        heart.style.top = `${5 + Math.random() * 90}vh`;
        heart.style.fontSize = `${0.8 + Math.random() * 0.8}rem`;
        heart.style.animationDelay = (Math.random() * 10) + 's';
        container.appendChild(heart);
    }
}
