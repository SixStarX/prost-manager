import { SetMetadata } from '@nestjs/common';

/** Marca uma rota (ou controller inteiro) como acessível sem autenticação. */
export const IS_PUBLIC_KEY = 'isPublic';
export const Public = () => SetMetadata(IS_PUBLIC_KEY, true);
