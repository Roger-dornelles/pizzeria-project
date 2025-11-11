import { Injectable, NotFoundException } from '@nestjs/common';
import {
  uploadFileToSupabase,
  deleteFileFromSupabase,
} from 'src/storage/storage.client';

@Injectable()
export class UploadService {
  async uploadImage(files: Express.Multer.File[], folder?: string) {
    if (!files) {
      throw new NotFoundException('Selecione uma ou mais imagem');
    }

    const data = await uploadFileToSupabase(
      files,
      process.env.STORAGE_BUCKET,
      folder,
    );

    return data;
  }

  async deleteImage(path: string) {
    return deleteFileFromSupabase(path, process.env.STORAGE_BUCKET);
  }
}
