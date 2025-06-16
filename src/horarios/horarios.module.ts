import { Module } from '@nestjs/common';
import { HorariosService } from './horarios.service';
import { HorariosController } from './horarios.controller';
import { TypeOrmModule } from '@nestjs/typeorm';
import { Horario } from './entities/horario.entity';
import { CursosModule } from 'src/cursos/cursos.module';
import { EmpleadosModule } from 'src/empleados/empleados.module';


@Module({
  imports: [TypeOrmModule.forFeature([Horario]), CursosModule, EmpleadosModule],
  controllers: [HorariosController],
  providers: [HorariosService],
})
export class HorariosModule {}
