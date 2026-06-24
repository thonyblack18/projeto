// =================== DADOS DO RANKING ===================
// Tudo aqui é front-end/fictício. Nenhuma chamada ao backend foi alterada.
// Cada jogo possui valores diferentes por período, então o ranking muda de verdade
// quando alterna Semana, Mês, Ano e Todos os tempos.

const GAMES = [
    {
        id: 21,
        nome: 'Dandara: Trials of Fear Edition',
        genero: 'Metroidvania',
        img: './Logos/Dandara.jpg',
        acessos: { semana: 8200, mes: 47000, ano: 188000, todos: 312000 },
        avaliacao: { semana: 4.7, mes: 4.8, ano: 4.9, todos: 4.9 }
    },
    {
        id: 5,
        nome: 'Mullet Madjack',
        genero: 'Ação',
        img: './Logos/Mullet Madjack Logo.jpg',
        acessos: { semana: 21400, mes: 69000, ano: 168000, todos: 284000 },
        avaliacao: { semana: 4.9, mes: 4.8, ano: 4.7, todos: 4.7 }
    },
    {
        id: 12,
        nome: 'Horizon Chase Turbo',
        genero: 'Corrida',
        img: './Logos/Horizon Chase Turbo Logo.jpg',
        acessos: { semana: 5400, mes: 42000, ano: 205000, todos: 256000 },
        avaliacao: { semana: 4.4, mes: 4.5, ano: 4.5, todos: 4.5 }
    },
    {
        id: 2,
        nome: 'Sina',
        genero: 'Aventura',
        img: './Logos/Sina Logo.jpeg',
        acessos: { semana: 19600, mes: 61000, ano: 122000, todos: 230000 },
        avaliacao: { semana: 4.8, mes: 4.9, ano: 4.8, todos: 4.8 }
    },
    {
        id: 8,
        nome: 'Mark of the Deep',
        genero: 'Aventura',
        img: './Logos/Mark of the Deep Logo.jpg',
        acessos: { semana: 15300, mes: 55000, ano: 171000, todos: 210000 },
        avaliacao: { semana: 4.9, mes: 4.9, ano: 4.8, todos: 4.9 }
    },
    {
        id: 20,
        nome: 'Chroma Squad',
        genero: 'Estratégia',
        img: './Logos/Chroma Squad Logo.jpg',
        acessos: { semana: 4100, mes: 26000, ano: 117000, todos: 192000 },
        avaliacao: { semana: 4.5, mes: 4.6, ano: 4.7, todos: 4.6 }
    },
    {
        id: 13,
        nome: 'Gaucho and the Grassland',
        genero: 'Casual',
        img: './Logos/Gaucho Logo.jpg',
        acessos: { semana: 12800, mes: 39000, ano: 99000, todos: 175000 },
        avaliacao: { semana: 4.3, mes: 4.5, ano: 4.4, todos: 4.4 }
    },
    {
        id: 11,
        nome: 'Kambulin',
        genero: 'Aventura',
        img: './Logos/Kambulin Logo.jpeg',
        acessos: { semana: 17800, mes: 64000, ano: 108000, todos: 160000 },
        avaliacao: { semana: 4.7, mes: 4.8, ano: 4.7, todos: 4.7 }
    },
    {
        id: 17,
        nome: 'AILA',
        genero: 'Terror',
        img: './Logos/AILA Logo.jpeg',
        acessos: { semana: 22300, mes: 72000, ano: 94000, todos: 145000 },
        avaliacao: { semana: 4.6, mes: 4.5, ano: 4.5, todos: 4.5 }
    },
    {
        id: 1,
        nome: 'Tupi: The Legend of Arariboia',
        genero: 'Roguelite',
        img: './Logos/Tupi Logo.jpg',
        acessos: { semana: 14500, mes: 51000, ano: 88000, todos: 132000 },
        avaliacao: { semana: 4.6, mes: 4.7, ano: 4.6, todos: 4.6 }
    },
    {
        id: 6,
        nome: 'Momodora: Reverie Under The Moonlight',
        genero: 'Metroidvania',
        img: './Logos/Momodora.jpg',
        acessos: { semana: 3600, mes: 18000, ano: 76000, todos: 120000 },
        avaliacao: { semana: 4.4, mes: 4.5, ano: 4.6, todos: 4.5 }
    },
    {
        id: 10,
        nome: 'Knights of Pen and Paper 2',
        genero: 'RPG',
        img: './Logos/Knights Logo.jpeg',
        acessos: { semana: 2900, mes: 21000, ano: 83000, todos: 109000 },
        avaliacao: { semana: 4.3, mes: 4.4, ano: 4.4, todos: 4.4 }
    },
    {
        id: 19,
        nome: '9 Kings',
        genero: 'Estratégia',
        img: './Logos/9kings Logo.jpg',
        acessos: { semana: 24100, mes: 58000, ano: 79000, todos: 99000 },
        avaliacao: { semana: 4.5, mes: 4.4, ano: 4.3, todos: 4.3 }
    },
    {
        id: 4,
        nome: 'No Heroes Here',
        genero: 'Estratégia',
        img: './Logos/No Heroes Here.jpg',
        acessos: { semana: 3100, mes: 17000, ano: 61000, todos: 90000 },
        avaliacao: { semana: 4.5, mes: 4.6, ano: 4.6, todos: 4.6 }
    },
    {
        id: 16,
        nome: '99Vidas',
        genero: 'Beat em Up',
        img: './Logos/99 Vidas Logo.jpeg',
        acessos: { semana: 5200, mes: 24000, ano: 57000, todos: 82000 },
        avaliacao: { semana: 4.4, mes: 4.5, ano: 4.5, todos: 4.5 }
    },
    {
        id: 18,
        nome: 'Dandy Ace',
        genero: 'Roguelite',
        img: './Logos/Dandy Ace Logo.jpeg',
        acessos: { semana: 7800, mes: 30000, ano: 53000, todos: 75000 },
        avaliacao: { semana: 4.5, mes: 4.4, ano: 4.4, todos: 4.4 }
    },
    {
        id: 15,
        nome: '171',
        genero: 'Ação',
        img: './Logos/171 Logo.jpg',
        acessos: { semana: 11900, mes: 43000, ano: 52000, todos: 68000 },
        avaliacao: { semana: 4.2, mes: 4.3, ano: 4.3, todos: 4.3 }
    },
    {
        id: 7,
        nome: 'Mombo Combo Legacy',
        genero: 'Aventura',
        img: './Logos/Mombo Logo.jpeg',
        acessos: { semana: 6900, mes: 27000, ano: 45000, todos: 62000 },
        avaliacao: { semana: 4.1, mes: 4.2, ano: 4.2, todos: 4.2 }
    },
    {
        id: 3,
        nome: 'Pipistrello and the Cursed Yoyo',
        genero: 'Retro',
        img: './Logos/Pipi Logo.jpg',
        acessos: { semana: 16400, mes: 36000, ano: 41000, todos: 57000 },
        avaliacao: { semana: 4.8, mes: 4.6, ano: 4.5, todos: 4.4 }
    },
    {
        id: 14,
        nome: 'Dragon Khan',
        genero: 'RPG de Ação',
        img: './Logos/Dragon Khan Logo.jpg',
        acessos: { semana: 9700, mes: 14000, ano: 16000, todos: 10000 },
        avaliacao: { semana: 4.2, mes: 4.1, ano: 4.1, todos: 4.1 }
    }
];

