import { api } from './client.js';

// Credenciais do cliente OAuth2 registrado no Authorization Server.
// Valores padrão do application.properties do backend.
const CLIENT_ID = import.meta.env.VITE_CLIENT_ID || 'myclientid';
const CLIENT_SECRET = import.meta.env.VITE_CLIENT_SECRET || 'myclientsecret';

/**
 * Realiza o login no backend usando o grant type "password" do OAuth2.
 *
 * IMPORTANTE: o client OAuth2 se autentica via header HTTP Basic
 * (Authorization: Basic base64(client_id:client_secret)), como o
 * Spring Authorization Server exige por padrão.
 *
 * Endpoint: POST /oauth2/token  (form-urlencoded)
 *
 * Retorna o JSON com "access_token", "token_type" e "scope".
 */
export async function login(email, password) {
  const body = new URLSearchParams();
  body.append('grant_type', 'password');
  body.append('username', email);
  body.append('password', password);

  // Gera o header Basic: base64(client_id:client_secret)
  const basic = 'Basic ' + btoa(`${CLIENT_ID}:${CLIENT_SECRET}`);

  const res = await api.post('/oauth2/token', body, {
    headers: {
      'Content-Type': 'application/x-www-form-urlencoded',
      Authorization: basic,
    },
  });

  return res.data; // { access_token, token_type, scope }
}

/**
 * Busca os dados do usuário atualmente autenticado.
 * Endpoint: GET /users/me
 */
export async function fetchMe() {
  const res = await api.get('/users/me');
  return res.data;
}

/**
 * Cadastra um novo usuário (público).
 * Endpoint: POST /users
 */
export async function registerUser({ firstName, lastName, email, password }) {
  const res = await api.post('/users', { firstName, lastName, email, password });
  return res.data;
}

export { CLIENT_ID, CLIENT_SECRET };
