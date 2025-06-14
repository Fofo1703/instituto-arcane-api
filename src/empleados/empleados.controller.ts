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
import { EmpleadosService } from './empleados.service';
import { CreateEmpleadoDto } from './dto/create-empleado.dto';
import { UpdateEmpleadoDto } from './dto/update-empleado.dto';
import { AuthGuard } from 'src/auth/guard/auth.guard';
import { Roles } from 'src/auth/decorador/roles.decorator';
import { CreateUsuarioEmpleadoDto } from './dto/create-usuarioEmpleado.dto';
import { UpdateUsuarioEmpleadoDto } from './dto/update-usuarioEmpleado.dto';

@Controller('empleados')
@UseGuards(AuthGuard)
export class EmpleadosController {
  constructor(private readonly empleadosService: EmpleadosService) {}

    @Post('registro-empleado')
    @Roles('administrador', 'director')
    createUsuarioYEempleado(@Body() dto: CreateUsuarioEmpleadoDto, @Req() req: any) {
      const usuario = req.usuario;
      return this.empleadosService.crearUsuarioYEmpleado(dto, usuario);
    }
  
  @Post()
  @Roles('administrador', 'director')
  create(@Body() createEmpleadoDto: CreateEmpleadoDto, @Req() req: any) {
    const usuario = req.usuario; // o req.user, según cómo lo guardaste en el guard
    return this.empleadosService.create(createEmpleadoDto, usuario);
  }

  @Get()
  @Roles('administrador', 'director')
  findAll() {
    return this.empleadosService.findAll();
  }

  @Get(':id')
  @Roles('administrador', 'director')
  findOne(@Param('id') id: string) {
    return this.empleadosService.findOne(id);
  }

  @Patch(':id')
  @Roles('administrador', 'director')
  update(@Param('id') id: string, @Body() updateEmpleadoDto: UpdateEmpleadoDto, @Req() req: any) {
    const usuario = req.usuario;
    return this.empleadosService.update(id, updateEmpleadoDto, usuario);
  }

  @Patch('usuario-empleado/:id')
  @Roles('administrador', 'director')
  updateEmpleadoYUsuario( @Param('id') id: string, @Body() dto: UpdateUsuarioEmpleadoDto, @Req() req: any) {
    return this.empleadosService.updateEmpleadoYUsuario(id, dto, req.usuario);
  }

  @Delete(':id')
  @Roles('administrador', 'director')
  remove(@Param('id') id: string, @Req() req: any) {
    const usuario = req.usuario;
    return this.empleadosService.remove(id, usuario);
  }
}
