# Changelog

## [0.0.2] - 2025-12-21

### Features

- **BrushCursor**: HTML/CSS overlay cursor for large brush sizes (>128px)

### Improvements

- Move ThemeToggle and LocaleToggle to `components/ui/`
- Run CI on all branches
- Add workflow to require release branches for merging to main

### Removed

- Remove unused ColorPicker component

## [0.0.1] - 2024-12-21

Initial release.

### Features

- **Drawing Canvas**: Freehand drawing with Canvas API
- **Pen Tool**: Adjustable brush width
- **Eraser Tool**: Adjustable eraser width
- **Color Picker**: HSV color wheel with saturation/value square
- **Color Input**: Hex color code input with copy/paste support
- **Undo/Redo**: History management for drawing actions
- **Dark/Light Mode**: Theme switching with system preference detection
- **i18n**: English and Japanese language support
- **Keyboard Shortcuts**: Quick access to tools and actions

### Developer Experience

- Storybook for component documentation
- Vitest + Playwright for testing
- GitHub Actions CI/CD pipeline
- Automatic screenshot generation for README
- Test coverage badge
