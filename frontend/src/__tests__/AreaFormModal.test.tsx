import "@testing-library/jest-dom"
import { render, screen, waitFor } from "@testing-library/react"
import userEvent from "@testing-library/user-event"
import { beforeEach, describe, expect, it, vi } from "vitest"

import { AreaFormModal } from "../components/AreaFormModal"
import { areaService } from "../services/area.service"

vi.mock("../services/area.service", () => ({
  areaService: {
    create: vi.fn(),
    update: vi.fn(),
  },
}))

const existingArea = { id: "area-1", name: "Finance", order: 0 }

function renderCreateModal(onSuccess = vi.fn()) {
  render(<AreaFormModal onClose={vi.fn()} onSuccess={onSuccess} />)
}

function renderEditModal(onSuccess = vi.fn()) {
  render(<AreaFormModal area={existingArea} onClose={vi.fn()} onSuccess={onSuccess} />)
}

const nameInput = () => screen.getByPlaceholderText("ex: Recursos Humanos")
const submitButton = (label: RegExp) => screen.getByRole("button", { name: label })

describe("AreaFormModal", () => {
  beforeEach(() => {
    vi.clearAllMocks()
  })

  describe("create mode (no area prop)", () => {
    it("renders with 'Nova Área' title and empty input", () => {
      renderCreateModal()

      expect(screen.getByText("Nova Área")).toBeInTheDocument()
      expect(nameInput()).toHaveValue("")
    })

    it("keeps submit button disabled while input is empty", () => {
      renderCreateModal()

      expect(submitButton(/criar área/i)).toBeDisabled()
    })

    it("calls areaService.create and onSuccess on valid submit", async () => {
      vi.mocked(areaService.create).mockResolvedValue(existingArea)
      const onSuccess = vi.fn()
      renderCreateModal(onSuccess)

      await userEvent.type(nameInput(), "Finance")
      await userEvent.click(submitButton(/criar área/i))

      await waitFor(() => {
        expect(areaService.create).toHaveBeenCalledWith({ name: "Finance" })
        expect(onSuccess).toHaveBeenCalledOnce()
      })
    })

    it("shows an error message when areaService.create throws", async () => {
      vi.mocked(areaService.create).mockRejectedValue(new Error("Network error"))
      renderCreateModal()

      await userEvent.type(nameInput(), "Finance")
      await userEvent.click(submitButton(/criar área/i))

      await waitFor(() => {
        expect(screen.getByText("Erro ao salvar. Tente novamente.")).toBeInTheDocument()
      })
    })
  })

  describe("edit mode (area prop provided)", () => {
    it("renders with 'Editar Área' title and existing name pre-filled", () => {
      renderEditModal()

      expect(screen.getByText("Editar Área")).toBeInTheDocument()
      expect(screen.getByDisplayValue("Finance")).toBeInTheDocument()
    })

    it("calls areaService.update with the new name on submit", async () => {
      vi.mocked(areaService.update).mockResolvedValue({ ...existingArea, name: "Finance Updated" })
      const onSuccess = vi.fn()
      renderEditModal(onSuccess)

      const input = screen.getByDisplayValue("Finance")
      await userEvent.clear(input)
      await userEvent.type(input, "Finance Updated")
      await userEvent.click(submitButton(/salvar alterações/i))

      await waitFor(() => {
        expect(areaService.update).toHaveBeenCalledWith("area-1", { name: "Finance Updated" })
        expect(onSuccess).toHaveBeenCalledOnce()
      })
    })
  })
})
