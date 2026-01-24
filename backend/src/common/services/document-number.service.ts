/**
 * =============================================================================
 * Document Number Service
 * =============================================================================
 *
 * Centralized service for generating unique document numbers across all entities.
 * This eliminates the duplication of generateDocNumber/generateId methods
 * found in 8+ services.
 *
 * @module common/services/document-number.service
 * @version 1.0.0
 * @created 2026-01-19
 */

import { Injectable } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';

/**
 * Document type prefixes and their configurations
 */
export enum DocumentType {
  ASSET = 'AST',
  REQUEST = 'RO',
  LOAN = 'RL',
  RETURN = 'RTN',
  HANDOVER = 'HO',
  INSTALLATION = 'INST',
  DISMANTLE = 'DSM',
  MAINTENANCE = 'MNT',
}

/**
 * Configuration for document number formats
 */
interface DocNumberConfig {
  prefix: string;
  table: string;
  idField: string;
  format: 'YEAR' | 'YEAR_MONTH' | 'YEAR_MONTH_DAY';
  sequenceLength: number;
}

const DOC_CONFIGS: Record<DocumentType, DocNumberConfig> = {
  [DocumentType.ASSET]: {
    prefix: 'AST',
    table: 'Asset',
    idField: 'id',
    format: 'YEAR',
    sequenceLength: 4,
  },
  [DocumentType.REQUEST]: {
    prefix: 'RO',
    table: 'Request',
    idField: 'docNumber',
    format: 'YEAR_MONTH_DAY',
    sequenceLength: 4,
  },
  [DocumentType.LOAN]: {
    prefix: 'RL',
    table: 'LoanRequest',
    idField: 'docNumber',
    format: 'YEAR_MONTH',
    sequenceLength: 4,
  },
  [DocumentType.RETURN]: {
    prefix: 'RTN',
    table: 'AssetReturn',
    idField: 'docNumber',
    format: 'YEAR_MONTH',
    sequenceLength: 4,
  },
  [DocumentType.HANDOVER]: {
    prefix: 'HO',
    table: 'Handover',
    idField: 'docNumber',
    format: 'YEAR_MONTH',
    sequenceLength: 4,
  },
  [DocumentType.INSTALLATION]: {
    prefix: 'INST',
    table: 'Installation',
    idField: 'docNumber',
    format: 'YEAR_MONTH',
    sequenceLength: 4,
  },
  [DocumentType.DISMANTLE]: {
    prefix: 'DSM',
    table: 'Dismantle',
    idField: 'docNumber',
    format: 'YEAR_MONTH',
    sequenceLength: 4,
  },
  [DocumentType.MAINTENANCE]: {
    prefix: 'MNT',
    table: 'Maintenance',
    idField: 'docNumber',
    format: 'YEAR_MONTH',
    sequenceLength: 4,
  },
};

@Injectable()
export class DocumentNumberService {
  constructor(private prisma: PrismaService) {}

  /**
   * Generate unique document number for any entity type
   *
   * @param type - The document type (ASSET, REQUEST, LOAN, etc.)
   * @param customDate - Optional custom date (defaults to now)
   * @returns Unique document number string
   *
   * @example
   * // Generate asset ID: AST-2026-0001
   * const assetId = await docNumberService.generate(DocumentType.ASSET);
   *
   * @example
   * // Generate request number: RO-2026-0119-0001
   * const reqNumber = await docNumberService.generate(DocumentType.REQUEST);
   */
  async generate(type: DocumentType, customDate?: Date): Promise<string> {
    const config = DOC_CONFIGS[type];
    const now = customDate || new Date();

    const prefix = this.buildPrefix(config, now);
    const lastNumber = await this.findLastNumber(config, prefix);
    // PERBAIKAN LINE 120: Menghapus argumen 'config' yang tidak digunakan
    const sequence = this.extractSequence(lastNumber) + 1;

    return `${prefix}${sequence.toString().padStart(config.sequenceLength, '0')}`;
  }

  /**
   * Generate document number within a transaction
   * Use this when the document is created inside a Prisma transaction
   */
  async generateInTransaction(
    type: DocumentType,
    tx: PrismaService,
    customDate?: Date,
  ): Promise<string> {
    const config = DOC_CONFIGS[type];
    const now = customDate || new Date();

    const prefix = this.buildPrefix(config, now);
    const lastNumber = await this.findLastNumberInTx(config, prefix, tx);
    // PERBAIKAN LINE 137: Menghapus argumen 'config' yang tidak digunakan
    const sequence = this.extractSequence(lastNumber) + 1;

    return `${prefix}${sequence.toString().padStart(config.sequenceLength, '0')}`;
  }

