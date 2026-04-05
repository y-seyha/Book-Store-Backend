import { NestFactory } from '@nestjs/core';
import { AppModule } from './app.module';
import {ValidationPipe} from "@nestjs/common";
import cookieParser from 'cookie-parser';
import {DocumentBuilder, SwaggerModule} from "@nestjs/swagger";
import {AuthGuard} from "@nestjs/passport";
import {ThrottlerGuard} from "@nestjs/throttler";

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

    const config = new DocumentBuilder()
        .setTitle('Bookstore API')
        .setDescription('API documentation for Bookstore E-commerce')
        .setVersion('1.0')                               // API version
        .addBearerAuth({ type: 'http', scheme: 'bearer', bearerFormat: 'JWT' })
        .build();

    const document = SwaggerModule.createDocument(app, config);
    SwaggerModule.setup('api', app, document);

  await app.listen(process.env.PORT ?? 3000);


}
bootstrap();
