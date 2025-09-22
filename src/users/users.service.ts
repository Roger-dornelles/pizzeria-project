import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { User } from './entities/user.entity';
import { CreateUserDto } from './dto/create-user.dto';
import { UpdateUserDto } from './dto/update-user.dto';
import * as bcrypt from 'bcrypt';

@Injectable()
export class UsersService {
  constructor(
    @InjectRepository(User)
    private userRepository: Repository<User>,
  ) {}

  async findOneUser(id: number) {
    const user = await this.userRepository.findOneBy({ id });
    if (!user) {
      throw new NotFoundException('Usuario não cadastrado.');
    }
    return user;
  }

  async createUser(dto: CreateUserDto): Promise<User> {
    const thereIsUser = await this.userRepository.findOne({
      where: { email: dto.email },
    });
    if (thereIsUser) {
      throw new NotFoundException('Email já cadastrado.');
    }

    const user = this.userRepository.create(dto);
    const passwordHash = await bcrypt.hashSync(dto.password, 10);
    user.password = passwordHash;
    return this.userRepository.save(user);
  }

  async updateUser(id: number, dto: UpdateUserDto) {
    const user = await this.userRepository.findOneBy({ id });
    if (!user) {
      throw new NotFoundException('Usuário não cadastrado.');
    }

    const updatedUser = Object.assign(user, dto);

    return this.userRepository.save(updatedUser);
  }

  async deleteOneUser(id: number) {
    const user = await this.findOneUser(id);

    if (!user) {
      throw new NotFoundException('Usuario não cadastrado.');
    }

    const userDeleted = this.userRepository.delete(user.id);

    if (!userDeleted) {
      throw new NotFoundException('Ocorreu um erro, tente mais tarde.');
    }

    return { message: 'Usuario excluido com sucesso.' };
  }
}
