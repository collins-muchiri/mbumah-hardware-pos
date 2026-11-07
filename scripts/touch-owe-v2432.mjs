#!/usr/bin/env node
// touch-owe-v2432.mjs — the census family's runtime world (Task 127's 14e law:
// the fixture ships zero named suppliers and zero low shelves, the census can
// never speak in the stock world). Keeper → touch → restore.
//   no args:  write the keeper, then TOUCH — name two juja-main products from
//             two distinct makers and empty their shelves (out rows with
//             reorderLevel>0 join the order; the nothing-to-order law keeps
//             honest). Prints TOUCH OK.
//   --restore: read the keeper and put every touched row back byte-exact.
//             Prints RESTORE OK.
import { readFileSync, writeFileSync, existsSync } from 'node:fs';
import { PrismaClient } from '@prisma/client';

const p = new PrismaClient();
const KEEPER = '/tmp/keeper2432.json';
const restore = process.argv.includes('--restore');

const main = async () => {
  if (restore) {
    if (!existsSync(KEEPER)) { console.error('no keeper'); process.exit(1); }
    const k = JSON.parse(readFileSync(KEEPER, 'utf8'));
    for (const t of k.touches) {
      await p.product.update({ where: { id: t.id }, data: { supplierId: t.supplierId, quantityInStock: t.quantityInStock } });
    }
    console.log('RESTORE OK');
    await p.$disconnect();
    return;
  }
  // two distinct makers with real supplier rows
  const makers = await p.supplier.findMany({ orderBy: { name: 'asc' }, take: 2, select: { id: true, name: true } });
  if (makers.length < 2) { console.error('fewer than two suppliers'); process.exit(1); }
  // two active juja-main products with a reorderLevel (reorder-0 rows never join)
  const shelves = await p.product.findMany({
    where: { storeId: 'store_juja_main', isActive: true, reorderLevel: { gt: 0 } },
    orderBy: { name: 'asc' },
    take: 2,
    select: { id: true, name: true, supplierId: true, quantityInStock: true, reorderLevel: true },
  });
  if (shelves.length < 2) { console.error('fewer than two reorderable shelves'); process.exit(1); }
  const keeper = {
    at: new Date().toISOString(),
    touches: shelves.map((s, i) => ({ id: s.id, supplierId: s.supplierId, quantityInStock: s.quantityInStock, maker: makers[i].name })),
  };
  writeFileSync(KEEPER, JSON.stringify(keeper, null, 2));
  // the touch: maker i owns shelf i, the shelf empties (quantityInStock 0 <= reorderLevel joins)
  for (let i = 0; i < shelves.length; i++) {
    await p.product.update({ where: { id: shelves[i].id }, data: { supplierId: makers[i].id, quantityInStock: 0 } });
  }
  console.log('TOUCH OK');
  await p.$disconnect();
};

main().catch((e) => { console.error(e.message); process.exit(1); });
