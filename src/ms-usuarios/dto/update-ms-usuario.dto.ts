import { PartialType } from '@nestjs/mapped-types';
import { CreateMsUsuarioDto } from './create-ms-usuario.dto';

export class UpdateMsUsuarioDto extends PartialType(CreateMsUsuarioDto) {
  id: number;
}
