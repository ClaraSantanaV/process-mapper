import express from "express"
import areaRoutes from "./routes/area.routes.js"
import processRoutes from "./routes/process.routes.js"
import { errorHandler } from "./middlewares/error.middleware.js"

const app = express()

app.use(express.json())

app.use("/areas", areaRoutes)
app.use("/processes", processRoutes)

app.use(errorHandler)

app.listen(3000, () => {
  console.log("Server running on port 3000")
})