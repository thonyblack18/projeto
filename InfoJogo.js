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
        { avatar: 28, name: 'AnaBR_Play', date: 'há 2 semanas', rating: 5, text: 'Que jogo incrível! Fiquei emocionada com a história e a referência histórica. Precisa de mais jogos assim.' },
        { avatar: 33, name: 'GamerZé',    date: 'há 3 semanas', rating: 4, text: 'Muito bom, só achei a curva de dificuldade um pouco abrupta no início. Mas depois que pega o jeito, é viciante!' },
        { avatar: 41, name: 'DonaPixel',  date: 'há 1 mês',    rating: 5, text: 'Arte pixel deslumbrante. A Long Hat House é talentosa demais. Jogo obrigatório para qualquer fã de indie.' },
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
    const donateModal   = document.getElementById('donateModal');
    const closeDonate   = document.getElementById('closeDonateModal');
    const confirmDonate = document.getElementById('confirmDonate');
    const customAmount  = document.getElementById('customAmount');

    let selectedAmount = 10;

    // Abre o modal (botões)
    [document.getElementById('btnDonate'), document.getElementById('btnDonateAside')]
        .forEach(btn => btn && btn.addEventListener('click', () => {
            donateModal.classList.add('active');
        }));

    closeDonate.addEventListener('click', () => donateModal.classList.remove('active'));
    donateModal.addEventListener('click', e => { if (e.target === donateModal) donateModal.classList.remove('active'); });

    // Seleção de valor no modal
    document.querySelectorAll('#modalAmounts .amount-btn').forEach(btn => {
        btn.addEventListener('click', () => {
            document.querySelectorAll('#modalAmounts .amount-btn').forEach(b => b.classList.remove('active'));
            btn.classList.add('active');
            selectedAmount = parseInt(btn.dataset.amount, 10);
            customAmount.value = '';
            confirmDonate.innerHTML = `<i class="fas fa-heart"></i> Confirmar Doação de R$ ${selectedAmount}`;
        });
    });

    // Input valor personalizado
    customAmount.addEventListener('input', () => {
        const val = parseInt(customAmount.value, 10);
        if (val > 0) {
            document.querySelectorAll('#modalAmounts .amount-btn').forEach(b => b.classList.remove('active'));
            selectedAmount = val;
            confirmDonate.innerHTML = `<i class="fas fa-heart"></i> Confirmar Doação de R$ ${val}`;
        }
    });

    // Confirmar doação
    confirmDonate.addEventListener('click', () => {
        donateModal.classList.remove('active');
        showToast(`<i class="fas fa-heart"></i> Obrigado pelo apoio de R$ ${selectedAmount}! ❤️`);
    });

    // Seleção de valor no card aside
    document.querySelectorAll('#donateAmountsAside .amount-btn').forEach(btn => {
        btn.addEventListener('click', () => {
            document.querySelectorAll('#donateAmountsAside .amount-btn').forEach(b => b.classList.remove('active'));
            btn.classList.add('active');
            const val = btn.dataset.amount;
            document.getElementById('btnDonateAside').innerHTML =
                `<i class="fas fa-hand-holding-heart"></i> Apoiar com R$ ${val}`;
            selectedAmount = parseInt(val, 10);
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


    // =================== ESC FECHA MODAL ===================
    document.addEventListener('keydown', e => {
        if (e.key === 'Escape') donateModal.classList.remove('active');
    });

    
document.addEventListener("DOMContentLoaded", () => {
    const game = localStorage.getItem("gameSelecionado");

    if (game) {
        const title = document.querySelector(".game-title-hero");

        if (title) {
            title.textContent = game;
        }
    }
});

})();
