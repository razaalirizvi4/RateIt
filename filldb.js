const express = require('express');
require('dotenv').config();

const cors = require('cors');
const sql = require('mssql');
const axios = require('axios');

const app = express();
const port = 3001;


// Middleware
app.use(cors());
app.use(express.json());

const dbConfig = {
    user: process.env.SERVER_USER,
    password: process.env.SERVER_PASSWORD,
    server: process.env.SERVER_NAME,
    database: 'proj',
    options: {
        encrypt: false,
        trustServerCertificate: true
    }
};

const fetchGenres = async () => {
    const response = await axios.get('https://api.themoviedb.org/3/genre/movie/list', {
        headers: {
            accept: 'application/json',
            Authorization: 'Bearer eyJhbGciOiJIUzI1NiJ9.eyJhdWQiOiIzNjYyZjViNmJiZjY5YTlhMTNmOWUzYTQxZGQ3YjExNyIsIm5iZiI6MTc0NjM1NTM2Mi43MjEsInN1YiI6IjY4MTc0NGEyNzhlMzI5YzJlOWY0ODJjMiIsInNjb3BlcyI6WyJhcGlfcmVhZCJdLCJ2ZXJzaW9uIjoxfQ.nn0ri6eIyjy8k12I4HkZ3Rn-VeNxVfU_eKHNDIK3lGA' // Replace with your actual API key
        }
    });
    return response.data.genres; // Returns an array of genre objects
};

let genreMap = {}; // Define genreMap globally

const initializeGenres = async () => {
    const genresList = await fetchGenres();
    genresList.forEach(genre => {
        genreMap[genre.id] = genre.name; // Create a mapping of id to name
    });
};

const updateMovieGenres = async () => {
    try {
        // Fetch genres first
        const genresList = await fetchGenres();
        const genreMap = {};
        genresList.forEach(genre => {
            genreMap[genre.id] = genre.name; // Create a mapping of id to name
        });

        // Connect to the database
        const pool = await sql.connect(dbConfig);

        // Get all movies from the MOVIES table
        const movies = await pool.request().query(`SELECT id, genre FROM MOVIES`);

        for (const movie of movies.recordset) {
            const { id, genre } = movie;
            const genreIds = genre.split(', '); // Split the genre string into an array
            const firstGenreId = genreIds[0]; // Get the first genre ID
            const firstGenreName = genreMap[firstGenreId]; // Map to the genre name

            // Update the movie's genre to the first genre name
            await pool.request()
                .input('id', sql.Int, id)
                .input('genre', sql.VarChar, firstGenreName)
                .query(`UPDATE MOVIES SET genre = @genre WHERE id = @id`);

            console.log(`Updated movie ID ${id} to genre: ${firstGenreName}`);
        }

        console.log('All movie genres updated successfully!');
    } catch (error) {
        console.error('Error updating movie genres:', error);
    }
};

const updateMovieDetails = async () => {
    try {
        // Connect to the database
        const pool = await sql.connect(dbConfig);

        // Get all movies from the MOVIES table
        const movies = await pool.request().query(`SELECT id, name FROM MOVIES`);

        for (const movie of movies.recordset) {
            const { id, name } = movie;

            // Search for the movie by name in TMDB
            try {
                const searchResponse = await axios.get(`https://api.themoviedb.org/3/search/movie`, {
                    headers: {
                        accept: 'application/json',
                        Authorization: 'Bearer eyJhbGciOiJIUzI1NiJ9.eyJhdWQiOiIzNjYyZjViNmJiZjY5YTlhMTNmOWUzYTQxZGQ3YjExNyIsIm5iZiI6MTc0NjM1NTM2Mi43MjEsInN1YiI6IjY4MTc0NGEyNzhlMzI5YzJlOWY0ODJjMiIsInNjb3BlcyI6WyJhcGlfcmVhZCJdLCJ2ZXJzaW9uIjoxfQ.nn0ri6eIyjy8k12I4HkZ3Rn-VeNxVfU_eKHNDIK3lGA' // Replace with your actual API key
                    },
                    params: {
                        query: name,
                    },
                });

                // Check if any results were returned
                if (searchResponse.data.results.length > 0) {
                    const movieDetails = searchResponse.data.results[0]; // Get the first result

                    // Extract the required fields
                    const popularity = movieDetails.popularity;
                    const releaseYear = movieDetails.release_date.split('-')[0]; // Get the year from the release date
                    const description = movieDetails.overview;

                    // Check if credits exist and get the director's name
                    const director = movieDetails.credits?.crew?.find(crewMember => crewMember.job === 'Director')?.name || 'Unknown'; // Use optional chaining

                    const rating = movieDetails.vote_average;

                    // Update the movie details in the database
                    await pool.request()
                        .input('id', sql.Int, id)
                        .input('popularity', sql.Float, popularity)
                        .input('release_year', sql.Int, releaseYear)
                        .input('description', sql.VarChar, description)
                        .input('director', sql.VarChar, director)
                        .input('rating', sql.Float, rating)
                        .query(`UPDATE MOVIES SET popularity = @popularity, release_year = @release_year, description = @description, director = @director, rating = @rating WHERE id = @id`);

                    console.log(`Updated movie ID ${id} with additional details.`);
                } else {
                    console.log(`No results found for movie: ${name}. Skipping...`);
                }
            } catch (error) {
                console.error(`Error searching for movie "${name}":`, error);
            }
        }

        console.log('All movie details processed successfully!');
    } catch (error) {
        console.error('Error updating movie details:', error);
    }
};

