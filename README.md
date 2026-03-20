# auth-lambda

Lambda de autenticacao por CPF para o Tech Challenge.

## O que esta implementado

- Validacao de CPF
- Consulta do cliente no PostgreSQL
- Verificacao de cliente ativo
- Geracao de JWT para consumo da API principal
- Deploy com AWS SAM via GitHub Actions

## Estrutura

```text
auth-lambda/
├── src/
│   ├── config/database.js
│   ├── handlers/authenticate.js
│   ├── services/clientService.js
│   ├── services/cpfService.js
│   ├── services/tokenService.js
│   └── utils/logger.js
├── .github/workflows/deploy.yml
├── .env.example
├── index.js
├── package.json
└── template.yaml
```

## Executar localmente

```bash
npm install
sam build
sam local start-api
```

Endpoint local:

- `POST /auth/authenticate`

Payload:

```json
{
  "cpf": "12345678909",
  "clientId": 1
}
```

## Variaveis de ambiente

- `DB_HOST`
- `DB_PORT`
- `DB_NAME`
- `DB_USER`
- `DB_PASSWORD`
- `JWT_SECRET`
- `JWT_EXPIRATION`

## CI/CD

Workflow em `.github/workflows/deploy.yml`:

- `test`: lint e testes
- `build`: `sam build`
- `deploy-staging`: deploy ao fazer push em `homolog`
- `deploy-production`: deploy ao fazer push em `main`
