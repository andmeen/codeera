// backend/controllers/userController.js
const db = require('../models/db');

const me = async (req, res) => {
  try {
    const [rows] = await db.query('SELECT id, name, email, created_at FROM users WHERE id = ?', [req.userId]);
    if (!rows.length) return res.status(404).json({ message: 'Not found' });
    res.json({ user: rows[0] });
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: 'Server error' });
  }
};

const updateProfile = async (req, res) => {
  try {
    const { name } = req.body;
    await db.query('UPDATE users SET name = ? WHERE id = ?', [name || null, req.userId]);
    res.json({ message: 'Updated' });
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: 'Server error' });
  }
};

module.exports = { me, updateProfile };