// Sentry: primeiro import, antes de qualquer módulo do Nest (instrumentação).
import './instrument';
import { NestFactory } from '@nestjs/core';
import { ValidationPipe } from '@nestjs/common';
import helmet from 'helmet';
import cookieParser from 'cookie-parser';
import { AppModule } from './app.module';

// Origens liberadas no CORS. Em produção, sobrescreva com CORS_ORIGINS (lista
// separada por vírgula); o default cobre o dev local e o painel da OI.
const DEFAULT_CORS_ORIGINS = [
  'http://localhost:5173',
  // Coletor (bookmarklet) roda dentro do painel da Oficina Inteligente
  'https://sistemaoficinainteligente.com.br',
  'https://www.sistemaoficinainteligente.com.br',
];

async function bootstrap() {
  const app = await NestFactory.create(AppModule, { rawBody: true });

  // Cabeçalhos de segurança (HSTS, no-sniff, frameguard, etc.).
  app.use(helmet());
  // Lê os cookies httpOnly de sessão (access/refresh).
  app.use(cookieParser());

  const corsOrigins = (
    process.env.CORS_ORIGINS
      ? process.env.CORS_ORIGINS.split(',')
      : DEFAULT_CORS_ORIGINS
  )
    .map((o) => o.trim())
    .filter(Boolean);

  app.enableCors({
    origin: corsOrigins,
    // Necessário para o navegador enviar/receber os cookies httpOnly de sessão.
    credentials: true,
    methods: ['GET', 'POST', 'PUT', 'PATCH', 'DELETE', 'OPTIONS'],
  });
  app.useGlobalPipes(new ValidationPipe({ whitelist: true }));
  await app.listen(process.env.PORT ?? 3000);
}
void bootstrap();
