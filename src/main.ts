// import { NestFactory } from '@nestjs/core';
// import { ValidationPipe } from '@nestjs/common';
// import { SwaggerModule, DocumentBuilder } from '@nestjs/swagger';
// import { AppModule } from './app.module';
// import { SnakeCaseInterceptor } from './common/interceptors/snake-case.interceptor';
// import { createAdminUser } from './database/seeders/admin.seeder';
// import { seedAppointmentTypes } from './database/seeders/appointment-types.seeder';
// import { seedBillableItems } from './database/seeders/billable-items.seeder';

// async function bootstrap() {
//   const app = await NestFactory.create(AppModule);

//   // Global prefix
//   app.setGlobalPrefix('api/v1');

//   // CORS
//   app.enableCors({
//     origin: process.env.CORS_ORIGIN || 'http://localhost:5173',
//     credentials: true,
//   });

//   // Global validation pipe
//   app.useGlobalPipes(
//     new ValidationPipe({
//       whitelist: true,
//       forbidNonWhitelisted: true,
//       transform: true,
//     }),
//   );

//   // Global interceptor for snake_case
//   app.useGlobalInterceptors(new SnakeCaseInterceptor());

//   // Swagger documentation
//   const config = new DocumentBuilder()
//     .setTitle('MedAgenda API')
//     .setDescription('Medical appointment system API')
//     .setVersion('1.0')
//     .addBearerAuth()
//     .build();
//   const document = SwaggerModule.createDocument(app, config);
//   SwaggerModule.setup('docs', app, document);

//   // Seeders
//   await createAdminUser(app);
//   await seedAppointmentTypes(app);
//   await seedBillableItems(app);

//   const port = process.env.PORT || 3000;
//   await app.listen(port);
//   console.log(`🚀 Server running on http://localhost:${port}`);
//   console.log(`📚 API docs: http://localhost:${port}/docs`);
// }
// bootstrap();
import { NestFactory } from '@nestjs/core';
import { ValidationPipe } from '@nestjs/common';
import { SwaggerModule, DocumentBuilder } from '@nestjs/swagger';
import { AppModule } from './app.module';
import { SnakeCaseInterceptor } from './common/interceptors/snake-case.interceptor';
import { createAdminUser } from './database/seeders/admin.seeder';
import { seedAppointmentTypes } from './database/seeders/appointment-types.seeder';
import { seedBillableItems } from './database/seeders/billable-items.seeder';
import { api_prefix } from './config/globalVar';

async function bootstrap() {
  const app = await NestFactory.create(AppModule);

  // Global prefix
  app.setGlobalPrefix(process.env.API_PREFIX || api_prefix || 'api/v1');

  // CORS - Important pour le frontend React
  app.enableCors({
    // origin: process.env.CORS_ORIGIN || 'http://localhost:5173', // Vite default port
    origin: '*',
    credentials: true,
    methods: ['GET', 'POST', 'PUT', 'PATCH', 'DELETE', 'OPTIONS'],
    allowedHeaders: ['Content-Type', 'Authorization'],
  });

  // Global validation pipe
  app.useGlobalPipes(
    new ValidationPipe({
      whitelist: true,
      forbidNonWhitelisted: true,
      transform: true,
    }),
  );

  // Global interceptor for snake_case
  app.useGlobalInterceptors(new SnakeCaseInterceptor());

  // Swagger documentation
  const config = new DocumentBuilder()
    .setTitle('MedAgenda API')
    .setDescription('Medical appointment system API')
    .setVersion('1.0')
    .addBearerAuth()
    .build();
  const document = SwaggerModule.createDocument(app, config);
  SwaggerModule.setup('docs', app, document);

  // Seeders - Desactivés pour privilégier l'assistant de configuration wizard
  // await createAdminUser(app);
  // await seedAppointmentTypes(app);
  // await seedBillableItems(app);

  const port = process.env.PORT || 3000;
  await app.listen(port);
  console.log(`🚀 Server running on http://localhost:${port}`);
  console.log(`📚 API docs: http://localhost:${port}/docs`);
  console.log(
    `🔌 CORS enabled for: ${process.env.CORS_ORIGIN || 'http://localhost:5173'}`,
  );
}
bootstrap();
