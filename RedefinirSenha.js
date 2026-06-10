const API_BASE = "http://127.0.0.1:5000";

async function apiPost(path, body) {
    const res = await fetch(`${API_BASE}${path}`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(body)
    });

    const data = await res.json().catch(() => ({}));

    if (!res.ok) {
        throw new Error(data?.error || `Erro ${res.status}`);
    }

    return data;
}

function showToast(message, type = "success") {
    const toast = document.getElementById("toast");
    const toastMessage = toast?.querySelector(".toast-message");

    if (!toast || !toastMessage) {
        alert(message);
        return;
    }

    toast.classList.remove("error", "loading");
    if (type) toast.classList.add(type);

    toastMessage.textContent = message;
    toast.classList.add("show");

    setTimeout(() => {
        toast.classList.remove("show");
    }, 4000);
}

document.querySelector(".toast-close")?.addEventListener("click", () => {
    document.getElementById("toast")?.classList.remove("show");
});

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

document.getElementById("form-reset-password")?.addEventListener("submit", async (e) => {
    e.preventDefault();

    const fd = new FormData(e.currentTarget);

    const email = (fd.get("email") || "").toString().trim();
    const token = (fd.get("token") || "").toString().trim();
    const password = (fd.get("password") || "").toString().trim();
    const confirmPassword = (fd.get("confirm_password") || "").toString().trim();

    if (!email || !token || !password || !confirmPassword) {
        showToast("Preencha todos os campos.", "error");
        return;
    }

    if (password.length < 8) {
        showToast("A senha precisa ter pelo menos 8 caracteres.", "error");
        return;
    }

    if (password !== confirmPassword) {
        showToast("As senhas não coincidem.", "error");
        return;
    }

    try {
        showToast("Redefinindo senha...", "loading");

        await apiPost("/api/reset-password", {
            email,
            token,
            password
        });

        showToast("Senha redefinida com sucesso!");

        setTimeout(() => {
            window.location.href = "LoginCadastro.html";
        }, 1200);

    } catch (err) {
        showToast(err.message || "Erro ao redefinir senha.", "error");
    }
});

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

            if (s.y < -5) {
                s.y = canvas.height + 5;
                s.x = Math.random() * canvas.width;
            }

            if (s.x < -5 || s.x > canvas.width + 5) {
                s.x = Math.random() * canvas.width;
            }
        });

        requestAnimationFrame(draw);
    }

    window.addEventListener("resize", () => {
        resize();
        createStars();
    });

    resize();
    createStars();
    draw();
})();
