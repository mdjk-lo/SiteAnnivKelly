const router = require('express').Router();
const {
  getVotes, vote, removeVote,
  getTrackVotes, voteTrack, removeTrackVote,
  searchArtists, searchTracks, getArtistTopTracks,
} = require('../controllers/artistsController');
const { authMiddleware } = require('../middleware/auth');

router.use(authMiddleware);

// Artistes
router.get('/votes', getVotes);
router.post('/vote', vote);
router.delete('/vote/:artist_name', removeVote);
router.get('/search', searchArtists);
router.get('/top-tracks/:spotify_id', getArtistTopTracks);

// Musiques
router.get('/tracks/votes', getTrackVotes);
router.post('/tracks/vote', voteTrack);
router.delete('/tracks/vote/:spotify_id', removeTrackVote);
router.get('/tracks/search', searchTracks);

module.exports = router;
