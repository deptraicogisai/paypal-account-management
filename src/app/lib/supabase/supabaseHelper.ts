import { PaypalAccount, PaypalResult } from "@/app/models/account";
import { supabase } from "./supabase_client";
import { SearchCriteria } from "@/app/models/searchCriteria";
import api from "../api";
import balance from "../paypal/balance";
import dispute from "../paypal/dispute";

class SupabaseHelper {
    public async fetchPagedData(page: number = 1, limit: number = 10, search: SearchCriteria) {
        const from = (page - 1) * limit;
        const to = from + limit - 1;

        const { data, count, error } = await supabase
            .from('account')
            .select('*', { count: 'exact' })
            .ilike('email', `%${search.email}%`)
            .ilike('domain', `%${search.domain}%`)
            .ilike('bank', `%${search.bank}%`)
            .range(from, to)
            .order('id', { ascending: false }); // sort desc

        if (error) throw error;

        // Fix: Add parentheses to ensure correct order of operations
        const total_pages = Math.ceil((count ?? 0) / limit);
        for (const item of data ?? []) {
            if (item.client_id && item.client_secret) {
                try {
                    api.setCredential(item.client_id, item.client_secret)
                    var result = await balance.getBalance();
                    var disputeResult = await dispute.getListDisputes();
                    const [res1, res2] = await Promise.all([
                        balance.getBalance(),
                        dispute.getListDisputes()
                    ]);

                    const [data1, data2] = await Promise.all([
                        res1,
                        res2
                    ]);
                    item.balances = data1.balances;
                    item.disputes = data2.items;
                    console.log(item);
                } catch (err) {
                }
            }

        }

        return {
            total_items: count ?? 0,
            total_pages,
            items: data ?? []
        } as PaypalResult;
    }

    public async removeAccount(id: number) {
        try {
            const { error } = await supabase
                .from('account')
                .delete()
                .eq('id', id);

            return {
                success: true
            }
        } catch (error) {
            return {
                success: false,
                message: error
            }
        }
    }

    public async upsertAccount(account: PaypalAccount) {
        try {
            // Exclude 'id' from the account object before inserting
            const { id, ...accountWithoutId } = account;
            const { error } = await supabase
                .from('account')
                .upsert([account.id === 0 ? accountWithoutId : account])

            if (error) {
                return {
                    success: false,
                    message: error.message
                };
            }

            return {
                success: true
            };
        } catch (error: any) {
            return {
                success: false,
                message: error?.message || error
            };
        }
    }

    public async getAccount(id: number) {
        try {
            const { data, error } = await supabase
                .from('account')
                .select('*')
                .eq('id', id)
                .single();

            if (error) {
                return {
                    success: false,
                    message: error.message
                };
            }

            return {
                success: true,
                data
            };
        } catch (error: any) {
            return {
                success: false,
                message: error?.message || error
            };
        }
    }
}


const spHelper = new SupabaseHelper();
export default spHelper;