document.addEventListener('DOMContentLoaded', () => {
    // --- CONFIGURAÇÃO INICIAL ---
    const API_BASE_URL = 'http://localhost:3000';
    let operacao = null;

    // --- ELEMENTOS DO DOM ---
    const form = document.getElementById('plantaForm');
    const searchIdInput = document.getElementById('searchIdPlanta');
    const idsList = document.getElementById('idsList');

    const nome_popular_input = document.getElementById('nome_popular');
    const nome_cientifico_input = document.getElementById('nome_cientifico');
    const especie_input = document.getElementById('especie');
    const descricao_input = document.getElementById('descricao');
    const preco_unitario_input = document.getElementById('preco_unitario');
    const quantidade_estoque_input = document.getElementById('quantidade_estoque');

    const imagemInput = document.getElementById('imagemPlanta');
    const imgPreview = document.getElementById('imgPreview');
    const imgPreviewNoImage = document.querySelector('.img-preview-wrap .no-image');

    const plantaTableBody = document.getElementById('plantaTableBody');
    const messageContainer = document.getElementById('messageContainer');

    // Botões
    const btnBuscar = document.getElementById('btnBuscar');
    const btnCancelar = document.getElementById('btnCancelar');
    const btnIncluir = document.getElementById('btnIncluir');
    const btnAlterar = document.getElementById('btnAlterar');
    const btnExcluir = document.getElementById('btnExcluir');
    const btnSalvar = document.getElementById('btnSalvar');

    // --- FUNÇÕES UI ---
    const gerenciarBotoes = ({ incluir = false, alterar = false, excluir = false, salvar = false } = {}) => {
        btnIncluir.style.display = incluir ? 'inline-flex' : 'none';
        btnAlterar.style.display = alterar ? 'inline-flex' : 'none';
        btnExcluir.style.display = excluir ? 'inline-flex' : 'none';
        btnSalvar.style.display = salvar ? 'inline-flex' : 'none';
    };

    const mostrarMensagem = (texto, tempo = 3000) => {
        messageContainer.textContent = texto;
        messageContainer.classList.add('show');
        setTimeout(() => messageContainer.classList.remove('show'), tempo);
    };

    const configurarEstadoInicial = () => {
        form.reset();
        operacao = null;

        nome_popular_input.disabled = true;
        nome_cientifico_input.disabled = true;
        especie_input.disabled = true;
        descricao_input.disabled = true;
        preco_unitario_input.disabled = true;
        quantidade_estoque_input.disabled = true;
        imagemInput.disabled = true;

        imgPreview.src = '';
        imgPreview.style.display = 'none';
        if (imgPreviewNoImage) imgPreviewNoImage.style.display = 'block';

        searchIdInput.disabled = false;
        gerenciarBotoes({});
        searchIdInput.focus();
    };

    // --- CARREGAR LISTA ---
    const carregarPlantas = async () => {
        try {
            const res = await fetch(`${API_BASE_URL}/planta`);
            if (!res.ok) throw new Error('Falha ao carregar plantas.');
            const plantas = await res.json();

            // popular tabela
            plantaTableBody.innerHTML = '';
            // popular datalist de IDs
            if (idsList) idsList.innerHTML = '';

            plantas.forEach(planta => {
                const row = document.createElement('tr');
                row.innerHTML = `
                    <td>${planta.id_planta}</td>
                    <td>${planta.nome_popular || ''}</td>
                    <td>${planta.nome_cientifico || ''}</td>
                    <td>${planta.especie || ''}</td>
                    <td>${planta.descricao || ''}</td>
                    <td>${planta.preco_unitario ?? ''}</td>
                    <td>${planta.quantidade_estoque ?? ''}</td>
                `;
                row.onclick = () => {
                    searchIdInput.value = planta.id_planta;
                    buscarPlanta();
                };
                plantaTableBody.appendChild(row);

                // adicionar opção ao datalist
                if (idsList) {
                    const opt = document.createElement('option');
                    opt.value = planta.id_planta;
                    idsList.appendChild(opt);
                }
            });

            // se não houver plantas, limpar a lista
            if (idsList && plantas.length === 0) idsList.innerHTML = '';

        } catch (err) {
            mostrarMensagem(err.message || 'Erro ao carregar lista.');
        }
    };

    // --- BUSCAR POR ID ---
    const buscarPlanta = async () => {
        const id = searchIdInput.value && String(searchIdInput.value).trim();
        if (!id) {
            mostrarMensagem('Por favor, digite um ID para buscar.');
            return;
        }

        try {
            const response = await fetch(`${API_BASE_URL}/planta/${encodeURIComponent(id)}`);
            if (response.ok) {
                const planta = await response.json();

                nome_popular_input.value = planta.nome_popular ?? '';
                nome_cientifico_input.value = planta.nome_cientifico ?? '';
                especie_input.value = planta.especie ?? '';
                descricao_input.value = planta.descricao ?? '';
                preco_unitario_input.value = planta.preco_unitario ?? '';
                quantidade_estoque_input.value = planta.quantidade_estoque ?? '';

                imgPreview.src = '';
                imgPreview.style.display = 'none';
                if (imgPreviewNoImage) imgPreviewNoImage.style.display = 'block';

                gerenciarBotoes({ alterar: true, excluir: true });
                mostrarMensagem(`Planta "${planta.nome_popular || id}" encontrada!`);
            } else if (response.status === 404) {
                nome_popular_input.value = '';
                nome_cientifico_input.value = '';
                especie_input.value = '';
                descricao_input.value = '';
                preco_unitario_input.value = '';
                quantidade_estoque_input.value = '';
                imgPreview.src = '';
                imgPreview.style.display = 'none';
                if (imgPreviewNoImage) imgPreviewNoImage.style.display = 'block';

                gerenciarBotoes({ incluir: true });
                mostrarMensagem('Planta não encontrada. Você pode incluir um novo registro.');
            } else {
                throw new Error('Erro ao buscar a planta.');
            }
        } catch (err) {
            mostrarMensagem(err.message || 'Erro ao buscar.');
            configurarEstadoInicial();
        }
    };

    // --- PREPARAR INCLUSAO / ALTERACAO / EXCLUSAO ---
    const habilitarEdicao = () => {
        nome_popular_input.disabled = false;
        nome_cientifico_input.disabled = false;
        especie_input.disabled = false;
        descricao_input.disabled = false;
        preco_unitario_input.disabled = false;
        quantidade_estoque_input.disabled = false;
        imagemInput.disabled = false;
    };

    const prepararInclusao = () => {
        operacao = 'incluir';
        habilitarEdicao();
        nome_popular_input.value = '';
        nome_cientifico_input.value = '';
        especie_input.value = '';
        descricao_input.value = '';
        preco_unitario_input.value = '';
        quantidade_estoque_input.value = '';
        imagemInput.value = '';
        imgPreview.src = '';
        imgPreview.style.display = 'none';
        if (imgPreviewNoImage) imgPreviewNoImage.style.display = 'block';

        searchIdInput.disabled = true;
        gerenciarBotoes({ salvar: true });
        nome_popular_input.focus();
        mostrarMensagem('Preencha os dados e clique em Salvar para incluir.');
    };

    const prepararAlteracao = () => {
        if (!searchIdInput.value) {
            mostrarMensagem('Primeiro busque a planta para alterar.');
            return;
        }
        operacao = 'alterar';
        habilitarEdicao();
        searchIdInput.disabled = true;
        gerenciarBotoes({ salvar: true });
        nome_popular_input.focus();
        mostrarMensagem('Altere os dados e clique em Salvar.');
    };

    const prepararExclusao = () => {
        const id = searchIdInput.value;
        if (!id) return mostrarMensagem('Primeiro busque a planta a ser excluída.');
        if (confirm(`Tem certeza que deseja excluir a planta ID ${id}?`)) {
            operacao = 'excluir';
            salvarOperacao(); // executa exclusão imediatamente
        }
    };

    // --- SALVAR (INCLUIR / ALTERAR / EXCLUIR) ---
    const salvarOperacao = async () => {
        const id = searchIdInput.value && String(searchIdInput.value).trim();
        const nome_popular = nome_popular_input.value && nome_popular_input.value.trim();
        const nome_cientifico = nome_cientifico_input.value && nome_cientifico_input.value.trim();
        const especie = especie_input.value && especie_input.value.trim();
        const descricao = descricao_input.value && descricao_input.value.trim();
        const preco_unitario = preco_unitario_input.value && preco_unitario_input.value.trim();
        const quantidade_estoque = quantidade_estoque_input.value !== '' ? Number(quantidade_estoque_input.value) : null;

        // Validação: todos os campos obrigatórios
        if ((operacao === 'incluir' || operacao === 'alterar')) {
            if (!nome_popular) return mostrarMensagem('O nome popular não pode ficar vazio.');
            if (!nome_cientifico) return mostrarMensagem('O nome científico não pode ficar vazio.');
            if (preco_unitario === '' || preco_unitario == null) return mostrarMensagem('O preço unitário não pode ficar vazio.');
            if (quantidade_estoque === null || isNaN(quantidade_estoque)) return mostrarMensagem('A quantidade em estoque não pode ficar vazia.');
        }

        let url = `${API_BASE_URL}/planta`;
        let method = 'POST';
        let bodyObj = {};

        if (operacao === 'incluir') {
            if (id) bodyObj.id_planta = id;
            bodyObj.nome_popular = nome_popular;
            bodyObj.nome_cientifico = nome_cientifico;
            bodyObj.especie = especie;
            bodyObj.descricao = descricao;
            bodyObj.preco_unitario = preco_unitario;
            bodyObj.quantidade_estoque = quantidade_estoque;
        } else if (operacao === 'alterar') {
            if (!id) { mostrarMensagem('ID inválido para alteração.'); return; }
            url = `${API_BASE_URL}/planta/${encodeURIComponent(id)}`;
            method = 'PUT';
            bodyObj.nome_popular = nome_popular;
            bodyObj.nome_cientifico = nome_cientifico;
            bodyObj.especie = especie;
            bodyObj.descricao = descricao;
            bodyObj.preco_unitario = preco_unitario;
            bodyObj.quantidade_estoque = quantidade_estoque;
        } else if (operacao === 'excluir') {
            if (!id) { mostrarMensagem('ID inválido para exclusão.'); return; }
            url = `${API_BASE_URL}/planta/${encodeURIComponent(id)}`;
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
                let errText = 'Falha na operação.';
                try { const j = await response.json(); errText = j.error || JSON.stringify(j); } catch(e){}
                throw new Error(errText);
            }

            mostrarMensagem(`Operação ${operacao} realizada com sucesso!`);
            configurarEstadoInicial();
            await carregarPlantas(); // recarrega e atualiza datalist
        } catch (err) {
            mostrarMensagem(err.message || 'Erro na operação.');
        }
    };

    // --- PREVIEW DE IMAGEM (upload local) ---
    const handleImagemChange = (ev) => {
        const file = ev.target.files && ev.target.files[0];
        if (!file) {
            imgPreview.src = '';
            imgPreview.style.display = 'none';
            if (imgPreviewNoImage) imgPreviewNoImage.style.display = 'block';
            return;
        }

        const reader = new FileReader();
        reader.onload = (e) => {
            imgPreview.src = e.target.result;
            imgPreview.style.display = 'block';
            if (imgPreviewNoImage) imgPreviewNoImage.style.display = 'none';
        };
        reader.readAsDataURL(file);
    };

    // --- EVENT LISTENERS ---
    btnBuscar.addEventListener('click', buscarPlanta);
    btnCancelar.addEventListener('click', configurarEstadoInicial);
    btnIncluir.addEventListener('click', prepararInclusao);
    btnAlterar.addEventListener('click', prepararAlteracao);
    btnExcluir.addEventListener('click', prepararExclusao);
    btnSalvar.addEventListener('click', salvarOperacao);

    if (imagemInput) imagemInput.addEventListener('change', handleImagemChange);

    // permitir buscar ao pressionar Enter no campo de busca
    if (searchIdInput) {
        searchIdInput.addEventListener('keydown', (e) => {
            if (e.key === 'Enter') {
                e.preventDefault();
                buscarPlanta();
            }
        });
    }

    // --- INICIALIZAÇÃO ---
    configurarEstadoInicial();
    carregarPlantas();
    createFloatingHearts();
});

function createFloatingHearts() {
  const container = document.querySelector('.floating-hearts');
  if (!container) return;
  for (let i = 0; i < 16; i++) {
    const heart = document.createElement('div');
    heart.classList.add('heart');
    heart.innerText = ['💖', '💕', '💗', '💓', '💞'][Math.floor(Math.random() * 5)];
    heart.style.left = (i % 2 === 0 ? (Math.random() * 12) : (88 + Math.random() * 8)) + 'vw'; // só esquerda ou direita
    heart.style.top = (5 + Math.random() * 90) + 'vh';
    heart.style.fontSize = (0.9 + Math.random() * 0.5) + 'rem';
    heart.style.animationDelay = (Math.random() * 8) + 's';
    container.appendChild(heart);
  }
}