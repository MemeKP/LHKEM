import { NestFactory } from '@nestjs/core';
import { ValidationPipe } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { AppModule } from './app.module';

async function bootstrap() {
  const app = await NestFactory.create(AppModule);
  
  app.enableCors({
    origin: ['http://localhost:5173', process.env.FRONTEND_URL,
      'http://10.124.4.80:5173',
      'http://172.21.112.1:5173',
      'http://192.168.172.1:5173',
      'http://10.124.4.149:5173'
    ],

    credentials: true,
  });
  app.useGlobalPipes(new ValidationPipe({
    whitelist: false,
    transform: true, // ให้ @Transform ใน dto ทำงาน
    transformOptions: { enableImplicitConversion: true },
  }))
  // console.log(app.getHttpServer());

  const config = app.get(ConfigService);
  const port = Number(config.get('PORT')) || 3000;
  await app.listen(port, '0.0.0.0');
}
bootstrap();
