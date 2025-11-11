import {
  ArrayMaxSize,
  ArrayMinSize,
  ArrayNotEmpty,
  IsArray,
  IsNotEmpty,
  IsNumber,
  IsString,
} from 'class-validator';

export class ProductDto {
  @IsString()
  @IsNotEmpty({ message: 'Usuario não encontrado.' })
  userId: string;

  @IsString({ message: 'Nome do produto deve conter somente caracteres.' })
  @IsNotEmpty({ message: 'Nome do produto é Obrigatorio.' })
  nameProduct: string;

  @IsString({
    message: 'Descrição do produto dever conter somente caracteres.',
  })
  @IsNotEmpty({ message: 'Produto deve conter uma Descrição.' })
  descriptionProduct: string;

  @IsString({ message: 'Valor do produto deve conter somente numeros' })
  @IsNotEmpty({ message: 'Valor obrigatorio' })
  valueProduct: string;
}
