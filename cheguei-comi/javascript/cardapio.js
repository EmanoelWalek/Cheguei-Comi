// ── Parâmetros da URL ─────────────────────────────────────────────────────────
const params  = new URLSearchParams(window.location.search);
const cantina = params.get("cantina") || "";

if (cantina) {
    document.getElementById("nomeCantina").textContent = cantina;
}

// ── Botão voltar ──────────────────────────────────────────────────────────────
document.getElementById("btnMenu").addEventListener("click", () => {
    window.location.href = "cantinas.html";
});

// ── Carrinho ──────────────────────────────────────────────────────────────────
// Estrutura: { "Nome do produto": { nome, preco, qtd } }
const carrinho = {};

function formatarPreco(valor) {
    return "R$ " + valor.toFixed(2).replace(".", ",");
}

function totalCarrinho() {
    return Object.values(carrinho).reduce((acc, i) => acc + i.preco * i.qtd, 0);
}

function qtdTotalItens() {
    return Object.values(carrinho).reduce((acc, i) => acc + i.qtd, 0);
}

function atualizarUI() {
    const total  = totalCarrinho();
    const qtd    = qtdTotalItens();
    const badge  = document.getElementById("badgeCarrinho");
    const barra  = document.getElementById("barraTotal");
    const texto  = document.getElementById("barraTotalTexto");

    if (qtd > 0) {
        // Badge no botão PEDIDO
        badge.textContent = qtd;
        badge.classList.remove("d-none");

        // Barra flutuante
        barra.classList.remove("d-none");
        texto.textContent = `${qtd} item(s) — ${formatarPreco(total)}`;
    } else {
        badge.classList.add("d-none");
        barra.classList.add("d-none");
    }
}

// ── Clique na imagem do produto ───────────────────────────────────────────────
document.querySelectorAll(".produto-card").forEach(card => {
    const imgWrapper = card.querySelector(".produto-img-wrapper");
    const badge      = card.querySelector(".produto-badge");
    const nome       = card.dataset.nome;
    const preco      = parseFloat(card.dataset.preco);

    imgWrapper.addEventListener("click", () => {
        if (!carrinho[nome]) {
            carrinho[nome] = { nome, preco, qtd: 0 };
        }
        carrinho[nome].qtd++;

        // Atualiza badge do card
        badge.textContent = carrinho[nome].qtd;
        badge.classList.remove("d-none");

        // Animação rápida no card
        card.classList.add("produto-adicionado");
        setTimeout(() => card.classList.remove("produto-adicionado"), 400);

        atualizarUI();
    });
});

// ── Botão PEDIDO no header e na barra flutuante ───────────────────────────────
function irParaPedido() {
    const itens = Object.values(carrinho).filter(i => i.qtd > 0);
    const itensJson = encodeURIComponent(JSON.stringify(itens));
    window.location.href = `pedido.html?cantina=${encodeURIComponent(cantina)}&itens=${itensJson}`;
}

document.getElementById("btnPedido").addEventListener("click", irParaPedido);
document.getElementById("btnIrPedido").addEventListener("click", irParaPedido);
