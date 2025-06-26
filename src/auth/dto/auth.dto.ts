import { IsString, Length } from 'class-validator';
import { Transform } from "class-transformer";

function sanitize(value: string): string {
  return value.replace(/['";<>]/g, '').trim();
}

export class CredencialesDto {
    @Transform(({ value }) => sanitize(value))
    @IsString()
    @Length(4, 20)
    usuario: string;

    
    @Transform(({ value }) => sanitize(value))
    @IsString()
    @Length(4, 20)
    password: string;
}
