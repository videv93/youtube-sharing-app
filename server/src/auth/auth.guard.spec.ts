import { ExecutionContext, UnauthorizedException } from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import { Reflector } from '@nestjs/core';
import { AuthGuard } from './auth.guard';

describe('AuthGuard', () => {
  let authGuard: AuthGuard;
  let jwtService: JwtService;
  let reflector: Reflector;

  beforeEach(() => {
    jwtService = new JwtService({});
    reflector = new Reflector();
    authGuard = new AuthGuard(jwtService, reflector);
  });

  describe('canActivate', () => {
    it('should return true if the route is public', async () => {
      const context = createMockContext(true);
      const result = await authGuard.canActivate(context);
      expect(result).toBe(true);
    });

    it('should throw an UnauthorizedException if no token is provided', async () => {
      const context = createMockContext(false);
      await expect(authGuard.canActivate(context)).rejects.toThrow(
        UnauthorizedException,
      );
    });

    it('should throw an UnauthorizedException if the token is invalid', async () => {
      const context = createMockContext(false);
      jest.spyOn(jwtService, 'verifyAsync').mockRejectedValueOnce(new Error());
      await expect(authGuard.canActivate(context)).rejects.toThrow(
        UnauthorizedException,
      );
    });

    it('should set the user payload in the request if the token is valid', async () => {
      const context = createMockContext(false);
      const payload = { id: 1, username: 'testuser' };
      jest.spyOn(jwtService, 'verifyAsync').mockResolvedValueOnce(payload);
      await authGuard.canActivate(context);
      expect(context.switchToHttp().getRequest().user).toEqual(payload);
    });
  });

  function createMockContext(isPublic: boolean): ExecutionContext {
    const context = {
      getHandler: jest.fn(),
      getClass: jest.fn(),
      switchToHttp: jest.fn(() => ({
        getRequest: jest.fn(() => ({
          headers: {
            authorization: isPublic ? undefined : 'Bearer token',
          },
        })),
      })),
    };
    jest.spyOn(reflector, 'getAllAndOverride').mockReturnValueOnce(isPublic);
    return context as ExecutionContext;
  }
});
