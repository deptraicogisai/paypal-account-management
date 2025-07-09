export interface Balance {
    currency: string
    available_balance: Currency,
    total_balance: Currency,
    withheld_balance: Currency,
}

interface Currency {
    currency_code: string,
    value: number
}