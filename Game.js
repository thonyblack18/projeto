const API_BASE = "https://projeto-w9ao.onrender.com";

function getImageUrl(path) {
    if (!path) return "logo-velora.png";

    if (
        path.startsWith("http") ||
        path.startsWith("data:")
    ) {
        return path;
    }

    return `${API_BASE}/${path}`;
}

function getAvatarUrl(path) {
    if (!path) return "https://i.pravatar.cc/80";

    if (
        path.startsWith("http") ||
        path.startsWith("data:")
    ) {
        return path;
    }

    return `${API_BASE}/${path}`;
}

const params = new URLSearchParams(window.location.search);
const gameId = params.get("id");

let slides = [];
let thumbs = [];
let currentSlide = 0;
let selectedRating = 0;

function atualizarGaleria(index) {
    if (!slides.length || !thumbs.length) return;

    slides.forEach(slide => {
        slide.style.display = "none";
    });

    thumbs.forEach(thumb => {
        thumb.classList.remove("active");
    });

    slides[index].style.display = "block";
    thumbs[index].classList.add("active");
    currentSlide = index;
}

function normalizarYoutube(url) {
    if (!url) return null;

    let videoId = "";

    if (url.includes("watch?v=")) {
        videoId = url.split("watch?v=")[1];
    } else if (url.includes("youtu.be/")) {
        videoId = url.split("youtu.be/")[1];
    } else if (url.includes("embed/")) {
        videoId = url.split("embed/")[1];
    }

    if (videoId.includes("&")) videoId = videoId.split("&")[0];
    if (videoId.includes("?")) videoId = videoId.split("?")[0];

    if (!videoId) return null;

    return {
        embed: `https://www.youtube.com/embed/${videoId}`,
        thumb: `https://img.youtube.com/vi/${videoId}/hqdefault.jpg`
    };
}

function formatarDescricao(texto) {
    if (!texto) return "";

    return texto
        .replace(/&/g, "&amp;")
        .replace(/</g, "&lt;")
        .replace(/>/g, "&gt;")
        .replace(/\[y\](.*?)\[\/y\]/g, '<span class="yellow-text">$1</span>')
        .replace(/\[b\](.*?)\[\/b\]/g, '<strong>$1</strong>')
        .replace(/\n/g, "<br>");
}

function getFavoritos() {
    try {
        return JSON.parse(localStorage.getItem("velora_favoritos_ids") || "[]");
    } catch (e) {
        return [];
    }
}

function salvarFavoritos(lista) {
    localStorage.setItem("velora_favoritos_ids", JSON.stringify(lista));
}

function atualizarBotaoFavorito() {
    const btnWishlist = document.getElementById("btnWishlist");
    const wishlistIcon = document.getElementById("wishlistIcon");
    const wishlistText = document.getElementById("wishlistText");

    if (!btnWishlist || !wishlistIcon || !wishlistText) return;

    const jogoKey = `api:${gameId}`;
    const favoritos = getFavoritos();
    const isFav = favoritos.includes(jogoKey);

    wishlistIcon.className = isFav ? "fas fa-heart-broken" : "far fa-heart";
    wishlistText.textContent = isFav ? "Remover dos Favoritos" : "Adicionar aos Favoritos";
    btnWishlist.classList.toggle("favorited", isFav);
}

function configurarFavorito() {
    const btnWishlist = document.getElementById("btnWishlist");
    const jogoKey = `api:${gameId}`;

    btnWishlist?.addEventListener("click", (e) => {
        e.preventDefault();

        let favoritos = getFavoritos();

        if (favoritos.includes(jogoKey)) {
            favoritos = favoritos.filter(id => id !== jogoKey);
        } else {
            favoritos.push(jogoKey);
        }

        salvarFavoritos(favoritos);
        atualizarBotaoFavorito();
    });

    atualizarBotaoFavorito();
}

function configurarNavegacao() {
    const catalogoCorreto = "Catalogo.html";

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

    document.getElementById("btnFavoritos")?.addEventListener("click", () => {
        window.location.href = "ListaFavoritos.html";
    });
}

