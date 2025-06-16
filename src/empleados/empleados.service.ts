import {
  Injectable,
  InternalServerErrorException,
  NotFoundException,
} from '@nestjs/common';
import { CreateEmpleadoDto } from './dto/create-empleado.dto';
import { UpdateEmpleadoDto } from './dto/update-empleado.dto';
import { CreateUsuarioEmpleadoDto } from './dto/create-usuarioEmpleado.dto';
import { EmpleadoPlano } from './interfaz/empleado-plano.interface';
import { Empleado } from './entities/empleado.entity';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository, DataSource } from 'typeorm';
import { RolesService } from 'src/roles/roles.service';
import { UsuariosService } from 'src/usuarios/usuarios.service';
import { Usuario } from 'src/usuarios/entities/usuario.entity';
import * as bcryptjs from 'bcryptjs';
import * as dayjs from 'dayjs';
import 'dayjs/locale/es'; // Carga el idioma español
import { UpdateUsuarioEmpleadoDto } from './dto/update-usuarioEmpleado.dto';
dayjs.locale('es'); // Configura el idioma español globalmente

@Injectable()
export class EmpleadosService {
  constructor(
    @InjectRepository(Empleado)
    private readonly empleadosRepository: Repository<Empleado>,
    private readonly dataSource: DataSource,
    private readonly rolesService: RolesService,
    private readonly usuariosService: UsuariosService,
  ) {}

  async crearUsuarioYEmpleado(dto: CreateUsuarioEmpleadoDto, usuarioToken: any) {
    const queryRunner = this.dataSource.createQueryRunner();
    await queryRunner.connect();
    await queryRunner.startTransaction();
  
    try {
      // Verificar rol
      const rol = await this.rolesService.findByName(dto.nombreRol);
      if (!rol) {
        throw new NotFoundException(`No existe un rol con el nombre ${dto.nombreRol}`);
      }
  
      const passwordEncriptada = await bcryptjs.hash(dto.password, 10);
      const fecha = dayjs().format('DD/MM/YYYY [a las] HH:mm');
      const createdInfo = `Creado por el usuario ${usuarioToken.usuario} el día ${fecha}`;
  
      // Crear usuario
      const usuario = queryRunner.manager.create(Usuario, {
        usuario: dto.usuario,
        password: passwordEncriptada,
        correo: dto.correo,
        rol,
        createdInfo,
        borradoLogico: false,
      });
      const usuarioGuardado = await queryRunner.manager.save(usuario);
  
      // Crear empleado
      const empleado = queryRunner.manager.create(Empleado, {
        cedula: dto.cedula,
        nombre: dto.nombre,
        telefono: dto.telefono,
        carrera: dto.carrera,
        usuario: usuarioGuardado,
        createdInfo,
        borradoLogico: false,
      });
      await queryRunner.manager.save(empleado);
  
      await queryRunner.commitTransaction();
      return { message: 'Usuario y empleado creados exitosamente' };
    } catch (error) {
      await queryRunner.rollbackTransaction();
      throw new InternalServerErrorException('Error al registrar usuario y empleado');
    } finally {
      await queryRunner.release();
    }
  }


  async create(createEmpleadoDto: CreateEmpleadoDto, usuarioToken: any) {
    const { correo, ...restoDto } = createEmpleadoDto;

    try {
      const usuario = await this.usuariosService.findByCorreo(correo);

      if (!usuario) {
        throw new NotFoundException(
          `No existe un usuario con el correo ${correo}`,
        );
      }

      const fecha = dayjs().format('DD/MM/YYYY [a las] HH:mm');
      const mensaje = `Creado por el usuario ${usuarioToken.usuario} el día ${fecha}`;

      const empleado = this.empleadosRepository.create({
        ...restoDto,
        // usuario: { id: idUsuario }, // Asigna el ID dentro de un objeto Usuario
        usuario,
        borradoLogico: false, // 👈 se fuerza siempre a false en un nuevo registro
        createdInfo: mensaje,
      });

      return await this.empleadosRepository.save(empleado);
    } catch (error) {
      if (error instanceof NotFoundException) {
        throw error;
      }

      throw new InternalServerErrorException(
        'No se pudo crear el empleado por un error en el servidor',
      );
    }
  }

