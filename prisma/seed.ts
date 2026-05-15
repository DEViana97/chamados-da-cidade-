import { PrismaClient } from "../src/generated/prisma/client"
import { PrismaPg } from "@prisma/adapter-pg"
import bcrypt from "bcryptjs"

const adapter = new PrismaPg({ connectionString: process.env.DATABASE_URL! })
const prisma = new PrismaClient({ adapter })

const categories = ["POTHOLE", "GARBAGE", "LIGHTING", "OTHER"] as const
const statuses = ["OPEN", "IN_PROGRESS", "RESOLVED"] as const

// Fortaleza neighborhoods with realistic coordinates
const locations = [
  { address: "Av. Beira Mar, 1500 — Meireles", lat: -3.7248, lng: -38.5072 },
  { address: "Rua Pereira Valente, 200 — Meireles", lat: -3.7283, lng: -38.5099 },
  { address: "Av. Santos Dumont, 850 — Aldeota", lat: -3.7319, lng: -38.5017 },
  { address: "Rua Carlos Vasconcelos, 500 — Meireles", lat: -3.7291, lng: -38.5043 },
  { address: "Av. Dom Luís, 1200 — Aldeota", lat: -3.7356, lng: -38.5024 },
  { address: "Rua Silva Jatahy, 300 — Aldeota", lat: -3.7387, lng: -38.5031 },
  { address: "Av. Abolição, 780 — Meireles", lat: -3.7261, lng: -38.5085 },
  { address: "Av. Virgílio Távora, 100 — Dionísio Torres", lat: -3.7412, lng: -38.5078 },
  { address: "Rua Tibúrcio Cavalcante, 600 — Dionísio Torres", lat: -3.7428, lng: -38.5063 },
  { address: "Av. 13 de Maio, 2000 — São Gerardo", lat: -3.7267, lng: -38.5359 },
  { address: "Rua General Sampaio, 120 — Centro", lat: -3.7224, lng: -38.5428 },
  { address: "Av. Alberto Nepomuceno, 55 — Centro", lat: -3.7187, lng: -38.5456 },
  { address: "Av. Duque de Caxias, 900 — Centro", lat: -3.7198, lng: -38.5381 },
  { address: "Rua Major Facundo, 400 — Centro", lat: -3.7215, lng: -38.5412 },
  { address: "Av. Domingos Olímpio, 1800 — Rodolfo Teófilo", lat: -3.7452, lng: -38.5463 },
  { address: "Rua Cônego de Castro, 200 — José Bonifácio", lat: -3.7489, lng: -38.5391 },
  { address: "Av. Aguanambi, 500 — Joaquim Távora", lat: -3.7341, lng: -38.5236 },
  { address: "Rua Padre Valdevino, 150 — Joaquim Távora", lat: -3.7363, lng: -38.5198 },
  { address: "Av. Pontes Vieira, 780 — Papicu", lat: -3.7456, lng: -38.4891 },
  { address: "Rua João Carvalho, 300 — Varjota", lat: -3.7332, lng: -38.4921 },
  { address: "Av. Engenheiro Santana Jr, 1200 — Varjota", lat: -3.7298, lng: -38.4867 },
  { address: "Av. Rui Barbosa, 650 — São João do Tauape", lat: -3.7521, lng: -38.5143 },
  { address: "Rua Pompeu Gomes, 100 — Parreão", lat: -3.7567, lng: -38.5089 },
  { address: "Av. Antônio Sales, 1400 — Dionísio Torres", lat: -3.7398, lng: -38.5112 },
  { address: "Rua Deputado Lauro Vieira Chaves, 500 — Benfica", lat: -3.7613, lng: -38.5234 },
  { address: "Av. Sen. Virgílio Távora, 300 — Papicu", lat: -3.7489, lng: -38.4923 },
  { address: "Rua Cidade Fortaleza, 200 — Cidade dos Funcionários", lat: -3.7789, lng: -38.4912 },
  { address: "Av. Bezerra de Menezes, 1100 — São Gerardo", lat: -3.7234, lng: -38.5467 },
  { address: "Rua João Pessoa, 800 — Centro", lat: -3.7241, lng: -38.5389 },
  { address: "Av. Leste Oeste, 400 — Centro", lat: -3.7172, lng: -38.5433 },
]

const titles = [
  "Buraco grande na via",
  "Acúmulo de lixo na calçada",
  "Iluminação pública apagada",
  "Buraco comprometendo tráfego",
  "Lixo espalhado na rua",
  "Poste de luz com defeito",
  "Entulho abandonado",
  "Calçada esburacada",
  "Bueiro entupido causando alagamento",
  "Placa de sinalização danificada",
  "Lâmpada queimada no poste",
  "Descarte irregular de resíduos",
  "Buraco após chuva",
  "Fiação exposta em poste",
  "Lixo em área pública",
]

