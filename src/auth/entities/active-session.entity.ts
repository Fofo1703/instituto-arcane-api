import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  ManyToOne,
  CreateDateColumn,
  JoinColumn,
} from 'typeorm';
import { Usuario } from 'src/usuarios/entities/usuario.entity';

@Entity('active_sessions')
export class ActiveSession {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  // Relación con Rol
  @ManyToOne(() => Usuario, { onDelete: 'CASCADE',eager: true, nullable: false })
  @JoinColumn({ name: 'idUsuario' })
  usuario: Usuario;

  @Column({ unique: true })
  token: string; // Puede ser el refreshToken o un identificador generado

  @CreateDateColumn()
  createdAt: Date;

  @Column({ default: true })
  isActive: boolean;
}

