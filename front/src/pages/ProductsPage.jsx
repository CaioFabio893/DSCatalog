import { useEffect, useState, useCallback } from 'react';
import { Plus, Pencil, Trash2, Package, AlertTriangle, Search } from 'lucide-react';
import {
  fetchProducts,
  fetchCategories,
  createProduct,
  updateProduct,
  deleteProduct,
} from '../api/index.js';
import Modal from '../components/Modal.jsx';
import Loader from '../components/Loader.jsx';

const PAGE_SIZE = 10;
const emptyForm = () => ({
  name: '',
  description: '',
  price: '',
  imgUrl: '',
  categories: [],
});

export default function ProductsPage() {
  const [products, setProducts] = useState([]);
  const [categories, setCategories] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  // paginação + busca
  const [page, setPage] = useState(0);
  const [totalPages, setTotalPages] = useState(0);
  const [search, setSearch] = useState('');

  // modal formulário
  const [formOpen, setFormOpen] = useState(false);
  const [editing, setEditing] = useState(null);
  const [form, setForm] = useState(emptyForm());
  const [formError, setFormError] = useState('');
  const [saving, setSaving] = useState(false);

  // modal exclusão
  const [deleting, setDeleting] = useState(null);

  const load = useCallback(async () => {
    setLoading(true);
    setError('');
    try {
      const data = await fetchProducts({
        name: search,
        page,
        size: PAGE_SIZE,
      });
      setProducts(data.content);
      setTotalPages(data.totalPages);
    } catch {
      setError('Não foi possível carregar os produtos.');
    } finally {
      setLoading(false);
    }
  }, [search, page]);

  useEffect(() => {
    fetchCategories().then(setCategories).catch(() => setCategories([]));
  }, []);

  useEffect(() => {
    load();
  }, [load]);

  const formatter = new Intl.NumberFormat('pt-BR', {
    style: 'currency',
    currency: 'BRL',
  });

  const openCreate = () => {
    setEditing(null);
    setForm(emptyForm());
    setFormError('');
    setFormOpen(true);
  };

  const openEdit = (p) => {
    setEditing(p);
    setForm({
      name: p.name,
      description: p.description || '',
      price: p.price ?? '',
      imgUrl: p.imgUrl || '',
      categories: p.categories || [],
    });
    setFormError('');
    setFormOpen(true);
  };

  const toggleCategory = (cat) => {
    setForm((prev) => {
      const exists = prev.categories.some((c) => c.id === cat.id);
      return {
        ...prev,
        categories: exists
          ? prev.categories.filter((c) => c.id !== cat.id)
          : [...prev.categories, { id: cat.id, name: cat.name }],
      };
    });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    // Validação básica
    if (!form.name.trim()) {
      setFormError('O nome é obrigatório.');
      return;
    }
    if (form.price === '' || isNaN(Number(form.price)) || Number(form.price) < 0) {
      setFormError('Informe um preço válido.');
      return;
    }

    const payload = {
      name: form.name,
      description: form.description,
      price: Number(form.price),
      imgUrl: form.imgUrl,
      categories: form.categories.map((c) => ({ id: c.id })),
    };

    setSaving(true);
    setFormError('');
    try {
      if (editing) {
        await updateProduct(editing.id, payload);
      } else {
        await createProduct(payload);
      }
      setFormOpen(false);
      load();
    } catch (err) {
      const data = err?.response?.data;
      if (data?.fieldErrors?.length) {
        setFormError(data.fieldErrors.map((f) => f.message).join('. '));
      } else {
        setFormError(data?.message || 'Erro ao salvar o produto.');
      }
    } finally {
      setSaving(false);
    }
  };

  const confirmDelete = async () => {
    try {
      await deleteProduct(deleting.id);
      setDeleting(null);
      load();
    } catch (err) {
      const data = err?.response?.data;
      alert(data?.message || 'Não foi possível excluir o produto.');
      setDeleting(null);
    }
  };

  return (
    <div>
      <div className="justify-between mb-4">
        <div>
          <h1 style={{ fontSize: 24 }}>Produtos</h1>
          <p className="text-muted">Gerenciar catálogo</p>
        </div>
        <button className="btn btn-primary" onClick={openCreate}>
          <Plus size={18} /> Novo produto
        </button>
      </div>

      {/* Busca */}
      <div className="card" style={{ padding: 16, marginBottom: 20, display: 'flex', gap: 10 }}>
        <div style={{ flex: 1, position: 'relative' }}>
          <Search size={18} style={{ position: 'absolute', left: 12, top: 11, color: 'var(--gray-400)' }} />
          <input
            value={search}
            onChange={(e) => {
              setSearch(e.target.value);
              setPage(0);
            }}
            placeholder="Buscar por nome..."
            style={{
              width: '100%',
              padding: '10px 12px 10px 40px',
              border: '1px solid var(--gray-300)',
              borderRadius: 8,
            }}
          />
        </div>
      </div>

      {error && <div className="alert alert-error">{error}</div>}

      {loading ? (
        <Loader />
      ) : products.length === 0 ? (
        <div className="card empty-state">
          <Package size={40} />
          <p className="mt-1">Nenhum produto encontrado.</p>
        </div>
      ) : (
        <div className="table-wrapper">
          <table className="table">
            <thead>
              <tr>
                <th style={{ width: 70 }}>ID</th>
                <th>Nome</th>
                <th style={{ width: 110 }}>Preço</th>
                <th>Categorias</th>
                <th style={{ width: 160, textAlign: 'right' }}>Ações</th>
              </tr>
            </thead>
            <tbody>
              {products.map((p) => (
                <tr key={p.id}>
                  <td className="text-muted">#{p.id}</td>
                  <td style={{ fontWeight: 600 }}>{p.name}</td>
                  <td style={{ fontWeight: 700 }}>{formatter.format(p.price)}</td>
                  <td>
                    <div style={{ display: 'flex', gap: 6, flexWrap: 'wrap' }}>
                      {p.categories?.length ? (
                        p.categories.map((c) => (
                          <span key={c.id} className="badge badge-operator">
                            {c.name}
                          </span>
                        ))
                      ) : (
                        <span className="text-muted">—</span>
                      )}
                    </div>
                  </td>
                  <td>
                    <div style={{ display: 'flex', gap: 8, justifyContent: 'flex-end' }}>
                      <button className="btn btn-secondary btn-sm" onClick={() => openEdit(p)}>
                        <Pencil size={14} /> Editar
                      </button>
                      <button className="btn btn-danger btn-sm" onClick={() => setDeleting(p)}>
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

      {/* Modal formulário */}
      <Modal
        open={formOpen}
        title={editing ? `Editar: ${editing.name}` : 'Novo produto'}
        onClose={() => setFormOpen(false)}
        width={640}
      >
        {formError && <div className="alert alert-error">{formError}</div>}
        <form onSubmit={handleSubmit}>
          <div className="field">
            <label>Nome *</label>
            <input
              value={form.name}
              onChange={(e) => setForm({ ...form, name: e.target.value })}
              required
            />
          </div>

          <div className="row">
            <div className="field">
              <label>Preço (R$) *</label>
              <input
                type="number"
                step="0.01"
                min="0"
                value={form.price}
                onChange={(e) => setForm({ ...form, price: e.target.value })}
                required
              />
            </div>
            <div className="field">
              <label>URL da imagem</label>
              <input
                value={form.imgUrl}
                onChange={(e) => setForm({ ...form, imgUrl: e.target.value })}
                placeholder="https://..."
              />
            </div>
          </div>

          <div className="field">
            <label>Descrição</label>
            <textarea
              value={form.description}
              onChange={(e) => setForm({ ...form, description: e.target.value })}
            />
          </div>

          <div className="field">
            <label>Categorias</label>
            <div style={{ display: 'flex', gap: 10, flexWrap: 'wrap' }}>
              {categories.map((cat) => {
                const selected = form.categories.some((c) => c.id === cat.id);
                return (
                  <button
                    type="button"
                    key={cat.id}
                    onClick={() => toggleCategory(cat)}
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
                    {cat.name}
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

      {/* Modal exclusão */}
      <Modal
        open={!!deleting}
        title="Excluir produto"
        onClose={() => setDeleting(null)}
        width={440}
      >
        <div className="align-center mb-3" style={{ color: 'var(--warning)' }}>
          <AlertTriangle size={22} />
          <span>
            Excluir <strong>{deleting?.name}</strong>?
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
