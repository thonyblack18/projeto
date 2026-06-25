/* ============================================
   FoguetinhoGame.js — Velora Minigame
   ============================================ */

const GRID     = 20;
const CELL     = 24;
const CANVAS_PX = GRID * CELL; // 480

const state = {
    rocket:     [],
    dir:        { x: 1, y: 0 },
    nextDir:    { x: 1, y: 0 },
    star:       null,
    score:      0,
    hiScore:    0,
    level:      1,
    stars:      0,
    speed:      150,
    baseSpeed:  150,
    running:    false,
    paused:     false,
    loop:       null,
    particles:  [],
    bgStars:    [],
    floatingTexts: [],
};

const canvas        = document.getElementById('gameCanvas');
const ctx           = canvas.getContext('2d');
const scoreDisplay  = document.getElementById('scoreDisplay');
const hiScoreDisplay= document.getElementById('hiScoreDisplay');
const levelDisplay  = document.getElementById('levelDisplay');
const speedDots     = document.getElementById('speedDots').querySelectorAll('.dot');
const pauseOverlay  = document.getElementById('pauseOverlay');
const pauseIcon     = document.getElementById('pauseIcon');
const pauseLabel    = document.getElementById('pauseLabel');
const screenStart   = document.getElementById('screenStart');
const screenGame    = document.getElementById('screenGame');
const screenOver    = document.getElementById('screenOver');

canvas.width  = CANVAS_PX;
canvas.height = CANVAS_PX;

// =================== ESTRELAS DE FUNDO DO CANVAS ===================
function initBgStars() {
    state.bgStars = [];
    for (let i = 0; i < 80; i++) {
        state.bgStars.push({
            x:       Math.random() * CANVAS_PX,
            y:       Math.random() * CANVAS_PX,
            r:       Math.random() * 1.8 + 0.4,
            opacity: Math.random() * 0.7 + 0.3,
            phase:   Math.random() * Math.PI * 2,
            speed:   Math.random() * 0.04 + 0.01,
        });
    }
}

// =================== INIT JOGO ===================
function initGame() {
    const mid = Math.floor(GRID / 2);
    state.rocket  = [
        { x: mid,     y: mid },
        { x: mid - 1, y: mid },
        { x: mid - 2, y: mid },
    ];
    state.dir      = { x: 1, y: 0 };
    state.nextDir  = { x: 1, y: 0 };
    state.score    = 0;
    state.stars    = 0;
    state.level    = 1;
    state.speed    = state.baseSpeed;
    state.running  = true;
    state.paused   = false;
    state.particles = [];
    state.floatingTexts = [];

    spawnStar();
    initBgStars();
    updateHUD();
    updateSpeedDots();
    startLoop();
}

// =================== ESTRELA ===================
function spawnStar() {
    let pos;
    do {
        pos = { x: Math.floor(Math.random() * GRID), y: Math.floor(Math.random() * GRID) };
    } while (state.rocket.some(s => s.x === pos.x && s.y === pos.y));
    state.star = pos;
}

// =================== LOOP ===================
function startLoop() {
    if (state.loop) clearInterval(state.loop);
    state.loop = setInterval(tick, state.speed);
}

function tick() {
    if (!state.running || state.paused) return;

    state.dir = { ...state.nextDir };

    const head    = state.rocket[0];
    const newHead = { x: head.x + state.dir.x, y: head.y + state.dir.y };

    // Colisão com parede
    if (newHead.x < 0 || newHead.x >= GRID || newHead.y < 0 || newHead.y >= GRID) {
        return gameOver();
    }
    // Colisão com o corpo
    if (state.rocket.slice(0, -1).some(s => s.x === newHead.x && s.y === newHead.y)) {
        return gameOver();
    }

    state.rocket.unshift(newHead);

    if (state.star && newHead.x === state.star.x && newHead.y === state.star.y) {
        // +10 pontos simples por estrela
        state.score += 10;
        state.stars++;

        // Texto flutuante "+10"
        spawnFloatingText(newHead.x, newHead.y, '+10');

        if (state.score > state.hiScore) {
            state.hiScore = state.score;
            localStorage.setItem('velora_foguetinho_hi', state.hiScore);
        }

        spawnParticles(newHead.x, newHead.y);
        spawnStar();

        // Sobe de nível a cada 5 estrelas
        if (state.stars % 5 === 0) levelUp();

    } else {
        state.rocket.pop();
    }

    updateParticles();
    updateFloatingTexts();
    draw();
    updateHUD();
}

