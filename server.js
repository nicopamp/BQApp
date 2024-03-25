const express = require('express');
const path = require('path');

const app = express();
const PORT = process.env.PORT || 3000;

// set up rate limiter: maximum of five requests per minute
const RateLimit = require('express-rate-limit');
const limiter = RateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: 100, // max 100 requests per windowMs
});

// Serve static files from the public directory
app.use(express.static(path.join(__dirname, 'public')));

app.use(limiter)

// Define a route to serve the index.html file
app.get('/', (req, res) => {
    res.sendFile(path.join(__dirname, 'public', 'index.html'));
});

// Start the server
app.listen(PORT, () => {
    console.log(`Server is running on http://localhost:${PORT}`);
});

app.disable("x-powered-by");
