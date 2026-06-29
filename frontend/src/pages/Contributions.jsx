import { useEffect, useState, useRef } from 'react';
import { useAuth } from '../AuthContext';
import { Plus, Pencil, Trash2, Send, Filter } from 'lucide-react';
import api from '../api';
import './Contributions.css';

const BACKEND = import.meta.env.VITE_API_URL || 'http://localhost:3001';

function ChatAvatar({ prenom, nom, avatar, isMe }) {
  if (avatar) {
    return (
      <div className={`chat-avatar ${isMe ? 'me' : ''}`} style={{ padding: 0, overflow: 'hidden' }}>
        <img src={`${BACKEND}${avatar}`} alt={prenom} style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
      </div>
    );
  }
  return (
    <div className={`chat-avatar ${isMe ? 'me' : ''}`}>
      {prenom?.[0]}{nom?.[0]}
    </div>
  );
}

const TYPES = [
  { value: 'tous', label: 'Tous' },
  { value: 'nourriture', label: 'Nourriture' },
  { value: 'boisson', label: 'Boisson' },
  { value: 'decoration', label: 'Décoration' },
  { value: 'autre', label: 'Autre' },
];

const TYPE_COLORS = {
  nourriture: '#ff6b35',
  boisson: '#0ea5e9',
  decoration: '#e91e8c',
  autre: '#8b5cf6',
};