// =================== LEVEL UP ===================
function levelUp() {
    state.level++;
    state.speed = Math.max(55, state.baseSpeed - (state.level - 1) * 15);
    startLoop();
    updateSpeedDots();
    flashCanvas();
}

function flashCanvas() {
    canvas.style.boxShadow = '0 0 60px rgba(212,175,55,0.8), inset 0 0 40px rgba(212,175,55,0.15)';
    setTimeout(() => {
        canvas.style.boxShadow = '0 0 40px rgba(212,175,55,0.18), inset 0 0 60px rgba(0,0,0,0.3)';
    }, 400);
}

// =================== HUD ===================
function updateHUD() {
    scoreDisplay.textContent   = state.score;
    hiScoreDisplay.textContent = state.hiScore;
    levelDisplay.textContent   = state.level;
}

function updateSpeedDots() {
    const active = Math.min(state.level, speedDots.length);
    speedDots.forEach((d, i) => d.classList.toggle('active', i < active));
}

// =================== PARTÍCULAS ===================
function spawnParticles(gx, gy) {
    const cx = gx * CELL + CELL / 2;
    const cy = gy * CELL + CELL / 2;
    for (let i = 0; i < 14; i++) {
        const angle = (Math.PI * 2 / 14) * i + Math.random() * 0.4;
        const spd   = 1.8 + Math.random() * 2.8;
        state.particles.push({
            x: cx, y: cy,
            vx: Math.cos(angle) * spd,
            vy: Math.sin(angle) * spd,
            life: 1, decay: 0.055 + Math.random() * 0.04,
            r: 2.5 + Math.random() * 3,
            color: Math.random() > 0.5 ? '#f4d03f' : '#ffffff',
        });
    }
}

function updateParticles() {
    state.particles = state.particles.filter(p => {
        p.x += p.vx; p.y += p.vy;
        p.vy += 0.06;
        p.life -= p.decay;
        return p.life > 0;
    });
}

// =================== TEXTO FLUTUANTE ===================
function spawnFloatingText(gx, gy, text) {
    state.floatingTexts.push({
        x: gx * CELL + CELL / 2,
        y: gy * CELL,
        text, life: 1, decay: 0.03,
    });
}

function updateFloatingTexts() {
    state.floatingTexts = state.floatingTexts.filter(t => {
        t.y -= 1.2; t.life -= t.decay;
        return t.life > 0;
    });
}

