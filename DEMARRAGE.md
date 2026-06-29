# Démarrage du projet AnnivKelly2026

## 1. Base de données MySQL

1. Ouvre **MySQL Workbench**
2. Connecte-toi à ton serveur local
3. Ouvre le fichier `database/schema.sql`
4. Exécute-le (bouton ⚡ ou Ctrl+Shift+Enter)

## 2. Backend (Node.js)

```bash
cd backend
copy .env.example .env
# Ouvre .env et remplis : DB_PASSWORD, JWT_SECRET
npm install
npm run dev
```

Le serveur tourne sur http://localhost:3001

## 3. Frontend (React)

```bash
cd frontend
npm install
npm run dev
```

Le site tourne sur http://localhost:5173

## 4. Créer le compte admin

Après avoir lancé le backend, exécute cette requête dans MySQL Workbench :

```sql
USE annivkelly;
-- Remplace le hash par celui généré avec bcrypt
-- Pour l'instant connecte-toi via l'API ou ajoute un script
```

Ou utilise ce petit script Node.js une fois :

```bash
cd backend
node -e "const b=require('bcrypt'); b.hash('admin2026',10).then(h=>console.log(h))"
```

Copie le hash affiché, puis dans Workbench :

```sql
UPDATE users SET password_hash = 'LE_HASH_ICI' WHERE email = 'admin@annivkelly.com';
```

## 5. Spotify (optionnel)

1. Va sur https://developer.spotify.com/dashboard
2. Crée une app
3. Copie Client ID et Client Secret dans `backend/.env`

## Structure des dossiers

```
SiteAnnivKelly/
├── database/
│   └── schema.sql          # Tables MySQL
├── backend/
│   ├── server.js            # Serveur Express
│   ├── db.js                # Connexion MySQL
│   ├── .env                 # Config (à créer)
│   ├── middleware/auth.js   # JWT
│   └── routes/              # API routes
└── frontend/
    └── src/
        ├── pages/           # Toutes les pages
        └── components/      # Composants réutilisables
```
