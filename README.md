# Gnaoua Tours

Premium travel agency website specializing in Algerian Sahara expeditions (Djanet/Tadrart Rouge, Illizi/Ihrir). Features a cinematic public website with smooth-scroll animations and a full admin panel.

## Tech Stack

- **Framework**: Next.js 16 (App Router, TypeScript)
- **Styling**: Tailwind CSS v4, shadcn/ui
- **Database**: Supabase (PostgreSQL + Auth + Storage)
- **Animations**: GSAP ScrollTrigger, Lenis smooth scroll, Framer Motion
- **Fonts**: Playfair Display (headings) + DM Sans (body)

## Getting Started

### Prerequisites

- Node.js 18+
- npm
- A Supabase project (free tier works)

### 1. Install dependencies

```bash
npm install
```

### 2. Set up environment variables

Copy the example env file and fill in your Supabase credentials:

```bash
cp .env.local.example .env.local
```

Required variables:
- `NEXT_PUBLIC_SUPABASE_URL` - Your Supabase project URL
- `NEXT_PUBLIC_SUPABASE_ANON_KEY` - Your Supabase anon/public key
- `SUPABASE_SERVICE_ROLE_KEY` - Your Supabase service role key

### 3. Set up the database

Run the migration SQL in your Supabase SQL Editor:

1. Go to your Supabase Dashboard > SQL Editor
2. Copy and run `supabase/migrations/001_initial_schema.sql`
3. Copy and run `supabase/seed.sql` for sample data

### 4. Create a Storage bucket

1. Go to Supabase Dashboard > Storage
2. Create a new public bucket called `gnawa-media`

### 5. Create an admin user

1. Go to Supabase Dashboard > Authentication > Users
2. Create a new user with email/password
3. Use these credentials to log in at `/admin/login`

### 6. Run the development server

```bash
npm run dev
```

Open [http://localhost:3000](http://localhost:3000) for the public site.
Open [http://localhost:3000/admin/login](http://localhost:3000/admin/login) for the admin panel.

## Project Structure

```
src/
├── app/
│   ├── (public)/          # Public website (home page)
│   ├── admin/             # Admin panel routes
│   │   ├── actions/       # Server actions (programs, sections, settings)
│   │   ├── bookings/      # Booking management
│   │   ├── dashboard/     # Admin dashboard
│   │   ├── login/         # Auth login
│   │   ├── media/         # Media library
│   │   ├── programs/      # Program CRUD
│   │   ├── sections/      # Section CRUD
│   │   └── settings/      # Hero & site settings
│   └── api/               # API routes (bookings, upload)
├── components/
│   ├── admin/             # Admin components
│   ├── ui/                # shadcn/ui components
│   └── website/           # Public website components
├── hooks/                 # Custom hooks (GSAP, parallax)
├── lib/
│   ├── animations/        # GSAP config & presets
│   └── supabase/          # Supabase client/server/middleware
├── providers/             # Lenis smooth scroll provider
├── styles/                # Font configuration
└── types/                 # TypeScript types
```

## Available Scripts

| Command | Description |
|---------|-------------|
| `npm run dev` | Start development server |
| `npm run build` | Create production build |
| `npm run start` | Start production server |
| `npm run lint` | Run ESLint |
| `npm run format` | Format code with Prettier |
| `npm test` | Run tests |
| `npm run test:watch` | Run tests in watch mode |

## Admin Panel Features

- **Dashboard**: Stats overview + recent booking requests
- **Programs**: Full CRUD with itinerary builder, highlights, visibility toggle
- **Sections**: Dynamic content sections with multiple layout types (centered, grid, full-bleed, text-left/right)
- **Bookings**: Filterable table, status management, CSV export
- **Media**: Upload/manage images with drag-and-drop, alt text editing
- **Settings**: Hero section editor, site settings (name, contact, social)

## Desert Color Palette

| Color | Hex | Usage |
|-------|-----|-------|
| Sand | `#E8D5B7` | Secondary, muted backgrounds |
| Gold | `#C4953A` | Primary, CTAs, accents |
| Midnight | `#0C1B33` | Dark backgrounds, text |
| Terracotta | `#B85C38` | Accent color |
| Ivory | `#FAF5EF` | Background, light surfaces |
| Charcoal | `#2C2C2C` | Body text |

## Deployment

Works with any Next.js-compatible host (Vercel, Netlify, etc.):

```bash
npm run build
npm run start
```

Set the same environment variables on your hosting platform.