const fetchMovies = async () => {
    try {
        await initializeGenres(); // Ensure genres are initialized before fetching movies
        let currentPage = 1;
        let totalPages = 1;

        const pool = await sql.connect(dbConfig);

        while (currentPage <= totalPages) {
            const response = await axios.get(`https://api.themoviedb.org/3/movie/popular?page=${currentPage}`, {
                headers: {
                    accept: 'application/json',
                    Authorization: 'Bearer eyJhbGciOiJIUzI1NiJ9.eyJhdWQiOiIzNjYyZjViNmJiZjY5YTlhMTNmOWUzYTQxZGQ3YjExNyIsIm5iZiI6MTc0NjM1NTM2Mi43MjEsInN1YiI6IjY4MTc0NGEyNzhlMzI5YzJlOWY0ODJjMiIsInNjb3BlcyI6WyJhcGlfcmVhZCJdLCJ2ZXJzaW9uIjoxfQ.nn0ri6eIyjy8k12I4HkZ3Rn-VeNxVfU_eKHNDIK3lGA' // Replace with your actual API key
                }
            });

            const movies = response.data.results;
            totalPages = response.data.total_pages;

            for (const movie of movies) {
                const { title, genre_ids, poster_path } = movie;
                const genres = genre_ids.map(id => genreMap[id]).join(', ');
                const posterUrl = `https://image.tmdb.org/t/p/w500${poster_path}`;

                const existingMovie = await pool.request()
                    .input('name', sql.VarChar, title)
                    .query(`SELECT COUNT(*) AS count FROM MOVIES WHERE name = @name`);

                if (existingMovie.recordset[0].count === 0) {
                    await pool.request()
                        .input('name', sql.VarChar, title)
                        .input('genre', sql.VarChar, genres)
                        .input('posters', sql.VarChar, posterUrl)
                        .query(`INSERT INTO MOVIES (name, genre, posters) VALUES (@name, @genre, @posters)`);
                    console.log(`Inserted movie: ${title}`);
                } else {
                    console.log(`Movie already exists: ${title}`);
                }
            }

            console.log(`Processed movies from page ${currentPage}`);
            currentPage++;
        }

        console.log('All movies processed successfully!');
    } catch (error) {
        console.error('Error fetching movies:', error);
    }
};

