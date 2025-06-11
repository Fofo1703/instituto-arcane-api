import {
  Injectable,
  InternalServerErrorException,
  UnauthorizedException,
} from '@nestjs/common';
import { UsuariosService } from 'src/usuarios/usuarios.service';
import { CredencialesDto } from './dto/auth.dto';
import * as bcryptjs from 'bcryptjs';
import { JwtService } from '@nestjs/jwt';

@Injectable()
export class AuthService {
  constructor(
    private readonly usuariosService: UsuariosService,
    private readonly jwtService: JwtService,
  ) {}

  async login(credencialesDto: CredencialesDto) {
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
      console.log(usuario);
      
      const payload = {
        correo: usuario.correo,
      };

      const token = await this.jwtService.signAsync(payload);
      return token;
    } catch (error) {
      if (error instanceof UnauthorizedException) {
        throw error;
      }

      throw new InternalServerErrorException(
        'Error al verificar el usuario desde la base de datos',
      );
    }
  }
}
