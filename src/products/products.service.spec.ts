import { Test, TestingModule } from '@nestjs/testing';
import { ProductsService } from './products.service';
import { getRepositoryToken } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Product } from './entities/product.entity';
import { UploadService } from 'src/upload/upload.service';
import { UnauthorizedException } from '@nestjs/common';

describe('ProductsService', () => {
  let service: ProductsService;
  let productRepository: jest.Mocked<Repository<Product>>;
  let uploadService: jest.Mocked<UploadService>;

  const mockProduct: Product = {
    id: 1,
    userId: 1,
    nameProduct: 'Pizza Calabresa',
    valueProduct: 'R$ 30,00',
    descriptionProduct: 'Pizza calabresa e queijo',
    files: [],
    createdAt: new Date(),
  };

  const createProductDto = {
    userId: '1',
    nameProduct: 'Pizza Calabresa',
    valueProduct: '30',
    descriptionProduct: 'Pizza calabresa e queijo',
  };

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        ProductsService,
        {
          provide: getRepositoryToken(Product),
          useValue: {
            findOne: jest.fn(),
            findOneBy: jest.fn(),
            find: jest.fn(),
            create: jest.fn(),
            save: jest.fn(),
            delete: jest.fn(),
          },
        },
        {
          provide: UploadService,
          useValue: {
            uploadImage: jest.fn(),
          },
        },
      ],
    }).compile();

    service = module.get<ProductsService>(ProductsService);
    productRepository = module.get(getRepositoryToken(Product));
    uploadService = module.get(UploadService);
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });

  it('should create a product successfully', async () => {
    productRepository.findOne.mockResolvedValue(null);
    uploadService.uploadImage.mockResolvedValue([
      {
        name: 'pizza.jpg',
        path: '/uploads/pizza.jpg',
        url: 'http://url/pizza.jpg',
      },
    ]);

    const createdProduct = { ...mockProduct };
    productRepository.create.mockReturnValue(createdProduct as Product);
    productRepository.save.mockResolvedValue(createdProduct);

    const result = await service.createProducts(createProductDto, []);

    expect(productRepository.findOne).toHaveBeenCalledWith({
      where: { nameProduct: createProductDto.nameProduct },
    });
    expect(uploadService.uploadImage).toHaveBeenCalled();
    expect(productRepository.create).toHaveBeenCalled();
    expect(result).toEqual(createdProduct);
  });

  it('should throw UnauthorizedException if userId is missing', async () => {
    await expect(
      service.createProducts({ ...createProductDto, userId: '' }, []),
    ).rejects.toThrow(UnauthorizedException);
  });

  it('should throw UnauthorizedException if product name already exists', async () => {
    productRepository.findOne.mockResolvedValue(mockProduct);

    await expect(service.createProducts(createProductDto, [])).rejects.toThrow(
      'Produto já cadastrado com este nome',
    );
  });

  it('should update product successfully', async () => {
    productRepository.findOneBy.mockResolvedValue(mockProduct);
    productRepository.save.mockResolvedValue({
      ...mockProduct,
      nameProduct: 'Pizza Queijo',
    });

    const dto = { nameProduct: 'Pizza Queijo', valueProduct: '35' };
    const result = await service.updateOneProductFromId(
      mockProduct.id,
      dto,
      mockProduct.userId,
    );

    expect(productRepository.findOneBy).toHaveBeenCalledWith({
      id: mockProduct.id,
    });
    expect(productRepository.save).toHaveBeenCalled();
    expect(result.nameProduct).toBe('Pizza Queijo');
  });

  it('should throw UnauthorizedException if userId is missing on update', async () => {
    await expect(
      service.updateOneProductFromId(mockProduct.id, {}, null as any),
    ).rejects.toThrow(UnauthorizedException);
  });

  it('should throw NotFoundException if id is missing', async () => {
    await expect(
      service.updateOneProductFromId(null as any, {}, 1),
    ).rejects.toThrow('Produto não encontrado');
  });

  it('should throw NotFoundException if product not found on update', async () => {
    productRepository.findOneBy.mockResolvedValue(null);

    await expect(service.updateOneProductFromId(99, {}, 1)).rejects.toThrow(
      'Produto não encontrado.',
    );
  });

  it('should return all products by user', async () => {
    productRepository.find.mockResolvedValue([mockProduct]);

    const result = await service.findAllProducts(1);

    expect(productRepository.find).toHaveBeenCalledWith({
      where: { userId: 1 },
    });
    expect(result).toEqual([mockProduct]);
  });

  it('should delete a product successfully', async () => {
    productRepository.delete.mockResolvedValue({ affected: 1 } as any);

    const result = await service.deleteOneProductFromId(1);

    expect(productRepository.delete).toHaveBeenCalledWith(1);
    expect(result).toEqual({ message: 'Produto excluido com sucesso.' });
  });

  it('should throw NotFoundException if id is missing on delete', async () => {
    await expect(service.deleteOneProductFromId(null as any)).rejects.toThrow(
      'Produto não encontrado',
    );
  });

  it('should throw NotFoundException if delete fails', async () => {
    productRepository.delete.mockResolvedValue(null as any);

    await expect(service.deleteOneProductFromId(1)).rejects.toThrow(
      'Produto não cadastrado',
    );
  });
});
