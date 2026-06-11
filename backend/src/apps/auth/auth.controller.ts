import { Body, Controller, Post, Res, UseGuards } from '@nestjs/common';
import { AuthService } from './auth.service';
import { RegisterDto } from './dto/register.dto';
import { LoginDto } from './dto/login.dto';
import { Public } from '../../guards/public.decorator';
import { ThrottlerGuard } from '@nestjs/throttler';

@Controller('auth')
@UseGuards(ThrottlerGuard)
export class AuthController {
  constructor(private readonly authService: AuthService) {}

  @Public()
  @Post('register')
  async register(@Body() registerDto: RegisterDto) {
    return this.authService.register(registerDto);
  }

  @Public()
  @Post('login')
  async login(
    @Body() loginDto: LoginDto,
    @Res({ passthrough: true }) res: any,
  ) {
    const result = await this.authService.login(loginDto);

    const baseCookieOptions = {
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production',
      maxAge: 24 * 60 * 60 * 1000,
    };

    res.cookie('access_token', result.token, {
      ...baseCookieOptions,
      // Allow cross-site cookies only in production. Since in local can't use cross-site cookies.
      ...(process.env.NODE_ENV === 'production' ? { sameSite: 'none' } : {}),
    });

    return {
      user: result.user,
      token: result.token,
    };
  }

  @Post('logout')
  async logout(@Res({ passthrough: true }) res: any) {
    const baseCookieOptions = {
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production',
    };

    res.clearCookie('access_token', {
      ...baseCookieOptions,
      ...(process.env.NODE_ENV === 'production' ? { sameSite: 'none' } : {}),
    });
    return { message: 'Logged out successfully' };
  }
}
