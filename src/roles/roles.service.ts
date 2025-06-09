import { Injectable } from '@nestjs/common';
import { CreateRolDto } from './dto/create-rol.dto';
import { UpdateRolDto } from './dto/update-rol.dto';
import { Rol } from './entities/rol.entity';
import { Repository } from 'typeorm';
import { InjectRepository } from '@nestjs/typeorm';
import * as dayjs from 'dayjs';
import 'dayjs/locale/es'; // Carga el idioma español
dayjs.locale('es'); // Configura el idioma español globalmente

@Injectable()
export class RolesService {
  constructor(
    @InjectRepository(Rol)
    private readonly rolRepository: Repository<Rol>,
  ) {}

  async create(createRolDto: CreateRolDto) {
    const { createdInfo, ...restoDto } = createRolDto;

    const fecha = dayjs().format('DD/MM/YYYY [a las] HH:mm');
    const mensaje = `Creado por el usuario ${createdInfo} el día ${fecha}`;

    const rol = this.rolRepository.create({
      ...restoDto,
      createdInfo: mensaje,
    });

    return await this.rolRepository.save(rol);
  }

  async findAll() {
    return await this.rolRepository.find();
  }

  async findOne(id: string) {
    return await this.rolRepository.findOneBy({ id });
  }

  async findByName(nombre: string) {
    return await this.rolRepository.findOneBy({ nombre });
  }

  async update(id: string, updateRolDto: UpdateRolDto) {
    const { updatedInfo, ...restoDto } = updateRolDto;

    const fecha = dayjs().format('DD/MM/YYYY [a las] HH:mm'); // Ej: 06/06/2025 a las 18:45

    const mensaje = `Actualizado por el usuario ${updatedInfo} el día ${fecha}`;

    return await this.rolRepository.update(id, {
      ...restoDto,
      updatedInfo: mensaje,
    });
  }

  remove(id: string) {
    return this.rolRepository.delete(id);
  }
}
