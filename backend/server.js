const express = require('express');
const cors = require('cors');
const app = express();
const port = 5000;

// Enable CORS for all routes
app.use(cors());

// API route
app.get('/api/hello', (req, res) => {
  res.json({ message: 'Hello World from the backend!' });
});

// Start server
app.listen(port, () => {
  console.log(`Backend is running on http://localhost:${port}`);
});
