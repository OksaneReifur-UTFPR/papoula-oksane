document.addEventListener('DOMContentLoaded', () => {
    // --- CONFIGURAÇÃO INICIAL ---
    const API_BASE_URL = 'http://localhost:3000'; // Ajuste a porta se necessário
    let operacao = null; // Controla a ação atual: 'incluir', 'alterar', 'excluir'

    // --- ELEMENTOS DO DOM --- aqui foi a primeira coisa que eu mexi
    const form = document.getElementById('plantaForm');
    const searchIdInput = document.getElementById('searchIdPlanta');
    const nome_popular_input = document.getElementById('nome_popular');
    const nome_cientifico_input = document.getElementById('nome_cientifico');
    const especie_input = document.getElementById('especie');
    const descricao_input = document.getElementById('descricao');
    const preco_unitario_input = document.getElementById('preco_unitario');
    const quantidade_estoque_input = document.getElementById('quantidade_estoque');



    const plantaTableBody = document.getElementById('plantaTableBody');
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
        btnIncluir.style.display = incluir ? 'inline-flex' : 'none';
        btnAlterar.style.display = alterar ? 'inline-flex' : 'none';
        btnExcluir.style.display = excluir ? 'inline-flex' : 'none';
        btnSalvar.style.display = salvar ? 'inline-flex' : 'none';
    };

    /**
     * Exibe uma mensagem de feedback para o usuário.
     */
    const mostrarMensagem = (texto) => {
        messageContainer.textContent = texto;
        messageContainer.classList.add('show');
        setTimeout(() => {
            messageContainer.classList.remove('show');
        }, 3000);
    };

    /**
     * Define o estado inicial da tela, limpando formulários e resetando botões.
     */
    const configurarEstadoInicial = () => {
        form.reset();
        operacao = null;
        nome_popular_input.disabled = true;
        searchIdInput.disabled = false;
        gerenciarBotoes({}); // Esconde todos os botões de ação
        searchIdInput.focus();
    };

    // --- FUNÇÕES DE LÓGICA E API ---

    /**
     * Carrega e renderiza todos os plantas na tabela.
     */
    const carregarPlantas = async () => {
        try {
            const response = await fetch(`${API_BASE_URL}/planta`);
            if (!response.ok) throw new Error('Falha ao carregar plantas.');
            const plantas = await response.json();

            plantaTableBody.innerHTML = '';
            plantas.forEach(planta => {
                const row = document.createElement('tr');
                row.innerHTML =
                //aqui foi a segunda coisa que eu mexi
                    `<td>${planta.id_planta}</td>
                <td>${planta.nome_popular}</td>
                <td>${planta.nome_cientifico}</td>
                <td>${planta.especie}</td>
                <td>${planta.descricao}</td>
                <td>${planta.preco_unitario}</td>
                <td>${planta.quantidade_estoque}</td>`




                    ;
                row.onclick = () => {
                    searchIdInput.value = planta.id_planta;
                    buscarPlanta();
                };
                plantaTableBody.appendChild(row);
            });
        } catch (error) {
            mostrarMensagem(error.message);
        }
    };

    /**
     * Busca um planta pelo ID e atualiza a interface de acordo.
     */
    const buscarPlanta = async () => {
        const id = searchIdInput.value;
        if (!id) {
            mostrarMensagem('Por favor, digite um ID para buscar.');
            return;
        }
              //aqui foi a terceira coisa que eu fiz
        try {
            const response = await fetch(`${API_BASE_URL}/planta/${id}`);
            if (response.ok) {
                const planta = await response.json();
                nome_popular_input.value = planta.nome_popular;
                nome_cientifico_input.value = planta.nome_cientifico;
                especie_input.value = planta.especie;
                descricao_input.value = planta.descricao;
                preco_unitario_input.value = planta.preco_unitario;
                quantidade_estoque_input.value = planta.quantidade_estoque;



                gerenciarBotoes({ alterar: true, excluir: true }); // Encontrou: mostra Alterar e Excluir
                mostrarMensagem(`Planta "${planta.nome_popular}" encontrado!`);
            } else if (response.status === 404) {
                nomePlantaInput.value = '';
                gerenciarBotoes({ incluir: true }); // Não encontrou: mostra Incluir
                mostrarMensagem('Planta não encontrado. Você pode incluir um novo.');
            } else {
                throw new Error('Erro ao buscar o planta.');
            }
        } catch (error) {
            mostrarMensagem(error.message);
            configurarEstadoInicial();
        }
    };

    /**
     * Prepara a UI para a inclusão de um novo planta.
     */
    const prepararInclusao = () => {
        operacao = 'incluir';
        nomePlantaInput.disabled = false;
        nomePlantaInput.value = '';
        nomePlantaInput.focus();
        gerenciarBotoes({ salvar: true });
        mostrarMensagem('Digite o nome do novo planta e clique em Salvar.');
    };

    /**
     * Prepara a UI para a alteração de um planta existente.
     */
    const prepararAlteracao = () => {
        operacao = 'alterar';
        nomePlantaInput.disabled = false;
        nomePlantaInput.focus();
        gerenciarBotoes({ salvar: true });
        mostrarMensagem('Altere o nome do planta e clique em Salvar.');
    };

    /**
     * Prepara a UI para a exclusão de um planta.
     */
    const prepararExclusao = () => {
        if (confirm(`Tem certeza que deseja excluir o planta ID ${searchIdInput.value}?`)) {
            operacao = 'excluir';
            salvarOperacao(); // Chama o salvamento direto para a exclusão
        }
    };

    /**
     * Executa a operação de salvar (incluir, alterar, excluir) no backend.
     */
    const salvarOperacao = async () => {
        const id = searchIdInput.value;
        const nome = nomePlantaInput.value;

        if ((operacao === 'incluir' || operacao === 'alterar') && !nome) {
            mostrarMensagem('O nome do planta não pode ser vazio.');
            return;
        }

        let url = `${API_BASE_URL}/planta`;
        let method = 'POST'; //aqui foi a 4 coisa que eu fiz
        let body = { id_planta: id, nome_popular: nome_popular, nome_cientifico: nome_cientifico, especie: especie, descricao: descricao, preco_unitario: preco_unitario, quantidade_estoque: quantidade_estoque };

        if (operacao === 'alterar') {
            url = `${API_BASE_URL}/planta/${id}`;
            method = 'PUT'; //aqui foi a 5 coisa que eu fiz
            body = { nome_popular: nome_popular, nome_cientifico: nome_cientifico, especie: especie, descricao: descricao, preco_unitario: preco_unitario, quantidade_estoque: quantidade_estoque };
        } else if (operacao === 'excluir') {
            url = `${API_BASE_URL}/planta/${id}`;
            method = 'DELETE';
            body = undefined; // DELETE não tem corpo
        }

        try {
            const response = await fetch(url, {
                method,
                headers: { 'Content-Type': 'application/json' },
                body: body ? JSON.stringify(body) : null
            });

            if (!response.ok) {
                const erro = await response.json();
                throw new Error(erro.error || `Falha na operação de ${operacao}.`);
            }

            mostrarMensagem(`Planta ${operacao} com sucesso!`);
            configurarEstadoInicial();
            carregarPlantas();

        } catch (error) {
            mostrarMensagem(error.message);
        }
    };

    // --- EVENT LISTENERS ---
    btnBuscar.addEventListener('click', buscarPlanta);
    btnCancelar.addEventListener('click', configurarEstadoInicial);
    btnIncluir.addEventListener('click', prepararInclusao);
    btnAlterar.addEventListener('click', prepararAlteracao);
    btnExcluir.addEventListener('click', prepararExclusao);
    btnSalvar.addEventListener('click', salvarOperacao);

    // --- INICIALIZAÇÃO ---
    configurarEstadoInicial();
    carregarPlantas();
    createFloatingHearts(); // Função para criar os corações
});

// Função para criar corações flutuantes (pode ficar no final)
function createFloatingHearts() {
    const container = document.querySelector('.floating-hearts');
    if (!container) return;
    for (let i = 0; i < 20; i++) {
        const heart = document.createElement('div');
        heart.classList.add('heart');
        heart.innerText = ['💖', '💕', '💗', '💓', '💞'][Math.floor(Math.random() * 5)];
        heart.style.left = `${Math.random() * 100}vw`;
        heart.style.top = `${5 + Math.random() * 90}vh`;
        heart.style.fontSize = `${0.8 + Math.random() * 0.8}rem`;
        heart.style.animationDelay = `${Math.random() * 8}s`;
        container.appendChild(heart);
    }
}