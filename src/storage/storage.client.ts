import { createClient } from '@supabase/supabase-js';
import 'dotenv/config';

const supabaseUrl = process.env.DATABASE_URL;
const supabaseKey = process.env.STORAGE_KEY;

type UrlsProps = {
  name: string;
  path: string;
  url: string;
};

if (!supabaseUrl || !supabaseKey) {
  throw new Error('SUPABASE_URL ou SUPABASE_KEY não configuradas no .env');
}

export const supabase = createClient(supabaseUrl, supabaseKey);

/**
 * Faz upload de múltiplos arquivos para o Supabase Storage.
 * Retorna um array de objetos com { name, path, url }
 */
export async function uploadFileToSupabase(
  files: Express.Multer.File[],
  bucket: string = process.env.STORAGE_BUCKET || 'uploads',
  folder?: string,
): Promise<UrlsProps[]> {
  if (!files || files.length === 0) {
    throw new Error('Nenhum arquivo enviado');
  }

  const { v4: uuid } = await import('uuid');

  // Faz upload de todos os arquivos em paralelo
  const uploadResults = await Promise.all(
    files.map(async (file) => {
      const ext = file.originalname.split('.').pop() ?? '';
      const fileName = `${uuid()}.${ext}`;
      const filePath = folder ? `${folder}/${fileName}` : fileName;

      const { error } = await supabase.storage
        .from(bucket)
        .upload(filePath, file.buffer, {
          contentType: file.mimetype,
          cacheControl: '3600',
          upsert: false,
        });

      if (error) throw new Error(`Erro no upload: ${error.message}`);

      const { data } = supabase.storage.from(bucket).getPublicUrl(filePath);

      return {
        name: fileName,
        path: filePath,
        url: data.publicUrl,
      };
    }),
  );

  return uploadResults; // array com todos os arquivos enviados
}

/**
 * Deleta um arquivo do Supabase Storage pelo caminho
 */
export async function deleteFileFromSupabase(
  path: string,
  bucket: string = process.env.STORAGE_BUCKET || 'uploads',
): Promise<boolean> {
  const { error } = await supabase.storage.from(bucket).remove([path]);
  if (error) throw new Error(`Erro ao deletar: ${error.message}`);
  return true;
}
