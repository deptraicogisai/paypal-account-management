import api from "../api";
import ppHelper from "./helper";
const TRANSACTION_URL = '/reporting/transactions';

class Transaction {

    public async getList(startDate: string, endDate: string, page: number) {
        startDate = ppHelper.convertToUTC(startDate);
        endDate = ppHelper.convertToUTC(endDate);
        const url = `${TRANSACTION_URL}?start_date=${startDate}&end_date=${endDate}&fields=transaction_info,payer_info&page_size=5&page=${page}&transaction_type=T0006`;
        const result = await api.get(url);
        var data = {
            total_items: result.total_items,
            total_pages: result.total_pages
        };

        var transactions = result.transaction_details.map(transaction =>
        ({
            transaction_id: transaction.transaction_info
                .transaction_id,
            invoice_id: transaction.transaction_info
                .invoice_id,
            amount: transaction.transaction_info.transaction_amount.value,
            full_name: transaction.payer_info.payer_name.alternate_full_name,
            email: transaction.payer_info.email_address,
            chargedDate: ppHelper.convertToVNTime(transaction.transaction_info.transaction_initiation_date)
        }))

        data.transactions = transactions;
        return data;
    }

    public async getTransactionDetail(endDate: string, transaction_id: string) {
        // Calculate startDate as endDate minus 31 days      
        let end = new Date(endDate);
        let attempt = 0;

        while (attempt < 5) {
            const start = new Date(end);
            start.setDate(end.getDate() - 31);

            const startDateISO = start.toISOString();
            const endDateISO = end.toISOString();
            const url = `${TRANSACTION_URL}?start_date=${startDateISO}&end_date=${endDateISO}&fields=all&page_size=5&transaction_type=T0006&transaction_id=${transaction_id}`;
            const result = await api.get(url);
            if (result?.total_items > 0) {
                return result;
            }

            // Lùi tiếp 31 ngày
            end = start;
            attempt++;
        }
    }
}

const transaction = new Transaction();
export default transaction;