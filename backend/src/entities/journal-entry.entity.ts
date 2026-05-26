import { Entity, Column, PrimaryGeneratedColumn, ManyToOne, JoinColumn, CreateDateColumn } from 'typeorm';
import { GeneralLedger } from './general-ledger.entity';
import { ChartOfAccount } from './coa.entity';

@Entity({ schema: 'accounting', name: 'journal_entries' })
export class JournalEntry {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @ManyToOne(() => GeneralLedger, (gl) => gl.entries, { onDelete: 'CASCADE' })
  @JoinColumn({ name: 'gl_id' })
  gl: GeneralLedger;

  @Column({ name: 'gl_id' })
  glId: string;

  @ManyToOne(() => ChartOfAccount)
  @JoinColumn({ name: 'coa_id' })
  coa: ChartOfAccount;

  @Column({ name: 'coa_id' })
  coaId: string;

  @Column({ type: 'decimal', precision: 19, scale: 4, default: 0 })
  debit: number;

  @Column({ type: 'decimal', precision: 19, scale: 4, default: 0 })
  credit: number;

  @Column({ name: 'mapping_tag', length: 50, nullable: true })
  mappingTag: string;

  @CreateDateColumn({ name: 'created_at' })
  createdAt: Date;
}
