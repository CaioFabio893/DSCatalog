import { useState } from 'react';
import { useNavigate, useLocation, Link } from 'react-router-dom';
import { Package, LogIn } from 'lucide-react';
import { useAuth } from '../context/AuthContext.jsx';

export default function LoginPage() {
  const { login } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  // Para onde voltar após o login
  const from = location.state?.from?.pathname || '/';

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setLoading(true);
    try {
      await login(email, password);
      navigate(from, { replace: true });
    } catch (err) {
      const status = err?.response?.status;
      if (status === 400 || status === 401) {
        setError('E-mail ou senha inválidos. Verifique e tente novamente.');
      } else {
        setError('Não foi possível conectar ao servidor. Verifique se o backend está rodando.');
      }
    } finally {
      setLoading(false);
    }
  };

  return (
    <div
      style={{
        minHeight: '100vh',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        background:
          'linear-gradient(135deg, #0f172a 0%, #1e3a8a 60%, #2563eb 100%)',
        padding: '24px',
      }}
    >
      <div
        className="card"
        style={{
          width: '100%',
          maxWidth: 440,
          padding: '36px',
          border: 'none',
          boxShadow: 'var(--shadow-lg)',
        }}
      >
        <div style={{ textAlign: 'center', marginBottom: 28 }}>
          <div
            style={{
              width: 56,
              height: 56,
              borderRadius: 14,
              background: 'var(--primary-50)',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              margin: '0 auto 16px',
            }}
          >
            <Package size={30} color="var(--primary)" />
          </div>
          <h1 style={{ fontSize: 24, marginBottom: 4 }}>DS Catalog</h1>
          <p className="text-muted" style={{ fontSize: 14 }}>
            Entre para administrar seu catálogo
          </p>
        </div>

        {error && <div className="alert alert-error">{error}</div>}

        <form onSubmit={handleSubmit}>
          <div className="field">
            <label>E-mail</label>
            <input
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              placeholder="voce@email.com"
              required
              autoFocus
            />
          </div>

          <div className="field">
            <label>Senha</label>
            <input
              type="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              placeholder="••••••••"
              required
            />
          </div>

          <button className="btn btn-primary btn-block" disabled={loading}>
            <LogIn size={18} />
            {loading ? 'Entrando...' : 'Entrar'}
          </button>
        </form>

        <div
          style={{
            marginTop: 20,
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'space-between',
            fontSize: 13,
          }}
        >
          <Link to="/registrar">Criar conta</Link>
          <Link to="/recuperar-senha">Esqueci a senha</Link>
        </div>

        <div
          className="alert"
          style={{
            marginTop: 24,
            background: 'var(--gray-50)',
            border: '1px solid var(--gray-200)',
            fontSize: 12.5,
            borderRadius: 8,
          }}
        >
          <strong>Contas de teste do banco:</strong>
          <ul style={{ marginTop: 6, paddingLeft: 18 }}>
            <li>
              <code>maria@gmail.com</code> / <code>123456</code> (Administradora)
            </li>
            <li>
              <code>alex@gmail.com</code> / <code>123456</code> (Operador)
            </li>
          </ul>
        </div>
      </div>
    </div>
  );
}
