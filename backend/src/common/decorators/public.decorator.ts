import { SetMetadata } from '@nestjs/common';

export const IS_PUBLIC_KEY = 'isPublic';
/** Marca uma rota como pública. Todas as demais exigem autenticação (RNF02). */
export const Public = () => SetMetadata(IS_PUBLIC_KEY, true);
