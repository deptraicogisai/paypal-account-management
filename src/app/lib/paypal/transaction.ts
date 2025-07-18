import api from "../api";
import ppHelper from "./helper";
const TRANSACTION_URL = '/reporting/transactions';
const TRANSACTION_PAGE_SIZE = process.env.NEXT_PUBLIC_TRANSACTION_PAGE_SIZE;
class Transaction {

    public async getList(startDate: string, endDate: string, page: number) {
        try {
            debugger;
            // Get transactions within 1 year (PayPal only allows max 31-day range per request)
            // Get transactions in 1 year, PayPal only allows 31-day range per request
            const results: any[] = [];
            const now = new Date();

            // Determine the date range based on searchType
            let rangeStart: Date = new Date();
            let rangeEnd: Date = new Date();

            // Make sure rangeStart is not more than 1 year before rangeEnd
            const oneYearAgo = new Date(rangeEnd);
            oneYearAgo.setFullYear(rangeEnd.getFullYear() - 1);

            // Loop through the range in 31-day chunks (PayPal max)
            let chunkEnd = new Date(rangeEnd);
            let chunkStart = new Date(chunkEnd);
            chunkStart.setDate(chunkEnd.getDate() - 30);

            while (chunkStart > oneYearAgo) {
                const startStr = ppHelper.convertToUTC(chunkStart.toISOString(), true);
                const endStr = ppHelper.convertToUTC(chunkEnd.toISOString(), false);
                const url = `${TRANSACTION_URL}?start_date=${startStr}&end_date=${endStr}&fields=transaction_info,payer_info&page_size=${TRANSACTION_PAGE_SIZE}&page=${page}&transaction_type=T0006`;
                const result = await api.get(url);

                if (result && Array.isArray(result.transaction_details) && result.transaction_details.length > 0) {
                    results.push(...result.transaction_details);
                    // If less than a full page, no more data in this chunk
                    if (result.transaction_details.length < Number(TRANSACTION_PAGE_SIZE)) {                     
                    }
                }
                // Move window back by 31 days, subtract 1 day to avoid overlap
                chunkEnd = new Date(chunkStart);
                chunkEnd.setDate(chunkEnd.getDate() - 1);
                chunkStart = new Date(chunkEnd);
                chunkStart.setDate(chunkEnd.getDate() - 30);
            }

            // Compose the final data object

            // startDate = ppHelper.convertToUTC(startDate);
            // endDate = ppHelper.convertToUTC(endDate);
            // const url = `${TRANSACTION_URL}?start_date=${startDate}&end_date=${endDate}&fields=transaction_info,payer_info&page_size=500&page=${page}&transaction_type=T0006`;
            // const result = await api.get(url);
            // var data = {
            //     total_items: result.total_items,
            //     total_pages: result.total_pages
            // };
            var transactions = results.map(transaction =>
            ({
                transaction_id: transaction.transaction_info
                    .transaction_id,
                invoice_id: transaction.transaction_info
                    .invoice_id,
                amount: transaction.transaction_info.transaction_amount.value,
                full_name: transaction.payer_info.payer_name.alternate_full_name,
                email: transaction.payer_info.email_address,
                chargedDate: ppHelper.convertToVNTime(transaction.transaction_info.transaction_initiation_date)
            }));

            //data.transactions = transactions;
            var data = {
                total_items: results.length,
                total_pages: 1,
                transactions: transactions.sort((a, b) =>
                    ppHelper.parseVNDateTime(b.chargedDate).getTime() - ppHelper.parseVNDateTime(a.chargedDate).getTime()
                )
            };
            return data;
        } catch (err) {
            console.log(err);
        }
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
            const url = `${TRANSACTION_URL}?start_date=${startDateISO}&end_date=${endDateISO}&fields=all&page_size=100&transaction_type=T0006&transaction_id=${transaction_id}`;
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