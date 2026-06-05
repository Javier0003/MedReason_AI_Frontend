# MedReason_AI

MedReason_AI is the frontend application for the MedReason_AI final project. It is built with React, Vite, Tailwind CSS, and TanStack Router, and includes separate routes for admin and doctor workflows along with a login page.

## Features

- React + TypeScript frontend
- Vite-powered development experience
- TanStack Router route-based navigation
- Tailwind CSS styling
- Placeholder routes for:
  - `/auth/login`
  - `/admin/configuracion`
  - `/admin/medicos`
  - `/admin/dashboard`
  - `/doctor/configuracion`
  - `/doctor/dashboard`
  - `/doctor/logs`
  - `/doctor/medicos`
  - `/App` demo screen with a sample counter

## Project structure

- `src/main.tsx` - app entry point
- `src/routes/` - route definitions and page components
- `src/App.tsx` - demo application screen
- `src/store/` - example Zustand store
- `src/assets/` - static images and assets

## Getting Started

### Install dependencies

```bash
npm install
```

### Run locally

```bash
npm run dev
```

Open the local URL shown in the terminal to view the app.

### Build for production

```bash
npm run build
```

### Preview production build

```bash
npm run preview
```

## Available scripts

- `npm run dev` - start development server
- `npm run build` - compile TypeScript and build production assets
- `npm run lint` - run ESLint across the project
- `npm run preview` - preview the production build locally

## Notes

This frontend currently contains a basic route structure and placeholder pages for the admin and doctor sections. Use the existing routes and components as a scaffold for building the full MedReason_AI user experience.