const fetchTVShows = async () => {
    try {
        // Fetch genres first
        const genresList = await fetchGenres();
        const genreMap = {};
        genresList.forEach(genre => {
            genreMap[genre.id] = genre.name; // Create a mapping of id to name
        });

        let currentPage = 1;
        let totalPages = 1;

        const pool = await sql.connect(dbConfig);

        while (currentPage <= totalPages) {
            const response = await axios.get(`https://api.themoviedb.org/3/tv/popular?page=${currentPage}`, {
                headers: {
                    accept: 'application/json',
                    Authorization: 'Bearer eyJhbGciOiJIUzI1NiJ9.eyJhdWQiOiIzNjYyZjViNmJiZjY5YTlhMTNmOWUzYTQxZGQ3YjExNyIsIm5iZiI6MTc0NjM1NTM2Mi43MjEsInN1YiI6IjY4MTc0NGEyNzhlMzI5YzJlOWY0ODJjMiIsInNjb3BlcyI6WyJhcGlfcmVhZCJdLCJ2ZXJzaW9uIjoxfQ.nn0ri6eIyjy8k12I4HkZ3Rn-VeNxVfU_eKHNDIK3lGA' // Replace with your actual API key
                }
            });

            const tvShows = response.data.results;
            totalPages = response.data.total_pages;

            for (const show of tvShows) {
                const { id, name, genre_ids, poster_path, popularity, vote_average } = show;
                const posterUrl = `https://image.tmdb.org/t/p/w500${poster_path}`;

                // Fetch detailed information for each show
                const detailsResponse = await axios.get(`https://api.themoviedb.org/3/tv/${id}`, {
                    headers: {
                        accept: 'application/json',
                        Authorization: 'Bearer eyJhbGciOiJIUzI1NiJ9.eyJhdWQiOiIzNjYyZjViNmJiZjY5YTlhMTNmOWUzYTQxZGQ3YjExNyIsIm5iZiI6MTc0NjM1NTM2Mi43MjEsInN1YiI6IjY4MTc0NGEyNzhlMzI5YzJlOWY0ODJjMiIsInNjb3BlcyI6WyJhcGlfcmVhZCJdLCJ2ZXJzaW9uIjoxfQ.nn0ri6eIyjy8k12I4HkZ3Rn-VeNxVfU_eKHNDIK3lGA' // Replace with your actual API key
                    }
                });

                const detailedShow = detailsResponse.data;
                const number_of_seasons = detailedShow.number_of_seasons || 0; // Default to 0 if missing
                const number_of_episodes = detailedShow.number_of_episodes || 0; // Default to 0 if missing

                // Get the first genre ID and map it to its name
                const firstGenreId = genre_ids[0]; // Get the first genre ID
                const genre = genreMap[firstGenreId] || 'Unknown'; // Map to the genre name or default to 'Unknown'

                const existingShow = await pool.request()
                    .input('name', sql.VarChar, name)
                    .query(`SELECT COUNT(*) AS count FROM TVSHOWS WHERE name = @name`);

                if (existingShow.recordset[0].count === 0) {
                    await pool.request()
                        .input('name', sql.VarChar, name)
                        .input('genre', sql.VarChar, genre) // Insert only the first genre
                        .input('posters', sql.VarChar, posterUrl)
                        .input('popularity', sql.Float, popularity)
                        .input('rating', sql.Float, vote_average)
                        .input('seasons', sql.Int, number_of_seasons)
                        .input('episodes', sql.Int, number_of_episodes)
                        .input('description', sql.VarChar, detailedShow.overview || '') // Use overview if available
                        .query(`INSERT INTO TVSHOWS (name, genre, posters, popularity, rating, seasons, episodes, description) VALUES (@name, @genre, @posters, @popularity, @rating, @seasons, @episodes, @description)`);
                    console.log(`Inserted TV show: ${name}`);
                } else {
                    console.log(`TV show already exists: ${name}`);
                }
            }

            console.log(`Processed TV shows from page ${currentPage}`);
            currentPage++;
        }

        console.log('All TV shows processed successfully!');
    } catch (error) {
        console.error('Error fetching TV shows:', error);
    }
};

// Call the fetchMovies function
//fetchMovies();
// Call the updateMovieGenres function
//updateMovieGenres();
// Call the updateMovieDetails function
// updateMovieDetails(); // Uncomment this line to run the function
// Call the fetchTVShows function
//fetchTVShows(); // Uncomment this line to run the function

app.get('/', (req, res) => {
    res.send('API is working!');
});

app.get('/api/movies', async (req, res) => {
    try {
        const pool = await sql.connect(dbConfig);
        const result = await pool.request().query('SELECT * FROM movies');
        res.send(result.recordset);
    } catch (error) {
        console.error('Error fetching movies:', error);
        res.status(500).send('Internal Server Error');
    }
});

app.get('/api/tvshows', async (req, res) => {
    try {
        const pool = await sql.connect(dbConfig);
        const result = await pool.request().query('SELECT * FROM TVSHOWS');
        res.send(result.recordset); // Send the TV shows as a JSON response
    } catch (error) {
        console.error('Error fetching TV shows:', error);
        res.status(500).send('Internal Server Error');
    }
});

app.listen(port, () => {
    console.log(`Server running on http://localhost:${port}`);
});

