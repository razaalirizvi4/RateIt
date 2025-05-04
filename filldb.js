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
                        Authorization: 'Bearer eyJhbGciOiJIUzI1NiJ9.eyJhdWQiOiIzNjYyZjViNmJiZjY5YTlhMTNmOWUzYTQxZGQ3YjExNyIsIm5iZiI6MTc0NjM1NTM2Mi43MjEsInN1YiI6IjY4MTc0NGEyNzhlMzI5YzJlOWY0ODJjMiIsInNjb3BlcyI6WyJhcGlfcmVhZCJdLCJ2ZXJzaW9uIjoxfQ.nn0ri6eIyjy8k12I4HkZ3Rn-VeNxVfU_eKHNDIK3lGA', // Replace with your actual API key
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

// Existing fetchMovies function
const fetchMovies = async () => {
    try {
        let currentPage = 1;
        let totalPages = 1; // Initialize totalPages to 1 to enter the loop

        // Connect to the database
        const pool = await sql.connect(dbConfig);

        while (currentPage <= totalPages) {
            const response = await axios.get(`https://api.themoviedb.org/3/movie/popular?page=${currentPage}`, {
                headers: {
                    accept: 'application/json',
                    Authorization: 'Bearer eyJhbGciOiJIUzI1NiJ9.eyJhdWQiOiIzNjYyZjViNmJiZjY5YTlhMTNmOWUzYTQxZGQ3YjExNyIsIm5iZiI6MTc0NjM1NTM2Mi43MjEsInN1YiI6IjY4MTc0NGEyNzhlMzI5YzJlOWY0ODJjMiIsInNjb3BlcyI6WyJhcGlfcmVhZCJdLCJ2ZXJzaW9uIjoxfQ.nn0ri6eIyjy8k12I4HkZ3Rn-VeNxVfU_eKHNDIK3lGA' // Replace with your actual API key
                }
            });

            const movies = response.data.results;
            totalPages = response.data.total_pages; // Get the total number of pages

            // Insert movies into the MOVIES table
            for (const movie of movies) {
                const { title, genre_ids, poster_path } = movie;
                const genres = genre_ids.map(id => genreMap[id]).join(', '); // Map IDs to names
                const posterUrl = `https://image.tmdb.org/t/p/w500${poster_path}`; // Construct the full poster URL

                // Check if the movie already exists
                const existingMovie = await pool.request()
                    .input('name', sql.VarChar, title)
                    .query(`SELECT COUNT(*) AS count FROM MOVIES WHERE name = @name`);

                if (existingMovie.recordset[0].count === 0) {
                    // Use parameterized query to prevent SQL injection and handle quotes
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
            currentPage++; // Move to the next page
        }

        console.log('All movies processed successfully!');
    } catch (error) {
        console.error('Error fetching movies:', error);
    }
};

// Call the fetchMovies function
//fetchMovies();
// Call the updateMovieGenres function
//updateMovieGenres();
// Call the updateMovieDetails function
// updateMovieDetails(); // Uncomment this line to run the function
// Add this code to your filldb.js file

app.get('/', (req, res) => {
    res.send('API is working!');
  });


app.get('/api/movies', async (req, res) => {
    try {
        const pool = await sql.connect(dbConfig);
        const result = await pool.request().query('SELECT * FROM movies');
        res.send(result.recordset); // Send the movies as a JSON response
    } catch (error) {
        console.error('Error fetching movies:', error);
        res.status(500).send('Internal Server Error');
    }
});

app.listen(port, () => {
    console.log(`Server running on http://localhost:${port}`);
});

