import { ConflictException, Injectable, UnauthorizedException } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { JwtService } from '@nestjs/jwt';
import * as bcrypt from 'bcryptjs';
import { createHash, randomBytes } from 'crypto';
import { PrismaService } from '../prisma/prisma.service';
import { DeleteAccountDto, LoginDto, RegisterDto } from './dto/auth.dto';

export interface Tokens {
  accessToken: string;
  refreshToken: string;
  accessMaxAgeMs: number;
  refreshMaxAgeMs: number;
}

interface UserRow {
  id: string;
  name: string;
  email: string;
  onboardingCompleted: boolean;
}

export const hashToken = (token: string) => createHash('sha256').update(token).digest('hex');

@Injectable()
export class AuthService {
  constructor(
    private readonly prisma: PrismaService,
    private readonly jwt: JwtService,
    private readonly config: ConfigService,
  ) {}

  private publicUser(u: UserRow) {
    return { id: u.id, name: u.name, email: u.email, onboardingCompleted: u.onboardingCompleted };
  }

  async register(dto: RegisterDto) {
    const exists = await this.prisma.user.findUnique({ where: { email: dto.email } });
    if (exists) throw new ConflictException('Este e-mail já está cadastrado');

    const passwordHash = await bcrypt.hash(dto.password, 12);
    const user = await this.prisma.user.create({
      data: { name: dto.name.trim(), email: dto.email, passwordHash },
    });
    return { user: this.publicUser(user), tokens: await this.issueTokens(user) };
  }

  async login(dto: LoginDto) {
    const user = await this.prisma.user.findUnique({ where: { email: dto.email } });
    const valid = user ? await bcrypt.compare(dto.password, user.passwordHash) : false;
    if (!user || !valid) throw new UnauthorizedException('E-mail ou senha inválidos');
    return { user: this.publicUser(user), tokens: await this.issueTokens(user) };
  }

  /** Rotação de refresh token: cada token só pode ser usado uma vez. */
  async refresh(rawToken?: string) {
    if (!rawToken) throw new UnauthorizedException('Sessão expirada');
    const record = await this.prisma.refreshToken.findUnique({
      where: { tokenHash: hashToken(rawToken) },
      include: { user: true },
    });
    if (!record) throw new UnauthorizedException('Sessão expirada');

    await this.prisma.refreshToken.delete({ where: { id: record.id } });
    if (record.expiresAt < new Date()) throw new UnauthorizedException('Sessão expirada');

    await this.prisma.refreshToken.deleteMany({ where: { expiresAt: { lt: new Date() } } });
    return { user: this.publicUser(record.user), tokens: await this.issueTokens(record.user) };
  }

  async logout(rawToken?: string) {
    if (!rawToken) return;
    await this.prisma.refreshToken.deleteMany({ where: { tokenHash: hashToken(rawToken) } });
  }

  async me(userId: string) {
    const user = await this.prisma.user.findUnique({ where: { id: userId } });
    if (!user) throw new UnauthorizedException();
    return this.publicUser(user);
  }

  async setOnboarding(userId: string, completed: boolean) {
    const user = await this.prisma.user.update({
      where: { id: userId },
      data: { onboardingCompleted: completed },
    });
    return this.publicUser(user);
  }

  /** Exclusão de conta e de todos os dados (LGPD). Cascata definida no schema. */
  async deleteAccount(userId: string, dto: DeleteAccountDto) {
    const user = await this.prisma.user.findUnique({ where: { id: userId } });
    if (!user) throw new UnauthorizedException();
    if (!(await bcrypt.compare(dto.password, user.passwordHash))) {
      throw new UnauthorizedException('Senha incorreta');
    }
    await this.prisma.user.delete({ where: { id: userId } });
  }

  private async issueTokens(user: { id: string; email: string }): Promise<Tokens> {
    const accessMin = Number(this.config.get('ACCESS_TOKEN_TTL_MIN') ?? 15);
    const refreshDays = Number(this.config.get('REFRESH_TOKEN_TTL_DAYS') ?? 7);

    const accessToken = await this.jwt.signAsync(
      { sub: user.id, email: user.email },
      { secret: this.config.getOrThrow<string>('JWT_ACCESS_SECRET'), expiresIn: `${accessMin}m` },
    );

    const refreshToken = randomBytes(48).toString('hex');
    const refreshMaxAgeMs = refreshDays * 24 * 60 * 60 * 1000;
    await this.prisma.refreshToken.create({
      data: {
        userId: user.id,
        tokenHash: hashToken(refreshToken),
        expiresAt: new Date(Date.now() + refreshMaxAgeMs),
      },
    });

    return { accessToken, refreshToken, accessMaxAgeMs: accessMin * 60 * 1000, refreshMaxAgeMs };
  }
}
