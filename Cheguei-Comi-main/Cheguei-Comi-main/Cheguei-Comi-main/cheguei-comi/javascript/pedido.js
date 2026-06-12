// ── Leitura dos parâmetros enviados pela URL ──────────────────────────────────

// Captura os parâmetros da URL.
const params = new URLSearchParams(window.location.search);

// Obtém o nome da cantina.
// Caso não exista, utiliza "Cantina" como padrão.
const cantina = params.get("cantina") || "Cantina";

// Os itens do pedido são recebidos em formato JSON pela URL.
// Exemplo:
// pedido.html?itens=[{"nome":"Coxinha","preco":8,"qtd":2}]
let itens = [];

try {
    const raw = params.get("itens");

    // Converte o JSON recebido para um array JavaScript.
    if (raw) itens = JSON.parse(decodeURIComponent(raw));
} catch (e) {
    // Se ocorrer erro na leitura dos dados, inicia vazio.
    itens = [];
}

// ── Exibição do nome da cantina ───────────────────────────────────────────────

// Atualiza o nome da cantina em diferentes locais da página.
document.getElementById("nomeCantinaPedido").textContent = cantina;
document.getElementById("cantinaNomePedido").textContent = cantina;

// ── Botão voltar para o cardápio ──────────────────────────────────────────────

// Retorna ao cardápio mantendo a cantina selecionada.
document.getElementById("btnVoltarCardapio").addEventListener("click", () => {

    const url = cantina
        ? `cardapio.html?cantina=${encodeURIComponent(cantina)}`
        : "cardapio.html";

    window.location.href = url;
});

// ── Funções auxiliares ────────────────────────────────────────────────────────

// Formata valores monetários para o padrão brasileiro.
function formatarPreco(valor) {
    return "R$ " + valor.toFixed(2).replace(".", ",");
}

// Calcula o valor total do pedido.
function calcularTotal() {
    return itens.reduce(
        (acc, item) => acc + item.preco * item.qtd,
        0
    );
}

// ── Renderização dos itens na tela ────────────────────────────────────────────

function renderizarItens() {

    const lista = document.getElementById("listaItens");
    const semItens = document.getElementById("semItens");
    const totalBox = document.getElementById("totalBox");

    // Limpa a lista antes de redesenhar.
    lista.innerHTML = "";

    // Remove itens com quantidade igual a zero.
    const itensFiltrados = itens.filter(i => i.qtd > 0);

    // Caso não exista nenhum item.
    if (itensFiltrados.length === 0) {

        semItens.classList.remove("d-none");
        totalBox.classList.add("d-none");

        // Mantém o link correto para voltar ao cardápio.
        const linkCardapio = document.getElementById("linkCardapio");

        if (linkCardapio && cantina) {
            linkCardapio.href =
                `cardapio.html?cantina=${encodeURIComponent(cantina)}`;
        }

        return;
    }

    semItens.classList.add("d-none");
    totalBox.classList.remove("d-none");

    // Cria dinamicamente cada item do pedido.
    itensFiltrados.forEach((item, idx) => {

        const div = document.createElement("div");
        div.className = "item-pedido";

        div.innerHTML = `
            <span class="item-nome">${item.nome}</span>

            <div class="item-controles">
                <button class="btn-qtd"
                        data-idx="${idx}"
                        data-acao="diminuir">−</button>

                <span class="item-qtd">${item.qtd}</span>

                <button class="btn-qtd"
                        data-idx="${idx}"
                        data-acao="aumentar">+</button>
            </div>

            <span class="item-preco">
                ${formatarPreco(item.preco * item.qtd)}
            </span>

            <button class="btn-remover"
                    data-idx="${idx}"
                    title="Remover item">
                ✕
            </button>
        `;

        lista.appendChild(div);
    });

    // Faz o mapeamento dos índices para o array original.
    lista.querySelectorAll("[data-idx]").forEach(btn => {

        const nomeAlvo = itensFiltrados[
            +btn.dataset.idx
        ].nome;

        btn.dataset.idxReal =
            itens.findIndex(i => i.nome === nomeAlvo);
    });

    // Atualiza o valor total exibido.
    document.getElementById("totalValor").textContent =
        formatarPreco(calcularTotal());
}

// ── Controle dos botões de quantidade e remoção ──────────────────────────────

