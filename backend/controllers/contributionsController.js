const db = require('../db');

async function getContributions(req, res) {
  const [rows] = await db.execute(
    'SELECT * FROM contributions WHERE user_id = ?',
    [req.user.id]
  );
  res.json(rows);
}

async function getAllContributions(req, res) {
  const [rows] = await db.execute(`
    SELECT c.*, u.nom, u.prenom, u.avatar
    FROM contributions c
    JOIN users u ON c.user_id = u.id
    ORDER BY c.id ASC
  `);
  res.json(rows);
}

async function createContribution(req, res) {
  const { type, description, quantite } = req.body;
  if (!type || !description)
    return res.status(400).json({ error: 'Type et description requis' });

  const [result] = await db.execute(
    'INSERT INTO contributions (user_id, type, description, quantite) VALUES (?, ?, ?, ?)',
    [req.user.id, type, description, quantite || null]
  );
  res.status(201).json({ id: result.insertId });
}

async function updateContribution(req, res) {
  const { type, description, quantite } = req.body;
  await db.execute(
    'UPDATE contributions SET type=?, description=?, quantite=? WHERE id=? AND user_id=?',
    [type, description, quantite || null, req.params.id, req.user.id]
  );
  res.json({ message: 'Contribution mise à jour' });
}

async function deleteContribution(req, res) {
  await db.execute(
    'DELETE FROM contributions WHERE id=? AND user_id=?',
    [req.params.id, req.user.id]
  );
  res.json({ message: 'Contribution supprimée' });
}

module.exports = { getContributions, getAllContributions, createContribution, updateContribution, deleteContribution };
