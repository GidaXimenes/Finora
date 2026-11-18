import { Body, Controller, Delete, Get, HttpCode, Patch, Post, Req, Res } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { ApiTags } from '@nestjs/swagger';
import { Throttle } from '@nestjs/throttler';
import { Request, Response } from 'express';
import { CurrentUser } from '../common/decorators/current-user.decorator';
import { Public } from '../common/decorators/public.decorator';
import { AuthUser } from '../common/types';
import { AuthService, Tokens } from './auth.service';
import { DeleteAccountDto, LoginDto, OnboardingDto, RegisterDto } from './dto/auth.dto';

const STRICT = { default: { limit: 10, ttl: 60_000 } };

@ApiTags('auth')
@Controller('auth')
export class AuthController {
  constructor(
    private readonly auth: AuthService,
    private readonly config: ConfigService,
  ) {}

  private cookieBase() {
    return {
      httpOnly: true,
      secure: this.config.get('COOKIE_SECURE') === 'true',
      sameSite: 'lax' as const,
      path: '/',
    };
  }

  private setCookies(res: Response, t: Tokens) {
    res.cookie('access_token', t.accessToken, { ...this.cookieBase(), maxAge: t.accessMaxAgeMs });
    res.cookie('refresh_token', t.refreshToken, { ...this.cookieBase(), maxAge: t.refreshMaxAgeMs });
  }

  private clearCookies(res: Response) {
    res.clearCookie('access_token', this.cookieBase());
    res.clearCookie('refresh_token', this.cookieBase());
  }

  @Public()
  @Throttle(STRICT)
  @Post('register')
  async register(@Body() dto: RegisterDto, @Res({ passthrough: true }) res: Response) {
    const { user, tokens } = await this.auth.register(dto);
    this.setCookies(res, tokens);
    return { user };
  }

  @Public()
  @Throttle(STRICT)
  @HttpCode(200)
  @Post('login')
  async login(@Body() dto: LoginDto, @Res({ passthrough: true }) res: Response) {
    const { user, tokens } = await this.auth.login(dto);
    this.setCookies(res, tokens);
    return { user };
  }

  @Public()
  @HttpCode(200)
  @Post('refresh')
  async refresh(@Req() req: Request, @Res({ passthrough: true }) res: Response) {
    try {
      const { user, tokens } = await this.auth.refresh(req.cookies?.refresh_token);
      this.setCookies(res, tokens);
      return { user };
    } catch (e) {
      this.clearCookies(res);
      throw e;
    }
  }

  @Public()
  @HttpCode(204)
  @Post('logout')
  async logout(@Req() req: Request, @Res({ passthrough: true }) res: Response) {
    await this.auth.logout(req.cookies?.refresh_token);
    this.clearCookies(res);
  }

  @Get('me')
  me(@CurrentUser() user: AuthUser) {
    return this.auth.me(user.id);
  }

  @Patch('me/onboarding')
  onboarding(@CurrentUser() user: AuthUser, @Body() dto: OnboardingDto) {
    return this.auth.setOnboarding(user.id, dto.completed);
  }

  @HttpCode(204)
  @Delete('me')
  async deleteMe(
    @CurrentUser() user: AuthUser,
    @Body() dto: DeleteAccountDto,
    @Res({ passthrough: true }) res: Response,
  ) {
    await this.auth.deleteAccount(user.id, dto);
    this.clearCookies(res);
  }
}
