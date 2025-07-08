import { ValidationPipe } from '@nestjs/common';
import { NestFactory } from '@nestjs/core';
import { AppModule } from './app.module';

async function bootstrap() {
  const app = await NestFactory.create(AppModule);

  app.useGlobalPipes(new ValidationPipe({ whitelist: true }));

  // Enable CORS for production deployment
  app.enableCors({
    origin: [
      'http://localhost:3000', // Local development
      /\.vercel\.app$/, // Any Vercel domain
    ],
    credentials: true,
  });

  const port = process.env.PORT || 3600;
  await app.listen(port);
  console.log(`🚀 Application is running on port ${port}`);
}
bootstrap();
