// Zustand state stores

import { create } from 'zustand';
import { persist, createJSONStorage } from 'zustand/middleware';
import type { AuthUser, CartItem } from './types';
import type { CurrencyCode } from './money';
import { authApi } from './api';
// v2.6.0 CART PERSISTENCE: IndexedDB-backed storage adapter so the cart
// survives logout, idle timeout, refresh and browser restart.
import { idbCartStorage } from './cart-persist';
// FINANCIAL MATH AUDIT: cart money math is Decimal-based (never float) and
// uses the SAME line formula as the server (financialMath.calculateLineItem,
// VAT-INCLUSIVE retail pricing) so what the cashier sees is exactly what
// POST /api/transactions persists. financialMath is isomorphic (no node
// imports) - safe in the client bundle.
import { calculateLineItem, toDec, round2, max0 } from '@/lib/utils/financialMath';
import Decimal from 'decimal.js';
const Decimal0 = new Decimal(0);

interface AuthState {
  user: AuthUser | null;
  token: string | null;
  isAuthenticated: boolean;
  isLoading: boolean;
  login: (email: string, password: string) => Promise<void>;
  logout: () => Promise<void>;
  fetchUser: () => Promise<void>;
  setUser: (user: AuthUser | null) => void;
  /** Hydrate auth state from localStorage (called once on client mount). */
  hydrateFromStorage: () => void;
}

/**
 * SECURITY (QA 2026-09, v2.4.1): keep `currentStoreId` aligned with the
 * authenticated user's OWN store for everyone except SUPER_ADMIN.
 *
 * `currentStoreId` is persisted in localStorage (`mbt_app_store`) and defaults
 * to `store_juja_main` - previously a non-admin user (who cannot switch
 * branches) silently kept whatever store id the last browser session had.
 * Every tab then queried `/api/...?storeId=<that store>` so a Nakuru cashier
 * could end up reading ANOTHER branch's customers, debts and transactions.
 *
 * SUPER_ADMIN is exempt: they legitimately switch branches and the sidebar
 * persists their choice. Users without a store assignment (org-level roles)
 * keep the persisted value - the server treats them as unscoped.
 */
function syncStoreScopeToUser(user: AuthUser | null | undefined): void {
  try {
    if (!user || user.role === 'SUPER_ADMIN' || !user.storeId) return;
    const app = useAppStore.getState();
    if (app.currentStoreId !== user.storeId) {
      app.setCurrentStoreId(user.storeId);
    }
  } catch {
    // Never block authentication flow on UI state syncing.
  }
}

export const useAuthStore = create<AuthState>((set) => ({
  // Initialize with server-safe defaults (null/false) to avoid hydration
  // mismatch. The store is hydrated from localStorage in the first
  // client-side useEffect (see page.tsx useHasMounted pattern).
  // Previously, reading localStorage at module level caused SSR/client
  // state divergence and React hydration warnings.
  user: null,
  token: null,
  isAuthenticated: false,
  isLoading: false,

  login: async (email: string, password: string) => {
    set({ isLoading: true });
    try {
      const res = await authApi.login(email, password);
      if (res.data) {
        set({
          user: res.data.user,
          token: res.data.token,
          isAuthenticated: true,
          isLoading: false,
        });
        syncStoreScopeToUser(res.data.user);
      } else {
        throw new Error(res.error || 'Login failed');
      }
    } catch (error) {
      set({ isLoading: false });
      throw error;
    }
  },

  logout: async () => {
    try {
      await authApi.logout();
    } finally {
      set({ user: null, token: null, isAuthenticated: false });
    }
  },

  fetchUser: async () => {
    try {
      const res = await authApi.getMe();
      if (res.data) {
        set({ user: res.data, isAuthenticated: true });
        localStorage.setItem('mbt_user', JSON.stringify(res.data));
        syncStoreScopeToUser(res.data);
      }
    } catch {
      set({ user: null, token: null, isAuthenticated: false });
      localStorage.removeItem('mbt_token');
      localStorage.removeItem('mbt_user');
    }
  },

  setUser: (user) => {
    set({ user, isAuthenticated: !!user });
    syncStoreScopeToUser(user);
  },

  hydrateFromStorage: () => {
    try {
      const token = localStorage.getItem('mbt_token');
      const storedUser = localStorage.getItem('mbt_user');
      let user: AuthUser | null = null;
      if (token) {
        user = storedUser ? JSON.parse(storedUser) : null;
        set({
          token,
          user,
          isAuthenticated: true,
        });
        // v2.412.0 THE TOKEN ASKS WHO IT IS: a token without its user blob
        // is a valid session the boot cannot name — until now it stayed
        // user:null forever and every role-gated surface silently rendered
        // read-only (the Exchange Rates card's Actions column was the
        // live-proven victim). The cookie path already backfills through
        // fetchUser; the token path now runs the SAME self-contained ask —
        // on success the role arrives and the surfaces wake; on a 401
        // fetchUser clears everything (no zombie session).
        if (!user) void useAuthStore.getState().fetchUser();
      } else {
        // v2.16.0 WORKSPACE COOKIE ADOPTION: on a branch subdomain origin the
        // shared session cookie (Domain=.mbumah.test) may exist even though
        // this origin has no localStorage token yet. Adopt it and validate via
        // /api/auth/me (fetchUser clears everything on a 401).
        const cookieToken = document.cookie.match(/(?:^|;\s*)mbt_token=([^;]+)/)?.[1];
        if (cookieToken) {
          localStorage.setItem('mbt_token', decodeURIComponent(cookieToken));
          // fetchUser is async and self-contained: on success it flips
          // isAuthenticated; on failure it clears the adopted token.
          void useAuthStore.getState().fetchUser();
        }
      }
      // SECURITY: re-align the persisted branch choice with the user's own
      // store on every boot (see syncStoreScopeToUser docstring).
      syncStoreScopeToUser(user);
    } catch {
      // Corrupted localStorage - clear and start fresh
      localStorage.removeItem('mbt_token');
      localStorage.removeItem('mbt_user');
    }
  },
}));

