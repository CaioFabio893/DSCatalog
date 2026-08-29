import { useEffect, useState } from 'react';
import { Plus, Pencil, Trash2, Tags, AlertTriangle } from 'lucide-react';
import { fetchCategories, createCategory, updateCategory, deleteCategory } from '../api/index.js';
import Modal from '../components/Modal.jsx';
import Loader from '../components/Loader.jsx';

export default function CategoriesPage() {
  const [categories, setCategories] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  // Modal de formulário (criar/editar)
  const [formOpen, setFormOpen] = useState(false);
  const [editing, setEditing] = useState(null); // null = criar
  const [name, setName] = useState('');
  const [formError, setFormError] = useState('');
  const [saving, setSaving] = useState(false);

  // Modal de confirmação de exclusão
  const [deleting, setDeleting] = useState(null);

  const load = async () => {
    setLoading(true);
    setError('');
    try {
      const data = await fetchCategories();
      setCategories(data);
    } catch {
      setError('Não foi possível carregar as categorias.');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    load();
  }, []);

  const openCreate = () => {
    setEditing(null);
    setName('');
    setFormError('');
    setFormOpen(true);
  };

  const openEdit = (c) => {
    setEditing(c);
    setName(c.name);
    setFormError('');
    setFormOpen(true);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!name.trim()) {
      setFormError('Informe o nome da categoria.');
      return;
    }
    setSaving(true);
    setFormError('');
    try {
      if (editing) {
        await updateCategory(editing.id, { name });
      } else {
        await createCategory({ name });
      }
      setFormOpen(false);
      load();
    } catch (err) {
      const data = err?.response?.data;
      setFormError(data?.message || 'Erro ao salvar a categoria.');
    } finally {
      setSaving(false);
    }
  };

  const confirmDelete = async () => {
    try {
      await deleteCategory(deleting.id);
      setDeleting(null);
      load();
    } catch (err) {
      const data = err?.response?.data;
      alert(data?.message || 'Não foi possível excluir. A categoria pode ter produtos vinculados.');
      setDeleting(null);
    }
  };

  return (
    <div>
      <div className="justify-between mb-4">
        <div>
          <h1 style={{ fontSize: 24 }}>Categorias</h1>
          <p className="text-muted">{categories.length} categoria(s)</p>
        </div>
        <button className="btn btn-primary" onClick={openCreate}>
          <Plus size={18} /> Nova categoria
        </button>
      </div>

      {error && <div className="alert alert-error">{error}</div>}

      {loading ? (
        <Loader />
      ) : categories.length === 0 ? (
        <div className="card empty-state">
          <Tags size={40} />
          <p className="mt-1">Nenhuma categoria cadastrada.</p>
        </div>
      ) : (
        <div className="table-wrapper">
          <table className="table">
            <thead>
              <tr>
                <th style={{ width: 80 }}>ID</th>
                <th>Nome</th>
                <th style={{ width: 160, textAlign: 'right' }}>Ações</th>
              </tr>
            </thead>
            <tbody>
              {categories.map((c) => (
                <tr key={c.id}>
                  <td className="text-muted">#{c.id}</td>
                  <td style={{ fontWeight: 600 }}>{c.name}</td>
                  <td>
                    <div style={{ display: 'flex', gap: 8, justifyContent: 'flex-end' }}>
                      <button
                        className="btn btn-secondary btn-sm"
                        onClick={() => openEdit(c)}
                      >
                        <Pencil size={14} /> Editar
                      </button>
                      <button
                        className="btn btn-danger btn-sm"
                        onClick={() => setDeleting(c)}
                      >
                        <Trash2 size={14} /> Excluir
                      </button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}

      {/* Modal criar/editar */}
      <Modal
        open={formOpen}
        title={editing ? 'Editar categoria' : 'Nova categoria'}
        onClose={() => setFormOpen(false)}
      >
        {formError && <div className="alert alert-error">{formError}</div>}
        <form onSubmit={handleSubmit}>
          <div className="field">
            <label>Nome</label>
            <input value={name} onChange={(e) => setName(e.target.value)} required />
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

      {/* Modal confirmar exclusão */}
      <Modal
        open={!!deleting}
        title="Excluir categoria"
        onClose={() => setDeleting(null)}
        width={440}
      >
        <div className="align-center mb-3" style={{ color: 'var(--warning)' }}>
          <AlertTriangle size={22} />
          <span>
            Tem certeza que deseja excluir <strong>{deleting?.name}</strong>?
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
