# Today's Task

A 24-hour circular task planner built with Next.js and React.

## Overview

This repository currently contains a single app:

- `clock-app`: A Next.js app that lets you select time ranges on a 24-hour clock and save tasks with title and detail.

Main behavior in the UI:

- Click clock slices to select a continuous hour range.
- Add a task for that range.
- Render tasks as colored arcs on the clock.
- Show a tooltip when task text does not fit inside the arc.
- Delete tasks after selecting them.

## Tech Stack

- Next.js 15
- React 18
- TypeScript
- Tailwind CSS (configured, but current page uses inline styles)

## Project Structure

```text
.
|-- clock-app/
|   |-- app/
|   |   |-- globals.css
|   |   |-- layout.tsx
|   |   `-- page.tsx
|   |-- public/
|   |-- package.json
|   `-- tsconfig.json
|-- package.json
`-- README.md
```

## Getting Started

### 1) Install dependencies

From the repository root:

```bash
npm install
cd clock-app
npm install
```

### 2) Run development server

From `clock-app`:

```bash
npm run dev
```

Open `http://localhost:3000`.

## Useful Scripts (`clock-app/package.json`)

- `npm run dev`: Start local dev server
- `npm run build`: Build for production
- `npm run start`: Run production build
- `npm run lint`: Run ESLint

## Notes

- The root `package.json` currently only lists `framer-motion`, but the app itself uses dependencies defined in `clock-app/package.json`.
- Existing text labels in `app/page.tsx` appear to include some encoding issues and may need cleanup for Korean text readability.
