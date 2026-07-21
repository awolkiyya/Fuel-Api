export type CreateTransactionDTO = {
    fuelRequestId: string;
    litersGiven: number;
  };
  
  export type TransactionResponse = {
    id: string;
  
    fuelRequestId: string;
    userId: string;
    vehicleId: string;
    stationId: string;
  
    litersGiven: number;
    pricePerLiter: number;
    totalCost: number;
  
    paymentStatus: "paid" | "unpaid";
  
    createdAt: Date;
  };