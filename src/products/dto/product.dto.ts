import { IsNotEmpty, IsNumber, IsString } from 'class-validator';

export class ProductDto {
  @IsNumber()
  @IsNotEmpty({ message: 'Usuario não encontrado.' })
  userId: number;

  @IsString({ message: 'Nome do produto deve conter somente caracteres.' })
  @IsNotEmpty({ message: 'Nome do produto é Obrigatorio.' })
  nameProduct: string;

  @IsString({
    message: 'Descrição do produto dever conter somente caracteres.',
  })
  @IsNotEmpty({ message: 'Produto deve conter uma Descrição.' })
  descriptionProduct: string;

  @IsNumber({}, { message: 'Valor do produto deve conter somente numeros' })
  @IsNotEmpty({ message: 'Valor obrigatorio' })
  valueProduct: string;
}
