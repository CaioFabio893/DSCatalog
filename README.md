# DSCatalog

API REST de catálogo de produtos construída com Java 21 e Spring Boot 3.4, com autenticação OAuth2 via JWT, controle de acesso baseado em roles, paginação com filtros dinâmicos e cobertura de testes em múltiplas camadas.

---

## Tecnologias e Dependências

| Tecnologia | Versão | Finalidade |
|---|---|---|
| Java | 21 | Linguagem principal |
| Spring Boot | 3.4.4 | Framework base |
| Spring Security + OAuth2 Authorization Server | — | Autenticação e autorização |
| Spring Data JPA + Hibernate | — | Persistência |
| PostgreSQL | — | Banco de dados produção |
| H2 | — | Banco em memória para testes |
| Spring Mail | — | Envio de e-mail para recuperação de senha |
| Bean Validation (Jakarta) | — | Validação de DTOs |
| JUnit 5 + Mockito | — | Testes unitários e de integração |
| MockMvc | — | Testes de camada web |
| Maven | — | Build e gerenciamento de dependências |

---

## Arquitetura

O projeto segue a arquitetura em camadas clássica do ecossistema Spring, com separação explícita de responsabilidades:

```
┌────────────────────────────────────────┐
│           HTTP Request                 │
└────────────────┬───────────────────────┘
                 │
┌────────────────▼───────────────────────┐
│     Resource Layer (Controllers)       │  ← @RestController, roteamento, autorização
└────────────────┬───────────────────────┘
                 │
┌────────────────▼───────────────────────┐
│         Service Layer                  │  ← Regras de negócio, transações
└────────────────┬───────────────────────┘
                 │
┌────────────────▼───────────────────────┐
│       Repository Layer                 │  ← Spring Data JPA, queries nativas
└────────────────┬───────────────────────┘
                 │
┌────────────────▼───────────────────────┐
│     Database (PostgreSQL / H2)         │
└────────────────────────────────────────┘
```

A separação entre **entidades JPA**, **DTOs de entrada/saída** e **projeções** garante que o modelo de domínio nunca vaze para a camada de transporte.

---

## Modelo de Domínio

```
User ──────< tb_user_role >────── Role
 │
 └── email (único), password (BCrypt), firstName, lastName

Product ───< tb_product_category >──── Category
 │
 └── name, description, price, imgUrl, date (Instant)

PasswordRecover
 └── token (UUID), email, expiration (Instant)
```

A entidade `User` implementa `UserDetails` do Spring Security, tornando-a diretamente compatível com o mecanismo de autenticação sem adaptadores extras.

A entidade `Product` implementa `IdProjection<Long>`, interface genérica usada para reordenar resultados de queries nativas mantendo a ordem da paginação.

---

## Segurança

### Fluxo OAuth2 com Password Grant customizado

O Spring Authorization Server 1.x removeu o suporte nativo ao Password Grant Type (depreciado no OAuth 2.1). A solução implementa o grant type customizado do zero seguindo a especificação RFC 6749:

**`CustomPasswordAuthenticationConverter`** — lê os parâmetros `username` e `password` da requisição HTTP e constrói um `CustomPasswordAuthenticationToken`.

**`CustomPasswordAuthenticationProvider`** — recebe o token, valida as credenciais via `UserDetailsService`, verifica a senha com `BCryptPasswordEncoder`, coleta as authorities do usuário e gera o JWT via `OAuth2TokenGenerator`.

**`CustomUserAuthorities`** — wrapper que carrega username + authorities para dentro do contexto do Authorization Server, permitindo que o `tokenCustomizer` injete os claims `username` e `authorities` diretamente no payload do JWT.

O resultado é um token JWT auto-contido (self-contained), assinado com chave RSA de 2048 bits gerada em runtime:

```java
// Payload do JWT gerado
{
  "sub": "myclientid",
  "username": "user@example.com",
  "authorities": ["ROLE_OPERATOR"],
  "exp": ...
}
```

### Resource Server

O `ResourceServerConfig` configura o Resource Server para validar JWTs recebidos, extrai as authorities do claim `authorities` (sem o prefixo padrão `SCOPE_`) e aplica CORS com origens configuráveis via variável de ambiente.

O acesso aos endpoints é controlado via `@PreAuthorize`:

