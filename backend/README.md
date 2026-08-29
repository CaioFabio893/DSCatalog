# ⚙️ DS Catalog — Backend

API REST do sistema de catálogo de produtos, construída com **Java 21** e
**Spring Boot 3.4**, com **autenticação OAuth2 + JWT**, controle de acesso por
**roles**, **paginação com filtros** e **cobertura de testes** em múltiplas
camadas.

---

## 🧩 Visão geral das tecnologias

| Tecnologia | Versão | Finalidade |
|---|---|---|
| Java | 21 | Linguagem principal |
| Spring Boot | 3.4.4 | Framework base |
| Spring Security + OAuth2 Authorization Server | — | Autenticação e autorização (JWT RSA) |
| Spring Data JPA + Hibernate | — | Persistência e mapeamento objeto-relacional |
| PostgreSQL | — | Banco de dados de produção |
| H2 | — | Banco em memória (teste/desenvolvimento) |
| Spring Mail | — | Envio de e-mail para recuperação de senha |
| Bean Validation (Jakarta) | — | Validação de DTOs |
| JUnit 5 + Mockito + MockMvc | — | Testes unitários, web e integração |
| Maven (com wrapper `mvnw`) | — | Build e gerenciamento de dependências |

---

## 🗂️ Arquitetura em camadas

O projeto segue a arquitetura clássica do ecossistema Spring, com separação
clara de responsabilidades:

```
        HTTP Request
             │
 ┌───────────▼───────────┐
 │  Resource Layer       │  @RestController, roteamento, autorização (@PreAuthorize)
 └───────────┬───────────┘
             │
 ┌───────────▼───────────┐
 │  Service Layer        │  Regras de negócio, transações (@Transactional)
 └───────────┬───────────┘
             │
 ┌───────────▼───────────┐
 │  Repository Layer     │  Spring Data JPA, queries nativas/JPQL
 └───────────┬───────────┘
             │
 ┌───────────▼───────────┐
 │  Database (H2/Postgre)│
 └───────────────────────┘
```

A separação entre **entidades JPA**, **DTOs** (entrada/saída) e **projeções**
garante que o modelo de domínio nunca "vaze" para a camada de transporte.

### Estrutura de pacotes

```
backend/src/main/java/com/devsuperior/dscatalog/
├── config/                # Segurança, OAuth2, CORS, criptografia
│   └── customgrant/       # Implementação customizada do grant type "password"
├── dto/                   # Objetos de transferência de dados
├── entities/              # Entidades JPA
├── projections/           # Projeções para queries nativas otimizadas
├── repositories/          # Repositórios Spring Data JPA
├── resources/             # Controllers REST + handler global de exceções
├── services/              # Regras de negócio
│   ├── exceptions/        # Exceções de domínio
│   └── validation/        # Validators customizados (Bean Validation)
└── util/                  # Utilitários
```

---

## 🔐 Segurança e OAuth2

### Autenticação (Password Grant customizado)

O **Spring Authorization Server 1.x** removeu o suporte nativo ao *password
grant* (descontinuado no OAuth 2.1). Este projeto implementa o fluxo
**do zero**, seguindo a especificação RFC 6749:

- `CustomPasswordAuthenticationConverter` — lê `username` e `password` da
  requisição e monta um `CustomPasswordAuthenticationToken`.
- `CustomPasswordAuthenticationProvider` — valida as credenciais por
  `UserDetailsService` + `BCryptPasswordEncoder`, coleta as *authorities* do
  usuário e gera o **JWT** via `OAuth2TokenGenerator`.
- `CustomUserAuthorities` — carrega `username` + authorities para dentro do
  contexto do Authorization Server.
- `tokenCustomizer` — injeta os claims `username` e `authorities` no JWT.

O resultado é um **JWT auto-contido**, assinado com **chave RSA-2048** gerada
em runtime:

```json
{
  "sub": "myclientid",
  "username": "maria@gmail.com",
  "authorities": ["ROLE_OPERATOR", "ROLE_ADMIN"]
}
```

### Como o client OAuth2 se autentica

O client (`client_id`/`client_secret`) se autentica via **HTTP Basic**:

```
POST /oauth2/token
Content-Type: application/x-www-form-urlencoded
Authorization: Basic base64(client_id:client_secret)

grant_type=password
username=maria@gmail.com
password=123456
```

### Autorização (Resource Server)

O `ResourceServerConfig` valida os JWTs recebidos, extrai as authorities do
claim `authorities` (sem prefixo `SCOPE_`) e aplica **CORS** com origens
configuráveis.

O controle de acesso é feito por **`@PreAuthorize`** nos controllers:

| Endpoint | Roles permitidas |
|---|---|
| `GET /products`, `GET /products/{id}` | Público |
| `POST /products`, `PUT /products/{id}`, `DELETE /products/{id}` | `ROLE_ADMIN`, `ROLE_OPERATOR` |
| `GET /categories`, `GET /categories/{id}` | Público |
| `POST /categories`, `PUT /categories/{id}`, `DELETE /categories/{id}` | `ROLE_ADMIN`, `ROLE_OPERATOR` |
| `GET /users`, `GET /users/{id}`, `PUT /users/{id}`, `DELETE /users/{id}` | `ROLE_ADMIN` |
| `GET /users/me` | `ROLE_ADMIN`, `ROLE_OPERATOR` |
| `POST /users` | Público (cadastro) |

---

## 🗄️ Modelo de domínio

```
User ──────< tb_user_role >────── Role
 └── email (único), password (BCrypt), firstName, lastName

Product ───< tb_product_category >──── Category
 └── name, description, price, imgUrl, date (Instant)

PasswordRecover
 └── token (UUID), email, expiration (Instant)
```

