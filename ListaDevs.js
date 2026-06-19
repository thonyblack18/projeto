const API_BASE = "https://projeto-w9ao.onrender.com";
// =================== CANVAS DE PARTÍCULAS ===================
const canvas = document.getElementById('particles');
if (canvas) {
    const ctx = canvas.getContext('2d');

    function resizeCanvas() {
        canvas.width = window.innerWidth;
        canvas.height = window.innerHeight;
    }

    resizeCanvas();

    class Star {
        constructor() { this.reset(true); }
        reset(init) {
            this.x = init ? Math.random() * canvas.width : -50;
            this.y = Math.random() * canvas.height;
            this.size = Math.random() * 1.8 + 0.4;
            this.speedX = Math.random() * 0.7 + 0.3;
            this.opacity = Math.random() * 0.5 + 0.3;
            this.twinkleSpeed = Math.random() * 0.025 + 0.008;
            this.twinklePhase = Math.random() * Math.PI * 2;
        }
        update() {
            this.x += this.speedX;
            this.twinklePhase += this.twinkleSpeed;
            this.currentOpacity = Math.max(0, this.opacity + Math.sin(this.twinklePhase) * 0.28);
            if (this.x > canvas.width + 50) this.reset(false);
        }
        draw() {
            ctx.fillStyle = `rgba(255, 255, 255, ${this.currentOpacity})`;
            ctx.beginPath();
            ctx.arc(this.x, this.y, this.size, 0, Math.PI * 2);
            ctx.fill();
        }
    }

    const stars = Array.from({ length: 140 }, () => new Star());

    function animateStars() {
        ctx.clearRect(0, 0, canvas.width, canvas.height);
        stars.forEach(star => { star.update(); star.draw(); });
        requestAnimationFrame(animateStars);
    }

    animateStars();
    window.addEventListener('resize', resizeCanvas);
}

// =================== LOGO FALLBACK ===================
function setupLogoFallback(imgId, placeholderId) {
    const img = document.getElementById(imgId);
    const placeholder = document.getElementById(placeholderId);
    if (!img || !placeholder) return;

    img.addEventListener('error', () => {
        img.style.display = 'none';
        placeholder.style.display = 'flex';
    });

    if (img.complete && img.naturalWidth === 0) {
        img.style.display = 'none';
        placeholder.style.display = 'flex';
    }
}

setupLogoFallback('header-logo', 'logo-placeholder');
setupLogoFallback('footer-logo', 'footer-logo-placeholder');

/* ============================================
   ListaDevs.js — Velora
   ============================================ */

// ===== DADOS DOS DEVS (rascunho — backend substituirá por API) =====
// BACKEND: GET /api/developers?page=1&limit=20&filter=all
// Campos: id, name, handle, bio, avatar_color, badges[], games, followers, since

let DEVS = [];

async function carregarDevsAPI() {
    try {
        const res = await fetch(`${API_BASE}/api/developers`);
        const data = await res.json();

        DEVS = (data.developers || []).map(dev => {
            const nome =
                dev.dev_display_name ||
                dev.display_name ||
                dev.name ||
                "Desenvolvedor";

            return {
                id: dev.id,
                name: nome,
                handle: `@${dev.username || "dev"}`,
                bio: dev.studio_description || "Desenvolvedor da plataforma Velora.",
                avatar_url: dev.avatar_url,
                initial: nome.charAt(0).toUpperCase(),
                badges: dev.review_status === "approved"
                    ? ["verified", "indie"]
                    : ["indie"],
                games: dev.games_count || 0,
                followers: 0,
                since: dev.foundation_year || "2026",
                social: { itch: false, github: false, twitter: false }
            };
        });

        renderDevs();

    } catch (err) {
        console.error("Erro ao carregar devs:", err);
        DEVS = [];
        renderDevs();
    }
}

// ===== ESTADO =====
let currentFilter = 'all';
let searchQuery   = '';

