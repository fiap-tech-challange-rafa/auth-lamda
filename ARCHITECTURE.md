# Arquitetura - Auth Lambda

## 📐 Diagrama de Componentes

```
┌──────────────────────────────────────────────────────────────┐
│                   AWS API Gateway                            │
│                                                              │
│  POST /auth/authenticate                                    │
└────────────────────────┬─────────────────────────────────────┘
                         │
                         ▼
        ┌────────────────────────────────┐
        │  AWS Lambda - Auth Function    │
        │  (Node.js 18+ / Python 3.11+)  │
        │                                │
        │  ┌──────────────────────────┐ │
        │  │ Authentication Handler   │ │
        │  │ - Parse CPF + ClientID   │ │
        │  │ - Validate Input         │ │
        │  └──────────────────────────┘ │
        │                                │
        │  ┌──────────────────────────┐ │
        │  │ CPF Validation Service   │ │
        │  │ - Check format           │ │
        │  │ - Verify digits          │ │
        │  └──────────────────────────┘ │
        │                                │
        │  ┌──────────────────────────┐ │
        │  │ Client Lookup Service    │ │
        │  │ - Query RDS              │ │
        │  │ - Check status           │ │
        │  └──────────────────────────┘ │
        │                                │
        │  ┌──────────────────────────┐ │
        │  │ Token Generation Service │ │
        │  │ - Create JWT             │ │
        │  │ - Set expiration         │ │
        │  └──────────────────────────┘ │
        └────────┬──────────────────────┘
                 │
        ┌────────┴──────────┐
        ▼                   ▼
    ┌────────────────┐  ┌──────────────────┐
    │ AWS RDS        │  │ AWS Secrets      │
    │ PostgreSQL     │  │ Manager (JWT Key)│
    │                │  │                  │
    │ - Clientes     │  │ - JWT_SECRET     │
    │ - Veículos     │  │ - DB_PASSWORD    │
    │ - Peças        │  │ - API_KEYS       │
    │ - Ordens       │  │                  │
    └────────────────┘  └──────────────────┘
```

## 🔄 Fluxo de Autenticação

```
Client                API Gateway              Lambda                RDS
  │                       │                      │                    │
  ├─ POST /auth/auth──────┤                      │                    │
  │  {cpf, clientId}       │                      │                    │
  │                        ├─ Invoke Lambda──────┤                    │
  │                        │                      │                    │
  │                        │                      ├─ Validate CPF      │
  │                        │                      │                    │
  │                        │                      ├─ Query Client─────┤
  │                        │                      │                    │
  │                        │                      │ CPF + Status       │
  │                        │                      │◄───────────────────┤
  │                        │                      │                    │
  │                        │                      ├─ Generate JWT      │
  │                        │                      │ (Secrets Manager)  │
  │                        │                      │                    │
  │◄──── Response ─────────┤◄──────────────────────┤                    │
  │  {token, expiresIn}    │                      │                    │
```

## 🔐 Segurança

- **Validação rigorosa de CPF**: Cálculo de dígitos verificadores
- **JWT com Secret forte**: Armazenado em AWS Secrets Manager
- **Rate Limiting**: Implementado na Lambda (X-Ray tracing)
- **Logs estruturados**: CloudWatch Logs em JSON
- **HTTPS obrigatório**: API Gateway enforce TLS 1.2+
- **IAM Roles**: Princípio do menor privilégio
- **VPC Endpoint**: Lambda conecta ao RDS via VPC

## 🚀 Deploy com SAM

```bash
# Local testing
sam local start-api

# Deploy para staging
sam deploy \
  --template-file template.yaml \
  --stack-name auth-lambda-staging \
  --parameter-overrides Environment=staging

# Deploy para produção
sam deploy \
  --template-file template.yaml \
  --stack-name auth-lambda-prod \
  --parameter-overrides Environment=production
```

## 📊 Métricas e Monitoramento

- **CloudWatch Logs**: Todos os logs da Lambda
- **X-Ray**: Tracing de requisições
- **Custom Metrics**: Taxa de autenticação bem/malsucedida
- **Alarmes**: Falhas na validação de CPF, timeouts no RDS

## 🔗 Integração com Aplicação Principal

A aplicação principal recebe o JWT do Lambda e o usa para:
1. Validar requisições em endpoints protegidos
2. Extrair informações do cliente (ID, CPF, nome)
3. Registrar ações com auditoria

## ⚙️ Configurações

### Variáveis de Ambiente

```
JWT_SECRET=<secret-from-secrets-manager>
JWT_EXPIRATION=3600
DB_HOST=tech-challenge-db.xxxxx.rds.amazonaws.com
DB_PORT=5432
DB_NAME=tech_challenge
DB_USER=postgres
DB_PASSWORD=<secret-from-secrets-manager>
LOG_LEVEL=info
```

### IAM Permissions

```json
{
  "Version": "2012-10-17",
  "Statement": [
    {
      "Effect": "Allow",
      "Action": [
        "secretsmanager:GetSecretValue",
        "rds-db:connect"
      ],
      "Resource": "*"
    }
  ]
}
```

## 🧪 Testes

```bash
# Unit tests
npm test

# Integration tests
npm run test:integration

# Load tests
npm run test:load
```

## 📚 Referências

- [AWS Lambda Best Practices](https://docs.aws.amazon.com/lambda/latest/dg/best-practices.html)
- [SAM Developer Guide](https://docs.aws.amazon.com/serverless-application-model/)
- [JWT Best Practices](https://tools.ietf.org/html/rfc8174)
