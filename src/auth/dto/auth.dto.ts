import { IsEmail, IsNotEmpty, IsString, MinLength } from 'class-validator';

export class AuthDto {
  @IsEmail({}, { message: 'Email Invalido' })
  @IsNotEmpty({ message: 'Email Obrigatorio' })
  email: string;

  @IsNotEmpty({ message: 'Senha Obrigatorio' })
  @MinLength(6, { message: 'Senha deve conter mais de 6 caracteres' })
  password: string;
}
