import {
  Controller,
  Post,
  Body,
  Get,
  Patch,
  UseGuards,
  Request,
} from '@nestjs/common';
import { ApiTags, ApiBearerAuth } from '@nestjs/swagger';
import { AuthService } from './auth.service';
import { LoginDto } from './dto/login.dto';
import { RegisterDto } from './dto/register.dto';
import { JwtAuthGuard } from '../../common/guards/jwt-auth.guard';

@ApiTags('auth')
@Controller('auth')
export class AuthController {
  constructor(private authService: AuthService) {}

  @Post('login')
  login(@Body() body: LoginDto) {
    return this.authService.login(body);
  }

  @Post('register')
  register(@Body() body: RegisterDto) {
    return this.authService.register(
      body.email,
      body.password,
      body.first_name,
      body.last_name,
    );
  }

  @Get('me')
  @UseGuards(JwtAuthGuard)
  @ApiBearerAuth()
  getProfile(@Request() req) {
    return this.authService.getProfile(req.user.id);
  }

  @Post('logout')
  logout() {
    return { message: 'Déconnecté' };
  }

  @Post('verify-password')
  @UseGuards(JwtAuthGuard)
  @ApiBearerAuth()
  async verifyPassword(@Request() req, @Body('password') password: string) {
    const isValid = await this.authService.verifyPassword(req.user.id, password);
    return { isValid };
  }

  @Patch('update-profile')
  @UseGuards(JwtAuthGuard)
  @ApiBearerAuth()
  updateProfile(@Request() req, @Body() data: { first_name?: string; last_name?: string; phone?: string }) {
    return this.authService.updateProfile(req.user.id, data);
  }

  @Post('change-password')
  @UseGuards(JwtAuthGuard)
  @ApiBearerAuth()
  changePassword(@Request() req, @Body() data: { current: string; new: string }) {
    return this.authService.changePassword(req.user.id, data);
  }

  @Post('2fa/generate')
  @UseGuards(JwtAuthGuard)
  @ApiBearerAuth()
  generateTwoFactorAuth(@Request() req) {
    return this.authService.generateTwoFactorSecret(req.user.id);
  }

  @Post('2fa/turn-on')
  @UseGuards(JwtAuthGuard)
  @ApiBearerAuth()
  turnOnTwoFactorAuth(@Request() req, @Body('code') code: string) {
    return this.authService.turnOnTwoFactorAuth(req.user.id, code);
  }

  @Post('2fa/turn-off')
  @UseGuards(JwtAuthGuard)
  @ApiBearerAuth()
  turnOffTwoFactorAuth(@Request() req, @Body('code') code: string) {
    return this.authService.turnOffTwoFactorAuth(req.user.id, code);
  }
}
