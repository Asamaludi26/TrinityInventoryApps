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
// 1. IMPORT BARU DARI SWAGGER
import { ApiTags, ApiOperation, ApiResponse, ApiBearerAuth, ApiBody } from '@nestjs/swagger';

import { AuthService } from './auth.service';
import { LoginDto } from './dto/login.dto';
import { RegisterDto } from './dto/register.dto';
import { JwtAuthGuard } from './guards/jwt-auth.guard';
import { RequestPasswordResetDto } from './dto/request-password-reset.dto';
import { THROTTLE_LOGIN_TTL, THROTTLE_LOGIN_LIMIT } from '../../common/constants';
import { User } from '@prisma/client';

interface RequestWithUser {
  user: User;
}

// 2. TAMBAHKAN TAG UNTUK GROUPING
@ApiTags('auth')
@Controller('auth')
export class AuthController {
  private readonly logger = new Logger(AuthController.name);

  constructor(private authService: AuthService) {}

  @Post('login')
  @HttpCode(HttpStatus.OK)
  // 3. TAMBAHKAN DOKUMENTASI OPERASI
  @ApiOperation({ summary: 'Login user to get JWT token' })
  @ApiResponse({ status: 200, description: 'Login successful, returns access token' })
  @ApiResponse({ status: 401, description: 'Invalid credentials' })
  @Throttle({
    default: { ttl: THROTTLE_LOGIN_TTL, limit: THROTTLE_LOGIN_LIMIT },
  })
  async login(
    @Body() loginDto: LoginDto,
    @Ip() ip: string,
    @Headers('user-agent') userAgent: string,
  ) {
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
  @ApiOperation({ summary: 'Register a new user' }) // Dokumentasi
  @Throttle({ default: { ttl: 60000, limit: 3 } })
  async register(@Body() registerDto: RegisterDto) {
    return this.authService.register(registerDto);
  }

  @Get('me')
  @UseGuards(JwtAuthGuard)
  // 4. KUNCI UTAMA: BERITAHU SWAGGER BAHWA INI BUTUH TOKEN
  @ApiBearerAuth('JWT-auth')
  @ApiOperation({ summary: 'Get current user profile (Requires Token)' })
  @SkipThrottle()
  async getCurrentUser(@Request() req: RequestWithUser) {
    return req.user;
  }

  @Post('verify')
  @UseGuards(JwtAuthGuard)
  @ApiBearerAuth('JWT-auth') // Tambahkan juga di sini
  @ApiOperation({ summary: 'Verify if token is valid' })
  @HttpCode(HttpStatus.OK)
  @SkipThrottle()
  async verifyToken(@Request() req: RequestWithUser) {
    return { valid: true, user: req.user };
  }

  @Post('request-password-reset')
  @ApiOperation({ summary: 'Request password reset email' })
  @HttpCode(HttpStatus.OK)
  @Throttle({ default: { ttl: 60000, limit: 3 } })
  async requestPasswordReset(@Body() dto: RequestPasswordResetDto) {
    return this.authService.requestPasswordReset(dto.email);
  }
}
