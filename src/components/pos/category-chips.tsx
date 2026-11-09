'use client';

import React, { useState, useEffect, useCallback, useRef, useMemo } from 'react';
import { getCategoryImage, safeMap } from '@/lib/app-config';
import {
  ChevronLeft, ChevronRight, Package, Wrench, HardHat, Zap, Paintbrush, Hammer,
  Boxes, Layers, Trees, Layers3, Tag, ShoppingBasket,
} from 'lucide-react';
// v2.479.0 THE HEAD LEAVES HOME (the sixth weave's tribe face): the
// scroll row's two head hand-copies retire — the pill head rides the
// CHIP_HEAD import beside the ring and the idle face (one home, many
// hands; the wardrobe in exactly ONE src file).
import { CHIP_HEAD, CHIP_IDLE, CHIP_RING_ZINC } from '@/components/filter-chip';
import type { CategoryItem } from '@/lib/api';

// v2.460.0 THE DATA-COLORED TRIBE LEARNS THE FAMILY'S GRAMMAR (the sixth
// weave's first face): the POS category chips' active face is a PER-ROW
// data color (the category's own) — never a named tint, so the tribe
// cannot ride <FilterChip> — but the family's grammar is not the tint's
// property alone. Through this weave every chip speaks aria-pressed,
// wears the family's zinc keyboard ring (CHIP_RING_ZINC, imported — one
// home, many hands), and its idle face rides CHIP_IDLE byte-exact (it
// always was the registry's byte — now it is the registry's CONSTANT).
// THE MASQUERADE RETIRES: the `.chip-active` CSS class — the masquerade
// law's one named rider, a plain-CSS dialect invisible to the byte
// walks — inlines its own face (scale-105 + the 0 4px 12px oklch wash)
// and the block leaves globals.css. The scroll arrows wear honest
// glyphs (ChevronLeft / ChevronRight) instead of a rotated ChevronDown.

/**
 * Map category names (lowercased substring match) to Lucide icons.
 * Falls back to Package when no match is found.
 */
function getCategoryIcon(name: string): React.ElementType {
  const lower = (name || '').toLowerCase();
  if (lower.includes('cement') || lower.includes('concrete')) return Boxes;
  if (lower.includes('tool') || lower.includes('equipment')) return Wrench;
  if (lower.includes('plumb')) return HardHat;
  if (lower.includes('electr') || lower.includes('wire')) return Zap;
  if (lower.includes('paint')) return Paintbrush;
  if (lower.includes('nail') || lower.includes('screw') || lower.includes('fasten')) return Hammer;
  if (lower.includes('iron') || lower.includes('steel') || lower.includes('rebar') || lower.includes('mesh')) return Layers3;
  if (lower.includes('wood') || lower.includes('timber') || lower.includes('lumber')) return Trees;
  if (lower.includes('tile') || lower.includes('floor')) return Layers;
  if (lower.includes('wheelbarrow') || lower.includes('barrow')) return ShoppingBasket;
  if (lower.includes('bundle') || lower.includes('set')) return Layers;
  return Package;
}

export interface CategoryChipsProps {
  categories: CategoryItem[];
  selected: string;
  onSelect: (id: string) => void;
  /** Optional per-category product count for badge display: { [categoryId]: number } */
  productCounts?: Record<string, number>;
  /** Total product count (for the "All" chip badge) */
  totalCount?: number;
}

