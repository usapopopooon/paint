# Paint (Tentative Name)

> 🚧 **WIP** - This project is under development.

[日本語](../README.md)

[![version](https://img.shields.io/badge/version-0.3.10-blue)](https://github.com/usapopopooon/paint/releases/tag/v0.3.10) [![CI](https://github.com/usapopopooon/paint/actions/workflows/ci.yml/badge.svg)](https://github.com/usapopopooon/paint/actions/workflows/ci.yml) ![coverage](https://usapopopooon.github.io/paint/coverage-badge.svg) [![Demo](https://img.shields.io/badge/Demo-open-green?logo=github-pages)](https://usapopopooon.github.io/paint/) [![Storybook](https://img.shields.io/badge/Storybook-open-ff4785?logo=storybook&logoColor=white)](https://usapopopooon.github.io/paint/storybook/)

A drawing app built with React and Canvas 2D 👉 [Try it out](https://usapopopooon.github.io/paint/)

![Screenshot](https://usapopopooon.github.io/paint/screenshot_1768650382.png)

## Tech Stack

- **Framework**: React 19, TypeScript
- **Rendering Engine**: Canvas 2D (PixiJS available as alternative)
- **Build**: Vite
- **Styling**: Tailwind CSS v4
- **UI Components**: Radix UI, shadcn/ui
- **Testing**: Vitest, Playwright, Storybook
- **PWA**: vite-plugin-pwa (offline support, installable)
- **CI/CD**: GitHub Actions, GitHub Pages

## Architecture

Adopts **Package by Feature** + **Clean Architecture**.

### Design Principles

- **Package by Feature**: Organize code by feature
- **Clean Architecture**: Structure each feature with types / domain / useCases / adapters / infrastructure / helpers / hooks / components layers
- **One Function Per File**: Follow single responsibility principle, clarify test correspondence
- **Colocation**: Place tests and stories within each feature

### Feature Structure (Conceptual Diagram)

![Feature Structure](img/feature-mermaid-chart.svg)

### Directory Structure

```
src/
├── components/ui/       # Shared UI components (Button, Slider, Tooltip, etc.)
├── constants/           # Global constants (zoom limits, canvas defaults, etc.)
├── features/            # Feature modules
│   └── [feature]/       # Each feature (see feature list for details)
│       ├── types/           # Type definitions only
│       ├── constants/       # Constants
│       ├── domain/          # Domain logic
│       │   ├── entities/    # Entities + factories (one function per file)
│       │   └── services/    # Domain services
│       ├── useCases/        # Use cases (one function per file)
│       ├── adapters/        # External adapters (Canvas API, etc.)
│       ├── infrastructure/  # External system integration (JSON, API, etc.)
│       ├── helpers/         # Pure utilities
│       ├── hooks/           # React hooks
│       ├── components/      # UI components
│       └── index.ts         # Public API
├── hooks/               # Global hooks (useKeyboardShortcuts)
├── lib/                 # Shared utilities (color conversion, storage, etc.)
├── utils/               # General utility functions (toDisplayValue, etc.)
└── test/                # Test utilities and mocks
```

## Development

```bash
# Install dependencies
npm install

# Start development server
npm run dev

# Start Storybook
npm run storybook

# Run tests
npm test

# Run unit tests
npm run test:unit

# Run tests with coverage
npm run test:coverage

# Lint
npm run lint

# Build
npm run build
```
