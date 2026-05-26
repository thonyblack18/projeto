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

const DEVS = [
    {
        id: 1,  name: 'Dev1',  handle: '@dev1',
        bio: 'Desenvolvedor indie apaixonado por jogos de ação e aventura. Criando experiências únicas para jogadores brasileiros.',
        avatarColor: ['#d4af37','#f4d03f'], initial: 'D1',
        badges: ['verified','indie'],
        games: 3, followers: 142, since: '2024',
        social: { itch: true, github: true, twitter: false },
    },
    {
        id: 2,  name: 'Dev2',  handle: '@dev2',
        bio: 'Especialista em jogos de plataforma 2D. Fã de pixel art e trilhas sonoras chiptune.',
        avatarColor: ['#7c3aed','#a78bfa'], initial: 'D2',
        badges: ['indie'],
        games: 1, followers: 58, since: '2025',
        social: { itch: true, github: false, twitter: true },
    },
    {
        id: 3,  name: 'Dev3',  handle: '@dev3',
        bio: 'Game designer focado em narrativas interativas e RPGs brasileiros. Contando histórias do nosso povo.',
        avatarColor: ['#0f766e','#2dd4bf'], initial: 'D3',
        badges: ['verified','new'],
        games: 2, followers: 203, since: '2025',
        social: { itch: true, github: true, twitter: true },
    },
    {
        id: 4,  name: 'Dev4',  handle: '@dev4',
        bio: 'Programador full-stack que virou indie dev. Criando jogos de puzzle e lógica nas horas vagas.',
        avatarColor: ['#b45309','#fbbf24'], initial: 'D4',
        badges: ['indie'],
        games: 4, followers: 317, since: '2024',
        social: { itch: true, github: true, twitter: false },
    },
    {
        id: 5,  name: 'Dev5',  handle: '@dev5',
        bio: 'Artista e desenvolvedor. Minha especialidade é criar atmosferas visuais marcantes em jogos de horror.',
        avatarColor: ['#9f1239','#f43f5e'], initial: 'D5',
        badges: ['verified'],
        games: 2, followers: 489, since: '2023',
        social: { itch: true, github: false, twitter: true },
    },
    {
        id: 6,  name: 'Dev6',  handle: '@dev6',
        bio: 'Desenvolvendo jogos mobile com foco na acessibilidade. Todo brasileiro merece jogar.',
        avatarColor: ['#155e75','#22d3ee'], initial: 'D6',
        badges: ['new'],
        games: 1, followers: 24, since: '2026',
        social: { itch: true, github: true, twitter: false },
    },
    {
        id: 7,  name: 'Dev7',  handle: '@dev7',
        bio: 'Três anos criando jogos de estratégia e tower defense. Inspirado nos clássicos dos anos 2000.',
        avatarColor: ['#064e3b','#34d399'], initial: 'D7',
        badges: ['verified','indie'],
        games: 5, followers: 621, since: '2023',
        social: { itch: true, github: true, twitter: true },
    },
    {
        id: 8,  name: 'Dev8',  handle: '@dev8',
        bio: 'Compositor e dev. Faço a música e o código dos meus jogos. Ritmo e gameplay em harmonia.',
        avatarColor: ['#4c1d95','#8b5cf6'], initial: 'D8',
        badges: ['indie'],
        games: 2, followers: 178, since: '2024',
        social: { itch: false, github: true, twitter: true },
    },
    {
        id: 9,  name: 'Dev9',  handle: '@dev9',
        bio: 'Estudante de ciências da computação fazendo seu primeiro jogo. Aprendendo e criando ao mesmo tempo.',
        avatarColor: ['#1e3a5f','#60a5fa'], initial: 'D9',
        badges: ['new'],
        games: 1, followers: 11, since: '2026',
        social: { itch: true, github: true, twitter: false },
    },
    {
        id: 10, name: 'Dev10', handle: '@dev10',
        bio: 'Veterano da cena indie brasileira. Já lançou mais de meia dúzia de jogos e não vai parar.',
        avatarColor: ['#92400e','#d97706'], initial: 'DX',
        badges: ['verified','indie'],
        games: 7, followers: 1204, since: '2022',
        social: { itch: true, github: true, twitter: true },
    },
    {
        id: 11, name: 'Dev11', handle: '@dev11',
        bio: 'Apaixonado por roguelikes e dungeon crawlers. Cada run deve ser uma experiência nova.',
        avatarColor: ['#1a1a2e','#e94560'], initial: 'D1',
        badges: ['indie'],
        games: 2, followers: 267, since: '2024',
        social: { itch: true, github: false, twitter: true },
    },
    {
        id: 12, name: 'Dev12', handle: '@dev12',
        bio: 'Designer UI/UX que decidiu criar seus próprios jogos. Interface bonita é metade da experiência.',
        avatarColor: ['#134e4a','#5eead4'], initial: 'D2',
        badges: ['new','indie'],
        games: 1, followers: 89, since: '2025',
        social: { itch: true, github: true, twitter: false },
    },
    {
        id: 13, name: 'Dev13', handle: '@dev13',
        bio: 'Criador de jogos educativos com temática brasileira. Games que ensinam e divertem.',
        avatarColor: ['#14532d','#86efac'], initial: 'D3',
        badges: ['verified'],
        games: 3, followers: 433, since: '2023',
        social: { itch: true, github: false, twitter: true },
    },
    {
        id: 14, name: 'Dev14', handle: '@dev14',
        bio: 'Faz jogos de corrida e velocidade. Cada pixel conta quando você está na linha de chegada.',
        avatarColor: ['#7f1d1d','#fca5a5'], initial: 'D4',
        badges: ['indie'],
        games: 2, followers: 154, since: '2024',
        social: { itch: false, github: true, twitter: true },
    },
    {
        id: 15, name: 'Dev15', handle: '@dev15',
        bio: 'Dev que migrou do mobile para PC. Explorando mecânicas de física e simulação em jogos indie.',
        avatarColor: ['#312e81','#818cf8'], initial: 'D5',
        badges: ['new'],
        games: 1, followers: 37, since: '2026',
        social: { itch: true, github: true, twitter: false },
    },
    {
        id: 16, name: 'Dev16', handle: '@dev16',
        bio: 'Especialista em jogos de esportes brasileiros. Futebol, vôlei, capoeira — tudo em pixel art.',
        avatarColor: ['#065f46','#6ee7b7'], initial: 'D6',
        badges: ['verified','indie'],
        games: 4, followers: 782, since: '2023',
        social: { itch: true, github: true, twitter: true },
    },
    {
        id: 17, name: 'Dev17', handle: '@dev17',
        bio: 'Narrativa e lore são o coração dos meus jogos. Construindo universos ficcionais brasileiros.',
        avatarColor: ['#4a044e','#e879f9'], initial: 'D7',
        badges: ['indie'],
        games: 2, followers: 341, since: '2024',
        social: { itch: true, github: false, twitter: true },
    },
    {
        id: 18, name: 'Dev18', handle: '@dev18',
        bio: 'Hackathon enthusiast. Já criou 5 protótipos em game jams e está transformando um em produto.',
        avatarColor: ['#1e3a5f','#38bdf8'], initial: 'D8',
        badges: ['new'],
        games: 1, followers: 62, since: '2025',
        social: { itch: true, github: true, twitter: true },
    },
    {
        id: 19, name: 'Dev19', handle: '@dev19',
        bio: 'Focado em horror psicológico e suspense. Jogos que ficam na cabeça depois que você fecha o PC.',
        avatarColor: ['#1c1917','#a8a29e'], initial: 'D9',
        badges: ['verified'],
        games: 3, followers: 918, since: '2023',
        social: { itch: true, github: false, twitter: true },
    },
    {
        id: 20, name: 'Dev20', handle: '@dev20',
        bio: 'O mais novo da lista, mas não menos talentoso. Primeiro jogo em desenvolvimento — fique de olho!',
        avatarColor: ['#713f12','#fde68a'], initial: 'D0',
        badges: ['new'],
        games: 0, followers: 8, since: '2026',
        social: { itch: false, github: true, twitter: false },
    },
];

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
    try {
        const u = JSON.parse(localStorage.getItem('velora_user'));
        if (u && nameEl)    nameEl.textContent    = u.name || 'Jogador';
        if (u && initialEl) initialEl.textContent = (u.name || 'J')[0].toUpperCase();
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
renderDevs();
console.log('👨‍💻 Lista de Devs — Velora carregada!');
