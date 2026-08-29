import { useState } from 'react';
import { Link, useNavigate, useParams } from 'react-router-dom';
import { Package, KeyRound, Mail, Unlock } from 'lucide-react';
import { requestRecoverToken, saveNewPassword } from '../api/index.js';

function RecoverRequestForm({ onBack }) {
  const [email, setEmail] = useState('');
  const [message, setMessage] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setMessage('');
    setLoading(true);
    try {
      await requestRecoverToken(email);
      setMessage('Se este e-mail existir, você receberá o link de recuperação por e-mail.');
      setEmail('');
    } catch {
      setError('Não foi possível solicitar a recuperação. Verifique o servidor.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <>
      {message && <div className="alert alert-success">{message}</div>}
      {error && <div className="alert alert-error">{error}</div>}
      <form onSubmit={handleSubmit}>
        <div className="field">
          <label>E-mail cadastrado</label>
          <input
            type="email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            required
          />
        </div>
        <button className="btn btn-primary btn-block" disabled={loading}>
          <Mail size={18} />
          {loading ? 'Enviando...' : 'Enviar link'}
        </button>
      </form>
      <p className="text-center mt-2" style={{ fontSize: 13 }}>
        <Link to="/login">Voltar ao login</Link>
      </p>
    </>
  );
}

function RecoverNewPasswordForm({ token, onBack }) {
  const [password, setPassword] = useState('');
  const [confirm, setConfirm] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const [done, setDone] = useState(false);

  const navigate = useNavigate();

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    if (password !== confirm) {
      setError('As senhas não coincidem.');
      return;
    }
    if (password.length < 8) {
      setError('A senha deve ter no mínimo 8 caracteres.');
      return;
    }
    setLoading(true);
    try {
      await saveNewPassword(token, password);
      setDone(true);
    } catch (err) {
      const data = err?.response?.data;
      setError(data?.message || 'Token inválido ou expirado. Solicite um novo link.');
    } finally {
      setLoading(false);
    }
  };

  if (done) {
    return (
      <div className="text-center">
        <div className="alert alert-success">Senha redefinida com sucesso!</div>
        <button className="btn btn-primary" onClick={() => navigate('/login')}>
          Ir para o login
        </button>
      </div>
    );
  }

  return (
    <>
      {error && <div className="alert alert-error">{error}</div>}
      <form onSubmit={handleSubmit}>
        <div className="field">
          <label>Nova senha (mín. 8 caracteres)</label>
          <input
            type="password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            required
          />
        </div>
        <div className="field">
          <label>Confirmar nova senha</label>
          <input
            type="password"
            value={confirm}
            onChange={(e) => setConfirm(e.target.value)}
            required
          />
        </div>
        <button className="btn btn-primary btn-block" disabled={loading}>
          <KeyRound size={18} />
          {loading ? 'Salvando...' : 'Redefinir senha'}
        </button>
      </form>
    </>
  );
}

export default function RecoverPasswordPage() {
  const { token } = useParams(); // rota /recuperar-senha/:token

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
            {token ? (
              <KeyRound size={30} color="var(--primary)" />
            ) : (
              <Unlock size={30} color="var(--primary)" />
            )}
          </div>
          <h1 style={{ fontSize: 22, marginBottom: 4 }}>
            {token ? 'Redefinir senha' : 'Recuperar senha'}
          </h1>
          <p className="text-muted" style={{ fontSize: 14 }}>
            {token
              ? 'Informe sua nova senha'
              : 'Enviaremos um link para o seu e-mail'}
          </p>
        </div>

        {token ? (
          <RecoverNewPasswordForm token={token} />
        ) : (
          <RecoverRequestForm />
        )}
      </div>
    </div>
  );
}
