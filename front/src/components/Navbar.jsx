import { Link, NavLink, useNavigate } from 'react-router-dom';
import { Package, LogOut, User, LayoutDashboard, Users, Tags } from 'lucide-react';
import { useAuth } from '../context/AuthContext.jsx';

// Estilos locais da navbar (mantém isolado do global)
const sidebarStyles = {
  wrapper: {
    width: 250,
    minHeight: '100vh',
    background: 'linear-gradient(180deg, #1e293b 0%, #0f172a 100%)',
    color: '#cbd5e1',
    position: 'fixed',
    top: 0,
    left: 0,
    display: 'flex',
    flexDirection: 'column',
    zIndex: 50,
  },
  brand: {
    display: 'flex',
    alignItems: 'center',
    gap: 10,
    padding: '22px 20px',
    borderBottom: '1px solid rgba(255,255,255,0.08)',
  },
  brandText: {
    fontSize: 17,
    fontWeight: 700,
    color: '#fff',
  },
  nav: {
    padding: '16px 12px',
    display: 'flex',
    flexDirection: 'column',
    gap: 4,
    flex: 1,
  },
  link: {
    display: 'flex',
    alignItems: 'center',
    gap: 12,
    padding: '10px 14px',
    borderRadius: 8,
    fontSize: 14,
    fontWeight: 500,
    color: '#cbd5e1',
    textDecoration: 'none',
    transition: 'all 0.15s ease',
  },
  userBox: {
    marginTop: 'auto',
    padding: '16px 16px',
    borderTop: '1px solid rgba(255,255,255,0.08)',
  },
};

export default function Navbar() {
  const { user, isAuthenticated, isAdmin, canManage, logout } = useAuth();
  const navigate = useNavigate();

  const handleLogout = () => {
    logout();
    navigate('/login');
  };

  const activeStyle = ({ isActive }) => ({
    ...sidebarStyles.link,
    background: isActive ? 'rgba(37, 99, 235, 0.9)' : 'transparent',
    color: isActive ? '#fff' : '#cbd5e1',
  });

  return (
    <aside style={sidebarStyles.wrapper}>
      <div style={sidebarStyles.brand}>
        <Package size={22} color="#60a5fa" />
        <span style={sidebarStyles.brandText}>DS Catalog</span>
      </div>

      <nav style={sidebarStyles.nav}>
        <NavLink to="/" style={activeStyle}>
          <LayoutDashboard size={18} /> Catálogo
        </NavLink>

        {isAdmin() && (
          <>
            <NavLink to="/admin/categorias" style={activeStyle}>
              <Tags size={18} /> Categorias
            </NavLink>
            <NavLink to="/admin/produtos" style={activeStyle}>
              <Package size={18} /> Produtos
            </NavLink>
            <NavLink to="/admin/usuarios" style={activeStyle}>
              <Users size={18} /> Usuários
            </NavLink>
          </>
        )}

        {canManage() && !isAdmin() && (
          <NavLink to="/admin/produtos" style={activeStyle}>
            <Package size={18} /> Meus Produtos
          </NavLink>
        )}
      </nav>

      {isAuthenticated ? (
        <div style={sidebarStyles.userBox}>
          <NavLink to="/perfil" style={activeStyle}>
            <User size={18} /> {user?.firstName || 'Perfil'}
          </NavLink>
          <button
            onClick={handleLogout}
            style={{
              ...sidebarStyles.link,
              background: 'transparent',
              border: 'none',
              width: '100%',
              cursor: 'pointer',
            }}
          >
            <LogOut size={18} /> Sair
          </button>
        </div>
      ) : (
        <div style={sidebarStyles.userBox}>
          <Link
            to="/login"
            style={{
              color: '#93c5fd',
              fontWeight: 600,
              fontSize: 14,
              textAlign: 'center',
              display: 'block',
            }}
          >
            Entrar
          </Link>
        </div>
      )}
    </aside>
  );
}
