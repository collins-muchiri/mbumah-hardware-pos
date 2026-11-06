// THE RECEIVE'S MAKER SUITE (v2.426.0) — THE ARC'S SEVENTH WORD: the
// receipt names the maker that filled it.
//
//   - the maker read (receiveMaker): the day's honest read — a trimmed,
//     non-empty name makes the maker; the phone and the contact ride
//     only when they are real strings too; the whitespace and non-string
//     arrivals read the absence (never a crash, never a fake via, never
//     a dead dial).
//   - the toast's two faces (receiveSuccessVoice): the day's maker named
//     when the read found one, the round's old byte when it did not.
//   - the faces: the receive dialog's header chip (the sky census
//     family, the Truck icon, "via {name}"), the call door (the tel:
//     door gated on the maker's own phone, the day's contact in the
//     title), the toast's one home, and THE DOM'S LAW fix (the detail's
//     description is phrasing content now — the div-in-p hydration
//     wound the burst caught on this very face).
//
// Every pin reads the SOURCE OF RECORD (source bytes, not memory) — the
// house rule since the verify scripts were born.

import { readFileSync } from 'node:fs';
import { join } from 'node:path';
import { describe, it, expect } from 'vitest';

import { receiveMaker, receiveSuccessVoice } from '@/lib/po-receive';

const read = (p: string) => readFileSync(join(process.cwd(), p), 'utf8');

const LIB = 'src/lib/po-receive.ts';
const TAB = 'src/app/(shell)/tabs/purchase-orders-tab.tsx';
const API = 'src/lib/api.ts';
const libSrc = read(LIB);
const tabSrc = read(TAB);
const apiSrc = read(API);

const SUPPLIER = (over: Record<string, unknown> = {}) => ({
  id: 'sup_juja_dulux',
  name: 'AkzoNobel Kenya (Dulux)',
  phone: '0207654323',
  contactPerson: 'Priti Sharma',
  ...over,
});

describe('the maker read (v2.426.0) — the day\u2019s honest answer', () => {
  it('the full day rides \u2014 name, phone and contact all read, trimmed', () => {
    const maker = receiveMaker(SUPPLIER());
    expect(maker).toEqual({
      name: 'AkzoNobel Kenya (Dulux)',
      phone: '0207654323',
      contactPerson: 'Priti Sharma',
    });
  });

  it('a name-only supplier is the maker \u2014 the phone and contact stay honestly null', () => {
    const maker = receiveMaker(SUPPLIER({ phone: null, contactPerson: undefined }));
    expect(maker).toEqual({ name: 'AkzoNobel Kenya (Dulux)', phone: null, contactPerson: null });
  });

  it('THE WHITESPACE LAW \u2014 a padded name is trimmed, a whitespace phone is no dial', () => {
    const maker = receiveMaker(SUPPLIER({ name: '  Bamburi Cement Ltd  ', phone: '   ' }));
    expect(maker).toEqual({ name: 'Bamburi Cement Ltd', phone: null, contactPerson: 'Priti Sharma' });
  });

  it('a whitespace name is NO name \u2014 the maker is the null, never a fake via', () => {
    expect(receiveMaker(SUPPLIER({ name: '   ' }))).toBeNull();
    expect(receiveMaker(SUPPLIER({ name: '' }))).toBeNull();
    expect(receiveMaker(SUPPLIER({ name: null }))).toBeNull();
    expect(receiveMaker(SUPPLIER({ name: undefined }))).toBeNull();
  });

  it('THE HONEST ABSENCE \u2014 no supplier at all reads the null (the silent face)', () => {
    expect(receiveMaker(undefined)).toBeNull();
    expect(receiveMaker(null)).toBeNull();
    expect(receiveMaker({})).toBeNull();
  });

  it('THE GRACE \u2014 non-string arrivals read the absence, never a crash', () => {
    expect(receiveMaker(SUPPLIER({ name: 42 }))).toBeNull();
    expect(receiveMaker(SUPPLIER({ name: 'Bamburi Cement Ltd', phone: 7 }))).toEqual({
      name: 'Bamburi Cement Ltd',
      phone: null,
      contactPerson: 'Priti Sharma',
    });
  });
});

