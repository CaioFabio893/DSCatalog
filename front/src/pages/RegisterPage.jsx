import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { Package, UserPlus } from 'lucide-react';
import { registerUser } from '../api/auth.js';

export default function RegisterPage() {
  const navigate = useNavigate();
  const [form, setForm] = useState({
    firstName: '',
    lastName: '',
    email: '',
    password: '',
    confirmPassword: '',
  });
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  const handleChange = (e) => {
    setForm({ ...form, [e.target.name]: e.target.value });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');

    if (form.password !== form.confirmPassword) {
      setError('As senhas não coincidem.');
      return;
    }
    if (form.password.length < 8) {
      setError('A senha deve ter no mínimo 8 caracteres.');
      return;
    }

    setLoading(true);
    try {
      await registerUser(form);
      // Após cadastrar, manda para o login
      navigate('/login', {
        state: { registered: true },
      });
    } catch (err) {
      // Trata erros de validação do backend (422 com fieldErrors)
      const data = err?.response?.data;
      if (data?.fieldErrors?.length) {
        setError(data.fieldErrors.map((f) => f.message).join('. '));
      } else if (err?.response?.status === 409 || data?.message) {
        setError(data.message || 'Não foi possível criar a conta.');
      } else {
        setError('Não foi possível criar a conta. Verifique o servidor.');
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
        background: 'linear-gradient(135deg, #0f172a 0%, #1e3a8a 60%, #2563eb 100%)',
        padding: '24px',
      }}
    >
      <div
        className="card"
        style={{
          width: '100%',
          maxWidth: 460,
          padding: '36px',
          border: 'none',
          boxShadow: 'var(--shadow-lg)',
        }}
      >
        <div style={{ textAlign: 'center', marginBottom: 24 }}>
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
          <h1 style={{ fontSize: 22, marginBottom: 4 }}>Criar conta</h1>
          <p className="text-muted" style={{ fontSize: 14 }}>
            Cadastre-se para acessar o catálogo
          </p>
        </div>

        {error && <div className="alert alert-error">{error}</div>}

        <form onSubmit={handleSubmit}>
          <div className="row">
            <div className="field">
              <label>Nome</label>
              <input
                name="firstName"
                value={form.firstName}
                onChange={handleChange}
                required
              />
            </div>
            <div className="field">
              <label>Sobrenome</label>
              <input
                name="lastName"
                value={form.lastName}
                onChange={handleChange}
                required
              />
            </div>
          </div>

          <div className="field">
            <label>E-mail</label>
            <input
              type="email"
              name="email"
              value={form.email}
              onChange={handleChange}
              required
            />
          </div>

          <div className="field">
            <label>Senha (mín. 8 caracteres)</label>
            <input
              type="password"
              name="password"
              value={form.password}
              onChange={handleChange}
              required
            />
          </div>

          <div className="field">
            <label>Confirmar senha</label>
            <input
              type="password"
              name="confirmPassword"
              value={form.confirmPassword}
              onChange={handleChange}
              required
            />
          </div>

          <button className="btn btn-primary btn-block" disabled={loading}>
            <UserPlus size={18} />
            {loading ? 'Criando...' : 'Criar conta'}
          </button>
        </form>

        <p className="text-center mt-2" style={{ fontSize: 13 }}>
          Já tem conta? <Link to="/login">Entrar</Link>
        </p>
      </div>
    </div>
  );
}
