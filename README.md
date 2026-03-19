# Auth Lambda - Function Serverless para Autenticação

## 📋 Descrição

Este repositório contém uma Function Serverless (Lambda) responsável por:
- ✅ Validar o CPF do cliente
- ✅ Consultar a existência e status do cliente na base de dados
- ✅ Gerar e devolver um token JWT válido para consumo das APIs protegidas

## 🛠️ Tecnologias Utilizadas

- **Runtime**: Node.js 18+ ou Python 3.11+
- **Framework**: AWS SAM (Serverless Application Model) ou Serverless Framework
- **Banco de Dados**: PostgreSQL (RDS)
- **Autenticação**: JWT
- **CI/CD**: GitHub Actions
- **Cloud**: AWS Lambda

## 📁 Estrutura do Projeto

```
auth-lambda/
├── src/
│   ├── handlers/
│   │   ├── authenticate.js       # Handler principal para autenticação
│   │   └── validateCPF.js        # Validação de CPF
│   ├── services/
│   │   ├── cpfService.js         # Serviço de validação de CPF
│   │   ├── clientService.js      # Serviço para consultar cliente no BD
│   │   └── tokenService.js       # Serviço de geração JWT
│   ├── config/
│   │   ├── database.js           # Configuração DB
│   │   └── jwt.js                # Configuração JWT
│   ├── utils/
│   │   └── logger.js             # Logging estruturado
│   └── tests/
│       ├── authenticate.test.js
│       ├── cpfService.test.js
│       └── tokenService.test.js
├── .github/
│   └── workflows/
│       └── deploy.yml            # Pipeline de CI/CD
├── template.yaml                 # SAM template
├── Dockerfile                    # Container (opcional)
├── package.json
├── .env.example
├── .gitignore
└── README.md
```

## 🚀 Como Executar Localmente

### Pré-requisitos
- AWS CLI v2
- AWS SAM CLI
- Node.js 18+
- Docker (para local testing)

### Passos

1. **Clone o repositório**
   ```bash
   git clone https://github.com/seu-usuario/auth-lambda.git
   cd auth-lambda
   ```

2. **Instale as dependências**
   ```bash
   npm install
   ```

3. **Configure as variáveis de ambiente**
   ```bash
   cp .env.example .env
   # Edite .env com suas configurações
   ```

4. **Execute localmente com SAM**
   ```bash
   sam local start-api
   ```

5. **Execute os testes**
   ```bash
   npm test
   ```

## 📝 Endpoints

### POST /auth/authenticate
Autentica um cliente via CPF e retorna um JWT.

**Request:**
```json
{
  "cpf": "12345678901",
  "clientId": "123"
}
```

**Response (200):**
```json
{
  "success": true,
  "token": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...",
  "expiresIn": 3600,
  "clientId": "123"
}
```

**Response (400):**
```json
{
  "success": false,
  "message": "CPF inválido ou cliente não encontrado"
}
```

## 🔒 Validações

- ✅ Validação de CPF (verificação de dígito, formato)
- ✅ Verificação se cliente existe no banco de dados
- ✅ Verificação se cliente está ativo
- ✅ Geração segura de JWT com expiração

## 🔄 Pipeline CI/CD

O repositório possui uma pipeline GitHub Actions que:
1. Executa linting e testes
2. Faz build da aplicação
3. Deploy automático para AWS Lambda (staging e produção)

Branches protegidas:
- `main`: Deploy automático para produção
- `homolog`: Deploy automático para staging

## 📊 Documentação Arquitetural

```
┌─────────────────────────────────────────────────────────────┐
│                    API Gateway (AWS)                         │
└────────────────────────────┬────────────────────────────────┘
                             │
                             ▼
                  ┌──────────────────────┐
                  │   Auth Lambda        │
                  │  (Function Serverless)
                  └──────────┬───────────┘
                             │
                ┌────────────┴────────────┐
                ▼                         ▼
        ┌────────────────┐        ┌───────────────┐
        │  Validate CPF  │        │   Check DB    │
        └────────────────┘        │ (PostgreSQL)  │
                │                 └───────────────┘
                └────────────────┬─────────────────┐
                                 ▼
                         ┌───────────────────┐
                         │  Generate JWT     │
                         │  Token            │
                         └───────────────────┘
                                 │
                                 ▼
                         ┌───────────────────┐
                         │  Return Token     │
                         └───────────────────┘
```

## 🔐 Segurança

- JWT com secret forte (AWS Secrets Manager)
- Validação de entrada rigorosa
- Rate limiting implementado
- Logs estruturados para auditoria
- HTTPS obrigatório em produção
- Conectar ao banco de dados via VPC endpoint

## 📚 Links Importantes

- [Documentação AWS Lambda](https://docs.aws.amazon.com/lambda/)
- [SAM Documentation](https://docs.aws.amazon.com/serverless-application-model/)
- [JWT Best Practices](https://tools.ietf.org/html/rfc8174)

## 🤝 Contribuindo

Faça um Pull Request com sua feature. Certifique-se de:
- Adicionar testes para novas funcionalidades
- Atualizar a documentação
- Passar em todos os testes (`npm test`)

## 📄 Licença

MIT
