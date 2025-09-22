import { ConfigService } from '@nestjs/config';
import { TypeOrmModuleOptions } from '@nestjs/typeorm';
import { join } from 'path';

export const typeOrmConfig = async (
  configService: ConfigService,
): Promise<TypeOrmModuleOptions> => {
  const isProduction = configService.get('NODE_ENV') === 'production';
  
  // MongoDB configuration for all environments
  return {
    type: 'mongodb',
    url: configService.get('MONGODB_URI'),
    entities: [join(__dirname, '/../**/*.entity{.ts,.js}')],
    synchronize: false, // Temporarily disabled to avoid index conflicts
    logging: !isProduction, // Only log in development
  };
};