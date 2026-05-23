const API_BASE = "http://127.0.0.1:5000";

// =================== BASE DE DADOS DOS JOGOS ESTÁTICOS ===================
const TODOS_JOGOS = [
    { id: 1, titulo: "Dandara: Trials of Fear Edition", desenvolvedor: "Long Hat House", genero: "Metroidvania", avaliacao: 4.8, status: "lancado", logo: "Logos/Dandara Logo 1.jpg", rota: "InfoJogos/dandara/Dandara.html", source: "static" },
    { id: 2, titulo: "Mullet Madjack", desenvolvedor: "Hammer95", genero: "Arcade", avaliacao: 4.5, status: "lancado", logo: "Logos/Mullet Madjack Logo.jpg", rota: "InfoJogos/mullet-madjack/MulletMadjack.html", source: "static" },
    { id: 3, titulo: "Horizon Chase Turbo", desenvolvedor: "Aquiris", genero: "Corrida", avaliacao: 4.9, status: "lancado", logo: "Logos/Horizon Chase Turbo Logo.jpg", rota: "jogos/horizon-chase/", source: "static" },
    { id: 4, titulo: "A.I.L.A", desenvolvedor: "Estúdio Aila", genero: "Beat 'em up", avaliacao: 4.5, status: "lancado", logo: "Logos/AILA Logo.jpeg", rota: "jogos/aila/", source: "static" },
    { id: 5, titulo: "Kambulin", desenvolvedor: "Kambulin Studio", genero: "Aventura", avaliacao: 4.6, status: "lancado", logo: "Logos/Kambulin Logo.jpeg", rota: "jogos/kambulin/", source: "static" },
    { id: 6, titulo: "Momodora: Reverie Under the Moonlight", desenvolvedor: "rdein", genero: "Aventura", avaliacao: 4.4, status: "lancado", logo: "Logos/Momodora Logo 2.jpg", rota: "jogos/momodora/", source: "static" },
    { id: 7, titulo: "Knights of Pen and Paper II", desenvolvedor: "Behold Studios", genero: "RPG", avaliacao: 4.3, status: "lancado", logo: "Logos/Knights Logo.jpeg", rota: "jogos/knights/", source: "static" },
    { id: 8, titulo: "Chroma Squad", desenvolvedor: "Behold Studios", genero: "Estratégia", avaliacao: 4.8, status: "lancado", logo: "Logos/Chroma Squad Logo.jpg", rota: "jogos/chroma-squad/", source: "static" },
    { id: 9, titulo: "Mark of the Deep", desenvolvedor: "Mad Mimic", genero: "Aventura", avaliacao: 4.5, status: "lancado", logo: "Logos/Mark of the Deep Logo.jpg", rota: "jogos/mark-of-the-deep/", source: "static" },
    { id: 10, titulo: "Tupi: The Legend of Arariboia", desenvolvedor: "Tupi Dev", genero: "Ação", avaliacao: 4.7, status: "desenvolvimento", logo: "Logos/Tupi Logo.jpg", rota: "jogos/tupi/", source: "static" },
    { id: 11, titulo: "171", desenvolvedor: "Cezar Carvalho", genero: "Ação", avaliacao: 4.7, status: "lancado", logo: "Logos/171 Logo.jpg", rota: "jogos/171/", source: "static" },
    { id: 12, titulo: "Sina", desenvolvedor: "Estúdio Sina", genero: "Aventura", avaliacao: 4.6, status: "desenvolvimento", logo: "Logos/Sina Logo.jpeg", rota: "jogos/sina/", source: "static" },
    { id: 13, titulo: "9Kings", desenvolvedor: "Pineapple Works", genero: "RPG", avaliacao: 4.4, status: "lancado", logo: "Logos/9kings Logo.jpg", rota: "InfoJogos/9kings/9kings.html", source: "static" },
    { id: 14, titulo: "Gaúcho and the Grassland", desenvolvedor: "Objectively Fun", genero: "Casual", avaliacao: 4.8, status: "lancado", logo: "Logos/Gaucho Logo.jpg", rota: "jogos/gaucho/", source: "static" },
    { id: 15, titulo: "Pipistrello and the Cursed Yoyo", desenvolvedor: "Two Bits Kid", genero: "Plataforma", avaliacao: 4.5, status: "lancado", logo: "Logos/Pipi Logo.jpg", rota: "jogos/pipistrello/", source: "static" },
    { id: 16, titulo: "No Heroes Here", desenvolvedor: "Angular Wheels", genero: "Plataforma", avaliacao: 4.7, status: "lancado", logo: "Logos/No Heroes Here.jpg", rota: "jogos/no-heroes-here/", source: "static" },
    { id: 17, titulo: "Dragon Khan", desenvolvedor: "Brainbox Games", genero: "RPG", avaliacao: 4.9, status: "desenvolvimento", logo: "Logos/Dragon Khan Logo.jpg", rota: "jogos/dragon-khan/", source: "static" },
    { id: 18, titulo: "99 Vidas", desenvolvedor: "QUByte Interactive", genero: "Arcade", avaliacao: 4.3, status: "lancado", logo: "Logos/99 Vidas Logo.jpeg", rota: "jogos/99-vidas/", source: "static" },
    { id: 19, titulo: "Dandy Ace", desenvolvedor: "Mad Mimic", genero: "Roguelike", avaliacao: 4.8, status: "lancado", logo: "Logos/Dandy Ace Logo.jpeg", rota: "jogos/dandy-ace/", source: "static" },
    { id: 20, titulo: "Mombo Combo Legacy", desenvolvedor: "Mombo Studio", genero: "Ação", avaliacao: 4.6, status: "desenvolvimento", logo: "Logos/Mombo Logo.jpeg", rota: "jogos/mombo-combo/", source: "static" },
];

