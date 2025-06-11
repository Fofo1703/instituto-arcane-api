import { Transform } from "class-transformer";
import { IsBoolean, IsEmail, IsOptional, IsString, Length } from "class-validator";

export class CreateUsuarioDto {

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
    
        @IsBoolean()
        borradoLogico: boolean;

        @Transform(({ value }) => value.trim())
        @IsString()
        @Length(4, 20)
        createdInfo: string;
    
        @Transform(({ value }) => value.trim())
        @IsString()
        @Length(4, 20)
        @IsOptional()
        updatedInfo?: string;
}
