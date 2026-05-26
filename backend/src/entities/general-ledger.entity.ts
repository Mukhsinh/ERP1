import { Entity, Column, PrimaryGeneratedColumn, CreateDateColumn, ManyToOne, OneToMany, JoinColumn } from 'typeorm';
import { User } from './user.entity';
import { Tenant } from './tenant.entity';
import { Branch } from './branch.entity';
import { JournalEntry } from './journal-entry.entity';

@Entity({ schema: 'accounting', name: 'general_ledger' })
export class GeneralLedger {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @ManyToOne(() => Tenant)
  @JoinColumn({ name: 'tenant_id' })
  tenant: Tenant;

  @Column({ name: 'tenant_id' })
  tenantId: string;

  @ManyToOne(() => Branch)
  @JoinColumn({ name: 'branch_id' })
  branch: Branch;

  @Column({ name: 'branch_id' })
  branchId: string;

  @Column({ type: 'date', name: 'transaction_date', default: () => 'CURRENT_DATE' })
  transactionDate: Date;

  @Column({ name: 'reference_no', unique: true })
  referenceNo: string;

  @Column({ type: 'text', nullable: true })
  description: string;

  @ManyToOne(() => User)
  @JoinColumn({ name: 'created_by' })
  createdBy: User;

  @Column({ default: 'DRAFT' })
  status: string;

  @OneToMany(() => JournalEntry, (entry) => entry.gl)
  entries: JournalEntry[];

  @CreateDateColumn({ name: 'created_at' })
  createdAt: Date;
}
