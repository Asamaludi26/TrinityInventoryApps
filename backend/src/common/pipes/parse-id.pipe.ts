import { PipeTransform, Injectable, BadRequestException } from '@nestjs/common';

/**
 * Pipe to parse and validate ID parameter
 * Supports both numeric IDs and custom string IDs (e.g., AST-2025-001)
 */
@Injectable()
export class ParseIdPipe implements PipeTransform {
  transform(value: string): string | number {
    if (!value || value.trim() === '') {
      throw new BadRequestException('ID tidak boleh kosong');
    }

    // Check if it's a custom ID format (e.g., AST-2025-001, RO-2025-001)
    if (/^[A-Z]+-\d{4}-\d+$/.test(value)) {
      return value;
    }

    // Try to parse as number
    const numericId = parseInt(value, 10);
    if (isNaN(numericId) || numericId <= 0) {
      throw new BadRequestException('ID tidak valid');
    }

    return numericId;
  }
}
