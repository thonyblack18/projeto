/* ============================================
   VoeGame.js — Velora Space Runner
   ============================================ */

// ===== CONSTANTES =====
const W = 800, H = 280;
const GROUND_Y     = H - 55;  // linha do chão
const ROCKET_X     = 110;      // posição horizontal fixa do foguete
const ROCKET_W     = 44;
const ROCKET_H     = 36;

// ===== CANVAS =====
const canvas  = document.getElementById('gameCanvas');
const ctx     = canvas.getContext('2d');

// ===== ESTADO =====
const state = {
    running:    false,
    paused:     false,
    started:    false,      // primeiro input recebido
    score:      0,
    hiScore:    parseInt(localStorage.getItem('velora_voe_hi') || '0'),
    distance:   0,
    level:      1,
    lives:      3,
    speed:      5.0,
    baseSpeed:  5.0,
    gravity:    0.55,
    raf:        null,
    frameCount: 0,

    // foguete
    rocketY:    GROUND_Y - ROCKET_H,
    velY:       0,
    onGround:   true,
    jumping:    false,
    diving:     false,
    thrustPhase: 0,           // para animação da chama

    // obstáculos
    obstacles:  [],
    obsCooldown: 0,

    // estrelas de fundo (parallax)
    stars:      [],
    starsDeep:  [],

    // planetas decorativos de fundo
    bgPlanets:  [],

    // partículas
    particles:  [],

    // flash de level up
    flashTimer: 0,

    // input
    jumpPressed: false,
    divePressed: false,
    invincible:  0,   // frames de invencibilidade pós-hit
};

// ===== OBSTÁCULOS =====
const OBS_TYPES = [
    // Asteroides pequenos (rápidos, voam alto ou baixo)
    { type:'asteroid', label:'☄️',  w:28, h:28, yMode:'ground', speed:1.0, points:5  },
    { type:'asteroid', label:'☄️',  w:38, h:36, yMode:'ground', speed:0.9, points:5  },
    { type:'asteroid', label:'☄️',  w:24, h:24, yMode:'air',    speed:1.2, points:8  },
    // Cometas (longos, voam em diagonal)
    { type:'comet',    label:'🌠',  w:48, h:22, yMode:'air',    speed:1.3, points:10 },
    { type:'comet',    label:'🌠',  w:36, h:20, yMode:'mid',    speed:1.1, points:8  },
    // Planetas pequenos (lentos, grandes, no chão)
    { type:'planet',   label:'🪐',  w:52, h:50, yMode:'ground', speed:0.7, points:15 },
    { type:'planet',   label:'🌑',  w:40, h:40, yMode:'ground', speed:0.75,points:12 },
    { type:'planet',   label:'🌍',  w:46, h:44, yMode:'ground', speed:0.72,points:12 },
    // Satélites voando
    { type:'satellite',label:'🛸',  w:42, h:28, yMode:'air',    speed:1.15,points:10 },
    // Duplos (dois seguidos)
    { type:'asteroid', label:'☄️',  w:26, h:26, yMode:'ground', speed:1.0, points:5, double:true },
];

// ===== INIT =====
function initBg() {
    state.stars = [];
    for (let i = 0; i < 60; i++) {
        state.stars.push({
            x: Math.random() * W, y: Math.random() * (GROUND_Y - 20),
            r: Math.random() * 1.6 + 0.3,
            op: Math.random() * 0.7 + 0.2,
            phase: Math.random() * Math.PI * 2,
            spd: 0.6 + Math.random() * 0.4,
        });
    }
    state.starsDeep = [];
    for (let i = 0; i < 25; i++) {
        state.starsDeep.push({
            x: Math.random() * W, y: Math.random() * (GROUND_Y - 20),
            r: Math.random() * 2.8 + 1.0,
            op: Math.random() * 0.5 + 0.15,
            phase: Math.random() * Math.PI * 2,
            spd: 0.25 + Math.random() * 0.2,
        });
    }
    state.bgPlanets = [];
    const bpData = [
        { x: W * 0.7, y: 40,  r: 28, color: '#1a0a2e', ring: true  },
        { x: W * 0.3, y: 25,  r: 18, color: '#0a1a2e', ring: false },
        { x: W * 0.88,y: 55,  r: 14, color: '#1a0e0a', ring: false },
    ];
    state.bgPlanets = bpData;
}

