// backend/routes/userRoutes.js
const express = require('express');
const router = express.Router();
const userController = require('../controllers/userController');
const auth = require('../middlewares/authMiddleware');

router.get('/me', auth, userController.me);
router.put('/me', auth, userController.updateProfile);

module.exports = router;