import { Entity, Column, PrimaryGeneratedColumn, CreateDateColumn } from 'typeorm';

@Entity({ schema: 'auth', name: 'tenants' })
export class Tenant {
    @PrimaryGeneratedColumn('uuid')
    id: string;

    @Column()
    name: string;

    @Column({ name: 'scaling_mode' })
    scalingMode: string;

    @Column({ name: 'tax_id', nullable: true })
    taxId: string;

    @Column({ type: 'jsonb', default: {} })
    config: any;

    @CreateDateColumn({ name: 'created_at' })
    createdAt: Date;
}
