/* ============================================
   MemoryGame.js — Velora Space Memory
   ============================================ */

// ===== EMOJIS ESPACIAIS =====
const SPACE_EMOJIS = [
    '🚀','⭐','🌟','💫','☄️','🪐','🌍','🌑',
    '🛸','🌠','🔭','🌌','🛰️','💥','🌙','🌞',
    '👨‍🚀','🌈','⚡','🎆',
];

// ===== ESTADO =====
const state = {
    pairs:       8,
    cols:        4,
    timeLimit:   60,
    timeLeft:    60,
    score:       0,
    hiScore:     parseInt(localStorage.getItem('velora_memory_hi') || '0'),
    errors:      0,
    matchedPairs:0,
    totalPairs:  0,
    cards:       [],
    flipped:     [],
    locked:      false,
    paused:      false,
    running:     false,
    timerInterval: null,
    startTime:   null,
};

// ===== SCREENS =====
const screenStart = document.getElementById('screenStart');
const screenGame  = document.getElementById('screenGame');
const screenOver  = document.getElementById('screenOver');

function showScreen(name) {
    [screenStart, screenGame, screenOver].forEach(s => s.classList.add('hidden'));
    if (name === 'start') screenStart.classList.remove('hidden');
    if (name === 'game')  screenGame.classList.remove('hidden');
    if (name === 'over')  screenOver.classList.remove('hidden');
}

// ===== PONTUAÇÃO =====
// Fórmula: base por par + bônus de tempo + penalidade por erro
function calcScore(timeUsed, errors, pairs) {
    const base      = pairs * 120;
    const timeBonus = Math.max(0, Math.floor((state.timeLimit - timeUsed) * 4));
    const errPenalty= errors * 30;
    return Math.max(0, base + timeBonus - errPenalty);
}

// ===== INIT =====
function initGame() {
    const timeUsed = state.timeLimit - state.timeLeft;

    state.score        = 0;
    state.errors       = 0;
    state.matchedPairs = 0;
    state.totalPairs   = state.pairs;
    state.cards        = [];
    state.flipped      = [];
    state.locked       = false;
    state.paused       = false;
    state.running      = true;
    state.timeLeft     = state.timeLimit;
    state.startTime    = Date.now();

    if (state.timerInterval) clearInterval(state.timerInterval);

    buildBoard();
    updateHUD();
    startTimer();
    showScreen('game');
}

// ===== BOARD =====
function shuffle(arr) {
    for (let i = arr.length - 1; i > 0; i--) {
        const j = Math.floor(Math.random() * (i + 1));
        [arr[i], arr[j]] = [arr[j], arr[i]];
    }
    return arr;
}

function buildBoard() {
    const board  = document.getElementById('memoryBoard');
    const emojis = shuffle([...SPACE_EMOJIS]).slice(0, state.pairs);
    const deck   = shuffle([...emojis, ...emojis]);

    // Define grid class
    board.className = `memory-board grid-4x${state.cols}`;
    board.innerHTML = '';

    state.cards = deck.map((emoji, idx) => {
        const card = document.createElement('div');
        card.className = 'mem-card';
        card.dataset.idx = idx;
        card.innerHTML = `
            <div class="mem-card-inner">
                <div class="mem-card-front"></div>
                <div class="mem-card-back">${emoji}</div>
            </div>`;
        card.addEventListener('click', () => onCardClick(idx));
        board.appendChild(card);
        return { el: card, emoji, matched: false, flipped: false };
    });
}

// ===== CLICK =====
function onCardClick(idx) {
    if (state.locked || state.paused || !state.running) return;
    const card = state.cards[idx];
    if (card.matched || card.flipped) return;
    if (state.flipped.length >= 2) return;

    card.flipped = true;
    card.el.classList.add('flipped');
    state.flipped.push(idx);

    if (state.flipped.length === 2) {
        state.locked = true;
        checkMatch();
    }
}

function checkMatch() {
    const [i1, i2] = state.flipped;
    const c1 = state.cards[i1];
    const c2 = state.cards[i2];

    if (c1.emoji === c2.emoji) {
        // Par encontrado!
        setTimeout(() => {
            c1.matched = c2.matched = true;
            c1.el.classList.add('matched');
            c2.el.classList.add('matched');
            state.matchedPairs++;

            // Pontuação parcial por par
            const timeUsed = Math.floor((Date.now() - state.startTime) / 1000);
            const pairScore = Math.max(50, 120 - timeUsed * 2 - state.errors * 10);
            state.score += pairScore;

            state.flipped = [];
            state.locked  = false;
            updateHUD();

            if (state.matchedPairs === state.totalPairs) {
                // Vitória!
                setTimeout(() => endGame(true), 400);
            }
        }, 350);
    } else {
        // Errou
        state.errors++;
        c1.el.classList.add('wrong');
        c2.el.classList.add('wrong');

        setTimeout(() => {
            c1.flipped = c2.flipped = false;
            c1.el.classList.remove('flipped', 'wrong');
            c2.el.classList.remove('flipped', 'wrong');
            state.flipped = [];
            state.locked  = false;
            updateHUD();
        }, 800);
    }
}

