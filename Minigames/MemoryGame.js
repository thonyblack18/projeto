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
    score:       0,
    hiScore:     parseInt(localStorage.getItem('velora_memory_hi') || '0'),
    errors:      0,
    matchedPairs:0,
    totalPairs:  0,
    cards:       [],
    flipped:     [],
    locked:      false,
    running:     false,
};

// ===== SCREENS =====
const screenStart = document.getElementById('screenStart');
const screenGame  = document.getElementById('screenGame');
const screenOver  = document.getElementById('screenOver');

function showScreen(name) {

    [screenStart, screenGame, screenOver]
    .forEach(s => s.classList.add('hidden'));

    if (name === 'start') screenStart.classList.remove('hidden');
    if (name === 'game')  screenGame.classList.remove('hidden');
    if (name === 'over')  screenOver.classList.remove('hidden');
}

// ===== INIT =====
function initGame() {

    state.score        = 0;
    state.errors       = 0;
    state.matchedPairs = 0;
    state.totalPairs   = state.pairs;
    state.cards        = [];
    state.flipped      = [];
    state.locked       = false;
    state.running      = true;

    buildBoard();
    updateHUD();

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

    const emojis = shuffle([...SPACE_EMOJIS])
        .slice(0, state.pairs);

    const deck   = shuffle([...emojis, ...emojis]);

    board.className = `memory-board grid-4x${state.cols}`;

    board.innerHTML = '';

    state.cards = deck.map((emoji, idx) => {

        const card = document.createElement('div');

        card.className = 'mem-card';

        card.dataset.idx = idx;

        card.innerHTML = `
            <div class="mem-card-inner">

                <div class="mem-card-front"></div>

                <div class="mem-card-back">
                    ${emoji}
                </div>

            </div>
        `;

        card.addEventListener('click', () => onCardClick(idx));

        board.appendChild(card);

        return {
            el: card,
            emoji,
            matched: false,
            flipped: false
        };
    });
}

// ===== CLICK =====
function onCardClick(idx) {

    if (state.locked || !state.running) return;

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

        setTimeout(() => {

            c1.matched = true;
            c2.matched = true;

            c1.el.classList.add('matched');
            c2.el.classList.add('matched');

            state.matchedPairs++;

            const pairScore =
                Math.max(
                    50,
                    120 - state.errors * 10
                );

            state.score += pairScore;

            state.flipped = [];

            state.locked  = false;

            updateHUD();

            if (state.matchedPairs === state.totalPairs) {

                setTimeout(() => endGame(true), 400);
            }

        }, 350);

    } else {

        state.errors++;

        c1.el.classList.add('wrong');
        c2.el.classList.add('wrong');

        setTimeout(() => {

            c1.flipped = false;
            c2.flipped = false;

            c1.el.classList.remove('flipped', 'wrong');
            c2.el.classList.remove('flipped', 'wrong');

            state.flipped = [];

            state.locked  = false;

            updateHUD();

        }, 800);
    }
}

// ===== HUD =====
function updateHUD() {

    document.getElementById('scoreDisplay')
        .textContent = state.score;

    document.getElementById('pairsDisplay')
        .textContent =
            `${state.matchedPairs}/${state.totalPairs}`;

    document.getElementById('errorsDisplay')
        .textContent = state.errors;
}

// ===== FIM DE JOGO =====
function endGame(won) {

    state.running = false;

    if (state.score > state.hiScore) {

        state.hiScore = state.score;

        localStorage.setItem(
            'velora_memory_hi',
            state.hiScore
        );
    }

    document.getElementById('overIcon')
        .textContent = won ? '🏆' : '💥';

    document.getElementById('overTitle')
        .textContent = won
            ? 'MISSÃO COMPLETA!'
            : 'FIM DE JOGO!';

    document.getElementById('finalScore')
        .textContent = state.score;

    document.getElementById('finalErrors')
        .textContent = state.errors;

    document.getElementById('newRecord')
        .classList.toggle(
            'hidden',
            !(state.score > 0 && state.score >= state.hiScore)
        );

    setTimeout(() => showScreen('over'), 500);
}

// ===== EVENTOS =====
document.getElementById('btnStart')
?.addEventListener('click', () => {

    initGame();
});

document.getElementById('btnRestart')
?.addEventListener('click', () => {

    showScreen('game');

    initGame();
});

document.getElementById('btnMenu')
?.addEventListener('click', () => {

    state.running = false;

    showScreen('start');
});

// ===== MODOS =====
document.getElementById('modeGrid')
?.addEventListener('click', e => {

    const btn = e.target.closest('.mode-btn');

    if (!btn) return;

    document
        .querySelectorAll('.mode-btn')
        .forEach(b => b.classList.remove('active'));

    btn.classList.add('active');

    state.pairs =
        parseInt(btn.dataset.pairs);

    state.cols =
        parseInt(btn.dataset.cols);
});

// ===== DROPDOWN =====
(function() {

    const userProfile  =
        document.getElementById('userProfile');

    const userDropdown =
        document.getElementById('userDropdown');

    const nameEl =
        document.getElementById('userName');

    const initialEl =
        document.getElementById('userAvatarInitial');

    try {

        const u =
            JSON.parse(
                localStorage.getItem('velora_user')
            );

        if (u && nameEl) {

            nameEl.textContent =
                u.name || 'Jogador';
        }

        if (u && initialEl) {

            initialEl.textContent =
                (u.name || 'J')[0].toUpperCase();
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

    userDropdown?.addEventListener('click', ev => {

        ev.stopPropagation();
    });

    document.getElementById('dropMeuPerfil')
    ?.addEventListener('click', () => {

        let u = null;

        try {

            u = JSON.parse(
                localStorage.getItem('velora_user')
            );

        } catch(e) {}

        if (!u) {

            window.location.href =
                '../LoginCadastro.html';

            return;
        }

        window.location.href =
            u.account_type === 'developer'
                ? '../PerfilDev.html'
                : '../PerfilUsuario.html';
    });

    document.getElementById('dropSair')
    ?.addEventListener('click', () => {

        localStorage.removeItem('velora_user');

        window.location.href =
            '../LoginCadastro.html';
    });

})();

// ===== INIT =====
showScreen('start');

console.log('🧠 Memory Game — Velora carregado!');

// ===== MENU MOBILE / FAVORITOS — padrão Dandara =====
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

document.getElementById("btnFavoritos")?.addEventListener("click", () => {
    window.location.href = "../ListaFavoritos.html";
});
