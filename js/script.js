const global = {
    currentPage: window.location.pathname,
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
              class="${movie.title} poster"
              alt="Movie Title"
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

const fetchAPIData = async (endpoint) => {
    const API_URL = 'https://api.themoviedb.org/3/'
    const response = await fetch(`${API_URL}${endpoint}`, {
        headers: {
            accept: 'application/json',
            Authorization: 'Bearer eyJhbGciOiJIUzI1NiJ9.eyJhdWQiOiJmNWMxZTU4ZTFjZmQ1MDlkYTg1MmI0NGYzYzk0ODFkOCIsIm5iZiI6MTc3NDM2NDU0OC4yOTMsInN1YiI6IjY5YzJhNzg0ODBlMmIyYjU1ZTdiY2JjYiIsInNjb3BlcyI6WyJhcGlfcmVhZCJdLCJ2ZXJzaW9uIjoxfQ.IcDZIwltA6O78wqAtA3ONgAls9dHJZiEhmnA0FTrE78'
        }
    });

    const data = response.json();
    return data;
    
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


//Initialize App

const init = () => {
    switch(global.currentPage) {
        case '/':
        case 'index.html':
            displayPopularMovies();
            break;
        case '/shows.html':
            console.log('Shows');
            break;
        case '/movie-details.html':
            console.log('Movie Details');
            break;
        case '/tv-details.html':
            console.log('TV Details');
            break;
        case '/search.html':
            console.log('Search');
            break;
    }

    highlightActiveLink();
};

init();
