/* ============================================================
   EditarJogo.js — Velora
   Front-end local para edição de jogo.
   Não mexe no backend: os dados são carregados/salvos no localStorage.
   ============================================================ */

const EDIT_STORAGE_KEY = 'velora_jogo_em_edicao';

const sampleGame = {
    title: 'Dandara: Trials of Fear Edition',
    tagline: 'Uma jornada brasileira de resistência e liberdade',
    description: 'Dandara é um metroidvania brasileiro com movimentação única, combates desafiadores e uma direção artística marcante. Edite este texto para atualizar a página do jogo.',
    genres: ['Metroidvania', 'Ação'],
    platforms: ['Windows', 'Console'],
    status: 'released',
    engine: 'Unity',
    players: 'Single Player',
    releaseDate: '2018',
    trailerUrl: 'https://youtube.com/watch?v=',
    tags: ['metroidvania', 'brasileiro', 'pixel art']
};

let gameData = {};
let tags = [];

function loadGameData() {
    try {
        const saved = localStorage.getItem(EDIT_STORAGE_KEY);
        return saved ? JSON.parse(saved) : sampleGame;
    } catch (error) {
        return sampleGame;
    }
}

function saveGameData(data) {
    localStorage.setItem(EDIT_STORAGE_KEY, JSON.stringify(data));
}

function showToast(message, type = 'success') {
    const toast = document.getElementById('toast');
    const toastMessage = toast?.querySelector('.toast-message');

    if (!toast || !toastMessage) return;

    toastMessage.textContent = message;
    toast.classList.toggle('error', type === 'error');
    toast.classList.add('show');

    clearTimeout(showToast.timer);
    showToast.timer = setTimeout(() => {
        toast.classList.remove('show');
    }, 3000);
}

/* =================== MENU HAMBÚRGUER =================== */
const menuToggle = document.getElementById('menuToggle');
const mainNav = document.getElementById('mainNav') || document.querySelector('.main-nav');

if (menuToggle && mainNav) {
    menuToggle.addEventListener('click', () => {
        const isOpen = mainNav.classList.toggle('mobile-open');
        menuToggle.classList.toggle('active', isOpen);
        menuToggle.setAttribute('aria-expanded', isOpen ? 'true' : 'false');
        menuToggle.innerHTML = isOpen
            ? '<i class="fas fa-times"></i>'
            : '<i class="fas fa-bars"></i>';
    });

    mainNav.querySelectorAll('a').forEach(link => {
        link.addEventListener('click', () => {
            mainNav.classList.remove('mobile-open');
            menuToggle.classList.remove('active');
            menuToggle.setAttribute('aria-expanded', 'false');
            menuToggle.innerHTML = '<i class="fas fa-bars"></i>';
        });
    });
}

/* =================== DROPDOWN DE USUÁRIO =================== */
const userProfile = document.getElementById('userProfile');
const userDropdown = document.getElementById('userDropdown');

if (userProfile && userDropdown) {
    userProfile.addEventListener('click', (event) => {
        event.stopPropagation();
        userProfile.classList.toggle('active');
        userDropdown.classList.toggle('active');
    });

    document.addEventListener('click', () => {
        userProfile.classList.remove('active');
        userDropdown.classList.remove('active');
    });
}

/* =================== CONTADORES DE CARACTERES =================== */
function setupCounter(inputId, counterId, max) {
    const input = document.getElementById(inputId);
    const counter = document.getElementById(counterId);

    if (!input || !counter) return;

    const update = () => {
        counter.textContent = `${input.value.length}/${max}`;
    };

    input.addEventListener('input', update);
    update();
}

setupCounter('game-title', 'title-count', 80);
setupCounter('game-tagline', 'tagline-count', 120);
setupCounter('game-desc', 'desc-count', 1500);

/* =================== TAGS =================== */
const tagInput = document.getElementById('tag-input');
const tagsContainer = document.getElementById('tags-container');

function renderTags() {
    if (!tagsContainer || !tagInput) return;

    tagsContainer.querySelectorAll('.tag').forEach(tag => tag.remove());

    tags.forEach((tag, index) => {
        const tagEl = document.createElement('span');
        tagEl.className = 'tag';
        tagEl.innerHTML = `
            ${tag}
            <button type="button" class="tag-remove" aria-label="Remover tag">&times;</button>
        `;

        tagEl.querySelector('.tag-remove').addEventListener('click', () => {
            tags.splice(index, 1);
            renderTags();
            updatePreview();
            updateProgress();
        });

        tagsContainer.insertBefore(tagEl, tagInput);
    });
}