function mostrarToast(mensagem) {
    const toast = document.getElementById("toast");

    toast.innerHTML = `<i class="fas fa-check-circle"></i> ${mensagem}`;
    toast.classList.add("show");

    setTimeout(() => {
        toast.classList.remove("show");
    }, 3000);
}

function configurarDropdownUsuario() {
    const userProfile = document.getElementById("userProfile");
    const userDropdown = document.getElementById("userDropdown");

    if (!userProfile || !userDropdown) return;

    userProfile.addEventListener("click", (e) => {
        e.stopPropagation();
        userDropdown.classList.toggle("active");
    });

    document.addEventListener("click", () => {
        userDropdown.classList.remove("active");
    });
}

function renderizarGaleria(game) {

    document.getElementById("game-cover").src = getImageUrl(game.cover_url);

    const galleryTrack = document.getElementById("galleryTrack");
    const galleryThumbs = document.getElementById("galleryThumbs");

    galleryTrack.innerHTML = "";
    galleryThumbs.innerHTML = "";

    let mediaIndex = 0;

    const trailer = normalizarYoutube(game.trailer_url);

    if (trailer) {
        galleryTrack.innerHTML += `
            <div class="gallery-slide active" data-index="${mediaIndex}">
                <iframe
                    class="slide-video"
                    src="${trailer.embed}"
                    title="Trailer"
                    frameborder="0"
                    allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
                    allowfullscreen>
                </iframe>

                <div class="slide-label">
                    <i class="fas fa-play"></i> Trailer
                </div>
            </div>
        `;

        galleryThumbs.innerHTML += `
            <div class="thumb active" data-index="${mediaIndex}">
                <img src="${trailer.thumb}" alt="Trailer">
            </div>
        `;

        mediaIndex++;
    }

    const mainImage = game.banner_url
        ? getImageUrl(game.banner_url)
        : getImageUrl(game.cover_url);

    galleryTrack.innerHTML += `
        <div class="gallery-slide ${mediaIndex === 0 ? "active" : ""}" data-index="${mediaIndex}">
            <img src="${mainImage}" class="slide-img" alt="${game.title}">

            <div class="slide-label">
                <i class="fas fa-image"></i> Imagem principal
            </div>
        </div>
    `;

    galleryThumbs.innerHTML += `
        <div class="thumb ${mediaIndex === 0 ? "active" : ""}" data-index="${mediaIndex}">
            <img src="${getImageUrl(game.cover_url)}" alt="${game.title}">
        </div>
    `;

    mediaIndex++;

    let screenshots = [];

    try {
        screenshots = JSON.parse(game.screenshots || "[]");
    } catch (e) {
        screenshots = [];
    }

    screenshots.forEach((shot) => {
        const shotUrl = getImageUrl(shot);

        galleryTrack.innerHTML += `
            <div class="gallery-slide" data-index="${mediaIndex}">
                <img src="${shotUrl}" class="slide-img" alt="Screenshot">

                <div class="slide-label">
                    <i class="fas fa-camera"></i> Screenshot
                </div>
            </div>
        `;

        galleryThumbs.innerHTML += `
            <div class="thumb" data-index="${mediaIndex}">
                <img src="${shotUrl}" alt="Screenshot">
            </div>
        `;

        mediaIndex++;
    });

    slides = document.querySelectorAll(".gallery-slide");
    thumbs = document.querySelectorAll(".thumb");

    thumbs.forEach((thumb, index) => {
        thumb.addEventListener("click", () => {
            atualizarGaleria(index);
        });
    });

    document.getElementById("arrowRight")?.addEventListener("click", () => {
        let next = currentSlide + 1;
        if (next >= slides.length) next = 0;
        atualizarGaleria(next);
    });

    document.getElementById("arrowLeft")?.addEventListener("click", () => {
        let prev = currentSlide - 1;
        if (prev < 0) prev = slides.length - 1;
        atualizarGaleria(prev);
    });

    atualizarGaleria(0);
}

