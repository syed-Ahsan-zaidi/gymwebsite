import { PrismaClient } from '@prisma/client'
import { PrismaPg } from '@prisma/adapter-pg'
import { Pool } from 'pg'

function normalizeDatabaseUrl(connectionString: string) {
  try {
    const parsedUrl = new URL(connectionString)
    const sslMode = parsedUrl.searchParams.get('sslmode')
    if (sslMode === 'prefer' || sslMode === 'require' || sslMode === 'verify-ca') {
      // Keep current secure behavior across upcoming pg major changes.
      parsedUrl.searchParams.set('sslmode', 'verify-full')
      return parsedUrl.toString()
    }
    return connectionString
  } catch {
    return connectionString
  }
}

// Singleton function
const prismaClientSingleton = () => {
  const connectionString = process.env.DATABASE_URL
  if (!connectionString) {
    throw new Error('DATABASE_URL is required to initialize Prisma client')
  }

  const pool = new Pool({ connectionString: normalizeDatabaseUrl(connectionString) })
  const adapter = new PrismaPg(pool)

  return new PrismaClient({ adapter })
}

// Global type augmentation
declare global {
  var prismaGlobal: undefined | ReturnType<typeof prismaClientSingleton>
}

// Singleton logic
const prisma = globalThis.prismaGlobal ?? prismaClientSingleton()

export default prisma

if (process.env.NODE_ENV !== 'production') globalThis.prismaGlobal = prisma
