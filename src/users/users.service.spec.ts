import { Test, TestingModule } from '@nestjs/testing';
import { UsersService } from './users.service';
import { getRepositoryToken } from '@nestjs/typeorm';
import { User } from './entities/user.entity';
import { Repository } from 'typeorm';
import { NotFoundException } from '@nestjs/common';

describe('UsersService', () => {
  let service: UsersService;
  let userRepository: jest.Mocked<Repository<User>>;

  const user: User = {
    id: 1,
    name: 'Ana Paula',
    email: 'ana_paula@yahoo.com',
    password: '123456',
    createdAt: new Date(),
  };

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        UsersService,
        {
          provide: getRepositoryToken(User),
          useValue: {
            findOne: jest.fn(),
            findOneBy: jest.fn(),
            create: jest.fn(),
            save: jest.fn(),
            delete: jest.fn(),
          },
        },
      ],
    }).compile();

    service = module.get<UsersService>(UsersService);
    userRepository = module.get(getRepositoryToken(User));
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });

  it('should create a user successfully', async () => {
    const dto = {
      name: user.name,
      email: user.email,
      password: user.password,
    };
    const hashed = 'password';

    jest.mock('bcrypt', () => ({
      hashSync: jest.fn().mockReturnValue('password'),
    }));

    userRepository.findOne.mockResolvedValue(null);
    userRepository.create.mockReturnValue({
      ...user,
      password: hashed,
    } as User);
    userRepository.save.mockResolvedValue({
      ...user,
      password: hashed,
    } as User);

    const result = await service.createUser(dto);

    expect(userRepository.findOne).toHaveBeenCalledWith({
      where: { email: dto.email },
    });
    expect(userRepository.create).toHaveBeenCalledWith(dto);
    expect(result.password).toBe(hashed);
    expect(result.email).toBe(dto.email);
  });

  it('should throw NotFoundException if email already exists', async () => {
    const dto = {
      name: user.name,
      email: user.email,
      password: user.password,
    };
    userRepository.findOne.mockResolvedValue(user);

    await expect(service.createUser(dto)).rejects.toThrow(NotFoundException);
    await expect(service.createUser(dto)).rejects.toThrow(
      'Email já cadastrado.',
    );
  });

  it('should return a user when found', async () => {
    userRepository.findOneBy.mockResolvedValue(user);

    const result = await service.findOneUser(user.id);

    expect(userRepository.findOneBy).toHaveBeenCalledWith({ id: user.id });
    expect(result).toEqual(user);
  });

  it('should throw NotFoundException when user not found', async () => {
    userRepository.findOneBy.mockResolvedValue(null);

    await expect(service.findOneUser(99)).rejects.toThrow(NotFoundException);
    await expect(service.findOneUser(99)).rejects.toThrow(
      'Usuario não cadastrado.',
    );
  });

  it('should update a user successfully', async () => {
    const dto = { name: 'Carlos' };
    const updatedUser = { ...user, ...dto };

    userRepository.findOneBy.mockResolvedValue(user);
    userRepository.save.mockResolvedValue(updatedUser);

    const result = await service.updateUser(user.id, dto);

    expect(userRepository.findOneBy).toHaveBeenCalledWith({ id: user.id });
    expect(userRepository.save).toHaveBeenCalledWith(updatedUser);
    expect(result).toEqual(updatedUser);
  });

  it('should throw NotFoundException if user not found', async () => {
    userRepository.findOneBy.mockResolvedValue(null);

    await expect(service.updateUser(99, { name: 'Pedro' })).rejects.toThrow(
      NotFoundException,
    );
    await expect(service.updateUser(99, { name: 'Pedro' })).rejects.toThrow(
      'Usuário não cadastrado.',
    );
  });

  it('should delete user successfully', async () => {
    userRepository.findOneBy.mockResolvedValue(user);
    userRepository.delete.mockResolvedValue({ affected: 1 } as any);

    const result = await service.deleteOneUser(user.id);

    expect(userRepository.findOneBy).toHaveBeenCalledWith({ id: user.id });
    expect(userRepository.delete).toHaveBeenCalledWith(user.id);
    expect(result).toEqual({ message: 'Usuario excluido com sucesso.' });
  });

  it('should throw NotFoundException when user not found', async () => {
    jest
      .spyOn(service, 'findOneUser')
      .mockRejectedValue(new NotFoundException('Usuario não cadastrado.'));

    await expect(service.deleteOneUser(99)).rejects.toThrow(NotFoundException);
  });

  it('should throw NotFoundException when delete fails', async () => {
    jest
      .spyOn(service, 'findOneUser')
      .mockRejectedValue(
        new NotFoundException('Ocorreu um erro, tente mais tarde.'),
      );

    await expect(service.deleteOneUser(user.id)).rejects.toThrow(
      'Ocorreu um erro, tente mais tarde.',
    );

    expect(service.findOneUser).toHaveBeenCalledWith(user.id);
  });
});
