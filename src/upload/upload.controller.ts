import {
  Controller,
  Post,
  Delete,
  UploadedFile,
  UploadedFiles,
  UseInterceptors,
  Body,
  BadRequestException,
} from '@nestjs/common';
import { FileInterceptor, FilesInterceptor } from '@nestjs/platform-express';
import { multerConfig } from './multer.config';
import { UploadService } from './upload.service';

@Controller('upload')
export class UploadController {
  constructor(private readonly uploadService: UploadService) {}

  @Post('multiple')
  @UseInterceptors(FilesInterceptor('files', 10, multerConfig))
  async uploadMultiple(@UploadedFiles() files: Express.Multer.File[]) {
    if (!files || files.length === 0) {
      throw new BadRequestException('Nenhuma imagem selecionada');
    }

    const uploaded = await this.uploadService.uploadImage(files, 'public');

    return {
      message: 'Uploads de imagens realizados com sucesso!',
      files: uploaded,
    };
  }

  @Delete()
  async deleteFile(@Body('path') path: string) {
    if (!path) throw new BadRequestException('path é obrigatório');
    await this.uploadService.deleteImage(path);
    return { message: 'Imagem deletada com sucesso!' };
  }
}
