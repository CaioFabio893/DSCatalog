# 🖥️ DS Catalog — Frontend (React + Vite)

Interface web do sistema de catálogo de produtos. Consome a API REST do
backend Spring Boot (`backend/`) com **autenticação OAuth2 (JWT)**, gestão de
**produtos**, **categorias** e **usuários**, controle de acesso por **roles**
e painel administrativo.

> ⚠️ **Sobre a autoria deste frontend:** esta interface foi **gerada por um
> **agente de Inteligência Artificial** com o objetivo específico de **consumir
> e testar o backend Java** deste repositório. O código foi criado para exibir
> e validar, na prática, todas as funcionalidades da API (login OAuth2, CRUDs,
> paginação, filtros e recuperação de senha). Ele não é um produto comercial e
> pode ser usado como base para evolução.

---

## ✨ O que o sistema faz

| Área | Funcionalidade | Permissão |
|---|---|---|
| **Login** | Entra com e-mail/senha via OAuth2 (`/oauth2/token`) | Público |
| **Cadastro** | Cria uma nova conta (`POST /users`) | Público |
| **Recuperar senha** | Solicita link e redefine a senha (`/auth/*`) | Público |
| **Catálogo** | Lista produtos com **busca**, **filtro por categoria** e **paginação** (`GET /products`) | Qualquer logado |
| **Perfil** | Mostra os dados e permissões do usuário (`GET /users/me`) | Qualquer logado |
| **Produtos** | CRUD completo de produtos com vínculo de várias categorias | Admin + Operador |
| **Categorias** | CRUD completo de categorias | Admin + Operador |
| **Usuários** | Listar, editar, excluir e resetar senha | Admin |

---

## 🧱 Stack / Tecnologias

| Tecnologia | Versão | Por quê |
|---|---|---|
| **React** | 19 | Biblioteca de interface |
| **Vite** | 8 | Servidor de desenvolvimento e build (rápido e simples) |
| **React Router** | 7 | Navegação entre telas e proteção de rotas |
| **Axios** | 1.x | Chamadas HTTP ao backend + interceptadores de token |
| **lucide-react** | 1.x | Ícones |
| **CSS customizado** | — | Design system próprio (sem framework de UI, importa pouco) |

---

## 📁 Estrutura das pastas

```
front/
├── index.html                # Página única que carrega o React
├── vite.config.js            # Configuração do Vite (porta 5173)
└── src/
    ├── main.jsx              # Ponto de entrada (React + React Router)
    ├── App.jsx               # Definição de todas as rotas
    ├── index.css             # Estilos globais / design system
    ├── api/
    │   ├── client.js         # Instância Axios + interceptores (token, 401)
    │   ├── auth.js           # Login OAuth2 + cadastro
    │   └── index.js          # Chamadas da API (products, categories, users...)
    ├── context/
    │   └── AuthContext.jsx   # Estado global de autenticação (login/logout/roles)
    ├── components/
    │   ├── Layout.jsx        # Sidebar + conteúdo
    │   ├── Navbar.jsx        # Menu lateral (se adapta à role do usuário)
    │   ├── ProtectedRoute.jsx# Guarda de rotas (login, admin, operator)
    │   ├── Modal.jsx         # Janela modal reutilizável
    │   ├── Loader.jsx        # Indicador de carregamento
    │   └── ProductCard.jsx   # Card de produto do catálogo
    └── pages/                # As telas do sistema
        ├── LoginPage.jsx
        ├── RegisterPage.jsx
        ├── RecoverPasswordPage.jsx
        ├── HomePage.jsx          # Catálogo (busca/filtro/paginação)
        ├── ProfilePage.jsx
        ├── ProductsPage.jsx      # Admin: CRUD de produtos
        ├── CategoriesPage.jsx    # Admin: CRUD de categorias
        ├── UsersPage.jsx         # Admin: gestão de usuários
        └── NotFoundPage.jsx      # 404
```

---

