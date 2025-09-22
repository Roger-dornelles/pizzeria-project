import {
  Injectable,
  NotFoundException,
  UnauthorizedException,
} from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { User } from 'src/users/entities/user.entity';
import * as bcrypt from 'bcrypt';

@Injectable()
export class AuthService {
  constructor(
    private readonly jwtService: JwtService,
    @InjectRepository(User)
    private readonly userRepository: Repository<User>,
  ) {}

  async validateUser(email: string, password: string) {
    if (!email || !password) {
      throw new NotFoundException('Dados incorretos');
    }

    const user = await this.userRepository.findOne({ where: { email } });

    if (!user) {
      throw new UnauthorizedException('Usuário não autorizado');
    }

    const passwordHash = await bcrypt.compareSync(password, user.password);
    if (!passwordHash) {
      throw new UnauthorizedException('Senha Invalida.');
    }
    return { id: user.id, email: user.email };
  }

  async login(email: string, password: string) {
    const user = await this.validateUser(email, password);

    const payload = {
      sub: user?.id,
      email: user?.email,
    };

    const accessToken = await this.jwtService.signAsync(payload);

    return { user, accessToken };
  }
}
