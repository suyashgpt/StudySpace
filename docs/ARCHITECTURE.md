# StudySpace Architecture & Technical Design

**Title:** Design and Development of a Web-Based Study Library Management and Operations System (StudySpace)  
**Academic Target:** MCA Degree Evaluation — Lovely Professional University (LPU)

---

## 1. System Architecture Overview

StudySpace employs a modern, secure, serverless three-tier web application architecture designed for high availability, zero database drift, and minimal infrastructure overhead.

```
┌────────────────────────────────────────────────────────┐
│                   Administrator Client                 │
│              (Laptop / Tablet / Mobile Web)            │
└───────────────────────────┬────────────────────────────┘
                            │ HTTPS (TLS 1.3)
                            ▼
┌────────────────────────────────────────────────────────┐
│                   Vercel Edge Network                  │
│       React 19 + TypeScript + Vite SPA Bundle          │
│       - React Router DOM (Navigation Guards)           │
│       - Tailwind CSS Design System                     │
│       - Lucide Icons & Recharts Analytics              │
└───────────────────────────┬────────────────────────────┘
                            │ REST / WebSocket / PostgREST
                            ▼
┌────────────────────────────────────────────────────────┐
│                 Supabase Backend-as-a-Service          │
│  ┌──────────────────────┐    ┌──────────────────────┐  │
│  │    Supabase Auth     │    │   PostgREST API      │  │
│  │ (JWT Tokens & Admin) │    │  (Auto OpenAPI/REST) │  │
│  └──────────┬───────────┘    └──────────┬───────────┘  │
│             │                           │              │
│             ▼                           ▼              │
│  ┌──────────────────────────────────────────────────┐  │
│  │        PostgreSQL 15 Relational Database         │  │
│  │   - Row Level Security (RLS) Policy Gates        │  │
│  │   - Unique & Check Constraints                   │  │
│  │   - B-Tree Performance Indexes                   │  │
│  └──────────────────────────────────────────────────┘  │
└────────────────────────────────────────────────────────┘
```

---

## 2. Frontend Layer (Single Page Application)

Built with **React 19**, **TypeScript**, and **Vite**:
- **Declarative UI Components:** Modular UI components (`Button`, `Modal`, `Card`, `Badge`, `Input`, `StatCard`).
- **Client Routing:** `react-router-dom` with `ProtectedRoute` guards verifying active Supabase session tokens.
- **State Management:** React hooks (`useState`, `useEffect`, `useCallback`) alongside direct Supabase client calls.
- **Design System:** Responsive Tailwind CSS styling with an executive navy/slate color palette, clear status badges, and accessible data tables.

### Source Directory Organization
```
src/
├── components/          # Reusable UI primitives (Button, Modal, StatCard, Badge)
├── layouts/             # AppLayout (Sidebar, TopBar, Navigation, Profile dropdown)
├── features/            # Feature-specific modules
│   ├── auth/            # LoginPage, Session guards
│   ├── dashboard/       # DashboardPage, KPI analytics, Recharts cashflow
│   ├── students/        # StudentList, StudentModal, StudentDetails
│   ├── shifts/          # ShiftManager, ShiftModal
│   ├── attendance/      # AttendancePage, Daily register, Date filter
│   ├── fees/            # FeeInvoiceList, PaymentModal, InvoiceGenerator
│   ├── expenses/        # ExpenseList, ExpenseModal, Category cards
│   ├── books/           # BookList, BookLoanModal, ReturnModal
│   └── reports/         # ReportsPage, CSV export engines
├── lib/                 # Core utilities
│   ├── supabase.ts      # Supabase client singleton & config validator
│   ├── formatters.ts    # INR currency & Indian date formatters
│   ├── calculations.ts  # Financial, attendance, stock algorithms
│   └── validation.ts    # Input validation helpers
├── types/               # TypeScript interfaces matching database entities
└── test/                # Vitest automated test suites
```

---

## 3. Backend & Database Tier (Supabase + PostgreSQL)

Rather than managing a separate custom Node/Express server that introduces maintenance friction and latency, StudySpace uses Supabase's hardened PostgREST engine with direct PostgreSQL integration:
1. **Direct API Access:** The frontend communicates directly with Supabase's secure PostgREST endpoint using the official `@supabase/supabase-js` SDK.
2. **Row Level Security (RLS):** All data authorization logic resides in PostgreSQL policies. Even if a user knows the database endpoint, queries without a valid authenticated admin JWT token are rejected by the database engine itself.
3. **Foreign Key Integrity:** Ensures referential integrity. Invoices cannot reference nonexistent students, and payments cannot reference nonexistent invoices.
4. **Numeric Accuracy:** All monetary amounts are stored as `NUMERIC(10, 2)` to eliminate floating-point rounding errors.

---

## 4. Hosting & Deployment Architecture

- **Frontend:** Hosted on **Vercel** with continuous deployment from Git. Vercel distributes the compiled static bundle globally across edge points of presence (PoPs).
- **Backend & Database:** Hosted on **Supabase Cloud** (AWS ap-south-1 Mumbai region recommended for minimum latency across India).
- **Environment Separation:** Public frontend configuration (`VITE_SUPABASE_URL`, `VITE_SUPABASE_ANON_KEY`) is injected during Vite build time via environment variables. Sensitive service role keys are excluded from the client build entirely.
