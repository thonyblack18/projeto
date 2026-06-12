const API_BASE = "http://127.0.0.1:5000";

// =========================
// API
// =========================
async function apiPost(path, body) {
    const res = await fetch(`${API_BASE}${path}`, {
        method: "POST",
        headers: {
            "Content-Type": "application/json"
        },
        body: JSON.stringify(body)
    });

    const data = await res.json().catch(() => ({}));

    if (!res.ok) {
        throw new Error(data?.error || `Erro ${res.status}`);
    }

    return data;
}

// =========================
// TOAST
// =========================
function showToast(message) {

    const toast = document.getElementById("toast");
    const toastMessage = toast?.querySelector(".toast-message");

    if (!toast || !toastMessage) {
        alert(message);
        return;
    }

    toastMessage.textContent = message;
    toast.classList.add("show");

    setTimeout(() => {
        toast.classList.remove("show");
    }, 4000);
}

// =========================
// MODO LOGIN / CADASTRO
// =========================
const modeBtns = document.querySelectorAll(".mode-btn");
const authForms = document.querySelectorAll(".auth-form");

modeBtns.forEach(btn => {

    btn.addEventListener("click", () => {

        const mode = btn.dataset.mode;

        modeBtns.forEach(b => b.classList.remove("active"));
        btn.classList.add("active");

        authForms.forEach(form => {

            form.classList.remove("active");

            if (form.id === `form-${mode}`) {
                form.classList.add("active");
            }

        });

    });

});

// =========================
// MOSTRAR SENHA
// =========================
document.querySelectorAll(".toggle-pwd").forEach(btn => {

    btn.addEventListener("click", function () {

        const input = this.parentElement.querySelector("input");
        const icon = this.querySelector("i");

        if (!input || !icon) return;

        if (input.type === "password") {

            input.type = "text";
            icon.classList.remove("fa-eye");
            icon.classList.add("fa-eye-slash");

        } else {

            input.type = "password";
            icon.classList.remove("fa-eye-slash");
            icon.classList.add("fa-eye");

        }

    });

});

// =========================
// TIPO DE CONTA
// =========================
const typeOptions = document.querySelectorAll(".type-option");
const playerFields = document.getElementById("player-fields");
const developerFields = document.getElementById("developer-fields");

function setRequired(container, required) {
    if (!container) return;

    container.querySelectorAll("input").forEach(input => {
        if (required) {
            input.setAttribute("required", "required");
        } else {
            input.removeAttribute("required");
        }
    });
}

// estado inicial
setRequired(playerFields, true);
setRequired(developerFields, false);

typeOptions.forEach(option => {
    option.addEventListener("click", () => {
        const type = option.dataset.type;

        typeOptions.forEach(o => o.classList.remove("active"));
        option.classList.add("active");

        if (type === "player") {
            playerFields?.classList.remove("hidden");
            developerFields?.classList.add("hidden");

            playerFields.querySelectorAll("input").forEach(i => i.required = true);
            developerFields.querySelectorAll("input").forEach(i => i.required = false);

        } else {
            playerFields?.classList.add("hidden");
            developerFields?.classList.remove("hidden");

            playerFields.querySelectorAll("input").forEach(i => i.required = false);
            developerFields.querySelectorAll("input").forEach(i => i.required = true);
        }
    });
});

// =========================
// TABS DE DESENVOLVEDOR
// =========================
const devTabs = document.querySelectorAll(".dev-tab");

devTabs.forEach(tab => {

    tab.addEventListener("click", () => {

        devTabs.forEach(t => t.classList.remove("active"));
        tab.classList.add("active");

    });

});

// =========================
// LOGIN
// =========================
document.getElementById("form-login")?.addEventListener("submit", async (e) => {

    e.preventDefault();

    const fd = new FormData(e.currentTarget);

    const login = (fd.get("login") || "").toString().trim();
    const password = (fd.get("password") || "").toString().trim();

    if (!login || !password) {
        showToast("❌ Preencha login e senha.");
        return;
    }

    try {

        showToast("🔄 Entrando...");

        const data = await apiPost("/api/login", {
            login,
            password
        });

        localStorage.setItem("velora_user", JSON.stringify(data.user));

        showToast("✅ Login realizado!");

        setTimeout(() => {
            window.location.href = "Catalogo.html";
        }, 800);

    } catch (err) {

        showToast(`❌ ${err.message}`);

    }

});