| Endpoint | Roles permitidas |
|---|---|
| `GET /products` | Público |
| `GET /products/{id}` | Público |
| `POST /products` | ROLE_ADM, ROLE_OPERATOR |
| `PUT /products/{id}` | ROLE_ADM, ROLE_OPERATOR |
| `DELETE /products/{id}` | ROLE_ADM, ROLE_OPERATOR |
| `GET /users` | ROLE_ADM |
| `GET /users/{id}` | ROLE_ADM |
| `GET /users/me` | ROLE_ADM, ROLE_OPERATOR |
| `PUT /users/{id}` | ROLE_ADM |
| `DELETE /users/{id}` | ROLE_ADM |

---

## Endpoints da API

### Autenticação

```
POST /oauth2/token
Content-Type: application/x-www-form-urlencoded

grant_type=password&username={email}&password={senha}&client_id={id}&client_secret={secret}
```

### Recuperação de Senha

```
POST /auth/recover-token    → gera token e envia e-mail
PUT  /auth/new-password     → valida token e redefine senha
```

### Produtos

```
GET    /products?name=&categoryId=0&page=0&size=12&sort=name,asc
GET    /products/{id}
POST   /products
PUT    /products/{id}
DELETE /products/{id}
```

### Categorias

```
GET    /categories
GET    /categories/{id}
POST   /categories
PUT    /categories/{id}
DELETE /categories/{id}
```

### Usuários

```
GET    /users
GET    /users/{id}
GET    /users/me
POST   /users
PUT    /users/{id}
DELETE /users/{id}
```

---

## Paginação e Filtro de Produtos

A busca paginada de produtos resolve um problema clássico do N+1 com categorias usando uma abordagem em dois passos:

**Passo 1 — Query nativa paginada:** retorna apenas `id` e `name` dos produtos que correspondem ao filtro de nome e categoria, com suporte a paginação e contagem correta.

```sql
SELECT DISTINCT tb_product.id, tb_product.name
FROM tb_product
INNER JOIN tb_product_category ON tb_product_category.product_id = tb_product.id
WHERE (:categoryIds IS NULL OR tb_product_category.category_id IN (:categoryIds))
AND LOWER(tb_product.name) LIKE LOWER(CONCAT('%', :name, '%'))
```

**Passo 2 — JPQL com JOIN FETCH:** busca os produtos completos com suas categorias em uma única query, usando os IDs retornados no passo anterior.

```java
@Query("SELECT obj FROM Product obj JOIN FETCH obj.categories WHERE obj.id IN :productIds")
List<Product> searchProductsWithCategories(List<Long> productIds);
```

**Passo 3 — Reordenação:** a classe utilitária `Utils.replace()` garante que a ordem dos produtos retornados pelo JOIN FETCH respeita a ordem original da paginação, já que o banco não garante ordenação em queries `IN`.

---

## Recuperação de Senha

O fluxo completo de recuperação é gerenciado pelo `AuthService`:

1. O usuário envia o e-mail via `POST /auth/recover-token`.
2. O sistema verifica se o e-mail existe no banco e lança `ResourceNotFoundException` caso contrário.
3. Um token UUID é gerado, salvo na tabela `tb_password_recover` com TTL configurável (padrão: 30 minutos).
4. Um e-mail com o link de redefinição é enviado via SMTP (configurado via Spring Mail).
5. O usuário acessa `PUT /auth/new-password` com o token e a nova senha.
6. O sistema valida se o token existe e não expirou (`searchValidTokens` compara com `Instant.now()`).
7. A nova senha é salva com hash BCrypt.

---

## Validação Customizada

Para evitar duplicidade de e-mail no cadastro de usuários, foi implementada uma validação customizada usando a Bean Validation API:

`@UserInsertValid` é uma anotação customizada que aciona o `UserInsertValidator`. Ele consulta o banco de dados pelo e-mail informado e, se já existir, adiciona um erro de campo (`FieldMessage`) que é propagado no corpo da resposta de erro com status 422 Unprocessable Entity.

O mesmo padrão existe para atualização (`@UserUpdateValid`), onde a validação ignora o próprio usuário sendo editado para permitir que ele mantenha seu e-mail atual.

---

## Tratamento de Erros

Um `@RestControllerAdvice` centraliza o tratamento de exceções:

| Exceção | HTTP Status |
|---|---|
| `ResourceNotFoundException` | 404 Not Found |
| `DatabaseException` | 422 Unprocessable Entity |
| `MethodArgumentNotValidException` | 422 Unprocessable Entity |

O corpo de erro segue um formato padronizado com `timestamp`, `status`, `error`, `message` e `path`. Erros de validação incluem uma lista de `fieldErrors` com o campo e a mensagem correspondente.

---

## Testes

O projeto cobre três camadas de teste com estratégias distintas:

### Testes Unitários de Service (`ProductServiceTests`)

