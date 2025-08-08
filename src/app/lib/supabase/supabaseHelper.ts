import { PaypalAccount, PaypalResult } from "@/app/models/account";
import { supabase } from "./supabase_client";
import { SearchCriteria } from "@/app/models/searchCriteria";
import api, { Api } from "../api";
import balance from "../paypal/balance";
import dispute from "../paypal/dispute";
const isSandbox = Number(process.env.NEXT_PUBLIC_SANDBOX);

class SupabaseHelper {
    public async fetchPagedData(page: number = 1, limit: number = 5, search: SearchCriteria) {
        const from = (page - 1) * limit;
        const to = from + limit - 1;

        const { data, count, error } = await supabase
            .from('account')
            .select('*', { count: 'exact' })
            // .ilike('email', `%${search.email}%`)
            // .ilike('domain', `%${search.domain}%`)
            // .ilike('bank', `%${search.bank}%`)
            // .range(from, to)
            .order('id', { ascending: false }); // sort desc

        if (error) throw error;

        // Fix: Add parentheses to ensure correct order of operations
        const total_pages = Math.ceil((count ?? 0) / limit);
        // for (const item of data ?? []) {
        //     if (item.client_id && item.client_secret) {
        //         try {
        //             if (isSandbox == 0) {
        //                 api.setCredential(item.client_id, item.client_secret);
        //             }
        //             else {
        //                 api.setCredential(item.sandbox_client_id, item.sandbox_client_secret);
        //             }
        //             var result = await balance.getBalance();
        //             var disputeResult = await dispute.getListDisputes();
        //             const [res1, res2] = await Promise.all([
        //                 balance.getBalance(),
        //                 dispute.getListDisputes()
        //             ]);

        //             const [data1, data2] = await Promise.all([
        //                 res1,
        //                 res2
        //             ]);
        //             item.balances = data1.balances;
        //             item.disputes = data2.items;
        //             console.log(item);
        //         } catch (err) {
        //         }
        //     }
        // }

        return {
            total_items: count ?? 0,
            total_pages,
            items: data ?? []
        } as PaypalResult;
    }

    public async fetchAllAccounts() {
        const { data, error } = await supabase
            .from('account')
            .select('*')
            .order('id', { ascending: false });
        if (error) throw error;
        return {
            items: data ?? [],
            total_items: data?.length ?? 0,
        };
    }

    public async fetchTransactionAndBalance(item: any) {
        const isSandbox = Number(process.env.NEXT_PUBLIC_SANDBOX);
        const url = isSandbox == 1 ? "https://api-m.sandbox.paypal.com/v1" : "https://api-m.paypal.com/v1";
        const api = new Api(url);

        if (isSandbox == 0) {
            api.setCredential(item.client_id, item.client_secret);
        }
        else {
            api.setCredential(item.sandbox_client_id, item.sandbox_client_secret);
        }

        const [res1, res2] = await Promise.all([
            balance.getBalance(api),
            dispute.getListDisputes(api)
        ]);

        const [data1, data2] = await Promise.all([
            res1,
            res2
        ]);

        console.log(data1);
        console.log(data2);

        return {
            ...item,
            balances: data1.balances,
            disputes: data2.items,
        };
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
            // Exclude 'balances' and 'disputes' fields before upsert
            const { balances, disputes, ...accountData } = account.id === 0 ? accountWithoutId : account;
            const { data, error } = await supabase
                .from('account')
                .upsert([accountData])
                .select('*')
                .single()
            debugger;
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

    public async getUser(user: any) {
        debugger;
        try {
            const { data, error } = await supabase
                .from('user')
                .select('*')
                .eq('email', user.email)
                .single();

            if (error || !data) {
                const { error: insertError } = await supabase
                    .from('user').insert({
                        email: user.email
                    });

                return {
                    permission: false
                };
            }

            return {
                permission: data.permission
            };
        } catch (error: any) {
            return {
                error: true,
                message: error?.message || error
            };
        }
    }
}


const spHelper = new SupabaseHelper();
export default spHelper;