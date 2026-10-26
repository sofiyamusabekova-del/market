import { PrismaClient } from '@prisma/client';
import { PrismaNeonHttp } from '@prisma/adapter-neon';

const globalForPrisma = globalThis as unknown as {
  prisma: PrismaClient | null | undefined;
};

function createPrismaClient(): PrismaClient | null {
  const connectionString = process.env.DATABASE_URL;

  if (!connectionString || connectionString.includes('sample_pass')) {
    return null;
  }

  try {
    const adapter = new PrismaNeonHttp(connectionString, {} as any);
    return new PrismaClient({ adapter } as any);
  } catch (err) {
    console.warn('Failed to initialize PrismaNeonHttp adapter:', err);
    return null;
  }
}

export const prisma = globalForPrisma.prisma !== undefined
  ? globalForPrisma.prisma
  : (globalForPrisma.prisma = createPrismaClient());