const PERIOD_LABEL = {
    semana: 'Semana',
    mes: 'Mês',
    ano: 'Ano',
    todos: 'Todos os tempos'
};

let currentMetric = 'acessos';
let currentPeriod = 'todos';

function formatNum(n) {
    if (n >= 1000000) return (n / 1000000).toFixed(1).replace('.0', '') + 'M';
    if (n >= 1000) return (n / 1000).toFixed(0) + 'K';
    return String(n);
}

function getGameMetric(game, metric = currentMetric, period = currentPeriod) {
    if (metric === 'avaliacao') {
        return Number(game.avaliacao?.[period] ?? game.avaliacao?.todos ?? 0);
    }

    return Number(game.acessos?.[period] ?? game.acessos?.todos ?? 0);
}

function getSortedGames() {
    return [...GAMES].sort((a, b) => {
        const valueB = getGameMetric(b);
        const valueA = getGameMetric(a);

        if (valueB !== valueA) {
            return valueB - valueA;
        }

        // Critério de desempate: se empatar avaliação, usa acessos do mesmo período.
        const viewsB = getGameMetric(b, 'acessos', currentPeriod);
        const viewsA = getGameMetric(a, 'acessos', currentPeriod);

        if (viewsB !== viewsA) {
            return viewsB - viewsA;
        }

        return a.nome.localeCompare(b.nome);
    });
}

