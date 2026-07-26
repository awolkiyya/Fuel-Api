export interface StationTransactionResource {

    // =========================
    // TRANSACTION
    // =========================
  
    id: string
  
    transactionNumber?: string | null
  
    type:
      | "NORMAL"
      | "ORGANIZATION"
  
  
    status: string
  
  
    createdAt: string
  
  
  
    // =========================
    // STATION
    // =========================
  
    station: {
  
      id: string
  
      name: string
  
    }
  
  
  
    // =========================
    // CUSTOMER / ORGANIZATION
    // =========================
  
    customer: {
  
      type:
        | "USER"
        | "ORGANIZATION"
  
  
      id?: string | null
  
      name: string
  
      phone?: string | null
  
    }
  
  
  
    // =========================
    // VEHICLE
    // =========================
  
    vehicle?: {
  
      id: string
  
      plateNumber: string
  
      model?: string | null
  
    } | null
  
  
  
  
    // =========================
    // FUEL REQUEST FLOW
    // =========================
  
    request?: {
  
      id: string
  
      status: string
  
  
      requestedLiters: number
  
  
      approvedLiters: number | null
  
  
      approvedAt: string | null
  
    } | null
  
  
  
  
    // =========================
    // DISPENSING
    // =========================
  
    dispensing: {
  
  
      fuelType: {
  
        id: string
  
        name: string
  
      }
  
  
  
      nozzle?: {
  
        id: string
  
        name: string
  
        number?: string | null
  
      } | null
  
  
  
  
      attendant?: {
  
        id: string
  
        name: string
  
      } | null
  
  
  
  
      liters: number
  
  
      pricePerLiter: number
  
  
      totalAmount: number
  
  
    }
  
  
  
  
    // =========================
    // PAYMENT
    // =========================
  
    payment: {
  
      status: string
  
    }
  
  
  
  
    // =========================
    // TIMELINE
    // =========================
  
    timeline: {
  
      verifiedAt: string | null
  
      approvedAt: string | null
  
      completedAt: string | null
  
      cancelledAt: string | null
  
    }
  
  }