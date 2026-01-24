import { Controller, Get, Version, VERSION_NEUTRAL } from '@nestjs/common';
import { Public } from './common/decorators/public.decorator'; // Sesuaikan path decorator @Public Anda
import { version } from 'node:os';

@Controller()
export class AppController {
  @Get()
  @Public() // Pastikan endpoint ini bisa diakses tanpa login
  @Version(VERSION_NEUTRAL)
  getRoot() {
    return {
      message: 'Trinity Backend API is running correctly 🚀',
      version: '1.0.0',
      serverTime: new Date().toISOString(),
    };
  }
}
