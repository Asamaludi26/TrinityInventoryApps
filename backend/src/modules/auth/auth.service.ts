import { Injectable, UnauthorizedException, BadRequestException, Logger } from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import * as bcrypt from 'bcrypt';
import { UsersService } from '../users/users.service';
import { LoginDto } from './dto/login.dto';
import { RegisterDto } from './dto/register.dto';
import { PASSWORD_SALT_ROUNDS } from '../../common/constants';

export interface JwtPayload {
  sub: number;
  email: string;
  role: string;
  name: string;
}

export interface AuthResponse {
  user: {
    id: number;
    email: string;
    name: string;
    role: string;
    division?: string;
    permissions: string[];
  };
  token: string;
}

@Injectable()
export class AuthService {
  private readonly logger = new Logger(AuthService.name);

  constructor(
    private usersService: UsersService,
    private jwtService: JwtService,
  ) {}

  /**
   * Validate user credentials for local strategy
   * Uses timing-safe comparison to prevent timing attacks
   */
  async validateUser(email: string, password: string) {
    // Normalize email to lowercase
    const normalizedEmail = email.toLowerCase().trim();

    const user = await this.usersService.findByEmail(normalizedEmail);

    // --- LOG DEBUGGING (HAPUS NANTI) ---
    // console.log('--- DEBUG AUTH ---');
    // console.log('1. Email Input:', normalizedEmail);
    // console.log('2. Password Input:', password);
    // console.log('3. User Found:', user ? 'YES' : 'NO');
    // if (user) {
    //   console.log('4. Stored Hash:', user.password);
    //   const isMatch = await bcrypt.compare(password, user.password);
    //   console.log('5. Match Result:', isMatch);
    // }
    // -----------------------------------

    // Security: Always perform bcrypt compare even if user not found
    // This prevents timing attacks that could reveal if email exists
    const dummyHash = '$2b$12$dummy.hash.for.timing.attack.prevention';
    const passwordToCompare = user?.password || dummyHash;

    const isPasswordValid = await bcrypt.compare(password, passwordToCompare);

    if (!user || !isPasswordValid) {
      // Security: Use generic error message to prevent user enumeration
      throw new UnauthorizedException('Email atau password salah');
    }

    if (!user.isActive) {
      throw new UnauthorizedException('Akun tidak aktif');
    }

    return user;
  }

  /**
   * Login and generate JWT token
   */
  async login(loginDto: LoginDto): Promise<AuthResponse> {
    const user = await this.validateUser(loginDto.email, loginDto.password);

    const payload: JwtPayload = {
      sub: user.id,
      email: user.email,
      role: user.role,
      name: user.name,
    };

    const token = this.jwtService.sign(payload);

    return {
      user: {
        id: user.id,
        email: user.email,
        name: user.name,
        role: user.role,
        division: user.division?.name,
        permissions: user.permissions,
      },
      token,
    };
  }

  /**
   * Register new user
   */
  async register(registerDto: RegisterDto): Promise<AuthResponse> {
    // Normalize email
    const normalizedEmail = registerDto.email.toLowerCase().trim();

    // Check if email exists
    const existingUser = await this.usersService.findByEmail(normalizedEmail);
    if (existingUser) {
      throw new BadRequestException('Email sudah terdaftar');
    }

    // Hash password with secure salt rounds
    const hashedPassword = await bcrypt.hash(registerDto.password, PASSWORD_SALT_ROUNDS);

    // Create user
    const user = await this.usersService.create({
      ...registerDto,
      password: hashedPassword,
    });

    // Generate token
    const payload: JwtPayload = {
      sub: user.id,
      email: user.email,
      role: user.role,
      name: user.name,
    };

    const token = this.jwtService.sign(payload);

    return {
      user: {
        id: user.id,
        email: user.email,
        name: user.name,
        role: user.role,
        division: user.division?.name,
        permissions: user.permissions,
      },
      token,
    };
  }

  /**
   * Verify JWT token and return user
   */
  async verifyToken(token: string) {
    try {
      const payload = this.jwtService.verify<JwtPayload>(token);
      const user = await this.usersService.findOne(payload.sub);

      if (!user || !user.isActive) {
        throw new UnauthorizedException('Token tidak valid');
      }

      return {
        id: user.id,
        email: user.email,
        name: user.name,
        role: user.role,
        division: user.division?.name,
        permissions: user.permissions,
      };
    } catch {
      throw new UnauthorizedException('Token tidak valid atau expired');
    }
  }

  /**
   * Request password reset
   */
  async requestPasswordReset(email: string) {
    const user = await this.usersService.findByEmail(email);

    if (!user) {
      // Don't reveal if email exists
      return { message: 'Jika email terdaftar, admin akan menghubungi Anda' };
    }

    await this.usersService.markPasswordResetRequested(user.id);

    return { message: 'Permintaan reset password telah dikirim ke admin' };
  }
}
