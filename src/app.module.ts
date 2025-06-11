import { Module } from '@nestjs/common';
import { EstudiantesModule } from './estudiantes/estudiantes.module';
import { TypeOrmModule } from '@nestjs/typeorm';
import { ConfigModule } from '@nestjs/config';
import { UsuariosModule } from './usuarios/usuarios.module';
import { RolesModule } from './roles/roles.module';
import { EmpleadosModule } from './empleados/empleados.module';
import { AuthModule } from './auth/auth.module';

@Module({
  imports: [
    ConfigModule.forRoot(),
    TypeOrmModule.forRoot({
      type: 'postgres',
      url: process.env.DATABASE_URL,
      autoLoadEntities: true,
      synchronize: true, //NO debe usarse en producción, de lo contrario, puede perder datos de producción.
    }),
    EstudiantesModule,
    UsuariosModule,
    RolesModule,
    EmpleadosModule,
    AuthModule,
  ],
  controllers: [],
  providers: [],
})
export class AppModule {}
