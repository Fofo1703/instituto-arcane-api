import { Injectable, InternalServerErrorException, NotFoundException } from '@nestjs/common';
import { CreateHorarioDto } from './dto/create-horario.dto';
import { UpdateHorarioDto } from './dto/update-horario.dto';
import { Repository } from 'typeorm';
import { Horario } from './entities/horario.entity';
import { InjectRepository } from '@nestjs/typeorm';
import * as dayjs from 'dayjs';
import 'dayjs/locale/es'; // Carga el idioma español
import { CursosService } from 'src/cursos/cursos.service';
import { EmpleadosService } from 'src/empleados/empleados.service';
import { Curso } from 'src/cursos/entities/curso.entity';
import { Empleado } from 'src/empleados/entities/empleado.entity';
dayjs.locale('es'); // Configura el idioma español globalmente

@Injectable()
export class HorariosService {
  constructor(
    @InjectRepository(Horario)
    private readonly horariosRepository: Repository<Horario>,
    private readonly cursosService: CursosService,
    private readonly empleadosService: EmpleadosService,
  ) {}
  async create(createHorarioDto: CreateHorarioDto, usuarioToken: any) {
    const { idCurso, idProfesor, ...restoDto } = createHorarioDto;

    const curso = await this.cursosService.findOne(idCurso);
    if (!curso) {
      throw new NotFoundException(`No se encontro el curso`);
    }

    const empleado = await this.empleadosService.findOneById(idProfesor);
    if (!empleado) {
      throw new NotFoundException(`No se encontro el profesor`);
    }

    const fecha = dayjs().format('DD/MM/YYYY [a las] HH:mm');
    const mensaje = `Creado por el usuario ${usuarioToken.usuario} el día ${fecha}`;

    const horario = this.horariosRepository.create({
      ...restoDto,
      createdInfo: mensaje,
      curso,
      empleado,
    });

    return await this.horariosRepository.save(horario);
  }

  async findAll() {
    return await this.horariosRepository.find();
  }

  async findOne(id: string) {
    return await this.horariosRepository.findOneBy({ id });
  }

  async update(
    id: string,
    updateHorarioDto: UpdateHorarioDto,
    usuarioToken: any,
  ) {
    const { idCurso, idProfesor, ...restoDto } = updateHorarioDto;
    try {
      const horario = await this.horariosRepository.findOneBy({ id });
      if (!horario) {
        throw new NotFoundException(`No se encontro el horario`);
      }

      //si hay un curso se valida que exista
      let curso: Curso | null = null;
      if (idCurso) {
        curso = await this.cursosService.findOne(idCurso);
        if (!curso) {
          throw new NotFoundException(`No se encontró el curso seleccionado`);
        }
      }

      //si hay un profesor se valida que exista
      let profesor: Empleado | null = null;
      if (idProfesor) {
        profesor = await this.empleadosService.findOneById(idProfesor);
        if (!profesor) {
          throw new NotFoundException(
            `No se encontró el profesor seleccionado`,
          );
        }
      }

      const fecha = dayjs().format('DD/MM/YYYY [a las] HH:mm');
      const mensaje = `Actualizado por el usuario ${usuarioToken.usuario} el día ${fecha}`;

      const datosActualizar: any = {
        ...restoDto,
        updatedInfo: mensaje,
      };

      if (curso) {
        datosActualizar.curso = curso;
      }

      if (profesor) {
        datosActualizar.empleado = profesor;
      }

      return await this.horariosRepository.update(id, datosActualizar);
    } catch (error) {
      if (error instanceof NotFoundException) throw error;

      throw new InternalServerErrorException('Error al actualizar el empleado');
    }
  }

  async remove(id: string) {
    return await this.horariosRepository.delete(id);
  }
}
