const express = require('express');
require('dotenv').config();

const cors = require('cors');
const sql = require('mssql');

const app = express();
const port = 5000;

// Middleware
app.use(cors());
app.use(express.json());

// Database configuration
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


// Test database connection endpoint
app.get('/api/test-connection', (req, res) => {
    sql.connect(dbConfig, function (err) {
        if (err) console.log(err);
        else console.log('Connected to SQL Server successfully!');
    });
});

app.listen(port, () => {
    console.log(`Server is running on port ${port}`);
}); 