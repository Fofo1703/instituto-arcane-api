import { Rol } from "src/roles/entities/rol.entity";
import { Entity, Column, PrimaryGeneratedColumn, ManyToOne, JoinColumn } from "typeorm";

@Entity('usuarios')
export class Usuario {

        @PrimaryGeneratedColumn('uuid')
        id: string;
    
        @Column({ type: 'varchar', length: 20, unique: true })
        usuario:string;
    
        @Column({ type: 'varchar', length: 100 })
        password:string;
    
        @Column({ type: 'varchar', length: 40, unique: true })
        correo:string;

        // Relación con Rol
        @ManyToOne(() => Rol, { eager: true, nullable: false })
        @JoinColumn({ name: 'idRol' })
        rol: Rol;
    
        @Column()
        borradoLogico:boolean;
    
        @Column({ type: 'varchar', length: 100 })
        createdInfo: string;

        @Column({ type: 'varchar', length: 100, nullable: true })
        updatedInfo: string;
        
}
