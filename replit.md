# TrafficAI - Adaptive Signal Control Simulator

## Overview

TrafficAI is a full-stack web application that simulates an AI-powered adaptive traffic signal control system. Users input pedestrian counts, vehicle counts, and peak hour status, and the system calculates optimal green light timing using rule-based logic. The app features a visual traffic light simulation with animated countdown, historical run logging, data visualization via charts, and a system architecture explainer page.

The application follows a monorepo structure with a React frontend (`client/`), Express backend (`server/`), and shared types/schemas (`shared/`).

## User Preferences

Preferred communication style: Simple, everyday language.

## System Architecture

### Directory Structure
- `client/` — React frontend (Vite-based SPA)
- `server/` — Express backend API
- `shared/` — Shared schemas, types, and route definitions used by both client and server
- `migrations/` — Drizzle ORM database migrations
- `script/` — Build scripts

### Frontend Architecture
- **Framework**: React with TypeScript, bundled by Vite
- **Routing**: Wouter (lightweight client-side router) with three pages: Dashboard (`/`), History (`/history`), Architecture (`/architecture`)
- **State Management**: TanStack React Query for server state (API fetching, caching, mutations)
- **UI Components**: Shadcn/ui component library (new-york style) built on Radix UI primitives with Tailwind CSS
- **Styling**: Tailwind CSS with CSS variables for theming; dark futuristic aesthetic with custom traffic light colors
- **Animations**: Framer Motion for traffic light animations and transitions
- **Charts**: Recharts (AreaChart) for visualizing pedestrian vs green time data
- **Icons**: Lucide React
- **Path aliases**: `@/` maps to `client/src/`, `@shared/` maps to `shared/`

### Backend Architecture
- **Framework**: Express 5 on Node.js, written in TypeScript (run with `tsx` in dev)
- **API Pattern**: REST endpoints defined in `shared/routes.ts` with Zod schemas for input validation
- **Key Endpoints**:
  - `POST /api/simulation/calculate` — Calculates adaptive green time based on pedestrian/vehicle counts and peak hour
  - `GET /api/simulation/history` — Returns all past simulation runs
  - `POST /api/simulation/save` — Saves a simulation run to the database
  - `GET /api/simulation/graph-data` — Returns data points for the green time vs pedestrians chart
- **Business Logic**: Rule-based signal timing algorithm in `server/routes.ts` that adjusts base green time (25s) based on pedestrian density, peak hours, and vehicle caps
- **Dev Server**: Vite dev server integrated as middleware with HMR support
- **Production**: Client is built to `dist/public`, server is bundled with esbuild to `dist/index.cjs`

### Data Storage
- **Database**: PostgreSQL (required, connection via `DATABASE_URL` environment variable)
- **ORM**: Drizzle ORM with `drizzle-zod` for schema-to-Zod integration
- **Schema** (`shared/schema.ts`): Single table `simulation_runs` with columns:
  - `id` (serial, primary key)
  - `pedestrians` (integer)
  - `vehicles` (integer)
  - `isPeakHour` (boolean)
  - `calculatedGreenTime` (integer)
  - `riskLevel` (text: "Low", "Moderate", "High")
  - `explanation` (text)
  - `createdAt` (text, default timestamp)
- **Storage Layer**: `server/storage.ts` provides a `DatabaseStorage` class implementing `IStorage` interface with `saveSimulation` and `getHistory` methods
- **Migrations**: Use `npm run db:push` (drizzle-kit push) to sync schema to database

### Shared Layer
- `shared/schema.ts` — Database table definitions, Zod schemas for validation, TypeScript types
- `shared/routes.ts` — API route contract definitions (paths, methods, input/output schemas) used by both frontend hooks and backend handlers

### Build System
- **Dev**: `npm run dev` — runs Express + Vite dev server with HMR
- **Build**: `npm run build` — Vite builds client to `dist/public`, esbuild bundles server to `dist/index.cjs`
- **Production**: `npm start` — runs the bundled server from `dist/index.cjs`
- **Type Check**: `npm run check` — runs TypeScript compiler in check mode

## External Dependencies

### Database
- **PostgreSQL** — Required. Must be provisioned and accessible via `DATABASE_URL` environment variable. Used with `pg` (node-postgres) driver and Drizzle ORM.

### Key NPM Packages
- **drizzle-orm** + **drizzle-kit** — ORM and migration tooling for PostgreSQL
- **express** (v5) — HTTP server framework
- **@tanstack/react-query** — Async state management for the frontend
- **recharts** — Charting library for data visualization
- **framer-motion** — Animation library for traffic light effects
- **zod** — Runtime schema validation (shared between frontend and backend)
- **wouter** — Lightweight client-side routing
- **connect-pg-simple** — PostgreSQL session store (available but sessions not actively used)
- **Radix UI** — Headless UI primitives (full suite of components via shadcn/ui)
- **Tailwind CSS** — Utility-first CSS framework

### Replit-Specific
- `@replit/vite-plugin-runtime-error-modal` — Error overlay in development
- `@replit/vite-plugin-cartographer` — Development tooling (dev only)
- `@replit/vite-plugin-dev-banner` — Development banner (dev only)