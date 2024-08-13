import { Injectable, Logger } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { JsonWebTokenError, JwtService } from '@nestjs/jwt';
import { PassportStrategy } from '@nestjs/passport';
import { Request } from 'express';
import { GraphQLError } from 'graphql';
import { ExtractJwt, Strategy } from 'passport-jwt';
import { JwtPayload } from 'src/common/interfaces';
import { UserResponse } from 'src/modules/user/dto/response/user.response';
import { UserService } from 'src/modules/user/user.service';

@Injectable()
export class JwtAccessTokenStrategy extends PassportStrategy(
  Strategy,
  'jwt-access',
) {
  private readonly logger = new Logger(JwtAccessTokenStrategy.name);

  constructor(
    private readonly configService: ConfigService,
    private readonly userService: UserService,
    private readonly jwtService: JwtService,
  ) {
    super({
      jwtFromRequest: ExtractJwt.fromExtractors([
        (request: Request) => {
          const accessToken = this.extractTokenFromCookies(request);

          try {
            this.jwtService.verify<JwtPayload>(accessToken, {
              secret: this.configService.getOrThrow<string>(
                'ACCESS_TOKEN_SECRET',
              ),
            });
            return this.extractTokenFromCookies(request);
          } catch (error) {
            this.logger.error(error);
            if (error instanceof JsonWebTokenError) {
              throw new GraphQLError(error.message, {
                extensions: {
                  code: error.name,
                },
              });
            } else if (error instanceof GraphQLError) {
              throw error;
            } else {
              throw new GraphQLError(`You are not authenticated`, {
                extensions: {
                  code: 'UNAUTHENTICATED',
                },
              });
            }
          }
        },
      ]),
      ignoreExpiration: false,
      secretOrKey: configService.getOrThrow<string>('ACCESS_TOKEN_SECRET'),
    });
  }

  private extractTokenFromCookies(request: Request): string | undefined {
    const token = request.cookies?.accessToken;
    return token ? token : undefined;
  }

  async validate(payload: JwtPayload): Promise<UserResponse> {
    return await this.userService.findOneById(payload.sub);
  }
}
