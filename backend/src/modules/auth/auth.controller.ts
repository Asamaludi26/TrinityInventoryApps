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
  @Throttle({ default: { ttl: THROTTLE_LOGIN_TTL, limit: THROTTLE_LOGIN_LIMIT } })
  async login(
    @Body() loginDto: LoginDto,
    @Ip() ip: string,
    @Headers('user-agent') userAgent: string,
  ) {
    // Security: Log login attempt (without password)
    this.logger.log(`Login attempt for ${loginDto.email} from IP: ${ip}`);

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
  async getCurrentUser(@Request() req: any) {
    return req.user;
  }

  @Post('verify')
  @UseGuards(JwtAuthGuard)
  @HttpCode(HttpStatus.OK)
  @SkipThrottle()
  async verifyToken(@Request() req: any) {
    return { valid: true, user: req.user };
  }

  @Post('request-password-reset')
  @HttpCode(HttpStatus.OK)
  @Throttle({ default: { ttl: 60000, limit: 3 } }) // 3 requests per minute
  async requestPasswordReset(@Body() dto: RequestPasswordResetDto) {
    return this.authService.requestPasswordReset(dto.email);
  }
}
