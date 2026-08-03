<p align="center">
  <a href="http://nestjs.com/" target="blank"><img src="https://nestjs.com/img/logo-small.svg" width="120" alt="Nest Logo" /></a>
</p>

[circleci-image]: https://img.shields.io/circleci/build/github/nestjs/nest/master?token=abc123def456
[circleci-url]: https://circleci.com/gh/nestjs/nest

  <p align="center">A progressive <a href="http://nodejs.org" target="_blank">Node.js</a> framework for building efficient and scalable server-side applications.</p>
    <p align="center">
<a href="https://www.npmjs.com/~nestjscore" target="_blank"><img src="https://img.shields.io/npm/v/@nestjs/core.svg" alt="NPM Version" /></a>
<a href="https://www.npmjs.com/~nestjscore" target="_blank"><img src="https://img.shields.io/npm/l/@nestjs/core.svg" alt="Package License" /></a>
<a href="https://www.npmjs.com/~nestjscore" target="_blank"><img src="https://img.shields.io/npm/dm/@nestjs/common.svg" alt="NPM Downloads" /></a>
<a href="https://circleci.com/gh/nestjs/nest" target="_blank"><img src="https://img.shields.io/circleci/build/github/nestjs/nest/master" alt="CircleCI" /></a>
<a href="https://discord.gg/G7Qnnhy" target="_blank"><img src="https://img.shields.io/badge/discord-online-brightgreen.svg" alt="Discord"/></a>
<a href="https://opencollective.com/nest#backer" target="_blank"><img src="https://opencollective.com/nest/backers/badge.svg" alt="Backers on Open Collective" /></a>
<a href="https://opencollective.com/nest#sponsor" target="_blank"><img src="https://opencollective.com/nest/sponsors/badge.svg" alt="Sponsors on Open Collective" /></a>
  <a href="https://paypal.me/kamilmysliwiec" target="_blank"><img src="https://img.shields.io/badge/Donate-PayPal-ff3f59.svg" alt="Donate us"/></a>
    <a href="https://opencollective.com/nest#sponsor"  target="_blank"><img src="https://img.shields.io/badge/Support%20us-Open%20Collective-41B883.svg" alt="Support us"></a>
  <a href="https://twitter.com/nestframework" target="_blank"><img src="https://img.shields.io/twitter/follow/nestframework.svg?style=social&label=Follow" alt="Follow us on Twitter"></a>
