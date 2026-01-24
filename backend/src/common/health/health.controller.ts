import { Controller, Get, HttpCode, HttpStatus, Version, VERSION_NEUTRAL } from '@nestjs/common';
import { ApiTags, ApiOperation, ApiResponse } from '@nestjs/swagger';
import { SkipThrottle } from '@nestjs/throttler';
import { PrismaService } from '../prisma/prisma.service';
import { Public } from '../decorators';

interface HealthCheckResponse {
  status: 'ok' | 'error';
  timestamp: string;
  uptime: number;
  database: 'connected' | 'disconnected';
  version: string;
  environment: string;
  memory: {
    heapUsed: number;
    heapTotal: number;
    external: number;
    rss: number;
  };
  error?: string;
}

@ApiTags('health')
@Controller('health')
@SkipThrottle()
export class HealthController {
  constructor(private prisma: PrismaService) {}

  @Get()
  @Public()
  @HttpCode(HttpStatus.OK)
  @Version(VERSION_NEUTRAL)
  @ApiOperation({ summary: 'Health check endpoint' })
  @ApiResponse({ status: 200, description: 'Service is healthy' })
  @ApiResponse({ status: 503, description: 'Service is unhealthy' })
  async check(): Promise<HealthCheckResponse> {
    const memoryUsage = process.memoryUsage();

    try {
      // Check database connectivity
      await this.prisma.$queryRaw`SELECT 1`;

      return {
        status: 'ok',
        timestamp: new Date().toISOString(),
        uptime: Math.floor(process.uptime()),
        database: 'connected',
        version: process.env.npm_package_version || '1.0.0',
        environment: process.env.NODE_ENV || 'development',
        memory: {
          heapUsed: Math.round(memoryUsage.heapUsed / 1024 / 1024),
          heapTotal: Math.round(memoryUsage.heapTotal / 1024 / 1024),
          external: Math.round(memoryUsage.external / 1024 / 1024),
          rss: Math.round(memoryUsage.rss / 1024 / 1024),
        },
      };
    } catch (error) {
      return {
        status: 'error',
        timestamp: new Date().toISOString(),
        uptime: Math.floor(process.uptime()),
        database: 'disconnected',
        version: process.env.npm_package_version || '1.0.0',
        environment: process.env.NODE_ENV || 'development',
        memory: {
          heapUsed: Math.round(memoryUsage.heapUsed / 1024 / 1024),
          heapTotal: Math.round(memoryUsage.heapTotal / 1024 / 1024),
          external: Math.round(memoryUsage.external / 1024 / 1024),
          rss: Math.round(memoryUsage.rss / 1024 / 1024),
        },
        error: error instanceof Error ? error.message : 'Unknown error',
      };
    }
  }

  @Get('ready')
  @Public()
  @HttpCode(HttpStatus.OK)
  @ApiOperation({ summary: 'Readiness probe for Kubernetes' })
  async ready() {
    await this.prisma.$queryRaw`SELECT 1`;
    return { ready: true };
  }

  @Get('live')
  @Public()
  @HttpCode(HttpStatus.OK)
  @ApiOperation({ summary: 'Liveness probe for Kubernetes' })
  live() {
    return { alive: true };
  }
}
