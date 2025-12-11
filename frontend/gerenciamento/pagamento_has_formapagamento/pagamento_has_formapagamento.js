// Front-end para Pagamento_has_FormaDePagamento
// Ajuste API_BASE_URL e BASE_PATH conforme onde você montou o router no backend

const API_BASE_URL = 'http://localhost:3000';
// Ajuste BASE_PATH para o caminho que você usa no backend (ex.: '/pagamento_has_formapagamentos' ou '/pagamento_has_formadepagamento')
// O router define: GET '/' and '/:id_pagamentoPedido/:id_formaDePagamento' etc.
// Se no servidor você fez: app.use('/pagamento_has_formapagamentos', router);
// então BASE_PATH = '/pagamento_has_formapagamentos';
const BASE_PATH = '/pagamento_has_formapagamentos';

document.addEventListener('DOMContentLoaded', () => {
    // Elementos
    const form = document.getElementById('pagamentoHasFormForm');
    const searchPagamentoId = document.getElementById('searchPagamentoId');
    const searchFormaId = document.getElementById('searchFormaId');
    const btnBuscar = document.getElementById('btnBuscar');
    const btnIncluir = document.getElementById('btnIncluir');
    const btnAlterar = document.getElementById('btnAlterar');
    const btnExcluir = document.getElementById('btnExcluir');
    const btnSalvar = document.getElementById('btnSalvar');
    const btnCancelar = document.getElementById('btnCancelar');

    const inputPagamentoPedido = document.getElementById('id_pagamentoPedido');
    const inputFormaPagamento = document.getElementById('id_formaDePagamento');
    const inputValorPago = document.getElementById('valor_pago');

    const tableBody = document.getElementById('pagamentoHasFormTableBody');
    const messageContainer = document.getElementById('messageContainer');

    let operacao = null;
    let currentKey = { id_pagamentoPedido: null, id_formaDePagamento: null };

    // Inicializar
    carregarLista();

    // Eventos
    btnBuscar.addEventListener('click', buscar);
    btnIncluir.addEventListener('click', iniciarInclusao);
    btnAlterar.addEventListener('click', iniciarAlteracao);
    btnExcluir.addEventListener('click', iniciarExclusao);
    btnSalvar.addEventListener('click', salvarOperacao);
    btnCancelar.addEventListener('click', cancelarOperacao);

    // Funções
    function showMessage(text, type = 'info') {
        messageContainer.innerHTML = `<div class="message ${type}">${text}</div>`;
        setTimeout(() => { messageContainer.innerHTML = ''; }, 4000);
    }

    function toggleButtons({ buscar = true, incluir = false, alterar = false, excluir = false, salvar = false, cancelar = false }) {
        btnBuscar.style.display = buscar ? 'inline-block' : 'none';
        btnIncluir.style.display = incluir ? 'inline-block' : 'none';
        btnAlterar.style.display = alterar ? 'inline-block' : 'none';
        btnExcluir.style.display = excluir ? 'inline-block' : 'none';
        btnSalvar.style.display = salvar ? 'inline-block' : 'none';
        btnCancelar.style.display = cancelar ? 'inline-block' : 'none';
    }

    function bloquearCampos(bloquearPK) {
        // quando bloquearPK=true -> impede editar PKs
        inputPagamentoPedido.disabled = bloquearPK;
        inputFormaPagamento.disabled = bloquearPK;
        inputValorPago.disabled = !bloquearPK ? false : false; // valorPago sempre editável quando operação ativa
    }

    async function carregarLista() {
        try {
            const resp = await fetch(`${API_BASE_URL}${BASE_PATH}`);
            if (!resp.ok) throw new Error('Erro ao carregar lista');
            const list = await resp.json();
            renderizarTabela(list);
        } catch (err) {
            console.error(err);
            showMessage('Erro ao carregar lista.', 'error');
        }
    }

    function renderizarTabela(items) {
        tableBody.innerHTML = '';
        items.forEach(item => {
            const tr = document.createElement('tr');
            tr.innerHTML = `
                <td><button class="btn-id" data-p="${item.id_pagamentoPedido}" data-f="${item.id_formaDePagamento}">${item.id_pagamentoPedido}</button></td>
                <td>${item.id_formaDePagamento}</td>
                <td>${item.valor_pago}</td>
                <td>${item.data_pagamento ? item.data_pagamento.split('T')[0] : ''}</td>
                <td>${item.nome_formaDePagamento || ''}</td>
            `;
            // click on first button to select row
            const btn = tr.querySelector('.btn-id');
            btn.addEventListener('click', () => selecionar(item.id_pagamentoPedido, item.id_formaDePagamento));
            tableBody.appendChild(tr);
        });
    }

    async function buscar() {
        const pId = searchPagamentoId.value.trim();
        const fId = searchFormaId.value.trim();
        if (!pId || !fId) {
            showMessage('Informe ambos os IDs para buscar (Pagamento e Forma).', 'warning');
            return;
        }
        try {
            const resp = await fetch(`${API_BASE_URL}${BASE_PATH}/${pId}/${fId}`);
            if (resp.ok) {
                const data = await resp.json();
                preencherFormulario(data);
                operacao = null;
                currentKey = { id_pagamentoPedido: data.id_pagamentoPedido, id_formaDePagamento: data.id_formaDePagamento };
                toggleButtons({ buscar: true, incluir: false, alterar: true, excluir: true, salvar: false, cancel: false });
                bloquearCampos(true);
                showMessage('Registro encontrado.', 'success');
            } else if (resp.status === 404) {
                limparFormulario();
                searchPagamentoId.value = pId;
                searchFormaId.value = fId;
                toggleButtons({ buscar: true, incluir: true, alterar: false, excluir: false, salvar: false, cancel: false });
                bloquearCampos(false);
                showMessage('Relação não encontrada. Você pode incluir um novo registro.', 'info');
            } else {
                const err = await resp.json().catch(()=>({error:'Erro'}));
                showMessage(err.error || 'Erro na busca', 'error');
            }
        } catch (err) {
            console.error(err);
            showMessage('Erro ao buscar registro', 'error');
        }
    }

    function preencherFormulario(data) {
        inputPagamentoPedido.value = data.id_pagamentoPedido || '';
        inputFormaPagamento.value = data.id_formaDePagamento || '';
        inputValorPago.value = data.valor_pago || '';
    }

    function limparFormulario() {
        form.reset();
        currentKey = { id_pagamentoPedido: null, id_formaDePagamento: null };
    }

    function iniciarInclusao() {
        operacao = 'incluir';
        limparFormulario();
        // manter os valores de busca (ids) para ajudar
        inputPagamentoPedido.value = searchPagamentoId.value;
        inputFormaPagamento.value = searchFormaId.value;
        toggleButtons({ buscar: false, incluir: false, alterar: false, excluir: false, salvar: true, cancelar: true });
        bloquearCampos(false); // permitir editar PKs para inclusão
        inputPagamentoPedido.focus();
    }

    function iniciarAlteracao() {
        if (!currentKey.id_pagamentoPedido || !currentKey.id_formaDePagamento) {
            showMessage('Selecione um registro primeiro.', 'warning');
            return;
        }
        operacao = 'alterar';
        toggleButtons({ buscar: false, incluir: false, alterar: false, excluir: false, salvar: true, cancelar: true });
        bloquearCampos(true); // manter PKs bloqueados
    }

    function iniciarExclusao() {
        if (!currentKey.id_pagamentoPedido || !currentKey.id_formaDePagamento) {
            showMessage('Selecione um registro primeiro.', 'warning');
            return;
        }
        operacao = 'excluir';
        toggleButtons({ buscar: false, incluir: false, alterar: false, excluir: false, salvar: true, cancelar: true });
        bloquearCampos(true);
    }

    async function salvarOperacao() {
        const payload = {
            id_pagamentoPedido: Number(inputPagamentoPedido.value),
            id_formaDePagamento: Number(inputFormaPagamento.value),
            valor_pago: Number(inputValorPago.value)
        };

        try {
            let resp;
            if (operacao === 'incluir') {
                resp = await fetch(`${API_BASE_URL}${BASE_PATH}`, {
                    method: 'POST',
                    headers: { 'Content-Type': 'application/json' },
                    body: JSON.stringify(payload)
                });
                if (resp.ok) {
                    const created = await resp.json();
                    showMessage('Registro incluído com sucesso.', 'success');
                    limparFormulario();
                    carregarLista();
                } else {
                    const err = await resp.json().catch(()=>({error:'Erro'}));
                    showMessage(err.error || 'Erro ao incluir', 'error');
                }
            } else if (operacao === 'alterar') {
                // PUT to composite key path
                const pKey = currentKey.id_pagamentoPedido;
                const fKey = currentKey.id_formaDePagamento;
                resp = await fetch(`${API_BASE_URL}${BASE_PATH}/${pKey}/${fKey}`, {
                    method: 'PUT',
                    headers: { 'Content-Type': 'application/json' },
                    body: JSON.stringify({ valor_pago: payload.valor_pago })
                });
                if (resp.ok) {
                    const updated = await resp.json();
                    showMessage('Registro atualizado com sucesso.', 'success');
                    limparFormulario();
                    carregarLista();
                } else {
                    const err = await resp.json().catch(()=>({error:'Erro'}));
                    showMessage(err.error || 'Erro ao atualizar', 'error');
                }
            } else if (operacao === 'excluir') {
                const pKey = currentKey.id_pagamentoPedido;
                const fKey = currentKey.id_formaDePagamento;
                resp = await fetch(`${API_BASE_URL}${BASE_PATH}/${pKey}/${fKey}`, { method: 'DELETE' });
                if (resp.status === 204) {
                    showMessage('Registro excluído com sucesso.', 'success');
                    limparFormulario();
                    carregarLista();
                } else {
                    const err = await resp.json().catch(()=>({error:'Erro'}));
                    showMessage(err.error || 'Erro ao excluir', 'error');
                }
            } else {
                showMessage('Nenhuma operação selecionada.', 'warning');
            }
        } catch (err) {
            console.error(err);
            showMessage('Erro na operação com o servidor.', 'error');
        } finally {
            operacao = null;
            toggleButtons({ buscar: true, incluir: false, alterar: false, excluir: false, salvar: false, cancelar: false });
            bloquearCampos(false);
        }
    }

    function cancelarOperacao() {
        operacao = null;
        limparFormulario();
        toggleButtons({ buscar: true, incluir: false, alterar: false, excluir: false, salvar: false, cancelar: false });
        bloquearCampos(false);
        showMessage('Operação cancelada.', 'info');
    }

    async function selecionar(id_pagamentoPedido, id_formaDePagamento) {
        // preencher com dados da API
        try {
            const resp = await fetch(`${API_BASE_URL}${BASE_PATH}/${id_pagamentoPedido}/${id_formaDePagamento}`);
            if (resp.ok) {
                const data = await resp.json();
                preencherFormulario(data);
                currentKey = { id_pagamentoPedido: data.id_pagamentoPedido, id_formaDePagamento: data.id_formaDePagamento };
                toggleButtons({ buscar: true, incluir: false, alterar: true, excluir: true, salvar: false, cancelar: false });
                bloquearCampos(true);
            } else {
                showMessage('Erro ao selecionar o registro.', 'error');
            }
        } catch (err) {
            console.error(err);
            showMessage('Erro ao selecionar registro.', 'error');
        }
    }
});