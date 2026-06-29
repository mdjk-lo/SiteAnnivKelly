require('dotenv').config();
const express = require('express');
const cors = require('cors');
const db = require('./db');

const app = express();
app.use(cors({ origin: '*' }));
app.use(express.json());
app.use('/uploads', require('express').static(require('path').join(__dirname, 'uploads')));

app.use('/api/auth', require('./routes/auth'));
app.use('/api/availabilities', require('./routes/availability'));
app.use('/api/contributions', require('./routes/contributions'));
app.use('/api/artists', require('./routes/artists'));
app.use('/api/admin', require('./routes/admin'));

// Date de l'événement (publique pour les connectés)
app.get('/api/event-date', async (req, res) => {
  const [rows] = await db.execute('SELECT * FROM event_date LIMIT 1');
  res.json(rows[0] || null);
});

const PORT = process.env.PORT || 3001;
app.listen(PORT, () => console.log(`Backend lancé sur http://localhost:${PORT}`));
