const API_BASE = "https://projeto-w9ao.onrender.com";

// =================== ESTADO ===================
let favoritosIds = JSON.parse(localStorage.getItem("velora_favoritos_ids") || "[]");
let jogosAPI = [];
let filtroAtivo = "todos";
let ordemAtiva = "recentes";
let buscaAtiva = "";
let idParaRemover = null;

// =================== PERSISTÊNCIA ===================
function salvar() {
    localStorage.setItem("velora_favoritos_ids", JSON.stringify(favoritosIds));
}

// =================== API ===================
async function carregarJogosAPI() {
    try {
        const res = await fetch(`${API_BASE}/api/games`);
        const data = await res.json();

        jogosAPI = (data.games || []).map(game => ({
            id: game.id,
            titulo: game.title,
            desenvolvedor: game.developer_name || "Desenvolvedor independente",
            genero: game.genre || "Sem gênero",
            avaliacao: parseFloat(game.rating || 0),
            status: game.status === "released" || game.status === "published"
                ? "lancado"
                : "desenvolvimento",
            logo: game.cover_url ? `${API_BASE}/${game.cover_url}` : "",
            rota: `Game.html?id=${game.id}`,
            source: "api"
        }));
    } catch (err) {
        console.error("Erro ao carregar jogos da API:", err);
        jogosAPI = [];
    }
}

// =================== HELPERS ===================
function getJogoKey(jogo) {
    return `api:${jogo.id}`;
}

