import {
  Injectable,
  InternalServerErrorException,
  NotFoundException,
} from '@nestjs/common';
import { CreateUsuarioEstudianteDto } from './dto/create-usuarioEstudiante.dto';
import { CreateEstudianteDto } from './dto/create-estudiante.dto';
import { UpdateEstudianteDto } from './dto/update-estudiante.dto';
import { InjectRepository } from '@nestjs/typeorm';
import { Estudiante } from './entities/estudiante.entity';
import { Repository, DataSource } from 'typeorm';
import { EstudiantePlano } from './interfaz/estudiante-plano.interface';
import { UsuariosService } from 'src/usuarios/usuarios.service';
import { RolesService } from 'src/roles/roles.service';
import { Usuario } from 'src/usuarios/entities/usuario.entity';
import * as bcryptjs from 'bcryptjs';
import * as crypto from 'crypto';

import * as dayjs from 'dayjs';
import 'dayjs/locale/es'; // Carga el idioma español
import { UpdateUsuarioEstudianteDto } from './dto/update-usuarioEstudiante.dto';
dayjs.locale('es'); // Configura el idioma español globalmente

@Injectable()
export class EstudiantesService {
  constructor(
    @InjectRepository(Estudiante)
    private readonly estudiantesRepository: Repository<Estudiante>,
    private readonly dataSource: DataSource,
    private readonly rolesService: RolesService,
    private readonly usuariosService: UsuariosService,
  ) {}

  // services/registro.service.ts
async crearUsuarioYEstudiante(dto: CreateUsuarioEstudianteDto, usuarioToken: any) {
  const queryRunner = this.dataSource.createQueryRunner();
  await queryRunner.connect();
  await queryRunner.startTransaction();

  try {
    // Verificar rol
    const rol = await this.rolesService.findByName('estudiante');
    if (!rol) {
      throw new NotFoundException(`No existe el rol estudiante`);
    }

    // Encriptar contraseña
    const passwordGenerada = crypto.randomBytes(6).toString('base64');
    const passwordEncriptada = await bcryptjs.hash(passwordGenerada, 10);
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

    // Crear estudiante
    const estudiante = queryRunner.manager.create(Estudiante, {
      cedula: dto.cedula,
      nombre: dto.nombre,
      telefono: dto.telefono,
      carrera: dto.carrera,
      usuario: usuarioGuardado,
      createdInfo,
      borradoLogico: false,
    });
    await queryRunner.manager.save(estudiante);

    await queryRunner.commitTransaction();
    return { message: 'Usuario y estudiante creados exitosamente' };
  } catch (error) {
    await queryRunner.rollbackTransaction();
    throw new InternalServerErrorException('Error al registrar usuario y estudiante');
  } finally {
    await queryRunner.release();
  }
}

  async create(createEstudianteDto: CreateEstudianteDto, usuarioToken: any) {
    const { correo, ...restoDto } = createEstudianteDto;

    try {
      const usuario = await this.usuariosService.findByCorreo(correo);

      if (!usuario) {
        throw new NotFoundException(
          `No existe un usuario con el correo ${correo}`,
        );
      }

      const fecha = dayjs().format('DD/MM/YYYY [a las] HH:mm');
      const mensaje = `Creado por el usuario ${usuarioToken.usuario} el día ${fecha}`;

      const estudiante = this.estudiantesRepository.create({
        ...restoDto,
        usuario,
        borradoLogico: false, // 👈 se fuerza siempre a false en un nuevo registro
        createdInfo: mensaje,
      });

      return await this.estudiantesRepository.save(estudiante);
    } catch (error) {
      if (error instanceof NotFoundException) {
        throw error;
      }

      throw new InternalServerErrorException(
        'No se pudo crear el estudiante por un error en el servidor',
      );
    }
  }

