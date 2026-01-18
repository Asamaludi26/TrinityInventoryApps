import { format, parseISO, isValid, differenceInDays, startOfDay, endOfDay } from 'date-fns';
import { id } from 'date-fns/locale';

/**
 * Format date to Indonesian locale
 * @param date - Date to format
 * @param formatStr - Format string (default: 'dd MMMM yyyy')
 */
export function formatDate(date: Date | string, formatStr = 'dd MMMM yyyy'): string {
  const parsedDate = typeof date === 'string' ? parseISO(date) : date;

  if (!isValid(parsedDate)) {
    return '-';
  }

  return format(parsedDate, formatStr, { locale: id });
}

/**
 * Format date with time
 * @param date - Date to format
 */
export function formatDateTime(date: Date | string): string {
  return formatDate(date, 'dd MMMM yyyy HH:mm');
}

/**
 * Get date range for queries (start of day to end of day)
 * @param startDate - Start date
 * @param endDate - End date
 */
export function getDateRange(startDate: string, endDate: string): { gte: Date; lte: Date } {
  return {
    gte: startOfDay(parseISO(startDate)),
    lte: endOfDay(parseISO(endDate)),
  };
}

/**
 * Calculate days until warranty expires
 * @param warrantyEndDate - Warranty end date
 */
export function daysUntilWarrantyExpires(warrantyEndDate: Date | string): number {
  const endDate = typeof warrantyEndDate === 'string' ? parseISO(warrantyEndDate) : warrantyEndDate;
  return differenceInDays(endDate, new Date());
}

/**
 * Check if warranty is expired
 * @param warrantyEndDate - Warranty end date
 */
export function isWarrantyExpired(warrantyEndDate: Date | string): boolean {
  return daysUntilWarrantyExpires(warrantyEndDate) < 0;
}
