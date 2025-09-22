import { AppDataSource } from './src/data-source';

AppDataSource.initialize()
  .then(() => console.log('Conectado ao Supabase!'))
  .catch((err) => console.error('Erro na conexão:', err));
