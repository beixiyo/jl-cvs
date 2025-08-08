# IFLOW.md

This file provides guidance to iFlow Cli when working with code in this repository.

## Project Overview

This is a monorepo containing two main packages:
1. `@jl-org/cvs` - A Canvas effects library with various visual effects and image processing tools
2. `test-page` - A React-based testing/demo application that showcases all the features

The library provides numerous visual effects including fireworks, star fields, water ripples, tech number rain, and image processing utilities like cutout tools, edge detection, and video frame capture.

## Commonly Used Commands

### Development
```bash
# Install dependencies
pnpm install

# Start the test/demo page
pnpm test

# Build the core library
pnpm build

# Run linting
pnpm lint

# Clean build artifacts
pnpm clean
```

### Testing
```bash
# The test application is run with:
pnpm test
# This starts a development server at http://localhost:5173 with all demo pages

# Build the test application
pnpm build:test
```

### Library Development
```bash
# Build the core library package
pnpm --filter @jl-org/cvs build

# Run linting on the core library
pnpm --filter @jl-org/cvs lint

# Clean build artifacts in the core library
pnpm --filter @jl-org/cvs clean
```

### Test Application Development
```bash
# Run linting on the test application
pnpm --filter test-page lint

# Build the test application
pnpm --filter test-page build
```

## Code Architecture and Structure

### Monorepo Structure
- `packages/jl-cvs` - The main library package with all Canvas effects and utilities
- `packages/test` - The React-based demo application showcasing all features

### Core Library Structure (`packages/jl-cvs`)
- `src/` - Main source code
  - `index.ts` - Main entry point, exports all modules
  - Feature modules like `firework`, `Grid`, `NoteBoard`, etc. - Each contains implementation files and an index.ts for exports
  - `canvasTool/` - Image processing utilities (noise, watermark, composition, etc.)
  - `utils/` - General utility functions
  - `types/` - Shared TypeScript type definitions
  - `worker/` - Web Workers for heavy computations
  - `Canvas/` - Core Canvas architecture with App, Scene, and Viewport abstractions

### Key Architectural Patterns

1. **Modular Feature Organization**: Each visual effect or utility is organized in its own directory with a consistent structure including an index.ts file for exports.

2. **Canvas Abstraction Layer**: The `Canvas` module provides a foundational architecture with `CanvasApp`, `Scene`, and `Viewport` classes for building complex interactive Canvas applications.

3. **NoteBoard Architecture**: The `NoteBoard` component implements a sophisticated drawing board with layered canvases, undo/redo functionality, and multiple drawing modes. It uses two different history management strategies:
   - Path-based recording for `NoteBoard` (efficient, stores drawing operations)
   - Snapshot-based recording for `NoteBoardWithBase64` (simpler, stores base64 image snapshots)

4. **Worker Support**: Some computationally intensive operations like video frame capture are implemented using Web Workers for better performance.

5. **Image Processing Pipeline**: The library provides a comprehensive set of image processing utilities that work with ImageData, including edge detection, color manipulation, and various filters.

### Test Application Structure (`packages/test`)
- `src/views/` - Individual demo pages for each feature
- `src/components/` - Shared UI components
- Uses React with React Router for navigation between demo pages
- Auto-imports configured for common React hooks and components
- UnoCSS for styling