# AI Use Cases Arena

A gamified collaborative platform for 7X business users to submit, browse, vote on, and prioritize AI use cases.

## Tech Stack

- **Next.js 15** (App Router)
- **TypeScript**
- **Tailwind CSS**
- **shadcn/ui** (Radix primitives)
- **Framer Motion**
- **Lucide Icons**
- **Recharts**
- **Supabase-ready** architecture (mock data by default)

## Getting Started

### Prerequisites

- Node.js 18.18 or later
- npm, yarn, or pnpm

### Install dependencies

```bash
cd "C:\AI Use Cases Arena"
npm install
```

### Run the development server

```bash
npm run dev
```

Open [http://localhost:3000](http://localhost:3000) in your browser.

### Build for production

```bash
npm run build
npm start
```

## Folder Structure

```
C:\AI Use Cases Arena\
├── src/
│   ├── app/                    # Next.js App Router pages
│   │   ├── page.tsx            # Dashboard
│   │   ├── submit/             # Submit use case form
│   │   ├── gallery/            # Use case gallery
│   │   ├── use-cases/[id]/     # Use case detail
│   │   ├── insights/           # Analytics dashboard
│   │   ├── leaderboard/        # Gamification leaderboard
│   │   └── battle/             # Department battle mode
│   ├── components/
│   │   ├── ui/                 # shadcn/ui primitives
│   │   ├── layout/             # Navigation, app shell
│   │   ├── use-case/           # UseCaseCard, VoteButton
│   │   ├── gamification/       # Badges, leaderboard cards
│   │   ├── insights/           # Charts, impact/effort matrix
│   │   ├── battle/             # Department battle UI
│   │   └── shared/             # StatCard, PageHeader, etc.
│   ├── context/
│   │   └── app-context.tsx     # Global state (localStorage)
│   ├── data/
│   │   └── mock-data.ts        # Seed data
│   ├── hooks/
│   ├── lib/
│   │   ├── supabase/           # Supabase client & query stubs
│   │   ├── scoring.ts          # Innovation score formula
│   │   └── analytics.ts        # Dashboard aggregations
│   └── types/
│       └── index.ts            # TypeScript models
├── .env.example                # Supabase env template
└── package.json
```

## Features

- **Dashboard** with animated hero, stats, trending ideas, quick wins, heatmap
- **Submit** use cases with confetti and +50 XP
- **Gallery** with search, filters, and sorting
- **Detail** pages with voting, comments, AI summary placeholder
- **Insights** with Recharts and mock executive summary
- **Leaderboard** with ranks, badges, and XP
- **Department Battle** competitive rankings

## Gamification (XP)

| Action | XP |
|--------|-----|
| Submit a use case | +50 |
| Receive a vote | +10 (submitter) |
| Vote on a use case | +5 |
| Add a comment | +5 |

## Innovation Score

```
Score = votes × 3 + impact × 20 − effort × 10 + comments × 5 + trendiness bonus
```

## Connecting Supabase Later

1. Copy `.env.example` to `.env.local` and add your Supabase URL and anon key.

2. Create tables matching the types in `src/types/index.ts`:
   - `users`, `use_cases`, `votes`, `comments`, `badges`, `user_badges`

3. Implement queries in `src/lib/supabase/queries.ts`.

4. Replace `AppProvider` localStorage logic in `src/context/app-context.tsx` with async Supabase calls (or use React Query).

5. Add Supabase Auth for real user sessions instead of `CURRENT_USER_ID`.

Suggested schema columns align with the `User`, `UseCase`, `Vote`, and `Comment` interfaces.

## Design

Visual identity inspired by [7X](https://www.7x.ae/): dark premium UI, navy `#001A33`, blue accent `#4DA3FF`, glassmorphism cards, and smooth motion.

## License

Private — 7X internal use.
