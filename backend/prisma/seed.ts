import { prisma } from "../src/lib/prisma.js"
import { ProcessStatus } from "@prisma/client"

async function main() {
  // ─── FINANCEIRO ───────────────────────────────────────────────
  const financeiro = await prisma.area.create({
    data: { name: "Financeiro", order: 0 }
  })

  const contasPagar = await prisma.process.create({
    data: {
      name: "Contas a pagar",
      areaId: financeiro.id,
      tools: "SAP FI, Email",
      responsible: "Mariana Costa – Analista Financeiro",
      status: ProcessStatus.MANUAL,
      documentation: "https://wiki.empresa.com/financeiro/contas-a-pagar"
    }
  })

  await prisma.process.create({
    data: {
      name: "Recebimento e validação de NF",
      areaId: financeiro.id,
      parentId: contasPagar.id,
      tools: "SAP FI, Portal NF-e",
      responsible: "Mariana Costa – Analista Financeiro",
      status: ProcessStatus.SYSTEMIC
    }
  })

  const aprovacaoPagamento = await prisma.process.create({
    data: {
      name: "Aprovação de pagamento",
      areaId: financeiro.id,
      parentId: contasPagar.id,
      tools: "SAP Workflow, Teams",
      responsible: "Felipe Andrade – Coordenador Financeiro",
      status: ProcessStatus.MANUAL
    }
  })

  await prisma.process.create({
    data: {
      name: "Execução do pagamento",
      areaId: financeiro.id,
      parentId: aprovacaoPagamento.id,
      tools: "SAP FI, Internet Banking Bradesco",
      responsible: "Camila Rocha – Tesouraria",
      status: ProcessStatus.SYSTEMIC
    }
  })

  const contasReceber = await prisma.process.create({
    data: {
      name: "Contas a receber",
      areaId: financeiro.id,
      tools: "SAP FI, Excel",
      responsible: "Mariana Costa – Analista Financeiro",
      status: ProcessStatus.MANUAL
    }
  })

  await prisma.process.create({
    data: {
      name: "Faturamento ao cliente",
      areaId: financeiro.id,
      parentId: contasReceber.id,
      tools: "SAP SD, Portal NF-e SEFAZ",
      responsible: "Lucas Ferreira – Analista de Faturamento",
      status: ProcessStatus.SYSTEMIC
    }
  })

  await prisma.process.create({
    data: {
      name: "Cobrança e follow-up",
      areaId: financeiro.id,
      parentId: contasReceber.id,
      tools: "SAP FI, CRM HubSpot, Email",
      responsible: "Mariana Costa – Analista Financeiro",
      status: ProcessStatus.MANUAL
    }
  })

  const fechamentoMensal = await prisma.process.create({
    data: {
      name: "Fechamento mensal",
      areaId: financeiro.id,
      tools: "SAP FI, Power BI, Excel",
      responsible: "Rafael Lima – Controller",
      status: ProcessStatus.MANUAL,
      documentation: "https://wiki.empresa.com/financeiro/fechamento-mensal"
    }
  })

  await prisma.process.create({
    data: {
      name: "Apuração de impostos",
      areaId: financeiro.id,
      parentId: fechamentoMensal.id,
      tools: "SAP FI, SPED Fiscal, Domínio Sistemas",
      responsible: "Beatriz Souza – Contadora",
      status: ProcessStatus.SYSTEMIC
    }
  })

  await prisma.process.create({
    data: {
      name: "Relatório gerencial",
      areaId: financeiro.id,
      parentId: fechamentoMensal.id,
      tools: "Power BI, Excel",
      responsible: "Rafael Lima – Controller",
      status: ProcessStatus.MANUAL
    }
  })

  // ─── RH ───────────────────────────────────────────────────────
  const rh = await prisma.area.create({
    data: { name: "Recursos Humanos", order: 1 }
  })

  const recrutamento = await prisma.process.create({
    data: {
      name: "Recrutamento e seleção",
      areaId: rh.id,
      tools: "Gupy, LinkedIn Recruiter",
      responsible: "Juliana Mendes – Recrutadora",
      status: ProcessStatus.MANUAL,
      documentation: "https://wiki.empresa.com/rh/recrutamento"
    }
  })

  await prisma.process.create({
    data: {
      name: "Abertura e divulgação de vaga",
      areaId: rh.id,
      parentId: recrutamento.id,
      tools: "Gupy, LinkedIn, Indeed",
      responsible: "Juliana Mendes – Recrutadora",
      status: ProcessStatus.SYSTEMIC
    }
  })

  const triagem = await prisma.process.create({
    data: {
      name: "Triagem e entrevistas",
      areaId: rh.id,
      parentId: recrutamento.id,
      tools: "Gupy, Teams",
      responsible: "Juliana Mendes – Recrutadora",
      status: ProcessStatus.MANUAL
    }
  })

  await prisma.process.create({
    data: {
      name: "Entrevista técnica com gestor",
      areaId: rh.id,
      parentId: triagem.id,
      tools: "Teams, Notion",
      responsible: "Gestor da área solicitante",
      status: ProcessStatus.MANUAL
    }
  })

  await prisma.process.create({
    data: {
      name: "Proposta e contratação",
      areaId: rh.id,
      parentId: recrutamento.id,
      tools: "Gupy, DocuSign",
      responsible: "Priscila Torres – BP RH",
      status: ProcessStatus.MANUAL
    }
  })

  const onboarding = await prisma.process.create({
    data: {
      name: "Onboarding",
      areaId: rh.id,
      tools: "Portal RH, Teams, SAP HR",
      responsible: "Priscila Torres – BP RH",
      status: ProcessStatus.MANUAL,
      documentation: "https://wiki.empresa.com/rh/onboarding"
    }
  })

  await prisma.process.create({
    data: {
      name: "Coleta de documentos admissionais",
      areaId: rh.id,
      parentId: onboarding.id,
      tools: "Portal RH, Email",
      responsible: "Gabriel Oliveira – Assistente RH",
      status: ProcessStatus.MANUAL
    }
  })

  await prisma.process.create({
    data: {
      name: "Cadastro no sistema",
      areaId: rh.id,
      parentId: onboarding.id,
      tools: "SAP HR, Active Directory",
      responsible: "Gabriel Oliveira – Assistente RH",
      status: ProcessStatus.SYSTEMIC
    }
  })

  await prisma.process.create({
    data: {
      name: "Integração e treinamento inicial",
      areaId: rh.id,
      parentId: onboarding.id,
      tools: "Teams, LMS Cornerstone",
      responsible: "Priscila Torres – BP RH",
      status: ProcessStatus.MANUAL
    }
  })

  const folhaPagamento = await prisma.process.create({
    data: {
      name: "Folha de pagamento",
      areaId: rh.id,
      tools: "SAP HR, Banco Itaú",
      responsible: "Ana Paula Gomes – Analista de Folha",
      status: ProcessStatus.MANUAL,
      documentation: "https://wiki.empresa.com/rh/folha-de-pagamento"
    }
  })

  await prisma.process.create({
    data: {
      name: "Coleta de variáveis",
      areaId: rh.id,
      parentId: folhaPagamento.id,
      tools: "SAP HR, Planilha de controle",
      responsible: "Ana Paula Gomes – Analista de Folha",
      status: ProcessStatus.MANUAL
    }
  })

  await prisma.process.create({
    data: {
      name: "Processamento e homologação",
      areaId: rh.id,
      parentId: folhaPagamento.id,
      tools: "SAP HR",
      responsible: "Marcos Vieira – Gerente RH",
      status: ProcessStatus.SYSTEMIC
    }
  })

  await prisma.process.create({
    data: {
      name: "Pagamento e envio de holerites",
      areaId: rh.id,
      parentId: folhaPagamento.id,
      tools: "Banco Itaú, Portal RH",
      responsible: "Camila Rocha – Tesouraria",
      status: ProcessStatus.SYSTEMIC
    }
  })

  // ─── TI ───────────────────────────────────────────────────────
  const ti = await prisma.area.create({
    data: { name: "Tecnologia da Informação", order: 2 }
  })

  const gestaoIncidentes = await prisma.process.create({
    data: {
      name: "Gestão de incidentes",
      areaId: ti.id,
      tools: "ServiceNow, Zabbix",
      responsible: "Bruno Carvalho – Coordenador Service Desk",
      status: ProcessStatus.SYSTEMIC,
      documentation: "https://wiki.empresa.com/ti/gestao-incidentes"
    }
  })

  await prisma.process.create({
    data: {
      name: "Registro e triagem (N1)",
      areaId: ti.id,
      parentId: gestaoIncidentes.id,
      tools: "ServiceNow, Teams",
      responsible: "Equipe N1 – Service Desk",
      status: ProcessStatus.SYSTEMIC
    }
  })

  const resolucaoN2 = await prisma.process.create({
    data: {
      name: "Resolução técnica (N2/N3)",
      areaId: ti.id,
      parentId: gestaoIncidentes.id,
      tools: "Jira, Zabbix, Grafana",
      responsible: "Diego Nascimento – Analista Infraestrutura",
      status: ProcessStatus.MANUAL
    }
  })

  await prisma.process.create({
    data: {
      name: "Escalonamento para fornecedor",
      areaId: ti.id,
      parentId: resolucaoN2.id,
      tools: "Portal Oracle, Portal Microsoft",
      responsible: "Diego Nascimento – Analista Infraestrutura",
      status: ProcessStatus.MANUAL
    }
  })

  await prisma.process.create({
    data: {
      name: "Encerramento e pesquisa de satisfação",
      areaId: ti.id,
      parentId: gestaoIncidentes.id,
      tools: "ServiceNow",
      responsible: "Bruno Carvalho – Coordenador Service Desk",
      status: ProcessStatus.SYSTEMIC
    }
  })

  const gestaoMudancas = await prisma.process.create({
    data: {
      name: "Gestão de mudanças (CAB)",
      areaId: ti.id,
      tools: "ServiceNow, Confluence",
      responsible: "Tatiane Ramos – Gerente de TI",
      status: ProcessStatus.MANUAL,
      documentation: "https://wiki.empresa.com/ti/gestao-mudancas"
    }
  })

  await prisma.process.create({
    data: {
      name: "Requisição e análise de impacto",
      areaId: ti.id,
      parentId: gestaoMudancas.id,
      tools: "ServiceNow, Confluence",
      responsible: "Arquiteto de Soluções",
      status: ProcessStatus.MANUAL
    }
  })

  await prisma.process.create({
    data: {
      name: "Aprovação pelo CAB",
      areaId: ti.id,
      parentId: gestaoMudancas.id,
      tools: "ServiceNow, Teams",
      responsible: "Tatiane Ramos – Gerente de TI",
      status: ProcessStatus.MANUAL
    }
  })

  await prisma.process.create({
    data: {
      name: "Implementação e verificação",
      areaId: ti.id,
      parentId: gestaoMudancas.id,
      tools: "GitLab CI/CD, Jira, Grafana",
      responsible: "Diego Nascimento – Analista Infraestrutura",
      status: ProcessStatus.SYSTEMIC
    }
  })

  const gestaoAcessos = await prisma.process.create({
    data: {
      name: "Gestão de acessos",
      areaId: ti.id,
      tools: "Active Directory, ServiceNow",
      responsible: "Bruno Carvalho – Coordenador Service Desk",
      status: ProcessStatus.MANUAL
    }
  })

  await prisma.process.create({
    data: {
      name: "Solicitação e aprovação de acesso",
      areaId: ti.id,
      parentId: gestaoAcessos.id,
      tools: "ServiceNow, Teams",
      responsible: "Gestor imediato do solicitante",
      status: ProcessStatus.MANUAL
    }
  })

  await prisma.process.create({
    data: {
      name: "Provisionamento de acesso",
      areaId: ti.id,
      parentId: gestaoAcessos.id,
      tools: "Active Directory, Azure AD, LDAP",
      responsible: "Equipe N1 – Service Desk",
      status: ProcessStatus.SYSTEMIC
    }
  })

  // ─── COMERCIAL ────────────────────────────────────────────────
  const comercial = await prisma.area.create({
    data: { name: "Comercial", order: 3 }
  })

  const gestaoLeads = await prisma.process.create({
    data: {
      name: "Gestão de leads",
      areaId: comercial.id,
      tools: "HubSpot CRM, RD Station",
      responsible: "Rodrigo Alves – Gerente Comercial",
      status: ProcessStatus.SYSTEMIC,
      documentation: "https://wiki.empresa.com/comercial/gestao-leads"
    }
  })

  await prisma.process.create({
    data: {
      name: "Qualificação de lead (SDR)",
      areaId: comercial.id,
      parentId: gestaoLeads.id,
      tools: "HubSpot CRM, LinkedIn Sales Navigator",
      responsible: "Fernanda Lima – SDR",
      status: ProcessStatus.MANUAL
    }
  })

  await prisma.process.create({
    data: {
      name: "Nutrição e automação de marketing",
      areaId: comercial.id,
      parentId: gestaoLeads.id,
      tools: "RD Station, HubSpot",
      responsible: "Equipe de Marketing",
      status: ProcessStatus.SYSTEMIC
    }
  })

  const proposta = await prisma.process.create({
    data: {
      name: "Proposta comercial",
      areaId: comercial.id,
      tools: "HubSpot CRM, Proposify",
      responsible: "Carlos Eduardo – Account Executive",
      status: ProcessStatus.MANUAL,
      documentation: "https://wiki.empresa.com/comercial/proposta"
    }
  })

  await prisma.process.create({
    data: {
      name: "Levantamento de requisitos",
      areaId: comercial.id,
      parentId: proposta.id,
      tools: "Teams, Notion, HubSpot",
      responsible: "Carlos Eduardo – Account Executive",
      status: ProcessStatus.MANUAL
    }
  })

  await prisma.process.create({
    data: {
      name: "Elaboração e envio da proposta",
      areaId: comercial.id,
      parentId: proposta.id,
      tools: "Proposify, HubSpot",
      responsible: "Carlos Eduardo – Account Executive",
      status: ProcessStatus.MANUAL
    }
  })

  const fechamentoContrato = await prisma.process.create({
    data: {
      name: "Fechamento de contrato",
      areaId: comercial.id,
      tools: "DocuSign, HubSpot",
      responsible: "Carlos Eduardo – Account Executive",
      status: ProcessStatus.MANUAL
    }
  })

  await prisma.process.create({
    data: {
      name: "Revisão jurídica do contrato",
      areaId: comercial.id,
      parentId: fechamentoContrato.id,
      tools: "ContractPodAi, Email",
      responsible: "Luísa Campos – Advogada Corporativa",
      status: ProcessStatus.MANUAL
    }
  })

  await prisma.process.create({
    data: {
      name: "Assinatura digital",
      areaId: comercial.id,
      parentId: fechamentoContrato.id,
      tools: "DocuSign",
      responsible: "Carlos Eduardo – Account Executive",
      status: ProcessStatus.SYSTEMIC
    }
  })

  await prisma.process.create({
    data: {
      name: "Onboarding do cliente",
      areaId: comercial.id,
      parentId: fechamentoContrato.id,
      tools: "HubSpot, Notion, Teams",
      responsible: "Sofia Martins – Customer Success",
      status: ProcessStatus.MANUAL
    }
  })

  // ─── OPERAÇÕES ────────────────────────────────────────────────
  const operacoes = await prisma.area.create({
    data: { name: "Operações", order: 4 }
  })

  const gestaoPedidos = await prisma.process.create({
    data: {
      name: "Gestão de pedidos",
      areaId: operacoes.id,
      tools: "SAP SD, WMS Totvs",
      responsible: "Henrique Barbosa – Supervisor de Logística",
      status: ProcessStatus.SYSTEMIC,
      documentation: "https://wiki.empresa.com/operacoes/gestao-pedidos"
    }
  })

  await prisma.process.create({
    data: {
      name: "Recebimento e confirmação do pedido",
      areaId: operacoes.id,
      parentId: gestaoPedidos.id,
      tools: "SAP SD, EDI, Portal do Cliente",
      responsible: "Sistema – integração automática",
      status: ProcessStatus.SYSTEMIC
    }
  })

  await prisma.process.create({
    data: {
      name: "Verificação de estoque e reserva",
      areaId: operacoes.id,
      parentId: gestaoPedidos.id,
      tools: "WMS Totvs, SAP MM",
      responsible: "Patricia Nunes – Analista de Estoque",
      status: ProcessStatus.SYSTEMIC
    }
  })

  await prisma.process.create({
    data: {
      name: "Separação, embalagem e despacho",
      areaId: operacoes.id,
      parentId: gestaoPedidos.id,
      tools: "WMS Totvs, Coletor RF",
      responsible: "Operador Logístico",
      status: ProcessStatus.MANUAL
    }
  })

  await prisma.process.create({
    data: {
      name: "Emissão de NF e romaneio",
      areaId: operacoes.id,
      parentId: gestaoPedidos.id,
      tools: "SAP SD, Portal NF-e SEFAZ",
      responsible: "Lucas Ferreira – Analista de Faturamento",
      status: ProcessStatus.SYSTEMIC
    }
  })

  const gestaoEntregas = await prisma.process.create({
    data: {
      name: "Gestão de entregas",
      areaId: operacoes.id,
      tools: "TMS Transplace, Portal Transportadora",
      responsible: "Henrique Barbosa – Supervisor de Logística",
      status: ProcessStatus.MANUAL
    }
  })

  await prisma.process.create({
    data: {
      name: "Agendamento e coleta pela transportadora",
      areaId: operacoes.id,
      parentId: gestaoEntregas.id,
      tools: "TMS Transplace",
      responsible: "Patricia Nunes – Analista de Estoque",
      status: ProcessStatus.MANUAL
    }
  })

  await prisma.process.create({
    data: {
      name: "Rastreamento e monitoramento",
      areaId: operacoes.id,
      parentId: gestaoEntregas.id,
      tools: "TMS Transplace, Portal Transportadora",
      responsible: "Patricia Nunes – Analista de Estoque",
      status: ProcessStatus.SYSTEMIC
    }
  })

  await prisma.process.create({
    data: {
      name: "Confirmação de entrega e CSAT",
      areaId: operacoes.id,
      parentId: gestaoEntregas.id,
      tools: "TMS Transplace, Zendesk",
      responsible: "Sofia Martins – Customer Success",
      status: ProcessStatus.SYSTEMIC
    }
  })
}

main()
  .catch(console.error)
  .finally(() => prisma.$disconnect())