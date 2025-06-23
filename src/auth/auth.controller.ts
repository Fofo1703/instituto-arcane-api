import {
  Body,
  Controller,
  Post,
  Req,
  Res,
} from '@nestjs/common';
import { AuthService } from './auth.service';
import { CredencialesDto } from './dto/auth.dto';
import { Request, Response } from 'express'; // 👈 el bueno

@Controller('auth')
export class AuthController {
  constructor(private readonly authService: AuthService) {}

  @Post('login')
  login(
    @Body() dto: CredencialesDto,
    @Res({ passthrough: true }) res: Response,
  ) {
    return this.authService.login(dto, res);
  }

  @Post('refresh')
  refresh(@Req() req: Request) {
    return this.authService.refreshToken(req);
  }
}
