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
import { EstudiantesService } from './estudiantes.service';
import { CreateEstudianteDto } from './dto/create-estudiante.dto';
import { UpdateEstudianteDto } from './dto/update-estudiante.dto';
import { AuthGuard } from 'src/auth/guard/auth.guard';
import { Roles } from 'src/auth/decorador/roles.decorator';
import { CreateUsuarioEstudianteDto } from './dto/create-usuarioEstudiante.dto';
import { UpdateUsuarioEstudianteDto } from './dto/update-usuarioEstudiante.dto';

@Controller('estudiantes')
@UseGuards(AuthGuard)
export class EstudiantesController {
  constructor(private readonly estudiantesService: EstudiantesService) {}

  @Post('registro-estudiante')
  @Roles('administrador', 'director')
  createUsuarioYEstudiante(@Body() dto: CreateUsuarioEstudianteDto, @Req() req: any) {
    const usuario = req.usuario;
    return this.estudiantesService.crearUsuarioYEstudiante(dto, usuario);
  }

  @Post()
  @Roles('administrador', 'director')
  create(@Body() createEstudianteDto: CreateEstudianteDto, @Req() req: any) {
    const usuario = req.usuario; // o req.user, según cómo lo guardaste en el guard
    return this.estudiantesService.create(createEstudianteDto, usuario);
  }

  @Get()
  @Roles('administrador', 'director')
  findAll() {
    return this.estudiantesService.findAll();
  }

  @Get(':id')
  @Roles('administrador', 'director')
  findOne(@Param('id') id: string) {
    return this.estudiantesService.findOne(id);
  }

  @Patch(':id')
  @Roles('administrador', 'director')
  update(@Param('id') id: string, @Body() updateEstudianteDto: UpdateEstudianteDto, @Req() req: any) {
    const usuario = req.usuario;
    return this.estudiantesService.update(id, updateEstudianteDto, usuario);
  }

  @Patch('usuario-estudiante/:id')
  @Roles('administrador', 'director')
  updateEstudianteYUsuario( @Param('id') id: string, @Body() dto: UpdateUsuarioEstudianteDto, @Req() req: any) {
    return this.estudiantesService.updateEstudianteYUsuario(id, dto, req.usuario);
  }


  @Delete(':id')
  @Roles('administrador', 'director')
  remove(@Param('id') id: string, @Req() req: any) {
    const usuario = req.usuario;
    return this.estudiantesService.remove(id, usuario);
  }
}
