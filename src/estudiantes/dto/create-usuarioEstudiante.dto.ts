import { IsString, Length, IsOptional, IsEmail } from 'class-validator';
import { Transform } from 'class-transformer';
function sanitize(value: string): string {
  return value.replace(/['";<>]/g, '').trim();
}

export class CreateUsuarioEstudianteDto {
  @Transform(({ value }) => sanitize(value))
  @IsString()
  @Length(4, 40)
  usuario: string;

  @Transform(({ value }) => sanitize(value))
  @IsString()
  @Length(4, 20)
  @IsOptional()
  // @Matches(/^(?=.*[A-Z])(?=.*[a-z])(?=.*\d)(?=.*[@$!%*?&]).{8,20}$/, {     //es opcional para que la contraseña siga un estandar o formato
  // message: "La contraseña debe contener al menos una mayúscula, una minúscula, un número y un carácter especial.",})
  password?: string;

  @Transform(({ value }) => sanitize(value))
  @IsEmail()
  correo: string;

  @Transform(({ value }) => sanitize(value))
  @IsString()
  @Length(9, 9) // Exactamente 9 caracteres
  cedula: string;

  @Transform(({ value }) => sanitize(value))
  @IsString()
  @Length(1, 40) // Máximo 40 caracteres
  nombre: string;

  @Transform(({ value }) => sanitize(value))
  @IsString()
  @Length(8, 8) // Exactamente 8 caracteres
  telefono: string;

  @Transform(({ value }) => sanitize(value))
  @IsString()
  @Length(1, 40) // Máximo 40 caracteres
  @IsOptional()
  carrera?: string;
}
