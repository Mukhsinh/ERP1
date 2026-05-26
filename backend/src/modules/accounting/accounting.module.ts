import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { AccountingService } from './accounting.service';
import { GeneralLedger } from '../../entities/general-ledger.entity';
import { JournalEntry } from '../../entities/journal-entry.entity';
import { ChartOfAccount } from '../../entities/coa.entity';

@Module({
    imports: [
        TypeOrmModule.forFeature([GeneralLedger, JournalEntry, ChartOfAccount]),
    ],
    providers: [AccountingService],
    exports: [AccountingService],
})
export class AccountingModule { }