describe('the toast\u2019s two faces (v2.426.0) \u2014 the day named, the silence honest', () => {
  it('the maker face \u2014 the receipt speaks whose goods landed', () => {
    const maker = receiveMaker(SUPPLIER({ name: 'Bamburi Cement Ltd', phone: null, contactPerson: null }));
    expect(receiveSuccessVoice(maker)).toBe(
      "Items received and stock updated \u2014 Bamburi Cement Ltd's goods are on the shelf"
    );
  });

  it('the honest silence \u2014 no maker keeps the round\u2019s old byte', () => {
    expect(receiveSuccessVoice(null)).toBe('Items received and stock updated');
  });
});

describe('the faces (v2.426.0) \u2014 the chip, the call door and the DOM\u2019s law, pinned to the source', () => {
  it('the lib\u2019s one home \u2014 the maker read and the toast voice live in po-receive', () => {
    expect(libSrc).toContain("THE RECEIVE'S MAKER");
    expect(libSrc).toContain('export interface ReceiveMaker {');
    expect(libSrc).toContain('export function receiveMaker(');
    expect(libSrc).toContain('export function receiveSuccessVoice(');
  });

  it('the dialog reads the ONE home \u2014 the import, the maker read, the toast call', () => {
    expect(tabSrc).toContain(
      "import { buildReceiveInitials, receiveRowState, describeReceivePlan, drillLineState, describeDrillProgress, receiveMaker, receiveSuccessVoice, drillFollowUpDoor } from '@/lib/po-receive';"
    );
    expect(tabSrc).toContain('const maker = receiveMaker(purchaseOrder?.supplier);');
    expect(tabSrc).toContain('toast.success(receiveSuccessVoice(maker));');
  });

  it('the header chip: the sky census family, the Truck icon, the via voice, testid receive-supplier-chip', () => {
    expect(tabSrc).toContain('data-testid="receive-supplier-chip"');
    expect(tabSrc).toContain('via {maker.name}');
    expect(tabSrc).toContain('text-[11px] text-sky-700 dark:text-sky-400');
    expect(tabSrc).toContain('<Truck className="h-3 w-3" aria-hidden="true" />');
  });

  it('the chip renders CONDITIONALLY \u2014 a wire without the maker stays silent, never a fake via', () => {
    expect(tabSrc).toContain('{maker && (');
  });

  it('the call door: the tel: href gated on the maker\u2019s own phone, the Phone icon, the day\u2019s contact in the title', () => {
    expect(tabSrc).toContain('data-testid="receive-supplier-call"');
    expect(tabSrc).toContain('href={`tel:${maker.phone}`}');
    expect(tabSrc).toContain('<Phone className="h-3 w-3" aria-hidden="true" />');
    expect(tabSrc).toContain("{maker.phone && (");
    expect(tabSrc).toContain("maker.contactPerson\n                      ? `Call ${maker.contactPerson} \u2014 ${maker.phone} \u2014 the day's shortfall has its number`");
  });

  it('THE DOM\u2019S LAW \u2014 the detail\u2019s description is phrasing content now; the div-in-p byte is retired', () => {
    expect(tabSrc).toContain('<span className="flex items-center gap-2 mt-1">');
    expect(tabSrc).not.toContain('<div className="flex items-center gap-2 mt-1">');
  });

  it('the wire\u2019s maker face \u2014 the supplier type carries the contact additively', () => {
    expect(apiSrc).toContain(
      'supplier?: { id: string; name: string; phone?: string | null; email?: string | null; contactPerson?: string | null };'
    );
    expect(apiSrc).toContain("THE RECEIVE'S MAKER: the detail wire carries the supplier");
  });
});