// =================== DESENHO ===================
function draw() {
    ctx.clearRect(0, 0, CANVAS_PX, CANVAS_PX);

    // Fundo — azul-escuro espacial (mais claro que antes)
    const bg = ctx.createRadialGradient(CANVAS_PX/2, CANVAS_PX/2, 0, CANVAS_PX/2, CANVAS_PX/2, CANVAS_PX*0.8);
    bg.addColorStop(0, '#0f1428');
    bg.addColorStop(0.6, '#0a0f20');
    bg.addColorStop(1, '#060810');
    ctx.fillStyle = bg;
    ctx.fillRect(0, 0, CANVAS_PX, CANVAS_PX);

    // Estrelas de fundo — mais brilhantes
    const now = Date.now() / 1000;
    state.bgStars.forEach(s => {
        const op = s.opacity + Math.sin(now * s.speed * 8 + s.phase) * 0.25;
        const clampedOp = Math.max(0.15, Math.min(1, op));
        // Halo dourado em algumas estrelas
        if (s.r > 1.4) {
            ctx.beginPath();
            ctx.arc(s.x, s.y, s.r + 2, 0, Math.PI * 2);
            ctx.fillStyle = `rgba(255, 240, 150, ${clampedOp * 0.2})`;
            ctx.fill();
        }
        ctx.beginPath();
        ctx.arc(s.x, s.y, s.r, 0, Math.PI * 2);
        ctx.fillStyle = `rgba(255, 255, 255, ${clampedOp})`;
        ctx.fill();
    });

    // Grade sutil
    ctx.strokeStyle = 'rgba(100, 130, 255, 0.06)';
    ctx.lineWidth = 1;
    for (let i = 0; i <= GRID; i++) {
        ctx.beginPath();
        ctx.moveTo(i * CELL, 0); ctx.lineTo(i * CELL, CANVAS_PX); ctx.stroke();
        ctx.beginPath();
        ctx.moveTo(0, i * CELL); ctx.lineTo(CANVAS_PX, i * CELL); ctx.stroke();
    }

    // =================== ESTRELA COLETÁVEL ===================
    if (state.star) {
        const cx = state.star.x * CELL + CELL / 2;
        const cy = state.star.y * CELL + CELL / 2;
        const pulse = Math.sin(Date.now() / 300) * 0.3 + 0.7;

        // Halo brilhante da estrela
        ctx.beginPath();
        ctx.arc(cx, cy, CELL * 0.7, 0, Math.PI * 2);
        const grd = ctx.createRadialGradient(cx, cy, 0, cx, cy, CELL * 0.7);
        grd.addColorStop(0, `rgba(255, 220, 50, ${pulse * 0.35})`);
        grd.addColorStop(1, 'transparent');
        ctx.fillStyle = grd;
        ctx.fill();

        // Emoji da estrela — maior e mais brilhante
        ctx.save();
        ctx.shadowColor = '#f4d03f';
        ctx.shadowBlur  = 20;
        ctx.font = `${CELL - 2}px serif`;
        ctx.textAlign = 'center'; ctx.textBaseline = 'middle';
        ctx.fillText('⭐', cx, cy);
        ctx.restore();
    }

    // =================== CORPO DO FOGUETE (trilha/propulsores) ===================
    ctx.shadowColor = "#ff7b00";
    ctx.shadowBlur = 20;

    state.rocket.forEach((seg, i) => {
        if (i === 0) return;
        const t   = 1 - i / state.rocket.length;
        const cx  = seg.x * CELL + CELL / 2;
        const cy  = seg.y * CELL + CELL / 2;
        const sz  = Math.max(5, (CELL - 4) * t);

        if (i < 3) {
            // Segmentos mais próximos: chama quente branca/amarela no núcleo
            const outerSz = sz * 1.7;
            ctx.beginPath();
            ctx.arc(cx, cy, outerSz * 0.85, 0, Math.PI * 2);
            ctx.fillStyle = `rgba(255,120,0,${t})`;
            ctx.fill();

            // Núcleo branco-azulado bem visível
            ctx.beginPath();
            ctx.arc(cx, cy, sz * 0.55, 0, Math.PI * 2);
            ctx.fillStyle = "#ffffff";
            ctx.fill();

            // Anel laranja vivo
            ctx.beginPath();
            ctx.arc(cx, cy, sz * 0.55, 0, Math.PI * 2);
            ctx.fillStyle = `rgba(255, 120, 0, ${t * 0.8})`;
            ctx.fill();
        } else if (i < 7) {
            // Segmentos intermediários: chama laranja/amarela
            ctx.beginPath();
            ctx.arc(cx, cy, sz * 0.9, 0, Math.PI * 2);
            ctx.fillStyle = `rgba(255,80,0,${t})`;
            ctx.fill();

            ctx.beginPath();
            ctx.arc(cx, cy, sz * 0.5, 0, Math.PI * 2);
            ctx.fillStyle = `rgba(255,255,180,${t})`;
            ctx.fill();
        } else {
            // Cauda mais longa: tons amarelo-dourado apagando
            roundRect(ctx,
                seg.x * CELL + (CELL - sz) / 2,
                seg.y * CELL + (CELL - sz) / 2,
                sz, sz, sz * 0.5
            );
            ctx.fillStyle = `rgba(255,180,0,${t * 0.9})`;
            ctx.fill();
        }
    });

    ctx.shadowBlur = 0;

    // =================== CABEÇA — FOGUETE ===================
    if (state.rocket.length > 0) {
        const head  = state.rocket[0];
        const hcx   = head.x * CELL + CELL / 2;
        const hcy   = head.y * CELL + CELL / 2;
        // O emoji 🚀 aponta para cima por padrão (direção -Y)
        // Mapeamento de ângulos:
        // Direita (dx=1, dy=0):  atan2(0,1)=0       → rotação = 0 + PI/2 = PI/2  (aponta direita) ✓
        // Esquerda (dx=-1,dy=0): atan2(0,-1)=PI     → rotação = PI + PI/2 = 3PI/2 (aponta esquerda) ✓
        // Baixo (dx=0, dy=1):    atan2(1,0)=PI/2    → rotação = PI/2 + PI/2 = PI  (aponta baixo) ✓
        // Cima (dx=0, dy=-1):    atan2(-1,0)=-PI/2  → rotação = -PI/2 + PI/2 = 0  (aponta cima) ✓
        // Para esquerda/direita o emoji 🚀 inclina naturalmente.
        // Corrigimos adicionando PI/2 ao atan2 do vetor de movimento.
        const angle = Math.atan2(state.dir.y, state.dir.x) + Math.PI / 2;

        // Halo dourado da cabeça
        ctx.beginPath();
        ctx.arc(hcx, hcy, CELL * 0.72, 0, Math.PI * 2);
        const haloGrd = ctx.createRadialGradient(hcx, hcy, 0, hcx, hcy, CELL * 0.72);
        haloGrd.addColorStop(0, 'rgba(255, 200, 50, 0.25)');
        haloGrd.addColorStop(1, 'transparent');
        ctx.fillStyle = haloGrd;
        ctx.fill();

        // Rotação discreta por direção.
        // Esquerda usa flip horizontal (scaleX -1) para evitar foguete invertido.
        const dirAngles = {
            '1,0':  { a: Math.PI / 2, flip: false },
            '-1,0': { a: Math.PI / 2, flip: true  },
            '0,1':  { a: Math.PI,     flip: false },
            '0,-1': { a: 0,           flip: false },
        };
        const dirKey = `${state.dir.x},${state.dir.y}`;
        const rot = dirAngles[dirKey] || { a: angle, flip: false };

        ctx.save();
        ctx.translate(hcx, hcy);
        ctx.rotate(rot.a);
        if (rot.flip) ctx.scale(-1, 1);
        ctx.shadowColor = '#f4d03f';
        ctx.shadowBlur  = 16;
        ctx.font = `${CELL + 2}px serif`;
        ctx.textAlign = 'center'; ctx.textBaseline = 'middle';
        ctx.fillText('🚀', 0, 0);
        ctx.restore();
    }

    // =================== PARTÍCULAS ===================
    state.particles.forEach(p => {
        ctx.beginPath();
        ctx.arc(p.x, p.y, p.r * p.life, 0, Math.PI * 2);
        const alpha = Math.floor(p.life * 255).toString(16).padStart(2, '0');
        ctx.fillStyle = p.color + alpha;
        ctx.fill();
    });

    // =================== TEXTOS FLUTUANTES ===================
    state.floatingTexts.forEach(t => {
        ctx.save();
        ctx.globalAlpha = t.life;
        ctx.font        = 'bold 16px Inter, sans-serif';
        ctx.textAlign   = 'center';
        ctx.fillStyle   = '#f4d03f';
        ctx.shadowColor = '#000';
        ctx.shadowBlur  = 6;
        ctx.fillText(t.text, t.x, t.y);
        ctx.restore();
    });
}

