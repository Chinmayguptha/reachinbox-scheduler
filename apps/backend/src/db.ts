import { PrismaClient } from '@prisma/client'

const prisma = new PrismaClient({
    log: ['query', 'info', 'warn', 'error'],
})

// Validation check (non-blocking)
prisma.$connect().catch((e: any) => {
    console.warn("Database Connection Failed (Is Docker running?):", e.message);
});

export default prisma
