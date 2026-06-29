import { useState, useRef } from 'react';
import { useAuth } from '../AuthContext';
import { Save, Lock, Camera, User } from 'lucide-react';
import api from '../api';
import './Profile.css';

export default function Profile() {
  const { user, login } = useAuth();
  const [form, setForm] = useState({ nom: user.nom, prenom: user.prenom, email: user.email });
  const [pwdForm, setPwdForm] = useState({ new_password: '', confirm: '' });
  const [msgProfile, setMsgProfile] = useState('');
  const [msgPwd, setMsgPwd] = useState('');
  const [avatarPreview, setAvatarPreview] = useState(user.avatar ? `${import.meta.env.VITE_API_URL || 'http://localhost:3001'}${user.avatar}` : null);
  const [uploading, setUploading] = useState(false);
  const fileRef = useRef();

  const initials = `${user.prenom?.[0] || ''}${user.nom?.[0] || ''}`.toUpperCase();

  async function handleProfile(e) {
    e.preventDefault();
    setMsgProfile('');
    try {
      const { data } = await api.put('/auth/me', form);
      if (data.token) login(data.token, data.user);
      setMsgProfile('Profil mis à jour');
    } catch {
      setMsgProfile('Erreur lors de la mise à jour');
    }
  }

  async function handlePassword(e) {
    e.preventDefault();
    setMsgPwd('');
    if (pwdForm.new_password !== pwdForm.confirm)
      return setMsgPwd('Les mots de passe ne correspondent pas');
    if (pwdForm.new_password.length < 4)
      return setMsgPwd('Mot de passe trop court (4 caractères min)');
    try {
      await api.put('/auth/me/password', { new_password: pwdForm.new_password });
      setMsgPwd('Mot de passe modifié');
      setPwdForm({ new_password: '', confirm: '' });
    } catch (err) {
      setMsgPwd(err.response?.data?.error || 'Erreur');
    }
  }

  async function handleAvatar(e) {
    const file = e.target.files[0];
    if (!file) return;
    setAvatarPreview(URL.createObjectURL(file));
    setUploading(true);
    const fd = new FormData();
    fd.append('avatar', file);
    try {
      const { data } = await api.post('/auth/me/avatar', fd, {
        headers: { 'Content-Type': 'multipart/form-data' },
      });
      if (data.token) login(data.token, data.user);
      setAvatarPreview(`${import.meta.env.VITE_API_URL || 'http://localhost:3001'}${data.avatar}`);
    } catch {
      setMsgProfile('Erreur lors du téléchargement');
    } finally {
      setUploading(false);
    }
  }

  return (
    <div className="profile-page page-container">
      <div className="page-header">
        <h1>Mon profil</h1>
        <p>Gère tes informations personnelles</p>
      </div>

      <div className="profile-grid">

        {/* AVATAR */}
        <div className="profile-avatar-card card">
          <div className="avatar-circle" onClick={() => fileRef.current.click()}>
            {avatarPreview
              ? <img src={avatarPreview} alt="avatar" />
              : <span className="avatar-initials">{initials}</span>
            }
            <div className="avatar-overlay">
              <Camera size={22} />
              {uploading ? <span>Chargement...</span> : <span>Changer</span>}
            </div>
          </div>
          <input ref={fileRef} type="file" accept="image/*" style={{ display: 'none' }} onChange={handleAvatar} />
          <div className="avatar-name">{user.prenom} {user.nom}</div>
          <div className="avatar-email">{user.email}</div>
          <div className="avatar-hint-mobile">Appuie sur la photo pour la changer</div>
          <p className="avatar-hint">Clique sur la photo pour la changer<br />JPG, PNG — max 3 Mo</p>
        </div>

        <div className="profile-forms">

          {/* INFOS */}
          <div className="card profile-section">
            <h2><User size={18} /> Informations</h2>
            <form onSubmit={handleProfile}>
              <div className="profile-row">
                <div className="form-group">
                  <label>Prénom</label>
                  <input value={form.prenom} onChange={e => setForm({ ...form, prenom: e.target.value })} required />
                </div>
                <div className="form-group">
                  <label>Nom</label>
                  <input value={form.nom} onChange={e => setForm({ ...form, nom: e.target.value })} required />
                </div>
              </div>
              <div className="form-group">
                <label>Email</label>
                <input type="email" value={form.email} onChange={e => setForm({ ...form, email: e.target.value })} required />
              </div>
              {msgProfile && <p className={msgProfile.includes('Erreur') ? 'error-msg' : 'success-msg'}>{msgProfile}</p>}
              <button type="submit" className="btn btn-primary" style={{ display: 'inline-flex', alignItems: 'center', gap: 8 }}>
                <Save size={15} /> Sauvegarder
              </button>
            </form>
          </div>

          {/* MOT DE PASSE */}
          <div className="card profile-section">
            <h2><Lock size={18} /> Changer le mot de passe</h2>
            <form onSubmit={handlePassword}>
              <div className="profile-row">
                <div className="form-group">
                  <label>Nouveau mot de passe</label>
                  <input type="password" value={pwdForm.new_password}
                    onChange={e => setPwdForm({ ...pwdForm, new_password: e.target.value })} required />
                </div>
                <div className="form-group">
                  <label>Confirmer</label>
                  <input type="password" value={pwdForm.confirm}
                    onChange={e => setPwdForm({ ...pwdForm, confirm: e.target.value })} required />
                </div>
              </div>
              <button type="submit" className="btn btn-primary" style={{ display: 'inline-flex', alignItems: 'center', gap: 8 }}>
                <Lock size={15} /> Modifier le mot de passe
              </button>
              {msgPwd && <p className={msgPwd.includes('Erreur') || msgPwd.includes('incorrect') || msgPwd.includes('correspondent') || msgPwd.includes('court') ? 'error-msg' : 'success-msg'} style={{ marginTop: 12 }}>{msgPwd}</p>}
            </form>
          </div>

        </div>
      </div>
    </div>
  );
}