function initGame() {
    state.score       = 0;
    state.distance    = 0;
    state.level       = 1;
    state.lives       = 3;
    state.speed       = state.baseSpeed;
    state.running     = true;
    state.paused      = false;
    state.started     = false;
    state.rocketY     = GROUND_Y - ROCKET_H;
    state.velY        = 0;
    state.onGround    = true;
    state.jumping     = false;
    state.diving      = false;
    state.obstacles   = [];
    state.obsCooldown = 80;
    state.particles   = [];
    state.flashTimer  = 0;
    state.frameCount  = 0;
    state.invincible  = 0;
    state.thrustPhase = 0;

    updateLivesUI();
    updateHUD();
    initBg();
    showScreen('game');

    if (state.raf) cancelAnimationFrame(state.raf);
    gameLoop();
}

// ===== TELAS =====
const screenStart = document.getElementById('screenStart');
const screenGame  = document.getElementById('screenGame');
const screenOver  = document.getElementById('screenOver');

function showScreen(name) {
    [screenStart, screenGame, screenOver].forEach(s => s.classList.add('hidden'));
    if (name === 'start') screenStart.classList.remove('hidden');
    if (name === 'game')  screenGame.classList.remove('hidden');
    if (name === 'over')  screenOver.classList.remove('hidden');
}

// ===== HUD =====
function updateHUD() {
    document.getElementById('scoreDisplay').textContent   = state.score;
    document.getElementById('hiScoreDisplay').textContent = state.hiScore;
    document.getElementById('levelDisplay').textContent   = state.level;
    document.getElementById('finalScore').textContent     = state.score;
    document.getElementById('finalDist').textContent      = Math.floor(state.distance) + 'm';
    document.getElementById('finalLevel').textContent     = state.level;
}

function updateLivesUI() {
    const icons = document.querySelectorAll('.life-icon');
    icons.forEach((ic, i) => ic.classList.toggle('lost', i >= state.lives));
}

// ===== PULO =====
function jump() {
    if (!state.started) { state.started = true; }
    if (state.paused) { togglePause(); return; }

    if (state.onGround) {
        state.velY    = -(state.gravity * 18.5);
        state.onGround = false;
        state.jumping  = true;
        spawnThrustParticles(true);
    } else if (state.jumping) {
        // pulo duplo (boost)
        state.velY = Math.min(state.velY, -(state.gravity * 14));
        spawnThrustParticles(true);
    }
}

function dive() {
    if (!state.onGround) {
        state.velY   = state.gravity * 20;
        state.diving = true;
    }
}

// ===== OBSTÁCULOS =====
function spawnObstacle() {
    const template = OBS_TYPES[Math.floor(Math.random() * OBS_TYPES.length)];
    const speedMult = state.speed / 5.0;
    let obsY;

    switch (template.yMode) {
        case 'ground': obsY = GROUND_Y - template.h; break;
        case 'air':    obsY = GROUND_Y - ROCKET_H * 2.2 - template.h - Math.random() * 40; break;
        case 'mid':    obsY = GROUND_Y - ROCKET_H * 1.4 - template.h; break;
        default:       obsY = GROUND_Y - template.h;
    }

    const obs = {
        x: W + 10,
        y: obsY,
        w: template.w,
        h: template.h,
        label: template.label,
        type: template.type,
        spd: template.speed * speedMult,
        pts: template.points,
        rotation: template.type === 'asteroid' ? Math.random() * Math.PI * 2 : 0,
        rotSpd:   template.type === 'asteroid' ? (Math.random() - 0.5) * 0.08 : 0,
        scored: false,
    };

    state.obstacles.push(obs);

    // duplo
    if (template.double) {
        state.obstacles.push({
            ...obs,
            x: obs.x + obs.w + 22,
            rotation: obs.rotation + 0.8,
        });
    }

    // cooldown variado por nível
    const minCool = Math.max(40, 110 - state.level * 8);
    const maxCool = Math.max(80, 200 - state.level * 10);
    state.obsCooldown = minCool + Math.floor(Math.random() * (maxCool - minCool));
}

