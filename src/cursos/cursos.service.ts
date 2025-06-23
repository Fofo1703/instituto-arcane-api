import { Injectable } from '@nestjs/common';
import { CreateCursoDto } from './dto/create-curso.dto';
import { UpdateCursoDto } from './dto/update-curso.dto';
import { Repository } from 'typeorm';
import { Curso } from './entities/curso.entity';

import * as dayjs from 'dayjs';
import 'dayjs/locale/es'; // Carga el idioma español
import { InjectRepository } from '@nestjs/typeorm';
dayjs.locale('es'); // Configura el idioma español globalmente

@Injectable()
export class CursosService {
  constructor(
    @InjectRepository(Curso)
    private readonly cursosRepository: Repository<Curso>
  ) {}
  async create(createCursoDto: CreateCursoDto, usuarioToken: any) {
    const fecha = dayjs().format('DD/MM/YYYY [a las] HH:mm');
    const mensaje = `Creado por el usuario ${usuarioToken.usuario} el día ${fecha}`;
    const curso = this.cursosRepository.create({
      ...createCursoDto,
      createdInfo: mensaje,
    });
    return await this.cursosRepository.save(curso);
  }

async findAll() {
  return await this.cursosRepository.find({
    relations: ['horarios'], // Carga la relación con Horario
  });
}


  async findOne(id: string) {
    return await this.cursosRepository.findOneBy({ id });
  }

  async update(id: string, updateCursoDto: UpdateCursoDto, usuarioToken: any) {
    const fecha = dayjs().format('DD/MM/YYYY [a las] HH:mm');
    const mensaje = `Actualizado por el usuario ${usuarioToken.usuario} el día ${fecha}`;

    const datosActualizar: any = {
      ...updateCursoDto,
      updatedInfo: mensaje,
    };
    return await this.cursosRepository.update(id, datosActualizar);
    
  }

  async remove(id: string) {
    return await this.cursosRepository.delete(id);
  }
}
