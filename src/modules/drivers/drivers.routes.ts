import { Router } from "express"
import { getDriverById, getDrivers } from "./drivers.controller"

const router = Router()

/* -----------------------------
   DRIVERS ROUTES
------------------------------ */


// GET ALL DRIVERS
router.get("/", getDrivers)

// GET DRIVER BY ID
router.get("/:id", getDriverById)

export default router