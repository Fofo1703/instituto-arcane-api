import { Transform } from "class-transformer";
import { IsString } from "class-validator";

export class CreateCursoDto {
    
    @Transform(({ value }) => value.trim())
    @IsString()
    nombre: string;
}
