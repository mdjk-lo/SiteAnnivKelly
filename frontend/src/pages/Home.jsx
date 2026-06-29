import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { useAuth } from '../AuthContext';
import { Calendar, Gift, Music, User, ArrowRight, MapPin, Clock } from 'lucide-react';
import api from '../api';
import './Home.css';

export default function Home() {
  const { user } = useAuth();
  const [eventDate, setEventDate] = useState(null);

  useEffect(() => {
    api.get('/event-date').then(r => setEventDate(r.data)).catch(() => {});
  }, []);

  return (
    <div className="home">

      {/* HERO */}
      <section className="hero">
        <div className="hero-bg-blobs">
          <div className="blob blob1" />
          <div className="blob blob2" />
        </div>
        <div className="hero-content">
          <span className="hero-tag">Vous êtes invité·e !</span>
          <h1 className="hero-title">L'anniversaire<br />de <span className="highlight">Kelly</span></h1>
          <p className="hero-sub">La grande fête approche. Inscris-toi pour confirmer ta présence, dire ce que tu apportes et voter pour la playlist.</p>

          {eventDate && (
            <div className="hero-date">
              <Calendar size={16} />
              <strong>{new Date(eventDate.date).toLocaleDateString('fr-FR', { weekday: 'long', day: 'numeric', month: 'long', year: 'numeric' })}</strong>
              {eventDate.heure && <><Clock size={14} /> {eventDate.heure}</>}
              {eventDate.lieu && <><MapPin size={14} /> {eventDate.lieu}</>}
            </div>
          )}

          <div className="hero-actions">
            {user ? (
              <Link to="/disponibilites" className="btn btn-primary btn-xl">
                Accéder à mon espace <ArrowRight size={18} />
              </Link>
            ) : (
              <>
                <Link to="/register" className="btn btn-primary btn-xl">Je m'inscris</Link>
                <Link to="/login" className="btn btn-secondary btn-xl">Déjà inscrit·e</Link>
              </>
            )}
          </div>
        </div>
      </section>

      {/* FEATURES */}
      <section className="features">
        <div className="features-inner">
          <h2 className="section-title">Tout ce que tu peux faire</h2>
          <p className="section-sub">En quelques étapes simples, organise ta participation à la fête</p>
          <div className="features-grid">
            {[
              { icon: <Calendar size={24} color="white" />, title: 'Tes disponibilités', desc: 'Indique les dates où tu es libre pour qu\'on trouve le meilleur créneau pour tout le monde.', color: '#ff4db8' },
              { icon: <Gift size={24} color="white" />, title: 'Ce que tu apportes', desc: 'Nourriture, boissons, décorations... Dis-nous ce que tu peux ramener pour la fête.', color: '#e91e8c' },
              { icon: <Music size={24} color="white" />, title: 'La playlist', desc: 'Vote pour tes artistes préférés. Recherche sur Spotify ou choisis dans la liste.', color: '#c0006e' },
              { icon: <User size={24} color="white" />, title: 'Ton profil', desc: 'Consulte et modifie tes informations à tout moment depuis ton espace personnel.', color: '#ff4db8' },
            ].map(f => (
              <div key={f.title} className="feature-card">
                <div className="feature-icon" style={{ background: f.color }}>{f.icon}</div>
                <h3>{f.title}</h3>
                <p>{f.desc}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* HOW IT WORKS */}
      <section className="how">
        <div className="how-inner">
          <h2 className="section-title">Comment ça marche ?</h2>
          <div className="steps">
            {[
              { n: '1', title: 'Inscris-toi', desc: 'Crée ton compte en 30 secondes avec ton prénom et ton email.' },
              { n: '2', title: 'Complète ton profil', desc: 'Indique tes disponibilités et ce que tu peux apporter.' },
              { n: '3', title: 'Vote pour la playlist', desc: 'Like ou dislike les artistes pour construire la meilleure playlist.' },
              { n: '4', title: 'Profite de la fête !', desc: 'Kelly choisit la date parfaite et vous annonce tout ici.' },
            ].map(s => (
              <div key={s.n} className="step">
                <div className="step-num">{s.n}</div>
                <div>
                  <h3>{s.title}</h3>
                  <p>{s.desc}</p>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* CTA */}
      <section className="cta">
        <div className="cta-inner">
          <h2>Prêt·e à rejoindre la fête ?</h2>
          <p>{user ? `Bienvenue ${user.prenom} !` : "Inscris-toi maintenant et fais partie de l'aventure !"}</p>
          {user ? (
            <Link to="/disponibilites" className="btn btn-primary btn-xl">
              Tu es déjà inscrit·e <ArrowRight size={18} />
            </Link>
          ) : (
            <Link to="/register" className="btn btn-primary btn-xl">
              S'inscrire <ArrowRight size={18} />
            </Link>
          )}
        </div>
      </section>

      <footer className="footer">
        <p>Anniv Kelly 2026 — Fait par Lolo</p>
        <div className="footer-links">
          <Link to="/cgu">CGU</Link>
          <span>·</span>
          <Link to="/confidentialite">Confidentialité</Link>
        </div>
      </footer>
    </div>
  );
}
