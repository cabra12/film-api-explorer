const global = {
    currentPage: window.location.pathname,
    search: {
        term: '',
        type: '',
        page: 1,
        totalPages: 1,
        totalResults: 0,
    }
};

const displaySlider = async () => {
    const { results } = await fetchAPIData('movie/now_playing');

    results.forEach((movie) => {
        const div = document.createElement('div');
        div.classList.add('swiper-slide');

        div.innerHTML = `
            <a href="movie-details.html?id=${movie.id}">
              <img src="https://image.tmdb.org/t/p/w500${movie.poster_path}" alt="${movie.title} Title" />
            </a>
            <h4 class="swiper-rating">
              <i class="fas fa-star text-secondary"></i> ${movie.vote_average.toFixed(1)} / 10
            </h4>
        `;

        document.querySelector('.swiper-wrapper').appendChild(div);

        initSwiper();
    });
};

const search = async () => {
    const queryString = window.location.search;
    const urlParams = new URLSearchParams(queryString);

    //console.log(urlParams.get('type')); returns the first value associated with given parameter name
    //url would return type=movie&search-term=hail+mary and get('type') returns "movie"

    global.search.type = urlParams.get('type');
    global.search.term = urlParams.get('search-term');

    if(global.search.term !== '' && global.search.term !== null) {
        const { results, total_pages, page, total_results } = await searchAPIData();
        
        global.search.page = page;
        global.search.totalPages = total_pages;
        global.search.totalResults = total_results;
        
        if(results.length === 0) {
            showAlert('No results found');
            return;
        } else {
            displaySearchResults(results);
            document.querySelector('#search-term').value = '';
        }
    } else {
        showAlert('Please enter a search term');
    }
};

const displaySearchResults = (results) => {

    document.querySelector('#search-results').innerHTML = '';
    document.querySelector('#search-results-heading').innerHTML = '';
    document.querySelector('#pagination').innerHTML = '';

    results.forEach((result) => {
        const div = document.createElement('div');
        div.classList.add('card');
        div.innerHTML = `
            <a href="${global.search.type}-details.html?id=${result.id}">
            ${result.poster_path 
                ? `<img
              src="https://image.tmdb.org/t/p/w500/${result.poster_path}"
              class="card-img-top"
              alt="${global.search.type === 'movie' ? result.title : result.name} poster"
            />` : `<img
              src="images/no-image.jpg"
              class="card-img-top"
              alt="${global.search.type === 'movie' ? result.title : result.name} poster"
            />` }
          </a>
          <div class="card-body">
            <h5 class="card-title">${global.search.type === 'movie' ? result.title : result.name}</h5>
            <p class="card-text">
              <small class="text-muted">Release: ${global.search.type === 'movie' ? result.release_date : result.first_air_date}</small>
            </p>
          </div>`;

          document.querySelector('#search-results-heading').innerHTML = `
                <h2>${global.search.totalResults} Results for "${global.search.term}"</h2>
          `;

          document.querySelector('#search-results').appendChild(div);

          
    });

    displayPagination();
};

const displayPagination = () => {
    const div = document.createElement('div');
    div.classList.add('pagination');
    div.innerHTML = `
        <button class="btn btn-primary" id="prev">Prev</button>
          <button class="btn btn-primary" id="next">Next</button>
          <div class="page-counter">Page ${global.search.page} of ${global.search.totalPages}</div>
    `;

    document.querySelector('#pagination').appendChild(div);

    if(global.search.page === 1) {
        document.querySelector('#prev').disabled = true;
    }

    if(global.search.page === global.search.totalPages) {
        document.querySelector('#next').disabled = true;
    }

    document.querySelector('#next').addEventListener('click', async () => {
        global.search.page++;
        const { results, total_pages } = await searchAPIData();
        displaySearchResults(results);
    });

    document.querySelector('#prev').addEventListener('click', async () => {
        global.search.page--;
        const { results, total_pages } = await searchAPIData();
        displaySearchResults(results);
    });
}

const initSwiper = () => {
    const swiper = new Swiper('.swiper', {
        slidesPerView: 1,
        spaceBetween: 30,
        freeMode: true,
        loop: true,
        autoplay: {
            delay: 3000,
            disableOnInteraction: false,
        },
        breakpoints: {
            500: {
                slidesPerView: 2
            },
            700: {
                slidesPerView: 3
            },
            1200: {
                slidesPerView: 4
            },
        }
    });
};