// Utiliza delegação de eventos para controlar todos os botões da lista.
document.getElementById("listaItens").addEventListener("click", (e) => {

    const btn = e.target.closest("[data-acao], .btn-remover");

    if (!btn) return;

    const idxReal = +btn.dataset.idxReal;

    // Remove completamente o item.
    if (btn.classList.contains("btn-remover")) {

        itens[idxReal].qtd = 0;

    }
    // Aumenta quantidade.
    else if (btn.dataset.acao === "aumentar") {

        itens[idxReal].qtd++;

    }
    // Diminui quantidade.
    else if (btn.dataset.acao === "diminuir") {

        if (itens[idxReal].qtd > 1) {
            itens[idxReal].qtd--;
        } else {
            itens[idxReal].qtd = 0;
        }
    }

    // Atualiza a tela.
    renderizarItens();
});

// ── Seleção da forma de pagamento ────────────────────────────────────────────

const opcoes = document.querySelectorAll(".pagamento-opcao");
const pixInfo = document.getElementById("pixInfo");

let metodoPagamento = null;

// Permite selecionar apenas uma forma de pagamento.
opcoes.forEach(opcao => {

    opcao.addEventListener("click", () => {

        opcoes.forEach(o =>
            o.classList.remove("selecionado")
        );

        opcao.classList.add("selecionado");

        metodoPagamento =
            opcao.querySelector("input").value;

        // Exibe a chave Pix apenas quando necessário.
        if (metodoPagamento === "pix") {
            pixInfo.classList.remove("d-none");
        } else {
            pixInfo.classList.add("d-none");
        }
    });
});

// ── Copiar chave Pix ──────────────────────────────────────────────────────────

// Copia automaticamente a chave Pix para a área de transferência.
document.getElementById("btnCopiarPix").addEventListener("click", () => {

    const chave =
        document.getElementById("pixChave").textContent;

    navigator.clipboard.writeText(chave).then(() => {

        const btn =
            document.getElementById("btnCopiarPix");

        btn.textContent = "Copiado! ✓";

        setTimeout(() => {
            btn.textContent = "Copiar chave";
        }, 2000);
    });
});

// ── Confirmação do pedido ─────────────────────────────────────────────────────

// Armazena o JSON final do pedido.
let jsonGerado = null;

document.getElementById("btnConfirmar").addEventListener("click", () => {

    const itensFiltrados =
        itens.filter(i => i.qtd > 0);

    // Validações obrigatórias.
    if (itensFiltrados.length === 0) {
        alert("Adicione ao menos um item antes de confirmar.");
        return;
    }

    if (!metodoPagamento) {
        alert("Escolha um método de pagamento.");
        return;
    }

//=== Importante ===
    // Monta o JSON completo do pedido.
    jsonGerado = {
        pedido: {
            cantina: cantina,
            data_hora: new Date().toLocaleString("pt-BR"),
            itens: itensFiltrados.map(i => ({
                produto: i.nome,
                quantidade: i.qtd,
                preco_unitario:
                    `R$ ${i.preco.toFixed(2).replace(".", ",")}`,
                subtotal:
                    `R$ ${(i.preco * i.qtd).toFixed(2).replace(".", ",")}`
            })),
            total: formatarPreco(calcularTotal()),
            pagamento: labels[metodoPagamento]
        }
    };
//A parte mais importante do código é a montagem do objeto JSON do pedido. 
// Nessa etapa todas as informações coletadas durante a navegação do usuário são organizadas em uma estrutura padronizada, contendo dados da cantina, 
// itens selecionados, quantidades, valores, total da compra e forma de pagamento. Essa estrutura permite que o pedido seja armazenado, transmitido ou 
// integrado futuramente com bancos de dados e APIs.


    // Mostra o resumo do pedido em um modal.
});

// ── Copiar JSON ───────────────────────────────────────────────────────────────

// Copia o JSON completo para a área de transferência.
document.getElementById("btnCopiarJson").addEventListener("click", () => {
});

// ── Baixar JSON ───────────────────────────────────────────────────────────────

// Permite baixar o pedido em formato .json.
document.getElementById("btnBaixarJson").addEventListener("click", () => {
});

// ── Novo pedido ───────────────────────────────────────────────────────────────

// Retorna para a tela inicial das cantinas.
document.getElementById("btnNovosPedidos").addEventListener("click", () => {
    window.location.href = "cantinas.html";
});

// ── Inicialização da página ───────────────────────────────────────────────────

// Desenha os itens assim que a página é carregada.
renderizarItens();