import { TypeOrmModuleOptions } from '@nestjs/typeorm';

export const databaseConfig = (): TypeOrmModuleOptions => ({
  type: 'postgres',
  host: process.env.DB_HOST || 'localhost',
  //   port: parseInt(process.env.DB_PORT, 10) || 5432,
  port: parseInt(process.env.DB_PORT || '5432', 10),
  username: process.env.DB_USERNAME || 'postgres',
  password: process.env.DB_PASSWORD || 'postgres',
  database: process.env.DB_NAME || 'medical_app',
  entities: [__dirname + '/../**/*.entity{.ts,.js}'],
  synchronize: false, // We'll use migrations
  logging: process.env.NODE_ENV === 'development',
});
