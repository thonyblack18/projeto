let user = null;

try {
    user = JSON.parse(localStorage.getItem("velora_user"));
} catch (e) {}

if (!user) {
    window.location.href = "LoginCadastro.html";
} else if (user.account_type !== "developer") {
    window.location.href = "Catalogo.html"; 
}

// =================== FAVORITAR JOGOS ===================


// =================== CLIQUE NO CARD DO JOGO ===================
const gamesGrid = document.querySelector(".games-grid");

fetch("Game.json")

  .then(res => res.json())

  .then(games => {

    gamesGrid.innerHTML = "";

    const gamesCount = document.getElementById("gamesCount");

    if (gamesCount) {
        gamesCount.textContent = `${games.length} jogos disponíveis`;
    }
    games.forEach(game => {

      gamesGrid.innerHTML += `

        <a href="${game.page ? game.page : `Game.html?id=${game.id}`}" class="game-card-link">

          <div class="game-card">

            <div class="game-image">

              <img
                src="${game.image}"
                alt="${game.title}"
                class="game-logo"
              >

              <button class="favorite-btn" data-id="json:${game.id}">
                <i class="far fa-heart"></i>
              </button>

            </div>

            <div class="game-info">

              <h3 class="game-title">
                ${game.title}
              </h3>

              <div class="game-meta">

                <span class="game-genre">
                  ${game.genre}
                </span>

                <span class="game-rating">
                  ⭐ ${game.rating}
                </span>

              </div>

            </div>

          </div>

        </a>

      `;
    });

    const favoriteBtns =
  document.querySelectorAll('.favorite-btn');

let favoritosIds =
  JSON.parse(localStorage.getItem('velora_favoritos_ids') || '[]');

favoriteBtns.forEach(btn => {

  const jogoId = btn.dataset.id;
  const icon = btn.querySelector('i');

  if (favoritosIds.includes(jogoId)) {
    btn.classList.add('favorited');
    icon.classList.remove('far');
    icon.classList.add('fas');
  }

  btn.addEventListener('click', (e) => {

    e.preventDefault();
    e.stopPropagation();

    if (favoritosIds.includes(jogoId)) {
      favoritosIds = favoritosIds.filter(id => id !== jogoId);

      btn.classList.remove('favorited');
      icon.classList.remove('fas');
      icon.classList.add('far');

    } else {
      favoritosIds.push(jogoId);

      btn.classList.add('favorited');
      icon.classList.remove('far');
      icon.classList.add('fas');
    }

    localStorage.setItem(
      'velora_favoritos_ids',
      JSON.stringify(favoritosIds)
      );
     });
    });
  });

// =================== BUSCA DE JOGOS ===================
const searchInput = document.querySelector('.search-box input');

searchInput?.addEventListener('input', (e) => {
    const searchTerm = e.target.value.toLowerCase();
    const gameCards = document.querySelectorAll('.game-card-link');

    gameCards.forEach(card => {
        const title = card.querySelector('.game-title').textContent.toLowerCase();
        const genre = card.querySelector('.game-genre').textContent.toLowerCase();
        
        if (title.includes(searchTerm) || genre.includes(searchTerm)) {
            card.style.display = 'flex';
        } else {
            card.style.display = 'none';
        }
    });
});

// =================== ORDENAÇÃO DE JOGOS ===================
const sortSelect = document.querySelector('.sort-select');

sortSelect?.addEventListener('change', (e) => {
    const sortType = e.target.value;
    const gamesGrid = document.querySelector('.games-grid');
    const gameCards = document.querySelectorAll('.game-card');
    const cardsArray = Array.from(gameCards);
    
    cardsArray.sort((a, b) => {
        const titleA = a.querySelector('.game-title').textContent;
        const titleB = b.querySelector('.game-title').textContent;
        const ratingA = parseFloat(a.querySelector('.game-rating').textContent.split(' ')[1]);
        const ratingB = parseFloat(b.querySelector('.game-rating').textContent.split(' ')[1]);
        
        switch(sortType) {
            case 'Mais populares':
                return ratingB - ratingA;
            case 'A-Z':
                return titleA.localeCompare(titleB);
            case 'Z-A':
                return titleB.localeCompare(titleA);
            default:
                return 0;
        }
    });
    
    cardsArray.forEach(card => gamesGrid.appendChild(card));
});

