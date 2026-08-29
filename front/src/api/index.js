import { api } from './client.js';

/* ============ PRODUTOS ============ */

// Lista produtos de forma PAGINADA e com filtros.
// Parâmetros do Spring Data (Pageable): page, size, sort
export async function fetchProducts({ name = '', categoryId = '0', page = 0, size = 12 } = {}) {
  const res = await api.get('/products', {
    params: {
      name,
      categoryId,
      page,
      size,
      sort: 'name,asc',
    },
  });
  return res.data; // Page do Spring: { content, totalPages, totalElements, number, ... }
}

export async function fetchProductById(id) {
  const res = await api.get(`/products/${id}`);
  return res.data;
}

export async function createProduct(data) {
  const res = await api.post('/products', data);
  return res.data;
}

export async function updateProduct(id, data) {
  const res = await api.put(`/products/${id}`, data);
  return res.data;
}

export async function deleteProduct(id) {
  await api.delete(`/products/${id}`);
}

/* ============ CATEGORIAS ============ */

export async function fetchCategories() {
  const res = await api.get('/categories');
  return res.data; // List<CategoryDTO>
}

export async function createCategory(data) {
  const res = await api.post('/categories', data);
  return res.data;
}

export async function updateCategory(id, data) {
  const res = await api.put(`/categories/${id}`, data);
  return res.data;
}

export async function deleteCategory(id) {
  await api.delete(`/categories/${id}`);
}

/* ============ USUÁRIOS ============ */

// Paginado (somente admin)
export async function fetchUsers({ page = 0, size = 10 } = {}) {
  const res = await api.get('/users', {
    params: { page, size, sort: 'firstName,asc' },
  });
  return res.data;
}

export async function updateUser(id, data) {
  const res = await api.put(`/users/${id}`, data);
  return res.data;
}

export async function deleteUser(id) {
  await api.delete(`/users/${id}`);
}

/* ============ AUTH / RECUPERAÇÃO DE SENHA ============ */

export async function requestRecoverToken(email) {
  await api.post('/auth/recover-token', { email });
}

export async function saveNewPassword(token, password) {
  await api.put('/auth/new-password', { token, password });
}
