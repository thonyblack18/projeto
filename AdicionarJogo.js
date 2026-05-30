// =================== CANVAS DE PARTÍCULAS ===================
const canvas = document.getElementById('particles');
const ctx = canvas.getContext('2d');

canvas.width = window.innerWidth;
canvas.height = window.innerHeight;

class Star {
    constructor() {
        this.reset(true);
    }

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

const stars = [];
for (let i = 0; i < 140; i++) stars.push(new Star());

(function animate() {
    ctx.clearRect(0, 0, canvas.width, canvas.height);
    stars.forEach(s => { s.update(); s.draw(); });
    requestAnimationFrame(animate);
})();

window.addEventListener('resize', () => {
    canvas.width = window.innerWidth;
    canvas.height = window.innerHeight;
});

// =================== SISTEMA DE TOAST ===================
function showToast(message, type = 'success') {
    const toast = document.getElementById('toast');
    toast.querySelector('.toast-message').textContent = message;
    toast.className = 'toast' + (type === 'error' ? ' error' : '');
    toast.classList.add('show');
    setTimeout(() => toast.classList.remove('show'), 4500);
}

// =================== CONTADORES DE CARACTERES ===================
function setupCounter(inputId, countId, max) {
    const el = document.getElementById(inputId);
    const ct = document.getElementById(countId);

    if (!el || !ct) return;

    el.addEventListener('input', () => {
        ct.textContent = `${el.value.length}/${max}`;
        updateChecklist();
        updatePreview();
    });
}

setupCounter('game-title', 'title-count', 80);
setupCounter('game-tagline', 'tagline-count', 120);
setupCounter('game-desc', 'desc-count', 1500);

// =================== CHIPS DE GÊNERO ===================
document.querySelectorAll('.genre-chip').forEach(chip => {
    chip.addEventListener('click', () => {
        chip.classList.toggle('selected');
        updateChecklist();
        updatePreview();
    });
});

// =================== CHIPS DE PLATAFORMA ===================
document.querySelectorAll('.platform-chip').forEach(chip => {
    chip.addEventListener('click', () => {
        chip.classList.toggle('selected');
        updateChecklist();
    });
});

// =================== CARDS DE STATUS ===================
document.querySelectorAll('.status-card').forEach(card => {
    card.addEventListener('click', () => {
        document.querySelectorAll('.status-card').forEach(c => c.classList.remove('selected'));
        card.classList.add('selected');
        updateChecklist();
    });
});

// =================== SISTEMA DE TAGS ===================
const tagInput = document.getElementById('tag-input');
const tagsContainer = document.getElementById('tags-container');
let tags = [];

tagsContainer.addEventListener('click', () => tagInput.focus());

tagInput.addEventListener('keydown', e => {
    if ((e.key === 'Enter' || e.key === ',') && tagInput.value.trim()) {
        e.preventDefault();

        const val = tagInput.value.trim().replace(/,/g, '');

        if (val && tags.length < 10 && !tags.includes(val)) {
            tags.push(val);
            renderTags();
        }

        tagInput.value = '';
    }

    if (e.key === 'Backspace' && !tagInput.value && tags.length) {
        tags.pop();
        renderTags();
    }
});

function renderTags() {
    tagsContainer.querySelectorAll('.tag').forEach(t => t.remove());

    tags.forEach((tag, i) => {
        const el = document.createElement('div');
        el.className = 'tag';
        el.innerHTML = `${tag}<button type="button" class="tag-remove" data-i="${i}">×</button>`;

        el.querySelector('.tag-remove').addEventListener('click', () => {
            tags.splice(i, 1);
            renderTags();
            updatePreview();
        });

        tagsContainer.insertBefore(el, tagInput);
    });

    updatePreview();
}

// =================== UPLOAD DA CAPA ===================
const coverInput = document.getElementById('cover-input');
const coverPreview = document.getElementById('cover-preview');
const coverUploadArea = document.getElementById('cover-upload-area');
const previewCoverImg = document.getElementById('preview-cover-img');
const previewPlaceholder = document.getElementById('preview-placeholder');

coverInput.addEventListener('change', function () {
    if (this.files[0]) loadCover(this.files[0]);
});

['dragover', 'dragenter'].forEach(ev =>
    coverUploadArea.addEventListener(ev, e => {
        e.preventDefault();
        coverUploadArea.classList.add('dragover');
    })
);

['dragleave', 'drop'].forEach(ev =>
    coverUploadArea.addEventListener(ev, e => {
        e.preventDefault();
        coverUploadArea.classList.remove('dragover');
    })
);

coverUploadArea.addEventListener('drop', e => {
    if (e.dataTransfer.files[0]) loadCover(e.dataTransfer.files[0]);
});

function loadCover(file) {
    const url = URL.createObjectURL(file);

    coverPreview.src = url;
    coverPreview.classList.add('show');

    coverUploadArea.style.display = 'none';

    previewCoverImg.src = url;
    previewCoverImg.style.display = 'block';

    previewPlaceholder.style.display = 'none';

    updateChecklist();
}

// =================== UPLOAD DE SCREENSHOTS ===================
const screenshotsInput = document.getElementById('screenshots-input');
const screenshotsGrid = document.getElementById('screenshots-grid');
let screenshots = [];

screenshotsInput.addEventListener('change', function () {
    Array.from(this.files).forEach(f => {
        if (screenshots.length < 6) screenshots.push(URL.createObjectURL(f));
    });

    renderScreenshots();
});

function renderScreenshots() {
    screenshotsGrid.innerHTML = '';

    screenshots.forEach((url, i) => {
        const div = document.createElement('div');
        div.className = 'screenshot-thumb';

        div.innerHTML = `
            <img src="${url}" alt="">
            <button type="button" class="screenshot-remove" onclick="removeScreenshot(${i})">
                <i class="fas fa-times"></i>
            </button>
        `;

        screenshotsGrid.appendChild(div);
    });
}

window.removeScreenshot = (i) => {
    screenshots.splice(i, 1);
    renderScreenshots();
};

// =================== ROADMAP ===================
window.addRoadmapItem = function () {
    const list = document.getElementById('roadmap-list');
    const div = document.createElement('div');

    div.className = 'roadmap-item';

    div.innerHTML = `
        <i class="fas fa-grip-vertical roadmap-grip"></i>
        <input type="text" placeholder="Descreva a etapa...">
        <select class="roadmap-status-sel">
            <option value="planned">Planejado</option>
            <option value="wip">Em andamento</option>
            <option value="done">Concluído</option>
        </select>
        <button type="button" class="roadmap-remove-btn" onclick="removeRoadmapItem(this)">
            <i class="fas fa-times"></i>
        </button>
    `;

    list.appendChild(div);
};

window.removeRoadmapItem = function (btn) {
    const list = document.getElementById('roadmap-list');

    if (list.children.length > 1) {
        btn.closest('.roadmap-item').remove();
    }
};

// =================== PRÉ-VISUALIZAÇÃO EM TEMPO REAL ===================
function updatePreview() {
    const title = document.getElementById('game-title').value.trim();
    const desc = document.getElementById('game-desc').value.trim();

    const genres = [
        ...document.querySelectorAll('.genre-chip.selected')
    ].map(c => c.dataset.genre);

    const pTitle = document.getElementById('preview-title');

    pTitle.textContent = title || 'Nome do jogo...';
    pTitle.className = 'preview-title' + (title ? '' : ' empty');

    const pDesc = document.getElementById('preview-desc');

    pDesc.textContent = desc
        ? (desc.length > 110 ? desc.slice(0, 110) + '...' : desc)
        : 'Descrição aparecerá aqui...';

    pDesc.className = 'preview-desc' + (desc ? '' : ' empty');

    document.getElementById('preview-genre').textContent = genres.join(' · ');

    document.getElementById('preview-tags').innerHTML = tags
        .slice(0, 5)
        .map(t => `<span class="preview-tag">${t}</span>`)
        .join('');
}

// =================== CHECKLIST E BARRA DE PROGRESSO ===================
function setCheck(id, ok) {
    const circle = document.getElementById(`chk-${id}-circle`);
    const item = document.getElementById(`chk-${id}`);

    if (!circle) return;

    circle.className = 'check-circle' + (ok ? ' ok' : '');
    circle.innerHTML = ok ? '<i class="fas fa-check" style="font-size:9px;"></i>' : '';

    item.className = 'check-item' + (ok ? ' ok' : '');
}

function updateChecklist() {
    const title = document.getElementById('game-title').value.trim().length > 0;
    const desc = document.getElementById('game-desc').value.trim().length > 10;
    const genre = document.querySelectorAll('.genre-chip.selected').length > 0;
    const cover = coverPreview.classList.contains('show');
    const platform = document.querySelectorAll('.platform-chip.selected').length > 0;
    const status = document.querySelectorAll('.status-card.selected').length > 0;

    setCheck('title', title);
    setCheck('desc', desc);
    setCheck('genre', genre);
    setCheck('cover', cover);
    setCheck('platform', platform);
    setCheck('status', status);

    const done = [title, desc, genre, cover, platform, status].filter(Boolean).length;
    const pct = Math.round((done / 6) * 100);

    document.getElementById('progress-percent').textContent = pct + '%';
    document.getElementById('progress-fill').style.width = pct + '%';
}

// =================== DESTAQUE DA ETAPA ATUAL (SCROLL) ===================
const stepItems = document.querySelectorAll('.step-item');
const sections = document.querySelectorAll('.form-section');

window.addEventListener('scroll', () => {
    let current = 0;

    sections.forEach((sec, i) => {
        if (window.scrollY + 140 >= sec.offsetTop) current = i;
    });

    const stepIndex = Math.min(current, stepItems.length - 1);

    stepItems.forEach((s, i) => {
        s.classList.toggle('active', i === stepIndex);
        s.classList.toggle('done', i < stepIndex);
    });
});

// =================== SALVAR RASCUNHO ===================
document.getElementById('btn-rascunho').addEventListener('click', () => {
    showToast('📝 Rascunho salvo com sucesso!');
});

// =================== ENVIO DO FORMULÁRIO ===================
document.getElementById('game-form').addEventListener('submit', async (e) => {
    e.preventDefault();

    const title = document.getElementById('game-title').value.trim();
    const desc = document.getElementById('game-desc').value.trim();

    const genres = [
        ...document.querySelectorAll('.genre-chip.selected')
    ].map(c => c.dataset.genre);

    const platforms = [
        ...document.querySelectorAll('.platform-chip.selected')
    ].map(c => c.dataset.platform);

    const status = document.querySelector('.status-card.selected')?.dataset.status || "draft";

    const tagline = document.getElementById('game-tagline').value.trim();

    const trailerUrl = document.getElementById('trailer-url').value.trim();

    const releaseDate = document.getElementById('release-date').value.trim();
    const ageRating = document.getElementById('age-rating').value.trim();
    const playerMode = document.getElementById('player-mode').value.trim();

    const coverFile = coverInput.files[0];

    // =================== VALIDAÇÕES ===================
    if (!title) {
        showToast('⚠️ Preencha o nome do jogo.', 'error');
        return;
    }

    if (!desc) {
        showToast('⚠️ Adicione uma descrição.', 'error');
        return;
    }

    if (!genres.length) {
        showToast('⚠️ Selecione um gênero.', 'error');
        return;
    }

    if (!platforms.length) {
        showToast('⚠️ Selecione uma plataforma.', 'error');
        return;
    }

    if (!coverFile) {
        showToast('⚠️ Envie a capa do jogo.', 'error');
        return;
    }

    const user = JSON.parse(localStorage.getItem("velora_user"));

    if (!user || user.account_type !== "developer") {
        showToast('⚠️ Você precisa estar logado como desenvolvedor.', 'error');
        return;
    }

    // =================== ENVIO ===================
    const formData = new FormData();

    formData.append("title", title);
    formData.append("description", desc);
    formData.append("genre", genres.join(", "));
    formData.append("platform", platforms.join(", "));
    formData.append("tags", JSON.stringify(tags));
    formData.append("status", status);
    formData.append("tagline", tagline);
    formData.append("trailer_url", trailerUrl);
    formData.append("release_date", releaseDate);
    formData.append("age_rating", ageRating);
    formData.append("player_mode", playerMode);
    formData.append("image", coverFile);
    const screenshotFiles = screenshotsInput.files;

    for (let i = 0; i < screenshotFiles.length; i++) {
    formData.append("screenshots", screenshotFiles[i]);
    }
    formData.append("developer_id", user.id);

    try {
    const submitBtn = document.querySelector(".submit-main-btn");

    submitBtn.disabled = true;
    submitBtn.innerHTML = `<i class="fas fa-spinner fa-spin"></i> Publicando...`;

    const response = await fetch("http://127.0.0.1:5000/add-game", {
        method: "POST",
        body: formData
    });

    const data = await response.json();
    console.log(data);

    if (!response.ok) {
        showToast(data.error || "❌ Erro ao salvar jogo.", "error");
        submitBtn.disabled = false;
        submitBtn.innerHTML = `<i class="fas fa-rocket"></i> Publicar jogo`;
        return;
    }

    showToast("🚀 Jogo publicado com sucesso!");

    setTimeout(() => {
        window.location.href = `Game.html?id=${data.game_id}`;
    }, 1200);

} catch (err) {
    console.error(err);
    showToast("❌ Erro ao salvar jogo.", "error");

    const submitBtn = document.querySelector(".submit-main-btn");
    submitBtn.disabled = false;
    submitBtn.innerHTML = `<i class="fas fa-rocket"></i> Publicar jogo`;
}
});