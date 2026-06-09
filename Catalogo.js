const gamesGrid = document.querySelector(".games-grid");

let allGames = [];
let currentSearch = "";
let currentSort = "Mais recentes";
let currentGenres = [];
let currentRating = "all";

// =================== LOGIN / USUÁRIO ===================
let user = null;

try {
    user = JSON.parse(localStorage.getItem("velora_user"));
} catch (e) {}

if (!user) {
    window.location.href = "LoginCadastro.html";
}

// =================== RENDERIZAR JOGOS ===================
function renderGames(games) {
    gamesGrid.innerHTML = "";

    const gamesCount = document.getElementById("gamesCount");

    if (gamesCount) {
        gamesCount.textContent = `${games.length} jogos disponíveis`;
    }

    games.forEach(game => {
        gamesGrid.innerHTML += `
            <a 
                href="${game.page ? game.page : `Game.html?id=${game.id}`}" 
                class="game-card-link"
                data-id="${game.id}"
            >
                <div class="game-card">
                    <div class="game-image">
                        <img src="${game.image}" alt="${game.title}" class="game-logo">

                        <button class="favorite-btn" data-id="api:${game.id}">
                            <i class="far fa-heart"></i>
                        </button>
                    </div>

                    <div class="game-info">
                        <h3 class="game-title">${game.title}</h3>


                        <div class="game-meta">
                            <span class="game-genre">${game.genre}</span>
                            <span class="game-rating">⭐ ${game.rating}</span>
                        </div>
                    </div>
                </div>
            </a>
        `;
    });

    ativarFavoritos();
}

// =================== FAVORITOS ===================
function ativarFavoritos() {
    const favoriteBtns = document.querySelectorAll(".favorite-btn");

    let favoritosIds = JSON.parse(localStorage.getItem("velora_favoritos_ids") || "[]");

    favoriteBtns.forEach(btn => {
        const jogoId = btn.dataset.id;
        const icon = btn.querySelector("i");

        if (favoritosIds.includes(jogoId)) {
            btn.classList.add("favorited");
            icon.classList.remove("far");
            icon.classList.add("fas");
        }

        btn.addEventListener("click", (e) => {
            e.preventDefault();
            e.stopPropagation();

            if (favoritosIds.includes(jogoId)) {
                favoritosIds = favoritosIds.filter(id => id !== jogoId);

                btn.classList.remove("favorited");
                icon.classList.remove("fas");
                icon.classList.add("far");
            } else {
                favoritosIds.push(jogoId);

                btn.classList.add("favorited");
                icon.classList.remove("far");
                icon.classList.add("fas");
            }

            localStorage.setItem("velora_favoritos_ids", JSON.stringify(favoritosIds));
        });
    });
}

// =================== BUSCA + FILTRO + ORDENAÇÃO ===================
function applyCatalogState() {
    let games = [...allGames];

    if (currentSearch) {
        games = games.filter(game =>
            game.title.toLowerCase().includes(currentSearch) ||
            game.genre.toLowerCase().includes(currentSearch)
        );
    }

    if (currentGenres.length > 0) {
        games = games.filter(game =>
            currentGenres.some(genre =>
                game.genre.toLowerCase().includes(genre)
            )
        );
    }

    if (currentRating !== "all") {
        games = games.filter(game =>
            parseFloat(game.rating) >= parseFloat(currentRating)
        );
    }

    games.sort((a, b) => {
        switch (currentSort) {
            case "Mais recentes":
                return b.id - a.id;

            case "Mais populares":
                return parseFloat(b.rating) - parseFloat(a.rating);

            case "A-Z":
                return a.title.localeCompare(b.title);

            case "Z-A":
                return b.title.localeCompare(a.title);

            default:
                return 0;
        }
    });

    renderGames(games);
}

// =================== CARREGAR JOGOS DO BACKEND ===================
fetch("http://127.0.0.1:5000/api/games")
    .then(res => res.json())
    .then(data => {

        allGames = data.games.map(game => ({
            ...game,

            image: game.cover_url
                ? `http://127.0.0.1:5000/${game.cover_url}`
                : "logo-velora.png",

            rating: game.rating || "5.0",

            description:
                game.short_description ||
                game.description ||
                ""
        }));

        applyCatalogState();
    })
    .catch(err => {
        console.error("Erro ao carregar jogos:", err);
    });

// =================== BUSCA ===================
const searchInput = document.querySelector(".search-box input");

searchInput?.addEventListener("input", (e) => {
    currentSearch = e.target.value.toLowerCase().trim();
    applyCatalogState();
});

// =================== ORDENAÇÃO ===================
const sortSelect = document.querySelector(".sort-select");

sortSelect?.addEventListener("change", (e) => {
    currentSort = e.target.value;
    applyCatalogState();
});

// =================== FILTRO / MODAL ===================
const filterBtn = document.querySelector(".filter-btn");
const filterModal = document.getElementById("filterModal");
const closeModal = document.getElementById("closeModal");
const clearFilters = document.getElementById("clearFilters");
const applyFilters = document.getElementById("applyFilters");

