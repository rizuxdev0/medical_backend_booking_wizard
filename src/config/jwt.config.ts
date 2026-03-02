import { JwtModuleOptions } from '@nestjs/jwt';

export const jwtConfig = (): JwtModuleOptions => ({
  secret: process.env.JWT_SECRET,
  signOptions: {
    expiresIn: Number(process.env.JWT_EXPIRES_IN) || 7 * 24 * 60 * 60,
  }, // Convert to seconds
});
