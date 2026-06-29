const db = require('../db');

async function getUsers(req, res) {
  const [rows] = await db.execute(
    'SELECT id, nom, prenom, email, created_at FROM users WHERE is_admin = FALSE ORDER BY created_at DESC'
  );
  res.json(rows);
}

async function getUserCount(req, res) {
  const [[{ total }]] = await db.execute('SELECT COUNT(*) as total FROM users WHERE is_admin = FALSE');
  res.json({ total });
}

async function getAvailabilities(req, res) {
  const [rows] = await db.execute(`
    SELECT DATE_FORMAT(a.date, '%Y-%m-%d') as date,
      SUM(CASE WHEN a.disponible = 1 THEN 1 ELSE 0 END) as dispo_count,
      GROUP_CONCAT(CONCAT(u.prenom, ' ', u.nom) ORDER BY u.nom SEPARATOR ', ') as personnes_dispos
    FROM availabilities a
    JOIN users u ON a.user_id = u.id
    WHERE a.disponible = 1 AND u.is_admin = FALSE
    GROUP BY a.date
    ORDER BY dispo_count DESC, a.date
  `);
  res.json(rows);
}

async function getContributions(req, res) {
  const [rows] = await db.execute(`
    SELECT c.*, u.nom, u.prenom
    FROM contributions c
    JOIN users u ON c.user_id = u.id
    ORDER BY c.type, u.nom
  `);
  res.json(rows);
}

async function getTracks(req, res) {
  const [rows] = await db.execute(`
    SELECT track_name, artist_name, album_image,
      SUM(CASE WHEN vote = 'like' THEN 1 ELSE 0 END) as likes,
      SUM(CASE WHEN vote = 'dislike' THEN 1 ELSE 0 END) as dislikes,
      (SUM(CASE WHEN vote = 'like' THEN 1 ELSE 0 END) - SUM(CASE WHEN vote = 'dislike' THEN 1 ELSE 0 END)) as score
    FROM track_votes
    GROUP BY track_name, artist_name, album_image
    ORDER BY score DESC, likes DESC
  `);
  res.json(rows);
}

async function getArtists(req, res) {
  const [rows] = await db.execute(`
    SELECT artist_name, artist_image,
      SUM(CASE WHEN vote = 'like' THEN 1 ELSE 0 END) as likes,
      SUM(CASE WHEN vote = 'dislike' THEN 1 ELSE 0 END) as dislikes,
      COUNT(*) as total_votes,
      (SUM(CASE WHEN vote = 'like' THEN 1 ELSE 0 END) - SUM(CASE WHEN vote = 'dislike' THEN 1 ELSE 0 END)) as score
    FROM artist_votes
    GROUP BY artist_name, artist_image
    ORDER BY score DESC, likes DESC
  `);
  res.json(rows);
}

async function getCommonArtists(req, res) {
  const [[{ total }]] = await db.execute(
    'SELECT COUNT(*) as total FROM users WHERE is_admin = FALSE'
  );
  const [rows] = await db.execute(`
    SELECT artist_name, artist_image, COUNT(*) as like_count
    FROM artist_votes
    WHERE vote = 'like'
    GROUP BY artist_name, artist_image
    HAVING like_count = ?
    ORDER BY like_count DESC
  `, [total]);
  res.json(rows);
}

async function setEventDate(req, res) {
  const { date, heure, lieu, message } = req.body;
  await db.execute('DELETE FROM event_date');
  await db.execute(
    'INSERT INTO event_date (date, heure, lieu, message) VALUES (?, ?, ?, ?)',
    [date, heure || null, lieu || null, message || null]
  );
  res.json({ message: "Date de l'événement enregistrée" });
}

async function deleteEventDate(req, res) {
  await db.execute('DELETE FROM event_date');
  res.json({ message: 'Date supprimée' });
}

module.exports = { getUsers, getAvailabilities, getContributions, getArtists, getCommonArtists, getTracks, setEventDate, deleteEventDate };
