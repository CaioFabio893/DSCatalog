import { useEffect, useState, useCallback } from 'react';
import { Pencil, Trash2, Users, AlertTriangle, Shield } from 'lucide-react';
import { fetchUsers, updateUser, deleteUser, requestRecoverToken } from '../api/index.js';
import Modal from '../components/Modal.jsx';
import Loader from '../components/Loader.jsx';

const PAGE_SIZE = 10;

// Roles disponíveis (ids fixos do banco: 1 = OPERATOR, 2 = ADMIN)
const AVAILABLE_ROLES = [
  { id: 1, authority: 'ROLE_OPERATOR', label: 'Operador' },
  { id: 2, authority: 'ROLE_ADMIN', label: 'Administrador' },
];

const emptyForm = () => ({
  firstName: '',
  lastName: '',
  email: '',
  roles: [],
});

export default function UsersPage() {
  const [users, setUsers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [page, setPage] = useState(0);
  const [totalPages, setTotalPages] = useState(0);

  // modal de edição
  const [formOpen, setFormOpen] = useState(false);
  const [editing, setEditing] = useState(null);
  const [form, setForm] = useState(emptyForm());
  const [formError, setFormError] = useState('');
  const [saving, setSaving] = useState(false);

  // modal exclusão
  const [deleting, setDeleting] = useState(null);

  // modal resetar senha
  const [resetting, setResetting] = useState(null);
  const [resetMsg, setResetMsg] = useState('');

  const load = useCallback(async () => {
    setLoading(true);
    setError('');
    try {
      const data = await fetchUsers({ page, size: PAGE_SIZE });
      setUsers(data.content);
      setTotalPages(data.totalPages);
    } catch {
      setError('Não foi possível carregar os usuários (você precisa ser administrador).');
    } finally {
      setLoading(false);
    }
  }, [page]);

  useEffect(() => {
    load();
  }, [load]);

  const openEdit = (u) => {
    setEditing(u);
    setForm({
      firstName: u.firstName,
      lastName: u.lastName,
      email: u.email,
      roles: (u.roles || []).map((r) => r.id),
    });
    setFormError('');
    setFormOpen(true);
  };

  const toggleRole = (roleId) => {
    setForm((prev) => {
      const exists = prev.roles.includes(roleId);
      const roles = exists ? prev.roles.filter((r) => r !== roleId) : [...prev.roles, roleId];
      // Garante ao menos uma role
      if (roles.length === 0) {
        setFormError('O usuário deve ter pelo menos uma permissão.');
      } else {
        setFormError('');
      }
      return { ...prev, roles };
    });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!form.firstName.trim() || !form.lastName.trim()) {
      setFormError('Nome e sobrenome são obrigatórios.');
      return;
    }
    if (form.roles.length === 0) {
      setFormError('Selecione pelo menos uma permissão.');
      return;
    }
    const payload = {
      firstName: form.firstName,
      lastName: form.lastName,
      email: form.email,
      roles: form.roles.map((id) => ({ id })),
    };
    setSaving(true);
    setFormError('');
    try {
      await updateUser(editing.id, payload);
      setFormOpen(false);
      load();
    } catch (err) {
      const data = err?.response?.data;
      if (data?.fieldErrors?.length) {
        setFormError(data.fieldErrors.map((f) => f.message).join('. '));
      } else {
        setFormError(data?.message || 'Erro ao salvar o usuário.');
      }
    } finally {
      setSaving(false);
    }
  };

  const confirmDelete = async () => {
    try {
      await deleteUser(deleting.id);
      setDeleting(null);
      load();
    } catch (err) {
      const data = err?.response?.data;
      alert(data?.message || 'Não foi possível excluir o usuário.');
      setDeleting(null);
    }
  };

  const handleReset = async () => {
    setResetMsg('');
    try {
      await requestRecoverToken(resetting.email);
      setResetMsg('Link de redefinição enviado (ou e-mail inexistente).');
    } catch {
      setResetMsg('Não foi possível enviar o link.');
    }
  };

  const badgeFor = (item) => {
    const roles = item.roles || [];
    return roles.map((r) => (
      <span key={r.id} className={`badge ${r.authority === 'ROLE_ADMIN' ? 'badge-admin' : 'badge-operator'}`}>
        {r.authority === 'ROLE_ADMIN' ? 'Admin' : 'Operador'}
      </span>
    ));
  };

  return (
    <div>
      <div className="mb-4">
        <h1 style={{ fontSize: 24 }}>Usuários</h1>
        <p className="text-muted">Gerenciar contas e permissões</p>
      </div>

      {error && <div className="alert alert-error">{error}</div>}

      {loading ? (
        <Loader />
      ) : users.length === 0 ? (
        <div className="card empty-state">
          <Users size={40} />
          <p className="mt-1">Nenhum usuário encontrado.</p>
        </div>
      ) : (
        <div className="table-wrapper">
          <table className="table">
            <thead>
              <tr>
                <th style={{ width: 70 }}>ID</th>
                <th>Nome</th>
                <th>E-mail</th>
                <th>Permissões</th>
                <th style={{ width: 220, textAlign: 'right' }}>Ações</th>
              </tr>
            </thead>
            <tbody>
              {users.map((u) => (
                <tr key={u.id}>
                  <td className="text-muted">#{u.id}</td>
                  <td style={{ fontWeight: 600 }}>
                    {u.firstName} {u.lastName}
                  </td>
                  <td>{u.email}</td>
                  <td>
                    <div style={{ display: 'flex', gap: 6, flexWrap: 'wrap' }}>{badgeFor(u)}</div>
                  </td>
                  <td>
                    <div style={{ display: 'flex', gap: 8, justifyContent: 'flex-end' }}>
                      <button
                        className="btn btn-secondary btn-sm"
                        onClick={() => {
                          setResetting(u);
                          setResetMsg('');
                        }}
                        title="Enviar link de recuperação de senha"
                      >
                        <Shield size={14} /> Resetar
                      </button>
                      <button className="btn btn-secondary btn-sm" onClick={() => openEdit(u)}>
                        <Pencil size={14} /> Editar
                      </button>
                      <button className="btn btn-danger btn-sm" onClick={() => setDeleting(u)}>
                        <Trash2 size={14} />
                      </button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}

      {/* Paginação */}
      {totalPages > 1 && (
        <div className="pagination">
          <button className="page-btn" disabled={page === 0} onClick={() => setPage((p) => p - 1)}>
            ‹
          </button>
          {Array.from({ length: totalPages }, (_, i) => i).map((p) => (
            <button
              key={p}
              className={`page-btn ${p === page ? 'active' : ''}`}
              onClick={() => setPage(p)}
            >
              {p + 1}
            </button>
          ))}
          <button
            className="page-btn"
            disabled={page >= totalPages - 1}
            onClick={() => setPage((p) => p + 1)}
          >
            ›
          </button>
        </div>
      )}

      {/* Modal editar */}
      <Modal
        open={formOpen}
        title={`Editar: ${editing?.firstName} ${editing?.lastName}`}
        onClose={() => setFormOpen(false)}
        width={520}
      >
        {formError && <div className="alert alert-error">{formError}</div>}
        <form onSubmit={handleSubmit}>
          <div className="row">
            <div className="field">
              <label>Nome</label>
              <input
                value={form.firstName}
                onChange={(e) => setForm({ ...form, firstName: e.target.value })}
              />
            </div>
            <div className="field">
              <label>Sobrenome</label>
              <input
                value={form.lastName}
                onChange={(e) => setForm({ ...form, lastName: e.target.value })}
              />
            </div>
          </div>
          <div className="field">
            <label>E-mail</label>
            <input
              type="email"
              value={form.email}
              onChange={(e) => setForm({ ...form, email: e.target.value })}
            />
          </div>
          <div className="field">
            <label>Permissões</label>
            <div style={{ display: 'flex', gap: 10 }}>
              {AVAILABLE_ROLES.map((role) => {
                const selected = form.roles.includes(role.id);
                return (
                  <button
                    type="button"
                    key={role.id}
                    onClick={() => toggleRole(role.id)}
                    style={{
                      padding: '8px 14px',
                      borderRadius: 999,
                      border: selected ? '1px solid var(--primary)' : '1px solid var(--gray-300)',
                      background: selected ? 'var(--primary-50)' : '#fff',
                      color: selected ? 'var(--primary-dark)' : 'var(--gray-600)',
                      fontWeight: 600,
                      fontSize: 13,
                      cursor: 'pointer',
                    }}
                  >
                    {role.label}
                  </button>
                );
              })}
            </div>
          </div>
          <div style={{ display: 'flex', justifyContent: 'flex-end', gap: 10, marginTop: 8 }}>
            <button type="button" className="btn btn-secondary" onClick={() => setFormOpen(false)}>
              Cancelar
            </button>
            <button type="submit" className="btn btn-primary" disabled={saving}>
              {saving ? 'Salvando...' : 'Salvar'}
            </button>
          </div>
        </form>
      </Modal>

      {/* Modal resetar senha */}
      <Modal
        open={!!resetting}
        title="Redefinir senha"
        onClose={() => setResetting(null)}
        width={440}
      >
        <p className="mb-2">
          Enviar um link de redefinição de senha para{' '}
          <strong>{resetting?.email}</strong>?
        </p>
        {resetMsg && <div className="alert alert-success">{resetMsg}</div>}
        <div style={{ display: 'flex', justifyContent: 'flex-end', gap: 10 }}>
          <button className="btn btn-secondary" onClick={() => setResetting(null)}>
            Fechar
          </button>
          <button className="btn btn-primary" onClick={handleReset}>
            <Shield size={16} /> Enviar link
          </button>
        </div>
      </Modal>

      {/* Modal exclusão */}
      <Modal
        open={!!deleting}
        title="Excluir usuário"
        onClose={() => setDeleting(null)}
        width={440}
      >
        <div className="align-center mb-3" style={{ color: 'var(--warning)' }}>
          <AlertTriangle size={22} />
          <span>
            Excluir <strong>{deleting?.firstName} {deleting?.lastName}</strong>?
          </span>
        </div>
        <div style={{ display: 'flex', justifyContent: 'flex-end', gap: 10 }}>
          <button className="btn btn-secondary" onClick={() => setDeleting(null)}>
            Cancelar
          </button>
          <button className="btn btn-danger" onClick={confirmDelete}>
            <Trash2 size={16} /> Excluir
          </button>
        </div>
      </Modal>
    </div>
  );
}