// ===== PARTÍCULAS =====
function spawnThrustParticles(big) {
    const cx = ROCKET_X - 4;
    const cy = state.rocketY + ROCKET_H * 0.65;
    const n  = big ? 10 : 5;
    for (let i = 0; i < n; i++) {
        const spd = 2 + Math.random() * (big ? 4 : 2.5);
        const ang = Math.PI + (Math.random() - 0.5) * 0.7;
        state.particles.push({
            x: cx, y: cy,
            vx: Math.cos(ang) * spd,
            vy: Math.sin(ang) * spd - (big ? 2 : 0.5),
            life: 1,
            decay: 0.06 + Math.random() * 0.05,
            r: 2.5 + Math.random() * (big ? 3 : 1.5),
            color: Math.random() > 0.4 ? '#f4d03f' : (Math.random() > 0.5 ? '#ff6a00' : '#c8ecff'),
        });
    }
}

function spawnHitParticles() {
    const cx = ROCKET_X + ROCKET_W / 2;
    const cy = state.rocketY + ROCKET_H / 2;
    for (let i = 0; i < 20; i++) {
        const ang = (Math.PI * 2 / 20) * i + Math.random() * 0.5;
        const spd = 2 + Math.random() * 4;
        state.particles.push({
            x: cx, y: cy,
            vx: Math.cos(ang) * spd,
            vy: Math.sin(ang) * spd,
            life: 1,
            decay: 0.03 + Math.random() * 0.03,
            r: 3 + Math.random() * 4,
            color: ['#f4d03f','#ff6a00','#ff3232','#ffffff'][Math.floor(Math.random() * 4)],
        });
    }
}

function spawnScoreParticles(x, y, pts) {
    state.particles.push({
        x, y, vx: 0, vy: -1.5,
        life: 1, decay: 0.02, r: 0,
        color: '#f4d03f', text: '+' + pts,
    });
}

// ===== COLISÃO =====
function checkCollisions() {
    if (state.invincible > 0) return;
    const rx = ROCKET_X + 6;
    const ry = state.rocketY + 5;
    const rw = ROCKET_W - 12;
    const rh = ROCKET_H - 8;

    for (const obs of state.obstacles) {
        const ox = obs.x + 4, oy = obs.y + 4;
        const ow = obs.w - 8, oh = obs.h - 8;

        if (rx < ox + ow && rx + rw > ox && ry < oy + oh && ry + rh > oy) {
            // hit!
            state.lives--;
            state.invincible = 90; // 1.5s @ 60fps
            updateLivesUI();
            spawnHitParticles();
            // vibração visual no canvas
            canvas.style.transition = 'box-shadow 0.1s';
            canvas.style.boxShadow = '0 0 50px rgba(239,68,68,0.8), 0 0 120px rgba(239,68,68,0.4)';
            setTimeout(() => {
                canvas.style.boxShadow = '0 0 50px rgba(212,175,55,0.12), 0 0 120px rgba(10,30,80,0.4), inset 0 0 80px rgba(0,0,10,0.5)';
            }, 250);

            if (state.lives <= 0) {
                setTimeout(() => gameOver(), 350);
                return;
            }
            return;
        }

        // pontuação ao passar pelo obstáculo
        if (!obs.scored && obs.x + obs.w < ROCKET_X) {
            obs.scored = true;
            state.score += obs.pts;
            spawnScoreParticles(ROCKET_X + ROCKET_W / 2, state.rocketY - 10, obs.pts);
        }
    }
}

// ===== LEVEL UP =====
function checkLevelUp() {
    const newLevel = 1 + Math.floor(state.distance / 300);
    if (newLevel > state.level) {
        state.level  = newLevel;
        state.speed  = state.baseSpeed + (state.level - 1) * 0.6;
        state.flashTimer = 45;
        updateHUD();
    }
}

// ===== RANKING =====
// BACKEND: substituir por chamadas reais à API
// GET  /api/minigames/voe/ranking
// POST /api/minigames/voe/score { player_id, name, score, distance, level, date }

const RANKING_KEY = 'velora_voe_ranking';

const MOCK_RANKING = [
    { player_id: 'player_001', name: 'Jogador1', score: 980,  distance: 412, level: 4 },
    { player_id: 'player_002', name: 'Jogador2', score: 730,  distance: 298, level: 3 },
    { player_id: 'player_003', name: 'Jogador3', score: 510,  distance: 201, level: 2 },
];

