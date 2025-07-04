import { Module } from '@nestjs/common';
import { MsUsuariosService } from './ms-usuarios.service';
import { MsUsuariosController } from './ms-usuarios.controller';

@Module({
  controllers: [MsUsuariosController],
  providers: [MsUsuariosService],
})
export class MsUsuariosModule {}
