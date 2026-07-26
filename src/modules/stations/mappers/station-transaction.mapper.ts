import { StationTransactionResource } from "../resources/station-transaction.resource";


export function mapStationTransaction(
  transaction: any
): StationTransactionResource {


  return {

    // =========================
    // TRANSACTION
    // =========================

    id: transaction.id,

    transactionNumber:
      transaction.transactionNumber ?? null,

    type: transaction.type,

    status:
      transaction.status ?? "COMPLETED",


    createdAt:
      transaction.createdAt.toISOString(),



    // =========================
    // STATION
    // =========================

    station: {

      id: transaction.station?.id,

      name: transaction.station?.name ?? "Unknown Station"

    },



    // =========================
    // CUSTOMER
    // =========================

    customer:

      transaction.organization

      ?

      {

        type: "ORGANIZATION",

        id: transaction.organization.id,

        name: transaction.organization.name,

        phone: transaction.organization.phone ?? null

      }


      :

      {

        type: "USER",

        id: transaction.user?.id ?? null,

        name:
          transaction.user?.name ?? "Walk-in Customer",

        phone:
          transaction.user?.phone ?? null

      },





    // =========================
    // VEHICLE
    // =========================

    vehicle:

      transaction.vehicle

      ?

      {

        id: transaction.vehicle.id,

        plateNumber:
          transaction.vehicle.plateNumber,

        model:
          transaction.vehicle.model ?? null

      }

      :

      null,





    // =========================
    // REQUEST
    // =========================

    request:

      transaction.fuelRequest

      ?

      {

        id: transaction.fuelRequest.id,

        status:
          transaction.fuelRequest.status,


        requestedLiters:
          transaction.fuelRequest.requestedLiters,


        approvedLiters:
          transaction.fuelRequest.approvedLiters ?? null,


        approvedAt:
          transaction.fuelRequest.approvedAt
          ?
          transaction.fuelRequest.approvedAt.toISOString()
          :
          null

      }

      :

      null,






    // =========================
    // DISPENSING
    // =========================

    dispensing: {


      fuelType: {

        id:
          transaction.fuelType?.id,

        name:
          transaction.fuelType?.name ?? "Unknown Fuel"

      },



      nozzle:

        transaction.nozzle

        ?

        {

          id:
            transaction.nozzle.id,

          name:
            transaction.nozzle.name,

          number:
            transaction.nozzle.number ?? null

        }

        :

        null,




      attendant:

        transaction.attendant

        ?

        {

          id:
            transaction.attendant.id,

          name:
            transaction.attendant.name

        }

        :

        null,



      liters:
        transaction.litersGiven,


      pricePerLiter:
        transaction.pricePerLiter,


      totalAmount:
        transaction.totalCost

    },





    // =========================
    // PAYMENT
    // =========================

    payment: {

      status:
        transaction.paymentStatus

    },





    // =========================
    // TIMELINE
    // =========================

    timeline: {


      verifiedAt:

        transaction.fuelRequest?.verifiedAt

        ?

        transaction.fuelRequest.verifiedAt.toISOString()

        :

        null,



      approvedAt:

        transaction.fuelRequest?.approvedAt

        ?

        transaction.fuelRequest.approvedAt.toISOString()

        :

        null,



      completedAt:

        transaction.completedAt

        ?

        transaction.completedAt.toISOString()

        :

        null,



      cancelledAt:

        transaction.fuelRequest?.cancelledAt

        ?

        transaction.fuelRequest.cancelledAt.toISOString()

        :

        null

    }


  }

}