function getMetricIcon() {
    return currentMetric === 'acessos' ? 'fas fa-eye' : 'fas fa-star';
}

function getMetricLabel() {
    return currentMetric === 'acessos' ? 'Mais Acessados' : 'Mais Avaliados';
}

function getMetricValue(game) {
    const value = getGameMetric(game);

    if (currentMetric === 'acessos') {
        return formatNum(value);
    }

    return value.toFixed(1);
}

function getRatingValue(game) {
    return getGameMetric(game, 'avaliacao', currentPeriod).toFixed(1);
}

function updateBadge() {
    const badge = document.getElementById('activeBadge');

    if (!badge) return;

    badge.innerHTML = `<i class="${getMetricIcon()}"></i> ${getMetricLabel()} — ${PERIOD_LABEL[currentPeriod]}`;
}

function updateGamesCount(sorted) {
    const gamesCount = document.querySelector('.games-count');

    if (gamesCount) {
        gamesCount.textContent = `${sorted.length} jogos`;
    }
}

function updatePodium(sorted) {
    const top3 = sorted.slice(0, 3);
    const visualOrder = [top3[1], top3[0], top3[2]];
    const cards = document.querySelectorAll('.podium-card');

    cards.forEach((card, index) => {
        const game = visualOrder[index];

        if (!game) {
            card.style.display = 'none';
            return;
        }

        card.style.display = 'flex';
        card.dataset.gameId = game.id;

        const img = card.querySelector('.podium-img');
        const name = card.querySelector('.podium-name');
        const genre = card.querySelector('.podium-genre');
        const metricValue = card.querySelector('.stat-value');
        const ratingValue = card.querySelector('.stat-rating');
        const metricIcon = card.querySelector('.primary-stat i');

        if (img) {
            img.src = game.img;
            img.alt = game.nome;
        }

        if (name) name.textContent = game.nome;
        if (genre) genre.textContent = game.genero;
        if (metricValue) metricValue.textContent = getMetricValue(game);
        if (ratingValue) ratingValue.textContent = getRatingValue(game);
        if (metricIcon) metricIcon.className = getMetricIcon();
    });
}

function updateList(sorted) {
    const list = document.getElementById('rankingList');

    if (!list) return;

    const listGames = sorted.slice(3);

    list.innerHTML = listGames.map((game, index) => {
        const pos = index + 4;
        const posClass = pos <= 5 ? 'rank-pos highlight' : 'rank-pos';

        return `
            <div class="rank-row" data-game-id="${game.id}">
                <span class="${posClass}">${pos}</span>

                <div class="rank-img-wrap">
                    <img src="${game.img}" alt="${game.nome}" class="rank-img"
                        onerror="this.style.background='#1e1e2e';this.style.display='block'">
                </div>

                <div class="rank-info">
                    <h4 class="rank-name">${game.nome}</h4>
                    <span class="rank-genre">${game.genero}</span>
                </div>

                <div class="rank-metrics">
                    <span class="rank-metric primary-metric">
                        <i class="${getMetricIcon()}"></i> ${getMetricValue(game)}
                    </span>

                    <span class="rank-metric gold">
                        <i class="fas fa-star"></i> ${getRatingValue(game)}
                    </span>
                </div>

                <button class="rank-favorite" type="button" aria-label="Favoritar ${game.nome}">
                    <i class="far fa-heart"></i>
                </button>
            </div>
        `;
    }).join('');

    bindListEvents();
}

