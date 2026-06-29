const jwt = require('jsonwebtoken');
const db = require('../db');
const multer = require('multer');
const path = require('path');
const fs = require('fs');

const storage = multer.diskStorage({
  destination: (req, file, cb) => cb(null, path.join(__dirname, '../uploads/avatars')),
  filename: (req, file, cb) => {
    const ext = path.extname(file.originalname);
    cb(null, `user_${req.user.id}${ext}`);
  },
});
const upload = multer({
  storage,
  limits: { fileSize: 3 * 1024 * 1024 },
  fileFilter: (req, file, cb) => {
    if (!file.mimetype.startsWith('image/')) return cb(new Error('Image uniquement'));
    cb(null, true);
  },
});
const uploadMiddleware = upload.single('avatar');

function signToken(user) {
  return jwt.sign(
    { id: user.id, email: user.email, nom: user.nom, prenom: user.prenom, is_admin: user.is_admin, avatar: user.avatar || null },
    process.env.JWT_SECRET,
    { expiresIn: process.env.JWT_EXPIRES_IN }
  );
}

async function register(req, res) {
  const { nom, prenom, email, password } = req.body;
  if (!nom || !prenom || !email || !password)
    return res.status(400).json({ error: 'Tous les champs sont requis' });

  try {
    const [result] = await db.execute(
      'INSERT INTO users (nom, prenom, email, password) VALUES (?, ?, ?, ?)',
      [nom, prenom, email, password]
    );
    const user = { id: result.insertId, nom, prenom, email, is_admin: false };
    res.status(201).json({ token: signToken(user), user });
  } catch (err) {
    if (err.code === 'ER_DUP_ENTRY')
      return res.status(409).json({ error: 'Cet email est déjà utilisé' });
    res.status(500).json({ error: 'Erreur serveur' });
  }
}

async function login(req, res) {
  const { email, password } = req.body;
  try {
    const [rows] = await db.execute('SELECT * FROM users WHERE email = ?', [email]);
    if (!rows.length) return res.status(401).json({ error: 'Email ou mot de passe incorrect' });

    const user = rows[0];
    if (password !== user.password)
      return res.status(401).json({ error: 'Email ou mot de passe incorrect' });

    const { password: _pwd, ...safeUser } = user;
    res.json({ token: signToken(safeUser), user: safeUser });
  } catch (err) {
    console.error('Login error:', err);
    res.status(500).json({ error: 'Erreur serveur' });
  }
}

async function getMe(req, res) {
  const [rows] = await db.execute(
    'SELECT id, nom, prenom, email, is_admin, avatar, created_at FROM users WHERE id = ?',
    [req.user.id]
  );
  res.json(rows[0]);
}

async function updateMe(req, res) {
  const { nom, prenom, email } = req.body;
  const [rows] = await db.execute(
    'UPDATE users SET nom=?, prenom=?, email=? WHERE id=? RETURNING id, nom, prenom, email, is_admin, avatar',
    [nom, prenom, email, req.user.id]
  );
  // MySQL ne supporte pas RETURNING — on refetch
  const [[updated]] = await db.execute(
    'SELECT id, nom, prenom, email, is_admin, avatar FROM users WHERE id=?',
    [req.user.id]
  );
  res.json({ message: 'Profil mis à jour', token: signToken(updated), user: updated });
}

async function changePassword(req, res) {
  const { new_password } = req.body;
  if (!new_password) return res.status(400).json({ error: 'Nouveau mot de passe requis' });
  await db.execute('UPDATE users SET password=? WHERE id=?', [new_password, req.user.id]);
  res.json({ message: 'Mot de passe modifié' });
}

async function uploadAvatar(req, res) {
  if (!req.file) return res.status(400).json({ error: 'Aucun fichier' });
  const avatarUrl = `/uploads/avatars/${req.file.filename}`;
  await db.execute('UPDATE users SET avatar=? WHERE id=?', [avatarUrl, req.user.id]);
  const [[updated]] = await db.execute(
    'SELECT id, nom, prenom, email, is_admin, avatar FROM users WHERE id=?',
    [req.user.id]
  );
  res.json({ message: 'Avatar mis à jour', token: signToken(updated), user: updated, avatar: avatarUrl });
}

module.exports = { register, login, getMe, updateMe, changePassword, uploadAvatar, uploadMiddleware };