if (tagInput) {
    tagInput.addEventListener('keydown', (event) => {
        if (event.key !== 'Enter') return;

        event.preventDefault();
        const value = tagInput.value.trim().toLowerCase();

        if (!value) return;

        if (tags.length >= 10) {
            showToast('Você pode adicionar no máximo 10 tags.', 'error');
            return;
        }

        if (!tags.includes(value)) {
            tags.push(value);
            renderTags();
            updatePreview();
            updateProgress();
        }

        tagInput.value = '';
    });
}

/* =================== SELEÇÃO DE CHIPS =================== */
function setupSelectable(selector, multi = true) {
    document.querySelectorAll(selector).forEach(item => {
        item.addEventListener('click', () => {
            if (!multi) {
                document.querySelectorAll(selector).forEach(el => el.classList.remove('selected'));
            }

            item.classList.toggle('selected');
            updatePreview();
            updateProgress();
        });
    });
}

setupSelectable('.genre-chip', true);
setupSelectable('.platform-chip', true);
setupSelectable('.status-card', false);

/* =================== ROADMAP =================== */
function addRoadmapItem(value = '', status = 'planned') {
    const list = document.getElementById('roadmap-list');
    if (!list) return;

    const item = document.createElement('div');
    item.className = 'roadmap-item';
    item.innerHTML = `
        <i class="fas fa-grip-vertical roadmap-grip"></i>
        <input type="text" placeholder="Ex: Adicionar sistema de inventário" value="${value}">
        <select class="roadmap-status-sel">
            <option value="planned">Planejado</option>
            <option value="wip">Em andamento</option>
            <option value="done">Concluído</option>
        </select>
        <button type="button" class="roadmap-remove-btn" onclick="removeRoadmapItem(this)">
            <i class="fas fa-times"></i>
        </button>
    `;

    item.querySelector('select').value = status;
    list.appendChild(item);
}

function removeRoadmapItem(button) {
    const item = button.closest('.roadmap-item');
    const list = document.getElementById('roadmap-list');

    if (!item || !list) return;

    if (list.children.length <= 1) {
        showToast('Mantenha pelo menos uma etapa no roadmap.', 'error');
        return;
    }

    item.remove();
}

window.addRoadmapItem = addRoadmapItem;
window.removeRoadmapItem = removeRoadmapItem;

/* =================== UPLOADS E PRÉ-VISUALIZAÇÃO =================== */
const coverInput = document.getElementById('cover-input');
const coverPreview = document.getElementById('cover-preview');
const previewCoverImg = document.getElementById('preview-cover-img');
const previewPlaceholder = document.getElementById('preview-placeholder');
const screenshotsInput = document.getElementById('screenshots-input');
const screenshotsGrid = document.getElementById('screenshots-grid');

if (coverInput) {
    coverInput.addEventListener('change', () => {
        const file = coverInput.files?.[0];
        if (!file) return;

        const reader = new FileReader();
        reader.onload = () => {
            const src = reader.result;

            if (coverPreview) {
                coverPreview.src = src;
                coverPreview.classList.add('show');
            }

            if (previewCoverImg) {
                previewCoverImg.src = src;
                previewCoverImg.style.display = 'block';
            }

            if (previewPlaceholder) {
                previewPlaceholder.style.display = 'none';
            }

            updateProgress();
        };
        reader.readAsDataURL(file);
    });
}

if (screenshotsInput && screenshotsGrid) {
    screenshotsInput.addEventListener('change', () => {
        screenshotsGrid.innerHTML = '';
        const files = Array.from(screenshotsInput.files || []).slice(0, 6);

        files.forEach(file => {
            const reader = new FileReader();
            reader.onload = () => {
                const thumb = document.createElement('div');
                thumb.className = 'screenshot-thumb';
                thumb.innerHTML = `
                    <img src="${reader.result}" alt="Screenshot do jogo">
                    <button type="button" class="screenshot-remove">
                        <i class="fas fa-times"></i>
                    </button>
                `;

                thumb.querySelector('.screenshot-remove').addEventListener('click', () => {
                    thumb.remove();
                });

                screenshotsGrid.appendChild(thumb);
            };
            reader.readAsDataURL(file);
        });
    });
}

