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
A Next.js app with a webhook capture proxy that records incoming webhooks to a database, then provides a web interface to browse captured webhooks and replay them to any endpoint. Uses a unique subdomain per user as the webhook URL that forwards to the capture service.

PLANNED FILES:
- app/page.tsx
- app/dashboard/page.tsx
- app/dashboard/webhooks/page.tsx
- app/dashboard/webhooks/[id]/page.tsx
- app/api/capture/[userId]/route.ts
- app/api/replay/route.ts
- app/api/auth/[...nextauth]/route.ts
- app/api/checkout/route.ts
- lib/db.ts
- lib/auth.ts
- lib/webhook-capture.ts
- lib/webhook-replay.ts
- components/webhook-list.tsx
- components/webhook-details.tsx
- components/replay-form.tsx
- components/pricing.tsx

DEPENDENCIES: next, react, typescript, tailwindcss, prisma, @prisma/client, next-auth, @next-auth/prisma-adapter, axios, date-fns, @headlessui/react, lucide-react, zod, lemonsqueezy.js

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