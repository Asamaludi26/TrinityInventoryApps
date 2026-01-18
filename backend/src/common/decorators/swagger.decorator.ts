import { applyDecorators } from '@nestjs/common';
import { ApiOperation, ApiResponse, ApiQuery, ApiParam } from '@nestjs/swagger';

/**
 * Swagger decorator for paginated list endpoints
 */
export function ApiPaginatedResponse(description: string) {
  return applyDecorators(
    ApiOperation({ summary: description }),
    ApiQuery({
      name: 'page',
      required: false,
      type: Number,
      description: 'Page number (default: 1)',
    }),
    ApiQuery({
      name: 'limit',
      required: false,
      type: Number,
      description: 'Items per page (default: 10, max: 100)',
    }),
    ApiQuery({ name: 'search', required: false, type: String, description: 'Search term' }),
    ApiQuery({ name: 'sortBy', required: false, type: String, description: 'Sort field' }),
    ApiQuery({
      name: 'sortOrder',
      required: false,
      enum: ['asc', 'desc'],
      description: 'Sort order',
    }),
    ApiResponse({ status: 200, description: 'Successfully retrieved list' }),
    ApiResponse({ status: 401, description: 'Unauthorized' }),
  );
}

/**
 * Swagger decorator for single resource endpoints
 */
export function ApiResourceResponse(resourceName: string) {
  return applyDecorators(
    ApiParam({ name: 'id', description: `${resourceName} ID` }),
    ApiResponse({ status: 200, description: `${resourceName} found` }),
    ApiResponse({ status: 404, description: `${resourceName} not found` }),
    ApiResponse({ status: 401, description: 'Unauthorized' }),
  );
}
