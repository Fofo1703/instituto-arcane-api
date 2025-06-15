import { Controller, Get, Post, Body, Patch, Param, Delete, UseGuards, Req } from '@nestjs/common';
import { RolesService } from './roles.service';
import { CreateRolDto } from './dto/create-rol.dto';
import { UpdateRolDto } from './dto/update-rol.dto';
import { Roles } from 'src/auth/decorador/roles.decorator';
import { AuthGuard } from 'src/auth/guard/auth.guard';


@Controller('roles')
@UseGuards(AuthGuard)
export class RolesController {
  constructor(private readonly rolesService: RolesService) {}

  @Post()
  @Roles('administrador') // 👈 Aquí defines qué roles pueden entrar
  create(@Body() createRolDto: CreateRolDto, @Req() req: any) {
    const usuario = req.usuario;
    return this.rolesService.create(createRolDto, usuario);
  }

  @Get()
  @Roles('administrador') 
  findAll() {
    return this.rolesService.findAll();
  }

  @Get(':id')
  @Roles('administrador') 
  findOne(@Param('id') id: string) {
    return this.rolesService.findOne(id);
  }

  @Patch(':id')
  @Roles('administrador') 
  update(@Param('id') id: string, @Body() updateRolDto: UpdateRolDto, @Req() req: any) {
    const usuario = req.usuario;
    return this.rolesService.update(id, updateRolDto, usuario);
  }

  @Delete(':id')
  @Roles('administrador') 
  remove(@Param('id') id: string) {
    return this.rolesService.remove(id);
  }
}
