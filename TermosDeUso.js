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

// =================== LOGO FALLBACK ===================
// Header logo
const headerLogo = document.getElementById('header-logo');
const logoPlaceholder = document.getElementById('logo-placeholder');
if (headerLogo && logoPlaceholder) {
    headerLogo.addEventListener('error', () => {
        headerLogo.style.display = 'none';
        logoPlaceholder.style.display = 'flex';
    });
    // Se a imagem já falhou antes do listener (cache)
    if (headerLogo.complete && headerLogo.naturalWidth === 0) {
        headerLogo.style.display = 'none';
        logoPlaceholder.style.display = 'flex';
    }
}

// Footer logo
const footerLogo = document.getElementById('footer-logo');
const footerLogoPlaceholder = document.getElementById('footer-logo-placeholder');
if (footerLogo && footerLogoPlaceholder) {
    footerLogo.addEventListener('error', () => {
        footerLogo.style.display = 'none';
        footerLogoPlaceholder.style.display = 'flex';
    });
    if (footerLogo.complete && footerLogo.naturalWidth === 0) {
        footerLogo.style.display = 'none';
        footerLogoPlaceholder.style.display = 'flex';
    }
}

// =================== SIDEBAR – SCROLL SUAVE ===================
const sidebarLinks = document.querySelectorAll('.sidebar-link');

sidebarLinks.forEach(link => {
    link.addEventListener('click', () => {
        const targetId = link.dataset.target;
        const target   = document.getElementById(targetId);
        if (!target) return;

        target.scrollIntoView({ behavior: 'smooth', block: 'start' });

        sidebarLinks.forEach(l => l.classList.remove('active'));
        link.classList.add('active');
    });
});

// =================== SIDEBAR – ACTIVE AO SCROLL ===================
const sections = document.querySelectorAll('.termos-card[id]');

const observerOptions = {
    root: null,
    rootMargin: '-30% 0px -60% 0px',
    threshold: 0
};

const observer = new IntersectionObserver(entries => {
    entries.forEach(entry => {
        if (entry.isIntersecting) {
            const id = entry.target.id;
            sidebarLinks.forEach(link => {
                link.classList.toggle('active', link.dataset.target === id);
            });
        }
    });
}, observerOptions);

sections.forEach(sec => observer.observe(sec));

// =================== BOTÃO ACEITAR ===================
const acceptBtn = document.getElementById('accept-btn');
if (acceptBtn) {
    acceptBtn.addEventListener('click', () => {
        acceptBtn.innerHTML = '<i class="fas fa-check"></i> Termos Aceitos!';
        acceptBtn.classList.add('accepted');
    });
}