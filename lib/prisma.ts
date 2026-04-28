import { PrismaClient } from "@prisma/client"
import { PrismaPg } from "@prisma/adapter-pg"
import { Pool } from "pg"

const connectionString = `${process.env.DATABASE_URL}`

const pool = new Pool({ connectionString })
const adapter = new PrismaPg(pool)

const globalForPrisma = global as unknown as { prisma: PrismaClient }

export const prisma =
  globalForPrisma.prisma ||
  new PrismaClient({ adapter }) // Adapter pass karne se "accelerateUrl" wala error khatam ho jayega

if (process.env.NODE_ENV !== "production") globalForPrisma.prisma = prisma

// Is line ko file ke bilkul niche add karein
export default prisma;

