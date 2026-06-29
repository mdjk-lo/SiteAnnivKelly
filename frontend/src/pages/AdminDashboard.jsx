import { useEffect, useState } from 'react';
import { Users, Calendar, Package, Music, CalendarCheck, Mic, ChevronRight } from 'lucide-react';
import api from '../api';
import './AdminDashboard.css';

const TABS = [
  { label: 'Inscrits', icon: <Users size={15} /> },
  { label: 'Disponibilités', icon: <Calendar size={15} /> },
  { label: 'Apports', icon: <Package size={15} /> },
  { label: 'Artistes', icon: <Mic size={15} /> },
  { label: 'Musiques', icon: <Music size={15} /> },
  { label: 'Date', icon: <CalendarCheck size={15} /> },
];

const TYPE_COLORS = {
  nourriture: '#ff6b35',
  boisson: '#0ea5e9',
  decoration: '#e91e8c',
  autre: '#8b5cf6',
};

export default function AdminDashboard() {
  const [tab, setTab] = useState(0);
  const [users, setUsers] = useState([]);
  const [availabilities, setAvailabilities] = useState([]);
  const [selectedUsers, setSelectedUsers] = useState([]);
  const [contributions, setContribs] = useState([]);
  const [artists, setArtists] = useState([]);
  const [tracks, setTracks] = useState([]);
  const [eventForm, setEventForm] = useState({ date: '', heure: '', lieu: '', message: '' });
  const [eventMsg, setEventMsg] = useState('');

  useEffect(() => {
    api.get('/admin/users').then(r => setUsers(r.data));
    api.get('/admin/availabilities').then(r => setAvailabilities(r.data));
    api.get('/admin/contributions').then(r => setContribs(r.data));
    api.get('/admin/artists').then(r => setArtists(r.data));
    api.get('/admin/tracks').then(r => setTracks(r.data));
    api.get('/event-date').then(r => {
      if (r.data) setEventForm({
        date: r.data.date?.slice(0, 10) || '',
        heure: r.data.heure || '',
        lieu: r.data.lieu || '',
        message: r.data.message || '',
      });
    });
  }, []);

  async function saveEventDate(e) {
    e.preventDefault();
    try {
      await api.post('/admin/event-date', eventForm);
      setEventMsg('Date publiée — visible par tous les invités');
    } catch {
      setEventMsg('Erreur');
    }
  }

  const contribsByType = contributions.reduce((acc, c) => {
    acc[c.type] = acc[c.type] || [];
    acc[c.type].push(c);
    return acc;
  }, {});

  const bestDate = availabilities[0];

  // Max dispo count pour calculer l'intensité
  const maxCount = Math.max(...availabilities.map(d => d.dispo_count), 1);

  // Dates filtrées selon les users sélectionnés
  const filteredDates = selectedUsers.length === 0
    ? availabilities
    : availabilities.filter(d => {
        const names = (d.personnes_dispos || '').split(', ');
        return selectedUsers.every(uid => {
          const u = users.find(u => u.id === uid);
          return u && names.some(n => n.includes(u.prenom));
        });
      });

  function toggleUser(uid) {
    setSelectedUsers(prev =>
      prev.includes(uid) ? prev.filter(id => id !== uid) : [...prev, uid]
    );
  }

  return (
    <div className="page-container">
      <div className="page-header">
        <h1>Dashboard Admin</h1>
        <p>Vue d'ensemble de l'anniversaire de Kelly</p>
      </div>

      {/* STATS */}
      <div className="admin-stats">
        <div className="stat-card">
          <span className="stat-num">{users.length}</span>
          <span className="stat-label">Inscrits</span>
        </div>
        <div className="stat-card">
          <span className="stat-num">{contributions.length}</span>
          <span className="stat-label">Apports</span>
        </div>
        <div className="stat-card">
          <span className="stat-num">{artists.filter(a => a.likes > 0).length}</span>
          <span className="stat-label">Artistes likés</span>
        </div>
        <div className="stat-card">
          <span className="stat-num">{tracks.filter(t => t.likes > 0).length}</span>
          <span className="stat-label">Musiques likées</span>
        </div>
      </div>

      {/* MEILLEURE DATE */}
      {bestDate && (
        <div className="best-date-banner">
          <Calendar size={18} />
          <div>
            <strong>Meilleure date :</strong>{' '}
            {new Date(bestDate.date + 'T12:00:00').toLocaleDateString('fr-FR', { weekday: 'long', day: 'numeric', month: 'long' })}
            {' '}— {bestDate.dispo_count} personne{bestDate.dispo_count > 1 ? 's' : ''} disponible{bestDate.dispo_count > 1 ? 's' : ''}
          </div>
        </div>
      )}

      {/* ONGLETS */}
      <div className="admin-tabs">
        {TABS.map((t, i) => (
          <button key={t.label} className={`tab-btn ${tab === i ? 'active' : ''}`} onClick={() => setTab(i)}>
            {t.icon} {t.label}
          </button>
        ))}
      </div>

      {/* INSCRITS */}
      {tab === 0 && (
        <div>
          <h2 className="tab-title">Inscrits ({users.length})</h2>
          {users.length === 0 ? <p className="empty">Aucun inscrit pour l'instant.</p> : (
            <div className="admin-table">
              <table>
                <thead>
                  <tr><th>Prénom</th><th>Nom</th><th>Email</th><th>Inscrit le</th></tr>
                </thead>
                <tbody>
                  {users.map(u => (
                    <tr key={u.id}>
                      <td><strong>{u.prenom}</strong></td>
                      <td>{u.nom}</td>
                      <td>{u.email}</td>
                      <td>{new Date(u.created_at).toLocaleDateString('fr-FR')}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </div>
      )}

      {/* DISPONIBILITÉS */}
      {tab === 1 && (
        <div>
          <h2 className="tab-title">Disponibilités</h2>

          {/* Filtre par invité */}
          {users.length > 0 && (
            <div className="dispo-filter">
              <span className="dispo-filter-label">Filtrer par invité :</span>
              <div className="dispo-filter-chips">
                {users.map(u => (
                  <button
                    key={u.id}
                    className={`filter-chip ${selectedUsers.includes(u.id) ? 'active' : ''}`}
                    onClick={() => toggleUser(u.id)}
                  >
                    {selectedUsers.includes(u.id) && <ChevronRight size={13} />}
                    {u.prenom} {u.nom}
                  </button>
                ))}
              </div>
              {selectedUsers.length > 0 && (
                <button className="clear-filter" onClick={() => setSelectedUsers([])}>
                  Tout afficher
                </button>
              )}
            </div>
          )}

          {availabilities.length === 0 ? (
            <p className="empty">Aucune disponibilité renseignée.</p>
          ) : (
            <div className="dispo-heatmap">
              {filteredDates.map((d, i) => {
                const intensity = d.dispo_count / maxCount; // 0..1
                const isTop = i === 0 && selectedUsers.length === 0;
                return (
                  <div
                    key={d.date}
                    className={`dispo-heat-card ${isTop ? 'top' : ''}`}
                    style={{ '--intensity': intensity }}
                  >
                    {isTop && <span className="best-badge">Meilleure date</span>}
                    <div className="heat-date">
                      {new Date(d.date + 'T12:00:00').toLocaleDateString('fr-FR', { weekday: 'long', day: 'numeric', month: 'long' })}
                    </div>
                    <div className="heat-count-row">
                      <div className="heat-dots">
                        {Array.from({ length: maxCount }).map((_, idx) => (
                          <div key={idx} className={`heat-dot ${idx < d.dispo_count ? 'filled' : ''}`} />
                        ))}
                      </div>
                      <span className="heat-num">{d.dispo_count} / {maxCount}</span>
                    </div>
                    <div className="heat-names">{d.personnes_dispos}</div>
                  </div>
                );
              })}
              {filteredDates.length === 0 && (
                <p className="empty">Aucune date commune pour la sélection.</p>
              )}
            </div>
          )}
        </div>
      )}

      {/* APPORTS */}
      {tab === 2 && (
        <div>
          <h2 className="tab-title">Apports ({contributions.length})</h2>
          {contributions.length === 0 ? <p className="empty">Aucun apport renseigné.</p> : (
            Object.entries(contribsByType).map(([type, items]) => (
              <div key={type} className="contrib-section">
                <h3 className="contrib-type-title" style={{ color: TYPE_COLORS[type] }}>
                  {type.charAt(0).toUpperCase() + type.slice(1)} ({items.length})
                </h3>
                <div className="admin-table">
                  <table>
                    <thead><tr><th>Utilisateur</th><th>Description</th><th>Quantité</th></tr></thead>
                    <tbody>
                      {items.map(c => (
                        <tr key={c.id}>
                          <td><strong>{c.prenom} {c.nom}</strong></td>
                          <td>{c.description}</td>
                          <td>{c.quantite || '—'}</td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </div>
            ))
          )}
        </div>
      )}

      {/* ARTISTES */}
      {tab === 3 && (
        <div>
          <h2 className="tab-title">Classement artistes</h2>
          {artists.length === 0 ? <p className="empty">Aucun vote pour l'instant.</p> : (
            <div className="ranking-list">
              {artists.slice(0, 20).map((a, i) => (
                <div key={a.artist_name} className={`ranking-item card ${i < 3 ? 'top' : ''}`}>
                  <span className="rank-num">#{i + 1}</span>
                  {a.artist_image
                    ? <img src={a.artist_image} alt={a.artist_name} className="rank-img" />
                    : <div className="rank-img-placeholder"><Mic size={18} color="var(--pink)" /></div>
                  }
                  <div className="rank-info">
                    <div className="rank-name">{a.artist_name}</div>
                    <div className="rank-stats">
                      <span className="like-count">{a.likes} like{a.likes > 1 ? 's' : ''}</span>
                      {a.dislikes > 0 && <span className="dislike-count">{a.dislikes} dislike{a.dislikes > 1 ? 's' : ''}</span>}
                    </div>
                  </div>
                  <div className="rank-score">Score {a.score > 0 ? '+' : ''}{a.score}</div>
                </div>
              ))}
            </div>
          )}
        </div>
      )}

      {/* MUSIQUES */}
      {tab === 4 && (
        <div>
          <h2 className="tab-title">Classement musiques</h2>
          {tracks.length === 0 ? <p className="empty">Aucun vote pour l'instant.</p> : (
            <div className="ranking-list">
              {tracks.slice(0, 20).map((t, i) => (
                <div key={t.track_name} className={`ranking-item card ${i < 3 ? 'top' : ''}`}>
                  <span className="rank-num">#{i + 1}</span>
                  {t.album_image
                    ? <img src={t.album_image} alt={t.track_name} className="rank-img" style={{ borderRadius: 6 }} />
                    : <div className="rank-img-placeholder"><Music size={18} color="var(--pink)" /></div>
                  }
                  <div className="rank-info">
                    <div className="rank-name">{t.track_name}</div>
                    <div className="rank-artist">{t.artist_name}</div>
                    <div className="rank-stats">
                      <span className="like-count">{t.likes} like{t.likes > 1 ? 's' : ''}</span>
                      {t.dislikes > 0 && <span className="dislike-count">{t.dislikes} dislike{t.dislikes > 1 ? 's' : ''}</span>}
                    </div>
                  </div>
                  <div className="rank-score">Score {t.score > 0 ? '+' : ''}{t.score}</div>
                </div>
              ))}
            </div>
          )}
        </div>
      )}

      {/* DATE ÉVÉNEMENT */}
      {tab === 5 && (
        <div>
          <h2 className="tab-title">Définir la date de l'anniversaire</h2>
          <div className="card" style={{ maxWidth: 500 }}>
            <form onSubmit={saveEventDate}>
              <div className="form-group">
                <label>Date</label>
                <input type="date" value={eventForm.date} onChange={e => setEventForm({ ...eventForm, date: e.target.value })} required />
              </div>
              <div className="form-group">
                <label>Heure (optionnel)</label>
                <input type="time" value={eventForm.heure} onChange={e => setEventForm({ ...eventForm, heure: e.target.value })} />
              </div>
              <div className="form-group">
                <label>Lieu (optionnel)</label>
                <input placeholder="Adresse ou lieu" value={eventForm.lieu} onChange={e => setEventForm({ ...eventForm, lieu: e.target.value })} />
              </div>
              <div className="form-group">
                <label>Message pour les invités (optionnel)</label>
                <textarea rows="3" placeholder="Ex: On se retrouve chez moi à partir de 19h !" value={eventForm.message}
                  onChange={e => setEventForm({ ...eventForm, message: e.target.value })} />
              </div>
              <div style={{ display: 'flex', gap: 10, marginBottom: 12 }}>
                <button type="submit" className="btn btn-primary">Publier la date</button>
                <button type="button" className="btn btn-danger" onClick={async () => {
                  await api.delete('/admin/event-date');
                  setEventForm({ date: '', heure: '', lieu: '', message: '' });
                  setEventMsg('Date supprimée');
                }}>Supprimer</button>
              </div>
              {eventMsg && <p className={eventMsg === 'Erreur' ? 'error-msg' : 'success-msg'}>{eventMsg}</p>}
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
