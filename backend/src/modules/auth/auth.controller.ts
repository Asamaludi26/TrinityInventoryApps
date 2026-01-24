import {
  Controller,
  Post,
  Body,
  Get,
  UseGuards,
  Request,
  HttpCode,
  HttpStatus,
  Logger,
  Ip,
  Headers,
} from '@nestjs/common';
import { Throttle, SkipThrottle } from '@nestjs/throttler';
import { AuthService } from './auth.service';
import { LoginDto } from './dto/login.dto';
import { RegisterDto } from './dto/register.dto';
import { JwtAuthGuard } from './guards/jwt-auth.guard';
import { RequestPasswordResetDto } from './dto/request-password-reset.dto';
import { THROTTLE_LOGIN_TTL, THROTTLE_LOGIN_LIMIT } from '../../common/constants';
// PERBAIKAN: Import User untuk type definition
import { User } from '@prisma/client';

// Interface helper untuk Request yang sudah diautentikasi
interface RequestWithUser {
  user: User;
}

@Controller('auth')
export class AuthController {
  private readonly logger = new Logger(AuthController.name);

  constructor(private authService: AuthService) {}

  /**
   * Login endpoint with strict rate limiting
   * - 5 attempts per minute to prevent brute force
   * - Logs all login attempts for security audit
   */
  @Post('login')
  @HttpCode(HttpStatus.OK)
  @Throttle({
    default: { ttl: THROTTLE_LOGIN_TTL, limit: THROTTLE_LOGIN_LIMIT },
  })
  async login(
    @Body() loginDto: LoginDto,
    @Ip() ip: string,
    @Headers('user-agent') userAgent: string,
  ) {
    // PERBAIKAN LINE 39: Menggunakan userAgent di dalam log audit
    this.logger.log(
      `Login attempt for ${loginDto.email} from IP: ${ip}, UA: ${userAgent || 'Unknown'}`,
    );

    try {
      const result = await this.authService.login(loginDto);
      this.logger.log(`Login successful for ${loginDto.email} from IP: ${ip}`);
      return result;
    } catch (error: unknown) {
      const errorMessage = error instanceof Error ? error.message : 'Unknown error';
      this.logger.warn(`Login failed for ${loginDto.email} from IP: ${ip} - ${errorMessage}`);
      throw error;
    }
  }

  @Post('register')
  @Throttle({ default: { ttl: 60000, limit: 3 } }) // 3 registrations per minute
  async register(@Body() registerDto: RegisterDto) {
    return this.authService.register(registerDto);
  }

  @Get('me')
  @UseGuards(JwtAuthGuard)
  @SkipThrottle()
  // PERBAIKAN LINE 64: Menggunakan tipe spesifik 'RequestWithUser' alih-alih 'any'
  async getCurrentUser(@Request() req: RequestWithUser) {
    return req.user;
  }

  @Post('verify')
  @UseGuards(JwtAuthGuard)
  @HttpCode(HttpStatus.OK)
  @SkipThrottle()
  // PERBAIKAN LINE 72: Menggunakan tipe spesifik 'RequestWithUser' alih-alih 'any'
  async verifyToken(@Request() req: RequestWithUser) {
    return { valid: true, user: req.user };
  }

  @Post('request-password-reset')
  @HttpCode(HttpStatus.OK)
  @Throttle({ default: { ttl: 60000, limit: 3 } }) // 3 requests per minute
  async requestPasswordReset(@Body() dto: RequestPasswordResetDto) {
    return this.authService.requestPasswordReset(dto.email);
  }
}
