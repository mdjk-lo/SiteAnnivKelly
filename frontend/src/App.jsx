import { Routes, Route, Navigate } from 'react-router-dom';
import { AuthProvider, useAuth } from './AuthContext';
import Navbar from './components/Navbar';
import Home from './pages/Home';
import Login from './pages/Login';
import Register from './pages/Register';
import Availability from './pages/Availability';
import Contributions from './pages/Contributions';
import Artists from './pages/Artists';
import Profile from './pages/Profile';
import AdminDashboard from './pages/AdminDashboard';
import CGU from './pages/CGU';
import Confidentialite from './pages/Confidentialite';

function PrivateRoute({ children }) {
  const { user } = useAuth();
  return user ? children : <Navigate to="/login" />;
}

function AdminRoute({ children }) {
  const { user } = useAuth();
  if (!user) return <Navigate to="/login" />;
  if (!user.is_admin) return <Navigate to="/" />;
  return children;
}

function AppRoutes() {
  return (
    <>
      <Navbar />
      <Routes>
        <Route path="/" element={<Home />} />
        <Route path="/login" element={<Login />} />
        <Route path="/register" element={<Register />} />
        <Route path="/disponibilites" element={<PrivateRoute><Availability /></PrivateRoute>} />
        <Route path="/contributions" element={<PrivateRoute><Contributions /></PrivateRoute>} />
        <Route path="/artistes" element={<PrivateRoute><Artists /></PrivateRoute>} />
        <Route path="/profil" element={<PrivateRoute><Profile /></PrivateRoute>} />
        <Route path="/admin" element={<AdminRoute><AdminDashboard /></AdminRoute>} />
        <Route path="/cgu" element={<CGU />} />
        <Route path="/confidentialite" element={<Confidentialite />} />
      </Routes>
    </>
  );
}

export default function App() {
  return (
    <AuthProvider>
      <AppRoutes />
    </AuthProvider>
  );
}