  /**
   * Build the prefix part of the document number based on format
   */
  private buildPrefix(config: DocNumberConfig, date: Date): string {
    const year = date.getFullYear();
    const month = String(date.getMonth() + 1).padStart(2, '0');
    const day = String(date.getDate()).padStart(2, '0');

    switch (config.format) {
      case 'YEAR':
        return `${config.prefix}-${year}-`;
      case 'YEAR_MONTH':
        return `${config.prefix}-${year}-${month}-`;
      case 'YEAR_MONTH_DAY':
        return `${config.prefix}-${year}-${month}${day}-`;
      default:
        return `${config.prefix}-${year}-`;
    }
  }

  /**
   * Find the last document number with the given prefix
   */
  private async findLastNumber(config: DocNumberConfig, prefix: string): Promise<string | null> {
    // Use raw query for dynamic table name
    const result = await this.prisma.$queryRawUnsafe<{ id: string }[]>(`
      SELECT "${config.idField}" as id 
      FROM "${config.table}" 
      WHERE "${config.idField}" LIKE '${prefix}%' 
      ORDER BY "${config.idField}" DESC 
      LIMIT 1
    `);

    return result.length > 0 ? result[0].id : null;
  }

  /**
   * Find the last document number within a transaction
   */
  private async findLastNumberInTx(
    config: DocNumberConfig,
    prefix: string,
    tx: PrismaService,
  ): Promise<string | null> {
    const result = (await tx.$queryRawUnsafe(`
      SELECT "${config.idField}" as id 
      FROM "${config.table}" 
      WHERE "${config.idField}" LIKE '${prefix}%' 
      ORDER BY "${config.idField}" DESC 
      LIMIT 1
    `)) as { id: string }[];

    return result.length > 0 ? result[0].id : null;
  }

  /**
   * Extract sequence number from a document number
   */
  // PERBAIKAN LINE 209: Menghapus parameter 'config'
  private extractSequence(docNumber: string | null): number {
    if (!docNumber) return 0;

    const parts = docNumber.split('-');
    const lastPart = parts[parts.length - 1];
    return parseInt(lastPart, 10) || 0;
  }

  /**
   * Validate document number format
   */
  validateFormat(docNumber: string, type: DocumentType): boolean {
    const config = DOC_CONFIGS[type];
    const regex = this.buildFormatRegex(config);
    return regex.test(docNumber);
  }

  /**
   * Build regex for document number validation
   */
  private buildFormatRegex(config: DocNumberConfig): RegExp {
    const seqPattern = `\\d{${config.sequenceLength}}`;

    switch (config.format) {
      case 'YEAR':
        return new RegExp(`^${config.prefix}-\\d{4}-${seqPattern}$`);
      case 'YEAR_MONTH':
        return new RegExp(`^${config.prefix}-\\d{4}-\\d{2}-${seqPattern}$`);
      case 'YEAR_MONTH_DAY':
        return new RegExp(`^${config.prefix}-\\d{4}-\\d{4}-${seqPattern}$`);
      default:
        return new RegExp(`^${config.prefix}-\\d{4}-${seqPattern}$`);
    }
  }

  /**
   * Parse document number into components
   */
  parseDocNumber(docNumber: string): {
    prefix: string;
    year: number;
    month?: number;
    day?: number;
    sequence: number;
  } | null {
    const parts = docNumber.split('-');
    if (parts.length < 3) return null;

    const prefix = parts[0];
    const year = parseInt(parts[1], 10);
    const sequence = parseInt(parts[parts.length - 1], 10);

    let month: number | undefined;
    let day: number | undefined;

    if (parts.length === 4) {
      // Could be YEAR_MONTH or YEAR_MONTH_DAY
      const middlePart = parts[2];
      if (middlePart.length === 2) {
        month = parseInt(middlePart, 10);
      } else if (middlePart.length === 4) {
        month = parseInt(middlePart.substring(0, 2), 10);
        day = parseInt(middlePart.substring(2, 4), 10);
      }
    }

    return { prefix, year, month, day, sequence };
  }
}