/* =================== PRÉ-VISUALIZAÇÃO =================== */
function selectedValues(selector, dataName) {
    return Array.from(document.querySelectorAll(`${selector}.selected`))
        .map(item => item.dataset[dataName])
        .filter(Boolean);
}

function updatePreview() {
    const titleInput = document.getElementById('game-title');
    const descInput = document.getElementById('game-desc');
    const previewTitle = document.getElementById('preview-title');
    const previewGenre = document.getElementById('preview-genre');
    const previewDesc = document.getElementById('preview-desc');
    const previewTags = document.getElementById('preview-tags');

    if (previewTitle && titleInput) {
        previewTitle.textContent = titleInput.value.trim() || 'Nome do jogo...';
        previewTitle.classList.toggle('empty', !titleInput.value.trim());
    }

    if (previewDesc && descInput) {
        previewDesc.textContent = descInput.value.trim() || 'Descrição aparecerá aqui...';
        previewDesc.classList.toggle('empty', !descInput.value.trim());
    }

    if (previewGenre) {
        const genres = selectedValues('.genre-chip', 'genre');
        previewGenre.textContent = genres.join(' • ');
    }

    if (previewTags) {
        previewTags.innerHTML = tags.map(tag => `<span class="preview-tag">${tag}</span>`).join('');
    }
}

['game-title', 'game-desc'].forEach(id => {
    document.getElementById(id)?.addEventListener('input', () => {
        updatePreview();
        updateProgress();
    });
});

/* =================== PROGRESSO =================== */
function setCheck(id, ok) {
    const item = document.getElementById(id);
    const circle = document.getElementById(`${id}-circle`);

    if (!item || !circle) return;

    item.classList.toggle('ok', ok);
    circle.classList.toggle('ok', ok);
    circle.innerHTML = ok ? '<i class="fas fa-check"></i>' : '';
}

function updateProgress() {
    const checks = {
        'chk-title': Boolean(document.getElementById('game-title')?.value.trim()),
        'chk-desc': Boolean(document.getElementById('game-desc')?.value.trim()),
        'chk-genre': selectedValues('.genre-chip', 'genre').length > 0,
        'chk-cover': Boolean(coverPreview?.classList.contains('show') || previewCoverImg?.src),
        'chk-platform': selectedValues('.platform-chip', 'platform').length > 0,
        'chk-status': selectedValues('.status-card', 'status').length > 0
    };

    Object.entries(checks).forEach(([id, ok]) => setCheck(id, ok));

    const total = Object.values(checks).length;
    const completed = Object.values(checks).filter(Boolean).length;
    const percent = Math.round((completed / total) * 100);

    const progressPercent = document.getElementById('progress-percent');
    const progressFill = document.getElementById('progress-fill');

    if (progressPercent) progressPercent.textContent = `${percent}%`;
    if (progressFill) progressFill.style.width = `${percent}%`;
}

/* =================== CARREGAR DADOS NA TELA =================== */
function setInputValue(id, value) {
    const input = document.getElementById(id);
    if (input) input.value = value || '';
}

function markSelected(selector, dataName, values) {
    document.querySelectorAll(selector).forEach(item => {
        item.classList.toggle('selected', values.includes(item.dataset[dataName]));
    });
}

function loadGameOnScreen() {
    setInputValue('game-title', gameData.title);
    setInputValue('game-tagline', gameData.tagline);
    setInputValue('game-desc', gameData.description);
    setInputValue('trailer-url', gameData.trailerUrl);
    setInputValue('release-date', gameData.releaseDate);

    const engine = document.getElementById('engine-select');
    const players = document.getElementById('player-mode');

    if (engine) engine.value = gameData.engine || '';
    if (players) players.value = gameData.players || '';

    tags = Array.isArray(gameData.tags) ? [...gameData.tags] : [];
    renderTags();

    markSelected('.genre-chip', 'genre', gameData.genres || []);
    markSelected('.platform-chip', 'platform', gameData.platforms || []);
    markSelected('.status-card', 'status', gameData.status ? [gameData.status] : []);

    document.querySelectorAll('input, textarea, select').forEach(field => {
        field.addEventListener('input', updateProgress);
        field.addEventListener('change', updateProgress);
    });

    updatePreview();
    updateProgress();
}

