const params = new URLSearchParams(window.location.search); //cantina selecionada

const cantina = params.get("cantina") || "";// Pega o nome da cantina informado na URL. Caso não exista, deixa vazio.

if (cantina) {// Se existir uma cantina na URL, mostra o nome dela na tela.
    document.getElementById("nomeCantina").textContent = cantina;
}

document.getElementById("btnMenu").addEventListener("click", () => {
    window.location.href = "cantinas.html";// volta
});

const carrinho = {};

function formatarPreco(valor) {// Formata o preço para o padrão brasileiro: R$ 10,50
    return "R$ " + valor.toFixed(2).replace(".", ",");
}

function totalCarrinho() {// calcula $ o total do carrinho
    return Object.values(carrinho).reduce((acc, i) => acc + i.preco * i.qtd, 0);
}

function qtdTotalItens() {// calcula a quantidade.
    return Object.values(carrinho).reduce((acc, i) => acc + i.qtd, 0);
}

function atualizarUI() {
    const total = totalCarrinho();
    const qtd = qtdTotalItens();

    // Elementos visuais do carrinho.
    const badge = document.getElementById("badgeCarrinho");
    const barra = document.getElementById("barraTotal");
    const texto = document.getElementById("barraTotalTexto");

    if (qtd > 0) {    // Se houver itens no carrinho, mostra o contador e a barra de total.
        badge.textContent = qtd;
        badge.classList.remove("d-none");

        barra.classList.remove("d-none");
        texto.textContent = `${qtd} item(s) — ${formatarPreco(total)}`;
    } 
    else {// se vazio
        badge.classList.add("d-none");
        barra.classList.add("d-none");
    }
}

// Percorre todos os cards de produtos da página.
document.querySelectorAll(".produto-card").forEach(card => {
    const imgWrapper = card.querySelector(".produto-img-wrapper");
    const badge = card.querySelector(".produto-badge");

    // Pega o nome e o preço do produto definidos no HTML.
    const nome = card.dataset.nome;
    const preco = parseFloat(card.dataset.preco);

    imgWrapper.addEventListener("click", () => {// quando clicar na imagem seleciona o produto par a o carrinho

        
// para baixo é o importante

        // Se o produto ainda não existir no carrinho, cria ele com quantidade 0.
        if (!carrinho[nome]) {
            carrinho[nome] = { nome, preco, qtd: 0 };
        }

        // Aumenta a quantidade do produto no carrinho.
        carrinho[nome].qtd++;

        // Atualiza o contador exibido no próprio card do produto.
        badge.textContent = carrinho[nome].qtd;
        badge.classList.remove("d-none");

        // Adiciona uma animação visual rápida ao card.
        card.classList.add("produto-adicionado");
        setTimeout(() => card.classList.remove("produto-adicionado"), 400);

        // Atualiza o total e a quantidade geral do carrinho.
        atualizarUI();
    });
});

// Função usada pelos botões para ir para a página de pedido.
function irParaPedido() {

    // Transforma o objeto carrinho em uma lista de itens com quantidade maior que zero.
    const itens = Object.values(carrinho).filter(i => i.qtd > 0);

    // Converte os itens para JSON e codifica para enviar pela URL.
    const itensJson = encodeURIComponent(JSON.stringify(itens));

    // Redireciona para a página de pedido levando o nome da cantina e os itens escolhidos.
    window.location.href = `pedido.html?cantina=${encodeURIComponent(cantina)}&itens=${itensJson}`;
}

// Botão PEDIDO no cabeçalho.
document.getElementById("btnPedido").addEventListener("click", irParaPedido);

// Botão da barra flutuante inferior.
document.getElementById("btnIrPedido").addEventListener("click", irParaPedido);

//function irParaPedido(): é a responsável por transportar todas as informações do pedido para a próxima página. Sem ela, 
// o usuário conseguiria adicionar produtos, mas não conseguiria finalizar o pedido. Portanto, do ponto de vista do fluxo completo do sistema, 
// essa é a função mais importante.