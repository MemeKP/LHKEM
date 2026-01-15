import { NestFactory } from '@nestjs/core';
import { ValidationPipe } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { AppModule } from './app.module';

async function bootstrap() {
  const app = await NestFactory.create(AppModule);
  
  app.enableCors({
    origin: ['http://localhost:5173', process.env.FRONTEND_URL],
    credentials: true,
  });
  app.useGlobalPipes(new ValidationPipe())
  console.log(app.getHttpServer());

  const config = app.get(ConfigService);
  const port = Number(config.get('PORT')) || 3000;
  await app.listen(port);
}
bootstrap();
