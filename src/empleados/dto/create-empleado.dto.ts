import { Transform } from 'class-transformer';
import { IsBoolean, IsEmail, IsOptional, IsString, Length } from 'class-validator';

export class CreateEmpleadoDto {

  @Transform(({ value }) => value.trim())
  @IsEmail()
  correo: string;

  @Transform(({ value }) => value.trim())
  @IsString()
  @Length(9, 9) // Exactamente 9 caracteres
  cedula: string;

  @Transform(({ value }) => value.trim())
  @IsString()
  @Length(1, 40) // Máximo 40 caracteres
  nombre: string;

  @Transform(({ value }) => value.trim())
  @IsString()
  @Length(8, 8) // Exactamente 8 caracteres
  telefono: string;

  @Transform(({ value }) => value.trim())
  @IsString()
  @Length(1, 40) // Máximo 40 caracteres
  @IsOptional()
  carrera?: string;

}