function getRanking() {
    try {
        const saved = JSON.parse(localStorage.getItem(RANKING_KEY));
        if (Array.isArray(saved) && saved.length > 0) return saved;
    } catch(e) {}
    return [...MOCK_RANKING];
}

function saveToRanking(score) {
    if (score === 0) return;
    let ranking = getRanking();
    let playerName = 'Você', playerId = 'local';
    try {
        const u = JSON.parse(localStorage.getItem('velora_user'));
        if (u) { playerName = u.name || 'Jogador'; playerId = u.id || 'local'; }
    } catch(e) {}

    const entry = {
        player_id: playerId, name: playerName,
        score, distance: Math.floor(state.distance), level: state.level,
    };
    const existing = ranking.findIndex(r => r.player_id === playerId);
    if (existing >= 0) { if (score > ranking[existing].score) ranking[existing] = entry; }
    else ranking.push(entry);

    ranking.sort((a, b) => b.score - a.score);
    ranking = ranking.slice(0, 10);
    localStorage.setItem(RANKING_KEY, JSON.stringify(ranking));
    renderRanking(ranking);
}

function renderRanking(ranking) {
    const list = document.getElementById('rankingList');
    if (!list) return;
    const medals = ['gold', 'silver', 'bronze'];
    let localId = 'local';
    try { const u = JSON.parse(localStorage.getItem('velora_user')); if (u) localId = u.id || 'local'; } catch(e) {}

    list.innerHTML = '';
    ranking.slice(0, 5).forEach((r, i) => {
        const isYou = r.player_id === localId;
        const div = document.createElement('div');
        div.className = 'rank-item' + (isYou ? ' rank-you' : '');
        div.innerHTML = `
            <div class="rank-pos ${medals[i] || ''}">${i + 1}</div>
            <div class="rank-info">
                <div class="rank-name">${escHtml(r.name)}${isYou ? ' <span style="color:var(--gold);font-size:10px">(você)</span>' : ''}</div>
                <div class="rank-score">🚀 ${r.score} pts</div>
            </div>`;
        list.appendChild(div);
    });
    if (ranking.length === 0) {
        list.innerHTML = '<p style="font-size:11px;color:var(--gray-500);text-align:center;padding:8px">Nenhuma partida ainda</p>';
    }
}

function escHtml(str) {
    return String(str).replace(/&/g,'&amp;').replace(/</g,'&lt;').replace(/>/g,'&gt;');
}

// ===== GAME OVER =====
function gameOver() {
    state.running = false;
    if (state.raf) cancelAnimationFrame(state.raf);

    if (state.score > state.hiScore) {
        state.hiScore = state.score;
        localStorage.setItem('velora_voe_hi', state.hiScore);
    }

    saveToRanking(state.score);
    updateHUD();
    document.getElementById('newRecord').classList.toggle(
        'hidden',
        !(state.score > 0 && state.score >= state.hiScore)
    );
    setTimeout(() => showScreen('over'), 500);
}

// ===== PAUSE =====
function togglePause() {
    state.paused = !state.paused;
    document.getElementById('pauseOverlay').classList.toggle('hidden', !state.paused);
    document.getElementById('pauseIcon').className  = state.paused ? 'fas fa-play' : 'fas fa-pause';
    document.getElementById('pauseLabel').textContent = state.paused ? 'CONTINUAR' : 'PAUSAR';
    if (!state.paused && state.running) gameLoop();
}