// =================== ESTADO ===================
let favoritosIds = JSON.parse(localStorage.getItem('velora_favoritos_ids') || '[]');
let jogosAPI = [];
let jogosJSON = [];
let filtroAtivo = 'todos';
let ordemAtiva = 'recentes';
let buscaAtiva = '';
let idParaRemover = null;

// =================== PERSISTÊNCIA ===================
function salvar() {
    localStorage.setItem('velora_favoritos_ids', JSON.stringify(favoritosIds));
}

// =================== API ===================
async function carregarJogosAPI() {
    try {
        const res = await fetch(`${API_BASE}/api/games`);
        const data = await res.json();

        jogosAPI = (data.games || []).map(game => ({
        id: game.id,
        titulo: game.title,
        desenvolvedor: "Desenvolvedor independente",
        genero: game.genre || "Sem gênero",
        avaliacao: parseFloat(game.rating || 0),
        status: game.status === "released" || game.status === "published"
        ? "lancado"
        : "desenvolvimento",

        logo: game.cover_image || "",
    
        rota: `Game.html?id=${game.id}`,

        source: "api"
    }));
    } catch (err) {
        console.error("Erro ao carregar jogos da API:", err);
        jogosAPI = [];
    }
}
async function carregarJogosJSON() {
    try {
        const res = await fetch("Game.json");
        const games = await res.json();

        jogosJSON = games.map(game => ({
            id: game.id,
            titulo: game.title,
            desenvolvedor: "Desenvolvedor Velora",
            genero: game.genre || "Sem gênero",
            avaliacao: parseFloat(game.rating || 0),
            status: "desenvolvimento",
            logo: game.image || "",
            rota: game.page ? game.page : `Game.html?id=${game.id}`,
            source: "json"
        }));
    } catch (err) {
        console.error("Erro ao carregar Game.json:", err);
        jogosJSON = [];
    }
}
// =================== HELPERS ===================
function getJogoKey(jogo) {
    return `${jogo.source}:${jogo.id}`;
}

function getTodosJogosUnificados() {
    return [...TODOS_JOGOS, ...jogosAPI, ...jogosJSON];
}

// =================== LISTA FILTRADA ===================
function getLista() {
    const todos = getTodosJogosUnificados();

    let lista = todos.filter(j => {
        const key = getJogoKey(j);

        return favoritosIds.includes(key);
    });

    // remove duplicados pelo título
    const vistos = new Set();

    lista = lista.filter(jogo => {
        const chave = jogo.titulo.toLowerCase().trim();

        if (vistos.has(chave)) {
            return false;
        }

        vistos.add(chave);
        return true;
    });

    if (filtroAtivo !== 'todos') {
        lista = lista.filter(j => j.status === filtroAtivo);
    }

    if (buscaAtiva) {
        lista = lista.filter(j =>
            j.titulo.toLowerCase().includes(buscaAtiva) ||
            j.desenvolvedor.toLowerCase().includes(buscaAtiva) ||
            j.genero.toLowerCase().includes(buscaAtiva)
        );
    }

    switch (ordemAtiva) {
        case 'rating':
            lista.sort((a, b) => b.avaliacao - a.avaliacao);
            break;

        case 'az':
            lista.sort((a, b) => a.titulo.localeCompare(b.titulo));
            break;

        case 'za':
            lista.sort((a, b) => b.titulo.localeCompare(a.titulo));
            break;

        default:
            lista.sort((a, b) =>
                favoritosIds.lastIndexOf(getJogoKey(b)) -
                favoritosIds.lastIndexOf(getJogoKey(a))
            );
    }

    return lista;
}

