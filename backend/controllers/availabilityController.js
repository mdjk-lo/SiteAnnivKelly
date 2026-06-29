const db = require('../db');

async function getAvailabilities(req, res) {
  const [rows] = await db.execute(
    'SELECT user_id, DATE_FORMAT(date, "%Y-%m-%d") as date, disponible FROM availabilities WHERE user_id = ?',
    [req.user.id]
  );
  res.json(rows);
}

async function saveAvailabilities(req, res) {
  const { dates } = req.body;
  if (!Array.isArray(dates))
    return res.status(400).json({ error: 'dates doit être un tableau' });

  try {
    await db.execute('DELETE FROM availabilities WHERE user_id = ?', [req.user.id]);
    for (const d of dates) {
      await db.execute(
        'INSERT INTO availabilities (user_id, date, disponible) VALUES (?, ?, ?)',
        [req.user.id, d.date, d.disponible]
      );
    }
    res.json({ message: 'Disponibilités enregistrées' });
  } catch (err) {
    console.error('Availability error:', err);
    res.status(500).json({ error: 'Erreur serveur' });
  }
}

module.exports = { getAvailabilities, saveAvailabilities };
