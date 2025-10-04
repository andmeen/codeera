// backend/controllers/authController.js
const db = require('../models/db');
const bcrypt = require('bcrypt');
const jwt = require('jsonwebtoken');
const SECRET = process.env.JWT_SECRET || 'dev_secret_key';

const register = async (req, res) => {
  try {
    const { email, password, username } = req.body;
    const name = req.body.name || req.body.username || null;
    if (!email || !password) return res.status(400).json({ message: 'Email and password required' });

    // check email
    const [emailRows] = await db.query('SELECT id FROM users WHERE email = ?', [email]);
    if (emailRows.length) return res.status(400).json({ message: 'Email already in use' });

    // check username if provided
    if (username) {
      const [uRows] = await db.query('SELECT id FROM users WHERE username = ?', [username]);
      if (uRows.length) return res.status(400).json({ message: 'Username already in use' });
    }

    const hash = await bcrypt.hash(password, 10);
    const [result] = await db.query('INSERT INTO users (name, username, email, password_hash) VALUES (?, ?, ?, ?)', [name || null, username || null, email, hash]);
    const userId = result.insertId;

    const token = jwt.sign({ id: userId, email }, SECRET, { expiresIn: process.env.JWT_EXPIRES_IN || '7d' });

    res.json({ token, user: { id: userId, name, username: username || null, email } });
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: 'Server error' });
  }
};

const login = async (req, res) => {
  try {
    const { email, password } = req.body;
    if (!email || !password) return res.status(400).json({ message: 'Email and password required' });

    const [rows] = await db.query('SELECT id, name, username, email, password_hash FROM users WHERE email = ?', [email]);
    if (!rows.length) return res.status(400).json({ message: 'Invalid credentials' });

    const user = rows[0];
    const ok = await bcrypt.compare(password, user.password_hash);
    if (!ok) return res.status(400).json({ message: 'Invalid credentials' });

    const token = jwt.sign({ id: user.id, email: user.email }, SECRET, { expiresIn: process.env.JWT_EXPIRES_IN || '7d' });

    res.json({ token, user: { id: user.id, name: user.name, username: user.username, email: user.email } });
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: 'Server error' });
  }
};

module.exports = { register, login };