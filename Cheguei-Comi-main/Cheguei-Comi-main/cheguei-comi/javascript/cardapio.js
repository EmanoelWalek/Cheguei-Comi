// ── Parâmetros da URL ─────────────────────────────────────────────────────────
const params  = new URLSearchParams(window.location.search);
const cantina = params.get("cantina") || "";// seleciona as informações das cantinas selecionadas

if (cantina) {
    document.getElementById("nomeCantina").textContent = cantina; // vira um parâmetro das cantinas
}

// ── Botão voltar ──────────────────────────────────────────────────────────────
document.getElementById("btnMenu").addEventListener("click", () => {
    window.location.href = "cantinas.html";
});

// ── Carrinho ──────────────────────────────────────────────────────────────────
// Estrutura: { "Nome do produto": { nome, preco, qtd } }
const carrinho = {};// ele se encontra vazio

function formatarPreco(valor) {
    return "R$ " + valor.toFixed(2).replace(".", ",");// esse aqui é o dinheiro queseparado em decimais símbolo da moeda corretamente.
}

function totalCarrinho() {
    return Object.values(carrinho).reduce((acc, i) => acc + i.preco * i.qtd, 0);// vai calcula o valor total de todos os produtos no carrinho.
}

function qtdTotalItens() {
    return Object.values(carrinho).reduce((acc, i) => acc + i.qtd, 0);//Soma das quantidades de todos os produtos
}

function atualizarUI() {
    const total  = totalCarrinho(); //Quantos itens existem no carrinho.
    const qtd    = qtdTotalItens();//Quanto custa o carrinho.
    const badge  = document.getElementById("badgeCarrinho"); //busca O contador do carrinho
    const barra  = document.getElementById("barraTotal");//busca A barra de resumo
    const texto  = document.getElementById("barraTotalTexto"); //busca O texto dentro dessa barra

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
