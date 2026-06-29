const router = require('express').Router();
const { getUsers, getAvailabilities, getContributions, getArtists, getCommonArtists, getTracks, setEventDate, deleteEventDate } = require('../controllers/adminController');
const { adminMiddleware } = require('../middleware/auth');

router.use(adminMiddleware);

router.get('/users', getUsers);
router.get('/availabilities', getAvailabilities);
router.get('/contributions', getContributions);
router.get('/artists', getArtists);
router.get('/artists/common', getCommonArtists);
router.get('/tracks', getTracks);
router.post('/event-date', setEventDate);
router.delete('/event-date', deleteEventDate);

module.exports = router;
