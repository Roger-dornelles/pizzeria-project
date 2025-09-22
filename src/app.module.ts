// src/app.module.ts
import { Module } from '@nestjs/common';
import { ConfigModule, ConfigService } from '@nestjs/config';
import { TypeOrmModule } from '@nestjs/typeorm';

import { UsersModule } from './users/users.module';
import { ProductsModule } from './products/products.module';
import { AuthModule } from './auth/auth.module';

@Module({
  imports: [
    // Configura variáveis de ambiente
    ConfigModule.forRoot({ isGlobal: true }),

    // Configura conexão com o banco de dados
    TypeOrmModule.forRootAsync({
      imports: [ConfigModule],
      useFactory: (config: ConfigService) => ({
        type: 'postgres',
        host: process.env.SUPABASE_HOST,
        port: parseInt(process.env.SUPABASE_PORT || '5432', 10),
        username: process.env.SUPABASE_USERNAME,
        password: process.env.SUPABASE_PASSWORD,
        database: process.env.SUPABASE_DATABASE,
        entities: [__dirname + '/**/*.entity{.ts,.js}'],
        synchronize: true, // só usar true em desenvolvimento
      }),
      inject: [ConfigService],
    }),

    // Importa módulos específicos da aplicação
    UsersModule,
    ProductsModule,
    AuthModule,
  ],
})
export class AppModule {}
