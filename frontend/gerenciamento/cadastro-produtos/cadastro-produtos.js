// Endpoints
const API_BASE_PLANTAS = 'http://localhost:3000'; 

// DOM Elements
const btnVoltar = document.getElementById('btnVoltar');
const btnSearch = document.getElementById('btnSearch');
const btnAdicionar = document.getElementById('btnAdicionar');
const btnAlterar = document.getElementById('btnAlterar');
const btnExcluir = document.getElementById('btnExcluir');
const btnSalvar = document.getElementById('btnSalvar');
const btnCancelar = document.getElementById('btnCancelar');

const searchInput = document.getElementById('searchInput');
const filterLowStock = document.getElementById('filterLowStock');
const lowStockThreshold = document.getElementById('lowStockThreshold');
const sortField = document.getElementById('sortField');
const sortDir = document.getElementById('sortDir');

const produtoForm = document.getElementById('produtoForm');
const idInput = document.getElementById('id_planta');
const nomePopularInput = document.getElementById('nome_popular');
const nomeCientificoInput = document.getElementById('nome_cientifico');
const especieInput = document.getElementById('especie');
const corInput = document.getElementById('cor');
const descricaoInput = document.getElementById('descricao');
const precoInput = document.getElementById('preco_unitario');
const estoqueInput = document.getElementById('quantidade_estoque');
const fotoUrlInput = document.getElementById('foto_url');
const fotoFileInput = document.getElementById('foto_file');
const imgPreview = document.getElementById('imgPreview');
const noImage = document.getElementById('noImage');

const produtosTableBody = document.getElementById('produtosTableBody');
const messageContainer = document.getElementById('messageContainer');

let operacao = null; // null | "incluir" | "alterar"
let produtosCache = [];

// ====== Funções de Mensagem ======
function mostrarMensagem(msg, tipo = 'info') {
  messageContainer.innerHTML = `<div class="message ${tipo}">${msg}</div>`;
  setTimeout(() => { messageContainer.innerHTML = ''; }, 3000);
}

// ====== Voltar ======
btnVoltar.addEventListener('click', () => window.history.back());

// ====== Pré-visualização da imagem ======
fotoUrlInput.addEventListener('input', () => {
  if (fotoUrlInput.value) {
    imgPreview.src = fotoUrlInput.value;
    imgPreview.style.display = "block";
    noImage.style.display = "none";
  } else {
    imgPreview.style.display = "none";
    noImage.style.display = "block";
  }
});

fotoFileInput.addEventListener('change', () => {
  const file = fotoFileInput.files[0];
  if (file) {
    const reader = new FileReader();
    reader.onload = e => {
      imgPreview.src = e.target.result;
      imgPreview.style.display = "block";
      noImage.style.display = "none";
    };
    reader.readAsDataURL(file);
  }
});

// ====== Reset botões ======
function resetBotoes() {
  btnAdicionar.style.display = "none";
  btnAlterar.style.display = "none";
  btnExcluir.style.display = "none";
  btnSalvar.style.display = "none";
}

// ====== Limpar formulário ======
function limparFormulario() {
  produtoForm.reset();
  imgPreview.style.display = "none";
  noImage.style.display = "block";
  operacao = null;
  resetBotoes();
}

// ====== Preencher formulário ======
function preencherFormulario(planta) {
  idInput.value = planta.id_planta;
  nomePopularInput.value = planta.nome_popular;
  nomeCientificoInput.value = planta.nome_cientifico || "";
  especieInput.value = planta.especie || "";
  corInput.value = planta.cor || "";
  descricaoInput.value = planta.descricao || "";
  precoInput.value = planta.preco_unitario;
  estoqueInput.value = planta.quantidade_estoque;
  fotoUrlInput.value = planta.foto_url || "";

  if (planta.foto_url) {
    imgPreview.src = planta.foto_url;
    imgPreview.style.display = "block";
    noImage.style.display = "none";
  } else {
    imgPreview.style.display = "none";
    noImage.style.display = "block";
  }
}

// ====== Buscar por nome/especie ======
btnSearch.addEventListener('click', () => {
  carregarPlantas();
});

// ====== Cancelar ======
btnCancelar.addEventListener('click', () => {
  limparFormulario();
  mostrarMensagem("Operação cancelada.", "info");
});

// ====== Adicionar ======
btnAdicionar.addEventListener('click', () => {
  operacao = "incluir";
  btnSalvar.style.display = "inline-block";
  btnAdicionar.style.display = "none";
  mostrarMensagem("Preencha os dados e clique em Salvar 💐", "info");
});

// ====== Alterar ======
btnAlterar.addEventListener('click', () => {
  operacao = "alterar";
  btnSalvar.style.display = "inline-block";
  mostrarMensagem("Altere os dados e clique em Salvar 🌸", "info");
});

// ====== Excluir ======
btnExcluir.addEventListener('click', async () => {
  const id = idInput.value;
  if (!id) return;
  if (!confirm("Deseja excluir esta planta? 🌹")) return;
  try {
    await fetch(`${API_BASE_PLANTAS}/${id}`, { method: "DELETE" });
    mostrarMensagem("Muda excluída com carinho 🌷", "success");
    limparFormulario();
    carregarPlantas();
  } catch {
    mostrarMensagem("Erro ao excluir muda.", "error");
  }
});