</p>
  <!--[![Backers on Open Collective](https://opencollective.com/nest/backers/badge.svg)](https://opencollective.com/nest#backer)
  [![Sponsors on Open Collective](https://opencollective.com/nest/sponsors/badge.svg)](https://opencollective.com/nest#sponsor)-->

## Description

[Nest](https://github.com/nestjs/nest) framework TypeScript starter repository.

## Autenticação & criação de usuários

O registro **não é público**. Toda a API exige JWT (guard global), exceto o
login e os endpoints de ingestão externa marcados com `@Public()`.

Fluxo de criação de usuários:

```
POST /auth/login  →  JWT válido  →  papel ADMIN  →  POST /auth/register
```

- **Sem token** em `POST /auth/register` → `401 Unauthorized`.
- **Token de usuário comum** (`USER`) → `403 Forbidden`.
- **Token de ADMIN** → cria o usuário. O corpo aceita `role` opcional
  (`ADMIN` | `USER`); omitido, cria um `USER` (menor privilégio).

### Primeiro administrador (seed)

Como o registro deixou de ser aberto, o ADMIN inicial é criado por um seed
**idempotente** (só cria se ainda não houver nenhum ADMIN):

```bash
# defina as credenciais no server/.env (ou inline) e rode:
ADMIN_BOOTSTRAP_EMAIL=admin@prost.com \
ADMIN_BOOTSTRAP_PASSWORD=umaSenhaForte \
npm run seed
```

Variáveis (ver `.env.example`):

| Variável | Obrigatória | Descrição |
|---|---|---|
| `ADMIN_BOOTSTRAP_EMAIL` | sim | E-mail do primeiro admin |
| `ADMIN_BOOTSTRAP_PASSWORD` | sim | Senha (mín. 8 caracteres) |
| `ADMIN_BOOTSTRAP_NAME` | não | Nome exibido (padrão: "Administrador") |

Depois de criado o primeiro admin, novos usuários são criados por ele via
`POST /auth/register`. Exemplo:

```bash
# 1) login do admin
TOKEN=$(curl -s -X POST http://localhost:3000/auth/login \
  -H 'Content-Type: application/json' \
  -d '{"email":"admin@prost.com","password":"umaSenhaForte"}' | jq -r .token)

# 2) admin cria um usuário comum
curl -X POST http://localhost:3000/auth/register \
  -H "Authorization: Bearer $TOKEN" \
  -H 'Content-Type: application/json' \
  -d '{"name":"Operador","email":"op@prost.com","password":"outraSenha8","role":"USER"}'
```

> Alteração de schema: o default de `User.role` passou de `ADMIN` para `USER`.
> Aplique com `npx prisma db push` (usuários já existentes não são afetados).

## Ingestão externa (coletor & webhooks)

Dois endpoints recebem dados de origem externa (sem JWT) e por isso usam
segredos próprios. Ambos são **fail-closed em produção** (`NODE_ENV=production`):
sem o segredo configurado, a requisição é recusada.

| Endpoint | Autenticação | Variável |
|---|---|---|
| `POST /oi/scrape` (bookmarklet) | Header `X-Collector-Token` | `COLLECTOR_TOKEN` |
| `POST /webhooks/oficina-inteligente` | Assinatura HMAC `X-OI-Signature` | `OI_WEBHOOK_SECRET` |

- **Coletor:** o token é obtido pelo frontend em `GET /oi/collector-token`
  (exige login) e embutido no bookmarklet. Gere um valor com
  `openssl rand -hex 24` e coloque em `COLLECTOR_TOKEN`.
- **Webhook:** configure o mesmo `OI_WEBHOOK_SECRET` no painel da Oficina
  Inteligente; a assinatura é verificada com `timingSafeEqual`.
- Fora de produção, se a variável estiver vazia, a verificação é ignorada
  (apenas para facilitar o desenvolvimento local) e um aviso é logado.

## Hardening HTTP

- **Helmet** aplica cabeçalhos de segurança em todas as respostas.
- **Rate limiting** (`@nestjs/throttler`): 120 req/min por IP no geral e
  **8 tentativas/min** no `POST /auth/login` (anti brute-force). O storage é em
  memória — para múltiplas instâncias, migrar para um storage compartilhado (Redis).
- **CORS** por ambiente: defina `CORS_ORIGINS` (lista separada por vírgula) com
  o domínio do frontend de produção.

## Project setup

```bash
$ npm install
```

## Compile and run the project

```bash
# development
$ npm run start

# watch mode
$ npm run start:dev

# production mode
$ npm run start:prod
```

## Run tests

```bash
# unit tests
$ npm run test

# e2e tests
$ npm run test:e2e

# test coverage
$ npm run test:cov
```

## Deployment

When you're ready to deploy your NestJS application to production, there are some key steps you can take to ensure it runs as efficiently as possible. Check out the [deployment documentation](https://docs.nestjs.com/deployment) for more information.

If you are looking for a cloud-based platform to deploy your NestJS application, check out [Mau](https://mau.nestjs.com), our official platform for deploying NestJS applications on AWS. Mau makes deployment straightforward and fast, requiring just a few simple steps:

```bash
$ npm install -g @nestjs/mau
$ mau deploy
```

With Mau, you can deploy your application in just a few clicks, allowing you to focus on building features rather than managing infrastructure.

## Resources

Check out a few resources that may come in handy when working with NestJS:

- Visit the [NestJS Documentation](https://docs.nestjs.com) to learn more about the framework.
- For questions and support, please visit our [Discord channel](https://discord.gg/G7Qnnhy).
- To dive deeper and get more hands-on experience, check out our official video [courses](https://courses.nestjs.com/).
- Deploy your application to AWS with the help of [NestJS Mau](https://mau.nestjs.com) in just a few clicks.
- Visualize your application graph and interact with the NestJS application in real-time using [NestJS Devtools](https://devtools.nestjs.com).
- Need help with your project (part-time to full-time)? Check out our official [enterprise support](https://enterprise.nestjs.com).
- To stay in the loop and get updates, follow us on [X](https://x.com/nestframework) and [LinkedIn](https://linkedin.com/company/nestjs).
- Looking for a job, or have a job to offer? Check out our official [Jobs board](https://jobs.nestjs.com).

## Support

Nest is an MIT-licensed open source project. It can grow thanks to the sponsors and support by the amazing backers. If you'd like to join them, please [read more here](https://docs.nestjs.com/support).

## Stay in touch

- Author - [Kamil Myśliwiec](https://twitter.com/kammysliwiec)
- Website - [https://nestjs.com](https://nestjs.com/)
- Twitter - [@nestframework](https://twitter.com/nestframework)

## License

Nest is [MIT licensed](https://github.com/nestjs/nest/blob/master/LICENSE).
