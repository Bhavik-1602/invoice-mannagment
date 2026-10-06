# Architecture

## Frontend
Next.js 14+ (App Router) + TypeScript

## Styling
Tailwind CSS

## Backend / Database
Supabase (PostgreSQL)

## Authentication
Supabase Auth (Email/Password)

## PDF Generation
jsPDF + jsPDF-AutoTable (client-side)

## Deployment Target
Vercel

## Architecture Flow
```
User → Next.js UI → Supabase Client → PostgreSQL
```

## Folder Structure
```
src/
├── app/                    # Next.js App Router pages
│   ├── (auth)/             # Auth pages (login)
│   ├── (dashboard)/        # Protected pages
│   │   ├── dashboard/
│   │   ├── invoices/
│   │   ├── customers/
│   │   ├── products/
│   │   └── settings/
│   ├── layout.tsx
│   └── page.tsx
├── components/             # Reusable UI components
│   ├── ui/                 # Base UI elements
│   ├── layout/             # Layout components (sidebar, header)
│   ├── invoices/           # Invoice-specific components
│   ├── customers/          # Customer-specific components
│   └── products/           # Product-specific components
├── lib/                    # Utilities and configurations
│   ├── supabase/           # Supabase client setup
│   ├── utils.ts            # Utility functions
│   ├── gst.ts              # GST calculation logic
│   ├── number-to-words.ts  # Number to Indian words
│   └── pdf.ts              # PDF generation
├── types/                  # TypeScript types
│   └── index.ts
└── hooks/                  # Custom React hooks
```

## Database Tables
- profiles
- customers
- products
- invoices
- invoice_items
- company_settings
- terms_conditions

## Security
- Supabase RLS on all tables
- Only authenticated users can access data
- No service role key in frontend
- Environment variables for all secrets