function renderizarComentarios(reviews) {
    const commentsList = document.getElementById("commentsList");

    commentsList.innerHTML = "";

    if (!reviews.length) {
        commentsList.innerHTML = `
            <button class="btn-load-more">
                Ainda não há comentários
            </button>
        `;
        return;
    }

    reviews.forEach(review => {
        let estrelas = "";

        for (let i = 1; i <= 5; i++) {
            estrelas += `<i class="${i <= review.rating ? "fas" : "far"} fa-star"></i>`;
        }

        commentsList.innerHTML += `
            <div class="comment-card">
                <div class="comment-header">
                    <img
                        class="comment-avatar"
                        src="${getAvatarUrl(review.avatar_url)}"
                        onerror="this.src='https://i.pravatar.cc/80'">

                    <div class="comment-meta">
                        <strong>${review.user_name}</strong>
                        <span class="comment-date">
                            ${new Date(review.created_at).toLocaleDateString("pt-BR")}
                        </span>
                    </div>

                    <div class="comment-stars">
                        ${estrelas}
                    </div>
                </div>

                <div class="comment-text">
                    ${review.review_text || ""}
                </div>
            </div>
        `;
    });
}

function carregarAvatarHeader() {
    const avatarImg = document.getElementById("headerUserAvatar");
    const avatarInitial = document.getElementById("headerAvatarInitial");
    const userName = document.getElementById("headerUserName");

    let user = {};

    try {
        user = JSON.parse(localStorage.getItem("velora_user")) || {};
    } catch (e) {
        user = {};
    }

    const foto = user.profile_photo || "";
    const nome = (user.display_name || user.name || user.username || "Jogador").trim();

    if (userName) {
        userName.textContent = user.account_type === "developer" ? "Desenvolvedor" : "Jogador";
    }

    if (foto && avatarImg && avatarInitial) {
        avatarImg.src = foto;
        avatarImg.style.display = "block";
        avatarInitial.style.display = "none";
    } else if (avatarInitial) {
        avatarInitial.textContent = nome.charAt(0).toUpperCase();
        avatarInitial.style.display = "flex";

        if (avatarImg) {
            avatarImg.src = "";
            avatarImg.style.display = "none";
        }
    }
}

function carregarAvaliacoes() {
    fetch(`${API_BASE}/api/games/${gameId}/reviews`)
        .then(r => r.json())
        .then(data => {

            document.getElementById("game-rating").textContent =
                data.summary.average_rating;

            document.getElementById("rating-big-number").textContent =
                data.summary.average_rating;

            document.querySelector(".rating-count").textContent =
                `(${data.summary.total_reviews} avaliações)`;

                const reviews = data.reviews || [];
                const total = reviews.length;

                for (let nota = 5; nota >= 1; nota--) {
                    const qtd = reviews.filter(r => Number(r.rating) === nota).length;
                    const porcentagem = total > 0 ? Math.round((qtd / total) * 100) : 0;

                    const index = 5 - nota;
                    const barRow = document.querySelectorAll(".bar-row")[index];

                    if (barRow) {
                        barRow.querySelector(".bar-fill").style.width = `${porcentagem}%`;
                        barRow.querySelector("span:last-child").textContent = `${porcentagem}%`;
                    }
                }

            renderizarComentarios(data.reviews);
        });
}

function configurarAvaliacoes() {

    const estrelas = document.querySelectorAll("#starPicker i");

    estrelas.forEach(star => {

        star.addEventListener("click", () => {

            selectedRating = Number(star.dataset.star);

            estrelas.forEach(s => {
                if (Number(s.dataset.star) <= selectedRating) {
                    s.className = "fas fa-star selected";
                } else {
                    s.className = "far fa-star";
                }
            });

        });

    });

    document.getElementById("btnSubmitReview")
        .addEventListener("click", () => {

            const usuario = JSON.parse(
                localStorage.getItem("velora_user") || "null"
            );

            if (!usuario) {
                alert("Faça login para avaliar.");
                return;
            }

            const review_text =
                document.querySelector(".review-textarea").value;

            fetch(`${API_BASE}/api/games/${gameId}/reviews`, {
                method: "POST",
                headers: {
                    "Content-Type": "application/json"
                },
                body: JSON.stringify({
                    user_id: usuario.id,
                    rating: selectedRating,
                    review_text
                })
            })
            .then(r => r.json())
            .then(data => {

                if (data.error) {
                    alert(data.error);
                    return;
                }

                document.querySelector(".review-textarea").value = "";

                estrelas.forEach(s => {
                    s.className = "far fa-star";
                });

                selectedRating = 0;

                carregarAvaliacoes();

                if (review_text.trim() !== "") {
                    mostrarToast("Seu comentário foi publicado!");
                } else {
                    mostrarToast("Sua avaliação foi publicada!");
                }
            });

        });

}

