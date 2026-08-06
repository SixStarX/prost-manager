import { describe, it, expect } from 'vitest';
import { AxiosError } from 'axios';
import { getErrorMessage } from './errors';

function axiosErrorWith(data: unknown): AxiosError {
  const err = new AxiosError('request failed');
  err.response = { data } as unknown as AxiosError['response'];
  return err;
}

describe('getErrorMessage', () => {
  it('usa response.data.message (string) do backend', () => {
    expect(
      getErrorMessage(axiosErrorWith({ message: 'Credenciais inválidas' })),
    ).toBe('Credenciais inválidas');
  });

  it('usa a primeira mensagem de um array (erros de validação)', () => {
    expect(
      getErrorMessage(axiosErrorWith({ message: ['email inválido', 'senha curta'] })),
    ).toBe('email inválido');
  });

  it('cai para err.message quando não há data.message', () => {
    expect(getErrorMessage(new AxiosError('Network Error'))).toBe(
      'Network Error',
    );
  });

  it('usa message de um Error comum', () => {
    expect(getErrorMessage(new Error('boom'))).toBe('boom');
  });

  it('usa o fallback para valores desconhecidos', () => {
    expect(getErrorMessage(null, 'algo deu errado')).toBe('algo deu errado');
    expect(getErrorMessage('x')).toBe('Ocorreu um erro inesperado.');
  });
});
