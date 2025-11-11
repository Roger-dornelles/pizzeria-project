import { Test, TestingModule } from '@nestjs/testing';
import { AuthController } from './auth.controller';
import { AuthService } from './auth.service';
import { AuthDto } from './dto/auth.dto';

describe('AuthController', () => {
  let controller: AuthController;
  let authService: AuthService;

  const mockAuthService = {
    login: jest.fn(),
  };

  const mockAuthDto: AuthDto = {
    email: 'test@example.com',
    password: '123456',
  };

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      controllers: [AuthController],
      providers: [
        {
          provide: AuthService,
          useValue: mockAuthService,
        },
      ],
    }).compile();

    controller = module.get<AuthController>(AuthController);
    authService = module.get<AuthService>(AuthService);
  });

  afterEach(() => {
    jest.clearAllMocks();
  });

  it('should call AuthService.login and return a token', async () => {
    const mockResponse = { access_token: 'token' };
    mockAuthService.login.mockResolvedValue(mockResponse);

    const result = await controller.login(mockAuthDto);

    expect(authService.login).toHaveBeenCalledWith(
      mockAuthDto.email,
      mockAuthDto.password,
    );
    expect(result).toEqual(mockResponse);
  });

  it('should propagate error from AuthService.login', async () => {
    mockAuthService.login.mockRejectedValue(new Error('Invalid credentials'));

    await expect(controller.login(mockAuthDto)).rejects.toThrow(
      'Invalid credentials',
    );
  });
});
