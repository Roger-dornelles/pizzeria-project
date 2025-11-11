import { Test, TestingModule } from '@nestjs/testing';
import { UploadService } from './upload.service';
import { NotFoundException } from '@nestjs/common';
import * as storageClient from 'src/storage/storage.client';

describe('UploadService', () => {
  let service: UploadService;

  const mockFiles: Express.Multer.File[] = [
    {
      fieldname: 'files',
      originalname: 'test-image.jpg',
      encoding: '7bit',
      mimetype: 'image/jpeg',
      size: 12345,
      buffer: Buffer.from('fake-image'),
      destination: '',
      filename: '',
      path: '',
      stream: null as any,
    },
  ];

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [UploadService],
    }).compile();

    service = module.get<UploadService>(UploadService);
  });

  afterEach(() => {
    jest.restoreAllMocks();
  });

  it('should upload image successfully', async () => {
    const mockResponse = [
      {
        name: 'test-image.jpg',
        path: '/uploads/test-image.jpg',
        url: 'https://example.com/test-image.jpg',
      },
    ];

    const uploadSpy = jest
      .spyOn(storageClient, 'uploadFileToSupabase')
      .mockResolvedValue(mockResponse);

    const result = await service.uploadImage(mockFiles, 'public');

    expect(uploadSpy).toHaveBeenCalledWith(
      mockFiles,
      process.env.STORAGE_BUCKET,
      'public',
    );
    expect(result).toEqual(mockResponse);
  });

  it('should throw NotFoundException when no files are provided', async () => {
    await expect(service.uploadImage(undefined as any)).rejects.toThrow(
      new NotFoundException('Selecione uma ou mais imagem'),
    );
  });

  it('should propagate error from Supabase upload', async () => {
    jest
      .spyOn(storageClient, 'uploadFileToSupabase')
      .mockRejectedValue(new Error('Erro no upload'));

    await expect(service.uploadImage(mockFiles, 'public')).rejects.toThrow(
      'Erro no upload',
    );
  });

  it('should delete image successfully', async () => {
    const deleteSpy = jest
      .spyOn(storageClient, 'deleteFileFromSupabase')
      .mockResolvedValue('OK' as any);

    const result = await service.deleteImage('/uploads/test-image.jpg');

    expect(deleteSpy).toHaveBeenCalledWith(
      '/uploads/test-image.jpg',
      process.env.STORAGE_BUCKET,
    );
    expect(result).toBe('OK');
  });

  it('should propagate error from Supabase delete', async () => {
    jest
      .spyOn(storageClient, 'deleteFileFromSupabase')
      .mockRejectedValue(new Error('Erro ao deletar'));

    await expect(
      service.deleteImage('/uploads/test-image.jpg'),
    ).rejects.toThrow('Erro ao deletar');
  });
});