// =========================
// CADASTRO
// =========================
document.getElementById("form-register")?.addEventListener("submit", async (e) => {

    e.preventDefault();

    const form = e.currentTarget;
    const fd = new FormData(form);

    const accountType =
        document.querySelector('input[name="accountType"]:checked')?.value || "player";

    let password = "";
    let confirmPassword = "";

    if (accountType === "player") {
        password = fd.get("player_password")?.toString().trim() || "";
        confirmPassword = fd.get("player_confirm_password")?.toString().trim() || "";
    } else {
        password = fd.get("dev_password")?.toString().trim() || "";
        confirmPassword = fd.get("dev_confirm_password")?.toString().trim() || "";
    }

if (password !== confirmPassword) {
    showToast("❌ As senhas não coincidem.");
    return;
}

    try {
    // cadastro jogador
    if (accountType === "player") {
        const name = fd.get("full_name")?.toString().trim() || "";
        const username = fd.get("username")?.toString().trim() || "";
        const email = fd.get("player_email")?.toString().trim() || "";

        console.log({ name, username, email, password });

        if (!name || !username || !email || !password) {
        showToast("❌ Preencha todos os campos do jogador.");
        return;
        }

        showToast("🔄 Criando conta...");

        await apiPost("/api/register", {
        name,
        username,
        email,
        password
        });

    showToast("✅ Conta criada com sucesso!");
    form.reset();
}

    // cadastro desenvolvedor
    else {
        const name = fd.get("dev_display_name")?.toString().trim() || "";
        const email = fd.get("dev_email")?.toString().trim() || "";
        const website = fd.get("website")?.toString().trim() || "";

        const username = name.toLowerCase().replace(/\s+/g, "");

        if (!name || !email || !password) {
            showToast("❌ Preencha nome, email e senha.");
            return;
        }

        showToast("🔄 Criando conta de desenvolvedor...");

        await apiPost("/api/register", {
            name,
            username,
            email,
            password,
            website,
            accountType: "developer"
        });

        showToast("✅ Conta de desenvolvedor criada com sucesso!");
        form.reset();
    }

} catch (err) {
    showToast(`❌ ${err.message}`);
}

}); 

// =========================
// PARTÍCULAS / ESTRELAS
// =========================
(function () {
    const canvas = document.getElementById("particles");
    if (!canvas) return;
    const ctx = canvas.getContext("2d");
    let stars = [];

    function resize() {
        canvas.width = window.innerWidth;
        canvas.height = window.innerHeight;
    }

    function createStars() {
        stars = [];
        for (let i = 0; i < 120; i++) {
            stars.push({
                x: Math.random() * canvas.width,
                y: Math.random() * canvas.height,
                r: Math.random() * 1.5 + 0.3,
                alpha: Math.random(),
                speed: Math.random() * 0.3 + 0.05,
                drift: (Math.random() - 0.5) * 0.2
            });
        }
    }

    function draw() {
        ctx.clearRect(0, 0, canvas.width, canvas.height);
        stars.forEach(s => {
            ctx.beginPath();
            ctx.arc(s.x, s.y, s.r, 0, Math.PI * 2);
            ctx.fillStyle = `rgba(212, 175, 55, ${s.alpha})`;
            ctx.fill();
            s.y -= s.speed;
            s.x += s.drift;
            s.alpha += (Math.random() - 0.5) * 0.02;
            s.alpha = Math.max(0.1, Math.min(1, s.alpha));
            if (s.y < -5) { s.y = canvas.height + 5; s.x = Math.random() * canvas.width; }
            if (s.x < -5 || s.x > canvas.width + 5) { s.x = Math.random() * canvas.width; }
        });
        requestAnimationFrame(draw);
    }

    window.addEventListener("resize", () => { resize(); createStars(); });
    resize();
    createStars();
    draw();
})();

// =========================
// ESQUECI MINHA SENHA
// =========================

document.getElementById("forgotPasswordBtn")?.addEventListener("click", async (e) => {

    e.preventDefault();

    const email = prompt("Digite o e-mail cadastrado:");

    if (!email) return;

    try {

        const response = await fetch(`${API_BASE}/api/forgot-password`, {
            method: "POST",
            headers: {
                "Content-Type": "application/json"
            },
            body: JSON.stringify({
                email: email.trim()
            })
        });

        const data = await response.json();

        if (data.error) {
            showToast(`❌ ${data.error}`);
            return;
        }

        showToast("📧 Link de recuperação gerado!");

        console.log("LINK DE RECUPERAÇÃO:");
        console.log(data.dev_reset_link);

    } catch (err) {

        showToast("❌ Erro ao solicitar recuperação.");

    }

});