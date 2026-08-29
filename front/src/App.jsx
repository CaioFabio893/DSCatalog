import { Routes, Route } from 'react-router-dom';
import { AuthProvider } from './context/AuthContext.jsx';
import ProtectedRoute from './components/ProtectedRoute.jsx';
import Layout from './components/Layout.jsx';

import LoginPage from './pages/LoginPage.jsx';
import RegisterPage from './pages/RegisterPage.jsx';
import RecoverPasswordPage from './pages/RecoverPasswordPage.jsx';
import HomePage from './pages/HomePage.jsx';
import ProfilePage from './pages/ProfilePage.jsx';
import CategoriesPage from './pages/CategoriesPage.jsx';
import ProductsPage from './pages/ProductsPage.jsx';
import UsersPage from './pages/UsersPage.jsx';
import NotFoundPage from './pages/NotFoundPage.jsx';

export default function App() {
  return (
    <AuthProvider>
      <Routes>
        {/* Rotas públicas */}
        <Route
          path="/login"
          element={
            <ProtectedRoute publicOnly>
              <LoginPage />
            </ProtectedRoute>
          }
        />
        <Route path="/registrar" element={<RegisterPage />} />
        <Route path="/recuperar-senha" element={<RecoverPasswordPage />} />
        <Route path="/recuperar-senha/:token" element={<RecoverPasswordPage />} />

        {/* Rotas autenticadas (com sidebar) — exige login em todas */}
        <Route
          element={
            <ProtectedRoute>
              <Layout />
            </ProtectedRoute>
          }
        >
          <Route path="/" element={<HomePage />} />
          <Route path="/perfil" element={<ProfilePage />} />

          {/* Produtos: exige operador ou admin */}
          <Route
            path="/admin/produtos"
            element={
              <ProtectedRoute operatorOnly>
                <ProductsPage />
              </ProtectedRoute>
            }
          />

          {/* Categorias e Usuários: apenas admin */}
          <Route
            path="/admin/categorias"
            element={
              <ProtectedRoute adminOnly>
                <CategoriesPage />
              </ProtectedRoute>
            }
          />
          <Route
            path="/admin/usuarios"
            element={
              <ProtectedRoute adminOnly>
                <UsersPage />
              </ProtectedRoute>
            }
          />
        </Route>

        {/* 404 */}
        <Route path="*" element={<NotFoundPage />} />
      </Routes>
    </AuthProvider>
  );
}
