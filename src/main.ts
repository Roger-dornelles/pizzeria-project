import { NestFactory } from '@nestjs/core';
import { AppModule } from './app.module';
import { ValidationExceptionPipe } from './validation-exception.pipe';

async function bootstrap() {
  const app = await NestFactory.create(AppModule);
  app.useGlobalPipes(new ValidationExceptionPipe());
  const port = process.env.PORT || 3000;
  await app.listen(port, '0.0.0.0');
}
bootstrap();
