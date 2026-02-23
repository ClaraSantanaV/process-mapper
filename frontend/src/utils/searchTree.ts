import type { Area } from "../types/area"
import type { ProcessNode } from "../types/process"

function nodeMatchesSearch(node: ProcessNode, search: string): boolean {
  if (node.name.toLowerCase().includes(search)) return true
  return node.children.some((child) => nodeMatchesSearch(child, search))
}

export function normalize(str: string): string {
  return str
    .toLowerCase()
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "")
    .trim()
}

export function filterProcessTree(
  nodes: ProcessNode[],
  search: string
): ProcessNode[] {
  if (!search.trim()) return nodes

  return nodes.reduce<ProcessNode[]>((acc, node) => {
    const filteredChildren = filterProcessTree(node.children, search)
    const selfMatches = node.name.toLowerCase().includes(search)

    if (selfMatches || filteredChildren.length > 0) {
      acc.push({ ...node, children: filteredChildren })
    }

    return acc
  }, [])
}

export function areaMatchesSearch(
  area: Area,
  areaProcesses: ProcessNode[],
  search: string
): boolean {
  if (!search.trim()) return true
  if (area.name.toLowerCase().includes(search)) return true
  return areaProcesses.some((node) => nodeMatchesSearch(node, search))
}