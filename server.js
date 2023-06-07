const express = require('express');
const app = express();
const port = 8081; // Choose a suitable port number
const mime = require('mime');
//const express = require("express");
const cors = require("cors");

//const app = express();

// Enable CORS for all routes
app.use(cors());

// ... Rest of your server code


// Define MIME type for .mjs files
mime.define({
    'application/javascript': ['mjs']
}, { force: true });

// Set Content Security Policy header
app.use((req, res, next) => {
    res.setHeader('Content-Security-Policy', "default-src 'self'");
    next();
});

// Serve static files (client-side code)
app.use(express.static('public')); // Assuming your client-side code resides in a 'public' folder

// Serve the Chord.mjs module
app.get('/Chord.mjs', (req, res) => {
    res.sendFile(__dirname + '/Chord.mjs');
});

// Define server-side routes
app.get('/api/posts', (req, res) => {
    // Handle the API request and send the response
});

app.post('/api/posts', (req, res) => {
    // Handle the API request to create a new blog post
});

// Start the server
app.listen(port, () => {
    console.log(`Server is listening on port ${port}`);
});
