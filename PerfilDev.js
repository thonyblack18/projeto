// =================== CONFIGURAÇÃO DA API ===================
const API_BASE = "https://projeto-w9ao.onrender.com";

function getGameImageUrl(path) {
    if (!path) return "logo-velora.png";

    if (path.startsWith("http") || path.startsWith("data:")) {
        return path;
    }

    if (path.startsWith("uploads/")) {
        return `${API_BASE}/${path}`;
    }

    return path;
}
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

function setHref(id, href, fallbackText = "Não informado") {
    const el = document.getElementById(id);
    if (!el) return;

    if (href) {
        el.href = href;
        el.textContent = "Site oficial ↗";
        el.style.pointerEvents = "auto";
        el.style.opacity = "1";
    } else {
        el.href = "#";
        el.textContent = fallbackText;
        el.style.pointerEvents = "none";
        el.style.opacity = "0.7";
    }
}

function setStudioInitial(name) {
    const el = document.getElementById("studio-initial");
    if (!el) return;

    const source = name || "D";
    el.textContent = source.charAt(0).toUpperCase();
}

function setStudioType(devType) {
    const value = (devType || "").toLowerCase();
    const label = value === "studio" ? "Estúdio Independente" : "Desenvolvedor Solo";
    setText("studio-type", label);
}

function setLocation(city, state) {
    const parts = [city, state].filter(Boolean);
    setText("studio-location", parts.length ? parts.join(", ") : "Local não informado");
}

function setTagline(devType, foundationYear) {
    let text = "Perfil do desenvolvedor";

    if (devType === "studio" && foundationYear) {
        text = `Fundado em ${foundationYear}`;
    } else if (devType === "solo") {
        text = "Criando experiências indie";
    }

    setText("studio-tagline", text);
}

function setTechTags() {
    const container = document.getElementById("tech-tags");
    if (!container) return;

    container.innerHTML = "";

    ["Unity", "C#", "Aseprite", "Figma"].forEach(tag => {
        const span = document.createElement("span");
        span.className = "tech-tag";
        span.textContent = tag;
        container.appendChild(span);
    });
}

async function setStats(profile, userId) {

    try {

        const stats = await fetchJson(
            `${API_BASE}/api/profile/dev/${userId}/stats`
        );

        const gamesEl = document.getElementById("stat-games");
        const supportersEl = document.getElementById("stat-supporters");
        const monthsEl = document.getElementById("stat-months");

        let months = 0;

        if (profile.foundation_year) {
            const currentYear = new Date().getFullYear();
            months = Math.max(
                0,
                (currentYear - Number(profile.foundation_year)) * 12
            );
        }

        if (gamesEl) {
            gamesEl.textContent = stats.published_games || 0;
            gamesEl.dataset.target = stats.published_games || 0;
        }

        if (supportersEl) {
            supportersEl.textContent = stats.supporters || 0;
            supportersEl.dataset.target = stats.supporters || 0;
        }

        if (monthsEl) {
            monthsEl.textContent = months;
            monthsEl.dataset.target = months;
        }

    } catch (err) {
        console.error(err);
    }
}

function animateCounters() {
    const counters = document.querySelectorAll(".dev-stat-value[data-target]");

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
    const btn = document.getElementById("edit-dev-btn");
    if (!btn) return;

    btn.addEventListener("click", () => {
        window.location.href = "Configuracoes.html?type=developer";
    });
}

async function carregarJogosPublicados(userId) {
    const container = document.getElementById("published-games");
    if (!container) return;

    try {
        const data = await fetchJson(`${API_BASE}/api/games`);

        const jogosDoDev = (data.games || []).filter(game =>
            Number(game.developer_id) === Number(userId)
        );

        if (!jogosDoDev.length) {
            container.innerHTML = `
                <div class="empty-card">
                    <p>Nenhum jogo publicado ainda.</p>
                </div>
            `;
            return;
        }

        container.innerHTML = jogosDoDev.map(game => {
            const capa = game.cover_url
                ? getGameImageUrl(game.cover_url)
                : "logo-velora.png";

            return `
                <div class="portfolio-card" onclick="window.location.href='Game.html?id=${game.id}'">
                    <div class="portfolio-cover">
                        <img src="${capa}" alt="${game.title}">
                    </div>

                    <div class="portfolio-info">
                        <h3>${game.title}</h3>
                        <p>${game.genre || "Indie"}</p>
                        <span class="portfolio-rating">
                            <i class="fas fa-star"></i> ${game.rating || "0.0"}
                        </span>
                    </div>
                </div>
            `;
        }).join("");

    } catch (err) {
        console.error("Erro ao carregar jogos publicados:", err);
    }
}

