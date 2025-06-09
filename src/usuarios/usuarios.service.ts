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
import * as dayjs from 'dayjs';
import 'dayjs/locale/es'; // Carga el idioma español
import { RolesService } from 'src/roles/roles.service';
dayjs.locale('es'); // Configura el idioma español globalmente

@Injectable()
export class UsuariosService {
  constructor(
    @InjectRepository(Usuario)
    private readonly usuariosRepository: Repository<Usuario>,

    private readonly rolesService: RolesService,
  ) {}

  async create(createUsuarioDto: CreateUsuarioDto) {
    const { nombreRol, createdInfo, ...restoDto } = createUsuarioDto;

    try {
      // Validar si el rol existe
      // const rol = await this.rolRepository.findOne({ where: { id: idRol } });
      const rol = await this.rolesService.findByName(nombreRol);
      if (!rol) {
        throw new NotFoundException(
          `No existe un rol con el nombre ${nombreRol}`,
        );
      }

      const fecha = dayjs().format('DD/MM/YYYY [a las] HH:mm');
      const mensaje = `Creado por el usuario ${createdInfo} el día ${fecha}`;

      // Crear el nuevo usuario asignando el rol completo
      const usuario = this.usuariosRepository.create({
        ...restoDto,
        rol,
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

  async findByCorreo(correo: string) {
    return await this.usuariosRepository.findOne({
      where: { borradoLogico: false, correo: correo },
    });
  }

  async update(id: string, updateDto: UpdateUsuarioDto) {
    const { nombreRol, updatedInfo, ...restoDto } = updateDto;
    
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
        // Solo validar si se envió un idRol
        // rol = await this.rolRepository.findOne({ where: { id: idRol } });
        rol = await this.rolesService.findByName(nombreRol);
        if (!rol) {
          throw new NotFoundException(`No existe un rol con ID ${nombreRol}`);
        }
      }

      const fecha = dayjs().format('DD/MM/YYYY [a las] HH:mm');
      const mensaje = `Actualizado por el usuario ${updatedInfo} el día ${fecha}`;

      // Construir el objeto de actualización excluyendo rol si no fue enviado
      const datosActualizar: any = {
        ...restoDto,
        updatedInfo: mensaje,
      };

      if (rol) {
        // datosActualizar.rol = { id: idRol };
        datosActualizar.rol = rol;
      }

      return await this.usuariosRepository.update(id, datosActualizar);
    } catch (error) {
      if (error instanceof NotFoundException) throw error;
      throw new InternalServerErrorException('Error al actualizar el usuario');
    }
    
  }

  async remove(id: string) {
    const mensaje = 'Registro marcado como eliminado por el usuario tal';

    await this.usuariosRepository.update(id, {
      borradoLogico: true,
      updatedInfo: mensaje,
    });

    return ``;
  }
}
