import { ValidationPipe } from '@nestjs/common';
import { NestFactory } from '@nestjs/core';
import { AppModule } from './app.module';

async function bootstrap() {
  const app = await NestFactory.create(AppModule);

    // Enable global validation
   // app.useGlobalPipes(new ValidationPipe());

  // Set a higher timeout (e.g., 60 seconds)
  app.use((req, res, next) => {
    res.setTimeout(60000); // 60 seconds
    next();
  });

  // Configure CORS globally
  app.enableCors({
    origin: '*', // Replace with your frontend URL
    methods: ['GET', 'HEAD', 'PUT', 'PATCH', 'POST', 'DELETE'],
    credentials: true,
  });

  await app.listen(4000);
}
bootstrap();
