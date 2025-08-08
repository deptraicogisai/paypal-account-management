import { GiConsoleController } from "react-icons/gi";
import api from "../api";
const PAGE_SIZE = Number(process.env.NEXT_PUBLIC_PAGE_SIZE) || 10;
const DISPUTES_URL = `/customer/disputes?page_size=${PAGE_SIZE}`;
const DISPUTES_DETAIL_URL = '/customer/disputes';

class Dispute {
    public async getListDisputes(api: any, url?: string) {
        var disputeData = { items: [] };
        var result = await api.get(url ?? DISPUTES_URL);
        // Concatenate the items from result into disputeData.items
        disputeData.items = [...disputeData.items, ...result.items];
        let next_page_url = result.links[2]?.href;
        if (disputeData.items.length < PAGE_SIZE) {
            return disputeData;
        }

        while (true) {
            next_page_url = next_page_url.replace('https://api-m.paypal.com/v1', '');
            var data = await api.get(next_page_url);
            disputeData.items = [...disputeData.items, ...data.items];
            if (data && data.links[2]?.rel == 'next') {
                next_page_url = data.links[2]?.href;
            } else {
                break;
            }
        }
        return disputeData;
    }

    public async getDisputeDetail(id: string) {
        var result = await api.get(`${DISPUTES_DETAIL_URL}/${id}`);
        console.log(result);
        return result;
    }

    public async acceptClaim(id: string, responseDispute: any) {
        try {
            const DISPUTES_ACCEPT_CLAIM_URL = DISPUTES_DETAIL_URL + `/${id}/accept-claim`;
            var data = {
                note: responseDispute.message,
                invoice_id: responseDispute.invoice_number || undefined
            };

            var result = await api.post(DISPUTES_ACCEPT_CLAIM_URL, data);
            return {
                success: true,
                result
            }
        } catch (err) {
            return {
                success: false,
                message: err
            }
        }
    }

    public async offerPartialRefund(id: string, offer: any) {
        try {
            const DISPUTES_OFFER_PARTIAL_URL = DISPUTES_DETAIL_URL + `/${id}/make-offer`;
            debugger;
            var data = {
                note: `${offer.message}`,
                invoice_id: offer.invoice_number || undefined,
                offer_amount: {
                    currency_code: "USD",
                    value: `${offer.amount}`
                },
                offer_type: "REFUND"
            };

            var result = await api.post(DISPUTES_OFFER_PARTIAL_URL, data);
            return {
                success: true,
                result
            }
        } catch (err) {
            return {
                success: false,
                message: err
            }
        }
    }

    public async offerReplacementWithRefund(id: string, offer: any) {
        try {
            const DISPUTES_OFFER_PARTIAL_URL = DISPUTES_DETAIL_URL + `/${id}/make-offer`;
            var data = {
                note: `${offer.message}`,
                invoice_id: offer.invoice_number || undefined,
                offer_amount: {
                    currency_code: "USD",
                    value: `${offer.amount}`
                },
                offer_type: "REFUND_WITH_REPLACEMENT"
            };

            var result = await api.post(DISPUTES_OFFER_PARTIAL_URL, data);
            return {
                success: true,
                result
            }
        } catch (err) {
            return {
                success: false,
                message: err
            }
        }
    }

    public async sendMessage(id: string, message: string) {
        try {
            const DISPUTES_SEND_MESSAGE_URL = DISPUTES_DETAIL_URL + `/${id}/send-message`;
            var data = {
                message
            };

            var result = await api.post(DISPUTES_SEND_MESSAGE_URL, data);
            debugger;
            return {
                success: true,
                result
            }
        } catch (err) {
            return {
                success: false,
                message: err
            }
        }
    }


    public async offerReplacementWithoutRefund(id: string, message: string) {
        try {
            const DISPUTES_OFFER_REPLACEMENT_URL = DISPUTES_DETAIL_URL + `/${id}/make-offer`;
            debugger;
            var data = {
                note: `${message}`,
                offer_type: "REPLACEMENT_WITHOUT_REFUND"
            };

            var result = await api.post(DISPUTES_OFFER_REPLACEMENT_URL, data);
            return {
                success: true,
                result
            }
        } catch (err) {
            return {
                success: false,
                message: err
            }
        }
    }
}

const dispute = new Dispute();
export default dispute;