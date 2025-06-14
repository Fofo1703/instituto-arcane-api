import { IsString, Length, IsOptional, IsEmail } from 'class-validator';
import { Transform } from 'class-transformer';

export class CreateUsuarioEmpleadoDto {
  @Transform(({ value }) => value.trim())
  @IsString()
  @Length(4, 20)
  usuario: string;

  @Transform(({ value }) => value.trim())
  @IsString()
  @Length(4, 20)
  // @Matches(/^(?=.*[A-Z])(?=.*[a-z])(?=.*\d)(?=.*[@$!%*?&]).{8,20}$/, {     //es opcional para que la contraseña siga un estandar o formato
  // message: "La contraseña debe contener al menos una mayúscula, una minúscula, un número y un carácter especial.",})
  password: string;

  @Transform(({ value }) => value.trim())
  @IsEmail()
  correo: string;

  @Transform(({ value }) => value.trim())
  @IsString()
  nombreRol: string;

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
