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

// =================== ANIMAÇÃO DE ENTRADA DOS CARDS ===================
const observerOptions = {
    threshold: 0.1,
    rootMargin: '0px 0px -40px 0px'
};

const fadeObserver = new IntersectionObserver((entries) => {
    entries.forEach((entry, i) => {
        if (entry.isIntersecting) {
            entry.target.style.transition = `opacity 0.5s ease ${i * 0.07}s, transform 0.5s ease ${i * 0.07}s`;
            entry.target.style.opacity   = '1';
            entry.target.style.transform = 'translateY(0)';
            fadeObserver.unobserve(entry.target);
        }
    });
}, observerOptions);

// Aplica animação de entrada nos cards de dev e missão
document.querySelectorAll('.dev-card, .missao-card, .stat-card').forEach(card => {
    card.style.opacity   = '0';
    card.style.transform = 'translateY(24px)';
    fadeObserver.observe(card);
});

// =================== MENU/DROPDOWN PADRÃO DANDARA ===================
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

const userProfile = document.getElementById("userProfile");
const userDropdown = document.getElementById("userDropdown");
const userName = document.getElementById("userName");
const userAvatarInitial = document.getElementById("userAvatarInitial");

const headerUserAvatar = document.getElementById("headerUserAvatar");

try {
    const user = JSON.parse(localStorage.getItem("velora_user"));

    if (user && userName) {
        userName.textContent =
            user.account_type === "developer"
            ? "Desenvolvedor"
            : "Jogador";
    }

    if (user?.profile_photo && headerUserAvatar && userAvatarInitial) {
        let foto = user.profile_photo;

        if (!foto.startsWith("http")) {
            foto = `http://127.0.0.1:5000/${foto}`;
        }

        headerUserAvatar.src = foto;
        headerUserAvatar.style.display = "block";
        userAvatarInitial.style.display = "none";

    } else if (user && userAvatarInitial) {
        const nome = user.display_name || user.name || user.username || "J";

        userAvatarInitial.textContent = nome.charAt(0).toUpperCase();
        userAvatarInitial.style.display = "flex";

        if (headerUserAvatar) {
            headerUserAvatar.src = "";
            headerUserAvatar.style.display = "none";
        }
    }

} catch (e) {}

if (userProfile && userDropdown) {
    userProfile.addEventListener("click", (e) => {
        e.stopPropagation();
        userDropdown.classList.toggle("active");
        userProfile.classList.toggle("active");
    });

    document.addEventListener("click", () => {
        userDropdown.classList.remove("active");
        userProfile.classList.remove("active");
    });

    userDropdown.addEventListener("click", (e) => e.stopPropagation());
}

document.getElementById("dropMeuPerfil")?.addEventListener("click", () => {
    let user = null;
    try { user = JSON.parse(localStorage.getItem("velora_user")); } catch (e) {}

    if (!user) {
        window.location.href = "LoginCadastro.html";
    } else if (user.account_type === "developer") {
        window.location.href = "PerfilDev.html";
    } else {
        window.location.href = "PerfilUsuario.html";
    }
});

document.getElementById("dropSair")?.addEventListener("click", () => {
    localStorage.removeItem("velora_user");
    window.location.href = "LoginCadastro.html";
});

document.getElementById("btnFavoritos")?.addEventListener("click", () => {
    window.location.href = "ListaFavoritos.html";
});
