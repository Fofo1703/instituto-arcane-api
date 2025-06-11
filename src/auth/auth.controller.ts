import { Body, Controller, Get, Post, Request, UseGuards } from '@nestjs/common';
import { AuthService } from './auth.service';
import { CredencialesDto } from './dto/auth.dto';
import { AuthGuard } from './guard/auth.guard';

@Controller('auth')
export class AuthController {

    constructor(
        private readonly authService: AuthService
    ){}

    @Post('login')
    login(@Body() credencialesDto: CredencialesDto){
        return this.authService.login(credencialesDto);
    }

    @Get("prueba")
    @UseGuards(AuthGuard)
    prueba(@Request() req) {
        return req.user;
    }

}
