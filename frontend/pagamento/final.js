// finalizacao.js — adaptado para o seu backend e normalizações
// Ajuste API_BASE_URL se necessário
const API_BASE_URL = 'http://localhost:3000';

// CHAVES PIX EXEMPLO (trocar em produção)
const MINHA_CHAVE_PIX = '16548583906';
const NOME_RECEBEDOR = 'Froricultura Exemplo';
const CIDADE_RECEBEDOR = 'Sua Cidade';

// Estado
let carrinho = [];
let usuario = null;
let formasPagamento = [];
let formaSelecionada = null;
let pedidoId = null;
let qrCodePix = '';
let copiaPix = '';
let dadosPagamento = {
    numeroCartao: '',
    nomeCartao: '',
    validadeCartao: '',
    cvv: '',
    cpfTitular: ''
};

// Inicialização
document.addEventListener('DOMContentLoaded', async () => {
    await carregarDados();
});

// Ler cookies helper
function lerCookie(nome) {
    const nomeCookie = nome + '=';
    const cookies = document.cookie.split(';');
    for (let c of cookies) {
        c = c.trim();
        if (c.indexOf(nomeCookie) === 0) return c.substring(nomeCookie.length);
    }
    return null;
}

async function carregarDados() {
    try {
        // Tentar obter usuário (cookies / session / backend)
        const userId = lerCookie('userId');
        const userName = lerCookie('userName');
        if (userId && userName) {
            usuario = { id: userId, nome: userName };
        } else {
            const sess = sessionStorage.getItem('usuarioLogado');
            if (sess) usuario = JSON.parse(sess);
            else {
                // opcional: tentar backend /auth/verificar-login
                try {
                    const resp = await fetch(`${API_BASE_URL}/auth/verificar-login`, { credentials: 'include' });
                    if (resp.ok) {
                        const data = await resp.json();
                        if (data && data.usuario) usuario = data.usuario;
                    }
                } catch (e) {
                    // ignore
                }
            }
        }

        if (!usuario) {
            mostrarErro('Você precisa estar logado para finalizar a compra');
            setTimeout(() => window.location.href = '../auth/login.html', 1800);
            return;
        }

        // carregar carrinho
        const carrinhoLocal = localStorage.getItem('carrinho');
        if (!carrinhoLocal || carrinhoLocal === '[]') {
            mostrarErro('Seu carrinho está vazio');
            setTimeout(() => window.location.href = '../carrinho/carrinho.html', 1500);
            return;
        }
        carrinho = JSON.parse(carrinhoLocal);

        // buscar formas no backend (rota: /forma_pagamentos)
        await carregarFormasPagamento();

        // render UI
        renderizarInterface();
    } catch (err) {
        console.error('Erro carregarDados:', err);
        mostrarErro('Erro ao carregar dados. Tente novamente.');
    }
}

async function carregarFormasPagamento() {
    try {
        const resp = await fetch(`${API_BASE_URL}/forma_pagamentos`, {
            credentials: 'include',
            headers: { 'Accept': 'application/json' }
        });
        if (!resp.ok) throw new Error(`Status ${resp.status}`);
        const data = await resp.json();
        // Normalizar estrutura — aceita várias convenções de nome
        const arr = Array.isArray(data) ? data : (data.rows || data.data || []);
        formasPagamento = arr.map(f => ({
            id_forma_pagamento: f.id_forma_pagamento || f.id_formadepagamento || f.id || f.id_formap || null,
            nome_forma: f.nome_forma || f.nome_formadepagamento || f.nome || f.nome_forma_pagamento || ''
        })).filter(x => x.id_forma_pagamento && x.nome_forma);
    } catch (err) {
        console.warn('Erro ao buscar formas, usando fallback', err);
        formasPagamento = [
            { id_forma_pagamento: 1, nome_forma: 'PIX' },
            { id_forma_pagamento: 2, nome_forma: 'Cartão de Crédito' },
            { id_forma_pagamento: 3, nome_forma: 'Boleto' },
            { id_forma_pagamento: 4, nome_forma: 'Dinheiro' }
        ];
    }
}