// R10 FIX (v2.5.1 - login flash/reload loop): the API layer dispatches
// `mbt:session-expired` instead of calling window.location.reload() when a
// request comes back 401 (see api.ts handleSessionExpired). React by flipping
// the SPA to the LoginScreen in place - no reload, no flash loop, UI state
// simply resets alongside the session.
//
// v2.6.0 (CART SURVIVAL): the handler NO LONGER calls clearCart(). The cart
// now persists in IndexedDB (see useCartStore below) and MUST survive logout,
// 401s and idle timeouts - a cashier whose session expired mid-sale logs back
// in and finds the sale exactly as they left it. page.tsx shows the
// "Previous cart restored (N items)" toast after re-login.
if (typeof window !== 'undefined') {
  window.addEventListener('mbt:session-expired', () => {
    try {
      const s = useAuthStore.getState();
      if (s.isAuthenticated || s.token) {
        useAuthStore.setState({ user: null, token: null, isAuthenticated: false });
      }
    } catch {
      // Never crash the page from a session-event handler.
    }
  });

  // v2.44.0: FIRST SIGN-IN PASSWORD ROTATION — mid-session flag flips.
  // Fired by api.ts when any guarded endpoint answers 403
  // PASSWORD_CHANGE_REQUIRED (admin hit "Force password reset" on this
  // signed-in user). Flip the cached user's flag so the SPA gates
  // (page.tsx / workspace-gateway) render the forced rotation screen.
  window.addEventListener('mbt:password-change-required', () => {
    try {
      const s = useAuthStore.getState();
      if (s.user && !s.user.mustChangePassword) {
        useAuthStore.setState({
          user: { ...s.user, mustChangePassword: true },
        });
      }
    } catch {
      // Never crash the page from a session-event handler.
    }
  });
}

interface CartState {
  items: CartItem[];
  discount: number;
  setDiscount: (amount: number) => void;
  addItem: (item: Omit<CartItem, 'lineTotal'>) => void;
  removeItem: (productId: string) => void;
  updateQuantity: (productId: string, quantity: number) => void;
  applyDiscount: (productId: string, discountPercent: number) => void;
  clearCart: () => void;
  getSubtotal: () => number;
  getTax: () => number;
  getTotal: () => number;
  getItemCount: () => number;
}

/**
 * FINANCIAL MATH AUDIT: identical formula to the server-side
 * calculateLineTotal - HALF_UP 2dp, VAT-INCLUSIVE retail pricing.
 * `lineTotal` is the VAT-INCLUSIVE gross the customer pays for the line
 * (pricePerUnit is the shelf price; the VAT component lives inside it).
 */
