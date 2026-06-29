import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../AuthContext';
import api from '../api';
import './AuthForm.css';

export default function Register() {
  const { login } = useAuth();
  const navigate = useNavigate();
  const [form, setForm] = useState({ nom: '', prenom: '', email: '', password: '' });
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  async function handleSubmit(e) {
    e.preventDefault();
    if (form.password.length < 6) return setError('Le mot de passe doit faire au moins 6 caractères');
    setLoading(true);
    setError('');
    try {
      const { data } = await api.post('/auth/register', form);
      login(data.token, data.user);
      navigate('/');
    } catch (err) {
      setError(err.response?.data?.error || 'Erreur lors de l\'inscription');
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="auth-container">
      <div className="auth-card card">
        <div className="auth-header">
          <span className="auth-icon">🎉</span>
          <h1>Inscription</h1>
          <p>Rejoins la fête !</p>
        </div>
        <form onSubmit={handleSubmit}>
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '12px' }}>
            <div className="form-group">
              <label>Prénom</label>
              <input placeholder="Prénom" value={form.prenom}
                onChange={e => setForm({ ...form, prenom: e.target.value })} required />
            </div>
            <div className="form-group">
              <label>Nom</label>
              <input placeholder="Nom" value={form.nom}
                onChange={e => setForm({ ...form, nom: e.target.value })} required />
            </div>
          </div>
          <div className="form-group">
            <label>Email</label>
            <input type="email" placeholder="ton@email.com" value={form.email}
              onChange={e => setForm({ ...form, email: e.target.value })} required />
          </div>
          <div className="form-group">
            <label>Mot de passe</label>
            <input type="password" placeholder="Au moins 6 caractères" value={form.password}
              onChange={e => setForm({ ...form, password: e.target.value })} required />
            <span style={{ fontSize: '0.78rem', color: 'var(--text-muted)', marginTop: 4, display: 'block' }}>
              Pas de critère particulier, juste 6 caractères minimum.
            </span>
          </div>
          {error && <p className="error-msg">{error}</p>}
          <button type="submit" className="btn btn-primary w-full" disabled={loading}>
            {loading ? 'Inscription...' : "🥳 Je m'inscris !"}
          </button>
        </form>
        <p className="auth-footer">
          Déjà inscrit·e ? <Link to="/login">Se connecter</Link>
        </p>
      </div>
    </div>
  );
}
