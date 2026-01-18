import { createParamDecorator, ExecutionContext } from '@nestjs/common';

/**
 * Extract the current authenticated user from the request
 * @example
 * @Get('me')
 * getProfile(@CurrentUser() user: User) { ... }
 *
 * // Or get specific property
 * @Get('me')
 * getProfile(@CurrentUser('id') userId: number) { ... }
 */
export const CurrentUser = createParamDecorator(
  (data: string | undefined, ctx: ExecutionContext) => {
    const request = ctx.switchToHttp().getRequest();
    const user = request.user;

    if (!user) {
      return null;
    }

    return data ? user?.[data] : user;
  },
);
