const express = require('express');
const path = require('path');
const app = express();

// Serve static files from the React app (adjusted to correct path)
app.use(express.static(path.join(__dirname, '..', 'build')));  // Adjusted path

// API endpoint (optional)
app.get('/api', (req, res) => {
  res.json({ message: "Hello from Express API!" });
});

// Catch-all to serve React app for any route
app.get('*', (req, res) => {
  res.sendFile(path.join(__dirname, '..', 'build', 'index.html'));  // Adjusted path
});

const PORT = process.env.PORT || 3000;
app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});
