import { Usuario } from "src/usuarios/entities/usuario.entity";
import { Column, Entity, JoinColumn, OneToOne, PrimaryGeneratedColumn } from "typeorm";

@Entity('empleados')
export class Empleado {
     @PrimaryGeneratedColumn('uuid')
      id: string;
    
      @OneToOne(() => Usuario, {eager: true, nullable: false})
      @JoinColumn({ name: 'idUsuario' }) // Define explícitamente la clave foránea
      usuario: Usuario; // Aquí debe ser un objeto Usuario, no un string
    
      @Column({ type: 'varchar', length: 9, unique: true })
      cedula: string;
    
      @Column({ type: 'varchar', length: 40 })
      nombre: string;
    
      @Column({ type: 'varchar', length: 8 })
      telefono: string;
    
      @Column({ type: 'varchar', length: 40, nullable: true })
      carrera: string;
    
      @Column({nullable: false})
      borradoLogico: boolean;
    
      @Column({ type: 'varchar', length: 100 })
      createdInfo: string;
    
      @Column({ type: 'varchar', length: 100, nullable: true })
      updatedInfo: string;
    
    }
