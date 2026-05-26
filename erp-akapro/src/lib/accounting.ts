import { supabase } from '@/lib/supabase';

export interface JournalLine {
    coaId: string;
    debit: number;
    credit: number;
    mappingTag?: string;
}

export interface PostJournalDto {
    tenantId: string;
    branchId: string;
    transactionDate: string;
    referenceNo: string;
    description?: string;
    sourceModule: string;
    lines: JournalLine[];
}

export class AccountingEngine {
    /**
     * Validates and posts a journal entry to the database.
     * Ensures Debit = Credit.
     */
    static async postJournal(dto: PostJournalDto) {
        const totalDebit = dto.lines.reduce((sum, l) => sum + Number(l.debit), 0);
        const totalCredit = dto.lines.reduce((sum, l) => sum + Number(l.credit), 0);

        if (Math.abs(totalDebit - totalCredit) > 0.01) {
            throw new Error(`Jurnal tidak balance! Selisih: ${(totalDebit - totalCredit).toLocaleString()}`);
        }

        if (dto.lines.length === 0) {
            throw new Error("Jurnal harus memiliki setidaknya satu baris.");
        }

        const { data: journal, error: hError } = await supabase
            .from('accounting_journals')
            .insert({
                tenant_id: dto.tenantId,
                branch_id: dto.branchId,
                transaction_date: dto.transactionDate,
                reference_no: dto.referenceNo,
                description: dto.description,
                source_module: dto.sourceModule
            })
            .select()
            .single();

        if (hError) throw hError;

        const glLines = dto.lines.map(l => ({
            journal_id: journal.id,
            coa_id: l.coaId,
            debit: l.debit,
            credit: l.credit
        }));

        const { error: lError } = await supabase
            .from('accounting_general_ledger')
            .insert(glLines);

        if (lError) {
            await supabase.from('accounting_journals').delete().eq('id', journal.id);
            throw lError;
        }

        return journal;
    }

    /**
     * Otomasi Jurnal Pembelian (Procurement)
     */
    static async recordPurchase(params: {
        tenantId: string;
        branchId: string;
        date: string;
        ref: string;
        desc: string;
        debitCoa: string;
        creditCoa: string;
        amount: number;
    }) {
        return this.postJournal({
            tenantId: params.tenantId,
            branchId: params.branchId,
            transactionDate: params.date,
            referenceNo: params.ref,
            description: params.desc,
            sourceModule: 'PEMBELIAN',
            lines: [
                { coaId: params.debitCoa, debit: params.amount, credit: 0 },
                { coaId: params.creditCoa, debit: 0, credit: params.amount }
            ]
        });
    }

    /**
     * Otomasi Jurnal Penjualan (Sales)
     */
    static async recordSales(params: {
        tenantId: string;
        branchId: string;
        date: string;
        ref: string;
        desc: string;
        arCoa: string;
        incomeCoa: string;
        cogsCoa: string;
        inventoryCoa: string;
        totalSales: number;
        totalCogs: number;
    }) {
        const lines: JournalLine[] = [
            { coaId: params.arCoa, debit: params.totalSales, credit: 0 },
            { coaId: params.incomeCoa, debit: 0, credit: params.totalSales },
            { coaId: params.cogsCoa, debit: params.totalCogs, credit: 0 },
            { coaId: params.inventoryCoa, debit: 0, credit: params.totalCogs }
        ];

        return this.postJournal({
            tenantId: params.tenantId,
            branchId: params.branchId,
            transactionDate: params.date,
            referenceNo: params.ref,
            description: params.desc,
            sourceModule: 'PENJUALAN',
            lines
        });
    }

    /**
     * Otomasi Jurnal Biaya Operasional (OPEX)
     */
    static async recordExpense(params: {
        tenantId: string;
        branchId: string;
        date: string;
        ref: string;
        desc: string;
        expenseCoa: string;
        paymentCoa: string;
        amount: number;
    }) {
        return this.postJournal({
            tenantId: params.tenantId,
            branchId: params.branchId,
            transactionDate: params.date,
            referenceNo: params.ref,
            description: params.desc,
            sourceModule: 'OPEX',
            lines: [
                { coaId: params.expenseCoa, debit: params.amount, credit: 0 },
                { coaId: params.paymentCoa, debit: 0, credit: params.amount }
            ]
        });
    }

    /**
     * Otomasi Jurnal Penyusutan Aset (Depreciation Batch)
     */
    static async recordDepreciationRun(params: {
        tenantId: string;
        branchId: string;
        date: string;
        ref: string;
        desc: string;
        lines: { expenseCoa: string; accumDepCoa: string; amount: number }[];
    }) {
        const journalLines: JournalLine[] = [];
        params.lines.forEach(line => {
            journalLines.push({ coaId: line.expenseCoa, debit: line.amount, credit: 0 });
            journalLines.push({ coaId: line.accumDepCoa, debit: 0, credit: line.amount });
        });

        return this.postJournal({
            tenantId: params.tenantId,
            branchId: params.branchId,
            transactionDate: params.date,
            referenceNo: params.ref,
            description: params.desc,
            sourceModule: 'ASET',
            lines: journalLines
        });
    }