// ===== RENDER =====
function renderDevs() {
    const grid = document.getElementById('devsGrid');

    let list = [...DEVS];

    // Filtro por aba
    if (currentFilter === 'verified') list = list.filter(d => d.badges.includes('verified'));
    if (currentFilter === 'new')      list = list.filter(d => d.badges.includes('new'));

    // Busca
    if (searchQuery.trim()) {
        const q = searchQuery.toLowerCase();
        list = list.filter(d =>
            d.name.toLowerCase().includes(q) ||
            d.handle.toLowerCase().includes(q) ||
            d.bio.toLowerCase().includes(q)
        );
    }

    grid.innerHTML = '';

    if (list.length === 0) {
        grid.innerHTML = `
            <div class="empty-state">
                <i class="fas fa-satellite-dish"></i>
                <p>Nenhum desenvolvedor encontrado</p>
            </div>`;
        return;
    }

    list.forEach((dev, idx) => {
        const card = document.createElement('div');
        card.className = 'dev-card';
        card.style.animationDelay = `${idx * 45}ms`;

        const badgeHTML = dev.badges.map(b => {
            if (b === 'verified') return `<span class="badge badge-verified"><i class="fas fa-check-circle"></i> Verificado</span>`;
            if (b === 'new')      return `<span class="badge badge-new"><i class="fas fa-bolt"></i> Novo</span>`;
            if (b === 'indie')    return `<span class="badge badge-indie"><i class="fas fa-gamepad"></i> Indie</span>`;
            return '';
        }).join('');

        const socialHTML = [
            dev.social.itch    ? `<span class="social-btn" title="itch.io"><i class="fas fa-gamepad"></i></span>` : '',
            dev.social.github  ? `<span class="social-btn" title="GitHub"><i class="fab fa-github"></i></span>` : '',
            dev.social.twitter ? `<span class="social-btn" title="Twitter/X"><i class="fab fa-twitter"></i></span>` : '',
        ].join('');

        card.innerHTML = `
            <div class="dev-card-top">
                <div class="dev-avatar" style="background: linear-gradient(135deg, ${dev.avatarColor[0]}, ${dev.avatarColor[1]})">${dev.initial}</div>
                <div class="dev-info">
                    <div class="dev-name">${dev.name}</div>
                    <div class="dev-handle">${dev.handle}</div>
                    <div class="dev-badges">${badgeHTML}</div>
                </div>
            </div>
            <p class="dev-bio">${dev.bio}</p>
            <div class="dev-stats">
                <div class="dev-stat">
                    <span class="dev-stat-val gold">${dev.games}</span>
                    <span class="dev-stat-label">Jogos</span>
                </div>
                <div class="dev-stat">
                    <span class="dev-stat-val">${dev.followers}</span>
                    <span class="dev-stat-label">Seguidores</span>
                </div>
                <div class="dev-stat">
                    <span class="dev-stat-val">${dev.since}</span>
                    <span class="dev-stat-label">Desde</span>
                </div>
            </div>
            <div class="dev-card-footer">
                <span class="dev-since"><i class="fas fa-rocket"></i> Membro desde ${dev.since}</span>
                <div class="dev-social">${socialHTML}</div>
            </div>`;

        grid.appendChild(card);
    });
}

// ===== EVENTOS =====
document.getElementById('searchInput').addEventListener('input', e => {
    searchQuery = e.target.value;
    renderDevs();
});

document.getElementById('filterTabs').addEventListener('click', e => {
    const tab = e.target.closest('.filter-tab');
    if (!tab) return;
    document.querySelectorAll('.filter-tab').forEach(t => t.classList.remove('active'));
    tab.classList.add('active');
    currentFilter = tab.dataset.filter;
    renderDevs();
});

// ===== DROPDOWN =====
(function() {
    const userProfile  = document.getElementById('userProfile');
    const userDropdown = document.getElementById('userDropdown');
    const nameEl       = document.getElementById('userName');
    const initialEl    = document.getElementById('userAvatarInitial');
    const avatarImg = document.getElementById('headerUserAvatar');
    try {
    const u = JSON.parse(localStorage.getItem('velora_user'));

    if (u && nameEl) {
        nameEl.textContent =
            u.account_type === 'developer'
            ? 'Desenvolvedor'
            : 'Jogador';
    }

    if (u?.profile_photo && avatarImg && initialEl) {
        avatarImg.src = u.profile_photo;
        avatarImg.style.display = 'block';
        initialEl.style.display = 'none';
    } else if (u && initialEl) {
        const nome = u.display_name || u.name || u.username || 'J';

        initialEl.textContent = nome.charAt(0).toUpperCase();
        initialEl.style.display = 'flex';

        if (avatarImg) {
            avatarImg.src = '';
            avatarImg.style.display = 'none';
        }
    }

} catch(e) {}

    userProfile?.addEventListener('click', ev => {
        ev.stopPropagation();
        userDropdown.classList.toggle('active');
        userProfile.classList.toggle('active');
    });
    document.addEventListener('click', () => {
        userDropdown.classList.remove('active');
        userProfile.classList.remove('active');
    });
    userDropdown?.addEventListener('click', ev => ev.stopPropagation());
    document.getElementById('dropMeuPerfil')?.addEventListener('click', () => {
        let u = null;
        try { u = JSON.parse(localStorage.getItem('velora_user')); } catch(e) {}
        if (!u) { window.location.href = 'LoginCadastro.html'; return; }
        window.location.href = u.account_type === 'developer' ? 'PerfilDev.html' : 'PerfilUsuario.html';
    });
    document.getElementById('dropSair')?.addEventListener('click', () => {
        localStorage.removeItem('velora_user');
        window.location.href = 'LoginCadastro.html';
    });
})();

// ===== INIT =====
carregarDevsAPI();
console.log('👨‍💻 Lista de Devs — Velora carregada!');

// =================== MENU MOBILE PADRÃO DANDARA ===================
const mobileMenuBtn = document.getElementById("mobileMenuBtn");
const mainNav = document.querySelector(".main-nav");

mobileMenuBtn?.addEventListener("click", (e) => {
    e.stopPropagation();
    mainNav?.classList.toggle("active");
});

mainNav?.addEventListener("click", (e) => {
    e.stopPropagation();
});

document.addEventListener("click", () => {
    mainNav?.classList.remove("active");
});

// =================== ATALHO FAVORITOS ===================
document.getElementById("btnFavoritos")?.addEventListener("click", () => {
    window.location.href = "ListaFavoritos.html";
});
