import { IsBoolean, IsString, Length, IsUUID, IsOptional, IsEmail } from "class-validator";

export class CreateEstudianteDto {
    @IsEmail()
    correo: string;

    @IsString()
    @Length(9, 9) // Exactamente 9 caracteres
    cedula: string;
    
    @IsString()
    @Length(1, 40) // Máximo 40 caracteres
    nombre: string;

    @IsString()
    @Length(8, 8) // Exactamente 8 caracteres
    telefono: string;

    @IsString()
    @Length(1, 40) // Máximo 40 caracteres
    @IsOptional()
    carrera?: string;

    @IsBoolean()
    borradoLogico: boolean;

    @IsString()
    @Length(1, 100)
    createdInfo: string;

    @IsString()
    @Length(1, 100)
    @IsOptional()
    updatedInfo?: string;
}
