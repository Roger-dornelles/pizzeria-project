import { Test, TestingModule } from '@nestjs/testing';
import { ProductsController } from './products.controller';
import { ProductsService } from './products.service';
import { JwtAuthGuard } from 'src/auth/jwt-auth.guard';
import { ProductDto } from './dto/product.dto';
import { UpdateProductDto } from './dto/update-product.dto';
import { NotFoundException } from '@nestjs/common';
import { Product } from './entities/product.entity';

describe('ProductsController', () => {
  let controller: ProductsController;
  let productsService: jest.Mocked<ProductsService>;

  const userId = 1;

  const mockProduct = {
    id: 1,
    nameProduct: 'Pizza Calabresa',
    valueProduct: '30',
    descriptionProduct: 'Deliciosa pizza com calabresa e queijo',
    files: [],
    userId,
    createdAt: new Date(),
  };

  const mockRequest = {
    user: {
      id: 1,
      userId,
    },
  };

  const dto: ProductDto = {
    userId: String(userId),
    nameProduct: 'Pizza Calabresa',
    valueProduct: '30',
    descriptionProduct: 'Pizza deliciosa',
  };

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      controllers: [ProductsController],
      providers: [
        {
          provide: ProductsService,
          useValue: {
            createProducts: jest.fn(),
            updateOneProductFromId: jest.fn(),
            findAllProducts: jest.fn(),
            deleteOneProductFromId: jest.fn(),
          },
        },
      ],
    })

      .overrideGuard(JwtAuthGuard) // desabilita autenticação
      .useValue({ canActivate: jest.fn(() => true) })
      .compile();

    controller = module.get<ProductsController>(ProductsController);
    productsService = module.get(ProductsService);
  });

  it('should be defined', () => {
    expect(controller).toBeDefined();
  });

  it('should create a product successfully', async () => {
    const files: Express.Multer.File[] = [];
    productsService.createProducts.mockResolvedValue(mockProduct);

    const result = await controller.create(dto, files, mockRequest);

    expect(productsService.createProducts).toHaveBeenCalledWith(dto, files);
    expect(result).toEqual(mockProduct);
  });

  it('should throw error when createProducts fails', async () => {
    const files: Express.Multer.File[] = [];

    productsService.createProducts.mockRejectedValue(
      new Error('Erro ao criar produto'),
    );

    await expect(controller.create(dto, files, mockRequest)).rejects.toThrow(
      'Erro ao criar produto',
    );
  });

  it('should update product successfully', async () => {
    const mockProduct = {
      id: 1,
      nameProduct: 'Pizza Calabresa',
      valueProduct: '30',
      descriptionProduct: 'Deliciosa pizza com calabresa e queijo',
      files: [],
      userId: 1,
      createdAt: new Date(),
    };

    const mockRequest = {
      user: { userId: 1 },
    };

    const updateDto: ProductDto = {
      userId: String(mockRequest.user.userId),
      nameProduct: 'Pizza Calabresa',
      valueProduct: '30',
      descriptionProduct: 'Pizza deliciosa',
    };

    productsService.updateOneProductFromId.mockResolvedValue({
      ...mockProduct,
      ...updateDto,
    } as unknown as Product);

    const result = await controller.upateOneProductFromId(
      mockProduct.id,
      mockRequest,
      updateDto,
    );

    expect(productsService.updateOneProductFromId).toHaveBeenCalledWith(
      mockProduct.id,
      updateDto,
      mockRequest.user.userId,
    );

    expect(result).toEqual({ ...mockProduct, ...updateDto });
  });

  it('should throw NotFoundException when update fails', async () => {
    const dto: UpdateProductDto = { nameProduct: 'Pizza Doce' };

    productsService.updateOneProductFromId.mockRejectedValue(
      new NotFoundException('Produto não encontrado'),
    );

    await expect(
      controller.upateOneProductFromId(mockProduct.id, mockRequest, dto),
    ).rejects.toThrow('Produto não encontrado');
  });

  it('should return all products', async () => {
    const products = [mockProduct];
    productsService.findAllProducts.mockResolvedValue(products);

    const result = await controller.findALLProducts(mockRequest);

    expect(productsService.findAllProducts).toHaveBeenCalledWith(
      mockRequest.user.userId,
    );
    expect(result).toEqual(products);
  });

  it('should delete product successfully', async () => {
    const message = { message: 'Produto excluído com sucesso' };
    productsService.deleteOneProductFromId.mockResolvedValue(message);

    const result = await controller.deleteOneProductFromId(mockProduct.id);

    expect(productsService.deleteOneProductFromId).toHaveBeenCalledWith(
      mockProduct.id,
    );
    expect(result).toEqual(message);
  });

  it('should throw NotFoundException when product not found', async () => {
    productsService.deleteOneProductFromId.mockRejectedValue(
      new NotFoundException('Produto não encontrado'),
    );

    await expect(controller.deleteOneProductFromId(999)).rejects.toThrow(
      'Produto não encontrado',
    );
  });
});
