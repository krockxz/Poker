const express = require('express');
const path = require('path');

const app = express();
const PORT = process.env.PORT || 3000;

// Serve static files from the dist directory
app.use(express.static(path.join(__dirname, '../dist')));

// Handle any requests that don't match the static files
app.get('*', (req, res) => {
  res.sendFile(path.join(__dirname, '../dist/popup/index.html'));
});

app.listen(PORT, () => {
  console.log(`Server is running on port ${PORT}`);
  console.log(`Access the extension at http://localhost:${PORT}`);
}); 