const displayPopularMovies = async () => {
    const { results } = await fetchAPIData('movie/popular');
    //destructuring the object like this just gives us the results, one of the things this API returns
    results.forEach((movie) => {
        const div = document.createElement('div');
        div.classList.add('card');
        div.innerHTML = `
            <a href="movie-details.html?id=${movie.id}">
            ${movie.poster_path 
                ? `<img
              src="https://image.tmdb.org/t/p/w500${movie.poster_path}"
              class="card-img-top"
              alt="${movie.title} poster"
            />` : `<img
              src="images/no-image.jpg"
              class="card-img-top"
              alt="Movie Title"
            />` }
          </a>
          <div class="card-body">
            <h5 class="card-title">${movie.title}</h5>
            <p class="card-text">
              <small class="text-muted">Release: ${movie.release_date}</small>
            </p>
          </div>`;

          document.querySelector('#popular-movies').appendChild(div);
    });
};

const displayPopularTVShows = async () => {
    const { results } = await fetchAPIData('tv/popular');

    results.forEach((show) => {
        const div = document.createElement('div');
        div.classList.add('card');
        div.innerHTML = `
            <a href="tv-details.html?id=${show.id}">
            ${show.poster_path 
                ? `<img
              src="https://image.tmdb.org/t/p/w500${show.poster_path}"
              class="card-img-top"
              alt="${show.name} poster"
            />` : `<img
              src="images/no-image.jpg"
              class="card-img-top"
              alt="Movie Title"
            />` }
          </a>
          <div class="card-body">
            <h5 class="card-title">${show.name}</h5>
            <p class="card-text">
              <small class="text-muted">Air Date: ${show.first_air_date}</small>
            </p>
          </div>`;

          document.querySelector('#popular-shows').appendChild(div);
    });
};

const displayMovieDetails = async () => {
    const movieId = window.location.search.split('=')[1];
    //window.location.search only gives back the query, which will be something like ?id=1234
    //split will make an array based on the symbol, so ['?id', '1234']

    const movie = await fetchAPIData(`movie/${movieId}`);
    
    displayBackgroundImage('movie', movie.backdrop_path);

    const div = document.createElement('div');
    div.innerHTML = 
    `<div class="details-top">
        <div>
            ${movie.poster_path 
                ? `<img
              src="https://image.tmdb.org/t/p/w500${movie.poster_path}"
              class="card-img-top"
              alt="${movie.title} poster"
            />` : `<img
              src="images/no-image.jpg"
              class="card-img-top"
              alt="Movie Title"
            />` }
          </div>
          <div>
            <h2>${movie.title}</h2>
            <p>
              <i class="fas fa-star text-primary"></i>
              ${movie.vote_average.toFixed(1)} / 10
            </p>
            <p class="text-muted">Release Date: ${movie.release_date}</p>
            <p>
              ${movie.overview}
            </p>
            <h5>Genres</h5>
            <ul class="list-group">
              ${movie.genres.map((genre) => `<li>${genre.name}</li>`).join('')}
            </ul>
            <a href="${movie.homepage}" target="_blank" class="btn">Visit Movie Homepage</a>
          </div>
    </div>
        <div class="details-bottom">
          <h2>Movie Info</h2>
          <ul>
            <li><span class="text-secondary">Budget:</span> ${movie.budget ? `$${addCommasToNumber(movie.budget)}` : 'Unknown'}</li>
            <li><span class="text-secondary">Revenue:</span> ${movie.revenue ? `$${addCommasToNumber(movie.revenue)}` : 'Unknown'}</li>
            <li><span class="text-secondary">Runtime:</span> ${movie.runtime} minutes</li>
            <li><span class="text-secondary">Status:</span> ${movie.status}</li>
          </ul>
          <h4>Production Companies</h4>
          <div class="list-group">${movie.production_companies.map((company) => company.name).join(', ')}</div>
        </div>
    </div>
    `;

    document.querySelector('#movie-details').appendChild(div);
};

