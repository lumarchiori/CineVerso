const API_KEY = '2f5b4eea9b5b9756fb8747dc9f0f3922';
const BASE_URL = 'https://api.themoviedb.org/3';
const IMG_URL = 'https://image.tmdb.org/t/p/w500';
const BACKDROP_URL = 'https://image.tmdb.org/t/p/original';

const moviesGrid = document.getElementById('moviesGrid');
const favoritesGrid = document.getElementById('favoritesGrid');
const hero = document.getElementById('hero');
const searchInput = document.getElementById('searchInput');
const heroTrailerBtn = document.getElementById('heroTrailerBtn');

let currentMovieId = null;

async function fetchTrending() {
    try {
        const response = await fetch(
            `${BASE_URL}/trending/movie/day?api_key=${API_KEY}&language=pt-BR`
        );

        const data = await response.json();

        if (!data.results || data.results.length === 0) return;

        displayMovies(data.results);
        setHeroBanner(data.results[0]);
    } catch (error) {
        console.error('Erro ao buscar filmes:', error);
    }
}

function displayMovies(movies) {
    moviesGrid.innerHTML = '';

    movies.forEach(movie => {
        if (!movie.poster_path) return;

        const card = document.createElement('div');
        card.classList.add('movie-card');

        card.innerHTML = `
      <img src="${IMG_URL + movie.poster_path}" alt="${movie.title}">
      <div class="movie-info">
        <h3>${movie.title}</h3>
        <p class="rating">⭐ ${movie.vote_average.toFixed(1)}</p>
      </div>
    `;

        const trailerBtn = document.createElement('button');
        trailerBtn.classList.add('watch-btn');
        trailerBtn.textContent = '▶ Trailer';
        trailerBtn.onclick = () => fetchTrailer(movie.id);

        const favBtn = document.createElement('button');
        favBtn.classList.add('fav-btn');
        favBtn.textContent = '⭐ Favoritar';
        favBtn.onclick = () => saveFavorite(movie);

        const info = card.querySelector('.movie-info');
        info.appendChild(trailerBtn);
        info.appendChild(favBtn);

        moviesGrid.appendChild(card);
    });
}

function setHeroBanner(movie) {
    currentMovieId = movie.id;

    if (movie.backdrop_path) {
        hero.style.backgroundImage = `
      linear-gradient(to top, rgba(15,15,15,1), rgba(15,15,15,0.2)),
      url(${BACKDROP_URL + movie.backdrop_path})
    `;
    }

    hero.querySelector('h1').textContent = movie.title;
    hero.querySelector('p').textContent = movie.overview;
}

async function fetchTrailer(movieId) {
    try {
        const response = await fetch(
            `${BASE_URL}/movie/${movieId}/videos?api_key=${API_KEY}&language=pt-BR`
        );

        const data = await response.json();

        const trailer = data.results.find(
            (video) => video.site === 'YouTube'
        );

        if (trailer) {
            window.open(
                `https://www.youtube.com/watch?v=${trailer.key}`,
                '_blank'
            );
        } else {
            alert('Esse filme não tem trailer 😭');
        }
    } catch (error) {
        console.error('Erro no trailer:', error);
    }
}

function saveFavorite(movie) {
    let favorites = JSON.parse(localStorage.getItem('favorites')) || [];

    const alreadyExists = favorites.some(fav => fav.id === movie.id);

    if (!alreadyExists) {
        favorites.push(movie);
        localStorage.setItem('favorites', JSON.stringify(favorites));
        loadFavorites();
        alert(`${movie.title} adicionado aos favoritos ❤️⭐`);
    } else {
        alert('Esse filme já está nos favoritos ⭐');
    }
}

function loadFavorites() {
    if (!favoritesGrid) return;

    favoritesGrid.innerHTML = '';
    const favorites = JSON.parse(localStorage.getItem('favorites')) || [];

    favorites.forEach(movie => {
        const card = document.createElement('div');
        card.classList.add('movie-card');

        card.innerHTML = `
      <img src="${IMG_URL + movie.poster_path}" alt="${movie.title}">
      <div class="movie-info">
        <h3>${movie.title}</h3>
        <p class="rating">⭐ ${movie.vote_average.toFixed(1)}</p>
      </div>
    `;

        favoritesGrid.appendChild(card);
    });
}

if (heroTrailerBtn) {
    heroTrailerBtn.addEventListener('click', () => {
        if (currentMovieId) {
            fetchTrailer(currentMovieId);
        }
    });
}

searchInput.addEventListener('keypress', async (e) => {
    if (e.key === 'Enter') {
        const response = await fetch(
            `${BASE_URL}/search/movie?api_key=${API_KEY}&query=${searchInput.value}&language=pt-BR`
        );

        const data = await response.json();
        displayMovies(data.results);
    }
});

fetchTrending();
loadFavorites();