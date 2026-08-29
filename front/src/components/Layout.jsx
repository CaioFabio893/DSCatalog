import { Outlet } from 'react-router-dom';
import Navbar from './Navbar.jsx';

/**
 * Layout padrão das páginas autenticadas: sidebar + conteúdo.
 * Usa <Outlet /> para renderizar a rota filha atual.
 */
export default function Layout() {
  return (
    <div style={{ minHeight: '100vh' }}>
      <Navbar />
      <main style={{ marginLeft: 250, padding: '32px 40px' }}>
        <Outlet />
      </main>
    </div>
  );
}
