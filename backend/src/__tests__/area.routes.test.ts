import request from "supertest"
import { beforeEach, describe, expect, it, vi } from "vitest"
import { app } from "../app.js"
import { areaService } from "../services/area.service.js"

vi.mock("../services/area.service.js", () => ({
  areaService: {
    getAll: vi.fn(),
    create: vi.fn(),
    update: vi.fn(),
    delete: vi.fn(),
    reorder: vi.fn(),
  },
}))

const postArea = (body: unknown) =>
  request(app).post("/api/v1/areas").send(body as string | object | undefined)

describe("POST /api/v1/areas", () => {
  beforeEach(() => {
    vi.clearAllMocks()
  })

  describe("valid request", () => {
    it("returns 201 with the created area", async () => {
      vi.mocked(areaService.create).mockResolvedValue({ id: "uuid-1", name: "Finance", order: 0 })

      const res = await postArea({ name: "Finance" })

      expect(res.status).toBe(201)
      expect(res.body.name).toBe("Finance")
      expect(areaService.create).toHaveBeenCalledWith({ name: "Finance", order: 0 })
    })
  })

  describe("invalid request — Zod validation rejects before reaching the service", () => {
    it("returns 400 when name is an empty string", async () => {
      const res = await postArea({ name: "" })

      expect(res.status).toBe(400)
      expect(areaService.create).not.toHaveBeenCalled()
    })

    it("returns 400 when name is missing", async () => {
      const res = await postArea({})

      expect(res.status).toBe(400)
      expect(areaService.create).not.toHaveBeenCalled()
    })

    it("returns 400 when name is not a string", async () => {
      const res = await postArea({ name: 123 })

      expect(res.status).toBe(400)
      expect(areaService.create).not.toHaveBeenCalled()
    })
  })
})
