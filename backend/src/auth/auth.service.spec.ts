import { ConflictException, UnauthorizedException } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { JwtService } from '@nestjs/jwt';
import * as bcrypt from 'bcryptjs';
import { PrismaService } from '../prisma/prisma.service';
import { AuthService, hashToken } from './auth.service';

describe('AuthService', () => {
  let prisma: any;
  let service: AuthService;

  beforeEach(() => {
    prisma = {
      user: { findUnique: jest.fn(), create: jest.fn() },
      refreshToken: {
        create: jest.fn().mockResolvedValue({}),
        findUnique: jest.fn(),
        delete: jest.fn(),
        deleteMany: jest.fn(),
      },
    };
    const config = {
      get: jest.fn(),
      getOrThrow: jest.fn().mockReturnValue('segredo-de-teste-1234567890'),
    } as unknown as ConfigService;
    service = new AuthService(prisma as unknown as PrismaService, new JwtService({}), config);
  });

  it('rejeita cadastro com e-mail já existente', async () => {
    prisma.user.findUnique.mockResolvedValue({ id: 'u1' });
    await expect(
      service.register({ name: 'Ana', email: 'ana@example.com', password: '12345678' }),
    ).rejects.toBeInstanceOf(ConflictException);
  });

  it('não expõe o hash da senha e guarda só o hash do refresh token', async () => {
    prisma.user.findUnique.mockResolvedValue(null);
    prisma.user.create.mockResolvedValue({
      id: 'u1',
      name: 'Ana',
      email: 'ana@example.com',
      passwordHash: 'x',
      onboardingCompleted: false,
    });

    const { user, tokens } = await service.register({ name: 'Ana', email: 'ana@example.com', password: '12345678' });

    expect(user).not.toHaveProperty('passwordHash');
    const stored = prisma.refreshToken.create.mock.calls[0][0].data.tokenHash;
    expect(stored).toBe(hashToken(tokens.refreshToken));
    expect(stored).not.toBe(tokens.refreshToken);
  });

  it('login falha com senha errada', async () => {
    prisma.user.findUnique.mockResolvedValue({
      id: 'u1',
      email: 'ana@example.com',
      passwordHash: bcrypt.hashSync('correta123', 4),
    });
    await expect(service.login({ email: 'ana@example.com', password: 'errada' })).rejects.toBeInstanceOf(
      UnauthorizedException,
    );
  });

  it('login funciona com a senha certa', async () => {
    prisma.user.findUnique.mockResolvedValue({
      id: 'u1',
      name: 'Ana',
      email: 'ana@example.com',
      onboardingCompleted: false,
      passwordHash: bcrypt.hashSync('correta123', 4),
    });
    const { tokens } = await service.login({ email: 'ana@example.com', password: 'correta123' });
    expect(tokens.accessToken.split('.')).toHaveLength(3);
  });

  it('refresh token é de uso único (rotação)', async () => {
    prisma.refreshToken.findUnique.mockResolvedValue({
      id: 'rt1',
      expiresAt: new Date(Date.now() + 60_000),
      user: { id: 'u1', name: 'Ana', email: 'ana@example.com', onboardingCompleted: true },
    });
    await service.refresh('token-antigo');
    expect(prisma.refreshToken.delete).toHaveBeenCalledWith({ where: { id: 'rt1' } });
  });

  it('refresh rejeita token desconhecido', async () => {
    prisma.refreshToken.findUnique.mockResolvedValue(null);
    await expect(service.refresh('qualquer')).rejects.toBeInstanceOf(UnauthorizedException);
  });
});
