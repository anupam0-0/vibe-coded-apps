# The 10M Row Field Guide

A doodle-and-paper themed learning site for backend systems design. The course starts with SQL and database behavior, then builds toward safely changing configuration across a large user base. It deliberately leaves the source MCQ unanswered.

## Run locally

```bash
npm install
npm run dev
```

Open the local URL printed by Next.js. Use `npm run build` to create a production build.

## Course map

Eight chapters cover query planning; transactions and MVCC; batch migrations; queues and delivery; idempotency and recovery; worker scaling and backpressure; observability and consistency; and feature flags and architecture trade-offs. Each chapter ends with ten multiple-choice questions that progress from warm-up to design reasoning. Every answer reveals a teaching explanation.

Chapter completion and scores are saved in this browser's local storage.

## Stack

- Next.js App Router with TypeScript
- Tailwind CSS 4
- shadcn/ui configuration and a local shadcn-style Button component
- Motion for React animations
- Lucide icons