## ▶️ Como rodar

> Pré-requisitos: **Node.js 18+** (testado com Node 24) e **o backend rodando**
> na porta `8080`.

### Passo a passo (do zero)

```bash
# 1) Entre na pasta do front
cd front

# 2) Instale as dependências (apenas na primeira vez)
npm install

# 3) Suba o servidor de desenvolvimento
npm run dev
```

Abra **http://localhost:5173** no navegador.

> O Vite é configurado para usar a porta **5173**, que é exatamente a origem
> liberada no CORS do backend.

---

## 🔑 Contas de teste (backend H2)

| E-mail | Senha | Perfil |
|---|---|---|
| `maria@gmail.com` | `123456` | Administradora |
| `alex@gmail.com` | `123456` | Operador |

---

## 🌐 Como o front fala com o backend

### 1. Login (OAuth2)
O `api/auth.js` envia `POST /oauth2/token` com o client autenticado via
**HTTP Basic** e recebe um **JWT**:

```
POST http://localhost:8080/oauth2/token
Content-Type: application/x-www-form-urlencoded
Authorization: Basic base64(myclientid:myclientsecret)

grant_type=password
username=...
password=...
```

O token é armazenado no `localStorage` (`access_token`).

### 2. Autenticação automática das demais chamadas
O interceptor em `api/client.js` adiciona automaticamente o header
`Authorization: Bearer <token>` em todas as requisições — exceto no login, que
já usa seu próprio header `Basic`.

### 3. Expiração da sessão
Se o backend responder **401** (token expirado/inválido), o interceptor limpa a
sessão e redireciona para `/login`.

### 4. Proteção de rotas
O componente `ProtectedRoute` garante que:
- Rotas autenticadas só renderizam com login;
- Páginas de **admin** exigem `ROLE_ADMIN`;
- A página de produtos exige `ROLE_OPERATOR` **ou** `ROLE_ADMIN`.

---

## 🖌️ Telas / Pages

| Página | Arquivo | Descrição |
|---|---|---|
| Login | `LoginPage.jsx` | Formulário de acesso + atalhos para cadastro/recuperação |
| Cadastro | `RegisterPage.jsx` | Criação de conta (valida senha mín. 8) |
| Recuperar senha | `RecoverPasswordPage.jsx` | Solicita link e redefine senha (aceita token na URL) |
| Catálogo | `HomePage.jsx` | Grade de produtos com busca, categoria e paginação |
| Perfil | `ProfilePage.jsx` | Dados e permissões do usuário + sair |
| Produtos | `ProductsPage.jsx` | Tabela + formulário (modal) com múltiplas categorias |
| Categorias | `CategoriesPage.jsx` | Tabela + modal de criar/editar + confirmação de exclusão |
| Usuários | `UsersPage.jsx` | Lista, edição de perfil/roles, exclusão e reset de senha |
| 404 | `NotFoundPage.jsx` | Página de erro |

---

## 🛠️ Comandos úteis

```bash
npm run dev      # roda em desenvolvimento (http://localhost:5173)
npm run build    # gera a versão de produção em /dist
npm run preview  # serve a build de produção localmente
npm run lint     # analisa o código (oxlint)
```

---

## 🧪 Como testar a integração manualmente

1. Suba o **backend** na porta `8080`.
2. Rode `npm run dev` no front.
3. Acesse `http://localhost:5173`, faça login com `maria@gmail.com` / `123456`.
4. Navegue pelo **catálogo**, faça **busca/filtro**, e teste o **painel de
   admin** (produtos, categorias e usuários).

---

## 🔜 Ideias de melhoria (para evoluir o front)

- [ ] Componente de biblioteca de UI (ex.: Tailwind/MUI) para acelerar o tema.
- [ ] Tratamento visual mais refinado de erros e *toasts* de sucesso.
- [ ] Icons de upload de imagem de produto.
- [ ] Modo escuro.
- [ ] Internationalização (i18n / pt-BR e en).
