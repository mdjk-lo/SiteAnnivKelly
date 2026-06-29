const axios = require('axios');
const db = require('../db');

let spotifyToken = null;
let tokenExpiry = 0;

async function getSpotifyToken() {
  if (spotifyToken && Date.now() < tokenExpiry) return spotifyToken;
  const creds = Buffer.from(
    `${process.env.SPOTIFY_CLIENT_ID}:${process.env.SPOTIFY_CLIENT_SECRET}`
  ).toString('base64');
  const { data } = await axios.post(
    'https://accounts.spotify.com/api/token',
    'grant_type=client_credentials',
    { headers: { Authorization: `Basic ${creds}`, 'Content-Type': 'application/x-www-form-urlencoded' } }
  );
  spotifyToken = data.access_token;
  tokenExpiry = Date.now() + data.expires_in * 1000 - 60000;
  return spotifyToken;
}

// ── ARTISTES ──

async function getVotes(req, res) {
  const [rows] = await db.execute('SELECT * FROM artist_votes WHERE user_id = ?', [req.user.id]);
  res.json(rows);
}

async function vote(req, res) {
  const { artist_name, artist_image, spotify_id, vote } = req.body;
  if (!artist_name || !vote) return res.status(400).json({ error: 'artist_name et vote requis' });
  try {
    await db.execute(
      `INSERT INTO artist_votes (user_id, artist_name, artist_image, spotify_id, vote)
       VALUES (?, ?, ?, ?, ?)
       ON DUPLICATE KEY UPDATE vote = ?, artist_image = ?`,
      [req.user.id, artist_name, artist_image, spotify_id, vote, vote, artist_image]
    );
    res.json({ message: 'Vote enregistré' });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Erreur serveur' });
  }
}

async function removeVote(req, res) {
  await db.execute(
    'DELETE FROM artist_votes WHERE user_id=? AND artist_name=?',
    [req.user.id, decodeURIComponent(req.params.artist_name)]
  );
  res.json({ message: 'Vote supprimé' });
}

// ── TRACKS ──

async function getTrackVotes(req, res) {
  const [rows] = await db.execute('SELECT * FROM track_votes WHERE user_id = ?', [req.user.id]);
  res.json(rows);
}

async function voteTrack(req, res) {
  const { track_name, artist_name, album_image, spotify_id, vote } = req.body;
  if (!track_name || !artist_name || !spotify_id || !vote)
    return res.status(400).json({ error: 'Champs manquants' });
  try {
    await db.execute(
      `INSERT INTO track_votes (user_id, track_name, artist_name, album_image, spotify_id, vote)
       VALUES (?, ?, ?, ?, ?, ?)
       ON DUPLICATE KEY UPDATE vote = ?, album_image = ?`,
      [req.user.id, track_name, artist_name, album_image, spotify_id, vote, vote, album_image]
    );
    res.json({ message: 'Vote musique enregistré' });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Erreur serveur' });
  }
}

async function removeTrackVote(req, res) {
  await db.execute(
    'DELETE FROM track_votes WHERE user_id=? AND spotify_id=?',
    [req.user.id, decodeURIComponent(req.params.spotify_id)]
  );
  res.json({ message: 'Vote musique supprimé' });
}

// ── SPOTIFY ──

async function searchArtists(req, res) {
  const { q } = req.query;
  if (!q) return res.status(400).json({ error: 'Paramètre q requis' });
  if (!process.env.SPOTIFY_CLIENT_ID) return res.status(503).json({ error: 'Spotify non configuré' });
  try {
    const token = await getSpotifyToken();
    const { data } = await axios.get('https://api.spotify.com/v1/search', {
      params: { q, type: 'artist', limit: 8 },
      headers: { Authorization: `Bearer ${token}` },
    });
    res.json(data.artists.items.map(a => ({
      spotify_id: a.id,
      name: a.name,
      image: a.images?.[0]?.url || null,
      genres: a.genres?.slice(0, 3) || [],
      popularity: a.popularity,
    })));
  } catch (err) {
    console.error('searchArtists error:', err.response?.data || err.message);
    res.status(500).json({ error: 'Erreur Spotify' });
  }
}

async function getArtistTopTracks(req, res) {
  const { spotify_id } = req.params;
  if (!process.env.SPOTIFY_CLIENT_ID) return res.status(503).json({ error: 'Spotify non configuré' });
  try {
    const token = await getSpotifyToken();
    const { data } = await axios.get(
      `https://api.spotify.com/v1/artists/${spotify_id}/top-tracks`,
      {
        params: { market: 'FR' },
        headers: { Authorization: `Bearer ${token}` },
      }
    );
    res.json(data.tracks.slice(0, 6).map(t => ({
      spotify_id: t.id,
      track_name: t.name,
      artist_name: t.artists.map(a => a.name).join(', '),
      album_image: t.album.images[1]?.url || t.album.images[0]?.url || null,
      duration_ms: t.duration_ms,
      preview_url: t.preview_url,
    })));
  } catch (err) {
    console.error('getArtistTopTracks error:', err.response?.data || err.message);
    res.status(500).json({ error: 'Erreur Spotify' });
  }
}

async function searchTracks(req, res) {
  const { q } = req.query;
  if (!q) return res.status(400).json({ error: 'Paramètre q requis' });
  if (!process.env.SPOTIFY_CLIENT_ID) return res.status(503).json({ error: 'Spotify non configuré' });
  try {
    const token = await getSpotifyToken();
    const { data } = await axios.get('https://api.spotify.com/v1/search', {
      params: { q, type: 'track', limit: 10 },
      headers: { Authorization: `Bearer ${token}` },
    });
    res.json(data.tracks.items.map(t => ({
      spotify_id: t.id,
      track_name: t.name,
      artist_name: t.artists.map(a => a.name).join(', '),
      album_image: t.album.images[1]?.url || t.album.images[0]?.url || null,
      duration_ms: t.duration_ms,
      preview_url: t.preview_url,
    })));
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Erreur Spotify' });
  }
}

module.exports = { getVotes, vote, removeVote, getTrackVotes, voteTrack, removeTrackVote, searchArtists, searchTracks, getArtistTopTracks };
