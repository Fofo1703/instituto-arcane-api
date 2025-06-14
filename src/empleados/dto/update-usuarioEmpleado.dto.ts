import { PartialType } from '@nestjs/mapped-types';
import { CreateUsuarioEmpleadoDto } from './create-usuarioEmpleado.dto';


export class UpdateUsuarioEmpleadoDto extends PartialType(CreateUsuarioEmpleadoDto) {}