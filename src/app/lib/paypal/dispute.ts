import { GiConsoleController } from "react-icons/gi";
import api from "../api";
const PAGE_SIZE = Number(process.env.NEXT_PUBLIC_PAGE_SIZE) || 10;
const DISPUTES_URL = `/customer/disputes?page_size=${PAGE_SIZE}`;
const DISPUTES_DETAIL_URL = '/customer/disputes';

class Dispute {
    public async getListDisputes(url?: string) {
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
        return result;
    }
}

const dispute = new Dispute();
export default dispute;