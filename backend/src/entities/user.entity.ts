import { Entity, Column, PrimaryGeneratedColumn, ManyToOne, JoinColumn, CreateDateColumn } from 'typeorm';
import { Tenant } from './tenant.entity';

@Entity({ schema: 'auth', name: 'users' })
export class User {
    @PrimaryGeneratedColumn('uuid')
    id: string;

    @ManyToOne(() => Tenant)
    @JoinColumn({ name: 'tenant_id' })
    tenant: Tenant;

    @Column({ name: 'tenant_id' })
    tenantId: string;

    @Column({ unique: true })
    email: string;

    @Column({ name: 'password_hash' })
    passwordHash: string;

    @Column({ name: 'full_name', nullable: true })
    fullName: string;

    @Column({ name: 'is_superadmin', default: false })
    isSuperadmin: boolean;

    @CreateDateColumn({ name: 'created_at' })
    createdAt: Date;
}