const descriptions = [
  "O problema foi identificado há mais de uma semana e está causando transtornos para os moradores da região.",
  "Situação de risco para pedestres e veículos. Necessita atenção urgente da prefeitura.",
  "Moradores relatam que a situação piora a cada dia. Já tentamos contato por outros meios sem sucesso.",
  "O problema afeta toda a comunidade local e impede a circulação de pessoas com mobilidade reduzida.",
  "Risco de acidentes iminente. Solicitamos vistoria o mais rápido possível.",
  "A situação se agravou após as últimas chuvas. Pedimos solução urgente.",
  "Já faz mais de 15 dias desde o surgimento do problema. Precisamos de resposta.",
  "Área afetada fica próxima a escola, representando risco para crianças.",
  "O problema gera mau cheiro e atrai vetores de doenças para a região.",
  "Ciclistas e pedestres já sofreram quedas por conta deste problema.",
]

async function main() {
  console.log("🌱 Seeding database...")

  // Clear existing data
  await prisma.statusHistory.deleteMany()
  await prisma.comment.deleteMany()
  await prisma.occurrence.deleteMany()
  await prisma.user.deleteMany()

  // Create users
  const adminPassword = await bcrypt.hash("admin123!", 12)
  const analystPassword = await bcrypt.hash("analyst123!", 12)

  const admin = await prisma.user.create({
    data: {
      name: "Ana Ferreira",
      email: "admin@citydesk.com",
      password: adminPassword,
      role: "ADMIN",
    },
  })

  const analyst = await prisma.user.create({
    data: {
      name: "Carlos Mendes",
      email: "analyst@citydesk.com",
      password: analystPassword,
      role: "ANALYST",
    },
  })

  console.log(`✅ Created users: ${admin.email}, ${analyst.email}`)

  // Create 55 occurrences
  const occurrences = []

  for (let i = 0; i < 55; i++) {
    const loc = locations[i % locations.length]
    const category = categories[i % categories.length]
    const status = statuses[Math.floor(Math.random() * statuses.length)]
    const title = titles[i % titles.length]
    const description = descriptions[i % descriptions.length]

    // Spread dates over last 60 days
    const daysAgo = Math.floor(Math.random() * 60)
    const createdAt = new Date(Date.now() - daysAgo * 24 * 60 * 60 * 1000)
    const updatedAt = new Date(createdAt.getTime() + Math.random() * 7 * 24 * 60 * 60 * 1000)

    const occ = await prisma.occurrence.create({
      data: {
        title: `${title} — ${loc.address.split(" — ")[1] ?? "Fortaleza"}`,
        description: `${description} Local: ${loc.address}`,
        category,
        status,
        latitude: loc.lat + (Math.random() - 0.5) * 0.002,
        longitude: loc.lng + (Math.random() - 0.5) * 0.002,
        address: loc.address,
        userId: Math.random() > 0.5 ? (Math.random() > 0.5 ? admin.id : analyst.id) : null,
        createdAt,
        updatedAt,
      },
    })

    occurrences.push(occ)

    // Add status history for non-OPEN
    if (status === "IN_PROGRESS") {
      await prisma.statusHistory.create({
        data: {
          occurrenceId: occ.id,
          from: "OPEN",
          to: "IN_PROGRESS",
          changedAt: new Date(createdAt.getTime() + 2 * 24 * 60 * 60 * 1000),
        },
      })
    } else if (status === "RESOLVED") {
      await prisma.statusHistory.create({
        data: {
          occurrenceId: occ.id,
          from: "OPEN",
          to: "IN_PROGRESS",
          changedAt: new Date(createdAt.getTime() + 1 * 24 * 60 * 60 * 1000),
        },
      })
      await prisma.statusHistory.create({
        data: {
          occurrenceId: occ.id,
          from: "IN_PROGRESS",
          to: "RESOLVED",
          changedAt: updatedAt,
        },
      })
    }

    // Add comments to ~40% of occurrences
    if (Math.random() > 0.6) {
      await prisma.comment.create({
        data: {
          content: "Vistoriamos o local. Equipe técnica será acionada em breve.",
          authorId: admin.id,
          occurrenceId: occ.id,
          createdAt: new Date(createdAt.getTime() + 24 * 60 * 60 * 1000),
        },
      })
    }
  }

  console.log(`✅ Created ${occurrences.length} occurrences`)
  console.log("")
  console.log("📧 Login credentials:")
  console.log("   Admin:   admin@citydesk.com    / admin123!")
  console.log("   Analyst: analyst@citydesk.com  / analyst123!")
}

main()
  .catch((e) => {
    console.error(e)
    process.exit(1)
  })
  .finally(() => prisma.$disconnect())