function renderizarInterface() {
    document.getElementById('userName').textContent = usuario.nome || '-';
    document.getElementById('userCpf').textContent = usuario.id || '-';
    const total = calcularTotal();
    document.getElementById('totalValor').textContent = formatarMoeda(total);
    document.getElementById('totalItens').textContent = carrinho.length;
    renderizarItens();
    renderizarSelectFormasPagamento();
    document.getElementById('loadingScreen').style.display = 'none';
    document.getElementById('mainScreen').style.display = 'block';
}

function renderizarItens() {
    const container = document.getElementById('pedidoItens');
    container.innerHTML = '';
    carrinho.forEach(item => {
        const subtotal = item.preco * item.quantidade;
        const div = document.createElement('div');
        div.className = 'item-pedido';
        div.innerHTML = `
            <div>
                <div class="item-info-nome">${escapeHtml(item.nome_produto)}</div>
                <div class="item-quantidade">Quantidade: ${item.quantidade}</div>
            </div>
            <div class="item-preco">${formatarMoeda(subtotal)}</div>
        `;
        container.appendChild(div);
    });
}

function renderizarSelectFormasPagamento() {
    const container = document.getElementById('formasPagamentoGrid');
    container.innerHTML = '';
    if (!formasPagamento || formasPagamento.length === 0) {
        container.innerHTML = '<p style="color:#b00">Nenhuma forma de pagamento disponível</p>';
        return;
    }

    // criar select UI (compatível com seu layout)
    const wrapper = document.createElement('div');
    wrapper.style.width = '100%';
    const label = document.createElement('label');
    label.textContent = 'Selecione a forma de pagamento:';
    label.style.display = 'block';
    label.style.fontWeight = '600';
    label.style.marginBottom = '8px';

    const select = document.createElement('select');
    select.id = 'selectFormaPagamento';
    select.style.width = '100%';
    select.style.padding = '12px';
    select.style.borderRadius = '10px';
    select.style.border = '2px solid #e0e0e0';
    const opt0 = document.createElement('option');
    opt0.value = '';
    opt0.textContent = '-- Escolha --';
    opt0.disabled = true;
    opt0.selected = true;
    select.appendChild(opt0);

    formasPagamento.forEach(f => {
        const o = document.createElement('option');
        o.value = f.id_forma_pagamento;
        o.textContent = f.nome_forma;
        o.dataset.forma = JSON.stringify(f);
        select.appendChild(o);
    });

    const dadosContainer = document.createElement('div');
    dadosContainer.id = 'dadosPagamentoContainer';
    dadosContainer.style.marginTop = '14px';

    select.addEventListener('change', (e) => {
        const opt = e.target.options[e.target.selectedIndex];
        if (opt && opt.dataset.forma) {
            const forma = JSON.parse(opt.dataset.forma);
            formaSelecionada = forma;
            renderizarDadosPagamento();
            document.getElementById('btnConfirmar').disabled = false;
        }
    });

    wrapper.appendChild(label);
    wrapper.appendChild(select);
    wrapper.appendChild(dadosContainer);
    container.appendChild(wrapper);
}

