import {
  Injectable,
  InternalServerErrorException,
  UnauthorizedException,
} from '@nestjs/common';
import { UsuariosService } from 'src/usuarios/usuarios.service';
import { CredencialesDto } from './dto/auth.dto';
import * as bcryptjs from 'bcryptjs';
import { JwtService } from '@nestjs/jwt';
import { Request, Response } from 'express';

@Injectable()
export class AuthService {

  constructor(
    private readonly usuariosService: UsuariosService,
    private readonly jwtService: JwtService,
  ) {}

async login(credencialesDto: CredencialesDto, res: Response) {
  try {
    const usuario = await this.usuariosService.findByUsuario(
      credencialesDto.usuario,
    );

    if (!usuario) {
      throw new UnauthorizedException('El usuario no existe');
    }

    const passwordValido = await bcryptjs.compare(
      credencialesDto.password,
      usuario.password,
    );

    if (!passwordValido) {
      throw new UnauthorizedException('La contraseña es incorrecta');
    }

    const payload = {
      sub: usuario.id,
      usuario: usuario.usuario,
      correo: usuario.correo,
      rol: usuario.rol.nombre,
    };

    const accessToken = await this.jwtService.signAsync(payload, {
      expiresIn: '15m',
    });

    const refreshToken = await this.jwtService.signAsync(payload, {
      expiresIn: '7d',
    });

    // Establecer el refresh token en una cookie HttpOnly
    res.cookie('refreshToken', refreshToken, {
      httpOnly: true,//En desarrollo puedes ponerlo en false, pero en producción debe ser true
      secure: true, // en derarrollo debe ser false, Solo HTTPS en producción
      sameSite: 'strict',
      path: '/api/v1/auth/refresh', // Solo se envía en esta ruta
      maxAge: 7 * 24 * 60 * 60 * 1000, // 7 días
    });

    // Enviar el access token al frontend (en JSON)
    return { accessToken };
  } catch (error) {
    if (error instanceof UnauthorizedException) throw error;

    throw new InternalServerErrorException(
      'Error al verificar el usuario desde la base de datos',
    );
  }
}

async refreshToken(req: Request): Promise<{ accessToken: string }> {
  const token = req.cookies?.refreshToken;

  if (!token) throw new UnauthorizedException('No hay refresh token');

  try {
    const payload = await this.jwtService.verifyAsync(token, {
      // Puedes poner un JWT_REFRESH_SECRET si lo deseas separar
    });

    // Solo genera un nuevo accessToken (no refreshToken nuevo aquí)
    const newAccessToken = await this.jwtService.signAsync({
      sub: payload.sub,
      usuario: payload.usuario,
      correo: payload.correo,
      rol: payload.rol,
    }, {
      expiresIn: '15m',
    });

    return { accessToken: newAccessToken };
  } catch (err) {
    throw new UnauthorizedException('Refresh token inválido o expirado');
  }
}

  
}