  async findAll(): Promise<EstudiantePlano[]> {
    try {
      const estudiantes = await this.estudiantesRepository
        .createQueryBuilder('estudiantes')
        .leftJoin('estudiantes.usuario', 'usuario')
        .select([
          'estudiantes.id AS id',
          'estudiantes.cedula AS cedula',
          'estudiantes.nombre AS nombre',
          'estudiantes.telefono AS telefono',
          'estudiantes.carrera AS carrera',
          'estudiantes.createdInfo AS createdInfo',
          'estudiantes.updatedInfo AS updatedInfo',
          'usuario.id AS idUsuario',
        ])
        .where('estudiantes.borradoLogico = false')
        .getRawMany<EstudiantePlano>();

      if (!estudiantes || estudiantes.length === 0) {
        throw new NotFoundException('No se encontraron estudiantes activos');
      }

      return estudiantes;
    } catch (error) {
      if (error instanceof NotFoundException) {
        throw error;
      }

      throw new InternalServerErrorException(
        'Error al obtener los estudiantes desde la base de datos',
      );
    }
  }

  async findOne(id: string): Promise<void> {
    return await this.estudiantesRepository
      .createQueryBuilder('estudiante')
      .leftJoin('estudiante.usuario', 'usuario')
      .select([
        'estudiante.id AS id',
        'estudiante.cedula AS cedula',
        'estudiante.nombre AS nombre',
        'estudiante.telefono AS telefono',
        'estudiante.carrera AS carrera',
        'estudiante.createdInfo AS createdInfo',
        'estudiante.updatedInfo AS updatedInfo',
        'usuario.id AS idUsuario', // Solo el ID del usuario
      ])
      .where('estudiante.id = :id', { id })
      .andWhere('estudiante.borradoLogico = false')
      .getRawOne();
  }

  async update(
    id: string,
    updateEstudianteDto: UpdateEstudianteDto,
    usuarioToken: any,
  ) {
    const { correo, ...restoDto } = updateEstudianteDto;

    try {
      const estudiante = await this.estudiantesRepository.findOne({
        where: { id, borradoLogico: false },
      });

      if (!estudiante) {
        throw new NotFoundException(
          `No se encontró un estudiante con ID ${id}`,
        );
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

      return await this.estudiantesRepository.update(id, datosActualizar);
    } catch (error) {
      if (error instanceof NotFoundException) throw error;

      throw new InternalServerErrorException(
        'Error al actualizar el estudiante',
      );
    }
  }

  async updateEstudianteYUsuario(
  idEstudiante: string,
  dto: UpdateUsuarioEstudianteDto,
  usuarioToken: any
) {
  const queryRunner = this.dataSource.createQueryRunner();
  await queryRunner.connect();
  await queryRunner.startTransaction();

  try {
    const estudiante = await queryRunner.manager.findOne(Estudiante, {
      where: { id: idEstudiante, borradoLogico: false },
      relations: ['usuario'],
    });

    if (!estudiante) {
      throw new NotFoundException(`Estudiante con ID ${idEstudiante} no encontrado`);
    }

    const usuario = estudiante.usuario;
    if (!usuario) {
      throw new NotFoundException(`El estudiante no tiene un usuario asociado`);
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

    await queryRunner.manager.update(Usuario, usuario.id, datosUsuario);

    // --- ACTUALIZAR ESTUDIANTE ---
    const datosEstudiante: any = {
      updatedInfo: mensaje,
    };

    if (dto.cedula) datosEstudiante.cedula = dto.cedula;
    if (dto.nombre) datosEstudiante.nombre = dto.nombre;
    if (dto.telefono) datosEstudiante.telefono = dto.telefono;
    if (dto.carrera) datosEstudiante.carrera = dto.carrera;

    await queryRunner.manager.update(Estudiante, idEstudiante, datosEstudiante);

    await queryRunner.commitTransaction();

    return {
      message: 'Estudiante y usuario actualizados correctamente',
    };
  } catch (error) {
    await queryRunner.rollbackTransaction();
    if (error instanceof NotFoundException) throw error;
    throw new InternalServerErrorException('Error al actualizar estudiante y usuario');
  } finally {
    await queryRunner.release();
  }
}


  async remove(id: string, usuarioToken: any) {
    const mensaje = `Eliminado por el usuario ${usuarioToken.usuario}`;	

    return await this.estudiantesRepository.update(id, {
      borradoLogico: true,
      updatedInfo: mensaje,
    });
  }
}