// =================== RENDERIZAR ===================
function renderizar() {
    const grid = document.getElementById('favGrid');
    const emptyState = document.getElementById('emptyState');
    const noResults = document.getElementById('noResults');
    const favCount = document.getElementById('favCount');

    const semFavs = favoritosIds.length === 0;
    const lista = getLista();
    const semResultado = lista.length === 0 && !semFavs;

    favCount.textContent = `${favoritosIds.length} jogo${favoritosIds.length !== 1 ? 's' : ''}`;

    emptyState.style.display = semFavs ? 'flex' : 'none';
    noResults.style.display = semResultado ? 'flex' : 'none';
    grid.style.display = (!semFavs && !semResultado) ? 'grid' : 'none';

    if (semFavs || semResultado) return;

    grid.innerHTML = lista.map((jogo, i) => {
        const statusLabel = jogo.status === 'lancado' ? 'Lançado' : 'Em Dev';
        const jogoKey = getJogoKey(jogo);

        return `
        <div class="game-card" data-id="${jogoKey}" data-rota="${jogo.rota}"
             style="animation-delay:${i * 40}ms">
            <div class="game-image">
                <img src="${jogo.logo}" alt="${jogo.titulo}" class="game-logo"
                    onerror="this.style.display='none';this.nextElementSibling.style.display='flex'">
                <div class="game-img-placeholder" style="display:none;">
                    <i class="fas fa-gamepad"></i>
                    <span>${jogo.titulo}</span>
                </div>
                <span class="status-badge ${jogo.status}">${statusLabel}</span>
                <button class="favorite-btn favorited" data-id="${jogoKey}" title="Remover dos favoritos">
                    <i class="fas fa-heart"></i>
                </button>
            </div>
            <div class="game-info">
                <h3 class="game-title">${jogo.titulo}</h3>
                <div class="game-meta">
                    <span class="game-genre">${jogo.genero}</span>
                    <span class="game-rating">
                        <i class="fas fa-star"></i> ${Number(jogo.avaliacao).toFixed(1)}
                    </span>
                </div>
            </div>
        </div>`;
    }).join('');

    bindCards();
}

// =================== EVENTOS DOS CARDS ===================
function bindCards() {
    document.querySelectorAll('.game-card').forEach(card => {
        card.addEventListener('click', (e) => {
            if (e.target.closest('.favorite-btn')) return;

            const rota = card.dataset.rota;
            if (rota && rota !== "#") {
                window.location.href = rota;
            }
        });
    });

    document.querySelectorAll('.favorite-btn').forEach(btn => {
        btn.addEventListener('click', (e) => {
            e.stopPropagation();
            idParaRemover = btn.dataset.id;

            const jogo = getTodosJogosUnificados().find(j => getJogoKey(j) === idParaRemover);

            document.getElementById('confirmText').textContent =
                `Tem certeza que deseja remover "${jogo?.titulo || 'este jogo'}" dos seus favoritos?`;

            abrirModal('confirmModal');

            btn.style.transform = 'scale(1.3)';
            setTimeout(() => btn.style.transform = '', 200);
        });
    });
}

// =================== REMOVER FAVORITO ===================
function remover(id) {
    favoritosIds = favoritosIds.filter(f => f !== id);
    salvar();
    renderizar();
    showToast('Removido dos favoritos');
}

// =================== MODAIS ===================
function abrirModal(id) { document.getElementById(id).classList.add('active'); }
function fecharModal(id) { document.getElementById(id).classList.remove('active'); }

document.getElementById('btnConfirmar').addEventListener('click', () => {
    if (idParaRemover !== null) remover(idParaRemover);
    idParaRemover = null;
    fecharModal('confirmModal');
});

document.getElementById('btnCancelar').addEventListener('click', () => fecharModal('confirmModal'));
document.getElementById('closeConfirm').addEventListener('click', () => fecharModal('confirmModal'));

document.getElementById('confirmModal').addEventListener('click', (e) => {
    if (e.target === document.getElementById('confirmModal')) fecharModal('confirmModal');
});

