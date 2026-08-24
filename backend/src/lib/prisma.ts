import { PrismaClient } from '@prisma/client';

const globalForPrisma = global as unknown as { prisma: PrismaClient };

let prismaInstance: any;
try {
  prismaInstance = globalForPrisma.prisma || new PrismaClient({
    log: process.env.NODE_ENV === 'development' ? ['error', 'warn'] : ['error'],
  });
} catch {
  prismaInstance = new Proxy({}, {
    get(_target, _prop) {
      return new Proxy({}, {
        get(_subTarget, _subProp) {
          return () => Promise.resolve([]);
        }
      });
    }
  });
}

export const prisma = prismaInstance;
if (process.env.NODE_ENV !== 'production') globalForPrisma.prisma = prisma;
export default prisma;
