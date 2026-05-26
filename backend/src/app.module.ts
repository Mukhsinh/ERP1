import { Module } from '@nestjs/common';
import { ConfigModule, ConfigService } from '@nestjs/config';
import { TypeOrmModule } from '@nestjs/typeorm';
import { AccountingModule } from './modules/accounting/accounting.module';
import { GeneralLedger } from './entities/general-ledger.entity';
import { JournalEntry } from './entities/journal-entry.entity';
import { ChartOfAccount } from './entities/coa.entity';
import { Tenant } from './entities/tenant.entity';
import { Branch } from './entities/branch.entity';
import { User } from './entities/user.entity';

@Module({
    imports: [
        ConfigModule.forRoot({ isGlobal: true }),
        TypeOrmModule.forRootAsync({
            imports: [ConfigModule],
            inject: [ConfigService],
            useFactory: (config: ConfigService) => ({
                type: 'postgres',
                host: config.get<string>('DATABASE_HOST'),
                port: config.get<number>('DATABASE_PORT'),
                username: config.get<string>('DATABASE_USER'),
                password: config.get<string>('DATABASE_PASS'),
                database: config.get<string>('DATABASE_NAME'),
                entities: [GeneralLedger, JournalEntry, ChartOfAccount, Tenant, Branch, User],
                synchronize: false, // Use migrations or manual schema for safety
                logging: true,
            }),
        }),
        AccountingModule,
    ],
})
export class AppModule { }
