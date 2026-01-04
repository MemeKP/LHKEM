import { NestFactory } from '@nestjs/core';
import { ValidationPipe } from '@nestjs/common';
import { AppModule } from './app.module';

async function bootstrap() {
  const app = await NestFactory.create(AppModule);
  app.useGlobalPipes(new ValidationPipe())
  console.log(app.getHttpServer());

  const port = Number(process.env.PORT) || 3300;
  await app.listen(port);
}
bootstrap();