// ===== DRAWING =====
function drawBackground() {
    // Fundo gradiente espacial
    const bgGrd = ctx.createLinearGradient(0, 0, 0, H);
    bgGrd.addColorStop(0,   '#040610');
    bgGrd.addColorStop(0.6, '#060818');
    bgGrd.addColorStop(1,   '#090c1a');
    ctx.fillStyle = bgGrd;
    ctx.fillRect(0, 0, W, H);

    const now = Date.now() / 1000;

    // Planetas decorativos de fundo
    state.bgPlanets.forEach(p => {
        ctx.save();
        ctx.globalAlpha = 0.22;
        ctx.beginPath();
        ctx.arc(p.x, p.y, p.r, 0, Math.PI * 2);
        ctx.fillStyle = p.color;
        ctx.fill();
        if (p.ring) {
            ctx.beginPath();
            ctx.ellipse(p.x, p.y, p.r * 1.7, p.r * 0.4, 0.3, 0, Math.PI * 2);
            ctx.strokeStyle = 'rgba(180,140,80,0.3)';
            ctx.lineWidth = 3;
            ctx.stroke();
        }
        ctx.restore();
    });

    // Estrelas distantes (parallax lento)
    state.starsDeep.forEach(s => {
        s.x -= s.spd * (state.running && state.started && !state.paused ? 1 : 0);
        if (s.x < -5) { s.x = W + 5; s.y = Math.random() * (GROUND_Y - 20); }
        const op = s.op + Math.sin(now * 1.2 + s.phase) * 0.15;
        ctx.beginPath();
        ctx.arc(s.x, s.y, s.r, 0, Math.PI * 2);
        ctx.fillStyle = `rgba(255,240,180,${Math.max(0.05, op)})`;
        ctx.fill();
    });

    // Estrelas próximas (parallax médio)
    state.stars.forEach(s => {
        s.x -= s.spd * (state.running && state.started && !state.paused ? 1 : 0);
        if (s.x < -3) { s.x = W + 3; s.y = Math.random() * (GROUND_Y - 20); }
        const op = s.op + Math.sin(now * 2 + s.phase) * 0.12;
        ctx.beginPath();
        ctx.arc(s.x, s.y, s.r, 0, Math.PI * 2);
        ctx.fillStyle = `rgba(255,255,255,${Math.max(0.05, op)})`;
        ctx.fill();
    });
}

function drawGround() {
    // Linha do chão — solo espacial
    const grdGrd = ctx.createLinearGradient(0, GROUND_Y, 0, H);
    grdGrd.addColorStop(0, 'rgba(212,175,55,0.18)');
    grdGrd.addColorStop(0.15, 'rgba(20,16,40,0.9)');
    grdGrd.addColorStop(1, 'rgba(6,8,20,1)');
    ctx.fillStyle = grdGrd;
    ctx.fillRect(0, GROUND_Y, W, H - GROUND_Y);

    // Linha dourada brilhante
    ctx.beginPath();
    ctx.moveTo(0, GROUND_Y);
    ctx.lineTo(W, GROUND_Y);
    ctx.strokeStyle = 'rgba(212,175,55,0.5)';
    ctx.lineWidth = 1.5;
    ctx.stroke();

    // Linha de detalhe abaixo
    ctx.beginPath();
    ctx.moveTo(0, GROUND_Y + 3);
    ctx.lineTo(W, GROUND_Y + 3);
    ctx.strokeStyle = 'rgba(212,175,55,0.12)';
    ctx.lineWidth = 1;
    ctx.stroke();
}

function drawRocket() {
    const x  = ROCKET_X;
    const y  = state.rocketY;
    const cx = x + ROCKET_W / 2;
    const cy = y + ROCKET_H / 2;

    state.thrustPhase += 0.25;

    // Chama de propulsão (sempre ativa no chão, maior no pulo)
    const flameSize = state.onGround ? 1.0 : (state.jumping ? 1.6 : 0.7);
    const flamePulse = 0.85 + Math.sin(state.thrustPhase * 4) * 0.15;
    const fLen = (14 + Math.random() * 8) * flameSize * flamePulse;

    // Halo externo da chama
    const fGrd = ctx.createRadialGradient(x - 2, cy, 0, x - 2, cy, fLen * 1.2);
    fGrd.addColorStop(0, 'rgba(200,236,255,0.95)');
    fGrd.addColorStop(0.2, 'rgba(255,160,0,0.85)');
    fGrd.addColorStop(0.6, 'rgba(255,80,0,0.5)');
    fGrd.addColorStop(1, 'transparent');
    ctx.beginPath();
    ctx.ellipse(x - fLen * 0.3, cy, fLen, ROCKET_H * 0.28 * flamePulse, 0, 0, Math.PI * 2);
    ctx.fillStyle = fGrd;
    ctx.fill();

    // Invencibilidade = piscar
    if (state.invincible > 0 && Math.floor(state.invincible / 6) % 2 === 0) return;

    // Sombra/glow do foguete
    ctx.save();
    ctx.shadowColor = '#f4d03f';
    ctx.shadowBlur  = 18;
    ctx.font = `${ROCKET_H + 4}px serif`;
    ctx.textAlign    = 'center';
    ctx.textBaseline = 'middle';
    // Mergulho: inclina para baixo; pulo: inclina para cima
    const tilt = state.diving ? 0.35 : (state.onGround ? 0 : Math.max(-0.3, state.velY * -0.018));
    ctx.translate(cx, cy);
    ctx.rotate(tilt);
    ctx.fillText('🚀', 0, 0);
    ctx.restore();
}

