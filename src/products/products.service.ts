import {
  Injectable,
  NotFoundException,
  UnauthorizedException,
} from '@nestjs/common';

import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Product } from './entities/product.entity';
import { ProductDto } from './dto/product.dto';
import { UploadService } from 'src/upload/upload.service';

@Injectable()
export class ProductsService {
  constructor(
    @InjectRepository(Product)
    private productRepository: Repository<Product>,
    private readonly uploadService: UploadService,
  ) {}

  async createProducts(
    createProductDto: ProductDto,
    files: Express.Multer.File[],
  ) {
    if (!createProductDto.userId) {
      throw new UnauthorizedException(
        'Usuario sem permissão para adicionar um produto',
      );
    }

    const productSaveBD = await this.productRepository.findOne({
      where: { nameProduct: createProductDto.nameProduct },
    });

    if (productSaveBD) {
      throw new UnauthorizedException('Produto já cadastrado com este nome');
    }

    const formattedValue = new Intl.NumberFormat('pt-BR', {
      style: 'currency',
      currency: 'BRL',
    }).format(Number(createProductDto.valueProduct));

    if (!formattedValue) {
      throw new NotFoundException('Ocorreu um erro no valor do produto');
    }
    createProductDto.valueProduct = formattedValue;

    const imagesUrl = await this.uploadService.uploadImage(files);
    const file = imagesUrl.map((i) => ({
      name: i.name,
      path: i.path,
      url: i.url,
    }));

    const products = await this.productRepository.create({
      ...createProductDto,
      userId: parseInt(createProductDto.userId),
      files: file,
    });
    return await this.productRepository.save(products);
  }

  async updateOneProductFromId(
    id: number,
    productDto: Partial<ProductDto>,
    userId: number,
  ): Promise<Product> {
    if (!userId) {
      throw new UnauthorizedException('Usuario sem premissão.');
    }

    if (!id) {
      throw new NotFoundException('Produto não encontrado');
    }

    const productSaveBD = await this.productRepository.findOneBy({ id });

    if (!productSaveBD) {
      throw new NotFoundException('Produto não encontrado.');
    }

    const updatedProduct = Object.assign(productSaveBD, productDto);

    if (!updatedProduct) {
      throw new UnauthorizedException('Ocorreu um erro tente mais tarde.');
    }

    const formattedValue = new Intl.NumberFormat('pt-BR', {
      style: 'currency',
      currency: 'BRL',
    }).format(Number(updatedProduct.valueProduct));

    updatedProduct.valueProduct = formattedValue;

    return this.productRepository.save(updatedProduct);
  }

  async findAllProducts(user: number): Promise<Product[]> {
    return this.productRepository.find({ where: { userId: user } });
  }

  async deleteOneProductFromId(
    id: number,
  ): Promise<{ message: string } | Error> {
    if (!id) {
      throw new NotFoundException('Produto não encontrado');
    }

    const product = await this.productRepository.delete(id);

    if (!product) {
      throw new NotFoundException('Produto não cadastrado');
    }

    return { message: 'Produto excluido com sucesso.' };
  }
}