function normalizarDataParaMySQL(data) {
    if (!data) return "";

    if (/^\d{4}-\d{2}-\d{2}$/.test(data)) {
        return data;
    }

    if (/^\d{4}$/.test(data)) {
        return `${data}-01-01`;
    }

    const dataConvertida = new Date(data);

    if (isNaN(dataConvertida.getTime())) {
        return "";
    }

    const ano = dataConvertida.getFullYear();
    const mes = String(dataConvertida.getMonth() + 1).padStart(2, "0");
    const dia = String(dataConvertida.getDate()).padStart(2, "0");

    return `${ano}-${mes}-${dia}`;
}

/* =================== COLETAR E SALVAR =================== */
function collectGameData() {
    return {
        title: document.getElementById('game-title')?.value.trim() || '',
        tagline: document.getElementById('game-tagline')?.value.trim() || '',
        description: document.getElementById('game-desc')?.value.trim() || '',
        genres: selectedValues('.genre-chip', 'genre'),
        platforms: selectedValues('.platform-chip', 'platform'),
        status: selectedValues('.status-card', 'status')[0] || '',
        engine: document.getElementById('engine-select')?.value || '',
        players: document.getElementById('player-mode')?.value || '',
        releaseDate: document.getElementById('release-date')?.value.trim() || '',
        trailerUrl: document.getElementById('trailer-url')?.value.trim() || '',
        tags,
        updatedAt: new Date().toISOString()
    };
}

function validateGameData(data) {
    if (!data.title) return 'Informe o nome do jogo.';
    if (!data.description) return 'Informe a descrição do jogo.';
    if (data.genres.length === 0) return 'Selecione pelo menos um gênero.';
    if (data.platforms.length === 0) return 'Selecione pelo menos uma plataforma.';
    if (!data.status) return 'Selecione o estágio de desenvolvimento.';
    return null;
}

const form = document.getElementById('game-form');
const draftButton = document.getElementById('btn-rascunho');

if (draftButton) {
    draftButton.addEventListener('click', () => {
        const data = collectGameData();
        saveGameData(data);
        showToast('Edição salva localmente.');
    });
}

if (form) {
    form.addEventListener('submit', (event) => {
        event.preventDefault();

        const data = collectGameData();
        const error = validateGameData(data);

        if (error) {
            showToast(error, 'error');
            return;
        }

        const params = new URLSearchParams(window.location.search);
        const gameId = params.get("id");

        fetch(`http://127.0.0.1:5000/api/games/${gameId}`, {
            method: "PUT",
            headers: {
                "Content-Type": "application/json"
            },
            body: JSON.stringify({
                title: data.title,
                description: data.description,
                genre: data.genres.join(", "),
                platform: data.platforms.join(", "),
                status: data.status,
                trailer_url: data.trailerUrl,
                release_date: normalizarDataParaMySQL(data.releaseDate),
                age_rating: document.getElementById("age-rating")?.value || "",
                player_mode: data.players,
                tags: JSON.stringify(data.tags)
            })
        })
        .then(res => res.json())
        .then(result => {
            showToast("Alterações do jogo salvas com sucesso!");

            setTimeout(() => {
                window.location.href = `Game.html?id=${gameId}`;
            }, 1000);
        })
        .catch(err => {
            console.error(err);
            showToast("Erro ao salvar alterações.", "error");
        });
            });
        }

/* =================== INICIAR =================== */
function carregarJogoDoBackend() {
    const params = new URLSearchParams(window.location.search);
    const gameId = params.get("id");

    fetch(`http://127.0.0.1:5000/api/games/${gameId}`)
        .then(res => res.json())
        .then(data => {
            const game = data.game;

            gameData = {
                title: game.title || "",
                tagline: game.tagline || "",
                description: game.description || "",
                genres: game.genre
                    ? game.genre.split(",").map(g => g.trim())
                    : [],
                platforms: game.platform
                    ? game.platform.split(",").map(p => p.trim())
                    : [],
                status: game.status || "",
                engine: game.engine || "",
                players: game.player_mode || "",

                // DATA CORRIGIDA
                releaseDate: game.release_date
                    ? normalizarDataParaMySQL(game.release_date)
                    : "",

                trailerUrl: game.trailer_url || "",

                tags: (() => {
                    try {
                        return game.tags ? JSON.parse(game.tags) : [];
                    } catch {
                        return [];
                    }
                })()
            };

            loadGameOnScreen();
        })
        .catch(err => {
            console.error(err);
            showToast("Erro ao carregar dados do jogo.", "error");
        });
}

carregarJogoDoBackend();
