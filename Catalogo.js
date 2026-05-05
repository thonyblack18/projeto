const API_BASE = "http://127.0.0.1:5000";

// =================== CLIQUE NO CARD DO JOGO ===================
const gameRoutes = {
    'Dandara: Trials of Fear Edition': 'InfoJogos/dandara/Dandara.html',
    'Mullet Madjack': 'InfoJogos/mullet-madjack/mullet.html',
    'Horizon Chase Turbo': 'InfoJogos/horizon-chase/Horizon.html',
    'A.I.L.A': 'jogos/aila/',
    'Kambulin': 'jogos/kambulin/',
    'Momodora: Reverie Under the Moonlight': 'jogos/momodora/',
    'Knights of Pen and Paper II': 'jogos/knights/',
    'Chroma Squad': 'jogos/chroma-squad/',
    'Mark of the Deep': 'jogos/mark-of-the-deep/',
    'Tupi: The Legend of Arariboia': 'jogos/tupi/',
    '171': 'jogos/171/',
    'Sina': 'jogos/sina/',
    '9Kings': 'InfoJogos/9kings/9kings.html',
    'Gaúcho and the Grassland': 'jogos/gaucho/',
    'Pipistrello and the Cursed Yoyo': 'jogos/pipistrello/',
    'No Heroes Here': 'jogos/no-heroes-here/',
    'Dragon Khan': 'jogos/dragon-khan/',
    '99 Vidas': 'jogos/99-vidas/',
    'Dandy Ace': 'jogos/dandy-ace/',
    'Mombo Combo Legacy': 'jogos/mombo-combo/',
};

// =================== FAVORITOS ===================
function getFavoritos() {
    return JSON.parse(localStorage.getItem('velora_favoritos_ids') || '[]');
}

function salvarFavoritos(lista) {
    localStorage.setItem('velora_favoritos_ids', JSON.stringify(lista));
}

function atualizarCoracoesCatalogo() {
    const favoritos = getFavoritos();

    document.querySelectorAll('.favorite-btn').forEach(btn => {
        const id = btn.dataset.id;
        if (!id) return;

        if (favoritos.includes(id)) {
            btn.classList.add('favorited');
            btn.innerHTML = '<i class="fas fa-heart"></i>';
        } else {
            btn.classList.remove('favorited');
            btn.innerHTML = '<i class="far fa-heart"></i>';
        }
    });
}

function bindFavoritosCatalogo() {
    document.querySelectorAll('.favorite-btn').forEach(btn => {
        if (btn.dataset.bound === "true") return;

        btn.addEventListener('click', (e) => {
            e.stopPropagation();

            const id = btn.dataset.id;
            if (!id) return;

            let favoritos = getFavoritos();

            if (favoritos.includes(id)) {
                favoritos = favoritos.filter(f => f !== id);
            } else {
                favoritos.push(id);
            }

            salvarFavoritos(favoritos);
            atualizarCoracoesCatalogo();
        });

        btn.dataset.bound = "true";
    });
}