function drawObstacles() {
    state.obstacles.forEach(obs => {
        ctx.save();
        const ocx = obs.x + obs.w / 2;
        const ocy = obs.y + obs.h / 2;
        ctx.translate(ocx, ocy);
        if (obs.rotation) ctx.rotate(obs.rotation);
        ctx.font = `${Math.min(obs.w, obs.h) + 4}px serif`;
        ctx.textAlign    = 'center';
        ctx.textBaseline = 'middle';

        // Glow nos planetas
        if (obs.type === 'planet') {
            ctx.shadowColor = 'rgba(120,80,255,0.5)';
            ctx.shadowBlur  = 16;
        } else if (obs.type === 'comet') {
            ctx.shadowColor = 'rgba(150,200,255,0.6)';
            ctx.shadowBlur  = 14;
        } else {
            ctx.shadowColor = 'rgba(255,120,0,0.4)';
            ctx.shadowBlur  = 10;
        }

        ctx.fillText(obs.label, 0, 0);
        ctx.restore();
    });
}

function drawParticles() {
    state.particles.forEach(p => {
        if (p.text) {
            ctx.save();
            ctx.globalAlpha = p.life;
            ctx.font = 'bold 15px "Orbitron", sans-serif';
            ctx.textAlign = 'center';
            ctx.fillStyle = p.color;
            ctx.shadowColor = p.color;
            ctx.shadowBlur  = 8;
            ctx.fillText(p.text, p.x, p.y);
            ctx.restore();
        } else {
            ctx.beginPath();
            ctx.arc(p.x, p.y, p.r * p.life, 0, Math.PI * 2);
            const alpha = Math.floor(p.life * 255).toString(16).padStart(2, '0');
            ctx.fillStyle = p.color + alpha;
            ctx.fill();
        }
    });
}

function drawHUDOverlay() {
    // Flash de level up
    if (state.flashTimer > 0) {
        ctx.save();
        ctx.globalAlpha = (state.flashTimer / 45) * 0.15;
        ctx.fillStyle = '#f4d03f';
        ctx.fillRect(0, 0, W, H);
        ctx.restore();

        ctx.save();
        ctx.globalAlpha = state.flashTimer / 45;
        ctx.font = 'bold 20px "Orbitron", sans-serif';
        ctx.textAlign = 'center';
        ctx.fillStyle = '#f4d03f';
        ctx.shadowColor = '#f4d03f';
        ctx.shadowBlur  = 20;
        ctx.fillText(`NÍVEL ${state.level}!`, W / 2, H / 2 - 10);
        ctx.restore();
        state.flashTimer--;
    }

    // "Pressione ESPAÇO" antes do primeiro input
    if (!state.started && state.running) {
        ctx.save();
        const blink = Math.sin(Date.now() / 400) > 0;
        if (blink) {
            ctx.font = '13px "Orbitron", sans-serif';
            ctx.textAlign = 'center';
            ctx.fillStyle = 'rgba(212,175,55,0.85)';
            ctx.shadowColor = '#f4d03f';
            ctx.shadowBlur  = 12;
            ctx.fillText('PRESSIONE ESPAÇO PARA DECOLAR', W / 2, H / 2 + 10);
        }
        ctx.restore();
    }
}

