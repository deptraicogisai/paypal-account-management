import { Balance } from "./balance"

export interface PaypalResult {
    total_items?: number,
    total_pages?: number,
    items: PaypalAccount[]
}

export interface PaypalAccount {
    id: number,
    email: string,
    password: string,
    question: string,
    phone: string,
    country: string,
    domain: string,
    bank: string,
    note: string,
    vps: string,
    vps_user: string,
    vps_password: string,
    client_id: string,
    client_secret: string    
    balances: Balance[]
}
