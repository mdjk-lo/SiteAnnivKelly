import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../AuthContext';
import { Calendar, Gift, Music, User, Settings, LogOut, PartyPopper, Menu, X } from 'lucide-react';
import './Navbar.css';

export default function Navbar() {
  const { user, logout } = useAuth();
  const navigate = useNavigate();
  const [open, setOpen] = useState(false);

  function handleLogout() {
    logout();
    navigate('/');
    setOpen(false);
  }

  return (
    <>
      <nav className="navbar">
        <Link to="/" className="navbar-brand" onClick={() => setOpen(false)}>
          <PartyPopper size={20} /> Anniv Kelly
        </Link>

        {/* Liens desktop */}
        <div className="navbar-links">
          {user ? (
            <>
              <Link to="/disponibilites"><Calendar size={16} /> Dispo</Link>
              <Link to="/contributions"><Gift size={16} /> Apports</Link>
              <Link to="/artistes"><Music size={16} /> Artistes</Link>
              <Link to="/profil"><User size={16} /> {user.prenom}</Link>
              {!!user.is_admin && (
                <Link to="/admin" className="admin-link"><Settings size={16} /> Admin</Link>
              )}
              <button onClick={handleLogout} className="btn btn-secondary logout-btn">
                <LogOut size={15} /> Déconnexion
              </button>
            </>
          ) : (
            <>
              <Link to="/login" className="btn btn-secondary">Connexion</Link>
              <Link to="/register" className="btn btn-primary">S'inscrire</Link>
            </>
          )}
        </div>

        {/* Burger mobile */}
        <button className="burger" onClick={() => setOpen(o => !o)} aria-label="Menu">
          <Menu size={24} />
        </button>
      </nav>

      {/* Overlay grisé — couvre toute la page */}
      {open && <div className="navbar-overlay" onClick={() => setOpen(false)} />}

      {/* Drawer mobile — en dehors de la nav */}
      <div className={`navbar-drawer ${open ? 'open' : ''}`}>
        <button className="drawer-close" onClick={() => setOpen(false)}><X size={24} /></button>
        {user ? (
          <>
            <Link to="/disponibilites" onClick={() => setOpen(false)}><Calendar size={16} /> Dispo</Link>
            <Link to="/contributions" onClick={() => setOpen(false)}><Gift size={16} /> Apports</Link>
            <Link to="/artistes" onClick={() => setOpen(false)}><Music size={16} /> Artistes</Link>
            <Link to="/profil" onClick={() => setOpen(false)}><User size={16} /> {user.prenom}</Link>
            {!!user.is_admin && (
              <Link to="/admin" className="admin-link" onClick={() => setOpen(false)}>
                <Settings size={16} /> Admin
              </Link>
            )}
            <button onClick={handleLogout} className="btn btn-secondary logout-btn">
              <LogOut size={15} /> Déconnexion
            </button>
          </>
        ) : (
          <>
            <Link to="/login" className="btn btn-secondary" onClick={() => setOpen(false)}>Connexion</Link>
            <Link to="/register" className="btn btn-primary" onClick={() => setOpen(false)}>S'inscrire</Link>
          </>
        )}
      </div>
    </>
  );
}
