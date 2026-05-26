const params = new URLSearchParams(window.location.search);

const gameId = params.get("id");

fetch(`http://127.0.0.1:5000/api/games/${gameId}`)
    .then(response => response.json())

    .then(data => {

        const game = data.game;

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
            game.description || game.short_description || "Sem descrição.";

        document.getElementById("game-genre").textContent =
            game.genre || "Indie";

        document.getElementById("game-rating").textContent =
            game.rating || "5.0";

        document.getElementById("rating-big-number").textContent =
            game.rating || "5.0";

        // =========================
        // IMAGENS
        // =========================
        document.getElementById("game-cover").src = game.cover_url;

        document.getElementById("main-game-image").src = game.banner_url || game.cover_url;

        document.getElementById("thumb-main-image").src = game.cover_url;

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

// =================== FAVORITAR JOGO DINÂMICO ===================
const btnWishlist = document.getElementById("btnWishlist");
const wishlistIcon = document.getElementById("wishlistIcon");
const wishlistText = document.getElementById("wishlistText");

const JOGO_ID = `api:${gameId}`;

function getFavoritos() {
    try {
        return JSON.parse(localStorage.getItem("velora_favoritos_ids") || "[]");
    } catch (e) {
        return [];
    }
}

function salvarFavoritos(lista) {
    localStorage.setItem("velora_favoritos_ids", JSON.stringify(lista));
}

function atualizarBotaoFavorito() {
    const favoritos = getFavoritos();
    const isFav = favoritos.includes(JOGO_ID);

    wishlistIcon.className = isFav ? "fas fa-heart-broken" : "far fa-heart";
    wishlistText.textContent = isFav ? "Remover dos Favoritos" : "Adicionar aos Favoritos";
    btnWishlist.classList.toggle("favorited", isFav);
}

btnWishlist?.addEventListener("click", (e) => {
    e.preventDefault();

    let favoritos = getFavoritos();

    if (favoritos.includes(JOGO_ID)) {
        favoritos = favoritos.filter(id => id !== JOGO_ID);
    } else {
        favoritos.push(JOGO_ID);
    }

    salvarFavoritos(favoritos);
    atualizarBotaoFavorito();
});

atualizarBotaoFavorito();

const btnFavoritosHeader = document.getElementById("btnFavoritos");

btnFavoritosHeader?.addEventListener("click", () => {
    window.location.href = "ListaFavoritos.html";
});