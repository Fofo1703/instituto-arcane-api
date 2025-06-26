import { Transform } from 'class-transformer';
import { IsNumber, IsString, IsTimeZone, Length, Matches, Max } from 'class-validator';

function sanitize(value: string): string {
  return value.replace(/['";<>]/g, '').trim();
}

export class CreateHorarioDto {
  @Transform(({ value }) => sanitize(value))
  @IsString()
  idCurso: string;

  @Transform(({ value }) => sanitize(value))
  @IsString()
  idProfesor: string;

  @Transform(({ value }) => sanitize(value))
  @IsString()
  @Length(5, 20)
  dia: string;

  @Transform(({ value }) => sanitize(value))
  @IsString()
  @Matches(/^([01]\d|2[0-3]):([0-5]\d)$/, { message: 'La hora debe estar en formato HH:mm o HH:mm:ss' })
  horaInicio: string;

  @Transform(({ value }) => sanitize(value))
  @IsString()
  @Matches(/^([01]\d|2[0-3]):([0-5]\d)$/, { message: 'La hora debe estar en formato HH:mm o HH:mm:ss' })
  horaFin: string;

  @Transform(({ value }) => sanitize(value))
  @IsString()
  @Length(1, 10) // Máximo 40 caracteres
  ciclo: string;

  @IsNumber()
  @Max(40, { message: 'La cantidad de cupos no puede ser mayor a 40' })
  cantidadCupo: number;
}
