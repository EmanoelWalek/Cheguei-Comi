// ── Lê parâmetros da URL ──────────────────────────────────────────────────────
const params  = new URLSearchParams(window.location.search);
const cantina = params.get("cantina") || "Cantina";

// Itens vêm codificados em JSON na URL: ?itens=[{"nome":"...","preco":8.00,"qtd":2},...]
// Caso não haja itens na URL, exibe estado vazio.
let itens = [];
try {
    const raw = params.get("itens");
    if (raw) itens = JSON.parse(decodeURIComponent(raw));
} catch (e) {
    itens = [];
}

// ── Header e destaque de cantina ─────────────────────────────────────────────
document.getElementById("nomeCantinaPedido").textContent = cantina;
document.getElementById("cantinaNomePedido").textContent = cantina;

// ── Botão voltar para cardápio ────────────────────────────────────────────────
document.getElementById("btnVoltarCardapio").addEventListener("click", () => {
    const url = cantina
        ? `cardapio.html?cantina=${encodeURIComponent(cantina)}`
        : "cardapio.html";
    window.location.href = url;
});

// ── Renderização dos itens ────────────────────────────────────────────────────
function formatarPreco(valor) {
    return "R$ " + valor.toFixed(2).replace(".", ",");
}

function calcularTotal() {
    return itens.reduce((acc, item) => acc + item.preco * item.qtd, 0);
}

function renderizarItens() {
    const lista    = document.getElementById("listaItens");
    const semItens = document.getElementById("semItens");
    const totalBox = document.getElementById("totalBox");

    lista.innerHTML = "";

    const itensFiltrados = itens.filter(i => i.qtd > 0);

    if (itensFiltrados.length === 0) {
        semItens.classList.remove("d-none");
        totalBox.classList.add("d-none");

        // Mantém link do cardápio com cantina correta
        const linkCardapio = document.getElementById("linkCardapio");
        if (linkCardapio && cantina) {
            linkCardapio.href = `cardapio.html?cantina=${encodeURIComponent(cantina)}`;
        }
        return;
    }

    semItens.classList.add("d-none");
    totalBox.classList.remove("d-none");

    itensFiltrados.forEach((item, idx) => {
        const div = document.createElement("div");
        div.className = "item-pedido";
        div.innerHTML = `
            <span class="item-nome">${item.nome}</span>
            <div class="item-controles">
                <button class="btn-qtd" data-idx="${idx}" data-acao="diminuir">−</button>
                <span class="item-qtd">${item.qtd}</span>
                <button class="btn-qtd" data-idx="${idx}" data-acao="aumentar">+</button>
            </div>
            <span class="item-preco">${formatarPreco(item.preco * item.qtd)}</span>
            <button class="btn-remover" data-idx="${idx}" title="Remover item">✕</button>
        `;
        lista.appendChild(div);
    });

    // Atualiza índices reais (após filtro, precisamos mapear de volta ao array original)
    lista.querySelectorAll("[data-idx]").forEach(btn => {
        const nomeAlvo = itensFiltrados[+btn.dataset.idx].nome;
        btn.dataset.idxReal = itens.findIndex(i => i.nome === nomeAlvo);
    });

    document.getElementById("totalValor").textContent = formatarPreco(calcularTotal());
}

// ── Eventos dos botões de quantidade e remoção ────────────────────────────────
document.getElementById("listaItens").addEventListener("click", (e) => {
    const btn = e.target.closest("[data-acao], .btn-remover");
    if (!btn) return;

    const idxReal = +btn.dataset.idxReal;

    if (btn.classList.contains("btn-remover")) {
        itens[idxReal].qtd = 0;
    } else if (btn.dataset.acao === "aumentar") {
        itens[idxReal].qtd++;
    } else if (btn.dataset.acao === "diminuir") {
        if (itens[idxReal].qtd > 1) itens[idxReal].qtd--;
        else itens[idxReal].qtd = 0;
    }

    renderizarItens();
});

