import { ArgumentsHost, BadRequestException } from '@nestjs/common';
import { AllExceptionsFilter } from './all-exceptions.filter';

function mockHost() {
  const json = jest.fn();
  const status = jest.fn().mockReturnValue({ json });
  const req = { url: '/x', method: 'GET' };
  const host = {
    switchToHttp: () => ({
      getResponse: () => ({ status }),
      getRequest: () => req,
    }),
  } as unknown as ArgumentsHost;
  return { host, json, status };
}

describe('AllExceptionsFilter', () => {
  const filter = new AllExceptionsFilter();

  it('preserva statusCode, message e path de uma HttpException', () => {
    const { host, json, status } = mockHost();
    filter.catch(new BadRequestException('faltou o campo X'), host);
    expect(status).toHaveBeenCalledWith(400);
    expect(json).toHaveBeenCalledWith(
      expect.objectContaining({
        statusCode: 400,
        message: 'faltou o campo X',
        path: '/x',
      }),
    );
  });

  it('preserva o array de mensagens (erros de validação)', () => {
    const { host, json } = mockHost();
    filter.catch(
      new BadRequestException({
        statusCode: 400,
        message: ['a inválido', 'b inválido'],
        error: 'Bad Request',
      }),
      host,
    );
    expect(json).toHaveBeenCalledWith(
      expect.objectContaining({ message: ['a inválido', 'b inválido'] }),
    );
  });

  it('não vaza detalhe interno em produção (500 genérico)', () => {
    const prev = process.env.NODE_ENV;
    process.env.NODE_ENV = 'production';
    try {
      const { host, json, status } = mockHost();
      filter.catch(new Error('detalhe secreto do stack'), host);
      expect(status).toHaveBeenCalledWith(500);
      const body = json.mock.calls[0][0] as Record<string, unknown>;
      expect(body.message).toBe('Erro interno do servidor.');
      expect(JSON.stringify(body)).not.toContain('detalhe secreto');
    } finally {
      process.env.NODE_ENV = prev;
    }
  });
});