  async findAll(): Promise<EmpleadoPlano[]> {
    try {
      const empleados = await this.empleadosRepository
        .createQueryBuilder('empleados')
        .leftJoin('empleados.usuario', 'usuario')
        .select([
          'empleados.id AS id',
          'empleados.cedula AS cedula',
          'empleados.nombre AS nombre',
          'empleados.telefono AS telefono',
          'empleados.carrera AS carrera',
          'empleados.createdInfo AS createdInfo',
          'empleados.updatedInfo AS updatedInfo',
          'usuario.id AS idUsuario',
        ])
        .where('empleados.borradoLogico = false')
        .getRawMany<EmpleadoPlano>();

      if (!empleados || empleados.length === 0) {
        throw new NotFoundException('No se encontraron empleados activos');
      }

      return empleados;
    } catch (error) {
      if (error instanceof NotFoundException) {
        throw error;
      }

      throw new InternalServerErrorException(
        'Error al obtener los empleados desde la base de datos',
      );
    }
  }

async findOne(id: string): Promise<EmpleadoPlano | null> {
  const empleado = await this.empleadosRepository
    .createQueryBuilder('empleado')
    .leftJoin('empleado.usuario', 'usuario')
    .select([
      'empleado.id AS id',
      'empleado.cedula AS cedula',
      'empleado.nombre AS nombre',
      'empleado.telefono AS telefono',
      'empleado.carrera AS carrera',
      'empleado.createdInfo AS createdInfo',
      'empleado.updatedInfo AS updatedInfo',
      'usuario.id AS idUsuario', // Solo el ID del usuario
    ])
    .where('empleado.id = :id', { id })
    .andWhere('empleado.borradoLogico = false')
    .getRawOne();

  return empleado ?? null; // Devuelve `null` si no hay resultado
}

  async findOneById(id: string) {
    return await this.empleadosRepository.findOneBy({ id });
  }


  async update(
    id: string,
    updateEmpleadoDto: UpdateEmpleadoDto,
    usuarioToken: any,
  ) {
    const { correo, ...restoDto } = updateEmpleadoDto;

    try {
      const empleado = await this.empleadosRepository.findOne({
        where: { id, borradoLogico: false },
      });

      if (!empleado) {
        throw new NotFoundException(`No se encontró un empleado con ID ${id}`);
      }

      let usuario: Usuario | null = null;
      if (correo) {
        usuario = await this.usuariosService.findByCorreo(correo);
        if (!usuario) {
          throw new NotFoundException(
            `No se encontró un usuario con el correo ${correo}`,
          );
        }
      }

      const fecha = dayjs().format('DD/MM/YYYY [a las] HH:mm');
      const mensaje = `Actualizado por el usuario ${usuarioToken.usuario} el día ${fecha}`;

      const datosActualizar: any = {
        ...restoDto,
        updatedInfo: mensaje,
      };

      if (correo) {
        datosActualizar.usuario = usuario;
      }

      return await this.empleadosRepository.update(id, datosActualizar);
    } catch (error) {
      if (error instanceof NotFoundException) throw error;

      throw new InternalServerErrorException('Error al actualizar el empleado');
    }
  }

    async updateEmpleadoYUsuario(
    idEmpleado: string,
    dto: UpdateUsuarioEmpleadoDto,
    usuarioToken: any
  ) {
    const queryRunner = this.dataSource.createQueryRunner();
    await queryRunner.connect();
    await queryRunner.startTransaction();
  
    try {
      const empleado = await queryRunner.manager.findOne(Empleado, {
        where: { id: idEmpleado, borradoLogico: false },
        relations: ['usuario'],
      });
  
      if (!empleado) {
        throw new NotFoundException(`Empleado con ID ${idEmpleado} no encontrado`);
      }
  
      const usuario = empleado.usuario;
      if (!usuario) {
        throw new NotFoundException(`El empleado no tiene un usuario asociado`);
      }
  
      const fecha = dayjs().format('DD/MM/YYYY [a las] HH:mm');
      const mensaje = `Actualizado por ${usuarioToken.usuario} el día ${fecha}`;
  
      // --- ACTUALIZAR USUARIO ---
      const datosUsuario: any = {
        updatedInfo: mensaje,
      };
  
      if (dto.usuario) datosUsuario.usuario = dto.usuario;
      if (dto.correo) datosUsuario.correo = dto.correo;
      if (dto.password) {
        datosUsuario.password = await bcryptjs.hash(dto.password, 10);
      }
  
      if (dto.nombreRol) {
        const rol = await this.rolesService.findByName(dto.nombreRol);
        if (!rol) throw new NotFoundException(`Rol ${dto.nombreRol} no existe`);
        datosUsuario.rol = rol;
      }
  
      await queryRunner.manager.update(Usuario, usuario.id, datosUsuario);
  
      // --- ACTUALIZAR EMPLEADO ---
      const datosEmpleado: any = {
        updatedInfo: mensaje,
      };
  
      if (dto.cedula) datosEmpleado.cedula = dto.cedula;
      if (dto.nombre) datosEmpleado.nombre = dto.nombre;
      if (dto.telefono) datosEmpleado.telefono = dto.telefono;
      if (dto.carrera) datosEmpleado.carrera = dto.carrera;
  
      await queryRunner.manager.update(Empleado, idEmpleado, datosEmpleado);
  
      await queryRunner.commitTransaction();
  
      return {
        message: 'Estudiante y usuario actualizados correctamente',
      };
    } catch (error) {
      await queryRunner.rollbackTransaction();
      if (error instanceof NotFoundException) throw error;
      throw new InternalServerErrorException('Error al actualizar empleado y usuario');
    } finally {
      await queryRunner.release();
    }
  }
  

  async remove(id: string, usuarioToken: any) {
   const mensaje = `Eliminado por el usuario ${usuarioToken.usuario}`;	

    return await this.empleadosRepository.update(id, {
      borradoLogico: true,
      updatedInfo: mensaje,
    });
  }
}
