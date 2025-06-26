import { Transform } from "class-transformer";
import { IsString } from "class-validator";

function sanitize(value: string): string {
  return value.replace(/['";<>]/g, '').trim();
}

export class CreateCursoDto {
    
    @Transform(({ value }) => sanitize(value))
    @IsString()
    nombre: string;
}
