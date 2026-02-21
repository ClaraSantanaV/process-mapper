import { prisma } from "../src/lib/prisma.js"
import { ProcessStatus } from "@prisma/client"

async function main() {
  // ⭐ FINANCEIRO
  const financeiro = await prisma.area.create({
    data: { name: "Financeiro", order: 0 }
  })

  const contasPagar = await prisma.process.create({
    data: {
      name: "Contas a pagar",
      areaId: financeiro.id,
      tools: "SAP, Excel",
      responsible: "Analista Financeiro",
      status: ProcessStatus.SYSTEMIC,
      documentation: "https://company-docs.com/contas-pagar"
    }
  })

  const aprovacao = await prisma.process.create({
    data: {
      name: "Aprovação",
      areaId: financeiro.id,
      parentId: contasPagar.id,
      tools: "SAP Workflow",
      responsible: "Coordenador Financeiro",
      status: ProcessStatus.MANUAL
    }
  })

  await prisma.process.create({
    data: {
      name: "Pagamento",
      areaId: financeiro.id,
      parentId: aprovacao.id,
      tools: "Banco, SAP",
      responsible: "Tesouraria",
      status: ProcessStatus.SYSTEMIC
    }
  })

  await prisma.process.create({
    data: {
      name: "Conciliação bancária",
      areaId: financeiro.id,
      parentId: contasPagar.id,
      tools: "Excel, Banco",
      responsible: "Analista Financeiro",
      status: ProcessStatus.MANUAL
    }
  })

  // ⭐ RH
  const rh = await prisma.area.create({
    data: { name: "RH", order: 1 }
  })

  const admissao = await prisma.process.create({
    data: {
      name: "Admissão",
      areaId: rh.id,
      tools: "Gupy",
      responsible: "BP RH",
      status: ProcessStatus.SYSTEMIC
    }
  })

  await prisma.process.create({
    data: {
      name: "Coleta de documentos",
      areaId: rh.id,
      parentId: admissao.id,
      tools: "Email",
      responsible: "Assistente RH",
      status: ProcessStatus.MANUAL
    }
  })

  await prisma.process.create({
    data: {
      name: "Cadastro no sistema",
      areaId: rh.id,
      parentId: admissao.id,
      tools: "SAP HR",
      responsible: "Analista RH",
      status: ProcessStatus.SYSTEMIC
    }
  })

  // ⭐ TI
  const ti = await prisma.area.create({
    data: { name: "TI", order: 2 }
  })

  const incidente = await prisma.process.create({
    data: {
      name: "Atendimento de incidente",
      areaId: ti.id,
      tools: "ServiceNow",
      responsible: "Service Desk",
      status: ProcessStatus.SYSTEMIC
    }
  })

  await prisma.process.create({
    data: {
      name: "Triagem",
      areaId: ti.id,
      parentId: incidente.id,
      tools: "ServiceNow",
      responsible: "N1",
      status: ProcessStatus.MANUAL
    }
  })

  await prisma.process.create({
    data: {
      name: "Resolução",
      areaId: ti.id,
      parentId: incidente.id,
      tools: "Jira, Logs",
      responsible: "N2",
      status: ProcessStatus.SYSTEMIC
    }
  })
}

main()
  .catch(console.error)
  .finally(() => prisma.$disconnect())