function roundRect(ctx, x, y, w, h, r) {
    ctx.beginPath();
    ctx.moveTo(x + r, y);
    ctx.lineTo(x + w - r, y); ctx.quadraticCurveTo(x + w, y, x + w, y + r);
    ctx.lineTo(x + w, y + h - r); ctx.quadraticCurveTo(x + w, y + h, x + w - r, y + h);
    ctx.lineTo(x + r, y + h); ctx.quadraticCurveTo(x, y + h, x, y + h - r);
    ctx.lineTo(x, y + r); ctx.quadraticCurveTo(x, y, x + r, y);
    ctx.closePath();
}

// =================== GAME OVER ===================
function gameOver() {
    state.running = false;
    clearInterval(state.loop);

    spawnParticles(state.rocket[0].x, state.rocket[0].y);
    state.particles.forEach(p => { p.color = '#ef4444'; });
    draw();

    saveScore(state.score);

    setTimeout(() => {
        document.getElementById('finalScore').textContent = state.score;
        document.getElementById('finalStars').textContent = state.stars;
        document.getElementById('finalLevel').textContent = state.level;
        const isRecord = state.score > 0 && state.score >= state.hiScore && state.stars > 0;
        document.getElementById('newRecord').classList.toggle('hidden', !isRecord);
        showScreen('over');
    }, 600);
}

