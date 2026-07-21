export function calculateTransactionTotal(
    liters: number,
    pricePerLiter: number
  ): number {
    return Number((liters * pricePerLiter).toFixed(2))
  }
  
  export function isValidTransactionAmount(
    liters: number,
    price: number,
    total: number
  ): boolean {
    return calculateTransactionTotal(liters, price) === total
  }