function calculateLineTotal(item: Omit<CartItem, 'lineTotal'>): number {
  return calculateLineItem(item.quantity, item.pricePerUnit, item.discountPercent, true, item.taxRate).lineGrossTotal;
}

/**
 * The VAT component of a cart line - extracted FROM the VAT-inclusive
 * lineTotal (net = gross / (1 + rate)); 0 for exempt lines. Decimal-exact.
 */
function lineVatComponent(item: CartItem): number {
  const rate = Math.min(100, Math.max(0, item.taxRate || 0));
  if (rate === 0) return 0;
  const gross = toDec(item.lineTotal);
  const net = gross.div(1 + rate / 100).toDecimalPlaces(2, Decimal.ROUND_HALF_UP);
  return round2(gross.minus(net));
}

/** The slice of CartState that is persisted to IndexedDB (mbt_cart_v1, v1). */
export interface CartPersistSlice {
  items: CartItem[];
  discount: number;
}

export const useCartStore = create<CartState>()(
  persist(
    (set, get) => ({
      items: [],
      discount: 0,

  setDiscount: (amount) => {
    // Cart-level flat discount (Ksh). Clamped to >= 0 and capped at the
    // pre-discount GROSS total (VAT is inside the line totals now) so it
    // can never make the total negative.
    const maxDiscount = get().getSubtotal();
    const safe = Math.max(0, Math.min(amount, maxDiscount));
    set({ discount: Number.isFinite(safe) ? safe : 0 });
  },

  addItem: (item) => {
    const { items } = get();
    const existingIndex = items.findIndex((i) => i.productId === item.productId);

    if (existingIndex >= 0) {
      const updated = [...items];
      const existing = updated[existingIndex];
      const newQuantity = existing.quantity + item.quantity;
      const lineTotal = calculateLineTotal({ ...existing, quantity: newQuantity });
      updated[existingIndex] = { ...existing, quantity: newQuantity, lineTotal };
      set({ items: updated });
    } else {
      const lineTotal = calculateLineTotal(item);
      set({ items: [...items, { ...item, lineTotal }] });
    }
  },

  removeItem: (productId) => {
    set({ items: get().items.filter((i) => i.productId !== productId) });
  },

  updateQuantity: (productId, quantity) => {
    if (quantity <= 0) {
      get().removeItem(productId);
      return;
    }
    const { items } = get();
    const updated = items.map((item) => {
      if (item.productId === productId) {
        const lineTotal = calculateLineTotal({ ...item, quantity });
        return { ...item, quantity, lineTotal };
      }
      return item;
    });
    set({ items: updated });
  },

  applyDiscount: (productId, discountPercent) => {
    const { items } = get();
    const updated = items.map((item) => {
      if (item.productId === productId) {
        const lineTotal = calculateLineTotal({ ...item, discountPercent });
        return { ...item, discountPercent, lineTotal };
      }
      return item;
    });
    set({ items: updated });
  },

  clearCart: () => set({ items: [], discount: 0 }),

  getSubtotal: () => {
    // Σ lineTotal - each line is exact at 2dp and the sum runs in Decimal,
    // so this is the exact VAT-inclusive merchandise value.
    return round2(get().items.reduce((sum, item) => sum.plus(toDec(item.lineTotal)), Decimal0));
  },

  getTax: () => {
    // Σ per-line VAT components EXTRACTED from the VAT-inclusive line
    // totals (never `lineTotal × rate%` on top - that would double-count
    // VAT under inclusive pricing). v2.13.1: the POS UI no longer uses
    // this for the "VAT (incl.)" info line - that figure is now the VAT
    // inside the POST-DISCOUNT total (spec formula Total × rate/(100+rate),
    // see pos-tab.tsx). Kept as the per-line component for any consumer
    // that needs the pre-discount extraction.
    return round2(get().items.reduce((sum, item) => sum.plus(toDec(lineVatComponent(item))), Decimal0));
  },

  getTotal: () => {
    // Cart-level flat discount is subtracted from the gross (VAT-inclusive)
    // subtotal. Never returns negative - discount is clamped in setDiscount,
    // but we guard here too for safety (ISO 9001 financial integrity).
    return round2(max0(toDec(get().getSubtotal()).minus(toDec(get().discount))));
  },

  getItemCount: () => {
    return get().items.reduce((sum, item) => sum + item.quantity, 0);
  },
    }),
    {
      // v2.6.0 CART PERSISTENCE - durable IndexedDB (NOT localStorage):
      //   • survives logout / idle timeout / refresh / browser restart;
      //   • `skipHydration: true` keeps SSR safe - page.tsx manually calls
      //     useCartStore.persist.rehydrate() on first client mount (same
      //     pattern as useAppStore) and toasts "Previous cart restored".
      name: 'mbt_cart_v1',
      version: 1,
      storage: createJSONStorage(() => idbCartStorage),
      // Persist ONLY cart data - actions (addItem etc.) are never serialized.
      partialize: (state): CartPersistSlice => ({
        items: state.items,
        discount: state.discount,
      }),
      // v1 is the first version: any foreign/legacy shape resets to an empty
      // cart instead of crashing the POS.
      migrate: (): CartPersistSlice => ({ items: [], discount: 0 }),
    },
  ),
);

