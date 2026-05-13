const params = new URLSearchParams(window.location.search);

const id = Number(params.get("id")) || 1;

const titleEl = document.querySelector(".game-title");

const imgEl = document.querySelector(".game-image");

const genreEl = document.querySelector(".game-genre");

const ratingEl = document.querySelector(".game-rating");

const descEl = document.querySelector(".game-description");

const favBtn = document.querySelector("#favBtn");

let favorites =
  JSON.parse(localStorage.getItem("velora_favoritos_ids")) || [];

fetch("Game.json")

  .then(res => res.json())

  .then(games => {

    const game = games.find(g => g.id === id);

    if (!game) {

      titleEl.innerHTML = "Jogo não encontrado";

      return;
    }

    titleEl.innerHTML = game.title;

    imgEl.src = game.image;

    genreEl.innerHTML =
      "🎮 Gênero: " + game.genre;

    ratingEl.innerHTML =
      "⭐ Nota: " + game.rating;

    descEl.innerHTML =
      game.description;

    updateFavButton(game.id);

    favBtn.onclick = () => {

      toggleFavorite(game.id);

      updateFavButton(game.id);
    };
  });

function toggleFavorite(id) {

  if (favorites.includes(id)) {

    favorites =
      favorites.filter(f => f !== id);

  } else {

    favorites.push(id);
  }

  localStorage.setItem(
    "velora_favoritos_ids",
    JSON.stringify(favorites)
  );
}

function updateFavButton(id) {

  if (favorites.includes(id)) {

    favBtn.innerHTML =
      "💔 Remover dos favoritos";

  } else {

    favBtn.innerHTML =
      "❤️ Favoritar";
  }
}