import { User, Mail, ShieldCheck, LogOut } from 'lucide-react';
import { useAuth } from '../context/AuthContext.jsx';
import { useNavigate } from 'react-router-dom';

export default function ProfilePage() {
  const { user, isAdmin, isOperator, logout } = useAuth();
  const navigate = useNavigate();

  if (!user) return null;

  const roles = [
    { active: isOperator(), label: 'Operador', cls: 'badge-operator' },
    { active: isAdmin(), label: 'Administrador', cls: 'badge-admin' },
  ].filter((r) => r.active);

  const handleLogout = () => {
    logout();
    navigate('/login');
  };

  return (
    <div style={{ maxWidth: 640 }}>
      <h1 style={{ fontSize: 24, marginBottom: 24 }}>Meu Perfil</h1>

      <div className="card" style={{ padding: '28px', marginBottom: 24 }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: 20 }}>
          <div
            style={{
              width: 72,
              height: 72,
              borderRadius: '50%',
              background: 'var(--primary)',
              color: '#fff',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              fontSize: 28,
              fontWeight: 700,
              flexShrink: 0,
            }}
          >
            {user.firstName?.[0]?.toUpperCase()}
            {user.lastName?.[0]?.toUpperCase()}
          </div>
          <div>
            <h2 style={{ fontSize: 20 }}>
              {user.firstName} {user.lastName}
            </h2>
            <div className="align-center mt-1 text-muted">
              <Mail size={16} /> {user.email}
            </div>
          </div>
        </div>

        <hr style={{ border: 'none', borderTop: '1px solid var(--gray-200)', margin: '20px 0' }} />

        <div className="mb-2" style={{ fontWeight: 600, fontSize: 14, color: 'var(--gray-700)' }}>
          <div className="align-center mb-1">
            <ShieldCheck size={16} /> Permissões
          </div>
          <div className="align-center">
            {roles.map((r) => (
              <span key={r.label} className={`badge ${r.cls}`}>
                <User size={12} style={{ marginRight: 4 }} /> {r.label}
              </span>
            ))}
          </div>
        </div>
      </div>

      <button className="btn btn-danger" onClick={handleLogout}>
        <LogOut size={16} /> Sair da conta
      </button>
    </div>
  );
}
