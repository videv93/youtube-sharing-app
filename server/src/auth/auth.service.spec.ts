import { Test, TestingModule } from '@nestjs/testing';
import { AuthService } from './auth.service';
import { JwtService } from '@nestjs/jwt';
import { UsersService } from '../users/users.service';

describe('AuthService', () => {
  let service: AuthService;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        AuthService,
        {
          provide: UsersService,
          useValue: {
            findnOne: jest.fn(),
            create: jest.fn(),
          },
        },
        {
          provide: JwtService,
          useValue: {
            sign: jest.fn(),
          },
        },
      ],
    }).compile();

    service = module.get<AuthService>(AuthService);
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });
});
import { Test, TestingModule } from '@nestjs/testing';
import { AuthService } from './auth.service';
import { JwtService } from '@nestjs/jwt';
import { UsersService } from '../users/users.service';
import { UnauthorizedException } from '@nestjs/common';

describe('AuthService', () => {
  let service: AuthService;
  let usersService: UsersService;
  let jwtService: JwtService;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        AuthService,
        {
          provide: UsersService,
          useValue: {
            findOne: jest.fn(),
            create: jest.fn(),
          },
        },
        {
          provide: JwtService,
          useValue: {
            sign: jest.fn(),
          },
        },
      ],
    }).compile();

    service = module.get<AuthService>(AuthService);
    usersService = module.get<UsersService>(UsersService);
    jwtService = module.get<JwtService>(JwtService);
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });

  describe('signIn', () => {
    it('should return access token if user exists and password is correct', async () => {
      const username = 'testuser';
      const password = 'testpassword';
      const user = { username, password: 'hashedpassword', _id: '123' };
      const accessToken = 'testaccesstoken';

      jest.spyOn(usersService, 'findOne').mockResolvedValue(user);
      jest.spyOn(jwtService, 'sign').mockReturnValue(accessToken);

      const result = await service.signIn(username, password);

      expect(usersService.findOne).toHaveBeenCalledWith(username);
      expect(jwtService.sign).toHaveBeenCalledWith({ username, sub: user._id });
      expect(result).toEqual({ access_token: accessToken });
    });

    it('should call signUp if user does not exist', async () => {
      const username = 'testuser';
      const password = 'testpassword';
      const user = null;
      const signUpResult = {
        username,
        password: 'hashedpassword',
        _id: '123',
        access_token: 'testaccesstoken',
      };

      jest.spyOn(usersService, 'findOne').mockResolvedValue(user);
      jest.spyOn(service, 'signUp').mockResolvedValue(signUpResult);

      const result = await service.signIn(username, password);

      expect(usersService.findOne).toHaveBeenCalledWith(username);
      expect(service.signUp).toHaveBeenCalledWith(username, password);
      expect(result).toEqual(signUpResult);
    });

    it('should throw UnauthorizedException if user exists but password is incorrect', async () => {
      const username = 'testuser';
      const password = 'testpassword';
      const user = { username, password: 'hashedpassword', _id: '123' };

      jest.spyOn(usersService, 'findOne').mockResolvedValue(user);

      await expect(
        service.signIn(username, 'incorrectpassword'),
      ).rejects.toThrow(UnauthorizedException);
    });
  });

  describe('signUp', () => {
    it('should create a new user and return access token', async () => {
      const username = 'testuser';
      const password = 'testpassword';
      const userCreated = { username, password: 'hashedpassword', _id: '123' };
      const accessToken = 'testaccesstoken';

      jest.spyOn(usersService, 'create').mockResolvedValue(userCreated);
      jest.spyOn(jwtService, 'sign').mockReturnValue(accessToken);

      const result = await service.signUp(username, password);

      expect(usersService.create).toHaveBeenCalledWith({ username, password });
      expect(jwtService.sign).toHaveBeenCalledWith({
        username,
        sub: userCreated._id,
      });
      expect(result).toEqual({ ...userCreated, access_token: accessToken });
    });
  });
});
