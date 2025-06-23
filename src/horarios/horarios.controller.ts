import { Controller, Get, Post, Body, Patch, Param, Delete, UseGuards, Req } from '@nestjs/common';
import { HorariosService } from './horarios.service';
import { CreateHorarioDto } from './dto/create-horario.dto';
import { UpdateHorarioDto } from './dto/update-horario.dto';
import { AuthGuard } from 'src/auth/guard/auth.guard';
import { Roles } from 'src/auth/decorador/roles.decorator';

@Controller('horarios')
@UseGuards(AuthGuard)
export class HorariosController {
  constructor(private readonly horariosService: HorariosService) {}

  @Post()
  @Roles('administrador', 'encargado-registro')
  create(@Body() createHorarioDto: CreateHorarioDto, @Req() req: any) {
    const usuario = req.usuario;
    return this.horariosService.create(createHorarioDto, usuario);
  }

  @Get()
  @Roles('administrador', 'encargado-registro')
  findAll() {
    return this.horariosService.findAll();
  }

  @Get(':id')
  @Roles('administrador', 'encargado-registro')
  findOne(@Param('id') id: string) {
    return this.horariosService.findOne(id);
  }

  @Patch(':id')
  @Roles('administrador', 'encargado-registro')
  update(@Param('id') id: string, @Body() updateHorarioDto: UpdateHorarioDto, @Req() req: any) {
    const usuario = req.usuario;
    return this.horariosService.update(id, updateHorarioDto, usuario);
  }

  @Delete(':id')
  @Roles('administrador', 'encargado-registro')
  remove(@Param('id') id: string) {
    return this.horariosService.remove(id);
  }
}