// ── Seleção de método de pagamento ───────────────────────────────────────────
const opcoes = document.querySelectorAll(".pagamento-opcao");
const pixInfo = document.getElementById("pixInfo");
let metodoPagamento = null;

opcoes.forEach(opcao => {
    opcao.addEventListener("click", () => {
        opcoes.forEach(o => o.classList.remove("selecionado"));
        opcao.classList.add("selecionado");
        metodoPagamento = opcao.querySelector("input").value;

        // Exibe info do Pix apenas quando selecionado
        if (metodoPagamento === "pix") {
            pixInfo.classList.remove("d-none");
        } else {
            pixInfo.classList.add("d-none");
        }
    });
});

// ── Copiar chave Pix ──────────────────────────────────────────────────────────
document.getElementById("btnCopiarPix").addEventListener("click", () => {
    const chave = document.getElementById("pixChave").textContent;
    navigator.clipboard.writeText(chave).then(() => {
        const btn = document.getElementById("btnCopiarPix");
        btn.textContent = "Copiado! ✓";
        setTimeout(() => btn.textContent = "Copiar chave", 2000);
    });
});

// ── Confirmação do pedido ─────────────────────────────────────────────────────
let jsonGerado = null;

document.getElementById("btnConfirmar").addEventListener("click", () => {
    const itensFiltrados = itens.filter(i => i.qtd > 0);

    if (itensFiltrados.length === 0) {
        alert("Adicione ao menos um item antes de confirmar.");
        return;
    }
    if (!metodoPagamento) {
        alert("Escolha um método de pagamento.");
        return;
    }

    const labels = { credito: "Cartão de Crédito", debito: "Cartão de Débito", pix: "Pix" };

    // Monta o objeto do pedido
    jsonGerado = {
        pedido: {
            cantina: cantina,
            data_hora: new Date().toLocaleString("pt-BR"),
            itens: itensFiltrados.map(i => ({
                produto: i.nome,
                quantidade: i.qtd,
                preco_unitario: `R$ ${i.preco.toFixed(2).replace(".", ",")}`,
                subtotal: `R$ ${(i.preco * i.qtd).toFixed(2).replace(".", ",")}`
            })),
            total: formatarPreco(calcularTotal()),
            pagamento: labels[metodoPagamento]
        }
    };

    // Exibe resumo e JSON no modal
    document.getElementById("confirmacaoTexto").textContent =
        `${itensFiltrados.length} item(s) · ${cantina} · ${labels[metodoPagamento]}`;
    document.getElementById("jsonPedido").textContent =
        JSON.stringify(jsonGerado, null, 2);

    const modal = new bootstrap.Modal(document.getElementById("modalConfirmacao"));
    modal.show();
});

// ── Copiar JSON ───────────────────────────────────────────────────────────────
document.getElementById("btnCopiarJson").addEventListener("click", () => {
    if (!jsonGerado) return;
    navigator.clipboard.writeText(JSON.stringify(jsonGerado, null, 2)).then(() => {
        const btn = document.getElementById("btnCopiarJson");
        btn.textContent = "Copiado! ✓";
        setTimeout(() => btn.textContent = "Copiar", 2000);
    });
});

// ── Baixar JSON ───────────────────────────────────────────────────────────────
document.getElementById("btnBaixarJson").addEventListener("click", () => {
    if (!jsonGerado) return;
    const blob = new Blob([JSON.stringify(jsonGerado, null, 2)], { type: "application/json" });
    const url  = URL.createObjectURL(blob);
    const a    = document.createElement("a");
    a.href     = url;
    a.download = `pedido_${cantina.replace(/\s+/g, "_")}_${Date.now()}.json`;
    a.click();
    URL.revokeObjectURL(url);
});

// ── Novo pedido ───────────────────────────────────────────────────────────────
document.getElementById("btnNovosPedidos").addEventListener("click", () => {
    window.location.href = "cantinas.html";
});

// ── Init ──────────────────────────────────────────────────────────────────────
renderizarItens();