// ===== TIMER =====
function startTimer() {
    updateTimerUI();
    state.timerInterval = setInterval(() => {
        if (state.paused || !state.running) return;
        state.timeLeft--;
        updateTimerUI();
        if (state.timeLeft <= 0) {
            state.timeLeft = 0;
            endGame(false);
        }
    }, 1000);
}

function updateTimerUI() {
    const el   = document.getElementById('timerDisplay');
    const fill = document.getElementById('timerFill');
    if (!el || !fill) return;
    el.textContent = state.timeLeft;
    const pct = (state.timeLeft / state.timeLimit) * 100;
    fill.style.width = pct + '%';
    // Muda cor quando falta pouco tempo
    if (pct <= 25) {
        fill.style.background = 'linear-gradient(90deg, #ef4444, #f97316)';
        el.style.color = '#ef4444';
    } else if (pct <= 50) {
        fill.style.background = 'linear-gradient(90deg, #f97316, #f4d03f)';
        el.style.color = '#f97316';
    } else {
        fill.style.background = 'linear-gradient(90deg, var(--gold), var(--gold-light))';
        el.style.color = '';
    }
}

// ===== HUD =====
function updateHUD() {
    document.getElementById('scoreDisplay').textContent  = state.score;
    document.getElementById('pairsDisplay').textContent  = `${state.matchedPairs}/${state.totalPairs}`;
    document.getElementById('errorsDisplay').textContent = state.errors;
}

// ===== FIM DE JOGO =====
function endGame(won) {
    state.running = false;
    clearInterval(state.timerInterval);

    const timeUsed = state.timeLimit - state.timeLeft;

    // Bônus final se ganhou
    if (won) {
        const bonus = Math.max(0, state.timeLeft * 5);
        state.score += bonus;
    }

    if (state.score > state.hiScore) {
        state.hiScore = state.score;
        localStorage.setItem('velora_memory_hi', state.hiScore);
    }

    // Tela de resultado
    document.getElementById('overIcon').textContent  = won ? '🏆' : '⏰';
    document.getElementById('overTitle').textContent = won ? 'MISSÃO COMPLETA!' : 'TEMPO ESGOTADO!';
    document.getElementById('finalScore').textContent  = state.score;
    document.getElementById('finalTime').textContent   = timeUsed + 's';
    document.getElementById('finalErrors').textContent = state.errors;
    document.getElementById('newRecord').classList.toggle(
        'hidden', !(state.score > 0 && state.score >= state.hiScore)
    );

    setTimeout(() => showScreen('over'), won ? 600 : 300);
}

// ===== PAUSE =====
function togglePause() {
    state.paused = !state.paused;
    document.getElementById('pauseOverlay').classList.toggle('hidden', !state.paused);
    document.getElementById('pauseIcon').className    = state.paused ? 'fas fa-play' : 'fas fa-pause';
    document.getElementById('pauseLabel').textContent = state.paused ? 'CONTINUAR' : 'PAUSAR';
}

// ===== EVENTOS =====
document.getElementById('btnStart').addEventListener('click', () => initGame());
document.getElementById('btnPause').addEventListener('click', togglePause);

document.getElementById('btnRestart').addEventListener('click', () => {
    showScreen('game');
    initGame();
});
document.getElementById('btnMenu').addEventListener('click', () => {
    state.running = false;
    clearInterval(state.timerInterval);
    showScreen('start');
});

// Seleção de modo
document.getElementById('modeGrid').addEventListener('click', e => {
    const btn = e.target.closest('.mode-btn');
    if (!btn) return;
    document.querySelectorAll('.mode-btn').forEach(b => b.classList.remove('active'));
    btn.classList.add('active');
    state.pairs     = parseInt(btn.dataset.pairs);
    state.cols      = parseInt(btn.dataset.cols);
    state.timeLimit = parseInt(btn.dataset.time);
    state.timeLeft  = state.timeLimit;
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
showScreen('start');
console.log('🧠 Memory Game — Velora carregado!');