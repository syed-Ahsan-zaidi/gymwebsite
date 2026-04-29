import { PrismaClient } from '@prisma/client'

// Singleton function
const prismaClientSingleton = () => {
  return new PrismaClient()
}

// Global type augmentation
declare global {
  var prismaGlobal: undefined | ReturnType<typeof prismaClientSingleton>
}

// Singleton logic
const prisma = globalThis.prismaGlobal ?? prismaClientSingleton()

export default prisma

if (process.env.NODE_ENV !== 'production') globalThis.prismaGlobal = prisma
