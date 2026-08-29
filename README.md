![Java](https://img.shields.io/badge/Java-21-orange)
![Spring Boot](https://img.shields.io/badge/Spring%20Boot-3.4.4-green)
![Spring Security](https://img.shields.io/badge/Spring%20Security-OAuth2%2FJWT-blue)
![React](https://img.shields.io/badge/React-19-61dafb)
![Vite](https://img.shields.io/badge/Vite-8-646cff)
![PostgreSQL](https://img.shields.io/badge/PostgreSQL-Compatible-336791)

# 🛍️ DS Catalog

**Sistema de catálogo de produtos** completo com **backend em Java/Spring Boot** e
**frontend em React**. A aplicação gerencia **categorias**, **produtos** e
**usuários**, com autenticação **OAuth2 + JWT**, controle de acesso por **roles**
(Administrador / Operador), paginação, filtros e recuperação de senha por e-mail.

> Um dos **dois lados** deste repositório (o frontend) foi desenvolvido por um
> **agente de Inteligência Artificial** com o objetivo de consumir e testar a API
> do backend. Veja [Frontend →](front/README.md).

----

## ✨ Funcionalidades

### Autenticação e usuários
- Login com **OAuth2 (grant type password)** e token **JWT** assinado com RSA.
- Cadastro de novos usuários (público).
- Controle de acesso por **roles**: `ROLE_ADMIN` e `ROLE_OPERATOR`.
- Perfil do usuário logado (`GET /users/me`).
- Recuperação de senha por e-mail (token com TTL de 30 min).

### Catálogo
- CRUD completo de **produtos** e **categorias**.
- Busca paginada de produtos por **nome** e com **filtro por categoria**.
- Painel administrativo completo no frontend.

| Perfil | O que pode fazer |
|---|---|
| **Administrador** (`ROLE_ADMIN`) | Tudo: categorias, produtos, usuários |
| **Operador** (`ROLE_OPERATOR`) | Catálogo e gerenciar produtos |

---

## 🧱 Stack / Tecnologias

| Camada | Tecnologias |
|---|---|
| **Backend** | Java 21, Spring Boot 3.4, Spring Data JPA, Spring Security, OAuth2 Authorization Server, Bean Validation, H2, PostgreSQL, Maven |
| **Frontend** | React 19, Vite 8, React Router, Axios, Lucide icons, CSS customizado |
| **Banco** | H2 (teste/desenvolvimento) e PostgreSQL (produção) |
| **Infra/Qualidade** | JUnit 5, Mockito, MockMvc, testes de integração (H2) |

---

## 📁 Estrutura do projeto

```
dscatolog/
├── backend/                 # API REST (Java / Spring Boot)
│   └── src/
│       ├── main/java/com/devsuperior/dscatalog/
│       │   ├── config/          # Segurança, OAuth2, CORS
│       │   ├── dto/             # Objetos de transferência de dados
│       │   ├── entities/        # Entidades JPA (User, Product, Category, Role)
│       │   ├── projections/     # Projeções para queries otimizadas
│       │   ├── repositories/    # Spring Data JPA
│       │   ├── resources/       # Controllers REST + handler de erros
│       │   ├── services/        # Regras de negócio
│       │   └── util/
│       └── test/               # Testes unitários, web e integração
├── front/                    # Aplicação web (React / Vite)
│   └── src/
│       ├── api/               # Chamadas HTTP (axios) + autenticação
│       ├── components/        # Sidebar, modais, cards, guard de rotas
│       ├── context/           # Estado global de autenticação
│       └── pages/             # Telas (login, catálogo, admin, perfil...)
└── README.md                 # Este arquivo
```

---

## 🚀 Como rodar o projeto

> Pré-requisitos: **Java 21+**, **Node.js 18+**, **Maven** (ou use o wrapper `mvnw`) e **PostgreSQL** (opcional, só para o perfil `dev`).

### 1. Rodar o `backend`

Na pasta `backend/`, usando o perfil de **teste** (banco H2 em memória — sem instalar nada):

```bash
./mvnw spring-boot:run
```

> O servidor sobe em **http://localhost:8080** e o banco para de testar é o **H2**.

Para usar **PostgreSQL** (perfil `dev`):

```bash
./mvnw spring-boot:run -Dspring-boot.run.profiles=dev
```

### 2. Rodar o `frontend`

Em **outro terminal**, na pasta `front/`:

```bash
cd front
npm install      # apenas na primeira vez
npm run dev      # sobe em http://localhost:5173
```

Acesse **http://localhost:5173** no navegador.

> O backend precisa ficar rodando enquanto você usa o front.

### 🔑 Contas de teste (banco H2)

| E-mail | Senha | Perfil |
|---|---|---|
| `maria@gmail.com` | `123456` | Administradora |
| `alex@gmail.com` | `123456` | Operador |

---

## 🔐 Autenticação (OAuth2)

O login usa o **`password` grant** do OAuth2 com o client autenticado via
**HTTP Basic**. A API retorna um **JWT** que deve ser enviado no header
`Authorization: Bearer <token>` nas demais chamadas.

```
POST /oauth2/token
Content-Type: application/x-www-form-urlencoded
Authorization: Basic base64(client_id:client_secret)

grant_type=password
username=maria@gmail.com
password=123456
```

Client padrão (configurável por variável de ambiente):

| Parâmetro | Valor padrão |
|---|---|
| `client_id` | `myclientid` |
| `client_secret` | `myclientsecret` |

---

## 📡 Endpoints principais

### Autenticação
| Método | Rota | Descrição |
|---|---|---|
| POST | `/oauth2/token` | Login (gera JWT) |
| POST | `/auth/recover-token` | Envia token de recuperação de senha |
| PUT | `/auth/new-password` | Redefine a senha com o token |

### Produtos (GET público; POST/PUT/DELETE: Admin + Operador)
| Método | Rota | Descrição |
|---|---|---|
| GET | `/products?name=&categoryId=0&page=0&size=12` | Lista paginada com filtros |
| GET | `/products/{id}` | Busca por id |
| POST | `/products` | Cria produto |
| PUT | `/products/{id}` | Atualiza produto |
| DELETE | `/products/{id}` | Remove produto |

### Categorias (GET público; POST/PUT/DELETE: Admin + Operador)
| Método | Rota |
|---|---|
| GET | `/categories` |
| GET | `/categories/{id}` |
| POST | `/categories` |
| PUT | `/categories/{id}` |
| DELETE | `/categories/{id}` |

### Usuários (detalhe); **GET `/users`, `PUT` e `DELETE`: apenas Admin**
| Método | Rota | Descrição |
|---|---|---|
| GET | `/users` | Lista usuários (Admin) |
| GET | `/users/{id}` | Busca usuário (Admin) |
| GET | `/users/me` | Usuário logado (Admin/Operador) |
| POST | `/users` | Cadastra usuário (público) |
| PUT | `/users/{id}` | Atualiza usuário (Admin) |
| DELETE | `/users/{id}` | Remove usuário (Admin) |

---

## 🧪 Testes

O backend cobre **três camadas** de teste com JUnit 5:

```bash
cd backend
./mvnw test
```

- **Unitários** (Service) com Mockito.
- **Camada web** (Controller) com MockMvc.
- **Integração** subindo o contexto real com H2 e JWT real (`TokenUtil`).

---

## 🌱 Roadmap (ideias de evolução)

- [ ] Upload de imagens reais dos produtos (ex.: S3/local).
- [ ] Refresh token para renovação automática de sessão.
- [ ] Página pública de produtos (sem login) + carrinho.
- [ ] Internacionalização (i18n).
- [ ] Deploy do backend (Railway/Heroku) e do front (Vercel/Netlify).

---

## 📄 Documentação por parte

- [Backend (Java / Spring Boot) → `backend/README.md`](backend/README.md)
- [Frontend (React / Vite) → `front/README.md`](front/README.md)

---

Desenvolvido como projeto de estudo completo do ecossistema **Spring Boot** +
**React**, cobrindo segurança OAuth2/JWT, persistência JPA, validação e testes
multicamada.
