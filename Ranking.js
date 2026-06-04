// =================== DADOS BASE (Todos os tempos) ===================
// Cada jogo tem viewsBase (visualizações totais) e rating fixo.
// O pódio e a lista são sempre derivados deste array — nunca há duplicata.
const GAMES = [
    { id:  1, nome: 'Jogo 1',  genero: 'Metroidvania',          img: './Logos/Dandara.jpg',  viewsBase: 312000, rating: 4.9 },
    { id:  2, nome: 'Jogo 2',  genero: 'Aventura',       img: './Logos/Mullet Madjack Logo.jpg',  viewsBase: 284000, rating: 4.7 },
    { id:  3, nome: 'Jogo 3',  genero: 'Corrida',         img: './Logos/Horizon Chase Turbo Logo.jpg',  viewsBase: 256000, rating: 4.5 },
    { id:  4, nome: 'Jogo 4',  genero: 'Metroidvania',   img: './Logos/Sina Logo.jpeg',  viewsBase: 230000, rating: 4.8 },
    { id:  5, nome: 'Jogo 5',  genero: 'Aventura',        img: './Logos/Mark of the Deep Logo.jpg',  viewsBase: 210000, rating: 4.9 },
    { id:  6, nome: 'Jogo 6',  genero: 'Metroidvania',   img: './Logos/Chroma Squad Logo.jpg',  viewsBase: 192000, rating: 4.6 },
    { id:  7, nome: 'Jogo 7',  genero: 'Casual',         img: './Logos/Gaucho Logo.jpg',  viewsBase: 175000, rating: 4.4 },
    { id:  8, nome: 'Jogo 8',  genero: 'Puzzle',         img: './Logos/Kambulin Logo.jpeg',  viewsBase: 160000, rating: 4.7 },
    { id:  9, nome: 'Jogo 9',  genero: 'Terror',      img: './Logos/AILA Logo.jpeg',  viewsBase: 145000, rating: 4.5 },
    { id: 10, nome: 'Jogo 10', genero: 'RPG',            img: './Logos/Tupi Logo.jpg', viewsBase: 132000, rating: 4.6 },
    { id: 11, nome: 'Jogo 11', genero: 'Roguelite',      img: './Logos/Momodora Logo.jpg', viewsBase: 120000, rating: 4.5 },
    { id: 12, nome: 'Jogo 12', genero: 'RPG',           img: './Logos/Knights Logo.jpeg', viewsBase: 109000, rating: 4.4 },
    { id: 13, nome: 'Jogo 13', genero: 'Aventura',       img: './Logos/9kings Logo.jpg', viewsBase:  99000, rating: 4.3 },
    { id: 14, nome: 'Jogo 14', genero: 'Puzzle',         img: './Logos/No Heroes Here.jpg', viewsBase:  90000, rating: 4.6 },
    { id: 15, nome: 'Jogo 15', genero: 'RPG',            img: './Logos/99 Vidas Logo.jpeg', viewsBase:  82000, rating: 4.5 },
    { id: 16, nome: 'Jogo 16', genero: 'Luta',           img: './Logos/Dandy Ace Logo.jpeg', viewsBase:  75000, rating: 4.4 },
    { id: 17, nome: 'Jogo 17', genero: 'Plataforma',     img: './Logos/171 Logo.jpg', viewsBase:  68000, rating: 4.3 },
    { id: 18, nome: 'Jogo 18', genero: 'Estratégia',     img: './Logos/Mombo Logo.jpeg', viewsBase:  62000, rating: 4.2 },
    { id: 19, nome: 'Jogo 19', genero: 'Ação',           img: './Logos/Pipi Logo.jpg', viewsBase:  57000, rating: 4.4 },
    { id: 30, nome: 'Jogo 20', genero: 'Tower Defense',  img: './Logos/Dragon Khan Logo.jpg', viewsBase:  10000, rating: 4.1 },
];

// =================== MULTIPLICADORES DE PERÍODO ===================
// Cada período aplica um fator diferente nas visualizações.
const PERIOD_MULT = { semana: 0.04, mes: 0.18, ano: 0.65, todos: 1.0 };

const PERIOD_LABEL = { semana: 'Semana', mes: 'Mês', ano: 'Ano', todos: 'Todos os tempos' };

// =================== ESTADO ===================
let currentMetric = 'acessos';
let currentPeriod = 'todos';

// =================== HELPERS ===================
function formatNum(n) {
    if (n >= 1000000) return (n / 1000000).toFixed(1).replace('.0', '') + 'M';
    if (n >= 1000)    return (n / 1000).toFixed(0) + 'K';
    return String(n);
}

