import { ZodError } from "zod"

export function errorHandler(err: any, req: any, res: any, next: any) {
  if (err instanceof ZodError) {
    return res.status(400).json({ error: err.issues })
  }

  console.error(err)
  res.status(500).json({ error: "Internal server error" })
}