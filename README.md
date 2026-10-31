# MBUMAH HARDWARE POS & ERP

*Multi-tenant hardware-store POS and ERP — inventory, sales and reporting for Kenyan hardware retail; TypeScript.*

![category](https://img.shields.io/badge/category-erp-pos-F59E0B?style=flat-square) ![language](https://img.shields.io/badge/language-TypeScript-2563EB?style=flat-square) ![license](https://img.shields.io/badge/license-MIT-16A34A?style=flat-square) ![maintenance](https://img.shields.io/badge/maintenance-active-16A34A?style=flat-square) ![repo](https://img.shields.io/badge/repo-mbumah--hardware--pos-111827?style=flat-square)

---

Point-of-sale and business management system for Kenyan hardware stores. Multi-branch operations, M-Pesa payments through the Daraja API (STK Push), contractor debt management, equipment rentals, double-entry accounting, gift cards, supplier purchase orders, shift reconciliation, and eTIMS-ready invoice structures.

Built with Next.js 16 (App Router), TypeScript, Prisma ORM, PostgreSQL (Neon in production, SQLite for local development), Tailwind CSS 4, shadcn/ui, Zustand, and TanStack Query.

| Badge | Status |
|---|---|
| CI | GitHub Actions workflow `ci-cd.yml` on every push and pull request |
| Runtime | Node.js 20+ / Bun 1.1+ |
| License | See [LICENSE](LICENSE) |

## Core modules

| Module | Description |
|---|---|
| Multi-branch POS | Five stores: Juja Main, Thika, Ruiru, Nairobi CBD, Nakuru, each with isolated stock and reporting |
| Sales and checkout | Fast POS flow with barcode scanning, held carts, split payments, and M-Pesa STK Push |
| Inventory | Categories, bundles, units of measure with conversion, stock movements, low-stock alerts |
| Role-based access control | Five roles with a permission matrix enforced in the API and the UI |
| Customer CRM and debt | Credit limits, aging buckets, debt payment plans, loyalty points, statements |
| Equipment rentals | Rent-out tracking, return processing, overdue alerts |
| Financials | Double-entry journal, chart of accounts, trial balance, expense approvals |
| Shift management | Shift open and close with expected-cash reconciliation |
| Suppliers | Supplier profiles, purchase orders, fulfillment tracking |
| Reporting | Sales, inventory, and financial reports with CSV and PDF export |
| Tax compliance | eTIMS-ready invoice structures and KRA tax-type summaries |

## Multi-branch workspaces

Since v2.16.0 every branch can be reached as its own workspace website - `juja-main.mbumah.co.ke` in production, `/stores/juja-main/dashboard` everywhere else - while the whole organization runs on one shared database. The root domain serves the organization console with org-wide KPIs, the branch selector serves multi-branch warehouse managers, a shared session cookie gives single sign-on across subdomains, and a global chat channel connects all branches. Host-header allowlisting, reserved subdomains and audit-logged authorization checks keep the workspaces isolated.

- Feature reference: [docs/subdomain-workspaces.md](docs/subdomain-workspaces.md)
- Branch workspace guide (safe link builder, path fallback on localhost/raw IPs, hosting setup): [docs/branch-workspaces.md](docs/branch-workspaces.md)
- Running it without internet (hosts file, dnsmasq, local HTTPS, mock M-Pesa): [docs/local-offline-setup.md](docs/local-offline-setup.md)

## Quick start

Prerequisites: Node.js 20 or newer. Bun 1.1+ is supported but NOT required —
every setup path works on a plain npm install (the seed runner is
runner-agnostic since v2.307.0).

```bash
# Clone the repository
git clone https://github.com/collins-muchiri/mbumah-hardware-pos.git
cd mbumah-hardware-pos

# Install dependencies (npm or bun — both fully supported)
npm install

# Create the environment file from the template
cp .env.example .env
# Edit .env: for zero-dependency local development set
#   DATABASE_URL=file:./pos.db
#   DIRECT_URL=file:./pos.db
# and generate real secrets:
#   NEXTAUTH_SECRET=$(openssl rand -base64 32)
#   JWT_SECRET=$(openssl rand -base64 32)
# (see docs/configuration.md for every variable)

# Validate the environment BEFORE booting: scheme, provider consistency
# (schema ↔ generated client ↔ DATABASE_URL), secrets, seed policy
npm run env:doctor

# Generate the Prisma client and create the schema
npm run db:generate
npm run db:push

# Seed demo data (stores, catalog, users)
npm run db:seed

# Start the development server
npm run dev
```

Open http://localhost:3000 and sign in with a demo account.

> **Provider consistency (the #1 historical footgun):** the schema provider is
> auto-detected from the DATABASE_URL scheme by every repo script. If you ever
> see `the URL must start with the protocol 'postgresql://'` (or the `file:`
> equivalent) on login, your generated client and your database disagree —
> run `npm run env:doctor` (it pinpoints the drift) then `npm run db:generate`.
> See docs/TROUBLESHOOTING.md.

### Demo accounts (local development only)

The seed script creates the following accounts. They are for local development and demo environments only; never reuse these credentials in production.

**Credential policy (v2.307.0):** `password123` is the seeded default ONLY in
`NODE_ENV=development` / `NODE_ENV=test`. In any other environment the seed
refuses to create a demo-password admin: set `SEED_ADMIN_PASSWORD` to choose
the password, or leave it unset and the seed generates a strong random
one-time password and prints it exactly once in its setup output.
`SEED_ALLOW_DEMO_PASSWORD=1` is the explicit opt-out for demo/staging boxes.
`/api/health` reports a `demo_credentials` warning when a super admin still
runs on the well-known demo password outside development.

| Role | Email | Password |
|---|---|---|
| SUPER_ADMIN | admin@mbumahhardware.co.ke | password123 |
| System service user | system@mbumahhardware.co.ke | random UUID (not sign-in capable) |

Demo staff accounts for other roles (cashier, accountant, inventory manager, branch manager) are created by the demo-data population scripts with the password `password123`. Since v2.18.1 the seed also creates one branch manager per branch (`juja.manager@`, `thika.manager@`, `ruiru.manager@`, `nairobi.manager@`, `nakuru.manager@mbumahhardware.co.ke`); each signs in straight into their own branch workspace. See [Branch manager users](docs/branch-manager-users.md).

## Documentation

Deep-dive documentation lives in the `docs/` directory:

| Document | Contents |
|---|---|
| [Architecture overview](docs/architecture.md) | System design, data flow, offline strategy |
| [API reference](docs/api-reference.md) | REST endpoints, auth, error formats |
| [Database schema](docs/database-schema.md) | Prisma models, relationships, key constraints |
| [Authentication and RBAC](docs/authentication-and-rbac.md) | Roles, permission matrix, manager step-up authorization |
| [Multi-tenant architecture](docs/multi-tenant-architecture.md) | Store isolation, seeding, branch codes |
| [Configuration](docs/configuration.md) | Environment variables, M-Pesa Daraja, optional services |
| [Deployment](docs/deployment.md) | Vercel, Docker, Neon setup, migrations |
| [Troubleshooting and FAQ](docs/troubleshooting-and-faq.md) | Common issues and fixes |
| [Release process](docs/release-process.md) | Versioning, changelog, release automation |
| [Contributing](CONTRIBUTING.md) | Development workflow, commit convention, code style |
| [Security policy](SECURITY.md) | Reporting vulnerabilities, credential handling |

Self-hosting the POS on a Windows laptop or maintaining its automatic updates? Start with [Windows local builds](docs/windows-local-builds.md) and [updater release channels](docs/updater-release-channels.md).

## Support

See [SUPPORT.md](SUPPORT.md) for help channels and how to report a problem. Security issues are handled privately through [SECURITY.md](SECURITY.md).

## License

This project is licensed under the terms found in [LICENSE](LICENSE).
