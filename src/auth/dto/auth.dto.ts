import { IsString, Length } from 'class-validator';
import { Transform } from "class-transformer";

export class CredencialesDto {
    @Transform(({ value }) => value.trim())
    @IsString()
    @Length(4, 20)
    usuario: string;

    
    @Transform(({ value }) => value.trim())
    @IsString()
    @Length(4, 20)
    password: string;
}
