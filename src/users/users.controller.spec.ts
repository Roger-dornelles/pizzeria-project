import { Test, TestingModule } from '@nestjs/testing';
import { UsersController } from './users.controller';
import { UsersService } from './users.service';
import { NotFoundException } from '@nestjs/common';
import { JwtAuthGuard } from 'src/auth/jwt-auth.guard';
import { CreateUserDto } from './dto/create-user.dto';
import { UpdateUserDto } from './dto/update-user.dto';

describe('UsersController', () => {
  let controller: UsersController;
  let usersService: UsersService;

  const user = {
    id: 1,
    name: 'Ana Paula',
    email: 'ana_paula@yahoo.com',
    password: '123456',
    createdAt: new Date(),
  };

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      controllers: [UsersController],
      providers: [
        {
          provide: UsersService,
          useValue: {
            createUser: jest.fn(),
            findOneUser: jest.fn(),
            updateUser: jest.fn(),
            deleteOneUser: jest.fn(),
          },
        },
      ],
    })
      .overrideGuard(JwtAuthGuard)
      .useValue({ canActivate: () => true }) // desativa autenticação
      .compile();

    controller = module.get<UsersController>(UsersController);
    usersService = module.get<UsersService>(UsersService);
  });

  it('should be defined', () => {
    expect(controller).toBeDefined();
  });

  it('should create a user successfully', async () => {
    jest.spyOn(usersService, 'createUser').mockResolvedValue(user);

    const dto: CreateUserDto = {
      name: user.name,
      email: user.email,
      password: user.password,
    };

    const result = await controller.createUser(dto);

    expect(usersService.createUser).toHaveBeenCalledWith(dto);
    expect(result).toEqual(user);
  });

  it('should throw error when creation fails', async () => {
    jest
      .spyOn(usersService, 'createUser')
      .mockRejectedValue(new Error('Erro ao criar usuário'));

    await expect(controller.createUser(user)).rejects.toThrow(
      'Erro ao criar usuário',
    );
  });

  it('should return a user by id', async () => {
    jest.spyOn(usersService, 'findOneUser').mockResolvedValue(user);

    const result = await controller.findOneUser(user.id);

    expect(usersService.findOneUser).toHaveBeenCalledWith(user.id);
    expect(result).toEqual(user);
  });

  it('should throw NotFoundException when user not found', async () => {
    jest
      .spyOn(usersService, 'findOneUser')
      .mockRejectedValue(new NotFoundException('Usuário não cadastrado.'));

    await expect(controller.findOneUser(99)).rejects.toThrow(NotFoundException);
    await expect(controller.findOneUser(99)).rejects.toThrow(
      'Usuário não cadastrado.',
    );
  });

  it('should update user successfully', async () => {
    const updatedUser = { ...user, name: 'Carlos' };
    jest.spyOn(usersService, 'updateUser').mockResolvedValue(updatedUser);

    const dto: UpdateUserDto = { name: 'Carlos' };
    const result = await controller.updateUser(user.id.toString(), dto);

    expect(usersService.updateUser).toHaveBeenCalledWith(user.id, dto);
    expect(result).toEqual(updatedUser);
  });

  it('should throw NotFoundException when updating unregistered user', async () => {
    jest
      .spyOn(usersService, 'updateUser')
      .mockRejectedValue(new NotFoundException('Usuário não cadastrado.'));

    await expect(
      controller.updateUser('3', {
        name: 'Pedro',
        email: 'pedro@email.com',
        password: '654321',
      }),
    ).rejects.toThrow(NotFoundException);
  });
  
  it('should delete a user successfully', async () => {
    const message = { message: 'Usuário excluído com sucesso.' };
    jest.spyOn(usersService, 'deleteOneUser').mockResolvedValue(message);

    const result = await controller.deleteOneUser(user.id);

    expect(usersService.deleteOneUser).toHaveBeenCalledWith(user.id);
    expect(result).toEqual(message);
  });

  it('should throw NotFoundException when deleting unregistered user', async () => {
    jest
      .spyOn(usersService, 'deleteOneUser')
      .mockRejectedValue(new NotFoundException('Usuário não cadastrado.'));

    await expect(controller.deleteOneUser(999)).rejects.toThrow(
      NotFoundException,
    );
    await expect(controller.deleteOneUser(999)).rejects.toThrow(
      'Usuário não cadastrado.',
    );
  });
});
