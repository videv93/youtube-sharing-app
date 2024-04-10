import { Test, TestingModule } from '@nestjs/testing';
import { AuthController } from './auth.controller';
import { AuthService } from './auth.service';

describe('AuthController', () => {
  let controller: AuthController;
  let authService: AuthService;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      controllers: [AuthController],
      providers: [AuthService],
    }).compile();

    controller = module.get<AuthController>(AuthController);
    authService = module.get<AuthService>(AuthService);
  });

  describe('login', () => {
    it('should call authService.signIn and return the result', async () => {
      const signInDto = { username: 'test', password: 'password' };
      const expectedResult = 'token';

      jest.spyOn(authService, 'signIn').mockResolvedValue(expectedResult);

      const result = await controller.login(signInDto);

      expect(authService.signIn).toHaveBeenCalledWith(
        signInDto.username,
        signInDto.password,
      );
      expect(result).toBe(expectedResult);
    });
  });

  describe('signUp', () => {
    it('should call authService.signUp and return the result', async () => {
      const signUpDto = { username: 'test', password: 'password' };
      const expectedResult = 'user';

      jest.spyOn(authService, 'signUp').mockResolvedValue(expectedResult);

      const result = await controller.signUp(signUpDto);

      expect(authService.signUp).toHaveBeenCalledWith(
        signUpDto.username,
        signUpDto.password,
      );
      expect(result).toBe(expectedResult);
    });
  });

  describe('getProfile', () => {
    it('should return the user profile', () => {
      const req = { user: { username: 'test' } };
      const expectedResult = { username: 'test' };

      const result = controller.getProfile(req);

      expect(result).toEqual(expectedResult);
    });
  });
});