function renderizarDadosPagamento() {
    const container = document.getElementById('dadosPagamentoContainer');
    if (!container) return;
    container.innerHTML = '';
    const nome = (formaSelecionada.nome_forma || '').toLowerCase();
    const total = calcularTotal();

    if (nome.includes('pix')) {
        gerarQRCodePix(total, MINHA_CHAVE_PIX, NOME_RECEBEDOR, CIDADE_RECEBEDOR);
        container.innerHTML = `
            <div class="pix-container">
                <img src="${qrCodePix}" class="qrcode-image" alt="QR Code PIX" />
                <p class="pix-instrucoes">Escaneie o QR Code com seu app de banco</p>
                <button class="btn-copiar-pix" onclick="copiarCodigoPix()">📋 Copiar Código PIX</button>
                <div class="codigo-pix" style="margin-top:12px; word-break:break-all;">${escapeHtml(copiaPix)}</div>
            </div>
        `;
    } else if (nome.includes('cart') || nome.includes('credito') || nome.includes('debito')) {
        container.innerHTML = `
            <div class="cartao-container">
                <h3 class="section-title">Dados do Cartão</h3>
                <div class="form-group">
                    <label class="form-label">Número do Cartão</label>
                    <input id="numeroCartao" class="form-input" placeholder="0000 0000 0000 0000" maxlength="19" />
                </div>
                <div class="form-group">
                    <label class="form-label">Nome no Cartão</label>
                    <input id="nomeCartao" class="form-input" placeholder="NOME COMPLETO" />
                </div>
                <div class="form-grid-2">
                    <div class="form-group">
                        <label class="form-label">Validade</label>
                        <input id="validadeCartao" class="form-input" placeholder="MM/AA" maxlength="5" />
                    </div>
                    <div class="form-group">
                        <label class="form-label">CVV</label>
                        <input id="cvvCartao" class="form-input" placeholder="123" maxlength="4" />
                    </div>
                </div>
                <div class="form-group">
                    <label class="form-label">CPF do Titular</label>
                    <input id="cpfTitular" class="form-input" placeholder="000.000.000-00" maxlength="14" />
                </div>
            </div>
        `;
        // attach masks / bindings
        const num = document.getElementById('numeroCartao');
        const val = document.getElementById('validadeCartao');
        const cvv = document.getElementById('cvvCartao');
        const cpf = document.getElementById('cpfTitular');
        num && num.addEventListener('input', (e) => {
            formatCardNumberInput(e.target);
            dadosPagamento.numeroCartao = e.target.value.replace(/\s/g,'');
        });
        val && val.addEventListener('input', (e) => { formatExpiryInput(e.target); dadosPagamento.validadeCartao = e.target.value; });
        cvv && cvv.addEventListener('input', (e) => { formatCvvInput(e.target); dadosPagamento.cvv = e.target.value; });
        cpf && cpf.addEventListener('input', (e) => { formatCPF(e.target); dadosPagamento.cpfTitular = e.target.value; });
        const nameInput = document.getElementById('nomeCartao');
        nameInput && nameInput.addEventListener('input', (e) => { dadosPagamento.nomeCartao = e.target.value.toUpperCase(); e.target.value = e.target.value.toUpperCase(); });
    } else {
        container.innerHTML = `
            <div class="dinheiro-container">
                <div class="dinheiro-icon">💰</div>
                <p class="dinheiro-texto">Total a pagar:</p>
                <p class="dinheiro-valor">${formatarMoeda(total)}</p>
                <p style="margin-top:12px;">Pagamento será realizado na entrega.</p>
            </div>
        `;
    }
}

// ---------- PIX helpers ----------
function gerarQRCodePix(valor, chave, nome, cidade) {
    // Gera payload simples e QR (para demo). Em produção gere no servidor.
    const txid = `PED${Date.now()}`;
    const payload = `0002012633BR.GOV.BCB.PIX01${String(chave.length).padStart(2,'0')}${chave}5204000053039865802BR5914${nome.toUpperCase().slice(0,14)}6008${cidade.toUpperCase().slice(0,8)}62070503${txid}6304`;
    copiaPix = payload;
    qrCodePix = `https://api.qrserver.com/v1/create-qr-code/?size=300x300&data=${encodeURIComponent(payload)}`;
}

async function copiarCodigoPix() {
    try {
        await navigator.clipboard.writeText(copiaPix);
        alert('Código PIX copiado!');
    } catch (e) {
        alert('Não foi possível copiar automaticamente. Selecione e copie manualmente.');
    }
}