fetch(`${API_BASE}/api/games/${gameId}`)
    .then(response => response.json())
    .then(data => {
        const game = data.game;
        
        console.log("TRAILER:", game.trailer_url);
        
        if (!game) {
            document.body.innerHTML = `
                <h1 style="color:white;text-align:center;margin-top:100px;font-family:Arial;">
                    Jogo não encontrado.
                </h1>
            `;
            return;
        }

        document.title = `Velora | ${game.title}`;

        document.getElementById("game-title").textContent = game.title;

        const descriptionEl = document.getElementById("game-description");

        const description = game.description || game.short_description || "Sem descrição.";

        descriptionEl.innerHTML = formatarDescricao(description)
            .split(/\n+/)
            .filter(paragrafo => paragrafo.trim() !== "")
            .map(paragrafo => `<p>${paragrafo.trim()}</p>`)
            .join("");

        document.getElementById("game-genre").textContent = game.genre || "Indie";
        document.getElementById("detail-genre").textContent = game.genre || "Indie";

        document.getElementById("game-rating").textContent = game.rating || "5.0";
        document.getElementById("rating-big-number").textContent = game.rating || "5.0";

        document.getElementById("breadcrumb-title").textContent = game.title;

        document.getElementById("game-developer").textContent =
            game.developer_name || "Desenvolvedor Velora";

        document.getElementById("detail-developer").textContent =
            game.developer_name || "Desenvolvedor Velora";

        document.getElementById("game-platforms").textContent =
            game.platform || "Não informado";

        document.getElementById("detail-platforms").textContent =
            game.platform || "Não informado";
        
        console.log(game.release_date);

        let release = "Não informado";

        if (game.release_date) {
            release = new Date(game.release_date).toLocaleDateString("pt-BR", {
                day: "2-digit",
                month: "short",
                year: "numeric",
                timeZone: "UTC"
            });
        }

        document.getElementById("game-release").textContent = release;
        document.getElementById("detail-release").textContent = release;
        
        const ageRating = game.age_rating || "Livre";

        document.getElementById("game-age").textContent = ageRating;
        document.getElementById("detail-age").textContent = ageRating;

        const playerMode = game.player_mode || "Não informado";

        document.getElementById("detail-player-mode").textContent = playerMode;

        const tagsContainer = document.getElementById("game-tags");

        let gameTags = [];

        try {
            gameTags = JSON.parse(game.tags || "[]");
        } catch (e) {
            gameTags = [];
        }

        if (!gameTags.length && game.genre) {
            gameTags = game.genre.split(",").map(tag => tag.trim());
        }

        tagsContainer.innerHTML = gameTags.length
            ? gameTags.map(tag => `<span class="tag">${tag}</span>`).join("")
    : `<span class="tag">Indie</span>`;

        renderizarGaleria(game);

        const currentUser = JSON.parse(localStorage.getItem("velora_user") || "null");

        if (
            currentUser &&
            currentUser.account_type === "developer" &&
            Number(currentUser.id) === Number(game.developer_id)
        ) {
            const detailsCard = document.querySelector(".details-table")?.closest(".section-card");

            if (detailsCard) {
                const editBtn = document.createElement("button");
                editBtn.className = "edit-game-btn";
                editBtn.innerHTML = `<i class="fas fa-edit"></i> Editar jogo`;

                editBtn.addEventListener("click", () => {
                    window.location.href = `EditarJogo.html?id=${game.id}`;
                });

                detailsCard.appendChild(editBtn);
            }
        }
    })
    .catch(error => {
        console.error(error);

        document.body.innerHTML = `
            <h1 style="color:white;text-align:center;margin-top:100px;font-family:Arial;">
                Erro ao carregar jogo.
            </h1>
        `;
    });

configurarNavegacao();
configurarFavorito();
configurarAvaliacoes();
carregarAvaliacoes();
configurarDropdownUsuario();
carregarAvatarHeader();
