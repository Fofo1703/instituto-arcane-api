import { PartialType } from '@nestjs/mapped-types';
import { CreateUsuarioEstudianteDto } from './create-usuarioEstudiante.dto';

export class UpdateUsuarioEstudianteDto extends PartialType(CreateUsuarioEstudianteDto) {}