export type AppTab = 'dashboard' | 'pos' | 'catalog' | 'inventory' | 'customers' | 'rentals' | 'financial' | 'reports' | 'transactions' | 'suppliers' | 'gift-cards' | 'admin' | 'vouchers' | 'invoices' | 'delivery' | 'credits' | 'messaging' | 'transfers' | 'banking' | 'loyalty' | 'security' | 'payroll' | 'people-payroll' | 'etims' | 'tax' | 'debt-management' | 'debt-plans' | 'conversations' | 'purchase-orders' | 'analytics' | 'data-exports' | 'shift-scheduling' | 'system-health';

export type SidebarState = 'expanded' | 'collapsed' | 'mobile-overlay';

/**
 * The org desk's Desk-Activity drill-down lens (v2.409.0 — the desk
 * remembers). Structural twin of the panel's `DeskActivityFilter`
 * (components/org/primitives): the store layer never imports from the
 * component layer, and TypeScript's structural typing keeps the two shapes
 * honestly assignment-compatible (one contract, two addresses).
 */
export interface ConsoleDeskFilter {
  /** The reviewer's display name as the ledger rows render it, or null. */
  reviewer: string | null;
  /** The store id the ledger is narrowed to, or null. */
  branch: string | null;
}

interface AppState {
  activeTab: AppTab;
  setActiveTab: (tab: AppTab) => void;
  sidebarOpen: boolean;
  toggleSidebar: () => void;
  setSidebarOpen: (open: boolean) => void;
  /** Desktop sidebar collapsed state - true = icon-only (w-16), false = full (w-64) */
  isSidebarCollapsed: boolean;
  toggleSidebarCollapse: () => void;
  setSidebarCollapsed: (collapsed: boolean) => void;
  currentStoreId: string;
  setCurrentStoreId: (id: string) => void;
  /**
   * THE DISPLAY CURRENCY SLICE (v2.212.0): the field the switcher was born
   * missing. useCurrency() has selected `s.activeCurrency` / `s.setActiveCurrency`
   * since the multi-currency feature landed (0cde857), but the store never
   * carried them — every selection click threw `TypeError: ... is not a
   * function` (swallowed by the global handler) and the POS stayed silently
   * KES-locked. Display-only: the canonical accounting currency remains KES.
   *
   * v2.408.0: `currencyChosen` rides beside the code — the seed law needs
   * the two states the bare code can't tell apart ("the user picked USD"
   * vs "never picked, KES is just the factory default"). Only an explicit
   * `setActiveCurrency` (the switcher's ONE write path) plants the flag;
   * the branch-default seed writes the code WITHOUT it, so a fresh session
   * re-seeds honestly until a human hand actually chooses.
   */
  activeCurrency: CurrencyCode;
  /** True only after an explicit in-app switch (never after a branch seed). */
  currencyChosen: boolean;
  setActiveCurrency: (currency: CurrencyCode) => void;
  /**
   * THE GREETING'S PROVENANCE (v2.409.0, transient): true only while the
   * CURRENT display currency arrived through the branch-default seed and
   * the visitor has not yet chosen. Never persisted (absent from
   * partialize — a fresh load re-seeds and re-stamps, so the dot can never
   * outlive the greeting it speaks for), never set by the switcher's write
   * path (a human hand ends the greeting by planting `currencyChosen`).
   * The trigger's greeting dot reads this — exact provenance, not a guess
   * from the bare flag.
   */
  seededFromBranch: boolean;
  /**
   * THE AUDIT DESK'S LENS (v2.409.0 — the desk remembers): the org desk's
   * Desk-Activity drill-down (reviewer/branch pair) persists across visits —
   * an auditor who narrows the ledger to their reviewer and returns next
   * week re-lands on the same narrowed view instead of the unfiltered org
   * wall. `null` pair = the unfiltered org view (the factory default).
   * Serialized as-is into mbt_app_store (plain strings/nulls — no
   * migration needed; older persisted blobs answer undefined → the panel
   * treats absence exactly like the factory lens).
   */
  consoleDeskFilter: ConsoleDeskFilter;
  setConsoleDeskFilter: (filter: ConsoleDeskFilter) => void;
  /**
   * Derive the visual sidebar state from the store + viewport.
   * Returns 'expanded' | 'collapsed' | 'mobile-overlay'.
   */
  getSidebarState: (isDesktop: boolean) => SidebarState;
}

