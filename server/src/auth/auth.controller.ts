import {
  Body,
  Get,
  Post,
  Logger,
  Request,
  HttpCode,
  HttpStatus,
  Controller,
} from '@nestjs/common';
import { AuthService } from './auth.service';
import { Public } from './decorators/public.decorator';

@Controller()
export class AuthController {
  private readonly logger = new Logger(AuthController.name);
  constructor(private readonly authService: AuthService) {}

  @Public()
  @HttpCode(HttpStatus.OK)
  @Post('auth/signIn')
  async login(@Body() signInDto: Record<string, any>) {
    return this.authService.signIn(signInDto.username, signInDto.password);
  }

  @Public()
  @Post('auth/signUp')
  async signUp(@Body() signUpDto: Record<string, any>) {
    return this.authService.signUp(signUpDto.username, signUpDto.password);
  }

  @Get('profile')
  getProfile(@Request() req: any) {
    this.logger.log('getProfile', req.user);
    return req.user;
  }
}
