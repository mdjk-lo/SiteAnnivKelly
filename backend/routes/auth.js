const router = require('express').Router();
const { register, login, getMe, updateMe, changePassword, uploadAvatar, uploadMiddleware } = require('../controllers/authController');
const { authMiddleware } = require('../middleware/auth');

router.post('/register', register);
router.post('/login', login);
router.get('/me', authMiddleware, getMe);
router.put('/me', authMiddleware, updateMe);
router.put('/me/password', authMiddleware, changePassword);
router.post('/me/avatar', authMiddleware, uploadMiddleware, uploadAvatar);

module.exports = router;
