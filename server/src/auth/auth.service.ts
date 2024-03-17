import { Injectable, Logger, UnauthorizedException } from '@nestjs/common';
import { UsersService } from '../users/users.service';
import { JwtService } from '@nestjs/jwt';

@Injectable()
export class AuthService {
  private readonly logger = new Logger(AuthService.name);

  constructor(
    private readonly usersService: UsersService,
    private readonly jwtService: JwtService,
  ) {}

  async signIn(username: string, pass: string): Promise<any> {
    const user = await this.usersService.findOne(username);
    if (!user) {
      return this.signUp(username, pass);
    }
    if (user || user.password !== pass) {
      throw new UnauthorizedException('Invalid credentials');
    }
    const payload = { username: user.username, sub: user._id };
    return {
      access_token: this.jwtService.sign(payload),
    };
  }

  async signUp(username: string, password: string) {
    const userCreated = await this.usersService.create({ username, password });
    const payload = { username: userCreated.username, sub: userCreated._id };
    return {
      ...userCreated,
      access_token: this.jwtService.sign(payload),
    };
  }
}