Usa `@ExtendWith(SpringExtension.class)` sem subir o contexto do Spring, com Mockito injetando mocks do `ProductRepository` e `CategoryRepository` via `@InjectMocks`.

Cenários cobertos: `findAllPaged`, `findById` (id existente e inexistente), `update` (id existente e inexistente), `delete` (id existente, inexistente e com dependência referencial).

### Testes de Camada Web (`ProductResourceTests`)

Usa `@WebMvcTest` com `MockMvc` para testar os controllers de forma isolada, sem subir banco de dados. O `ProductService` é mockado com `@MockitoBean`. A configuração de segurança é excluída (`excludeAutoConfiguration = {SecurityAutoConfiguration.class}`) para testar o comportamento HTTP sem OAuth2.

### Testes de Integração (`ProductServiceIT`, `ProductResourceIT`)

Sobe o contexto completo do Spring com banco H2 em memória (perfil `test`). O `ProductServiceIT` verifica comportamento real de paginação e delete integrado ao banco. O `ProductResourceIT` usa `TokenUtil` para obter tokens JWT reais e testar endpoints protegidos com autenticação de verdade.

---

## Configuração e Perfis

| Perfil | Banco | Ativação |
|---|---|---|
| `test` | H2 em memória | Default / testes |
| `dev` | PostgreSQL local | `spring.profiles.active=dev` |

Todas as configurações sensíveis são externalizadas via variáveis de ambiente com fallback para desenvolvimento local:

```properties
# Segurança
security.client-id=${CLIENT_ID:myclientid}
security.client-secret=${CLIENT_SECRET:myclientsecret}
security.jwt.duration=${JWT_DURATION:86400}

# CORS
cors.origins=${CORS_ORIGINS:http://localhost:3000,http://localhost:5173}

# SMTP
spring.mail.host=${EMAIL_HOST:smtp.gmail.com}
spring.mail.username=${EMAIL_USERNAME:test@gmail.com}
spring.mail.password=${EMAIL_PASSWORD:123456}

# Token de recuperação de senha
email.password-recover.token.minutes=${PASSWORD_RECOVER_TOKEN_MINUTES:30}
email.password-recover.uri=${PASSWORD_RECOVER_URI:http://localhost:5173/recover-password/}
```

---

## Como Executar

### Pré-requisitos

- Java 21+
- Maven 3.8+
- PostgreSQL (para perfil `dev`)

### Rodando com perfil de teste (H2)

```bash
./mvnw spring-boot:run
```

### Rodando com PostgreSQL

```bash
# Certifique-se de ter o banco criado
createdb dscatalog

./mvnw spring-boot:run -Dspring-boot.run.profiles=dev
```

### Executando os testes

```bash
./mvnw test
```

---

## Estrutura do Projeto

```
backend/
├── src/main/java/com/devsuperior/dscatalog/
│   ├── config/
│   │   ├── AppConfig.java                        # Bean de BCryptPasswordEncoder
│   │   ├── AuthorizationServerConfig.java        # OAuth2 Authorization Server + JWT RSA
│   │   ├── ResourceServerConfig.java             # Resource Server + CORS
│   │   └── customgrant/
│   │       ├── CustomPasswordAuthenticationConverter.java
│   │       ├── CustomPasswordAuthenticationProvider.java
│   │       ├── CustomPasswordAuthenticationToken.java
│   │       └── CustomUserAuthorities.java
│   ├── dto/                                      # Objetos de transferência de dados
│   ├── entities/                                 # Entidades JPA
│   ├── projections/                              # Interfaces de projeção Spring Data
│   ├── repositories/                             # Repositórios Spring Data JPA
│   ├── resources/                                # Controllers REST
│   │   └── exceptions/                          # Handler global de erros
│   ├── services/                                 # Regras de negócio
│   │   ├── exceptions/                          # Exceções de domínio
│   │   └── validation/                          # Validators customizados (Bean Validation)
│   └── util/
│       └── Utils.java                           # Utilitário de reordenação de listas
└── src/test/
    ├── repositories/ProductRepositoryTest.java
    ├── resoucers/
    │   ├── ProductResourceIT.java
    │   └── ProductResourceTests.java
    ├── services/
    │   ├── ProductServiceIT.java
    │   └── ProductServiceTests.java
    └── tests/
        ├── Factory.java                         # Fábrica de objetos para testes
        └── TokenUtil.java                       # Utilitário para obter JWT nos testes
```

---

## Autor

Desenvolvido como projeto de estudo completo do ecossistema Spring Boot, abrangendo segurança com OAuth2/JWT, persistência com JPA, validação customizada e testes em múltiplas camadas.
