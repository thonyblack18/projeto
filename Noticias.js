// =================== CANVAS DE PARTÍCULAS ===================
const canvas = document.getElementById('particles');
const ctx    = canvas.getContext('2d');

canvas.width  = window.innerWidth;
canvas.height = window.innerHeight;

class Star {
    constructor() { this.reset(true); }

    reset(init) {
        this.x            = init ? Math.random() * canvas.width : -50;
        this.y            = Math.random() * canvas.height;
        this.size         = Math.random() * 1.8 + 0.4;
        this.speedX       = Math.random() * 0.7 + 0.3;
        this.opacity      = Math.random() * 0.5 + 0.3;
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
    canvas.width  = window.innerWidth;
    canvas.height = window.innerHeight;
});

// =================== MODAL DE ARTIGO (moderno) ===================
const articleModal   = document.getElementById('articleModal');
const modalClose     = document.getElementById('modalClose');
const modalCategory  = document.getElementById('modal-category');
const modalTitle     = document.getElementById('modal-title');
const modalMeta      = document.getElementById('modal-meta');
const modalImgPH     = document.getElementById('modal-img-placeholder');

// Mapas de label e cor por categoria
const categoryLabels = {
    lancamentos: '✦ Lançamentos',
    entrevistas: '✦ Entrevistas',
    eventos:     '✦ Eventos',
    bastidores:  '✦ Bastidores',
    industria:   '✦ Indústria',
};

window.openNews = function(el) {
    const title    = el.dataset.title    || 'Artigo em construção';
    const date     = el.dataset.date     || '—';
    const author   = el.dataset.author   || 'Equipe Velora';
    const category = el.dataset.category || '';
    const icon     = el.dataset.icon     || 'fas fa-newspaper';

    // Preenche modal
    modalCategory.textContent = categoryLabels[category] || '✦ Notícias';
    modalTitle.textContent    = title;
    modalImgPH.innerHTML      = `<i class="${icon}"></i>`;
    modalMeta.innerHTML = `
        <span><i class="fas fa-calendar-alt"></i> ${date}</span>
        <span><i class="fas fa-user"></i> ${author}</span>
        <span><i class="fas fa-clock"></i> Em breve</span>
    `;

    // Abre com animação
    articleModal.classList.add('active');
    document.body.style.overflow = 'hidden';
};

function closeModal() {
    articleModal.classList.remove('active');
    document.body.style.overflow = '';
}

modalClose?.addEventListener('click', closeModal);

// Fechar clicando fora do conteúdo
articleModal?.addEventListener('click', e => {
    if (e.target === articleModal) closeModal();
});

// Fechar com Esc
document.addEventListener('keydown', e => {
    if (e.key === 'Escape' && articleModal.classList.contains('active')) closeModal();
});

// =================== DROPDOWN DO USUÁRIO ===================
const userProfile  = document.getElementById('userProfile');
const userDropdown = document.getElementById('userDropdown');

if (userProfile && userDropdown) {
    userProfile.addEventListener('click', e => {
        e.stopPropagation();
        userDropdown.classList.toggle('active');
        userProfile.classList.toggle('active');
    });

    document.addEventListener('click', () => {
        userDropdown.classList.remove('active');
        userProfile.classList.remove('active');
    });

    userDropdown.addEventListener('click', e => e.stopPropagation());

    userDropdown.querySelectorAll('.dropdown-item').forEach(item => {
        item.addEventListener('click', () => {
            const text = item.querySelector('span').textContent;
            if (text === 'Sair') {
                alert('Logout realizado com sucesso!');
            } else {
                alert(`Navegando para: ${text}`);
            }
            userDropdown.classList.remove('active');
            userProfile.classList.remove('active');
        });
    });
}

// =================== LOGOS QUE NÃO CARREGAM ===================
document.getElementById('header-logo')?.addEventListener('error', function () { this.style.display = 'none'; });
document.getElementById('footer-logo')?.addEventListener('error', function () { this.style.display = 'none'; });

