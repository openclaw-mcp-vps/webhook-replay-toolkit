# Build Task: webhook-replay-toolkit

Build a complete, production-ready Next.js 15 App Router application.

PROJECT: webhook-replay-toolkit
HEADLINE: Capture real Stripe, Shopify, and GitHub webhooks and replay them against localhost
WHAT: A web-based tool that records incoming webhook payloads from production services, stores them with their full headers and body, then replays them on demand against any endpoint (localhost, staging, or prod). Solves the pain of "I can't reproduce that webhook bug because the event already fired."
WHY: Webhooks are async and non-idempotent. When they fail, devs lose hours waiting for the event to fire again or writing throwaway curl commands. This is an evergreen indie-hacker pain.
WHO PAYS: Full-stack developers and solo founders who ship webhook integrations — Stripe, Shopify, GitHub, Slack, Resend, Postmark.
NICHE: developer-tools
PRICE: $$15/mo

ARCHITECTURE SPEC:
A Next.js web app with a webhook capture proxy service that records incoming webhooks to a database, then provides a dashboard to view, filter, and replay them to any endpoint. Uses a unique subdomain per user for webhook capture and stores full request data including headers, body, and metadata.

PLANNED FILES:
- app/page.tsx
- app/dashboard/page.tsx
- app/dashboard/webhooks/page.tsx
- app/dashboard/webhooks/[id]/page.tsx
- app/api/webhooks/capture/[userId]/route.ts
- app/api/webhooks/replay/route.ts
- app/api/auth/[...nextauth]/route.ts
- app/api/lemonsqueezy/webhook/route.ts
- lib/db.ts
- lib/auth.ts
- lib/lemonsqueezy.ts
- components/webhook-list.tsx
- components/webhook-replay-form.tsx
- components/pricing-table.tsx
- prisma/schema.prisma

DEPENDENCIES: next, react, typescript, tailwindcss, prisma, @prisma/client, next-auth, @next-auth/prisma-adapter, postgres, @lemonsqueezy/lemonsqueezy.js, axios, date-fns, lucide-react, @headlessui/react, react-hook-form, zod

REQUIREMENTS:
- Next.js 15 with App Router (app/ directory)
- TypeScript
- Tailwind CSS v4
- shadcn/ui components (npx shadcn@latest init, then add needed components)
- Dark theme ONLY — background #0d1117, no light mode
- Lemon Squeezy checkout overlay for payments
- Landing page that converts: hero, problem, solution, pricing, FAQ
- The actual tool/feature behind a paywall (cookie-based access after purchase)
- Mobile responsive
- SEO meta tags, Open Graph tags
- /api/health endpoint that returns {"status":"ok"}
- NO HEAVY ORMs: Do NOT use Prisma, Drizzle, TypeORM, Sequelize, or Mongoose. If the tool needs persistence, use direct SQL via `pg` (Postgres) or `better-sqlite3` (local), or just filesystem JSON. Reason: these ORMs require schema files and codegen steps that fail on Vercel when misconfigured.
- INTERNAL FILE DISCIPLINE: Every internal import (paths starting with `@/`, `./`, or `../`) MUST refer to a file you actually create in this build. If you write `import { Card } from "@/components/ui/card"`, then `components/ui/card.tsx` MUST exist with a real `export const Card` (or `export default Card`). Before finishing, scan all internal imports and verify every target file exists. Do NOT use shadcn/ui patterns unless you create every component from scratch — easier path: write all UI inline in the page that uses it.
- DEPENDENCY DISCIPLINE: Every package imported in any .ts, .tsx, .js, or .jsx file MUST be
  listed in package.json dependencies (or devDependencies for build-only). Before finishing,
  scan all source files for `import` statements and verify every external package (anything
  not starting with `.` or `@/`) appears in package.json. Common shadcn/ui peers that MUST
  be added if used:
  - lucide-react, clsx, tailwind-merge, class-variance-authority
  - react-hook-form, zod, @hookform/resolvers
  - @radix-ui/* (for any shadcn component)
- After running `npm run build`, if you see "Module not found: Can't resolve 'X'", add 'X'
  to package.json dependencies and re-run npm install + npm run build until it passes.

ENVIRONMENT VARIABLES (create .env.example):
- NEXT_PUBLIC_LEMON_SQUEEZY_STORE_ID
- NEXT_PUBLIC_LEMON_SQUEEZY_PRODUCT_ID
- LEMON_SQUEEZY_WEBHOOK_SECRET

After creating all files:
1. Run: npm install
2. Run: npm run build
3. Fix any build errors
4. Verify the build succeeds with exit code 0

Do NOT use placeholder text. Write real, helpful content for the landing page
and the tool itself. The tool should actually work and provide value.


PREVIOUS ATTEMPT FAILED WITH:
Codex timed out after 600s
Please fix the above errors and regenerate.