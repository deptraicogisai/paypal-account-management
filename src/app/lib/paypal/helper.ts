class PaypalHelper {    
    public convertToUTC(time: string) {
        const convertDate = new Date(time);
        const mm = String(convertDate.getMonth() + 1).padStart(2, '0'); // Months are 0-based
        const dd = String(convertDate.getDate()).padStart(2, '0');
        const yyyy = convertDate.getFullYear();

        const formatted = `${mm}/${dd}/${yyyy}`;
        //const formatted = `05/22/2025`;
        // Split the date (MM/DD/YYYY)
        const [month, day, year] = formatted.split("/");

        // Create Date object with 00:00:00 local time
        const localDate = new Date(`${year}-${month}-${day}T00:00:01Z`);
        // Convert to UTC ISO string
        const utcString = localDate.toISOString();
        console.log(utcString);
        return utcString;
    }

    public convertToVNTime(time: string) {
        if (time == null) return "";
        // Parse to Date object
        const utcDate = new Date(time);

        // Helper to pad with leading 0
        const pad = (n) => String(n).padStart(2, '0');

        // Format using local Vietnam time (no need to add 7 hours manually if you're in VN)
        const dd = pad(utcDate.getDate());
        const mm = pad(utcDate.getMonth() + 1);
        const yyyy = utcDate.getFullYear();
        const hh = pad(utcDate.getHours());
        const mi = pad(utcDate.getMinutes());
        const ss = pad(utcDate.getSeconds());

        const formattedVN = `${mm}/${dd}/${yyyy} ${hh}:${mi}:${ss}`;
        return formattedVN;
    }

    public getDisputeReasonStatusDescription(code: string) {
        const disputeReasonStatusMap: Record<string, string> = {
            "MERCHANDISE_OR_SERVICE_NOT_AS_DESCRIBED": "Item not as described",
            "MERCHANDISE_OR_SERVICE_NOT_RECEIVED": "Item not received",
            "UNAUTHORISED": "Unauthorized transaction",
            "CREDIT_NOT_PROCESSED": "Refund not received",
            "DUPLICATE_TRANSACTION": "Duplicate transaction",
            "INCORRECT_AMOUNT": "Charged incorrect amount",
            "ISSUED_REFUND_NOT_RECEIVED": "Refund issued but not received",
            "PAID_BY_OTHER_MEANS": "Buyer paid outside PayPal",
            "PROBLEM_WITH_REMITTANCE": "Issue with payment or transfer",
            "RECEIVED_CANCELED_RECURRENCE": "Canceled recurring billing dispute",
            "TRANSACTION_NOT_RECOGNIZED": "Transaction not recognized",
            "MERCHANDISE_OR_SERVICE_RECEIVED": "Item received (used in resolution)",
            "WAITING_FOR_SELLER_RESPONSE": "Waiting for your response",
            "WAITING_FOR_BUYER_RESPONSE": "Waiting for buyer's response",
            "UNDER_REVIEW": "Under PayPal review",
            "RESOLVED": "Dispute resolved",
            "CLOSED": "Dispute closed",
            "BUYER_CONTESTED": "Buyer escalated the case",
            "MERCHANT_CONTESTED": "Seller escalated the case",
            "APPEALABLE": "Can be appealed",
            "APPEALED": "Appealed case",
            "INQUIRY": "Inquiry phase",
            "CHARGEBACK": "Chargeback issued",
            "OTHER": "Other status/reson"
        };

        return disputeReasonStatusMap[code] || "Unknown reason";
    }

    public getShippingAddress(address: any) {
        if (address == undefined) return "";
        let full_address = `<p style="margin:2px 0">${address.line1}</p>`;
        if (address.line2) {
            full_address += `<p style="margin:2px 0">${address.line2}</p>`;
        }
        full_address += `<p style="margin:2px 0">${address.city},${address.state} ${address.postal_code} ${address.country_code}</p>`;
        return full_address;
    }
}

const ppHelper = new PaypalHelper();
export default ppHelper;