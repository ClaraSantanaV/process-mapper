import type { Process } from "@prisma/client"
import { beforeEach, describe, expect, it, vi } from "vitest"
import { prisma } from "../lib/prisma.js"
import { processService } from "../services/process.service.js"

vi.mock("../lib/prisma.js", () => ({
  prisma: {
    process: {
      findMany: vi.fn(),
    },
  },
}))

function makeProcess(overrides: Partial<Process> = {}): Process {
  return {
    id: "test-id",
    name: "Test Process",
    areaId: "area-id",
    parentId: null,
    level: 0,
    order: 0,
    tools: null,
    responsible: null,
    documentation: null,
    status: null,
    createdAt: new Date(),
    updatedAt: new Date(),
    ...overrides,
  }
}

function mockProcesses(...processes: Partial<Process>[]) {
  vi.mocked(prisma.process.findMany).mockResolvedValue(
    processes.map(makeProcess),
  )
}

describe("processService.getTree", () => {
  beforeEach(() => {
    vi.clearAllMocks()
  })

  it("returns an empty array when there are no processes", async () => {
    mockProcesses()

    const tree = await processService.getTree()

    expect(tree).toEqual([])
  })

  it("returns root processes each with an empty children array", async () => {
    mockProcesses(
      { id: "1", name: "Root A", parentId: null },
      { id: "2", name: "Root B", parentId: null },
    )

    const tree = await processService.getTree()

    expect(tree).toHaveLength(2)
    expect(tree[0]?.children).toEqual([])
    expect(tree[1]?.children).toEqual([])
  })

  it("nests a child process under its parent", async () => {
    mockProcesses(
      { id: "1", name: "Parent", parentId: null },
      { id: "2", name: "Child", parentId: "1" },
    )

    const tree = await processService.getTree()

    expect(tree).toHaveLength(1)
    expect(tree[0]?.children).toHaveLength(1)
    expect(tree[0]?.children[0]?.name).toBe("Child")
  })

  it("handles multiple levels of nesting", async () => {
    mockProcesses(
      { id: "1", name: "Level 0", parentId: null },
      { id: "2", name: "Level 1", parentId: "1" },
      { id: "3", name: "Level 2", parentId: "2" },
    )

    const tree = await processService.getTree()

    const level2 = tree[0]?.children[0]?.children[0]
    expect(level2?.name).toBe("Level 2")
  })

  it("ignores processes whose parentId does not match any existing ID", async () => {
    mockProcesses(
      { id: "1", name: "Root", parentId: null },
      { id: "2", name: "Orphan", parentId: "does-not-exist" },
    )

    const tree = await processService.getTree()

    expect(tree).toHaveLength(1)
    expect(tree[0]?.children).toHaveLength(0)
  })
})
