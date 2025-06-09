import { Column, Entity, PrimaryGeneratedColumn } from 'typeorm';

@Entity('roles')
export class Rol {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column({ type: 'varchar', length: 20, unique: true })
  nombre: string;

  @Column({ type: 'varchar', length: 100 })
  createdInfo: string;

  @Column({ type: 'varchar', length: 100, nullable: true })
  updatedInfo: string;
}
