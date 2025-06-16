import { Curso } from 'src/cursos/entities/curso.entity';
import { Empleado } from 'src/empleados/entities/empleado.entity';
import {
  Column,
  Entity,
  JoinColumn,
  ManyToOne,
  PrimaryGeneratedColumn,
  BeforeInsert, BeforeUpdate,
} from 'typeorm';

@Entity('horarios')
export class Horario {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @ManyToOne(() => Curso, { nullable: false })
  @JoinColumn({ name: 'idCurso' })
  curso: Curso;

  @ManyToOne(() => Empleado, { nullable: false })
  @JoinColumn({ name: 'idProfesor' })
  empleado: Empleado;

  @Column({
    type: 'enum',
    enum: ['Lunes', 'Martes', 'Miércoles', 'Jueves', 'Viernes', 'Sábado'],
  })
  dia: string;

  @Column({ type: 'time' })
  horaInicio: string;

  @Column({ type: 'time' })
  horaFin: string;

  // Formatea los valores antes de guardar
  @BeforeInsert()
  @BeforeUpdate()
  formatTime() {
    this.horaInicio = this.horaInicio.slice(0, 5); // Guarda solo HH:mm
    this.horaFin = this.horaFin.slice(0, 5);
  }

  @Column({ type: 'varchar', length: 10 })
  ciclo: string;

  @Column({ type: 'numeric', precision: 4, scale: 0 })
  cantidadCupo: number;

  @Column({ type: 'varchar', length: 100 })
  createdInfo: string;

  @Column({ type: 'varchar', length: 100, nullable: true })
  updatedInfo: string;
}
