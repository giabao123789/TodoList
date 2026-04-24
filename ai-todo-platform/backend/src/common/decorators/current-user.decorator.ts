import { createParamDecorator, ExecutionContext } from '@nestjs/common';

export interface JwtUserPayload {
  sub: string;
  email: string;
}

export const CurrentUser = createParamDecorator(
  (data: keyof JwtUserPayload | undefined, ctx: ExecutionContext) => {
    const request = ctx.switchToHttp().getRequest();
    const user = request.user as JwtUserPayload;
    return data ? user?.[data] : user;
  },
);
