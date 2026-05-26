import { Injectable, BadRequestException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository, DataSource } from 'typeorm';
import { GeneralLedger } from '../../entities/general-ledger.entity';
import { JournalEntry } from '../../entities/journal-entry.entity';

export interface CreateJournalDto {
    tenantId: string;
    branchId: string;
    transactionDate: Date;
    referenceNo: string;
    description?: string;
    createdBy: string;
    lines: {
        coaId: string;
        debit: number;
        credit: number;
        mappingTag?: string;
    }[];
}

@Injectable()
export class AccountingService {
    constructor(
        private dataSource: DataSource,
        @InjectRepository(GeneralLedger)
        private glRepository: Repository<GeneralLedger>,
    ) { }

    async postJournal(dto: CreateJournalDto) {
        const queryRunner = this.dataSource.createQueryRunner();
        await queryRunner.connect();
        await queryRunner.startTransaction();

        try {
            // 1. Balance Validation
            const totalDebit = dto.lines.reduce((sum, l) => sum + Number(l.debit), 0);
            const totalCredit = dto.lines.reduce((sum, l) => sum + Number(l.credit), 0);

            if (Math.abs(totalDebit - totalCredit) > 0.0001) {
                throw new BadRequestException(`Journal not balanced! Debit: ${totalDebit}, Credit: ${totalCredit}`);
            }

            // 2. Create Header
            const header = this.glRepository.create({
                tenantId: dto.tenantId,
                branchId: dto.branchId,
                transactionDate: dto.transactionDate,
                referenceNo: dto.referenceNo,
                description: dto.description,
                status: 'POSTED',
            });
            const savedHeader = await queryRunner.manager.save(GeneralLedger, header);

            // 3. Create Lines
            const entries = dto.lines.map((l) => ({
                glId: savedHeader.id,
                coaId: l.coaId,
                debit: l.debit,
                credit: l.credit,
                mappingTag: l.mappingTag,
            }));
            await queryRunner.manager.insert(JournalEntry, entries);

            await queryRunner.commitTransaction();
            return savedHeader;
        } catch (err) {
            await queryRunner.rollbackTransaction();
            throw err;
        } finally {
            await queryRunner.release();
        }
    }
}
