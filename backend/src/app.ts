import cors from "cors"
import express from "express"

import areaRoutes from "./routes/area.routes.js"
import processRoutes from "./routes/process.routes.js"
import { errorHandler } from "./middlewares/error.middleware.js"

export const app = express()

app.use(cors({
  origin: process.env.ALLOWED_ORIGIN ?? "*",
}))
app.use(express.json())
app.disable("etag")

app.use("/api/v1/areas", areaRoutes)
app.use("/api/v1/processes", processRoutes)

app.use(errorHandler)