filterBtn?.addEventListener("click", () => {
    filterModal.classList.add("active");
});

closeModal?.addEventListener("click", () => {
    filterModal.classList.remove("active");
});

filterModal?.addEventListener("click", (e) => {
    if (e.target === filterModal) {
        filterModal.classList.remove("active");
    }
});

clearFilters?.addEventListener("click", () => {
    const checkboxes = filterModal.querySelectorAll("input[type='checkbox']");
    const radios = filterModal.querySelectorAll("input[type='radio']");

    checkboxes.forEach(cb => cb.checked = false);

    radios.forEach(radio => {
        radio.checked = radio.value === "all";
    });

    currentGenres = [];
    currentRating = "all";

    applyCatalogState();
});

applyFilters?.addEventListener("click", () => {
    filterModal.classList.remove("active");

    currentGenres = Array.from(
        filterModal.querySelectorAll(".filter-section:nth-child(1) input[type='checkbox']:checked")
    ).map(cb => cb.value.toLowerCase());

    currentRating = filterModal.querySelector("input[name='rating']:checked").value;

    applyCatalogState();
});

// =================== AVATAR HEADER ===================
function carregarAvatarHeader() {
    const avatarImg = document.getElementById("headerUserAvatar");
    const avatarInitial = document.getElementById("headerAvatarInitial");
    const userName = document.getElementById("headerUserName");

    let currentUser = {};

    try {
        currentUser = JSON.parse(localStorage.getItem("velora_user")) || {};
    } catch (e) {
        currentUser = {};
    }

    const foto = currentUser.profile_photo || "";
    const nome = (
        currentUser.display_name ||
        currentUser.name ||
        currentUser.username ||
        "Jogador"
    ).trim();

    const inicial = nome.charAt(0).toUpperCase();

    if (userName) {
        userName.textContent =
            currentUser.account_type === "developer"
                ? "Desenvolvedor"
                : "Jogador";
    }

    if (foto && avatarImg) {
        avatarImg.src = foto;
        avatarImg.style.display = "block";

        if (avatarInitial) {
            avatarInitial.style.display = "none";
        }
    } else {
        if (avatarImg) {
            avatarImg.src = "";
            avatarImg.style.display = "none";
        }

        if (avatarInitial) {
            avatarInitial.textContent = inicial;
            avatarInitial.style.display = "flex";
        }
    }
}

carregarAvatarHeader();

// =================== DROPDOWN DO USUÁRIO ===================
const userProfile = document.getElementById("userProfile");
const userDropdown = document.getElementById("userDropdown");

if (userProfile && userDropdown) {
    userProfile.style.position = "relative";

    userProfile.addEventListener("click", (e) => {
        e.stopPropagation();

        userDropdown.classList.toggle("active");
        userProfile.classList.toggle("active");
    });

    document.addEventListener("click", () => {
        userDropdown.classList.remove("active");
        userProfile.classList.remove("active");
    });

    userDropdown.addEventListener("click", (e) => {
        e.stopPropagation();
    });

    document.getElementById("dropMeuPerfil")?.addEventListener("click", () => {
        let currentUser = null;

        try {
            currentUser = JSON.parse(localStorage.getItem("velora_user"));
        } catch (e) {}

        if (!currentUser) {
            window.location.href = "LoginCadastro.html";
        } else if (currentUser.account_type === "developer") {
            window.location.href = "PerfilDev.html";
        } else {
            window.location.href = "PerfilUsuario.html";
        }
    });

    document.getElementById("dropSuporte")?.addEventListener("click", () => {
        window.location.href = "SuporteUsuario.html";
    });

    document.getElementById("dropSair")?.addEventListener("click", () => {
        localStorage.removeItem("velora_user");
        window.location.href = "LoginCadastro.html";
    });
}

// =================== MOSTRAR / ESCONDER ADICIONAR JOGO ===================
function controlarOpcaoAdicionarJogo() {
    const addGameItem = document.getElementById("dropAdicionarJogo");

    if (!addGameItem) return;

    let currentUser = null;

    try {
        currentUser = JSON.parse(localStorage.getItem("velora_user"));
    } catch (e) {}

    if (currentUser && currentUser.account_type === "developer") {
        addGameItem.style.display = "flex";
    } else {
        addGameItem.style.display = "none";
    }
}

controlarOpcaoAdicionarJogo();

// =================== BOTÃO FAVORITOS HEADER ===================
const btnFavoritos = document.getElementById("btnFavoritos");

btnFavoritos?.addEventListener("click", () => {
    window.location.href = "ListaFavoritos.html";
});

// =================== LOGO FALLBACK ===================
document.getElementById("header-logo")?.addEventListener("error", function () {
    this.style.display = "none";
});

document.getElementById("footer-logo")?.addEventListener("error", function () {
    this.style.display = "none";
});

// =================== NAVBAR ACTIVE ===================
document.querySelectorAll(".nav-item").forEach(item => {
    item.addEventListener("click", () => {
        document.querySelectorAll(".nav-item").forEach(nav => {
            nav.classList.remove("active");
        });

        item.classList.add("active");
    });
});