import { INestApplication, ValidationPipe } from '@nestjs/common';
import { NestExpressApplication } from '@nestjs/platform-express';
import cookieParser from 'cookie-parser';
import helmet from 'helmet';

/** Configuração compartilhada entre main.ts e os testes e2e. */
export function configureApp(app: INestApplication) {
  // A API só devolve JSON; CSP desativada para não quebrar o Swagger UI.
  app.use(helmet({ contentSecurityPolicy: false }));
  app.use(cookieParser());
  app.enableCors({
    origin: process.env.FRONTEND_URL ?? 'http://localhost:3000',
    credentials: true,
  });
  app.useGlobalPipes(
    new ValidationPipe({ whitelist: true, forbidNonWhitelisted: true, transform: true }),
  );
  // Atrás do proxy do Next.js/Docker, usa o IP real do cliente no rate limit.
  (app as NestExpressApplication).set('trust proxy', 1);
}
