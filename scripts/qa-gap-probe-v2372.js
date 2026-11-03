/* v2.372.0 QA candidate probe — fresh sales with their gap shape (explicit URL per GHOST-DB LAW). */
const { PrismaClient } = require('@prisma/client');
const p = new PrismaClient();
(async () => {
  const sales = await p.salesTransaction.findMany({
    where: { transactionType: 'SALE', paymentStatus: 'COMPLETED' },
    take: 8,
    orderBy: { createdAt: 'asc' },
    select: {
      id: true, receiptNumber: true, totalAmount: true, subtotal: true,
      taxAmount: true, discountAmount: true, paymentStatus: true,
      items: { select: { id: true, quantity: true, lineTotal: true, productName: true } },
      refunds: { select: { id: true, receiptNumber: true } },
    },
  });
  for (const s of sales) {
    const lines = s.items.reduce((a, i) => a + Number(i.lineTotal), 0);
    const gap = Number(s.totalAmount) - lines;
    console.log(
      s.id, s.receiptNumber,
      'hdr=' + s.totalAmount, 'linesΣ=' + lines, 'gap=' + gap,
      'tax=' + s.taxAmount, 'disc=' + s.discountAmount,
      'refundEvents=' + s.refunds.length, 'items=' + s.items.length,
    );
  }
  await p.$disconnect();
})().catch(e => { console.error('PROBE FAIL:', e.message.split('\n')[0]); process.exit(1); });