export const useAppStore = create<AppState>()(
  persist(
    (set, get) => ({
      activeTab: 'dashboard',
      setActiveTab: (tab) => set({ activeTab: tab }),
      sidebarOpen: false,
      toggleSidebar: () => set((state) => ({ sidebarOpen: !state.sidebarOpen })),
      setSidebarOpen: (open) => set({ sidebarOpen: open }),
      isSidebarCollapsed: false,
      toggleSidebarCollapse: () => set((state) => ({ isSidebarCollapsed: !state.isSidebarCollapsed })),
      setSidebarCollapsed: (collapsed) => set({ isSidebarCollapsed: collapsed }),
      currentStoreId: 'store_juja_main',
      setCurrentStoreId: (id) => set({ currentStoreId: id }),
      // v2.212.0: the display-currency slice — 'KES' is the honest default
      // (the canonical accounting currency) and the setter is the ONE write
      // path the switcher's onSelect has always called.
      // v2.408.0: the setter is ALSO the only thing that plants
      // `currencyChosen` — the branch-default seed (currency-seed.ts) writes
      // the code through useAppStore.setState directly, so a re-seed stays
      // possible until a human hand actually chooses.
      activeCurrency: 'KES',
      currencyChosen: false,
      setActiveCurrency: (currency) => set({ activeCurrency: currency, currencyChosen: true }),
      // v2.409.0: the greeting's provenance — transient, never persisted.
      seededFromBranch: false,
      // v2.409.0: the audit desk's lens — null pair is the honest org view.
      consoleDeskFilter: { reviewer: null, branch: null },
      setConsoleDeskFilter: (filter) =>
        set({
          consoleDeskFilter: {
            reviewer: filter.reviewer ?? null,
            branch: filter.branch ?? null,
          },
        }),
      getSidebarState: (isDesktop: boolean): SidebarState => {
        const state = get();
        if (!isDesktop) {
          return state.sidebarOpen ? 'mobile-overlay' : 'collapsed';
        }
        return state.isSidebarCollapsed ? 'collapsed' : 'expanded';
      },
    }),
    {
      name: 'mbt_app_store',
      // skipHydration prevents auto-rehydration on the server (SSR safety).
      // We manually call useAppStore.persist.rehydrate() in a client-only
      // useEffect in page.tsx - see the hydrateFromStorage effect.
      skipHydration: true,
      // Only persist these fields - exclude transient state like sidebarOpen
      // (mobile overlay should never persist across sessions).
      partialize: (state) => ({
        activeTab: state.activeTab,
        isSidebarCollapsed: state.isSidebarCollapsed,
        currentStoreId: state.currentStoreId,
        // v2.212.0: the display-currency choice persists with the rest of
        // the app preferences (mbt_app_store). Browsers whose persisted
        // state predates the slice keep the 'KES' default via the shallow
        // persist merge — no migration needed.
        // v2.408.0: `currencyChosen` rides too — browsers whose persisted
        // state predates the flag answer false (honest: they may be seeded
        // once, and their first explicit switch plants the flag).
        activeCurrency: state.activeCurrency,
        currencyChosen: state.currencyChosen,
        // v2.409.0: the audit desk's lens rides with the rest of the app
        // preferences — an older blob answers undefined and the desk boots
        // on the factory lens (honest absence, no migration).
        consoleDeskFilter: state.consoleDeskFilter,
      }),
    },
  ),
);
