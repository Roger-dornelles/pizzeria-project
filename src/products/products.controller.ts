import {
  Controller,
  Post,
  Body,
  UseGuards,
  Req,
  Get,
  Put,
  ParseIntPipe,
  Param,
  Delete,
} from '@nestjs/common';
import { ProductsService } from './products.service';
import { ProductDto } from './dto/product.dto';
import { JwtAuthGuard } from 'src/auth/jwt-auth.guard';
import { UpdateProductDto } from './dto/update-product.dto';

@Controller('products')
export class ProductsController {
  constructor(private readonly productsService: ProductsService) {}

  @UseGuards(JwtAuthGuard)
  @Post()
  create(@Body() createProductDto: ProductDto, @Req() req) {
    const userID = req.user.userId;

    return this.productsService.createProducts(createProductDto, userID);
  }

  @UseGuards(JwtAuthGuard)
  @Put(':id')
  upateOneProductFromId(
    @Param('id', ParseIntPipe)
    id: number,
    @Req()
    req,
    @Body()
    productDto: UpdateProductDto,
  ) {
    const userId = req.user.userId;

    return this.productsService.updateOneProductFromId(id, productDto, userId);
  }

  @UseGuards(JwtAuthGuard)
  @Get()
  findALLProducts(@Req() req) {
    const user = req.user.userId;
    return this.productsService.findAllProducts(user);
  }

  @UseGuards(JwtAuthGuard)
  @Delete(':id')
  deleteOneProductFromId(@Param('id') id: number) {
    return this.productsService.deleteOneProductFromId(id);
  }
}