// =================== NAVEGAÇÃO DO MENU ===================
const navItems = document.querySelectorAll('.nav-item');

navItems.forEach(item => {
    item.addEventListener('click', (e) => {
        e.preventDefault();
        
        navItems.forEach(nav => nav.classList.remove('active'));
        item.classList.add('active');
        
        console.log('Navegando para:', item.textContent.trim());
    });
});

// =================== BOTÃO DE FILTRO (ABRE MODAL) ===================
const filterBtn = document.querySelector('.filter-btn');
const filterModal = document.getElementById('filterModal');
const closeModal = document.getElementById('closeModal');
const clearFilters = document.getElementById('clearFilters');
const applyFilters = document.getElementById('applyFilters');

filterBtn?.addEventListener('click', () => {
    filterModal.classList.add('active');
});

closeModal?.addEventListener('click', () => {
    filterModal.classList.remove('active');
});

filterModal?.addEventListener('click', (e) => {
    if (e.target === filterModal) {
        filterModal.classList.remove('active');
    }
});

clearFilters?.addEventListener('click', () => {
    const checkboxes = filterModal.querySelectorAll('input[type="checkbox"]');
    const radios = filterModal.querySelectorAll('input[type="radio"]');
    
    checkboxes.forEach(cb => cb.checked = false);
    radios.forEach(radio => {
        if (radio.value === 'all') radio.checked = true;
    });
});

applyFilters?.addEventListener('click', () => {
    console.log('Filtros aplicados!');
    
    filterModal.classList.remove('active');
    
    const selectedGenres = Array.from(filterModal.querySelectorAll('input[type="checkbox"]:checked'))
        .map(cb => cb.value);
    const selectedRating = filterModal.querySelector('input[name="rating"]:checked').value;
    
    console.log('Gêneros:', selectedGenres);
    console.log('Avaliação:', selectedRating);
});

// =================== TRATAMENTO DE ERRO DE LOGO ===================
const headerLogo = document.getElementById('header-logo');

if (headerLogo) {
    headerLogo.addEventListener('error', function() {
        this.style.display = 'none';
    });
}

// Tratamento para logos dos jogos que não carregarem
const gameLogos = document.querySelectorAll('.game-logo');

gameLogos.forEach(logo => {
    logo.addEventListener('error', function() {
        this.style.display = 'none';
        const placeholder = document.createElement('div');
        placeholder.style.cssText = `
            width: 100%;
            height: 100%;
            background: linear-gradient(135deg, rgba(212, 175, 55, 0.2), rgba(212, 175, 55, 0.05));
            display: flex;
            align-items: center;
            justify-content: center;
            font-size: 48px;
            color: rgba(212, 175, 55, 0.5);
        `;
        placeholder.innerHTML = '<i class="fas fa-gamepad"></i>';
        this.parentElement.appendChild(placeholder);
    });
});

// =================== DROPDOWN DO USUÁRIO ===================
const userProfile = document.getElementById('userProfile');
const userDropdown = document.getElementById('userDropdown');

if (userProfile && userDropdown) {
    userProfile.style.position = 'relative';

    userProfile.addEventListener('click', (e) => {
        e.stopPropagation();
        userDropdown.classList.toggle('active');
        userProfile.classList.toggle('active');
    });

    document.addEventListener('click', () => {
        userDropdown.classList.remove('active');
        userProfile.classList.remove('active');
    });

    userDropdown.addEventListener('click', (e) => {
        e.stopPropagation();
    });

    document.getElementById('dropMeuPerfil')?.addEventListener('click', () => {
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

    document.getElementById('dropSuporte')?.addEventListener('click', () => {
        window.location.href = "SuporteUsuario.html";
    });

    document.getElementById('dropAdicionarJogo')?.addEventListener('click', (e) => {
        let user = null;
        try { user = JSON.parse(localStorage.getItem("velora_user")); } catch (err) {}

        if (!user || user.account_type !== "developer") {
            e.preventDefault();
            window.location.href = "LoginCadastro.html";
        }
    });

    document.getElementById('dropSair')?.addEventListener('click', () => {
        localStorage.removeItem("velora_user");
        window.location.href = "LoginCadastro.html";
    });
}

const btnFavoritos = document.querySelector('.icon-btn[title="Favoritos"]');

btnFavoritos?.addEventListener("click", () => {
    window.location.href = "ListaFavoritos.html";
});