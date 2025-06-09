import {
  Injectable,
  InternalServerErrorException,
  NotFoundException,
} from '@nestjs/common';
import { CreateEmpleadoDto } from './dto/create-empleado.dto';
import { UpdateEmpleadoDto } from './dto/update-empleado.dto';
import { InjectRepository } from '@nestjs/typeorm';
import { Empleado } from './entities/empleado.entity';
import { Repository } from 'typeorm';
import { UsuariosService } from 'src/usuarios/usuarios.service';

import { Usuario } from 'src/usuarios/entities/usuario.entity';
import * as dayjs from 'dayjs';
import 'dayjs/locale/es'; // Carga el idioma español
import { EmpleadoPlano } from './interfaz/empleado-plano.interface';
dayjs.locale('es'); // Configura el idioma español globalmente

@Injectable()
export class EmpleadosService {
  constructor(
    @InjectRepository(Empleado)
    private readonly empleadosRepository: Repository<Empleado>,
    private readonly usuariosService: UsuariosService,
  ) {}
  async create(createEmpleadoDto: CreateEmpleadoDto) {
    const { correo, createdInfo, ...restoDto } = createEmpleadoDto;

    try {
      // const usuario = await this.usuariosRepository.findOne({
      //   where: { id: idUsuario },
      // });
      const usuario = await this.usuariosService.findByCorreo(correo);

      if (!usuario) {
        throw new NotFoundException(
          `No existe un usuario con el correo ${correo}`,
        );
      }

      const fecha = dayjs().format('DD/MM/YYYY [a las] HH:mm');
      const mensaje = `Creado por el usuario ${createdInfo} el día ${fecha}`;

      const empleado = this.empleadosRepository.create({
        ...restoDto,
        // usuario: { id: idUsuario }, // Asigna el ID dentro de un objeto Usuario
        usuario,
        createdInfo: mensaje,
      });

      return await this.empleadosRepository.save(empleado);
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

  async findOne(id: string): Promise<void> {
    return await this.empleadosRepository
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
  }

  async update(id: string, updateEmpleadoDto: UpdateEmpleadoDto) {
    const { correo, updatedInfo, ...restoDto } = updateEmpleadoDto;
    try {
      const empleado = await this.empleadosRepository.findOne({
        where: { id: id, borradoLogico: false },
      });
      if (!empleado) {
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

      return await this.empleadosRepository.update(id, datosActualizar);
    } catch (error) {
      if (error instanceof NotFoundException) throw error;
      throw new InternalServerErrorException('Error al actualizar el empleado');
    }
  }

  async remove(id: string) {
        const mensaje = 'Registro marcado como eliminado por el usuario tal';

   return await this.empleadosRepository.update(id, {
      borradoLogico: true,
      updatedInfo: mensaje,
    });
  }
}
