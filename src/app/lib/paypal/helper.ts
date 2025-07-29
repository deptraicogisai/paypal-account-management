import moment from 'moment'
const now = moment();

class PaypalHelper {
    public convertToUTC(time: string, firstSecond: boolean) {
        const convertDate = new Date(time);
        const mm = String(convertDate.getMonth() + 1).padStart(2, '0'); // Months are 0-based
        const dd = String(convertDate.getDate()).padStart(2, '0');
        const yyyy = convertDate.getFullYear();

        const formatted = `${mm}/${dd}/${yyyy}`;
        //const formatted = `05/22/2025`;
        // Split the date (MM/DD/YYYY)
        const [month, day, year] = formatted.split("/");

        // Create Date object with 00:00:00 local time
        const timeString = firstSecond
            ? `${year}-${month}-${day}T00:00:00Z`
            : `${year}-${month}-${day}T23:59:59Z`;
        const localDate = new Date(timeString);
        // Convert to UTC ISO string
        const utcString = localDate.toISOString();
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

        // Format with AM/PM
        let hourNum = Number(hh);
        const ampm = hourNum >= 12 ? 'PM' : 'AM';
        let displayHour = hourNum % 12;
        displayHour = displayHour === 0 ? 12 : displayHour;
        const formattedVN = `${dd}/${mm}/${yyyy} ${String(displayHour).padStart(2, '0')}:${mi}:${ss} ${ampm}`;
        return formattedVN;
    }

    public parseVNDateTime(input: string): Date {
        // Format: dd/mm/yyyy hh:mm:ss
        const [datePart, timePart] = input.split(' ');
        const [day, month, year] = datePart.split('/');
        return new Date(`${year}-${month}-${day}T${timePart}Z`);
    }

    public generatePayoutID() {
        // Generates a random payout ID in the format "Payouts_YYYY_NNNNNNN"
        const year = new Date().getFullYear();
        const randomNumber = Date.now(); // Get ticks (milliseconds since epoch) for current date
        return `Payouts_${year}_${randomNumber}`;
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

    public getShippingAddress(address: any, includeHtml: boolean) {
        if (address == undefined) return "";
        // Use a flag variable to determine whether to include HTML tags (flag == 1) or not
        let full_address = "";
        if (includeHtml) {
            full_address = `<p style="margin:2px 0">${address.line1}</p>`;
            if (address.line2) {
                full_address += `<p style="margin:2px 0">${address.line2}</p>`;
            }
            full_address += `<p style="margin:2px 0">${address.city},${address.state} ${address.postal_code} ${address.country_code}</p>`;
        } else {
            full_address = address.line1 ? address.line1 : "";
            if (address.line2) {
                full_address += `, ${address.line2}`;
            }
            full_address += `, ${address.city},${address.state} ${address.postal_code} ${address.country_code}`;
        }
        return full_address;
    }

    public getMakeOffer(offers: any[]) {
        const makeOffers = {
            allowPartialRefund: false,
            allowRefundWithReturn: false,
            allowReplacementWithoutRefund: false,
            allowRefundWithReplacement: false
        }

        if (offers && offers.length > 0) {
            if (offers.includes("PARTIAL_REFUND")) {
                makeOffers.allowPartialRefund = true
            }

            if (offers.includes("REFUND_WITH_RETURN")) {
                makeOffers.allowRefundWithReturn = true
            }

            if (offers.includes("REPLACEMENT_WITHOUT_REFUND")) {
                makeOffers.allowReplacementWithoutRefund = true
            }

            if (offers.includes("REFUND_WITH_REPLACEMENT")) {
                makeOffers.allowRefundWithReplacement = true
            }
        }

        return makeOffers;
    }

    public hightlightDueDate(dudeDate: string) {
        const dueDaySetting = Number(process.env.NEXT_PUBLIC_DISPUTE_DUE_DAYS);
        if (!dudeDate) return 0;
        const dueDate = moment(dudeDate, 'DD/MM/YYYY');
        const now = moment().format('DD/MM/YYYY'); // Format current date
        const nowMoment = moment(now, 'DD/MM/YYYY', true); // P
        const diffDays = dueDate.diff(nowMoment, 'days');
        return diffDays <= dueDaySetting;
    }
}

const ppHelper = new PaypalHelper();
export default ppHelper;