const router = require('express').Router();
const { getAvailabilities, saveAvailabilities } = require('../controllers/availabilityController');
const { authMiddleware } = require('../middleware/auth');

router.use(authMiddleware);

router.get('/', getAvailabilities);
router.post('/', saveAvailabilities);

module.exports = router;
