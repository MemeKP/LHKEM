import { NestFactory } from "@nestjs/core";
import { AppModule } from "src/app.module";
import { CommunitySeeder } from "src/seeder/seed";

async function bootstrap() {
  const app = await NestFactory.createApplicationContext(AppModule);

  const communitySeeder = app.get(CommunitySeeder);
  await communitySeeder.seed();

  await app.close();
}
bootstrap();


