import {
  ArgumentsHost,
  Catch,
  ExceptionFilter,
  HttpException,
  HttpStatus,
  Logger,
} from '@nestjs/common';
import * as Sentry from '@sentry/nestjs';
import type { Request, Response } from 'express';
import { errorMessage } from './errors';

/**
 * Filtro global de exceções: padroniza o corpo de erro, evita vazar detalhes
 * internos em produção e reporta ao Sentry apenas os erros de servidor (5xx),
 * sem o ruído dos 4xx (erros esperados do cliente).
 *
 * Substitui o SentryGlobalFilter: a captura para o Sentry é feita aqui,
 * condicionada ao status.
 */
@Catch()
export class AllExceptionsFilter implements ExceptionFilter {
  private readonly logger = new Logger('Exceptions');

  catch(exception: unknown, host: ArgumentsHost) {
    const ctx = host.switchToHttp();
    const res = ctx.getResponse<Response>();
    const req = ctx.getRequest<Request>();

    const isHttp = exception instanceof HttpException;
    const status = isHttp
      ? exception.getStatus()
      : HttpStatus.INTERNAL_SERVER_ERROR;

    // Preserva a mensagem do Nest/ValidationPipe (string ou array de strings) —
    // é o que o frontend consome em response.data.message.
    let message: unknown;
    if (isHttp) {
      const r = exception.getResponse();
      message =
        typeof r === 'object' && r !== null && 'message' in r ? r.message : r;
    } else {
      // Erro não-HTTP (bug/500): nunca vaza o detalhe interno em produção.
      message =
        process.env.NODE_ENV === 'production'
          ? 'Erro interno do servidor.'
          : errorMessage(exception);
    }

    // Só 5xx: log detalhado no servidor + Sentry (evita ruído de 4xx).
    if (status >= 500) {
      this.logger.error(
        `${req.method} ${req.url} -> ${status}: ${errorMessage(exception)}`,
      );
      Sentry.captureException(exception);
    }

    res.status(status).json({
      statusCode: status,
      message,
      timestamp: new Date().toISOString(),
      path: req.url,
    });
  }
}