export function CategoryChips({
  categories,
  selected,
  onSelect,
  productCounts,
  totalCount,
}: CategoryChipsProps) {
  const scrollRef = useRef<HTMLDivElement>(null);
  const [canScrollLeft, setCanScrollLeft] = useState(false);
  const [canScrollRight, setCanScrollRight] = useState(false);

  const checkScroll = useCallback(() => {
    const el = scrollRef.current;
    if (!el) return;
    setCanScrollLeft(el.scrollLeft > 0);
    setCanScrollRight(el.scrollLeft + el.clientWidth < el.scrollWidth - 2);
  }, []);

  useEffect(() => {
    checkScroll();
    const el = scrollRef.current;
    if (el) {
      el.addEventListener('scroll', checkScroll);
      window.addEventListener('resize', checkScroll);
    }
    return () => {
      if (el) el.removeEventListener('scroll', checkScroll);
      window.removeEventListener('resize', checkScroll);
    };
  }, [checkScroll, categories]);

  const scrollBy = (direction: 'left' | 'right') => {
    const el = scrollRef.current;
    if (el) {
      el.scrollBy({ left: direction === 'left' ? -150 : 150, behavior: 'smooth' });
    }
  };

  // Compute total count if not provided - sum of all category counts
  const computedTotal = useMemo(() => {
    if (typeof totalCount === 'number') return totalCount;
    if (!productCounts) return 0;
    return Object.values(productCounts).reduce((sum, n) => sum + (n || 0), 0);
  }, [productCounts, totalCount]);

  return (
    <div className="relative flex items-center gap-1">
      {/* Scroll indicators: arrow buttons + fade gradients on edges */}
      <div className={`absolute left-0 top-0 bottom-0 w-6 pointer-events-none z-10 bg-gradient-to-r from-background to-transparent transition-opacity ${canScrollLeft ? 'opacity-100' : 'opacity-0'}`} aria-hidden />
      <div className={`absolute right-0 top-0 bottom-0 w-6 pointer-events-none z-10 bg-gradient-to-l from-background to-transparent transition-opacity ${canScrollRight ? 'opacity-100' : 'opacity-0'}`} aria-hidden />

      {canScrollLeft && (
        <button
          onClick={() => scrollBy('left')}
          className="shrink-0 h-7 w-7 rounded-full border bg-background shadow-sm flex items-center justify-center hover:bg-muted transition-colors z-20 btn-press"
          aria-label="Scroll categories left"
        >
          <ChevronLeft className="h-3 w-3" />
        </button>
      )}

      <div
        ref={scrollRef}
        className="flex gap-2 overflow-x-auto scrollbar-thin py-0.5 flex-1 px-1 scroll-snap-x"
        style={{ overflowX: 'auto', WebkitOverflowScrolling: 'touch' }}
      >
        {/* "All" chip - special styling with gradient background when active */}
        <button
          onClick={() => onSelect('all')}
          aria-pressed={selected === 'all'}
          className={`shrink-0 ${CHIP_HEAD} whitespace-nowrap flex items-center gap-1.5 min-w-fit chip-hover-lift${CHIP_RING_ZINC} ${
            selected === 'all'
              ? 'bg-gradient-to-r from-primary to-primary/80 text-primary-foreground border-transparent scale-105 shadow-[0_4px_12px_oklch(0_0_0_/_0.12)]'
              : CHIP_IDLE
          }`}
        >
          <Tag className="h-3 w-3" />
          All
          {computedTotal > 0 && (
            <span className={`text-[9px] px-1.5 py-0 rounded-full font-bold ${
              selected === 'all' ? 'bg-white/20 text-primary-foreground' : 'bg-muted text-muted-foreground'
            }`}>
              {computedTotal}
            </span>
          )}
        </button>

        {safeMap<CategoryItem, React.ReactNode>(categories, (cat) => {
          const catColor = cat.color || '#6b7280';
          const isActive = selected === cat.id;
          const catImage = getCategoryImage(cat.id);
          const Icon = getCategoryIcon(cat.name);
          const count = productCounts?.[cat.id];
          return (
            <button
              key={cat.id}
              onClick={() => onSelect(cat.id)}
              aria-pressed={isActive}
              className={`shrink-0 ${CHIP_HEAD} whitespace-nowrap flex items-center gap-1.5 min-w-fit chip-hover-lift${CHIP_RING_ZINC} ${
                isActive
                  ? 'text-white border-transparent scale-105 shadow-[0_4px_12px_oklch(0_0_0_/_0.12)]'
                  : CHIP_IDLE
              }`}
              style={isActive ? {
                backgroundColor: catColor,
                borderColor: catColor,
                backgroundImage: `linear-gradient(135deg, ${catColor}, ${catColor}cc)`,
              } : {
                borderLeftColor: catColor,
                borderLeftWidth: '3px',
              }}
            >
              {catImage ? (
                <img src={catImage} alt="" className="h-4 w-4 rounded-full object-cover" />
              ) : (
                <Icon className="h-3 w-3" style={isActive ? {} : { color: catColor }} />
              )}
              {cat.name}
              {typeof count === 'number' && count > 0 && (
                <span className={`text-[9px] px-1.5 py-0 rounded-full font-bold ${
                  isActive ? 'bg-white/20 text-white' : 'bg-muted text-muted-foreground'
                }`}>
                  {count}
                </span>
              )}
            </button>
          );
        })}
      </div>

      {canScrollRight && (
        <button
          onClick={() => scrollBy('right')}
          className="shrink-0 h-7 w-7 rounded-full border bg-background shadow-sm flex items-center justify-center hover:bg-muted transition-colors z-20 btn-press"
          aria-label="Scroll categories right"
        >
          <ChevronRight className="h-3 w-3" />
        </button>
      )}
    </div>
  );
}
