import api from "../api";
const BALANCE_URL = '/reporting/balances';
class Balance {
    public async getBalance() {
        var result = await api.get(BALANCE_URL);
        return result;
    }
}

const balance = new Balance();
export default balance;