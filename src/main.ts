import { NestFactory } from '@nestjs/core';
import { AppModule } from './app.module';
import { LogService } from './libs/core/log/log.service';
import { GlobalExceptionFilter } from './libs/core/filter/GlobalExceptionFilter';
import { DocumentBuilder, SwaggerModule } from '@nestjs/swagger';

async function bootstrap() {
  const app = await NestFactory.create(AppModule);
  app.useLogger(new LogService());
  app.useGlobalFilters(new GlobalExceptionFilter());
  app.setGlobalPrefix('/api');

  const config = new DocumentBuilder()
    .setTitle('VanAnime')
    .setDescription('VanAnime API description')
    .setVersion('0.1')
    .build();

  const documentFactory = () => SwaggerModule.createDocument(app, config);
  SwaggerModule.setup('swagger', app, documentFactory);

  const port = process.env.PORT ?? 3000;
  await app.listen(port);
  console.log(`App is running on ${port}`);
}

bootstrap();
