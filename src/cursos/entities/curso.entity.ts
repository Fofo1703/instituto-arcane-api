import { Horario } from 'src/horarios/entities/horario.entity';
import { Column, Entity, OneToMany, PrimaryColumn, PrimaryGeneratedColumn } from 'typeorm';

@Entity('cursos')
export class Curso {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column({ type: 'varchar', length: 40, unique: true })
  nombre: string;

  @Column({ type: 'varchar', length: 100 })
  createdInfo: string;

  @Column({ type: 'varchar', length: 100, nullable: true })
  updatedInfo: string;

  // Relación con Horarios
  @OneToMany(() => Horario, (horario) => horario.curso)
  horarios: Horario[];
}
