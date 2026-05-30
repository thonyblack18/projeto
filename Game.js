const API_BASE = "http://127.0.0.1:5000";

const params = new URLSearchParams(window.location.search);
const gameId = params.get("id");

let slides = [];
let thumbs = [];
let currentSlide = 0;

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

function renderizarGaleria(game) {
    document.getElementById("game-cover").src = game.cover_url;

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

    galleryTrack.innerHTML += `
        <div class="gallery-slide ${mediaIndex === 0 ? "active" : ""}" data-index="${mediaIndex}">
            <img src="${game.banner_url || game.cover_url}" class="slide-img" alt="${game.title}">

            <div class="slide-label">
                <i class="fas fa-image"></i> Imagem principal
            </div>
        </div>
    `;

    galleryThumbs.innerHTML += `
        <div class="thumb ${mediaIndex === 0 ? "active" : ""}" data-index="${mediaIndex}">
            <img src="${game.cover_url}" alt="${game.title}">
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
        galleryTrack.innerHTML += `
            <div class="gallery-slide" data-index="${mediaIndex}">
                <img src="${API_BASE}/${shot}" class="slide-img" alt="Screenshot">

                <div class="slide-label">
                    <i class="fas fa-camera"></i> Screenshot
                </div>
            </div>
        `;

        galleryThumbs.innerHTML += `
            <div class="thumb" data-index="${mediaIndex}">
                <img src="${API_BASE}/${shot}" alt="Screenshot">
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

fetch(`${API_BASE}/api/games/${gameId}`)
    .then(response => response.json())
    .then(data => {
        const game = data.game;

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

        descriptionEl.innerHTML = description
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

        const release = game.release_date || "Não informado";

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