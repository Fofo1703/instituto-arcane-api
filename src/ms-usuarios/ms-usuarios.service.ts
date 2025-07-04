import { Injectable } from '@nestjs/common';
import { CreateMsUsuarioDto } from './dto/create-ms-usuario.dto';
import { UpdateMsUsuarioDto } from './dto/update-ms-usuario.dto';

@Injectable()
export class MsUsuariosService {
  create(createMsUsuarioDto: CreateMsUsuarioDto) {
    return 'This action adds a new msUsuario';
  }

  findAll() {
    return `This action returns all msUsuarios`;
  }

  findOne(id: number) {
    return `This action returns a #${id} msUsuario`;
  }

  update(id: number, updateMsUsuarioDto: UpdateMsUsuarioDto) {
    return `This action updates a #${id} msUsuario`;
  }

  remove(id: number) {
    return `This action removes a #${id} msUsuario`;
  }
}
