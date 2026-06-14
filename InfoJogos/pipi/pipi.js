/* ============================================================
   InfoJogo.js — Velora | Página de Detalhes do Jogo
   ============================================================ */

(function () {
    'use strict';

    // =================== GALERIA ===================
    const track       = document.getElementById('galleryTrack');
    const thumbs      = document.querySelectorAll('#galleryThumbs .thumb');
    const arrowLeft   = document.getElementById('arrowLeft');
    const arrowRight  = document.getElementById('arrowRight');
    const iframe      = document.getElementById('youtubeIframe');
    const totalSlides = thumbs.length; // 0..5
    let currentIndex  = 0;
    let autoTimer     = null;

    /** Move para um slide específico */
    function goToSlide(index) {
        // Para o vídeo do YouTube ao sair do slide do trailer
        if (currentIndex === 0 && index !== 0 && iframe) {
            iframe.contentWindow.postMessage(
                '{"event":"command","func":"pauseVideo","args":""}', '*'
            );
        }

        currentIndex = index;
        track.style.transform = `translateX(-${currentIndex * 100}%)`;

        // Atualiza thumbnails
        thumbs.forEach(t => t.classList.remove('active'));
        thumbs[currentIndex].classList.add('active');

        // Setas: desabilita nos extremos
        arrowLeft.disabled  = currentIndex === 0;
        arrowRight.disabled = currentIndex === totalSlides - 1;
    }

    /** Avança 1 slide */
    function nextSlide() {
        if (currentIndex < totalSlides - 1) goToSlide(currentIndex + 1);
    }

    /** Retrocede 1 slide */
    function prevSlide() {
        if (currentIndex > 0) goToSlide(currentIndex - 1);
    }

    // Cliques nas setas
    arrowLeft.addEventListener('click',  prevSlide);
    arrowRight.addEventListener('click', nextSlide);

    // Cliques nas thumbnails
    thumbs.forEach(thumb => {
        thumb.addEventListener('click', () => {
            const index = parseInt(thumb.dataset.index, 10);
            goToSlide(index);
            resetAutoPlay();
        });
    });

    // Teclado: setas
    document.addEventListener('keydown', e => {
        if (e.key === 'ArrowLeft')  { prevSlide(); resetAutoPlay(); }
        if (e.key === 'ArrowRight') { nextSlide(); resetAutoPlay(); }
    });

    // Swipe touch
    let touchStartX = 0;
    const wrapper = document.getElementById('galleryWrapper');
    wrapper.addEventListener('touchstart', e => { touchStartX = e.touches[0].clientX; });
    wrapper.addEventListener('touchend',   e => {
        const delta = touchStartX - e.changedTouches[0].clientX;
        if (Math.abs(delta) > 40) {
            if (delta > 0) nextSlide();
            else           prevSlide();
            resetAutoPlay();
        }
    });

    // Auto-play (pula slides de imagem a cada 5s, ignora o trailer)
    function startAutoPlay() {
        autoTimer = setInterval(() => {
            if (currentIndex === 0) return; // não muda enquanto está no trailer
            if (currentIndex < totalSlides - 1) nextSlide();
            else goToSlide(1); // volta ao primeiro screenshot
        }, 5000);
    }

    function resetAutoPlay() {
        clearInterval(autoTimer);
        startAutoPlay();
    }

    // Estado inicial
    goToSlide(0);
    arrowLeft.disabled = true;
    startAutoPlay();


    // =================== FAVORITAR ===================
    const btnWishlist  = document.getElementById('btnWishlist');
    const wishlistIcon = document.getElementById('wishlistIcon');
    const wishlistText = document.getElementById('wishlistText');

    btnWishlist.addEventListener('click', () => {
        const isFav = btnWishlist.classList.toggle('favorited');
        wishlistIcon.className = isFav ? 'fas fa-heart' : 'far fa-heart';
        wishlistText.textContent = isFav ? 'Nos Favoritos ✓' : 'Adicionar aos Favoritos';
        showToast(isFav
            ? '<i class="fas fa-heart"></i> Adicionado aos favoritos!'
            : '<i class="far fa-heart"></i> Removido dos favoritos'
        );
    });


    // =================== STAR PICKER ===================
    const starPicker = document.getElementById('starPicker');
    const stars      = starPicker.querySelectorAll('i');
    let selectedRating = 0;

    stars.forEach(star => {
        // Hover
        star.addEventListener('mouseover', () => {
            const val = parseInt(star.dataset.star, 10);
            stars.forEach((s, i) => {
                s.className = i < val ? 'fas fa-star hovered' : 'far fa-star';
            });
        });

        // Mouse out — restaura estado selecionado
        star.addEventListener('mouseout', () => {
            stars.forEach((s, i) => {
                s.className = i < selectedRating ? 'fas fa-star selected' : 'far fa-star';
            });
        });

        // Clique
        star.addEventListener('click', () => {
            selectedRating = parseInt(star.dataset.star, 10);
            stars.forEach((s, i) => {
                s.className = i < selectedRating ? 'fas fa-star selected' : 'far fa-star';
            });
        });
    });

    // Publicar avaliação
    const btnSubmit = document.getElementById('btnSubmitReview');
    btnSubmit.addEventListener('click', () => {
        const textarea = document.querySelector('.review-textarea');
        const text     = textarea.value.trim();

        if (!selectedRating) { showToast('<i class="fas fa-exclamation-circle"></i> Selecione uma nota antes de publicar.'); return; }
        if (!text)            { showToast('<i class="fas fa-exclamation-circle"></i> Escreva um comentário.'); return; }

        // Insere comentário no DOM
        const starsHtml = Array.from({ length: 5 }, (_, i) =>
            `<i class="${i < selectedRating ? 'fas' : 'far'} fa-star"></i>`
        ).join('');

        const newCard = document.createElement('div');
        newCard.className = 'comment-card';
        newCard.innerHTML = `
            <div class="comment-header">
                <img src="https://i.pravatar.cc/40?img=22" alt="Você" class="comment-avatar">
                <div class="comment-meta">
                    <strong>Você</strong>
                    <span class="comment-date">agora mesmo</span>
                </div>
                <div class="comment-stars">${starsHtml}</div>
            </div>
            <p class="comment-text">${escapeHtml(text)}</p>
            <div class="comment-actions">
                <button class="like-btn"><i class="fas fa-thumbs-up"></i> 0</button>
                <button class="reply-btn"><i class="fas fa-reply"></i> Responder</button>
            </div>
        `;

        const list    = document.getElementById('commentsList');
        const loadBtn = document.getElementById('btnLoadMore');
        list.insertBefore(newCard, list.firstChild);

        // Reset form
        textarea.value = '';
        selectedRating = 0;
        stars.forEach(s => s.className = 'far fa-star');

        // Eventos no novo comentário
        bindCommentActions(newCard);
        showToast('<i class="fas fa-check-circle"></i> Avaliação publicada!');
    });


    // =================== LIKE NOS COMENTÁRIOS ===================
    function bindCommentActions(card) {
        const likeBtn = card.querySelector('.like-btn');
        if (!likeBtn) return;
        likeBtn.addEventListener('click', () => {
            const isLiked = likeBtn.classList.toggle('liked');
            const num     = parseInt(likeBtn.textContent.trim().split(' ')[1], 10) || 0;
            likeBtn.innerHTML = `<i class="fas fa-thumbs-up"></i> ${isLiked ? num + 1 : num - 1}`;
        });
    }

    document.querySelectorAll('.comment-card').forEach(bindCommentActions);

    // Carregar mais comentários (simulado)
    const extraComments = [
        { avatar: 28, name: 'ExplorerX', date: 'há 1 semana', rating: 5, text: 'Viciante demais, curti.' },
    ];
    let extraLoaded = false;

    document.getElementById('btnLoadMore').addEventListener('click', function () {
        if (extraLoaded) { showToast('Não há mais comentários.'); return; }

        const list = document.getElementById('commentsList');
        extraComments.forEach(c => {
            const starsHtml = Array.from({ length: 5 }, (_, i) =>
                `<i class="${i < c.rating ? 'fas' : 'far'} fa-star"></i>`
            ).join('');

            const card = document.createElement('div');
            card.className = 'comment-card';
            card.innerHTML = `
                <div class="comment-header">
                    <img src="https://i.pravatar.cc/40?img=${c.avatar}" alt="${c.name}" class="comment-avatar">
                    <div class="comment-meta"><strong>${c.name}</strong><span class="comment-date">${c.date}</span></div>
                    <div class="comment-stars">${starsHtml}</div>
                </div>
                <p class="comment-text">${c.text}</p>
                <div class="comment-actions">
                    <button class="like-btn"><i class="fas fa-thumbs-up"></i> ${Math.floor(Math.random() * 30)}</button>
                    <button class="reply-btn"><i class="fas fa-reply"></i> Responder</button>
                </div>
            `;
            list.insertBefore(card, this);
            bindCommentActions(card);
        });

        extraLoaded = true;
        this.textContent = 'Sem mais comentários';
        this.style.opacity = '0.4';
        this.style.cursor  = 'default';
    });


    // =================== MODAL DE DOAÇÃO ===================
// =================== MODAL DE DOAÇÃO ===================
const donateModal   = document.getElementById('donateModal');
const closeDonate   = document.getElementById('closeDonateModal');
const confirmDonate = document.getElementById('confirmDonate');
const customAmount  = document.getElementById('customAmount');

const MIN_DONATE = 0.10;
const MAX_DONATE = 5000000;

let selectedAmount = 10;

function formatMoney(value) {
    return value.toLocaleString('pt-BR', {
        minimumFractionDigits: 2,
        maximumFractionDigits: 2
    });
}

function updateDonateButton() {
    confirmDonate.innerHTML =
        `<i class="fas fa-heart"></i> Confirmar Doação de R$ ${formatMoney(selectedAmount)}`;
}

function createDonationWarning() {
    if (!customAmount) return;

    let warning = document.getElementById('donationWarning');

    if (!warning) {
        warning = document.createElement('p');
        warning.id = 'donationWarning';
        warning.className = 'modal-note';
        warning.innerHTML = '<i class="fas fa-info-circle"></i> Valor mínimo: R$ 0,10';
        customAmount.insertAdjacentElement('afterend', warning);
    }
}

function showDonationWarning(message) {
    let warning = document.getElementById('donationWarning');

    if (!warning) {
        createDonationWarning();
        warning = document.getElementById('donationWarning');
    }

    warning.innerHTML = `<i class="fas fa-exclamation-circle"></i> ${message}`;

    clearTimeout(warning.timeout);

    warning.timeout = setTimeout(() => {
        warning.innerHTML = '<i class="fas fa-info-circle"></i> Valor mínimo: R$ 0,10';
    }, 3000);
}

createDonationWarning();
updateDonateButton();

// Abre o modal
[document.getElementById('btnDonate'), document.getElementById('btnDonateAside')]
    .forEach(btn => btn && btn.addEventListener('click', () => {
        donateModal.classList.add('active');
    }));

// Fecha o modal
closeDonate.addEventListener('click', () => {
    donateModal.classList.remove('active');
});

donateModal.addEventListener('click', e => {
    if (e.target === donateModal) {
        donateModal.classList.remove('active');
    }
});

// Botões de valor do modal
document.querySelectorAll('#modalAmounts .amount-btn').forEach(btn => {
    btn.addEventListener('click', () => {
        document.querySelectorAll('#modalAmounts .amount-btn')
            .forEach(b => b.classList.remove('active'));

        btn.classList.add('active');

        selectedAmount = parseFloat(btn.dataset.amount);
        customAmount.value = '';

        updateDonateButton();
    });
});

// Valor personalizado
customAmount.addEventListener('input', () => {
    let val = parseFloat(customAmount.value.replace(',', '.'));

    document.querySelectorAll('#modalAmounts .amount-btn')
        .forEach(b => b.classList.remove('active'));

    if (isNaN(val)) {
        selectedAmount = MIN_DONATE;
        updateDonateButton();
        return;
    }

    if (val > MAX_DONATE) {
        showDonationWarning('O valor máximo permitido é R$ 5.000.000,00.');
        val = MAX_DONATE;
        customAmount.value = MAX_DONATE;
    }

    selectedAmount = val;
    updateDonateButton();
});

// Quando sair do campo, corrige se estiver abaixo ou acima
customAmount.addEventListener('blur', () => {
    let val = parseFloat(customAmount.value.replace(',', '.'));

    if (isNaN(val)) return;

    if (val < MIN_DONATE) {
        showDonationWarning('O valor mínimo permitido é R$ 0,10.');
        selectedAmount = MIN_DONATE;
        customAmount.value = MIN_DONATE.toFixed(2);
    } else if (val > MAX_DONATE) {
        showDonationWarning('O valor máximo permitido é R$ 5.000.000,00.');
        selectedAmount = MAX_DONATE;
        customAmount.value = MAX_DONATE;
    } else {
        selectedAmount = val;
    }

    updateDonateButton();
});

// Confirmar doação
confirmDonate.addEventListener('click', () => {
    if (selectedAmount < MIN_DONATE) {
        showDonationWarning('O valor mínimo permitido é R$ 0,10.');
        return;
    }

    if (selectedAmount > MAX_DONATE) {
        showDonationWarning('O valor máximo permitido é R$ 5.000.000,00.');
        return;
    }

    donateModal.classList.remove('active');

    showToast(
        `<i class="fas fa-heart"></i> Obrigado pelo apoio de R$ ${formatMoney(selectedAmount)}! ❤️`
    );
});

// Seleção de valor no card lateral
document.querySelectorAll('#donateAmountsAside .amount-btn').forEach(btn => {
    btn.addEventListener('click', () => {
        document.querySelectorAll('#donateAmountsAside .amount-btn')
            .forEach(b => b.classList.remove('active'));

        btn.classList.add('active');

        selectedAmount = parseFloat(btn.dataset.amount);

        document.getElementById('btnDonateAside').innerHTML =
            `<i class="fas fa-hand-holding-heart"></i> Apoiar com R$ ${formatMoney(selectedAmount)}`;

        updateDonateButton();
    });
});

document.getElementById('btnDonateAside').addEventListener('click', () => {
    donateModal.classList.add('active');
});


    // =================== TOAST ===================
    function showToast(html) {
        const toast = document.getElementById('toast');
        toast.innerHTML = html;
        toast.classList.add('show');
        setTimeout(() => toast.classList.remove('show'), 3200);
    }


    // =================== ESCAPE HTML ===================
    function escapeHtml(str) {
        const map = { '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#039;' };
        return str.replace(/[&<>"']/g, m => map[m]);
    }


    // =================== LOGO ERROR ===================
    const headerLogo = document.getElementById('header-logo');
    if (headerLogo) headerLogo.addEventListener('error', function () { this.style.display = 'none'; });


    // =================== ANIMAÇÃO DAS BARRAS ===================
    // Aciona as barras de rating quando entram na viewport
    const observer = new IntersectionObserver(entries => {
        entries.forEach(entry => {
            if (entry.isIntersecting) {
                entry.target.querySelectorAll('.bar-fill').forEach(bar => {
                    const target = bar.style.width;
                    bar.style.width = '0';
                    setTimeout(() => { bar.style.width = target; }, 80);
                });
                observer.unobserve(entry.target);
            }
        });
    }, { threshold: 0.2 });

    const ratingSection = document.querySelector('.ratings-overview');
    if (ratingSection) observer.observe(ratingSection);


    // =================== DROPDOWN DO USUÁRIO ===================
    const userProfile = document.getElementById('userProfile');
    const userDropdown = document.getElementById('userDropdown');

    if (userProfile && userDropdown) {
        userProfile.style.position = 'relative';

        userProfile.addEventListener('click', (e) => {
            e.stopPropagation();
            userDropdown.classList.toggle('active');
            userProfile.classList.toggle('active');
        });

        document.addEventListener('click', () => {
            userDropdown.classList.remove('active');
            userProfile.classList.remove('active');
        });

        userDropdown.addEventListener('click', (e) => e.stopPropagation());

        // =================== MEU PERFIL — sobe duas pastas até Velora-main/ ===================
        document.getElementById('dropMeuPerfil')?.addEventListener('click', () => {
            let user = null;
            try { user = JSON.parse(localStorage.getItem("velora_user")); } catch (e) {}

            if (!user) {
                window.location.href = "../../LoginCadastro.html";
            } else if (user.account_type === "developer") {
                window.location.href = "../../PerfilDev.html";
            } else {
                window.location.href = "../../PerfilUsuario.html";
            }
        });

        // =================== SUPORTE — sobe duas pastas até Velora-main/ ===================
        document.getElementById('dropSuporte')?.addEventListener('click', () => {
            window.location.href = "../../SuporteUsuario.html";
        });

        // =================== SAIR ===================
        document.getElementById('dropSair')?.addEventListener('click', () => {
            localStorage.removeItem("velora_user");
            window.location.href = "../../LoginCadastro.html";
        });
    }

document.addEventListener("DOMContentLoaded", () => {

    const btnWishlist = document.getElementById("btnWishlist");
    const wishlistIcon = document.getElementById("wishlistIcon");
    const wishlistText = document.getElementById("wishlistText");

    const JOGO_ID = 1; // Dandara

    function getFavoritos() {
        try {
            return JSON.parse(localStorage.getItem("velora_favoritos_ids") || "[]");
        } catch (e) {
            return [];
        }
    }

    function salvarFavoritos(lista) {
        localStorage.setItem("velora_favoritos_ids", JSON.stringify(lista));
        console.log("Favoritos salvos:", lista);
    }

    function atualizarBotao() {
        const favoritos = getFavoritos();
        const isFav = favoritos.includes(JOGO_ID);

        if (isFav) {
            wishlistIcon.classList.remove("far");
            wishlistIcon.classList.add("fas");
            wishlistText.textContent = "Remover dos Favoritos";
            btnWishlist.classList.add("favorited");
        } else {
            wishlistIcon.classList.remove("fas");
            wishlistIcon.classList.add("far");
            wishlistText.textContent = "Adicionar aos Favoritos";
            btnWishlist.classList.remove("favorited");
        }
    }

    btnWishlist.addEventListener("click", (e) => {
        e.preventDefault();

        let favoritos = getFavoritos();

        if (favoritos.includes(JOGO_ID)) {
            favoritos = favoritos.filter(id => id !== JOGO_ID);
        } else {
            favoritos.push(JOGO_ID);
        }

        salvarFavoritos(favoritos);s
        atualizarBotao();
    });

    atualizarBotao();
});
})();

const btnFavoritos = document.getElementById("btnFavoritos");

btnFavoritos?.addEventListener("click", () => {
    window.location.href = "../../ListaFavoritos.html";
});

const btnWishlist = document.getElementById("btnWishlist");
const wishlistIcon = document.getElementById("wishlistIcon");
const wishlistText = document.getElementById("wishlistText");

const GAME_ID = 1;

// pegar favoritos
function getFavoritos() {
    return JSON.parse(localStorage.getItem("velora_favoritos")) || [];
}

// salvar favoritos
function setFavoritos(lista) {
    localStorage.setItem("velora_favoritos", JSON.stringify(lista));
}

// verificar se já está favoritado
function isFavorito(id) {
    return getFavoritos().includes(id);
}

// atualizar visual do botão
function updateWishlistUI() {
    if (isFavorito(GAME_ID)) {
        wishlistIcon.classList.remove("far");
        wishlistIcon.classList.add("fas");
        wishlistText.textContent = "Remover dos Favoritos";
    } else {
        wishlistIcon.classList.remove("fas");
        wishlistIcon.classList.add("far");
        wishlistText.textContent = "Adicionar aos Favoritos";
    }
}

// clique do botão
btnWishlist?.addEventListener("click", () => {
    let favoritos = getFavoritos();

    if (isFavorito(GAME_ID)) {
        favoritos = favoritos.filter(id => id !== GAME_ID);
    } else {
        favoritos.push(GAME_ID);
    }

    setFavoritos(favoritos);
    updateWishlistUI();
});
function getCatalogoCorreto() {
    let user = null;

    try {
        user = JSON.parse(localStorage.getItem("velora_user"));
    } catch (e) {}

    if (user && user.account_type === "developer") {
        return "../../CatalogoDev.html";
    }

    return "../../Catalogo.html";
}

const catalogoCorreto = getCatalogoCorreto();

document.getElementById("linkInicio")?.addEventListener("click", (e) => {
    e.preventDefault();
    window.location.href = catalogoCorreto;
});

document.getElementById("linkJogos")?.addEventListener("click", (e) => {
    e.preventDefault();
    window.location.href = catalogoCorreto;
});

document.getElementById("breadcrumbInicio")?.addEventListener("click", (e) => {
    e.preventDefault();
    window.location.href = catalogoCorreto;
});

document.getElementById("breadcrumbJogos")?.addEventListener("click", (e) => {
    e.preventDefault();
    window.location.href = catalogoCorreto;
});
// carregar estado ao abrir página
updateWishlistUI();

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