import {
  Controller,
  Get,
  Post,
  Body,
  Patch,
  Param,
  Delete,
  UseGuards,
  Req,
} from '@nestjs/common';
import { UsuariosService } from './usuarios.service';
import { CreateUsuarioDto } from './dto/create-usuario.dto';
import { UpdateUsuarioDto } from './dto/update-usuario.dto';
import { AuthGuard } from 'src/auth/guard/auth.guard';
import { Roles } from 'src/auth/decorador/roles.decorator';

@Controller('usuarios')
@UseGuards(AuthGuard)
export class UsuariosController {
  constructor(private readonly usuariosService: UsuariosService) {}

  @Post()
  @Roles('administrador', 'encargado-registro')
  create(@Body() createUsuarioDto: CreateUsuarioDto, @Req() req: any) {
    const usuario = req.usuario; // o req.user, según cómo lo guardaste en el guard
    return this.usuariosService.create(createUsuarioDto, usuario);
  }

  @Get()
  @Roles('administrador', 'encargado-registro')
  findAll() {
    return this.usuariosService.findAll();
  }

  @Get(':id')
  @Roles('administrador', 'encargado-registro')
  findOne(@Param('id') id: string) {
    return this.usuariosService.findOne(id);
  }

  @Patch(':id')
  @Roles('administrador', 'encargado-registro')
  update(
    @Param('id') id: string,
    @Body() updateUsuarioDto: UpdateUsuarioDto,
    @Req() req: any,
  ) {
    const usuario = req.usuario;
    return this.usuariosService.update(id, updateUsuarioDto, usuario);
  }

  @Delete(':id')
  @Roles('administrador', 'encargado-registro')
  remove(@Param('id') id: string, @Req() req: any) {
    const usuario = req.usuario;
    return this.usuariosService.remove(id, usuario);
  }
}
