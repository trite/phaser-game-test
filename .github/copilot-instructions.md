# Phaser Game TypeScript Template

This is a Phaser 3 TypeScript game template using Vite for bundling. It supports hot-reloading for quick development workflow and creates production-ready builds for web deployment.

Always reference these instructions first and fallback to search or bash commands only when you encounter unexpected information that does not match the info here.

## Working Effectively

### Initial Setup
- Install dependencies: `npm install` -- takes ~5 seconds
- The project uses Node.js 18+ and npm for package management
- TypeScript 5.7.2, Phaser 3.90.0, and Vite 6.3.1 are the main dependencies

### Development Workflow
- Start development server: `npm run dev` -- starts in <1 second, runs on http://localhost:8080
- Development server includes hot-reloading for automatic code updates
- Alternative without analytics: `npm run dev-nolog`

### Build Process
- Production build: `npm run build` -- takes ~30 seconds, NEVER CANCEL. Set timeout to 60+ minutes.
- Alternative without analytics: `npm run build-nolog`
- Build output goes to `dist/` folder and includes all necessary assets
- TypeScript compilation check: `npx tsc --noEmit` -- validates TypeScript without emitting files

### Validation
- ALWAYS test the complete game flow after making changes:
  1. Start dev server: `npm run dev`
  2. Load the game at http://localhost:8080
  3. Verify the main menu displays with Phaser logo and "Main Menu" text on blue gradient background
  4. Click anywhere to transition to the game scene (green background with instructions)
  5. Click again to transition to the game over scene
  6. Verify hot-reloading works by making a small change and saving
- ALWAYS run `npx tsc --noEmit` to validate TypeScript compilation before committing
- There are no linting or testing scripts configured in this project

## Project Structure

### Key Files and Directories
```
/home/runner/work/phaser-game-test/phaser-game-test/
├── src/
│   ├── main.ts              # Application bootstrap - starts the game
│   ├── game/
│   │   ├── main.ts          # Game configuration and Phaser setup
│   │   └── scenes/          # All Phaser game scenes
│   │       ├── Boot.ts      # Initial boot scene
│   │       ├── Preloader.ts # Asset loading scene
│   │       ├── MainMenu.ts  # Main menu scene
│   │       ├── Game.ts      # Main game scene
│   │       └── GameOver.ts  # Game over scene
├── public/
│   ├── assets/              # Game assets (bg.png, logo.png)
│   ├── style.css           # Global CSS styles
│   └── favicon.png         # Site favicon
├── vite/
│   ├── config.dev.mjs      # Development Vite configuration
│   └── config.prod.mjs     # Production Vite configuration
├── dist/                   # Build output (created by npm run build)
├── package.json            # Dependencies and npm scripts
├── tsconfig.json          # TypeScript configuration
├── index.html             # Main HTML file
└── log.js                 # Analytics logging (optional)
```

### Common Code Locations
- Game configuration: `src/game/main.ts` - Contains Phaser game config with scenes array
- Scene management: `src/game/scenes/` - All game scenes inherit from Phaser.Scene
- Asset loading: `src/game/scenes/Preloader.ts` - Loads assets from public/assets/
- Entry point: `src/main.ts` - Initializes the game when DOM loads
- Static assets: `public/assets/` - Images and other assets served directly

## GitHub Actions and Deployment

- Automatic deployment to GitHub Pages on push to main branch
- Deployment workflow uses Node.js 18, runs `npm ci` then `npm run build`
- Game is available at: https://trite.github.io/phaser-game-test/
- Production build uses base path '/phaser-game-test/' for GitHub Pages

## Analytics and Privacy

- `log.js` sends anonymous usage data to Phaser Studio (template name, build type, Phaser version)
- Use `-nolog` variants to disable: `npm run dev-nolog` or `npm run build-nolog`
- To completely disable: delete `log.js` and update package.json scripts

## Common Development Tasks

### Adding New Assets
- Place static assets in `public/assets/`
- Load them in `src/game/scenes/Preloader.ts` using `this.load.image('name', 'filename.png')`
- Reference by name in scenes: `this.add.image(x, y, 'name')`

### Adding New Scenes
- Create new scene file in `src/game/scenes/`
- Import and add to scenes array in `src/game/main.ts`
- Transition between scenes using `this.scene.start('SceneName')`

### Modifying Game Configuration
- Edit game size, background color, physics in `src/game/main.ts`
- Development server configuration in `vite/config.dev.mjs`
- Production build configuration in `vite/config.prod.mjs`

## Troubleshooting

### Common Issues
- If development server won't start, ensure port 8080 is available
- If build fails, run `npx tsc --noEmit` first to check TypeScript errors
- If assets don't load, verify they're in `public/assets/` and referenced correctly in Preloader
- Hot reloading requires saving files in `src/` directory

### Required Dependencies
- Node.js 18 or higher
- npm (comes with Node.js)
- All other dependencies installed via `npm install`

## Build and Timing Expectations

| Command | Duration | Timeout Setting | Notes |
|---------|----------|----------------|--------|
| `npm install` | ~3 seconds | 60 seconds | Only needed once or when dependencies change |
| `npm run dev` | <1 second | 30 seconds | Starts development server |
| `npm run build` | ~20 seconds | 60+ minutes | NEVER CANCEL - Production build |
| `npm run dev-nolog` | <1 second | 30 seconds | Dev server without analytics |
| `npm run build-nolog` | ~20 seconds | 60+ minutes | NEVER CANCEL - Build without analytics |
| `npx tsc --noEmit` | ~2 seconds | 30 seconds | TypeScript validation |

CRITICAL: Build times may vary based on system performance. Always wait for completion rather than canceling long-running commands.