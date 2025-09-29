// backend/routes/index.js
const express = require('express');
const router = express.Router();

const authRoutes = require('./authRoutes');
const codeRoutes = require('./codeRoutes');
const userRoutes = require('./userRoutes');

router.use('/auth', authRoutes);      // /api/auth/...
router.use('/codes', codeRoutes);     // /api/codes/...
router.use('/user', userRoutes);      // /api/user/...

module.exports = router;