# Paint

> 🚧 **Work in Progress** - This project is under active development.

![version](https://img.shields.io/badge/version-0.0.1-blue) [![CI](https://github.com/usapopopooon/paint/actions/workflows/ci.yml/badge.svg)](https://github.com/usapopopooon/paint/actions/workflows/ci.yml) ![coverage](https://usapopopooon.github.io/paint/coverage-badge.svg) [![Demo](https://img.shields.io/badge/Demo-open-green?logo=github-pages)](https://usapopopooon.github.io/paint/) [![Storybook](https://img.shields.io/badge/Storybook-open-ff4785?logo=storybook&logoColor=white)](https://usapopopooon.github.io/paint/storybook/)

A drawing app built with React and Canvas API.

![Screenshot](https://usapopopooon.github.io/paint/screenshot.png)

## Features

- Pen and eraser tools with adjustable width
- HSV color wheel picker
- Undo/Redo support
- Dark/Light mode
- i18n (English/Japanese)

## Tech Stack

- **Framework**: React 19, TypeScript
- **Build**: Vite
- **Styling**: Tailwind CSS v4
- **UI Components**: Radix UI, shadcn/ui
- **Testing**: Vitest, Playwright, Storybook
- **CI/CD**: GitHub Actions, GitHub Pages

## Architecture

This project follows **Package by Feature** architecture with shared utilities.

### Design Principles

- **Package by Feature**: Code is organized by feature (canvas, color, toolbar) rather than by layer (components, hooks, utils)
- **Separation of concerns**: Business logic is extracted into custom hooks, UI stays in components
- **Colocation**: Tests, stories, and components live together within each feature
- **Shared utilities**: Generic functions used across features are placed in `lib/`

### Directory Structure

```
src/
├── components/       # Shared UI components
│   └── ui/           # Base UI components (Button, Slider, Tooltip, etc.)
├── features/         # Feature modules
│   ├── canvas/       # Drawing canvas feature
│   │   ├── components/
│   │   ├── hooks/    # useCanvas, useDrawing, useCanvasHistory
│   │   ├── utils/    # Canvas rendering utilities
│   │   └── types/
│   ├── color/        # Color picker feature
│   │   ├── components/
│   │   ├── hooks/    # useColorWheel
│   │   └── utils/
│   └── toolbar/      # Toolbar feature
│       └── components/
├── hooks/            # Global hooks (useLocale, useTheme)
├── lib/              # Shared utilities (color conversion, storage)
└── test/             # Test utilities and mocks
```

## Development

```bash
# Install dependencies
npm install

# Start dev server
npm run dev

# Run Storybook
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
