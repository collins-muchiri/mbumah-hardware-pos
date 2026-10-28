import { PrismaClient } from '@prisma/client';
const db = new PrismaClient();
const rows = await db.systemConfig.findMany({ where: { key: { in: ['cadence.freshDays', 'cadence.windowDays'] } } });
console.log('stored law:', rows.map(x => `${x.key}=${x.value}`).join(', '));
const a = await db.auditLog.findFirst({ where: { entityType: "SystemConfig", entityId: "cadence" }, orderBy: { timestamp: 'desc' } });
console.log('audit:', a ? `${a.action} | old:${JSON.stringify(a.oldValues)} | new:${JSON.stringify(a.newValues)}` : 'NONE');
process.exit(0);
