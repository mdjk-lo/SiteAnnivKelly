const router = require('express').Router();
const { getContributions, getAllContributions, createContribution, updateContribution, deleteContribution } = require('../controllers/contributionsController');
const { authMiddleware } = require('../middleware/auth');

router.use(authMiddleware);

router.get('/', getContributions);
router.get('/all', getAllContributions);
router.post('/', createContribution);
router.put('/:id', updateContribution);
router.delete('/:id', deleteContribution);

module.exports = router;
