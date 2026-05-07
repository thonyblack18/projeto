// pega ID da URL
const params = new URLSearchParams(window.location.search);
const id = Number(params.get("id"));

// favoritos
let favorites = JSON.parse(localStorage.getItem("velora_favoritos_ids")) || [];

// elementos da tela
const titleEl = document.querySelector(".game-title");
const imgEl = document.querySelector(".game-image");
const genreEl = document.querySelector(".game-genre");
const ratingEl = document.querySelector(".game-rating");
const descEl = document.querySelector(".game-description");
const favBtn = document.querySelector("#favBtn");

// carregar JSON
fetch("games.json")
  .then(res => res.json())
  .then(games => {

    const game = games.find(g => g.id === id);

    if (!game) {
      titleEl.textContent = "Jogo não encontrado";
      return;
    }

    // preencher dados
    titleEl.textContent = game.title;
    imgEl.src = game.image;
    imgEl.alt = game.title;
    genreEl.textContent = "Gênero: " + game.genre;
    ratingEl.textContent = "⭐ " + game.rating;
    descEl.textContent = game.description;

    // estado do favorito
    updateFavButton(game.id);

    favBtn.onclick = () => {
      toggleFavorite(game.id);
      updateFavButton(game.id);
    };
  });

// adicionar/remover favorito
function toggleFavorite(id) {
  if (favorites.includes(id)) {
    favorites = favorites.filter(f => f !== id);
  } else {
    favorites.push(id);
  }

  localStorage.setItem("velora_favoritos_ids", JSON.stringify(favorites));
}

// atualizar botão
function updateFavButton(id) {
  if (favorites.includes(id)) {
    favBtn.textContent = "💔 Remover dos favoritos";
  } else {
    favBtn.textContent = "❤️ Favoritar";
  }
}