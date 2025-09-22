// import { DataSource } from 'typeorm';

// export const AppDataSource = new DataSource({
//   type: 'postgres',
//   host: process.env.SUPABASE_HOST,
//   port: parseInt(process.env.SUPABASE_PORT!, 10),
//   username: process.env.SUPABASE_USERNAME,
//   password: process.env.SUPABASE_PASSWORD,
//   database: process.env.SUPABASE_DATABASE,
//   ssl: {
//     rejectUnauthorized: false, // necessário para Supabase
//   },
//   entities: [__dirname + '/**/*.entity{.ts,.js}'],
//   migrations: [__dirname + '/migrations/*{.ts,.js}'],
//   synchronize: false, // nunca usar true em produção
// });

import { DataSource } from 'typeorm';
import path from 'path';
import 'dotenv/config';

export const AppDataSource = new DataSource({
  type: 'postgres',
  host: process.env.SUPABASE_HOST,
  port: parseInt(process.env.SUPABASE_PORT || '5432', 10),
  username: process.env.SUPABASE_USERNAME,
  password: process.env.SUPABASE_PASSWORD,
  database: process.env.SUPABASE_DATABASE,
  ssl: {
    rejectUnauthorized: false, //  ignora o certificado autoassinado
  },
  extra: {
    ssl: {
      rejectUnauthorized: false, // necessário para CLI e ts-node
    },
  },
  entities: [path.join(__dirname, '/**/*.entity{.ts,.js}')],
  migrations: [path.join(__dirname, '/migrations/*{.ts,.js}')],
  synchronize: false,
});
