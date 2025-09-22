import { DataSource } from 'typeorm';
import { ConfigService } from '@nestjs/config';

// For MongoDB Atlas deployment
const configService = new ConfigService();

export const AppDataSource = new DataSource({
  type: 'mongodb',
  url: process.env.MONGODB_URI || 'mongodb://localhost:27017/career_counseling',
  entities: [__dirname + '/../**/*.entity{.ts,.js}'],
  synchronize: true, // Be careful with this in production
  logging: false,
});

export default AppDataSource;