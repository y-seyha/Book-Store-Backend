import { NestFactory } from '@nestjs/core';
import { AppModule } from './app.module';
import {ValidationPipe} from "@nestjs/common";
import cookieParser from 'cookie-parser';
import * as crypto from 'crypto';
(global as any).crypto = crypto;

async function bootstrap() {
  const app = await NestFactory.create(AppModule);

  app.useGlobalPipes(
      new ValidationPipe({
        whitelist: true, // strips unwanted properties
        forbidNonWhitelisted: true,
        transform: true, // converts plain JSON to DTO class
      }),
  );
  app.use(cookieParser());
  await app.listen(process.env.PORT ?? 3000);


}
bootstrap();
