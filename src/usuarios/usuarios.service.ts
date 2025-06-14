import {
  Injectable,
  InternalServerErrorException,
  NotFoundException,
} from '@nestjs/common';
import { CreateUsuarioDto } from './dto/create-usuario.dto';
import { UpdateUsuarioDto } from './dto/update-usuario.dto';
import { InjectRepository } from '@nestjs/typeorm';
import { Usuario } from './entities/usuario.entity';
import { Repository, UpdateResult } from 'typeorm';
import { Rol } from 'src/roles/entities/rol.entity';
import { UsuarioPlano } from './interfaz/usuario-plano.interface';
import { RolesService } from 'src/roles/roles.service';
import * as bcryptjs from 'bcryptjs';

import * as dayjs from 'dayjs';
import 'dayjs/locale/es'; // Carga el idioma español
dayjs.locale('es'); // Configura el idioma español globalmente

@Injectable()
export class UsuariosService {
  constructor(
    @InjectRepository(Usuario)
    private readonly usuariosRepository: Repository<Usuario>,

    private readonly rolesService: RolesService,
  ) {}

  async create(createUsuarioDto: CreateUsuarioDto, usuarioToken: any) {
    const { nombreRol, ...restoDto } = createUsuarioDto;

    try {
      // Validar si el rol existe
      const rol = await this.rolesService.findByName(nombreRol);
      if (!rol) {
        throw new NotFoundException(
          `No existe un rol con el nombre ${nombreRol}`,
        );
      }

      const fecha = dayjs().format('DD/MM/YYYY [a las] HH:mm');
      const mensaje = `Creado por el usuario ${usuarioToken.usuario} el día ${fecha}`;
      const passwordCrypt = await bcryptjs.hash(restoDto.password, 10);
      restoDto.password = passwordCrypt;
      // Crear el nuevo usuario asignando el rol completo
      const usuario = this.usuariosRepository.create({
        ...restoDto,
        rol,
        borradoLogico: false,
        createdInfo: mensaje,
      });

      // Guardar el usuario
      return await this.usuariosRepository.save(usuario);
    } catch (error) {
      
      if (error instanceof NotFoundException) {
        throw error; // re-lanzamos si es el error esperado
      }
      // Aquí puede ser por problemas de conexión, FK, validación, etc.
      throw new InternalServerErrorException(
        'No se pudo crear el usuario por un error en el servidor',
      );
    }
  }

  async findAll(): Promise<UsuarioPlano[]> {
    try {
      const usuarios = await this.usuariosRepository
        .createQueryBuilder('usuario')
        .leftJoin('usuario.rol', 'rol')
        .select([
          'usuario.id AS id',
          'usuario.usuario AS usuario',
          'usuario.correo AS correo',
          'usuario.createdInfo AS createdInfo',
          'usuario.updatedInfo AS updatedInfo',
          'rol.id AS idRol',
        ])
        .where('usuario.borradoLogico = false')
        .getRawMany<UsuarioPlano>();

      if (!usuarios || usuarios.length === 0) {
        throw new NotFoundException('No se encontraron usuarios activos');
      }

      return usuarios;
    } catch (error) {
      if (error instanceof NotFoundException) {
        throw error;
      }

      throw new InternalServerErrorException(
        'Error al obtener los usuarios desde la base de datos',
      );
    }
  }

  async findOne(id: string): Promise<UsuarioPlano> {
    try {
      const usuario = await this.usuariosRepository
        .createQueryBuilder('usuario')
        .leftJoin('usuario.rol', 'rol')
        .select([
          'usuario.id AS id',
          'usuario.usuario AS usuario',
          'usuario.correo AS correo',
          'usuario.createdInfo AS createdInfo',
          'usuario.updatedInfo AS updatedInfo',
          'rol.id AS idRol',
        ])
        .where('usuario.id = :id', { id })
        .andWhere('usuario.borradoLogico = false')
        .getRawOne<UsuarioPlano>();

      if (!usuario) {
        throw new NotFoundException(`No se encontró un usuario con ID ${id}`);
      }

      return usuario;
    } catch (error) {
      if (error instanceof NotFoundException) {
        throw error;
      }

      throw new InternalServerErrorException(
        'Error al buscar el usuario en la base de datos',
      );
    }
  }

  async findByUsuario(usuario: string) {
    return await this.usuariosRepository.findOne({
      where: { borradoLogico: false, usuario: usuario },
    });
  }

  async findByCorreo(correo: string) {
    return await this.usuariosRepository.findOne({
      where: { borradoLogico: false, correo: correo },
    });
  }

async update(id: string, updateDto: UpdateUsuarioDto, usuarioToken: any) {
  const { nombreRol, ...restoDto } = updateDto;

  try {
    // Validar si el usuario existe
    const usuario = await this.usuariosRepository.findOne({
      where: { id, borradoLogico: false },
    });
    if (!usuario) {
      throw new NotFoundException(`No se encontró un usuario con ID ${id}`);
    }

    let rol: Rol | null = null;

    if (nombreRol) {
      rol = await this.rolesService.findByName(nombreRol);
      if (!rol) {
        throw new NotFoundException(`No existe un rol con nombre ${nombreRol}`);
      }
    }

    const fecha = dayjs().format('DD/MM/YYYY [a las] HH:mm');
    const mensaje = `Actualizado por el usuario ${usuarioToken.usuario} el día ${fecha}`;

    // Construir objeto de actualización
    const datosActualizar: any = {
      ...restoDto,
      updatedInfo: mensaje,
    };

    // Si se envía una nueva contraseña, se encripta. Si no, se omite el campo para evitar `NULL`
    if (restoDto.password) {
      datosActualizar.password = await bcryptjs.hash(restoDto.password, 10);
    }

    if (rol) {
      datosActualizar.rol = rol;
    }

    // Remover `password` si no fue proporcionado para evitar que sea `NULL`
    if (!restoDto.password) {
      delete datosActualizar.password;
    }

    await this.usuariosRepository.update(id, datosActualizar);
    
    return await this.usuariosRepository.findOne({ where: { id } });
  } catch (error) {
    if (error instanceof NotFoundException) throw error;
    throw new InternalServerErrorException('Error al actualizar el usuario');
  }
}



  async remove(id: string, usuarioToken: any) {
    const mensaje = `Eliminado por el usuario ${usuarioToken.usuario}`;	

   return await this.usuariosRepository.update(id, {
      borradoLogico: true,
      updatedInfo: mensaje,
    });

  }
}
