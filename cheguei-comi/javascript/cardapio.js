// Lê o parâmetro "cantina" da URL e exibe no header
const params = new URLSearchParams(window.location.search);
const cantina = params.get("cantina");

if (cantina) {
    document.getElementById("nomeCantina").textContent = cantina;
}

// Botão voltar para cantinas
document.getElementById("btnMenu").addEventListener("click", function() {
    window.location.href = "cantinas.html";
});
