import {
  Injectable,
  InternalServerErrorException,
  UnauthorizedException,
  ConflictException,
} from '@nestjs/common';
import { UsuariosService } from 'src/usuarios/usuarios.service';
import { CredencialesDto } from './dto/auth.dto';
import * as bcryptjs from 'bcryptjs';
import { JwtService } from '@nestjs/jwt';
import { Request, Response } from 'express';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { ActiveSession } from './entities/active-session.entity';

@Injectable()
export class AuthService {
  constructor(
    private readonly usuariosService: UsuariosService,
    private readonly jwtService: JwtService,
    @InjectRepository(ActiveSession)
    private readonly activeSessionRepo: Repository<ActiveSession>,
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
        throw new UnauthorizedException('La contraseña es incorrecta');
      }

      // Verificar si ya hay una sesión activa
      const sesionActiva = await this.activeSessionRepo.findOne({
        where: { usuario: { id: usuario.id }, isActive: true },
      });

      if (sesionActiva) {
        throw new ConflictException('Este usuario ya tiene una sesión activa');
      } else {
        await this.activeSessionRepo.delete({ usuario: { id: usuario.id } });
      }

      const payload = {
        sub: usuario.id,
        usuario: usuario.usuario,
        correo: usuario.correo,
        rol: usuario.rol.nombre,
      };

      const accessToken = await this.jwtService.signAsync(payload, {
        expiresIn: '5m',
      });

      const refreshToken = await this.jwtService.signAsync(payload, {
        expiresIn: '10m',
      });

      // Guardar sesión activa
      const nuevaSesion = this.activeSessionRepo.create({
        usuario,
        token: refreshToken,
        isActive: true,
      });
      await this.activeSessionRepo.save(nuevaSesion);

      res.cookie('refreshToken', refreshToken, {
        httpOnly: true,
        secure: false, // true en producción con HTTPS
        sameSite: 'strict',
        path: '/api/v1/auth/refresh',
        maxAge: 7 * 24 * 60 * 60 * 1000, // 7 días
      });

      return { accessToken };
    } catch (error) {
      if (
        error instanceof UnauthorizedException ||
        error instanceof ConflictException
      ) {
        throw error;
      }

      throw new InternalServerErrorException('Error al verificar el usuario');
    }
  }

  async refreshToken(req: Request): Promise<{ accessToken: string }> {
    const token = req.cookies?.refreshToken;
    if (!token) throw new UnauthorizedException('No hay refresh token');

    try {
      const payload = await this.jwtService.verifyAsync(token);

      // Buscar sesión activa con el token
      const sesion = await this.activeSessionRepo.findOne({
        where: { token, isActive: true },
      });

      if (!sesion) {
        throw new UnauthorizedException('Sesión inactiva o inválida');
      }

      const newAccessToken = await this.jwtService.signAsync(
        {
          sub: payload.sub,
          usuario: payload.usuario,
          correo: payload.correo,
          rol: payload.rol,
        },
        { expiresIn: '15m' },
      );

      return { accessToken: newAccessToken };
    } catch (err) {
      // 🔥 Marcar sesión como inactiva si falla la verificación del token
      await this.activeSessionRepo.delete({ token });
      // Limpia la cookie para evitar que el cliente siga enviando un refreshToken inválido
      if ('res' in req && typeof req.res?.clearCookie === 'function') {
        req.res.clearCookie('refreshToken', { path: '/api/v1/auth/refresh' });
      }
      throw new UnauthorizedException('Refresh token inválido o expirado');
    }
  }

  async logout(req: Request, res: Response) {
    const token = req.cookies?.refreshToken;
    if (!token) {
      return { message: 'No hay sesión activa' };
    }

    // Marcar la sesión como inactiva
    await this.activeSessionRepo.delete({ token });

    res.clearCookie('refreshToken', { path: '/api/v1/auth/refresh' });

    return { message: 'Sesión cerrada correctamente' };
  }
}
