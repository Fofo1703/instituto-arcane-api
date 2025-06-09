import {Injectable, InternalServerErrorException, NotFoundException } from '@nestjs/common';
import { CreateEstudianteDto } from './dto/create-estudiante.dto';
import { UpdateEstudianteDto } from './dto/update-estudiante.dto';
import { InjectRepository } from '@nestjs/typeorm';
import { Estudiante } from './entities/estudiante.entity';
import { Repository } from 'typeorm';
import { EstudiantePlano } from './interfaz/estudiante-plano.interface';
import { UsuariosService } from 'src/usuarios/usuarios.service';
import { Usuario } from 'src/usuarios/entities/usuario.entity';
import * as dayjs from 'dayjs';
import 'dayjs/locale/es'; // Carga el idioma español

dayjs.locale('es'); // Configura el idioma español globalmente

@Injectable()
export class EstudiantesService {
  constructor(
    @InjectRepository(Estudiante)
    private readonly estudiantesRepository: Repository<Estudiante>,
    
    private readonly usuariosService: UsuariosService,
  ) {}

  async create(createEstudianteDto: CreateEstudianteDto) {
    const { correo, createdInfo, ...restoDto } = createEstudianteDto;

    try {
      // const usuario = await this.usuariosRepository.findOne({
      //   where: { id: idUsuario },
      // });
      const usuario = await this.usuariosService.findByCorreo(correo);

      if (!usuario) {
        throw new NotFoundException(`No existe un usuario con el correo ${correo}`);
      }

      const fecha = dayjs().format('DD/MM/YYYY [a las] HH:mm');
      const mensaje = `Creado por el usuario ${createdInfo} el día ${fecha}`;

      const estudiante = this.estudiantesRepository.create({
        ...restoDto,
        // usuario: { id: idUsuario }, // Asigna el ID dentro de un objeto Usuario
        usuario,
        createdInfo: mensaje,
      });

      return await this.estudiantesRepository.save(estudiante);
    } catch (error) {
      if (error instanceof NotFoundException) {
        throw error; // re-lanzamos si es el error esperado
      }

      // Aquí puede ser por problemas de conexión, FK, validación, etc.
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

  async update(id: string, updateEstudianteDto: UpdateEstudianteDto) {
    const { correo, updatedInfo, ...restoDto } = updateEstudianteDto;
    try {
      const estudiante = await this.estudiantesRepository.findOne({
        where: { id: id, borradoLogico: false },
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
      const mensaje = `Actualizado por el usuario ${updatedInfo} el día ${fecha}`;

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
      throw new InternalServerErrorException('Error al actualizar el estudiante');
    }
  }

  async remove(id: string) {
    const mensaje = 'Registro marcado como eliminado por el usuario tal';

   return await this.estudiantesRepository.update(id, {
      borradoLogico: true,
      updatedInfo: mensaje,
    });

  }
}
