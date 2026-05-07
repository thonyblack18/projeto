/* ============================================
   Minigames.js — Velora
   ============================================ */

document.addEventListener('DOMContentLoaded', () => {
    initDropdown();
    animateCards();
});

// =================== DROPDOWN =================== 
function initDropdown() {
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
            userDropdown.classList.toggle('active');
            userProfile.classList.toggle('active');
        });
        document.addEventListener('click', () => {
            userDropdown.classList.remove('active');
            userProfile.classList.remove('active');
        });
        userDropdown.addEventListener('click', e => e.stopPropagation());
    }

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
}

// =================== ANIMAÇÃO DE ENTRADA ===================
function animateCards() {
    const cards = document.querySelectorAll('.game-card');
    cards.forEach((card, i) => {
        card.style.opacity = '0';
        card.style.transform = 'translateY(28px)';
        card.style.transition = `opacity 0.5s ease ${i * 90}ms, transform 0.5s ease ${i * 90}ms`;
        setTimeout(() => {
            card.style.opacity = '1';
            card.style.transform = 'translateY(0)';
        }, 80);
    });
}

console.log('🎮 Velora Minigames — carregado!');