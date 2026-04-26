// Simple startup script for testing without MongoDB
const express = require('express');
const path = require('path');

const app = express();
const PORT = process.env.PORT || 3001;

// Middleware
app.use(express.static(path.join(__dirname)));

// Serve the main HTML file
app.get('/', (req, res) => {
    res.sendFile(path.join(__dirname, 'index.html'));
});

// Start server
app.listen(PORT, () => {
    console.log(`Simple server running on http://localhost:${PORT}`);
    console.log('Note: MongoDB features will not work without the backend server');
    console.log('To use MongoDB features, run: npm start');
});
