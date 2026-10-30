'use client';

// v2.291.0: the HR workspace boots its own session. THE HYDRATION GAP: the
// POS shell hydrates the auth store in (shell)/page.tsx (hydrateFromStorage
// on first client mount) and branch workspaces do it through the gateway —
// but NOTHING on the /hr route did. A direct load of /hr left
// useAuthStore.user = null, so every role-gated read on the HR shell saw an
// empty role: the notification center's Security tab (v2.12.7, gated on
// SUPER_ADMIN/STORE_OWNER/BRANCH_MANAGER) never rendered for the very roles
// that should see it — on a session whose OWN localStorage held the role,
// merely unread. THE FIX is one line of wiring, not a new boot: mount the
// shared useWorkspaceAuthBoot (the same idempotent sequence the root page
// runs — auth from localStorage, cookie adoption → /api/auth/me, app-store
// rehydrate) in the HR layout, so EVERY HR desk inherits a real session and
// the bell's store scope lands with it.
//
// This island renders null — it exists so the server layout can host a
// client-side boot without turning the layout itself into a client
// component (the layout owns `export const metadata`).

import { useWorkspaceAuthBoot } from '@/lib/workspace/workspace-store';

export function HrAuthBoot() {
  useWorkspaceAuthBoot();
  return null;
}
