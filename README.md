# MNGR - AI-Powered Creator Partnership Platform

A SaaS platform that connects brands with creators using AI-powered discovery and matching.

## Tech Stack

- **Frontend**: React + Vite + Tailwind CSS
- **Backend**: Express.js + TypeScript
- **Database**: PostgreSQL + Prisma ORM
- **Auth**: JWT

## Getting Started

### 1. Install Dependencies

```bash
npm install
```

### 2. Set Up Database

Configure your PostgreSQL database URL in `.env`:

```
DATABASE_URL="postgresql://user:password@localhost:5432/mngr"
JWT_SECRET="your-secret-key"
```

Push the schema to your database:

```bash
npm run db:push
```

Seed with sample data:

```bash
npm run db:seed
```

### 3. Run Development Server

```bash
npm run dev
```

This starts both the Express backend (port 3000) and Vite frontend (port 5173).

## Demo Credentials

After seeding, you can log in with:
- **Brand**: demo@brand.com / demo1234

## Features

### For Brands
- AI-powered natural language creator search
- Match scoring based on audience fit
- Deal creation and management
- Contract generation

### For Creators
- Profile management
- Deal inbox
- Progressive fee tiers (18% → 10%)
- Earnings tracking

## Project Structure

```
├── client/           # React frontend
│   ├── src/
│   │   ├── components/
│   │   ├── context/
│   │   ├── pages/
│   │   └── lib/
│   └── index.html
├── server/           # Express backend
│   ├── routes/
│   ├── lib/
│   └── index.ts
├── prisma/           # Database schema
│   ├── schema.prisma
│   └── seed.ts
└── package.json
```

## Deployment on Replit

1. Import this project into Replit
2. Add your PostgreSQL database URL to Replit Secrets
3. Run `npm run db:push` to set up the database
4. Run `npm run db:seed` to add sample data
5. Click Run!
