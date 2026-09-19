# Repository Guidelines

## Project Structure & Module Organization

Sozi is an Electron-based SVG presentation editor. Application JavaScript lives in `src/js/`: `model/` holds presentation state, `view/` contains editor UI components, `player/` implements playback and animation, and `backend/` and `exporter/` isolate platform-specific I/O. Entry pages, CSS, and Nunjucks templates are under `src/`. Translation catalogs are in `locales/`; icons, installers, and optional FFmpeg binaries belong in `resources/`. Documentation and sample presentations live in `doc/`, while Inkscape extensions are in `extras/`. Treat `build/` as generated output.

## Build, Test, and Development Commands

- `npm install` installs the pinned Node dependencies.
- `npm run build` (or `gulp`) builds the Electron application into `build/electron`.
- `npm start` launches the previously built desktop application.
- `gulp browserBuild` builds the browser variant; `gulp all` creates distributable packages for supported platforms.
- `npm run eslint` checks JavaScript under `src/js/`.
- `npm run csslint` checks stylesheets under `src/css/`.
- `gulp jsdoc` generates API documentation.

Run the build before `npm start`, and run both linters before submitting changes.

## Coding Style & Naming Conventions

Use four-space indentation in JavaScript and CSS, double-quoted JavaScript strings, semicolons, and ES modules. Follow existing naming: `PascalCase` for classes and class files (`CameraState.js`), `camelCase` for functions and variables, and descriptive suffixes such as `*Task` for Gulp tasks. Add JSDoc to public classes and methods; ESLint enforces the repository rules in `config/eslintrc.mjs`. Preserve the MPL-2.0 header when creating source files modeled on existing code.

## Testing Guidelines

There is currently no automated test command or coverage threshold. Validate changes by running both linters, rebuilding, and exercising the affected workflow in Electron. For player or export changes, open a representative SVG from `doc/presentations/` and verify playback or generated output. Include precise manual verification steps in the pull request.

## Commit & Pull Request Guidelines

Recent history uses short, imperative subjects such as `Bump js-yaml from 4.3.1 to 4.3.2`. Keep commits focused and put rationale in the body when behavior is non-obvious. Pull requests should summarize the change, explain its user impact, link relevant issues, and list build/lint/manual-test results. Include screenshots or a short recording for visible editor or playback changes, plus platform and Sozi version details for platform-specific fixes.