document.getElementById('btnLimparTudo').addEventListener('click', () => {
    if (favoritosIds.length > 0) abrirModal('clearAllModal');
});

document.getElementById('btnConfirmarClear').addEventListener('click', () => {
    favoritosIds = [];
    salvar();
    renderizar();
    fecharModal('clearAllModal');
    showToast('Lista de favoritos limpa');
});

document.getElementById('btnCancelarClear').addEventListener('click', () => fecharModal('clearAllModal'));
document.getElementById('closeClearAll').addEventListener('click', () => fecharModal('clearAllModal'));

document.getElementById('clearAllModal').addEventListener('click', (e) => {
    if (e.target === document.getElementById('clearAllModal')) fecharModal('clearAllModal');
});

document.addEventListener('keydown', (e) => {
    if (e.key === 'Escape') {
        fecharModal('confirmModal');
        fecharModal('clearAllModal');
    }
});

// =================== BUSCA ===================
document.getElementById('searchInput').addEventListener('input', (e) => {
    buscaAtiva = e.target.value.toLowerCase().trim();
    renderizar();
});

// =================== FILTROS RÁPIDOS ===================
document.querySelectorAll('.qf-btn').forEach(btn => {
    btn.addEventListener('click', () => {
        document.querySelectorAll('.qf-btn').forEach(b => b.classList.remove('active'));
        btn.classList.add('active');
        filtroAtivo = btn.dataset.filter;
        renderizar();
    });
});

// =================== ORDENAÇÃO ===================
document.getElementById('sortSelect').addEventListener('change', (e) => {
    ordemAtiva = e.target.value;
    renderizar();
});

// =================== DROPDOWN DO USUÁRIO ===================
const userProfile = document.getElementById('userProfile');
const userDropdown = document.getElementById('userDropdown');

if (userProfile && userDropdown) {
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

    userDropdown.addEventListener('click', (e) => e.stopPropagation());

    document.getElementById('dropMeuPerfil')?.addEventListener('click', () => {
        let user = null;
        try { user = JSON.parse(localStorage.getItem('velora_user')); } catch (e) {}

        if (!user) window.location.href = 'LoginCadastro.html';
        else if (user.account_type === 'developer') window.location.href = 'PerfilDev.html';
        else window.location.href = 'PerfilUsuario.html';
    });

    document.getElementById('dropSuporte')?.addEventListener('click', () => {
        window.location.href = 'SuporteUsuario.html';
    });

    document.getElementById('dropSair')?.addEventListener('click', () => {
        localStorage.removeItem('velora_user');
        window.location.href = 'LoginCadastro.html';
    });
}

// =================== LOGO HEADER ===================
document.getElementById('header-logo')?.addEventListener('error', function () {
    this.style.display = 'none';
});

// =================== TOAST ===================
function showToast(msg) {
    document.querySelector('.velora-toast')?.remove();

    const t = document.createElement('div');
    t.className = 'velora-toast';
    t.textContent = msg;

    t.style.cssText = `
        position:fixed; bottom:32px; left:50%;
        transform:translateX(-50%) translateY(20px);
        background:rgba(212,175,55,0.12); border:1px solid rgba(212,175,55,0.3);
        color:#d4af37; padding:14px 24px; border-radius:10px;
        font-family:'Inter',sans-serif; font-size:14px; font-weight:500;
        backdrop-filter:blur(12px); z-index:9999; opacity:0;
        transition:all .4s cubic-bezier(.34,1.56,.64,1);
        white-space:nowrap; box-shadow:0 8px 24px rgba(0,0,0,.4);
        pointer-events:none;`;

    document.body.appendChild(t);

    requestAnimationFrame(() => {
        t.style.opacity = '1';
        t.style.transform = 'translateX(-50%) translateY(0)';
    });

    setTimeout(() => {
        t.style.opacity = '0';
        t.style.transform = 'translateX(-50%) translateY(10px)';
        setTimeout(() => t.remove(), 400);
    }, 2800);
}

// =================== INICIALIZAÇÃO ===================
async function init() {
    await carregarJogosAPI();
    await carregarJogosJSON();
    renderizar();
}
function getCatalogoCorreto() {
    return "Catalogo.html";
}

const catalogoCorreto = getCatalogoCorreto();

document.getElementById("linkInicio")?.addEventListener("click", (e) => {
    e.preventDefault();
    window.location.href = catalogoCorreto;
});

document.getElementById("btnExplorarCatalogo")?.addEventListener("click", (e) => {
    e.preventDefault();
    window.location.href = catalogoCorreto;
});

init();