// =================== CONFIGURAÇÃO DA API ===================
const API_BASE = "http://127.0.0.1:5000";

// =================== CANVAS DE PARTÍCULAS ===================
const canvas = document.getElementById("particles");
const ctx = canvas?.getContext("2d");

if (canvas && ctx) {
    canvas.width = window.innerWidth;
    canvas.height = window.innerHeight;

    const stars = [];
    const starCount = 150;

    class Star {
        constructor() {
            this.x = Math.random() * canvas.width;
            this.y = Math.random() * canvas.height;
            this.size = Math.random() * 2 + 0.5;
            this.speedX = Math.random() * 0.8 + 0.4;
            this.opacity = Math.random() * 0.6 + 0.4;
            this.twinkleSpeed = Math.random() * 0.03 + 0.01;
            this.twinklePhase = Math.random() * Math.PI * 2;
            this.currentOpacity = this.opacity;
        }

        update() {
            this.x += this.speedX;
            this.twinklePhase += this.twinkleSpeed;

            const twinkle = Math.sin(this.twinklePhase);
            this.currentOpacity = this.opacity + (twinkle * 0.3);

            if (this.x > canvas.width + 50) {
                this.x = -50;
                this.y = Math.random() * canvas.height;
            }
        }

        draw() {
            ctx.fillStyle = `rgba(255, 255, 255, ${this.currentOpacity})`;
            ctx.beginPath();
            ctx.arc(this.x, this.y, this.size, 0, Math.PI * 2);
            ctx.fill();
        }
    }

    function initStars() {
        for (let i = 0; i < starCount; i++) {
            stars.push(new Star());
        }
    }

    function animateStars() {
        ctx.clearRect(0, 0, canvas.width, canvas.height);

        for (let i = 0; i < stars.length; i++) {
            stars[i].update();
            stars[i].draw();
        }

        requestAnimationFrame(animateStars);
    }

    window.addEventListener("resize", () => {
        canvas.width = window.innerWidth;
        canvas.height = window.innerHeight;
    });

    initStars();
    animateStars();
}

// =================== HELPERS ===================
function getStoredUser() {
    try {
        return JSON.parse(localStorage.getItem("velora_user"));
    } catch (e) {
        return null;
    }
}

async function fetchJson(url) {
    const res = await fetch(url);
    const data = await res.json().catch(() => ({}));

    if (!res.ok) {
        throw new Error(data?.error || `Erro ${res.status}`);
    }

    return data;
}

function setText(id, value, fallback = "") {
    const el = document.getElementById(id);
    if (el) el.textContent = value || fallback;
}

function renderGenres(genresString) {
    const container = document.getElementById("favorite-genres");
    if (!container) return;

    container.innerHTML = "";

    const genres = (genresString || "")
        .split(",")
        .map(g => g.trim())
        .filter(Boolean);

    if (genres.length === 0) {
        const span = document.createElement("span");
        span.className = "tag";
        span.textContent = "Sem gêneros";
        container.appendChild(span);
        return;
    }

    genres.forEach(genre => {
        const span = document.createElement("span");
        span.className = "tag";
        span.textContent = genre;
        container.appendChild(span);
    });
}

function setAvatarInitial(profile) {
    const avatar = document.getElementById("avatar-initial");
    if (!avatar) return;

    const source = profile.display_name || profile.name || profile.username || "U";
    avatar.textContent = source.charAt(0).toUpperCase();
}

function setStats() {
    const currentYear = new Date().getFullYear();

    const stats = [
        { id: "stat-avaliados", value: 0 },
        { id: "stat-apoiados", value: 0 },
        { id: "stat-comentarios", value: 0 },
        { id: "stat-membro-desde", value: currentYear }
    ];

    stats.forEach(stat => {
        const el = document.getElementById(stat.id);
        if (!el) return;
        el.textContent = stat.value;
        el.dataset.target = stat.value;
    });
}

function animateCounters() {
    const counters = document.querySelectorAll(".stat-value[data-target]");

    const observer = new IntersectionObserver((entries) => {
        entries.forEach(entry => {
            if (!entry.isIntersecting) return;

            const el = entry.target;
            const target = parseInt(el.dataset.target || "0", 10);
            const duration = 900;
            const start = performance.now();

            function update(now) {
                const elapsed = now - start;
                const progress = Math.min(elapsed / duration, 1);
                const eased = 1 - Math.pow(1 - progress, 3);
                el.textContent = Math.floor(eased * target);

                if (progress < 1) {
                    requestAnimationFrame(update);
                } else {
                    el.textContent = target;
                }
            }

            requestAnimationFrame(update);
            observer.unobserve(el);
        });
    }, { threshold: 0.5 });

    counters.forEach(counter => observer.observe(counter));
}

function setupEditButton() {
    const btn = document.getElementById("edit-profile-btn");
    if (!btn) return;

    btn.addEventListener("click", () => {
        window.location.href = "Configuracoes.html";
    });
}

// =================== CARREGAR PERFIL ===================
async function carregarPerfil() {
    const user = getStoredUser();

    if (!user) {
        window.location.href = "LoginCadastro.html";
        return;
    }

    try {
        const data = await fetchJson(`${API_BASE}/api/profile/user/${user.id}`);
        const profile = data.data;

        setText("fullname", profile.display_name || profile.name || profile.username || "Usuário");
setText("username", `@${profile.username || "usuario"}`);
setText("bio", profile.bio, "Sem bio cadastrada.");
setText("country", profile.country, "País não informado");

        renderGenres(profile.favorite_genres);
        setAvatarInitial(profile);
        setStats();
        animateCounters();
    } catch (err) {
        console.error("Erro ao carregar perfil:", err.message);
        setText("fullname", "Erro ao carregar");
        setText("username", "@erro");
        setText("bio", "Não foi possível carregar o perfil.");
        setText("country", "País não informado");
    }
}
//foto do perfil
function carregarAvatarPerfil() {
    const avatarImg = document.getElementById("profileAvatarImg");
    const avatarInitial = document.getElementById("profileAvatarInitial");

    let user = {};
    try {
        user = JSON.parse(localStorage.getItem("velora_user")) || {};
    } catch (e) {
        user = {};
    }

    const foto = user.profile_photo || "";
    const nome = (user.display_name || user.name || user.username || "U").trim();
    const inicial = nome.charAt(0).toUpperCase();

    if (foto && avatarImg) {
        avatarImg.src = foto;
        avatarImg.style.display = "block";
        if (avatarInitial) avatarInitial.style.display = "none";
    } else {
        if (avatarImg) {
            avatarImg.src = "";
            avatarImg.style.display = "none";
        }
        if (avatarInitial) {
            avatarInitial.textContent = inicial;
            avatarInitial.style.display = "block";
        }
    }
}

document.addEventListener("DOMContentLoaded", carregarAvatarPerfil);
// =================== INICIAR ===================
setupEditButton();
carregarPerfil();