import { Entity, Column, PrimaryGeneratedColumn, ManyToOne, JoinColumn, Tree, TreeParent, TreeChildren } from 'typeorm';
import { Tenant } from './tenant.entity';

@Entity({ schema: 'accounting', name: 'chart_of_accounts' })
@Tree('materialized-path')
export class ChartOfAccount {
    @PrimaryGeneratedColumn('uuid')
    id: string;

    @ManyToOne(() => Tenant)
    @JoinColumn({ name: 'tenant_id' })
    tenant: Tenant;

    @Column({ name: 'tenant_id' })
    tenantId: string;

    @Column()
    code: string;

    @Column()
    name: string;

    @Column({ name: 'account_type' })
    accountType: string;

    @TreeParent()
    @JoinColumn({ name: 'parent_id' })
    parent: ChartOfAccount;

    @Column({ name: 'parent_id', nullable: true })
    parentId: string;

    @TreeChildren()
    children: ChartOfAccount[];

    @Column({ name: 'is_group', default: false })
    isGroup: boolean;

    @Column({ name: 'is_active', default: true })
    isActive: boolean;
}
