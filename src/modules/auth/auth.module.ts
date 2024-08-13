import { Module } from '@nestjs/common';
import { AuthResolver } from './auth.resolver';
import { UserService } from '../user/user.service';
import { TypeOrmModule } from '@nestjs/typeorm';
import { UserEntity } from '../user/entities/user.entity';
import { UserRepository } from '../user/repositories/user.repository';
import { JwtModule } from '@nestjs/jwt';
import { AuthService } from './auth.service';
import { JwtAccessTokenStrategy, JwtRefreshTokenStrategy } from './strategies';
import { APP_GUARD } from '@nestjs/core';
import { JwtAccessTokenGuard } from './guards';

@Module({
  imports: [
    JwtModule.register({
      global: true,
    }),
    TypeOrmModule.forFeature([UserEntity]),
  ],
  providers: [
    AuthResolver,
    UserService,
    UserRepository,
    AuthService,
    JwtAccessTokenStrategy,
    JwtRefreshTokenStrategy,
    { provide: APP_GUARD, useClass: JwtAccessTokenGuard },
  ],
})
export class AuthModule {}