- `User` implementa `UserDetails` → compatível com o Spring Security sem
  adaptadores extras.
- `Product` implementa `IdProjection<Long>` → usada para preservar a ordem da
  paginação em queries com `IN`.

---

## 🔎 Paginação e filtro de produtos (tratamento de N+1)

A busca paginada de produtos resolve o problema do **N+1** de categorias em
**três passos**:

1. **Query nativa paginada** — retorna apenas `id` e `name` dos produtos que
   batem com os filtros de nome (`LIKE`) e categoria (`IN`), com contagem
   correta.
2. **JPQL com `JOIN FETCH`** — busca os produtos completos com suas categorias
   em uma única query.
3. **Reordenação** — `Utils.replace()` garante que a ordem da query `IN`
   respeita a ordem original da página.

---

## ✉️ Recuperação de senha

Fluxo gerenciado pelo `AuthService`:

1. `POST /auth/recover-token` recebe o e-mail.
2. O sistema gera um **token UUID**, salva em `tb_password_recover` com TTL
   (padrão 30 min) e envia um e-mail com o link de redefinição.
3. `PUT /auth/new-password` recebe `token` + nova senha, valida se o token
   existe e não expirou, e salva a nova senha com hash **BCrypt**.

---

## ✅ Validação customizada

Para evitar **e-mail duplicado**, foram criadas anotações customizadas usando
Bean Validation:

- `@UserInsertValid` → dispara `UserInsertValidator`, que consulta o banco e
  adiciona erro de campo (422) se o e-mail já existir.
- `@UserUpdateValid` → o mesmo, mas ignora o próprio usuário em edição.

---

## 🛑 Tratamento de erros

Um `@RestControllerAdvice` centraliza as exceções:

| Exceção | HTTP Status |
|---|---|
| `ResourceNotFoundException` | 404 Not Found |
| `DatabaseException` | 422 Unprocessable Entity |
| `MethodArgumentNotValidException` | 422 Unprocessable Entity |

O corpo do erro segue formato padronizado (`timestamp`, `status`, `error`,
`message`, `path`) e, para erros de validação, inclui `fieldErrors`.

---

## ⚙️ Configuração e perfis

| Perfil | Banco | Ativação |
|---|---|---|
| `test` | H2 em memória | Padrão / testes |
| `dev` | PostgreSQL local | `-Dspring-boot.run.profiles=dev` |

Configurações sensíveis são externalizadas via **variáveis de ambiente** com
fallback para desenvolvimento local:

```properties
# Segurança
security.client-id=${CLIENT_ID:myclientid}
security.client-secret=${CLIENT_SECRET:myclientsecret}
security.jwt.duration=${JWT_DURATION:86400}

# CORS
cors.origins=${CORS_ORIGINS:http://localhost:3000,http://localhost:5173}

# SMTP (recuperação de senha)
spring.mail.host=${EMAIL_HOST:smtp.gmail.com}
spring.mail.username=${EMAIL_USERNAME:test@gmail.com}
spring.mail.password=${EMAIL_PASSWORD:123456}

# Token de recuperação
email.password-recover.token.minutes=${PASSWORD_RECOVER_TOKEN_MINUTES:30}
email.password-recover.uri=${PASSWORD_RECOVER_URI:http://localhost:5173/recover-password/}
```

---

## ▶️ Como executar

### Pré-requisitos
- **Java 21+**
- **Maven 3.8+** (ou use o wrapper `mvnw` incluso)
- **PostgreSQL** (apenas para o perfil `dev`)

### Rodar com H2 (teste — sem instalar nada)
```bash
./mvnw spring-boot:run
```
O servidor sobe em **http://localhost:8080**.

### Rodar com PostgreSQL
```bash
createdb dscatalog
./mvnw spring-boot:run -Dspring-boot.run.profiles=dev
```

### Rodar os testes
```bash
./mvnw test
```

### Dados de exemplo (banco H2)
O `import.sql` popula o banco automaticamente com categorias, produtos e
usuários. Usuários de teste (senha de ambos: **123456**):

| E-mail | Roles |
|---|---|
| `maria@gmail.com` | ROLE_OPERATOR + ROLE_ADMIN |
| `alex@gmail.com` | ROLE_OPERATOR |
| `caiofabio893@gmail.com` | ROLE_ADMIN |

---

## 🧪 Testes

| Tipo | Classe | O que valida |
|---|---|---|
| Unitário (Service) | `ProductServiceTests` | `findAllPaged`, `findById`, `update`, `delete` (existente/inexistente) com Mockito |
| Web (Controller) | `ProductResourceTests` | HTTP e serialização com `@WebMvcTest` + MockMvc |
| Integração | `ProductServiceIT`, `ProductResourceIT` | Subir o contexto real (H2) + JWT real via `TokenUtil` |

---

## 📌 Como testar a API manualmente

Exemplo com **cURL**:

```bash
# 1) Login → pega o token
curl -X POST http://localhost:8080/oauth2/token \
  -H "Content-Type: application/x-www-form-urlencoded" \
  -u myclientid:myclientsecret \
  -d "grant_type=password&username=maria@gmail.com&password=123456"

# 2) Listar produtos (com token)
curl http://localhost:8080/products \
  -H "Authorization: Bearer SEU_TOKEN_AQUI"

# 3) Criar produto (Admin/Operador)
curl -X POST http://localhost:8080/products \
  -H "Authorization: Bearer SEU_TOKEN_AQUI" \
  -H "Content-Type: application/json" \
  -d '{"name":"Notebook Gamer","description":"Notebook","price":4500.0,"categories":[{"id":3}]}'
```
