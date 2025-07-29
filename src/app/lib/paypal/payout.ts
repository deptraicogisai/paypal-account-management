import { Payout } from "@/app/models/payout";
import ppHelper from "./helper";
import api from "../api";
const PAYOUT_URL = '/payments/payouts';
class PayoutService {
    public async sendPayment(p: any) {
        const payload = {
            sender_batch_header: {
                sender_batch_id: `${ppHelper.generatePayoutID()}`,
                email_subject: "You have a payout!",
                email_message: "You have received a payout! Thanks for using our service!"
            },
            items: [
                {
                    recipient_type: "EMAIL",
                    amount: {
                        value: `${Number(p.amount)}`,
                        currency: `${p.currency}`
                    },
                    note: `${p.note}`,
                    receiver: `${p.sendTo}`
                }
            ]
        };
        try {
            var data = await api.post(PAYOUT_URL, payload);
            return {
                success: true,
                data
            };
        } catch (err) {
            return {
                success: false,
                message: err
            };
        }
    }

    public async checkPayoutBatchStatus(id: string) {
        try {
            debugger;
            var data = await api.get(`${PAYOUT_URL}/${id}`);
            return {
                success: true,
                data
            };
        } catch (err) {
            return {
                success: false,
                message: err
            }
        }
    }
}

const payout = new PayoutService();
export default payout;