// =================== AVATAR DO HEADER ===================
function carregarAvatarHeader() {
    const avatarImg = document.getElementById("headerUserAvatar");
    const avatarInitial = document.getElementById("headerAvatarInitial");
    const userName = document.getElementById("headerUserName");

    let user = {};
    try {
        user = JSON.parse(localStorage.getItem("velora_user")) || {};
    } catch (e) {
        user = {};
    }

    const foto = user.profile_photo || "";
    const nome = (user.display_name || user.name || user.username || "Jogador").trim();
    const inicial = nome.charAt(0).toUpperCase();

    if (userName) {
        userName.textContent = user.account_type === "developer" ? "Desenvolvedor" : "Jogador";
    }

    if (foto && avatarImg) {
        avatarImg.src = foto;
        avatarImg.style.display = "block";
        if (avatarInitial) avatarInitial.style.display = "none";
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

// =================== ROTA / CLIQUE DOS CARDS ===================
function bindGameCards() {
    document.querySelectorAll('.game-card').forEach(card => {
        if (card.dataset.clickBound === "true") return;

        card.addEventListener('click', () => {
            const gameTitle = card.querySelector('.game-title')?.textContent?.trim() || '';
            const route = gameRoutes[gameTitle];

            if (route) {
                window.location.href = route;
            }
        });

        card.dataset.clickBound = "true";
    });
}

// =================== BUSCA DE JOGOS ===================
function bindBuscaJogos() {
    const searchInput = document.querySelector('.search-box input');

    searchInput?.addEventListener('input', (e) => {
        const searchTerm = e.target.value.toLowerCase();

        document.querySelectorAll('.game-card').forEach(card => {
            const title = card.querySelector('.game-title')?.textContent?.toLowerCase() || '';
            const genre = card.querySelector('.game-genre')?.textContent?.toLowerCase() || '';
            const desc = card.querySelector('.game-desc')?.textContent?.toLowerCase() || '';

            if (
                title.includes(searchTerm) ||
                genre.includes(searchTerm) ||
                desc.includes(searchTerm)
            ) {
                card.style.display = 'block';
            } else {
                card.style.display = 'none';
            }
        });
    });
}

// =================== ORDENAÇÃO DE JOGOS ===================
function bindOrdenacaoJogos() {
    const sortSelect = document.querySelector('.sort-select');

    sortSelect?.addEventListener('change', (e) => {
        const sortType = e.target.value;
        const gamesGrid = document.querySelector('.games-grid');
        const cardsArray = Array.from(document.querySelectorAll('.game-card'));

        cardsArray.sort((a, b) => {
            const titleA = a.querySelector('.game-title')?.textContent || '';
            const titleB = b.querySelector('.game-title')?.textContent || '';
            const ratingA = parseFloat(
                (a.querySelector('.game-rating')?.textContent || '0').replace(',', '.').match(/[\d.]+/)?.[0] || '0'
            );
            const ratingB = parseFloat(
                (b.querySelector('.game-rating')?.textContent || '0').replace(',', '.').match(/[\d.]+/)?.[0] || '0'
            );

            switch (sortType) {
                case 'Mais populares':
                    return ratingB - ratingA;
                case 'A-Z':
                    return titleA.localeCompare(titleB);
                case 'Z-A':
                    return titleB.localeCompare(titleA);
                default:
                    return 0;
            }
        });

        cardsArray.forEach(card => gamesGrid.appendChild(card));
    });
}

// =================== NAVEGAÇÃO DO MENU ===================
function bindNavItems() {
    const navItems = document.querySelectorAll('.nav-item');

    navItems.forEach(item => {
        item.addEventListener('click', () => {
            navItems.forEach(nav => nav.classList.remove('active'));
            item.classList.add('active');
        });
    });
}

// =================== FILTRO / MODAL ===================
function bindModalFiltros() {
    const filterBtn = document.querySelector('.filter-btn');
    const filterModal = document.getElementById('filterModal');
    const closeModal = document.getElementById('closeModal');
    const clearFilters = document.getElementById('clearFilters');
    const applyFilters = document.getElementById('applyFilters');

    filterBtn?.addEventListener('click', () => {
        filterModal?.classList.add('active');
    });

    closeModal?.addEventListener('click', () => {
        filterModal?.classList.remove('active');
    });

    filterModal?.addEventListener('click', (e) => {
        if (e.target === filterModal) {
            filterModal.classList.remove('active');
        }
    });

    clearFilters?.addEventListener('click', () => {
        const checkboxes = filterModal.querySelectorAll('input[type="checkbox"]');
        const radios = filterModal.querySelectorAll('input[type="radio"]');

        checkboxes.forEach(cb => cb.checked = false);
        radios.forEach(radio => {
            if (radio.value === 'all') radio.checked = true;
        });
    });

    applyFilters?.addEventListener('click', () => {
        console.log('Filtros aplicados!');

        filterModal?.classList.remove('active');

        const selectedGenres = Array.from(
            filterModal.querySelectorAll('input[type="checkbox"]:checked')
        ).map(cb => cb.value);

        const selectedRating = filterModal.querySelector('input[name="rating"]:checked')?.value;

        console.log('Gêneros:', selectedGenres);
        console.log('Avaliação:', selectedRating);
    });
}

// =================== TRATAMENTO DE ERRO DE LOGO ===================
function bindTratamentoLogos() {
    const headerLogo = document.getElementById('header-logo');

    if (headerLogo) {
        headerLogo.addEventListener('error', function () {
            this.style.display = 'none';
        });
    }

    document.querySelectorAll('.game-logo').forEach(logo => {
        if (logo.dataset.errorBound === "true") return;

        logo.addEventListener('error', function () {
            this.style.display = 'none';

            const placeholder = document.createElement('div');
            placeholder.style.cssText = `
                width: 100%;
                height: 100%;
                background: linear-gradient(135deg, rgba(212, 175, 55, 0.2), rgba(212, 175, 55, 0.05));
                display: flex;
                align-items: center;
                justify-content: center;
                font-size: 48px;
                color: rgba(212, 175, 55, 0.5);
            `;
            placeholder.innerHTML = '<i class="fas fa-gamepad"></i>';

            if (!this.parentElement.querySelector('.fa-gamepad')) {
                this.parentElement.appendChild(placeholder);
            }
        });

        logo.dataset.errorBound = "true";
    });
}

// =================== DROPDOWN DO USUÁRIO ===================
function bindDropdownUsuario() {
    const userProfile = document.getElementById('userProfile');
    const userDropdown = document.getElementById('userDropdown');

    if (!(userProfile && userDropdown)) return;

    userProfile.style.position = 'relative';

    userProfile.addEventListener('click', (e) => {
        e.stopPropagation();
        userDropdown.classList.toggle('active');
        userProfile.classList.toggle('active');
    });

    document.addEventListener('click', () => {
        userDropdown.classList.remove('active');
        userProfile.classList.remove('active');
    });

    userDropdown.addEventListener('click', (e) => {
        e.stopPropagation();
    });

    document.getElementById('dropMeuPerfil')?.addEventListener('click', () => {
        let user = null;
        try {
            user = JSON.parse(localStorage.getItem("velora_user"));
        } catch (e) {}

        if (!user) {
            window.location.href = "LoginCadastro.html";
        } else if (user.account_type === "developer") {
            window.location.href = "PerfilDev.html";
        } else {
            window.location.href = "PerfilUsuario.html";
        }
    });

    document.getElementById('dropSuporte')?.addEventListener('click', () => {
        window.location.href = "SuporteUsuario.html";
    });

    document.getElementById('dropSair')?.addEventListener('click', () => {
        localStorage.removeItem("velora_user");
        window.location.href = "LoginCadastro.html";
    });

    document.getElementById('btnFavoritos')?.addEventListener('click', () => {
        window.location.href = 'ListaFavoritos.html';
    });
}

// =================== JOGOS DA API ===================
async function carregarJogosAPI() {
    try {
        const res = await fetch(`${API_BASE}/api/games`);
        const data = await res.json();

        const games = (data.games || []).slice(0, 10);
        renderJogosAPI(games);
    } catch (err) {
        console.error("Erro ao carregar jogos da API:", err);
    }
}

function renderJogosAPI(games) {
    const grid = document.querySelector(".games-grid");
    if (!grid) return;

    games.forEach(game => {
        const card = document.createElement("div");
        card.className = "game-card api-game-card";
        card.dataset.gameId = game.id;

        card.innerHTML = `
            <div class="game-image">
                <img 
                    src="${game.cover_image || ''}" 
                    alt="${game.title}" 
                    class="game-logo"
                >
                <button class="favorite-btn" data-id="api:${game.id}">
                    <i class="far fa-heart"></i>
                </button>
            </div>

            <div class="game-info">
                <h3 class="game-title">${game.title}</h3>

                <p class="game-desc">
                    ${game.short_description || (game.description ? game.description.slice(0, 80) + "..." : "Sem descrição.")}
                </p>

                <div class="game-meta">
                    <span class="game-genre">${game.genre || "Sem gênero"}</span>
                    <span class="game-rating">
                        <i class="fas fa-star"></i> ${game.rating || "0.0"}
                    </span>
                </div>
            </div>
        `;

        grid.appendChild(card);
    });

    bindGameCards();
    bindFavoritosCatalogo();
    atualizarCoracoesCatalogo();
    bindTratamentoLogos();
}

// =================== INICIAR ===================
document.addEventListener("DOMContentLoaded", () => {
    carregarAvatarHeader();
    bindGameCards();
    bindBuscaJogos();
    bindOrdenacaoJogos();
    bindNavItems();
    bindModalFiltros();
    bindTratamentoLogos();
    bindDropdownUsuario();
    bindFavoritosCatalogo();
    atualizarCoracoesCatalogo();
    carregarJogosAPI();
});