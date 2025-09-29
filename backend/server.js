// backend/server.js
const express = require('express');
const path = require('path');
const cors = require('cors');
const dotenv = require('dotenv');

dotenv.config();

const app = express();
app.use(cors());
app.use(express.json({ limit: '1mb' }));
app.use(express.urlencoded({ extended: true }));

// === Database initialization (models/db.js will export a pool/connection) ===
const db = require('./models/db');

// === Routes index (will mount authRoutes, codeRoutes, userRoutes) ===
const routesIndex = require('./routes/index');

// === Serve frontend static files from ../frontend ===
// This makes frontend files available at root (e.g. GET /register.html)
app.use(express.static(path.join(__dirname, '..', 'frontend')));

// === API routes mounted under /api ===
app.use('/api', routesIndex);

// Fallback: return index.html for root
app.get('/', (req, res) => {
  res.sendFile(path.join(__dirname, '..', 'frontend', 'index.html'));
});

// Global error handler
app.use((err, req, res, next) => {
  console.error('Unhandled Error:', err);
  res.status(500).json({ message: 'Internal server error' });
});

// Start server
const PORT = process.env.PORT || 5000;
app.listen(PORT, () => {
  console.log(`Server running on http://localhost:${PORT}`);
});