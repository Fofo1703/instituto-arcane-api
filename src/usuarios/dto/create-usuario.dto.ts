import { Transform } from "class-transformer";
import { IsBoolean, IsEmail, IsOptional, IsString, Length } from "class-validator";

function sanitize(value: string): string {
  return value.replace(/['";<>]/g, '').trim();
}

export class CreateUsuarioDto {

        @Transform(({ value }) => sanitize(value))
        @IsString()
        @Length(4, 20)
        usuario: string;
    
        @Transform(({ value }) => sanitize(value))
        @IsString()
        @Length(4, 20)
        // @Matches(/^(?=.*[A-Z])(?=.*[a-z])(?=.*\d)(?=.*[@$!%*?&]).{8,20}$/, {     //es opcional para que la contraseña siga un estandar o formato              
        // message: "La contraseña debe contener al menos una mayúscula, una minúscula, un número y un carácter especial.",})
        password: string;
    
        @Transform(({ value }) => sanitize(value))
        @IsEmail()
        correo: string;
        
        @Transform(({ value }) => sanitize(value))
        @IsString()
        nombreRol: string;
}
