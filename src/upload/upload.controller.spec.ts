import { Test, TestingModule } from '@nestjs/testing';
import { UploadController } from './upload.controller';
import { UploadService } from './upload.service';
import { BadRequestException } from '@nestjs/common';

describe('UploadController', () => {
  let controller: UploadController;
  let uploadService: jest.Mocked<UploadService>;

  const mockFiles: Express.Multer.File[] = [
    {
      fieldname: 'files',
      originalname: 'image1.jpg',
      encoding: '7bit',
      mimetype: 'image/jpeg',
      size: 1000,
      buffer: Buffer.from(''),
      destination: '',
      filename: '',
      path: '',
      stream: null as any,
    },
  ];

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      controllers: [UploadController],
      providers: [
        {
          provide: UploadService,
          useValue: {
            uploadImage: jest.fn(),
            deleteImage: jest.fn(),
          },
        },
      ],
    }).compile();

    controller = module.get<UploadController>(UploadController);
    uploadService = module.get(UploadService);
  });

  it('should be defined', () => {
    expect(controller).toBeDefined();
  });

  it('should upload multiple images successfully', async () => {
    const uploaded = [
      {
        name: 'image1.jpg',
        path: '/uploads/image1.jpg',
        url: 'http://url/image1.jpg',
      },
    ];

    uploadService.uploadImage.mockResolvedValue(uploaded);

    const result = await controller.uploadMultiple(mockFiles);

    expect(uploadService.uploadImage).toHaveBeenCalledWith(mockFiles, 'public');
    expect(result).toEqual({
      message: 'Uploads de imagens realizados com sucesso!',
      files: uploaded,
    });
  });

  it('should throw BadRequestException if no files provided', async () => {
    await expect(controller.uploadMultiple([])).rejects.toThrow(
      new BadRequestException('Nenhuma imagem selecionada'),
    );
  });

  it('should throw BadRequestException if files is undefined', async () => {
    await expect(controller.uploadMultiple(undefined as any)).rejects.toThrow(
      new BadRequestException('Nenhuma imagem selecionada'),
    );
  });

  it('should delete a file successfully', async () => {
    uploadService.deleteImage.mockResolvedValue(undefined as any);

    const result = await controller.deleteFile('/uploads/image1.jpg');

    expect(uploadService.deleteImage).toHaveBeenCalledWith(
      '/uploads/image1.jpg',
    );
    expect(result).toEqual({ message: 'Imagem deletada com sucesso!' });
  });

  it('should throw BadRequestException if path is missing', async () => {
    await expect(controller.deleteFile('')).rejects.toThrow(
      new BadRequestException('path é obrigatório'),
    );
  });
});
