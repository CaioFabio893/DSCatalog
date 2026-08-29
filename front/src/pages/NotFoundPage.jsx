import { Link } from 'react-router-dom';
import { Home } from 'lucide-react';

export default function NotFoundPage() {
  return (
    <div className="text-center" style={{ padding: '100px 24px' }}>
      <h1 style={{ fontSize: 64, color: 'var(--primary)' }}>404</h1>
      <h2 style={{ marginBottom: 12 }}>Página não encontrada</h2>
      <p className="text-muted mb-3">A página que você procura não existe ou foi movida.</p>
      <Link to="/" className="btn btn-primary" style={{ textDecoration: 'none' }}>
        <Home size={18} /> Voltar ao início
      </Link>
    </div>
  );
}
