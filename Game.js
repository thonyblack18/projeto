const params = new URLSearchParams(window.location.search);

const gameId = params.get("id");

fetch("Game.json")
    .then(response => response.json())

    .then(games => {

        const game = games.find(g => g.id == gameId);

        if (!game) {

            document.body.innerHTML = `
                <h1 style="
                    color:white;
                    text-align:center;
                    margin-top:100px;
                    font-family:Arial;
                ">
                    Jogo não encontrado.
                </h1>
            `;

            return;
        }

        // =========================
        // TÍTULO DA ABA
        // =========================
        document.title = `Velora | ${game.title}`;

        // =========================
        // HERO
        // =========================
        document.getElementById("game-title").textContent = game.title;

        document.getElementById("game-description").textContent =
            game.description || "Sem descrição.";

        document.getElementById("game-genre").textContent =
            game.genre || "Indie";

        document.getElementById("game-rating").textContent =
            game.rating || "5.0";

        document.getElementById("rating-big-number").textContent =
            game.rating || "5.0";

        // =========================
        // IMAGENS
        // =========================
        document.getElementById("game-cover").src = game.image;

        document.getElementById("main-game-image").src = game.image;

        document.getElementById("thumb-main-image").src = game.image;

        // =========================
        // BREADCRUMB
        // =========================
        document.getElementById("breadcrumb-title").textContent =
            game.title;

        // =========================
        // DETALHES
        // =========================
        document.getElementById("detail-genre").textContent =
            game.genre || "Indie";

        // =========================
        // TAGS
        // =========================
        const tagsContainer = document.getElementById("game-tags");

        tagsContainer.innerHTML = `
            <span class="tag">${game.genre}</span>
            <span class="tag">Indie</span>
            <span class="tag">Velora</span>
        `;

    })

    .catch(error => {

        console.error(error);

        document.body.innerHTML = `
            <h1 style="
                color:white;
                text-align:center;
                margin-top:100px;
                font-family:Arial;
            ">
                Erro ao carregar jogo.
            </h1>
        `;
    });

    function getCatalogoCorreto() {
    let user = null;

    try {
        user = JSON.parse(localStorage.getItem("velora_user"));
    } catch (e) {}

    if (user && user.account_type === "developer") {
        return "CatalogoDev.html";
    }

    return "Catalogo.html";
}

const catalogoCorreto = getCatalogoCorreto();

document.getElementById("linkInicio")?.addEventListener("click", (e) => {
    e.preventDefault();
    window.location.href = catalogoCorreto;
});

document.getElementById("linkJogos")?.addEventListener("click", (e) => {
    e.preventDefault();
    window.location.href = catalogoCorreto;
});

document.getElementById("breadcrumbInicio")?.addEventListener("click", (e) => {
    e.preventDefault();
    window.location.href = catalogoCorreto;
});

document.getElementById("breadcrumbJogos")?.addEventListener("click", (e) => {
    e.preventDefault();
    window.location.href = catalogoCorreto;
});