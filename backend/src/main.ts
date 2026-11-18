import { NestFactory } from '@nestjs/core';
import { NestExpressApplication } from '@nestjs/platform-express';
import { DocumentBuilder, SwaggerModule } from '@nestjs/swagger';
import { AppModule } from './app.module';
import { configureApp } from './app.setup';

async function bootstrap() {
  const app = await NestFactory.create<NestExpressApplication>(AppModule);
  configureApp(app);

  const doc = new DocumentBuilder()
    .setTitle('Finora API')
    .setDescription('API do Finora - controle financeiro pessoal')
    .setVersion('1.0')
    .addCookieAuth('access_token')
    .addBearerAuth()
    .build();
  SwaggerModule.setup('docs', app, SwaggerModule.createDocument(app, doc));

  const port = Number(process.env.PORT ?? 3001);
  await app.listen(port);
  console.log(`API em http://localhost:${port}  |  Docs em http://localhost:${port}/docs`);
}

bootstrap();