// =================== PAUSE ===================
function togglePause() {
    state.paused = !state.paused;
    pauseOverlay.classList.toggle('hidden', !state.paused);
    pauseIcon.className    = state.paused ? 'fas fa-play' : 'fas fa-pause';
    pauseLabel.textContent = state.paused ? 'Continuar' : 'Pausar';
}

// =================== RANKING ===================
// BACKEND: substitua por chamadas reais à API
// Endpoint sugerido: GET  /api/minigames/foguetinho/ranking
//                    POST /api/minigames/foguetinho/score  { player_id, name, score, level, stars, date }

const RANKING_KEY = 'velora_foguetinho_ranking';

const MOCK_RANKING = [
    { player_id: 'player_001', name: 'Jogador1', score: 0, level: 1, stars: 0, date: new Date().toISOString() },
    { player_id: 'player_002', name: 'Jogador2', score: 0, level: 1, stars: 0, date: new Date().toISOString() },
    { player_id: 'player_003', name: 'Jogador3', score: 0, level: 1, stars: 0, date: new Date().toISOString() },
];

function saveScore(score) {
    if (score === 0) return;
    let ranking = getRanking();
    let playerName = 'Você', playerId = 'local';
    try {
        const u = JSON.parse(localStorage.getItem('velora_user'));
        if (u) { playerName = u.name || 'Jogador'; playerId = u.id || 'local'; }
    } catch(e) {}

    const existing = ranking.findIndex(r => r.player_id === playerId);
    const entry = { player_id: playerId, name: playerName, score, level: state.level, stars: state.stars, date: new Date().toISOString() };

    if (existing >= 0) { if (score > ranking[existing].score) ranking[existing] = entry; }
    else ranking.push(entry);

    ranking.sort((a, b) => b.score - a.score);
    ranking = ranking.slice(0, 10);
    localStorage.setItem(RANKING_KEY, JSON.stringify(ranking));
    renderRanking(ranking);
}

function getRanking() {
    try {
        const saved = JSON.parse(localStorage.getItem(RANKING_KEY));
        if (Array.isArray(saved) && saved.length > 0) return saved;
    } catch(e) {}
    return [...MOCK_RANKING];
}

function renderRanking(ranking) {
    const list   = document.getElementById('rankingList');
    const medals = ['gold-medal', 'silver-medal', 'bronze-medal'];
    list.innerHTML = '';
    ranking.slice(0, 5).forEach((r, i) => {
        const div = document.createElement('div');
        div.className = 'rank-item';
        div.innerHTML = `
            <div class="rank-pos ${medals[i] || ''}">${i + 1}</div>
            <div class="rank-info">
                <div class="rank-name">${escapeHtml(r.name)}</div>
                <div class="rank-score">⭐ ${r.score} pts</div>
            </div>`;
        list.appendChild(div);
    });
    if (ranking.length === 0) {
        list.innerHTML = '<p style="font-size:12px;color:var(--gray-500);text-align:center;padding:12px">Nenhuma partida ainda</p>';
    }
}

function escapeHtml(str) {
    return String(str).replace(/&/g,'&amp;').replace(/</g,'&lt;').replace(/>/g,'&gt;');
}

// =================== TELAS ===================
function showScreen(name) {
    [screenStart, screenGame, screenOver].forEach(s => s.classList.add('hidden'));
    if (name === 'start') screenStart.classList.remove('hidden');
    if (name === 'game')  screenGame.classList.remove('hidden');
    if (name === 'over')  screenOver.classList.remove('hidden');
}

