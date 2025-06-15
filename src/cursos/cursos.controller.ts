import { Controller, Get, Post, Body, Patch, Param, Delete, Req, UseGuards } from '@nestjs/common';
import { CursosService } from './cursos.service';
import { CreateCursoDto } from './dto/create-curso.dto';
import { UpdateCursoDto } from './dto/update-curso.dto';
import { Roles } from 'src/auth/decorador/roles.decorator';
import { AuthGuard } from 'src/auth/guard/auth.guard';

@Controller('cursos')
@UseGuards(AuthGuard)
export class CursosController {
  constructor(private readonly cursosService: CursosService) {}

  @Post()
  @Roles('administrador', 'director')
  create(@Body() createCursoDto: CreateCursoDto, @Req() req: any) {
    const usuario = req.usuario;
    return this.cursosService.create(createCursoDto, usuario);
  }

  @Get()
  @Roles('administrador', 'director')
  findAll() {
    return this.cursosService.findAll();
  }

  @Get(':id')
  @Roles('administrador', 'director')
  findOne(@Param('id') id: string) {
    return this.cursosService.findOne(id);
  }

  @Patch(':id')
  @Roles('administrador', 'director')
  @Roles('administrador', 'director')
  update(@Param('id') id: string, @Body() updateCursoDto: UpdateCursoDto, @Req() req: any) {
    const usuario = req.usuario;
    return this.cursosService.update(id, updateCursoDto, usuario);
  }

  @Delete(':id')
  @Roles('administrador', 'director')
  remove(@Param('id') id: string) {
    return this.cursosService.remove(id);
  }
}
