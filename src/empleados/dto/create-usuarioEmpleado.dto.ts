import { IsString, Length, IsOptional, IsEmail } from 'class-validator';
import { Transform } from 'class-transformer';

function sanitize(value: string): string {
  return value.replace(/['";<>]/g, '').trim();
}

export class CreateUsuarioEmpleadoDto {
  @Transform(({ value }) => sanitize(value))
  @IsString()
  @Length(4, 20)
  usuario: string;

  @Transform(({ value }) => sanitize(value))
  @IsString()
  @Length(4, 20)
  password: string;

  @Transform(({ value }) => sanitize(value))
  @IsEmail()
  correo: string;

  @Transform(({ value }) => sanitize(value))
  @IsString()
  nombreRol: string;

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
