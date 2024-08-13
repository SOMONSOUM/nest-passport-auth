import { Args, Context, Mutation, Query, Resolver } from '@nestjs/graphql';
import { AuthService } from './auth.service';
import { LoginResponse } from './dto/response/login.response';
import { LoginInput } from './dto/input/login.input';
import { CurrentUser, Public } from './decorators';
import { UserResponse } from '../user/dto/response/user.response';
import { RefreshTokenResponse } from './dto/response/refresh-token.response';
import { GqlContext } from 'src/common/interfaces';
import { UseGuards } from '@nestjs/common';
import { JwtRefreshTokenGuard } from './guards';

@Resolver()
export class AuthResolver {
  constructor(private readonly authService: AuthService) {}

  @Public()
  @Mutation(() => LoginResponse)
  async login(
    @Args('input') input: LoginInput,
    @Context() ctx: GqlContext,
  ): Promise<LoginResponse> {
    const { res } = ctx;
    const { accessToken, refreshToken } = await this.authService.login(
      input,
      res,
    );

    return {
      error: accessToken ? 0 : 1,
      message: accessToken ? 'OK' : 'Failed to login',
      accessToken,
      refreshToken,
    };
  }

  @Public()
  @UseGuards(JwtRefreshTokenGuard)
  @Mutation(() => RefreshTokenResponse)
  async refreshToken(
    @Context() ctx: GqlContext,
  ): Promise<RefreshTokenResponse> {
    const { req, res } = ctx;
    const { accessToken, refreshToken } = await this.authService.refreshToken(
      req,
      res,
    );

    return {
      error: accessToken ? 0 : 1,
      message: accessToken ? 'OK' : 'Failed to login',
      accessToken,
      refreshToken,
    };
  }

  @Query(() => UserResponse)
  async getMe(@CurrentUser() user: UserResponse): Promise<UserResponse> {
    return user;
  }
}