const displayTVShowDetails = async () => {
    const seriesId = window.location.search.split('=')[1];
    //window.location.search only gives back the query, which will be something like ?id=1234
    //split will make an array based on the symbol, so ['?id', '1234']

    const show = await fetchAPIData(`tv/${seriesId}`);
    
    displayBackgroundImage('tv', show.backdrop_path);

    const div = document.createElement('div');
    div.innerHTML = 
    `<div class="details-top">
        <div>
            ${show.poster_path 
                ? `<img
              src="https://image.tmdb.org/t/p/w500${show.poster_path}"
              class="card-img-top"
              alt="${show.name} poster"
            />` : `<img
              src="images/no-image.jpg"
              class="card-img-top"
              alt="Movie Title"
            />` }
          </div>
          <div>
            <h2>${show.name}</h2>
            <p>
              <i class="fas fa-star text-primary"></i>
              ${show.vote_average.toFixed(1)} / 10
            </p>
            <p class="text-muted">Release Date: ${show.first_air_date}</p>
            <p>
              ${show.overview}
            </p>
            <h5>Genres</h5>
            <ul class="list-group">
              ${show.genres.map((genre) => `<li>${genre.name}</li>`).join('')}
            </ul>
            <a href="${show.homepage}" target="_blank" class="btn">Visit Movie Homepage</a>
          </div>
    </div>
        <div class="details-bottom">
          <h2>Show Info</h2>
          <ul>
            <li><span class="text-secondary">Number of Episodes:</span> ${show.number_of_episodes}</li>
            <li><span class="text-secondary">Last Episode to Air:</span> "${show.last_episode_to_air.name}"</li>
            <li><span class="text-secondary">Status:</span> ${show.status}</li>
          </ul>
          <h4>Production Companies</h4>
          <div class="list-group">${show.production_companies.map((company) => company.name).join(', ')}</div>
        </div>
    </div>
    `;

    document.querySelector('#show-details').appendChild(div);
};

const displayBackgroundImage = async (type, backgroundPath) => {
    const overlayDiv = document.createElement('div');
    overlayDiv.style.backgroundImage = `url(https://image.tmdb.org/t/p/original/${backgroundPath})`;
    overlayDiv.style.backgroundSize = 'cover';
    overlayDiv.style.backgroundPosition = 'center';
    overlayDiv.style.backgroundRepeat = 'no-repeat';
    overlayDiv.style.height = '100vh';
    overlayDiv.style.width = '100vw';
    overlayDiv.style.position = 'absolute';
    overlayDiv.style.top = '0';
    overlayDiv.style.left = '0';
    overlayDiv.style.zIndex = '-1';
    overlayDiv.style.opacity = '0.1';

    if(type === 'movie') {
        document.querySelector('#movie-details').appendChild(overlayDiv);
    }else {
        document.querySelector('#show-details').appendChild(overlayDiv);
    }

};

const fetchAPIData = async (endpoint) => {
    const API_URL = 'https://api.themoviedb.org/3/';

    showSpinner();
    const response = await fetch(`${API_URL}${endpoint}`, {
        headers: {
            accept: 'application/json',
            Authorization: 'Bearer eyJhbGciOiJIUzI1NiJ9.eyJhdWQiOiJmNWMxZTU4ZTFjZmQ1MDlkYTg1MmI0NGYzYzk0ODFkOCIsIm5iZiI6MTc3NDM2NDU0OC4yOTMsInN1YiI6IjY5YzJhNzg0ODBlMmIyYjU1ZTdiY2JjYiIsInNjb3BlcyI6WyJhcGlfcmVhZCJdLCJ2ZXJzaW9uIjoxfQ.IcDZIwltA6O78wqAtA3ONgAls9dHJZiEhmnA0FTrE78'
        }
    });

    const data = await response.json();

    hideSpinner();
    return data;
    
};

const searchAPIData = async () => {
    return fetchAPIData(`search/${global.search.type}?query=${global.search.term}&page=${global.search.page}`);
};

const showSpinner = () => {
    document.querySelector('.spinner').classList.add('show');
};

const hideSpinner = () => {
    document.querySelector('.spinner').classList.remove('show');
};

//Highlight active link
const highlightActiveLink = () => {
    const links = document.querySelectorAll('.nav-link');

    links.forEach((link) => {
        if(link.getAttribute('href') === global.currentPage) {
            link.classList.add('active');
        }
    });
};

const showAlert = (message, className = 'error') => {
    const alertEl = document.createElement('div');
    alertEl.classList.add('alert', className);
    alertEl.appendChild(document.createTextNode(message));
    document.querySelector('#alert').appendChild(alertEl);

    setTimeout(() => alertEl.remove(), 3000);
};

const addCommasToNumber = (number) => {
    return number.toString().replace(/\B(?=(\d{3})+(?!\d))/g, ",");
};


//Initialize App

const init = () => {
    switch(global.currentPage) {
        case '/':
        case '/index.html':
        case '/index':
            displaySlider();
            displayPopularMovies();
            break;
        case '/shows.html':
        case '/shows':
            displayPopularTVShows();
            break;
        case '/movie-details.html':
        case '/movie-details':
            displayMovieDetails();
            break;
        case '/tv-details.html':
        case '/tv-details':
            displayTVShowDetails();
            break;
        case '/search.html':
        case '/search':
            search();
            break;
    }

    highlightActiveLink();
};

init();