// ---------- Formatações / validações ----------
function formatCardNumberInput(input) {
    let v = input.value.replace(/\D/g,'');
    v = v.substring(0,19);
    v = v.replace(/(\d{4})/g,'$1 ').trim();
    input.value = v;
}
function formatExpiryInput(input) {
    let v = input.value.replace(/\D/g,'').substring(0,4);
    if (v.length>2) v = v.slice(0,2) + '/' + v.slice(2);
    input.value = v;
}
function formatCvvInput(input) {
    input.value = input.value.replace(/\D/g,'').substring(0,4);
}
function formatCPF(input) {
    let v = input.value.replace(/\D/g,'');
    v = v.replace(/^(\d{3})(\d)/, '$1.$2');
    v = v.replace(/^(\d{3}\.\d{3})(\d)/, '$1.$2');
    v = v.replace(/(\d{3}\.\d{3}\.\d{3})(\d{1,2})$/, '$1-$2');
    input.value = v;
}

function luhnCheck(num) {
    const s = String(num).replace(/\D/g,'');
    if (!/^\d{13,19}$/.test(s)) return false;
    let sum = 0, alt = false;
    for (let i = s.length-1; i>=0; i--) {
        let n = parseInt(s[i],10);
        if (alt) { n *= 2; if (n>9) n -= 9; }
        sum += n; alt = !alt;
    }
    return sum % 10 === 0;
}

function validateExpiry(value) {
    if (!/^\d{2}\/\d{2}$/.test(value)) return false;
    const [mm, yy] = value.split('/').map(Number);
    if (mm < 1 || mm > 12) return false;
    const now = new Date();
    const currentYY = now.getFullYear() % 100;
    const currentMM = now.getMonth() + 1;
    if (yy < currentYY) return false;
    if (yy === currentYY && mm < currentMM) return false;
    return true;
}

