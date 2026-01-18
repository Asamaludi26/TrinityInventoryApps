import { PipeTransform, Injectable } from '@nestjs/common';

/**
 * Pipe to trim whitespace from string inputs
 */
@Injectable()
export class TrimStringPipe implements PipeTransform {
  transform(value: unknown): unknown {
    if (typeof value === 'string') {
      return value.trim();
    }

    if (typeof value === 'object' && value !== null) {
      return this.trimObject(value as Record<string, unknown>);
    }

    return value;
  }

  private trimObject(obj: Record<string, unknown>): Record<string, unknown> {
    const trimmed: Record<string, unknown> = {};

    for (const [key, value] of Object.entries(obj)) {
      if (typeof value === 'string') {
        trimmed[key] = value.trim();
      } else if (typeof value === 'object' && value !== null && !Array.isArray(value)) {
        trimmed[key] = this.trimObject(value as Record<string, unknown>);
      } else if (Array.isArray(value)) {
        trimmed[key] = value.map(item =>
          typeof item === 'string'
            ? item.trim()
            : typeof item === 'object' && item !== null
              ? this.trimObject(item as Record<string, unknown>)
              : item,
        );
      } else {
        trimmed[key] = value;
      }
    }

    return trimmed;
  }
}
