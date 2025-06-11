import {
  IsBoolean,
  IsString,
  Length,
  IsOptional,
  IsEmail,
} from 'class-validator';
import { Transform } from "class-transformer";

export class CreateEstudianteDto {

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

    @Transform(({ value }) => value.trim())
    @IsBoolean()
    borradoLogico: boolean;

    @Transform(({ value }) => value.trim())
    @IsString()
    @Length(1, 100)
    createdInfo: string;

    
    @Transform(({ value }) => value.trim())
    @IsString()
    @Length(1, 100)
    @IsOptional()
    updatedInfo?: string;
}