    /**
     * Otomasi Jurnal Penyusutan Aset (Depreciation - Single)
     */
    static async recordAssetDepreciation(params: {
        tenantId: string;
        branchId: string;
        date: string;
        ref: string;
        desc: string;
        expenseCoa: string;
        accumDepCoa: string;
        amount: number;
    }) {
        return this.postJournal({
            tenantId: params.tenantId,
            branchId: params.branchId,
            transactionDate: params.date,
            referenceNo: params.ref,
            description: params.desc,
            sourceModule: 'ASET',
            lines: [
                { coaId: params.expenseCoa, debit: params.amount, credit: 0 },
                { coaId: params.accumDepCoa, debit: 0, credit: params.amount }
            ]
        });
    }

    /**
     * Otomasi Jurnal Kapitalisasi Aset (Capitalization)
     * Debit: Aset Tetap, Credit: Bank/Kas
     */
    static async recordAssetCapitalization(params: {
        tenantId: string;
        branchId: string;
        date: string;
        ref: string;
        desc: string;
        assetCoa: string;
        sourceCoa: string;
        amount: number;
    }) {
        return this.postJournal({
            tenantId: params.tenantId,
            branchId: params.branchId,
            transactionDate: params.date,
            referenceNo: params.ref,
            description: params.desc,
            sourceModule: 'ASET',
            lines: [
                { coaId: params.assetCoa, debit: params.amount, credit: 0 },
                { coaId: params.sourceCoa, debit: 0, credit: params.amount }
            ]
        });
    }

    /**
     * Otomasi Jurnal Pelepasan Aset (Disposal)
     * Menangani Penjualan, Penghapusan, dan Hibah.
     */
    static async recordAssetDisposal(params: {
        tenantId: string;
        branchId: string;
        date: string;
        ref: string;
        desc: string;
        assetCoa: string;
        accumDepCoa: string;
        paymentCoa?: string; // Untuk Penjualan
        gainLossCoa: string;
        acquisitionCost: number;
        totalAccumDep: number;
        proceedsAmount: number; // Nilai jual
        type: 'PENJUALAN' | 'PENGHAPUSAN' | 'HIBAH';
    }) {
        const bookValue = params.acquisitionCost - params.totalAccumDep;
        const gainLossAmount = params.proceedsAmount - bookValue;

        const lines: JournalLine[] = [
            { coaId: params.assetCoa, debit: 0, credit: params.acquisitionCost },
            { coaId: params.accumDepCoa, debit: params.totalAccumDep, credit: 0 }
        ];

        if (params.type === 'PENJUALAN' && params.paymentCoa) {
            lines.push({ coaId: params.paymentCoa, debit: params.proceedsAmount, credit: 0 });
        }

        if (gainLossAmount > 0) {
            lines.push({ coaId: params.gainLossCoa, debit: 0, credit: gainLossAmount });
        } else if (gainLossAmount < 0) {
            lines.push({ coaId: params.gainLossCoa, debit: Math.abs(gainLossAmount), credit: 0 });
        }

        return this.postJournal({
            tenantId: params.tenantId,
            branchId: params.branchId,
            transactionDate: params.date,
            referenceNo: params.ref,
            description: params.desc,
            sourceModule: 'ASET',
            lines
        });
    }

    /**
     * Budget Control System
     * Verifikasi ketersediaan anggaran sebelum transaksi (Hard/Soft Control).
     */
    static async checkBudgetAvailability(params: {
        tenantId: string;
        coaId: string;
        amount: number;
        departmentId?: string;
    }) {
        // Find active fiscal year
        const { data: fy } = await supabase
            .from('budget_fiscal_years')
            .select('id')
            .eq('tenant_id', params.tenantId)
            .eq('is_active', true)
            .maybeSingle();

        if (!fy) return { available: true, message: 'No active budget plan' };

        // Get budget item for this COA
        const { data: budgetItem } = await supabase
            .from('budget_items')
            .select('*')
            .eq('coa_id', params.coaId)
            .maybeSingle();

        if (!budgetItem) return { available: true, message: 'No budget allocated for this account' };

        const used = Number(budgetItem.allocated_amount) - (Number(budgetItem.actual_amount) + Number(budgetItem.committed_amount));
        const isAvailable = used >= params.amount;

        return {
            available: isAvailable,
            remaining: used,
            message: isAvailable ? 'Budget available' : 'Budget exceeded'
        };
    }

    static async getCoa(tenantId: string) {
        const { data, error } = await supabase
            .from('chart_of_accounts')
            .select('*')
            .eq('tenant_id', tenantId)
            .order('code', { ascending: true });

        if (error) throw error;
        return data;
    }
}