function getLista() {
    let lista = jogosAPI.filter(jogo => favoritosIds.includes(getJogoKey(jogo)));

    if (filtroAtivo !== "todos") {
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
        case "rating":
            lista.sort((a, b) => b.avaliacao - a.avaliacao);
            break;
        case "az":
            lista.sort((a, b) => a.titulo.localeCompare(b.titulo));
            break;
        case "za":
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
    const grid = document.getElementById("favGrid");
    const emptyState = document.getElementById("emptyState");
    const noResults = document.getElementById("noResults");
    const favCount = document.getElementById("favCount");

    const lista = getLista();
    const semFavs = favoritosIds.length === 0;
    const semResultado = lista.length === 0 && !semFavs;

    favCount.textContent = `${lista.length} jogo${lista.length !== 1 ? "s" : ""}`;

    emptyState.style.display = semFavs ? "flex" : "none";
    noResults.style.display = semResultado ? "flex" : "none";
    grid.style.display = (!semFavs && !semResultado) ? "grid" : "none";

    if (semFavs || semResultado) return;

    grid.innerHTML = lista.map((jogo, i) => {
        const statusLabel = jogo.status === "lancado" ? "Lançado" : "Em Dev";
        const jogoKey = getJogoKey(jogo);

        return `
            <div class="game-card" data-id="${jogoKey}" data-rota="${jogo.rota}" style="animation-delay:${i * 40}ms">
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
            </div>
        `;
    }).join("");

    bindCards();
}

// =================== EVENTOS DOS CARDS ===================
function bindCards() {
    document.querySelectorAll(".game-card").forEach(card => {
        card.addEventListener("click", (e) => {
            if (e.target.closest(".favorite-btn")) return;

            const rota = card.dataset.rota;
            if (rota && rota !== "#") {
                window.location.href = rota;
            }
        });
    });

    document.querySelectorAll(".favorite-btn").forEach(btn => {
        btn.addEventListener("click", (e) => {
            e.stopPropagation();
            idParaRemover = btn.dataset.id;

            const jogo = jogosAPI.find(j => getJogoKey(j) === idParaRemover);

            document.getElementById("confirmText").textContent =
                `Tem certeza que deseja remover "${jogo?.titulo || "este jogo"}" dos seus favoritos?`;

            abrirModal("confirmModal");
        });
    });
}

// =================== REMOVER FAVORITO ===================
function remover(id) {
    favoritosIds = favoritosIds.filter(f => f !== id);
    salvar();
    renderizar();
    showToast("Removido dos favoritos");
}

// =================== MODAIS ===================
function abrirModal(id) {
    document.getElementById(id).classList.add("active");
}

function fecharModal(id) {
    document.getElementById(id).classList.remove("active");
}

document.getElementById("btnConfirmar")?.addEventListener("click", () => {
    if (idParaRemover !== null) remover(idParaRemover);
    idParaRemover = null;
    fecharModal("confirmModal");
});

document.getElementById("btnCancelar")?.addEventListener("click", () => fecharModal("confirmModal"));
document.getElementById("closeConfirm")?.addEventListener("click", () => fecharModal("confirmModal"));

document.getElementById("confirmModal")?.addEventListener("click", (e) => {
    if (e.target === document.getElementById("confirmModal")) fecharModal("confirmModal");
});

document.getElementById("btnLimparTudo")?.addEventListener("click", () => {
    if (favoritosIds.length > 0) abrirModal("clearAllModal");
});

document.getElementById("btnConfirmarClear")?.addEventListener("click", () => {
    favoritosIds = [];
    salvar();
    renderizar();
    fecharModal("clearAllModal");
    showToast("Lista de favoritos limpa");
});

document.getElementById("btnCancelarClear")?.addEventListener("click", () => fecharModal("clearAllModal"));
document.getElementById("closeClearAll")?.addEventListener("click", () => fecharModal("clearAllModal"));

document.getElementById("clearAllModal")?.addEventListener("click", (e) => {
    if (e.target === document.getElementById("clearAllModal")) fecharModal("clearAllModal");
});

document.addEventListener("keydown", (e) => {
    if (e.key === "Escape") {
        fecharModal("confirmModal");
        fecharModal("clearAllModal");
    }
});

// =================== BUSCA ===================
document.getElementById("searchInput")?.addEventListener("input", (e) => {
    buscaAtiva = e.target.value.toLowerCase().trim();
    renderizar();
});

// =================== FILTROS RÁPIDOS ===================
document.querySelectorAll(".qf-btn").forEach(btn => {
    btn.addEventListener("click", () => {
        document.querySelectorAll(".qf-btn").forEach(b => b.classList.remove("active"));
        btn.classList.add("active");
        filtroAtivo = btn.dataset.filter;
        renderizar();
    });
});

// =================== ORDENAÇÃO ===================
document.getElementById("sortSelect")?.addEventListener("change", (e) => {
    ordemAtiva = e.target.value;
    renderizar();
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

    userDropdown.addEventListener("click", (e) => e.stopPropagation());

    document.getElementById("dropMeuPerfil")?.addEventListener("click", () => {
        let user = null;

        try {
            user = JSON.parse(localStorage.getItem("velora_user"));
        } catch (e) {}

        if (!user) window.location.href = "LoginCadastro.html";
        else if (user.account_type === "developer") window.location.href = "PerfilDev.html";
        else window.location.href = "PerfilUsuario.html";
    });

    document.getElementById("dropSuporte")?.addEventListener("click", () => {
        window.location.href = "SuporteUsuario.html";
    });

    document.getElementById("dropSair")?.addEventListener("click", () => {
        localStorage.removeItem("velora_user");
        window.location.href = "LoginCadastro.html";
    });
}

// =================== LOGO HEADER ===================
document.getElementById("header-logo")?.addEventListener("error", function () {
    this.style.display = "none";
});

// =================== TOAST ===================
function showToast(msg) {
    document.querySelector(".velora-toast")?.remove();

    const t = document.createElement("div");
    t.className = "velora-toast";
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
        t.style.opacity = "1";
        t.style.transform = "translateX(-50%) translateY(0)";
    });

    setTimeout(() => {
        t.style.opacity = "0";
        t.style.transform = "translateX(-50%) translateY(10px)";
        setTimeout(() => t.remove(), 400);
    }, 2800);
}

// =================== INICIALIZAÇÃO ===================
async function init() {
    await carregarJogosAPI();
    renderizar();
}

document.getElementById("linkInicio")?.addEventListener("click", (e) => {
    e.preventDefault();
    window.location.href = "Catalogo.html";
});

document.getElementById("btnExplorarCatalogo")?.addEventListener("click", (e) => {
    e.preventDefault();
    window.location.href = "Catalogo.html";
});

carregarAvatarHeader();

init();