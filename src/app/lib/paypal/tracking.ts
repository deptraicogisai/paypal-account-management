import api from "../api";

const TRACKING_URL = '/shipping/trackers';

class Tracking {
    public async getTracking(trackings: string[]) {
        const trackingPromises = trackings.map(async (tracking) => {
            // Call the actual API to get tracking info
            const url = `${TRACKING_URL}?transaction_id=${tracking}`;
            return await api.get(url);
        });
        const trackingResults = await Promise.all(trackingPromises);
        const trackingMap = trackingResults.map((t: any) => {
            const { trackers } = t;
            if (trackers.length > 0) {
                return {
                    carrier: trackers[0].carrier == 'OTHER' ? trackers[0].carrier_name_other : trackers[0].carrier,
                    tracking_number: trackers[0].tracking_number,
                    status: trackers[0].status,
                    transaction_id: trackers[0].transaction_id
                }
            }

            return {
                carrier: "",
                tracking_number: "",
                status: "",
                transaction_id: ""
            }
        })

        debugger;

        return trackingMap;
    }
}

const tracking = new Tracking();
export default tracking;