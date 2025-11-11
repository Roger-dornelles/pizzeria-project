import { Test, TestingModule } from '@nestjs/testing';
import { AuthService } from './auth.service';
import { JwtService } from '@nestjs/jwt';
import { getRepositoryToken } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { User } from 'src/users/entities/user.entity';
import { NotFoundException, UnauthorizedException } from '@nestjs/common';
import * as bcrypt from 'bcrypt';

jest.mock('bcrypt', () => ({
  compareSync: jest.fn(),
}));

describe('AuthService', () => {
  let service: AuthService;
  let userRepository: jest.Mocked<Repository<User>>;
  let jwtService: JwtService;

  const mockUser: User = {
    id: 1,
    email: 'test@example.com',
    password: 'hashed_password',
    name: 'Test User',
    createdAt: new Date(),
  };

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        AuthService,
        {
          provide: JwtService,
          useValue: {
            signAsync: jest.fn(),
          },
        },
        {
          provide: getRepositoryToken(User),
          useValue: {
            findOne: jest.fn(),
          },
        },
      ],
    }).compile();

    service = module.get<AuthService>(AuthService);
    userRepository = module.get(getRepositoryToken(User));
    jwtService = module.get<JwtService>(JwtService);
  });

  afterEach(() => {
    jest.clearAllMocks();
  });

  it('should validate user successfully', async () => {
    userRepository.findOne.mockResolvedValue(mockUser);
    (bcrypt.compareSync as jest.Mock).mockReturnValue(true);

    const result = await service.validateUser(mockUser.email, '123456');

    expect(userRepository.findOne).toHaveBeenCalledWith({
      where: { email: mockUser.email },
    });
    expect(result).toEqual({ id: mockUser.id, email: mockUser.email });
  });

  it('should throw NotFoundException if email or password is missing', async () => {
    await expect(service.validateUser('', '')).rejects.toThrow(
      NotFoundException,
    );
    await expect(service.validateUser('', '')).rejects.toThrow(
      'Dados incorretos',
    );
  });

  it('should throw UnauthorizedException if user not found', async () => {
    userRepository.findOne.mockResolvedValue(null);

    await expect(service.validateUser('no@user.com', '123456')).rejects.toThrow(
      UnauthorizedException,
    );
    await expect(service.validateUser('no@user.com', '123456')).rejects.toThrow(
      'Usuário não autorizado',
    );
  });

  it('should throw UnauthorizedException if password is invalid', async () => {
    userRepository.findOne.mockResolvedValue(mockUser);
    jest.spyOn(bcrypt, 'compareSync').mockReturnValue(false as any);

    await expect(service.validateUser(mockUser.email, 'wrong')).rejects.toThrow(
      UnauthorizedException,
    );
    await expect(service.validateUser(mockUser.email, 'wrong')).rejects.toThrow(
      'Senha Invalida.',
    );
  });

  it('should return access token and user on login success', async () => {
    const mockPayload = { sub: mockUser.id, email: mockUser.email };
    const mockToken = 'token';

    jest.spyOn(service, 'validateUser').mockResolvedValue({
      id: mockUser.id,
      email: mockUser.email,
    });
    jwtService.signAsync = jest.fn().mockResolvedValue(mockToken);

    const result = await service.login(mockUser.email, '123456');

    expect(service.validateUser).toHaveBeenCalledWith(mockUser.email, '123456');
    expect(jwtService.signAsync).toHaveBeenCalledWith(mockPayload);
    expect(result).toEqual({
      user: { id: mockUser.id, email: mockUser.email },
      accessToken: mockToken,
    });
  });

  it('should throw error if validateUser fails', async () => {
    jest
      .spyOn(service, 'validateUser')
      .mockRejectedValue(new UnauthorizedException());

    await expect(service.login(mockUser.email, 'test')).rejects.toThrow(
      UnauthorizedException,
    );
  });
});