// ===== GAME LOOP =====
let lastTime = 0;
function gameLoop(ts) {
    if (!state.running || state.paused) return;
    state.raf = requestAnimationFrame(gameLoop);

    state.frameCount++;

    // === FÍSICA ===
    if (state.started) {
        state.velY    += state.gravity;
        state.rocketY += state.velY;

        // Chão
        if (state.rocketY >= GROUND_Y - ROCKET_H) {
            state.rocketY  = GROUND_Y - ROCKET_H;
            state.velY     = 0;
            state.onGround = true;
            state.jumping  = false;
            state.diving   = false;
        } else {
            state.onGround = false;
        }

        // Teto
        if (state.rocketY < 10) {
            state.rocketY = 10;
            state.velY = Math.abs(state.velY) * 0.5;
        }

        // Distância e score por tempo
        state.distance += state.speed * 0.05;
        if (state.frameCount % 6 === 0) {
            state.score++;
            if (state.score > state.hiScore) {
                state.hiScore = state.score;
                localStorage.setItem('velora_voe_hi', state.hiScore);
            }
        }

        // Obstáculos
        if (state.obsCooldown > 0) {
            state.obsCooldown--;
        } else {
            spawnObstacle();
        }

        state.obstacles.forEach(obs => {
            obs.x -= (state.speed + obs.spd);
            obs.rotation += obs.rotSpd || 0;
        });
        state.obstacles = state.obstacles.filter(o => o.x + o.w > -10);

        // Partículas de propulsão contínua
        if (state.frameCount % 3 === 0) spawnThrustParticles(false);

        // Partículas update
        state.particles = state.particles.filter(p => {
            p.x  += p.vx; p.y += p.vy;
            p.vy += p.text ? 0 : 0.08;
            p.life -= p.decay;
            return p.life > 0;
        });

        // Invencibilidade
        if (state.invincible > 0) state.invincible--;

        // Colisões
        checkCollisions();

        // Level
        checkLevelUp();

        // HUD
        if (state.frameCount % 8 === 0) updateHUD();
    }

    // === DESENHO ===
    drawBackground();
    drawGround();
    drawObstacles();
    drawRocket();
    drawParticles();
    drawHUDOverlay();
}

// ===== INPUT =====
function handleJump() {
    if (!state.running) return;
    if (!state.started) { state.started = true; }
    jump();
}

document.addEventListener('keydown', e => {
    if (e.code === 'Space' || e.key === ' ' || e.key === 'ArrowUp' || e.key === 'w' || e.key === 'W') {
        e.preventDefault();
        if (state.paused && state.running) { togglePause(); return; }
        handleJump();
    }
    if ((e.key === 'ArrowDown' || e.key === 's' || e.key === 'S') && state.running && state.started) {
        e.preventDefault();
        dive();
    }
    if (e.key === 'Escape' || e.key === 'p' || e.key === 'P') {
        if (state.running) togglePause();
    }
});

canvas.addEventListener('click', () => { if (state.running) handleJump(); });
canvas.addEventListener('touchstart', e => { e.preventDefault(); if (state.running) handleJump(); }, { passive: false });

// ===== BOTÕES =====
document.getElementById('btnStart').addEventListener('click', () => initGame());

document.getElementById('btnPause').addEventListener('click', togglePause);

document.getElementById('btnRestart').addEventListener('click', () => {
    showScreen('game');
    initGame();
});

document.getElementById('btnMenu').addEventListener('click', () => {
    state.running = false;
    if (state.raf) cancelAnimationFrame(state.raf);
    showScreen('start');
});

document.querySelectorAll('.diff-btn').forEach(btn => {
    btn.addEventListener('click', () => {
        document.querySelectorAll('.diff-btn').forEach(b => b.classList.remove('active'));
        btn.classList.add('active');
        state.gravity   = parseFloat(btn.dataset.gravity);
        state.baseSpeed = parseFloat(btn.dataset.speed);
        state.speed     = state.baseSpeed;
    });
});

// ===== DROPDOWN USUÁRIO =====
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
(function() {
    document.getElementById('hiScoreDisplay').textContent = state.hiScore;
    initBg();
    renderRanking(getRanking());
    showScreen('start');

    // Desenha tela de preview estática
    drawBackground();
    drawGround();

    // Foguete estático na posição inicial
    state.rocketY = GROUND_Y - ROCKET_H;
    drawRocket();
    drawHUDOverlay();

    console.log('🚀 VOE! — Velora Space Runner carregado!');
})();