// ====== Salvar (incluir ou alterar) ======
btnSalvar.addEventListener('click', salvarPlanta);
async function salvarPlanta() {
  const id = idInput.value;
  const plantaObj = {
    nome_popular: nomePopularInput.value.trim(),
    nome_cientifico: nomeCientificoInput.value.trim(),
    especie: especieInput.value.trim(),
    cor: corInput.value.trim(),
    descricao: descricaoInput.value.trim(),
    preco_unitario: parseFloat(precoInput.value),
    quantidade_estoque: parseInt(estoqueInput.value),
    foto_url: fotoUrlInput.value.trim()
  };

  if (!plantaObj.nome_popular || !plantaObj.preco_unitario || isNaN(plantaObj.preco_unitario)) {
    mostrarMensagem("Preencha ao menos nome e preço corretamente.", "error");
    return;
  }

  try {
    if (operacao === "incluir") {
      const res = await fetch(API_BASE_PLANTAS, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(plantaObj)
      });
      if (!res.ok) throw new Error();
      mostrarMensagem("Muda incluída com sucesso 💕", "success");
    } else if (operacao === "alterar") {
      const res = await fetch(`${API_BASE_PLANTAS}/${id}`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(plantaObj)
      });
      if (!res.ok) throw new Error();
      mostrarMensagem("Muda alterada com sucesso 💖", "success");
    }
    limparFormulario();
    carregarPlantas();
  } catch {
    mostrarMensagem("Erro ao salvar muda.", "error");
  }
}

// ====== Carregar lista de plantas ======
async function carregarPlantas() {
  try {
    const res = await fetch(API_BASE_PLANTAS);
    if (!res.ok) throw new Error("Erro ao carregar");
    let plantas = await res.json();
    produtosCache = plantas;

    // filtro busca
    const termo = searchInput.value.trim().toLowerCase();
    if (termo) {
      plantas = plantas.filter(p =>
        p.nome_popular.toLowerCase().includes(termo) ||
        (p.especie && p.especie.toLowerCase().includes(termo))
      );
    }

    // filtro estoque baixo
    if (filterLowStock.checked) {
      const limite = parseInt(lowStockThreshold.value) || 0;
      plantas = plantas.filter(p => p.quantidade_estoque <= limite);
    }

    // ordenar
    const campo = sortField.value;
    const dir = sortDir.value;
    plantas.sort((a, b) => {
      if (a[campo] < b[campo]) return dir === "asc" ? -1 : 1;
      if (a[campo] > b[campo]) return dir === "asc" ? 1 : -1;
      return 0;
    });

    // render tabela
    produtosTableBody.innerHTML = "";
    plantas.forEach(p => {
      const tr = document.createElement("tr");
      tr.innerHTML = `
        <td>${p.foto_url ? `<img src="${p.foto_url}" alt="Foto da muda">` : "🌱"}</td>
        <td>${p.nome_popular}</td>
        <td>${p.especie || "—"}</td>
        <td>R$ ${Number(p.preco_unitario).toFixed(2)}</td>
        <td>${p.quantidade_estoque}</td>
        <td>
          <button class="btn-primary btn-small" onclick="selecionarPlanta(${p.id_planta})">Editar</button>
        </td>
      `;
      produtosTableBody.appendChild(tr);
    });
  } catch (err) {
    mostrarMensagem("Erro ao carregar mudas.", "error");
  }
}

// ====== Selecionar planta na tabela ======
window.selecionarPlanta = async function(id) {
  try {
    const res = await fetch(`${API_BASE_PLANTAS}/${id}`);
    if (!res.ok) {
      mostrarMensagem("Planta não encontrada.", "warning");
      return;
    }
    const planta = await res.json();
    preencherFormulario(planta);
    operacao = "alterar";
    btnAlterar.style.display = "inline-block";
    btnExcluir.style.display = "inline-block";
    btnSalvar.style.display = "inline-block";
  } catch {
    mostrarMensagem("Erro ao buscar planta.", "error");
  }
};

// ====== Inicial ======
carregarPlantas();

// ====== Corações laterais ======
function createHearts() {
  const heartContainer = document.querySelector('.floating-hearts');
  if (!heartContainer) return;
  for (let i = 0; i < 24; i++) {
    const heart = document.createElement('span');
    heart.className = 'heart';
    heart.textContent = '💖';
    const side = Math.random() < 0.5 ? 'left' : 'right';
    if (side === 'left') {
      heart.style.left = `${Math.random() * 5}vw`;
    } else {
      heart.style.left = `${95 + Math.random() * 5}vw`;
    }
    heart.style.top = `${Math.random() * 100}vh`;
    heart.style.fontSize = `${1.2 + Math.random()}rem`;
    heart.style.animationDelay = `${Math.random() * 6}s`;
    heartContainer.appendChild(heart);
  }
}
createHearts();
