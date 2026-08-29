import { useEffect, useState, useCallback } from 'react';
import { Search, Package } from 'lucide-react';
import { fetchProducts, fetchCategories } from '../api/index.js';
import ProductCard from '../components/ProductCard.jsx';
import Loader from '../components/Loader.jsx';

const PAGE_SIZE = 12;

export default function HomePage() {
  const [products, setProducts] = useState([]);
  const [categories, setCategories] = useState([]);
  const [page, setPage] = useState(0);
  const [totalPages, setTotalPages] = useState(0);
  const [totalElements, setTotalElements] = useState(0);
  const [search, setSearch] = useState('');
  const [categoryId, setCategoryId] = useState('0');
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  // Carrega as categorias uma única vez
  useEffect(() => {
    fetchCategories()
      .then(setCategories)
      .catch(() => setCategories([]));
  }, []);

  // Busca paginada com filtros
  const load = useCallback(async () => {
    setLoading(true);
    setError('');
    try {
      const data = await fetchProducts({
        name: search,
        categoryId,
        page,
        size: PAGE_SIZE,
      });
      setProducts(data.content);
      setTotalPages(data.totalPages);
      setTotalElements(data.totalElements);
    } catch {
      setError('Não foi possível carregar os produtos. Verifique se o backend está rodando.');
    } finally {
      setLoading(false);
    }
  }, [search, categoryId, page]);

  useEffect(() => {
    load();
  }, [load]);

  // Aplica a busca (volta para a página 0)
  const applyFilters = () => {
    setPage(0);
    load();
  };

  return (
    <div>
      <div className="mb-4">
        <h1 style={{ fontSize: 26 }}>Catálogo de Produtos</h1>
        <p className="text-muted">{totalElements} produto(s) encontrado(s)</p>
      </div>

      {/* Barra de busca e filtro */}
      <div
        className="card"
        style={{
          padding: '16px',
          marginBottom: 24,
          display: 'flex',
          gap: 12,
          flexWrap: 'wrap',
        }}
      >
        <div style={{ flex: 1, minWidth: 200, position: 'relative' }}>
          <Search
            size={18}
            style={{
              position: 'absolute',
              left: 12,
              top: 11,
              color: 'var(--gray-400)',
            }}
          />
          <input
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            onKeyDown={(e) => e.key === 'Enter' && applyFilters()}
            placeholder="Buscar produto..."
            style={{
              width: '100%',
              padding: '10px 12px 10px 40px',
              border: '1px solid var(--gray-300)',
              borderRadius: 8,
            }}
          />
        </div>

        <select
          value={categoryId}
          onChange={(e) => {
            setCategoryId(e.target.value);
            setPage(0);
          }}
          style={{
            padding: '10px 12px',
            border: '1px solid var(--gray-300)',
            borderRadius: 8,
            background: '#fff',
          }}
        >
          <option value="0">Todas as categorias</option>
          {categories.map((c) => (
            <option key={c.id} value={c.id}>
              {c.name}
            </option>
          ))}
        </select>

        <button className="btn btn-primary" onClick={applyFilters}>
          <Search size={16} /> Buscar
        </button>
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
        <div
          style={{
            display: 'grid',
            gridTemplateColumns: 'repeat(auto-fill, minmax(240px, 1fr))',
            gap: 20,
          }}
        >
          {products.map((product) => (
            <ProductCard key={product.id} product={product} />
          ))}
        </div>
      )}

      {/* Paginação */}
      {totalPages > 1 && (
        <div className="pagination">
          <button
            className="page-btn"
            disabled={page === 0}
            onClick={() => setPage((p) => Math.max(0, p - 1))}
          >
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
            onClick={() => setPage((p) => Math.min(totalPages - 1, p + 1))}
          >
            ›
          </button>
        </div>
      )}
    </div>
  );
}
