import { Controller } from '@nestjs/common';
import { MessagePattern, Payload } from '@nestjs/microservices';
import { MsUsuariosService } from './ms-usuarios.service';
import { CreateMsUsuarioDto } from './dto/create-ms-usuario.dto';
import { UpdateMsUsuarioDto } from './dto/update-ms-usuario.dto';

@Controller()
export class MsUsuariosController {
  constructor(private readonly msUsuariosService: MsUsuariosService) {}

  @MessagePattern('createMsUsuario')
  create(@Payload() createMsUsuarioDto: CreateMsUsuarioDto) {
    return this.msUsuariosService.create(createMsUsuarioDto);
  }

  @MessagePattern('findAllMsUsuarios')
  findAll() {
    return this.msUsuariosService.findAll();
  }

  @MessagePattern('findOneMsUsuario')
  findOne(@Payload() id: number) {
    return this.msUsuariosService.findOne(id);
  }

  @MessagePattern('updateMsUsuario')
  update(@Payload() updateMsUsuarioDto: UpdateMsUsuarioDto) {
    return this.msUsuariosService.update(updateMsUsuarioDto.id, updateMsUsuarioDto);
  }

  @MessagePattern('removeMsUsuario')
  remove(@Payload() id: number) {
    return this.msUsuariosService.remove(id);
  }
}