function bindListEvents() {
    document.querySelectorAll('.rank-favorite').forEach(btn => {
        btn.addEventListener('click', e => {
            e.stopPropagation();

            btn.classList.toggle('favorited');

            const icon = btn.querySelector('i');
            icon?.classList.toggle('far');
            icon?.classList.toggle('fas');
        });
    });

    document.querySelectorAll('.rank-row').forEach(row => {
        row.addEventListener('click', () => {
            const gameId = row.dataset.gameId;

            if (gameId) {
                window.location.href = `Game.html?id=${gameId}`;
            }
        });
    });
}

function refreshAll() {
    const sorted = getSortedGames();

    updateBadge();
    updateGamesCount(sorted);
    updatePodium(sorted);
    updateList(sorted);
}

document.querySelectorAll('.period-tab').forEach(btn => {
    btn.addEventListener('click', () => {
        document.querySelectorAll('.period-tab').forEach(item => item.classList.remove('active'));

        btn.classList.add('active');
        currentPeriod = btn.dataset.period || 'todos';

        refreshAll();
    });
});

document.querySelectorAll('.metric-tab').forEach(btn => {
    btn.addEventListener('click', () => {
        document.querySelectorAll('.metric-tab').forEach(item => item.classList.remove('active'));

        btn.classList.add('active');
        currentMetric = btn.dataset.metric || 'acessos';

        refreshAll();
    });
});

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

    if (userName) {
        userName.textContent =
            user.account_type === "developer"
            ? "Desenvolvedor"
            : "Jogador";
    }

    if (foto && avatarImg && avatarInitial) {
        avatarImg.src = foto;
        avatarImg.style.display = "block";
        avatarInitial.style.display = "none";
    } else if (avatarInitial) {
        avatarInitial.textContent = nome.charAt(0).toUpperCase();
        avatarInitial.style.display = "flex";

        if (avatarImg) {
            avatarImg.src = "";
            avatarImg.style.display = "none";
        }
    }
}

// =================== DROPDOWN DO USUÁRIO ===================
const userProfile = document.getElementById('userProfile');
const userDropdown = document.getElementById('userDropdown');

if (userProfile && userDropdown) {
    userProfile.addEventListener('click', e => {
        e.stopPropagation();
        userProfile.classList.toggle('active');
        userDropdown.classList.toggle('active');
    });

    document.addEventListener('click', () => {
        userProfile.classList.remove('active');
        userDropdown.classList.remove('active');
    });

    userDropdown.addEventListener('click', e => e.stopPropagation());
}

// =================== FAVORITOS — PÓDIO ===================
document.querySelectorAll('.podium-card .favorite-btn').forEach(btn => {
    btn.addEventListener('click', e => {
        e.stopPropagation();

        btn.classList.toggle('favorited');

        const icon = btn.querySelector('i');
        icon?.classList.toggle('far');
        icon?.classList.toggle('fas');
    });
});

document.querySelectorAll('.podium-card').forEach(card => {
    card.addEventListener('click', () => {
        const gameId = card.dataset.gameId;

        if (gameId) {
            window.location.href = `Game.html?id=${gameId}`;
        }
    });
});

// =================== BUSCA ===================
const searchInput = document.querySelector('.search-box input');

if (searchInput) {
    searchInput.addEventListener('keydown', e => {
        if (e.key === 'Enter' && searchInput.value.trim()) {
            window.location.href = `Catalogo.html?q=${encodeURIComponent(searchInput.value.trim())}`;
        }
    });
}

// =================== BOTÕES DO HEADER ===================
document.getElementById('btnFavoritos')?.addEventListener('click', () => {
    window.location.href = 'ListaFavoritos.html';
});

document.getElementById('dropMeuPerfil')?.addEventListener('click', () => {
    let user = null;

    try {
        user = JSON.parse(localStorage.getItem('velora_user'));
    } catch (e) {}

    if (!user) {
        window.location.href = 'LoginCadastro.html';
    } else if (user.account_type === 'developer') {
        window.location.href = 'PerfilDev.html';
    } else {
        window.location.href = 'PerfilUsuario.html';
    }
});

document.getElementById('dropSair')?.addEventListener('click', () => {
    localStorage.removeItem('velora_user');
    window.location.href = 'LoginCadastro.html';
});

// =================== INICIALIZAÇÃO ===================
carregarAvatarHeader();
refreshAll();