export default function Contributions() {
  const { user } = useAuth();
  const [myContribs, setMyContribs] = useState([]);
  const [allContribs, setAllContribs] = useState([]);
  const [filter, setFilter] = useState('tous');
  const [form, setForm] = useState({ type: 'nourriture', description: '', quantite: '' });
  const [editing, setEditing] = useState(null);
  const [showForm, setShowForm] = useState(false);
  const [loading, setLoading] = useState(true);
  const [msg, setMsg] = useState('');
  const feedRef = useRef();

  async function load() {
    const [mine, all] = await Promise.all([
      api.get('/contributions'),
      api.get('/contributions/all'),
    ]);
    setMyContribs(mine.data);
    setAllContribs(all.data);
    setLoading(false);
  }

  useEffect(() => { load(); }, []);

  useEffect(() => {
    if (feedRef.current) feedRef.current.scrollTop = feedRef.current.scrollHeight;
  }, [allContribs]);

  async function handleSubmit(e) {
    e.preventDefault();
    setMsg('');
    try {
      if (editing) {
        await api.put(`/contributions/${editing}`, form);
        setEditing(null);
      } else {
        await api.post('/contributions', form);
      }
      setForm({ type: 'nourriture', description: '', quantite: '' });
      setShowForm(false);
      setMsg(editing ? 'Contribution modifiée' : 'Contribution ajoutée');
      load();
    } catch {
      setMsg('Erreur');
    }
  }

  async function handleDelete(id) {
    if (!confirm('Supprimer cette contribution ?')) return;
    await api.delete(`/contributions/${id}`);
    load();
  }

  function startEdit(c) {
    setEditing(c.id);
    setForm({ type: c.type, description: c.description, quantite: c.quantite || '' });
    setShowForm(true);
  }

  const filtered = filter === 'tous' ? allContribs : allContribs.filter(c => c.type === filter);

  if (loading) return <div className="page-container"><p>Chargement...</p></div>;

  return (
    <div className="page-container">
      <div className="page-header">
        <h1>Les apports</h1>
        <p>Vois ce que tout le monde apporte et ajoute ta contribution</p>
      </div>

      {/* FIL DE DISCUSSION */}
      <div className="chat-section">
        <div className="chat-header">
          <span>Fil des contributions</span>
          <span className="chat-count">{allContribs.length} contribution{allContribs.length > 1 ? 's' : ''}</span>
        </div>

        <div className="chat-feed" ref={feedRef}>
          {allContribs.length === 0 ? (
            <div className="chat-empty">Aucune contribution pour l'instant. Sois le premier !</div>
          ) : (
            allContribs.map(c => {
              const isMe = c.user_id === user.id;
              return (
                <div key={c.id} className={`chat-bubble-wrap ${isMe ? 'mine' : 'theirs'}`}>
                  <div className={`chat-bubble ${isMe ? 'mine' : 'theirs'}`}>
                    {!isMe && <ChatAvatar prenom={c.prenom} nom={c.nom} avatar={c.avatar} />}
                    <div className="chat-body">
                      <div className="chat-meta">
                        <span className="chat-name">{isMe ? 'Moi' : `${c.prenom} ${c.nom}`}</span>
                        <span className="chat-type" style={{ background: TYPE_COLORS[c.type] + '22', color: TYPE_COLORS[c.type] }}>
                          {TYPES.find(t => t.value === c.type)?.label}
                        </span>
                      </div>
                      <div className="chat-text">
                        {c.description}
                        {c.quantite && <span className="chat-qty"> ({c.quantite})</span>}
                      </div>
                    </div>
                    {isMe && <ChatAvatar prenom={user.prenom} nom={user.nom} avatar={user.avatar} isMe />}
                  </div>
                  {isMe && (
                    <div className="chat-actions">
                      <button className="chat-btn edit" onClick={() => startEdit(c)}><Pencil size={12} /> Modifier</button>
                      <button className="chat-btn delete" onClick={() => handleDelete(c.id)}><Trash2 size={12} /> Supprimer</button>
                    </div>
                  )}

                </div>
              );
            })
          )}
        </div>

        <div className="chat-add">
          <button className="btn btn-primary" style={{ display: 'inline-flex', alignItems: 'center', gap: 8 }}
            onClick={() => { setShowForm(!showForm); setEditing(null); setForm({ type: 'nourriture', description: '', quantite: '' }); }}>
            {showForm ? 'Fermer' : <><Plus size={16} /> Ajouter ma contribution</>}
          </button>
        </div>

        {showForm && (
          <div className="chat-form card">
            <h3 style={{ marginBottom: 16 }}>{editing ? 'Modifier' : 'Nouvelle contribution'}</h3>
            <form onSubmit={handleSubmit}>
              <div className="type-selector">
                {TYPES.filter(t => t.value !== 'tous').map(t => (
                  <button key={t.value} type="button"
                    className={`type-btn ${form.type === t.value ? 'active' : ''}`}
                    style={{ '--type-color': TYPE_COLORS[t.value] }}
                    onClick={() => setForm({ ...form, type: t.value })}>
                    {t.label}
                  </button>
                ))}
              </div>
              <div className="form-group">
                <label>Ce que tu apportes</label>
                <input placeholder="Je peux apporter..." value={form.description}
                  onChange={e => setForm({ ...form, description: e.target.value })} required />
              </div>
              <div className="form-group">
                <label>Quantité (optionnel)</label>
                <input placeholder="Ex: 2 bouteilles, 1 grand plat..." value={form.quantite}
                  onChange={e => setForm({ ...form, quantite: e.target.value })} />
              </div>
              {msg && <p className={msg === 'Erreur' ? 'error-msg' : 'success-msg'}>{msg}</p>}
              <div style={{ display: 'flex', gap: 10 }}>
                <button type="submit" className="btn btn-primary" style={{ display: 'inline-flex', alignItems: 'center', gap: 8 }}>
                  <Send size={15} /> {editing ? 'Modifier' : 'Ajouter'}
                </button>
                {editing && <button type="button" className="btn btn-secondary" onClick={() => { setEditing(null); setShowForm(false); }}>Annuler</button>}
              </div>
            </form>
          </div>
        )}
      </div>

      {/* FILTRE + LISTE */}
      <div className="list-section">
        <h2><Filter size={18} /> Tous les apports</h2>
        <div className="filter-bar">
          {TYPES.map(t => (
            <button key={t.value}
              className={`filter-btn ${filter === t.value ? 'active' : ''}`}
              onClick={() => setFilter(t.value)}>
              {t.label}
              <span className="filter-count">
                {t.value === 'tous' ? allContribs.length : allContribs.filter(c => c.type === t.value).length}
              </span>
            </button>
          ))}
        </div>

        {filtered.length === 0 ? (
          <p style={{ color: 'var(--text-muted)', marginTop: 16 }}>Aucun apport dans cette catégorie.</p>
        ) : (
          <div className="contribs-list">
            {filtered.map(c => {
              const isMe = c.user_id === user.id;
              return (
                <div key={c.id} className="contrib-card card" style={{ borderLeftColor: TYPE_COLORS[c.type] }}>
                  <div className="contrib-card-header">
                    {c.avatar
                      ? <img src={`${BACKEND}${c.avatar}`} alt={c.prenom} className="contrib-avatar-img" />
                      : <div className="contrib-avatar-initials">{c.prenom?.[0]}{c.nom?.[0]}</div>
                    }
                    <div>
                      <div className="contrib-who">{isMe ? 'Moi' : `${c.prenom} ${c.nom}`}</div>
                      <div className="contrib-type" style={{ color: TYPE_COLORS[c.type] }}>
                        {TYPES.find(t => t.value === c.type)?.label}
                      </div>
                    </div>
                  </div>
                  <div className="contrib-desc">{c.description}</div>
                  {c.quantite && <div className="contrib-qty">{c.quantite}</div>}
                  {isMe && (
                    <div className="contrib-actions">
                      <button className="btn btn-secondary" onClick={() => startEdit(c)}><Pencil size={13} /></button>
                      <button className="btn btn-danger" onClick={() => handleDelete(c.id)}><Trash2 size={13} /></button>
                    </div>
                  )}
                </div>
              );
            })}
          </div>
        )}
      </div>
    </div>
  );
}
