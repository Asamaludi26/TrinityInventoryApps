import { NestFactory } from '@nestjs/core';
import { ValidationPipe, Logger, VersioningType } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { DocumentBuilder, SwaggerModule } from '@nestjs/swagger';
import helmet from 'helmet';
import compression from 'compression';
import { AppModule } from './app.module';
import { AllExceptionsFilter } from './common/filters';
import {
  LoggingInterceptor,
  TransformInterceptor,
  TimeoutInterceptor,
} from './common/interceptors';
import { TrimStringPipe } from './common/pipes';

// 1. PERLUAS TIPE GLOBAL
// Ini memberitahu TypeScript bahwa BigInt memiliki method toJSON
declare global {
  interface BigInt {
    toJSON(): string;
  }
}

async function bootstrap() {
  const logger = new Logger('Bootstrap');

  // ==========================================================================
  // 1. GLOBAL BIGINT SERIALIZATION FIX (CRITICAL)
  // ==========================================================================
  // Override method toJSON pada prototype BigInt agar dapat dikonversi
  // menjadi string secara otomatis saat JSON.stringify dipanggil oleh NestJS.
  // Ini mencegah error 500 saat mengembalikan data ID notifikasi.
  BigInt.prototype.toJSON = function (): string {
    return this.toString();
  };

  const app = await NestFactory.create(AppModule, {
    logger: ['error', 'warn', 'log', 'debug'],
  });

  const configService = app.get(ConfigService);
  const isProduction = configService.get<string>('NODE_ENV') === 'production';

  // ==========================================================================
  // Security Middleware
  // ==========================================================================

  // Helmet for security headers
  app.use(
    helmet({
      contentSecurityPolicy: isProduction ? undefined : false,
      crossOriginEmbedderPolicy: false,
    }),
  );

  // Compression for response optimization
  app.use(compression());

  // ==========================================================================
  // API Configuration
  // ==========================================================================

  // Global prefix for all routes
  app.setGlobalPrefix('api');

  // API Versioning
  app.enableVersioning({
    type: VersioningType.URI,
    defaultVersion: '1',
    prefix: 'v',
  });

  // Enable CORS
  const corsOrigin = configService.get<string>('CORS_ORIGIN', 'http://localhost:5173');
  app.enableCors({
    origin: isProduction ? corsOrigin.split(',') : true,
    credentials: true,
    methods: ['GET', 'POST', 'PUT', 'PATCH', 'DELETE', 'OPTIONS'],
    allowedHeaders: ['Content-Type', 'Authorization', 'Accept', 'X-Requested-With'],
    exposedHeaders: ['X-Total-Count', 'X-Page', 'X-Limit'],
    maxAge: 86400, // 24 hours preflight cache
  });

  // ==========================================================================
  // Global Pipes, Filters, Interceptors
  // ==========================================================================

  // Global validation pipe
  app.useGlobalPipes(
    new TrimStringPipe(),
    new ValidationPipe({
      whitelist: true,
      forbidNonWhitelisted: true,
      transform: true,
      transformOptions: {
        enableImplicitConversion: true,
      },
      stopAtFirstError: true,
    }),
  );

  // Global exception filter
  app.useGlobalFilters(new AllExceptionsFilter());

  // Global interceptors
  app.useGlobalInterceptors(
    new LoggingInterceptor(),
    new TransformInterceptor(),
    new TimeoutInterceptor(30000), // 30 second timeout
  );

  // ==========================================================================
  // Swagger Documentation (Development only)
  // ==========================================================================

  if (!isProduction) {
    const swaggerConfig = new DocumentBuilder()
      .setTitle('Trinity Asset Management API')
      .setDescription(
        `
## Trinity Inventory Management System API

Backend API untuk sistem manajemen inventori aset PT. Triniti Media.
        `.trim(),
      )
      .setVersion('1.0.0')
      .setContact('Trinity Team', 'https://trinitimedia.com', 'dev@trinitimedia.com')
      .addBearerAuth(
        {
          type: 'http',
          scheme: 'bearer',
          bearerFormat: 'JWT',
          description: 'Enter JWT token',
        },
        'JWT-auth',
      )
      // Tags setup removed for brevity, keep your original tags here
      .build();

    const document = SwaggerModule.createDocument(app, swaggerConfig);
    SwaggerModule.setup('api/docs', app, document, {
      swaggerOptions: {
        persistAuthorization: true,
        tagsSorter: 'alpha',
        operationsSorter: 'method',
      },
      customSiteTitle: 'Trinity API Documentation',
    });

    logger.log('📚 Swagger documentation available at /api/docs');
  }

  // ==========================================================================
  // Start Server
  // ==========================================================================

  const port = configService.get<number>('PORT', 3001);
  await app.listen(port);

  logger.log(`🚀 Trinity Backend running on: http://localhost:${port}/api`);
  logger.log(`📚 Health check: http://localhost:${port}/api/health`);
  logger.log(`🌍 Environment: ${isProduction ? 'production' : 'development'}`);
}

bootstrap().catch(err => {
  console.error('❌ Failed to start application:', err);
  process.exit(1);
});