// =================== CARREGAR PERFIL DEV ===================
async function carregarPerfilDev() {
    const user = getStoredUser();

    if (!user) {
        window.location.href = "LoginCadastro.html";
        return;
    }

    const params = new URLSearchParams(window.location.search);
    const devId = params.get("id") || user.id;

    try {
        const data = await fetchJson(`${API_BASE}/api/profile/dev/${devId}`);
        const profile = data.profile;

        // =================== FOTO DO PERFIL ===================
        const avatarImg = document.getElementById("avatarImg");
        const avatarInitial = document.getElementById("avatarInitial");

        let avatarUrl = profile.avatar_url || "";

            if (avatarUrl && !avatarUrl.startsWith("http")) {
                avatarUrl = `${API_BASE}/${avatarUrl}`;
            }
            
            if (avatarUrl && avatarImg && avatarInitial) {
                avatarImg.src = avatarUrl;
                avatarImg.style.display = "block";
                avatarInitial.style.display = "none";
            } else if (avatarImg && avatarInitial) {
                avatarImg.src = "";
                avatarImg.style.display = "none";
                avatarInitial.style.display = "flex";
            } 

        setText(
            "studio-name",
            profile.dev_display_name ||
            profile.display_name ||
            profile.name ||
            "Desenvolvedor"
        );

        setText(
            "studio-description",
            profile.studio_description,
            "Sem descrição cadastrada."
        );

        setStudioType(profile.dev_type);
        setLocation(profile.city, profile.state);
        setTagline(profile.dev_type, profile.foundation_year);

        setHref(
            "studio-site",
            profile.website,
            "Sem site oficial"
        );

        setHref(
            "link-website",
            profile.website,
            "Sem site oficial"
        );

        setStudioInitial(
            profile.dev_display_name ||
            profile.display_name ||
            profile.name
        );

        setTechTags();
        await setStats(profile, devId);
        await carregarJogosPublicados(devId);
        animateCounters();

    } catch (err) {

        console.error(
            "Erro ao carregar perfil dev:",
            err.message
        );

        setText(
            "studio-name",
            "Erro ao carregar"
        );

        setText(
            "studio-description",
            "Não foi possível carregar o perfil do desenvolvedor."
        );

        setText(
            "studio-location",
            "Local não informado"
        );
    }
}
async function uploadAvatar() {
    const user = getStoredUser();
    const input = document.getElementById("avatarInput");

    if (!user || !input || !input.files.length) return;

    const formData = new FormData();

    formData.append("user_id", user.id);
    formData.append("account_type", user.account_type);
    formData.append("avatar", input.files[0]);

    const res = await fetch(`${API_BASE}/api/upload-avatar`, {
        method: "POST",
        body: formData
    });

    const data = await res.json();

    if (data.error) {
        alert(data.error);
        return;
    }

    const avatarUrl = data.avatar_url.startsWith("http")
    ? data.avatar_url
    : `${API_BASE}/${data.avatar_url}`;

    const updatedUser = {
        ...user,
        profile_photo: avatarUrl
    };

    localStorage.setItem(
        "velora_user",
        JSON.stringify(updatedUser)
    );

    const avatarImg = document.getElementById("avatarImg");
    const avatarInitial = document.getElementById("avatarInitial");

    if (avatarImg && avatarInitial) {
        avatarImg.src = avatarUrl;
        avatarImg.style.display = "block";
        avatarInitial.style.display = "none";
    }

    alert("Foto de perfil atualizada!");
}

function configurarUploadAvatar() {

    const avatarArea = document.querySelector(".studio-logo-wrap");
    const input = document.getElementById("avatarInput");

    if (!avatarArea || !input) return;

    avatarArea.style.cursor = "pointer";

    avatarArea.addEventListener("click", () => {
        input.click();
    });

    input.addEventListener("change", uploadAvatar);
}

function carregarAvatarHeader() {
    const headerAvatarImg = document.getElementById("headerAvatarImg");
    const userAvatarInitial = document.getElementById("userAvatarInitial");

    const user = getStoredUser() || {};
    const foto = user.profile_photo || "";
    const nome = (user.display_name || user.name || user.username || "D").trim();

    if (foto && headerAvatarImg && userAvatarInitial) {
        headerAvatarImg.src = foto;
        headerAvatarImg.style.display = "block";
        userAvatarInitial.style.display = "none";
    } else if (userAvatarInitial) {
        userAvatarInitial.textContent = nome.charAt(0).toUpperCase();
        userAvatarInitial.style.display = "flex";

        if (headerAvatarImg) {
            headerAvatarImg.src = "";
            headerAvatarImg.style.display = "none";
        }
    }
}

function configurarDropdownUsuario() {
    const userProfile = document.getElementById("userProfile");
    const userDropdown = document.getElementById("userDropdown");

    if (!userProfile || !userDropdown) return;

    userProfile.addEventListener("click", (e) => {
        e.stopPropagation();
        userDropdown.classList.toggle("active");
        userProfile.classList.toggle("active");
    });

    userDropdown.addEventListener("click", (e) => {
        e.stopPropagation();
    });

    document.addEventListener("click", () => {
        userDropdown.classList.remove("active");
        userProfile.classList.remove("active");
    });

    const dropSair = document.getElementById("dropSair");

dropSair?.addEventListener("click", () => {
    localStorage.removeItem("velora_user");
    localStorage.removeItem("velora_favoritos_ids");
    window.location.href = "LoginCadastro.html";
});
}

// =================== INICIAR ===================
setupEditButton();
configurarUploadAvatar();
carregarPerfilDev();
carregarAvatarHeader();
configurarDropdownUsuario();