// =================== CONTROLES ===================
document.addEventListener('keydown', e => {
    const map = {
        ArrowUp:{ x:0,y:-1 }, ArrowDown:{ x:0,y:1 },
        ArrowLeft:{ x:-1,y:0 }, ArrowRight:{ x:1,y:0 },
        w:{ x:0,y:-1 }, W:{ x:0,y:-1 },
        s:{ x:0,y:1 },  S:{ x:0,y:1 },
        a:{ x:-1,y:0 }, A:{ x:-1,y:0 },
        d:{ x:1,y:0 },  D:{ x:1,y:0 },
    };
    const next = map[e.key];
    if (next) {
        e.preventDefault();
        if (state.running && (next.x !== -state.dir.x || next.y !== -state.dir.y))
            state.nextDir = next;
    }
    if ((e.key === ' ' || e.key === 'Escape') && state.running) {
        e.preventDefault(); togglePause();
    }
});

document.getElementById('btnStart').addEventListener('click', () => {
    showScreen('game'); renderRanking(getRanking()); initGame();
});
document.getElementById('btnPause').addEventListener('click', togglePause);
document.getElementById('btnRestart').addEventListener('click', () => { showScreen('game'); initGame(); });
document.getElementById('btnMenu').addEventListener('click', () => {
    clearInterval(state.loop); state.running = false; showScreen('start');
});

document.querySelectorAll('.diff-btn').forEach(btn => {
    btn.addEventListener('click', () => {
        document.querySelectorAll('.diff-btn').forEach(b => b.classList.remove('active'));
        btn.classList.add('active');
        state.baseSpeed = parseInt(btn.dataset.speed);
        state.speed     = state.baseSpeed;
    });
});

function setDirection(next) {
    if (
        state.running &&
        (next.x !== -state.dir.x || next.y !== -state.dir.y)
    ) {
        state.nextDir = next;
    }
}

document.querySelectorAll(".mobile-control-btn").forEach(btn => {
    btn.addEventListener("click", () => {
        const dir = btn.dataset.dir;

        const map = {
            up: { x: 0, y: -1 },
            down: { x: 0, y: 1 },
            left: { x: -1, y: 0 },
            right: { x: 1, y: 0 }
        };

        setDirection(map[dir]);
    });
});

// =================== DROPDOWN DO USUÁRIO ===================
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
    if (userProfile && userDropdown) {
        userProfile.addEventListener('click', e => {
            e.stopPropagation();
            userDropdown.classList.toggle('active'); userProfile.classList.toggle('active');
        });
        document.addEventListener('click', () => {
            userDropdown.classList.remove('active'); userProfile.classList.remove('active');
        });
        userDropdown.addEventListener('click', e => e.stopPropagation());
    }
    document.getElementById('dropMeuPerfil')?.addEventListener('click', () => {
        let u = null;
        try { u = JSON.parse(localStorage.getItem('velora_user')); } catch(e) {}
        if (!u) { window.location.href = '../LoginCadastro.html'; return; }
        window.location.href = u.account_type === 'developer' ? '../PerfilDev.html' : '../PerfilUsuario.html';
    });
    document.getElementById('dropSair')?.addEventListener('click', () => {
        localStorage.removeItem('velora_user');
        window.location.href = '../LoginCadastro.html';
    });
})();

// =================== INIT ===================
(function init() {
    const saved = parseInt(localStorage.getItem('velora_foguetinho_hi')) || 0;
    state.hiScore = saved;
    hiScoreDisplay.textContent = saved;
    initBgStars();
    showScreen('start');
})();

console.log('🚀 Foguetinho Game — Velora carregado!');

// =================== MENU MOBILE PADRÃO DANDARA ===================
const mobileMenuBtn = document.getElementById("mobileMenuBtn");
const mainNav = document.querySelector(".main-nav");

mobileMenuBtn?.addEventListener("click", (e) => {
    e.stopPropagation();
    mainNav?.classList.toggle("active");
});

document.addEventListener("click", () => {
    mainNav?.classList.remove("active");
});

mainNav?.addEventListener("click", (e) => {
    e.stopPropagation();
});

// =================== ATALHO FAVORITOS ===================
document.getElementById("btnFavoritos")?.addEventListener("click", () => {
    window.location.href = "../ListaFavoritos.html";
});
