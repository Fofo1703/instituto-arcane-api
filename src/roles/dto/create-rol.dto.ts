import { Transform } from 'class-transformer';
import { IsString, Length } from 'class-validator';
function sanitize(value: string): string {
  return value.replace(/['";<>]/g, '').trim();
}

export class CreateRolDto {
    @Transform(({ value }) => sanitize(value))
    @IsString()
    @Length(1, 20)
    nombre: string;
}