// Retorna os jogos ORDENADOS pela métrica/período atual.
// Resultado: array novo, sem alterar GAMES original.
function getSortedGames() {
    const mult = PERIOD_MULT[currentPeriod];

    return [...GAMES]
        .map(g => ({
            ...g,
            views: Math.round(g.viewsBase * mult)
        }))
        .sort((a, b) => {
            if (currentMetric === 'acessos')   return b.views  - a.views;
            if (currentMetric === 'avaliacao') return b.rating - a.rating;
            return 0;
        });
}

// =================== BADGE ===================
function updateBadge() {
    const badge = document.getElementById('activeBadge');
    if (!badge) return;
    const icon  = currentMetric === 'acessos' ? 'fas fa-eye' : 'fas fa-star';
    const label = currentMetric === 'acessos' ? 'Mais Acessados' : 'Mais Avaliados';
    badge.innerHTML = `<i class="${icon}"></i> ${label} — ${PERIOD_LABEL[currentPeriod]}`;
}

// =================== PÓDIO (Top 3) ===================
function updatePodium(sorted) {
    const top3 = sorted.slice(0, 3);
    // Ordem visual das colunas no HTML: place-2 (2º), place-1 (1º), place-3 (3º)
    const visualOrder = [top3[1], top3[0], top3[2]];
    const cards = document.querySelectorAll('.podium-card');

    cards.forEach((card, i) => {
        const game = visualOrder[i];
        if (!game) return;

        card.querySelector('.podium-name').textContent  = game.nome;
        card.querySelector('.podium-genre').textContent = game.genero;
        card.querySelector('.podium-img').src           = game.img;
        card.querySelector('.podium-img').alt           = game.nome;

        const statVal    = card.querySelector('.stat-value');
        const statRating = card.querySelector('.stat-rating');
        const statIcon   = card.querySelector('.primary-stat i');

        if (currentMetric === 'acessos') {
            statVal.textContent  = formatNum(game.views);
            if (statIcon) statIcon.className = 'fas fa-eye';
        } else {
            statVal.textContent  = game.rating.toFixed(1);
            if (statIcon) statIcon.className = 'fas fa-star';
        }
        if (statRating) statRating.textContent = game.rating.toFixed(1);
    });
}

// =================== LISTA (4º ao 30º) ===================
function updateList(sorted) {
    const list = document.getElementById('rankingList');
    if (!list) return;

    // Posições 4–30 (índices 3–29)
    const listGames = sorted.slice(3);

    list.innerHTML = listGames.map((game, i) => {
        const pos        = i + 4;
        const posClass   = pos <= 5 ? 'rank-pos highlight' : 'rank-pos';
        const metricVal  = currentMetric === 'acessos'
            ? formatNum(game.views)
            : game.rating.toFixed(1);
        const metricIcon = currentMetric === 'acessos' ? 'fas fa-eye' : 'fas fa-star';

        return `
        <div class="rank-row">
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
                    <i class="${metricIcon}"></i> ${metricVal}
                </span>
                <span class="rank-metric gold">
                    <i class="fas fa-star"></i> ${game.rating.toFixed(1)}
                </span>
            </div>
            <button class="rank-favorite"><i class="far fa-heart"></i></button>
        </div>`;
    }).join('');

    // Re-atribui eventos de favorito nas linhas recém-criadas
    list.querySelectorAll('.rank-favorite').forEach(btn => {
        btn.addEventListener('click', e => {
            e.stopPropagation();
            btn.classList.toggle('favorited');
            btn.querySelector('i').classList.toggle('far');
            btn.querySelector('i').classList.toggle('fas');
        });
    });
}

// =================== REFRESH GERAL ===================
function refreshAll() {
    const sorted = getSortedGames();
    updateBadge();
    updatePodium(sorted);
    updateList(sorted);
}

// =================== ABAS DE PERÍODO ===================
document.querySelectorAll('.period-tab').forEach(btn => {
    btn.addEventListener('click', () => {
        document.querySelectorAll('.period-tab').forEach(b => b.classList.remove('active'));
        btn.classList.add('active');
        currentPeriod = btn.dataset.period;
        refreshAll();
    });
});

// =================== ABAS DE MÉTRICA ===================
document.querySelectorAll('.metric-tab').forEach(btn => {
    btn.addEventListener('click', () => {
        document.querySelectorAll('.metric-tab').forEach(b => b.classList.remove('active'));
        btn.classList.add('active');
        currentMetric = btn.dataset.metric;
        refreshAll();
    });
});

// =================== DROPDOWN DO USUÁRIO ===================
const userProfile  = document.getElementById('userProfile');
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
}

// =================== FAVORITOS — PÓDIO ===================
document.querySelectorAll('.podium-card .favorite-btn').forEach(btn => {
    btn.addEventListener('click', e => {
        e.stopPropagation();
        btn.classList.toggle('favorited');
        btn.querySelector('i').classList.toggle('far');
        btn.querySelector('i').classList.toggle('fas');
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

// =================== INICIALIZAÇÃO ===================
refreshAll();