// =================== FILTROS POR CATEGORIA ===================
const filterChips = document.querySelectorAll('.chip');
let activeFilter  = 'todos';

filterChips.forEach(chip => {
    chip.addEventListener('click', () => {
        filterChips.forEach(c => c.classList.remove('active'));
        chip.classList.add('active');
        activeFilter = chip.dataset.filter;
        applyFilters();
    });
});

// =================== ORDENAÇÃO ===================
const sortSelect = document.getElementById('sort-select');
sortSelect?.addEventListener('change', applyFilters);

// =================== BUSCA ===================
const searchInput = document.getElementById('search-input');
searchInput?.addEventListener('input', applyFilters);

// =================== LÓGICA CENTRAL DE FILTRAGEM ===================
function applyFilters() {
    const query     = searchInput ? searchInput.value.trim().toLowerCase() : '';
    const sortValue = sortSelect  ? sortSelect.value : 'recentes';
    const newsGrid  = document.getElementById('news-grid');
    const allCards  = Array.from(newsGrid.querySelectorAll('.news-card'));

    // Remove estado vazio anterior
    newsGrid.querySelector('.empty-state')?.remove();

    // Filtra
    let visible = allCards.filter(card => {
        const category = card.dataset.category || '';
        const title    = (card.querySelector('.news-card-title')?.textContent || '').toLowerCase();
        const tag      = (card.querySelector('.news-tag')?.textContent || '').toLowerCase();

        const matchesFilter = activeFilter === 'todos' || category === activeFilter;
        const matchesSearch = !query || title.includes(query) || tag.includes(query);

        return matchesFilter && matchesSearch;
    });

    // Ordena
    if (sortValue === 'az') {
        visible.sort((a, b) => {
            const tA = a.querySelector('.news-card-title')?.textContent || '';
            const tB = b.querySelector('.news-card-title')?.textContent || '';
            return tA.localeCompare(tB, 'pt-BR');
        });
    } else if (sortValue === 'antigas') {
        visible.reverse();
    }

    // Esconde tudo, mostra filtrados
    allCards.forEach(c => {
        c.style.display   = 'none';
        c.style.opacity   = '0';
        c.style.transform = 'translateY(10px)';
    });

    if (visible.length === 0) {
        const empty = document.createElement('div');
        empty.className = 'empty-state';
        empty.innerHTML = `<i class="fas fa-newspaper"></i>Nenhuma notícia encontrada${query ? ` para "<strong>${query}</strong>"` : ''}.`;
        newsGrid.appendChild(empty);
    } else {
        visible.forEach((card, i) => {
            card.style.display = 'flex';
            setTimeout(() => {
                card.style.transition = 'opacity 0.3s ease, transform 0.3s ease';
                card.style.opacity    = '1';
                card.style.transform  = 'translateY(0)';
            }, i * 40);
        });
    }

    // Atualiza contador
    const countEl = document.getElementById('news-count');
    if (countEl) countEl.textContent = `${visible.length} artigo${visible.length !== 1 ? 's' : ''}`;
}

// =================== NEWSLETTER ===================
document.getElementById('newsletter-btn')?.addEventListener('click', () => {
    const emailEl = document.getElementById('newsletter-email');
    const val     = emailEl?.value.trim() || '';

    if (!val || !val.includes('@') || !val.includes('.')) {
        emailEl.style.borderColor = '#ef4444';
        emailEl.focus();
        setTimeout(() => emailEl.style.borderColor = '', 2000);
        return;
    }

    const btn = document.getElementById('newsletter-btn');
    btn.innerHTML = '<i class="fas fa-check"></i> Inscrito!';
    btn.style.background = 'linear-gradient(135deg, #22c55e, #16a34a)';
    emailEl.value = '';

    setTimeout(() => {
        btn.innerHTML = '<i class="fas fa-paper-plane"></i> Assinar grátis';
        btn.style.background = '';
    }, 3000);
});
