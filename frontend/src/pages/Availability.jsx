import { useEffect, useState } from 'react';
import { Check, Save, Bell } from 'lucide-react';
import api from '../api';
import './Availability.css';

const PROPOSED_DATES = [
  '2026-07-11', '2026-07-12', '2026-07-18', '2026-07-19',
  '2026-07-25', '2026-07-26', '2026-08-01', '2026-08-02',
];

export default function Availability() {
  const [selected, setSelected] = useState({});
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [msg, setMsg] = useState('');

  useEffect(() => {
    api.get('/availabilities').then(r => {
      const map = {};
      r.data.forEach(a => {
        const dateKey = new Date(a.date).toISOString().slice(0, 10);
        if (a.disponible) map[dateKey] = true;
      });
      setSelected(map);
      setLoading(false);
    });
  }, []);

  function toggle(date) {
    setSelected(prev => {
      const next = { ...prev };
      if (next[date]) delete next[date];
      else next[date] = true;
      return next;
    });
  }

  async function save() {
    setSaving(true);
    setMsg('');
    const dates = Object.keys(selected).map(date => ({ date, disponible: true }));
    try {
      await api.post('/availabilities', { dates });
      setMsg('Disponibilités enregistrées !');
    } catch {
      setMsg('Erreur lors de la sauvegarde');
    } finally {
      setSaving(false);
    }
  }

  if (loading) return <div className="page-container"><p>Chargement...</p></div>;

  const dispo = Object.keys(selected).length;

  return (
    <div className="page-container">
      <div className="page-header">
        <h1>Mes disponibilités</h1>
        <p>Indique les dates où tu es disponible pour la fête</p>
      </div>

      {/* Rappel */}
      <div className="dispo-reminder">
        <Bell size={16} />
        <span>N'oublie pas d'enregistrer tes disponibilités après ta sélection !</span>
      </div>

      <div className="legend">
        <span className="badge dispo"><Check size={12} /> Disponible</span>
        <span className="badge neutre">Rien — pas disponible</span>
        <em>Clique pour sélectionner</em>
      </div>

      <div className="dates-grid">
        {PROPOSED_DATES.map(date => {
          const d = new Date(date + 'T00:00:00');
          const isDispo = !!selected[date];
          return (
            <button
              key={date}
              className={`date-card ${isDispo ? 'dispo' : ''}`}
              onClick={() => toggle(date)}
            >
              <span className="date-icon">
                {isDispo ? <Check size={20} /> : null}
              </span>
              <span className="date-weekday">{d.toLocaleDateString('fr-FR', { weekday: 'long' })}</span>
              <span className="date-day">{d.toLocaleDateString('fr-FR', { day: 'numeric', month: 'long' })}</span>
            </button>
          );
        })}
      </div>

      <div className="dispo-summary">
        Tu es disponible <strong>{dispo}</strong> jour{dispo > 1 ? 's' : ''} sur {PROPOSED_DATES.length} proposé{PROPOSED_DATES.length > 1 ? 's' : ''}.
      </div>

      {msg && <p className={msg.includes('Erreur') ? 'error-msg' : 'success-msg'} style={{ textAlign: 'center', marginBottom: 12 }}>{msg}</p>}

      <div style={{ textAlign: 'center' }}>
        <button className="btn btn-primary" onClick={save} disabled={saving} style={{ display: 'inline-flex', alignItems: 'center', gap: 8 }}>
          <Save size={16} /> {saving ? 'Sauvegarde...' : 'Enregistrer mes disponibilités'}
        </button>
      </div>
    </div>
  );
}
