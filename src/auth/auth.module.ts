import { forwardRef, Module } from '@nestjs/common';
import { AuthController } from './auth.controller';
import { AuthService } from './auth.service';
import { UsuariosModule } from 'src/usuarios/usuarios.module';
import { JwtModule } from '@nestjs/jwt';
import { ConfigModule } from '@nestjs/config';
import { AuthGuard } from './guard/auth.guard';
import { ActiveSession } from './entities/active-session.entity';
import { TypeOrmModule } from '@nestjs/typeorm';

@Module({
  imports: [
    TypeOrmModule.forFeature([ActiveSession]),
    forwardRef(() => UsuariosModule),
    ConfigModule.forRoot(),
    JwtModule.register({
      global: true,
      secret: process.env.JWT_PASSWORD,
      signOptions: { expiresIn: '1h' },
    }),
  ],
  controllers: [AuthController],
  providers: [AuthService, AuthGuard],
  exports: [AuthGuard],
})
export class AuthModule {}