// ---------- Confirmar pagamento (fluxo principal) ----------
async function confirmarPagamento() {
    if (!formaSelecionada) { mostrarErro('Selecione uma forma de pagamento'); return; }

    const nome = (formaSelecionada.nome_forma || '').toLowerCase();

    // validação cartão se aplicável
    if (nome.includes('cart') || nome.includes('credito') || nome.includes('débito') || nome.includes('debito')) {
        if (!luhnCheck(dadosPagamento.numeroCartao)) { mostrarErro('Número de cartão inválido'); return; }
        if (!dadosPagamento.nomeCartao || dadosPagamento.nomeCartao.length < 3) { mostrarErro('Nome do titular inválido'); return; }
        if (!validateExpiry(dadosPagamento.validadeCartao)) { mostrarErro('Validade inválida'); return; }
        if (!/^\d{3,4}$/.test(dadosPagamento.cvv)) { mostrarErro('CVV inválido'); return; }
        if (!/^\d{11}$/.test((dadosPagamento.cpfTitular || '').replace(/\D/g,''))) { mostrarErro('CPF inválido'); return; }
    }

    // mostrar processing
    document.getElementById('mainScreen').style.display = 'none';
    document.getElementById('processingScreen').style.display = 'flex';

    try {
        const total = calcularTotal();

        // criar pedido
        const hoje = new Date();
        const dataAtual = `${hoje.getFullYear()}-${String(hoje.getMonth()+1).padStart(2,'0')}-${String(hoje.getDate()).padStart(2,'0')}`;
        const pedidoPayload = { cpf: usuario.id, data_pedido: dataAtual, valor_total: total };

        const respPedido = await fetch(`${API_BASE_URL}/pedido`, {
            method: 'POST',
            headers: { 'Content-Type':'application/json' },
            credentials: 'include',
            body: JSON.stringify(pedidoPayload)
        });
        if (!respPedido.ok) throw new Error('Falha ao criar pedido');
        const pedido = await respPedido.json();
        pedidoId = pedido.id_pedido || pedido.id || pedido.idPedido;
        if (!pedidoId) throw new Error('ID do pedido não retornado pelo servidor');

        // inserir itens
        for (const item of carrinho) {
            const itemPayload = { id_pedido: pedidoId, id_produto: item.id_produto, quantidade: item.quantidade, preco_unitario: item.preco };
            const r = await fetch(`${API_BASE_URL}/pedidoproduto`, {
                method: 'POST',
                headers: { 'Content-Type':'application/json' },
                credentials: 'include',
                body: JSON.stringify(itemPayload)
            });
            if (!r.ok) throw new Error(`Erro ao inserir item ${item.id_produto}`);
        }

        // criar pagamento (note: backend espera valor_total_pagamento)
        const pagamentoPayload = { id_pedido: pedidoId, data_pagamento: dataAtual, valor_total_pagamento: total };
        const respPag = await fetch(`${API_BASE_URL}/pagamento`, {
            method: 'POST',
            headers: { 'Content-Type':'application/json' },
            credentials: 'include',
            body: JSON.stringify(pagamentoPayload)
        });
        if (!respPag.ok) throw new Error('Erro ao criar pagamento');
        const pagamento = await respPag.json();
        const idPagamento = pagamento.id_pagamento || pagamento.id || pagamento.idPagamento;
        if (!idPagamento) throw new Error('ID do pagamento não retornado');

        // relacionar forma de pagamento (envia ambos os nomes de campo para compatibilidade)
        const formaId = formaSelecionada.id_forma_pagamento || formaSelecionada.id_formadepagamento;
        const formaPagPayload = {
            id_pagamento: idPagamento,
            id_pagamentoPedido: idPagamento, // some controllers expect this name
            id_forma_pagamento: formaId,
            id_formaDePagamento: formaId, // some controllers expect this
            valor_pago: total
        };

        const respRel = await fetch(`${API_BASE_URL}/pagamento_has_formapagamentos`, {
            method: 'POST',
            headers: { 'Content-Type':'application/json' },
            credentials: 'include',
            body: JSON.stringify(formaPagPayload)
        });
        if (!respRel.ok) {
            // try alternate endpoint name if configured differently
            // fallback: try /pagamentoHasFormaDePagamento (not required, just logging)
            const errText = await respRel.text().catch(()=>null);
            throw new Error(`Erro ao relacionar forma de pagamento: ${respRel.status} ${errText || ''}`);
        }

        // sucesso
        document.getElementById('processingScreen').style.display = 'none';
        document.getElementById('successScreen').style.display = 'flex';
        document.getElementById('pedidoNumero').textContent = pedidoId;
        localStorage.removeItem('carrinho');

        setTimeout(() => window.location.href = '../menu.html', 4500);
    } catch (err) {
        console.error('Erro confirmarPagamento:', err);
        document.getElementById('processingScreen').style.display = 'none';
        document.getElementById('errorScreen').style.display = 'flex';
        document.getElementById('errorMessage').textContent = err.message || 'Erro ao processar pagamento';
    }
}

// ---------- utilidades ----------
function calcularTotal() { return carrinho.reduce((s, i) => s + (i.preco * i.quantidade), 0); }
function formatarMoeda(v) { return `R$ ${Number(v).toFixed(2).replace('.',',')}`; }
function mostrarErro(msg) { const c = document.getElementById('errorContainer'); if (c) { c.innerHTML = `<div class="error-message">${escapeHtml(msg)}</div>`; setTimeout(()=>c.innerHTML='',5000); } else alert(msg); }
function voltarCarrinho(){ window.location.href = '../carrinho/carrinho.html'; }
function tentarNovamente(){ location.reload(); }
function fecharModal(){ document.getElementById('modalPagamento').style.display = 'none'; }

// escape
function escapeHtml(s){ if (s===undefined||s===null) return ''; return String(s).replace(/[&<>"']/g, m=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[m])); }

console.log('Finalização script carregado');