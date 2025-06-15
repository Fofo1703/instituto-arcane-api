import { IsOptional, IsString, Length } from 'class-validator';

export class CreateRolDto {
    @IsString()
    @Length(1, 20)
    nombre: string;
}
