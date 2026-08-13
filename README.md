# Home Bound Explorer

Home Bound Explorer is a desktop app for tracking home renovation and repair projects. It is built with Electron, React, TypeScript, and Vite. The app stores project data in a local `.hom` document file and keeps associated attachments in a sidecar folder next to that file.

This project is not packaged yet, so to run it you must install dependencies and launch it in development mode from the command line.

## Before you start: install Node.js and npm

This app must be run from a terminal, and the terminal needs Node.js and npm installed first.

If you do not have Node.js yet, do this first:

1. Go to https://nodejs.org/
2. Download the LTS version for your operating system
3. Run the installer and accept the default options
4. Close and reopen your terminal after installation
5. Confirm it worked by running:

```bash
node -v
npm -v
```

If you see `bash: node: command not found`, `bash: npm: command not found`, or `npm is not recognized`, Node.js is not installed correctly or is not on your PATH yet. In that case, reinstall Node.js LTS and reopen the terminal before continuing.

### Requirements

- Node.js LTS (recommended: Node 20+ / npm 10+)
- Git
- A local terminal such as PowerShell, bash, or zsh
- A supported desktop OS:
  - Windows
  - macOS
  - Linux

## Quick start

After cloning the repo, open a terminal in the project root and run:

```bash
npm install
npm run dev
```

This will install dependencies and launch the Electron app in development mode.

> If you have not run the project before, the first install also triggers the Electron native dependency setup via the `postinstall` script.

## First run workflow

When the app opens:

1. Create a new house file from the app UI.
2. Enter the house name and optional address/city/state.
3. Save the file as a `.hom` file.
4. Add projects by category (In Progress, Maintenance, Repair, Build).
5. Attach an invoice and optional project photos if needed.
6. Close and reopen the file later to confirm data persists.

The app stores a project document such as `MyHouse.hom` alongside a folder like `MyHouse.attachments` containing copied invoice and photo files.

## Project scripts

These are the scripts defined in `package.json`:

```bash
npm install                 # install dependencies and Electron native modules
npm run dev                 # start in development mode
npm run start               # preview the built app locally
npm run test                # run the test suite once
npm run test:watch          # watch tests while developing
npm run typecheck           # run TypeScript checks for main + renderer
npm run lint                # run ESLint
npm run format              # format the project with Prettier
npm run build               # typecheck + build the Electron app
npm run build:unpack        # produce unpacked build output
npm run build:win           # create a Windows installer
npm run build:mac           # create a macOS app bundle / installer
npm run build:linux         # create Linux build artifacts
```

## Common development commands

### Start the app in development

```bash
npm run dev
```

This is the normal command you use while actively working on the app. It starts the Electron app with the Vite dev environment.

### Run the test suite

```bash
npm test
```

Or in watch mode:

```bash
npm run test:watch
```

### Type-check the project

```bash
npm run typecheck
```

This checks both the Node/Electron side and the renderer-side TypeScript config.

### Build the app for production output

```bash
npm run build
```

This runs type checking and then builds the app with `electron-vite`.

## Packaging/build output

The project includes packaging scripts for release builds, but it is not fully packaged yet for end users. The build commands are:

```bash
npm run build:win
npm run build:mac
npm run build:linux
```

These use `electron-builder` to generate distributable artifacts for the platform you are targeting.

## Project structure

```text
Home_Owner_App/
├── build/                     # packaging resources
├── illustrator/               # UI examples / design assets
├── resources/                 # Electron app assets
├── src/
│   ├── main/                  # Electron main process
│   ├── preload/              # preload bridge API
│   ├── renderer/             # React UI and app screens
│   ├── shared/               # shared TS types and data logic
│   └── test/                 # test setup
├── electron-builder.yml      # desktop app packaging config
├── electron.vite.config.ts   # Electron + Vite config
├── package.json              # scripts and dependencies
├── planning.md               # project plan and architecture notes
├── tsconfig.json             # TS project references
├── tsconfig.node.json        # main-process TypeScript config
├── tsconfig.web.json         # renderer TypeScript config
├── vitest.config.ts          # test configuration
├── README.md                 # this file
└── .gitignore                # repo ignore rules
```

## Data and file model

The app is designed around a document-based workflow:

- Each house/project set is saved as a `.hom` file.
- The file contains the house metadata and all project records in JSON.
- Invoice and image attachments live in a folder next to the `.hom` file.
- The app uses shared code in `src/shared/houseFile.ts` for type definitions and file behavior.

This means the app is meant to be used as a local desktop document store rather than a hosted database app.

## Toolbar Color Knobs

To change the top File bar colors, go to:

- `src/renderer/src/assets/main.css`

Then jump to the `TOOLBAR COLOR KNOBS` block (currently around line 63) and edit these exact lines:

- line 68: `--toolbar-bar-color` (top bar background)
- line 69: `--toolbar-font-color` (File menu text)
- line 70: `--toolbar-panel-color` (File dropdown panel)
- line 71: `--toolbar-hover-color` (hover color)

Quick path:

1. Open `src/renderer/src/assets/main.css`
2. Find `TOOLBAR COLOR KNOBS`
3. Change lines 68-71
4. Save the file

Example:

```css
.app {
  --toolbar-bar-color: #5e6ad4;
  --toolbar-font-color: #5e6ad4;
  --toolbar-panel-color: #5e6ad4;
  --toolbar-hover-color: #5e6ad4;
}
```

Important: changing `README.md` will not affect the app UI. Only edits in `src/renderer/src/assets/main.css` are applied.

## Troubleshooting

### `npm install` fails

The most common cause is simply that Node.js is not installed or not available in the terminal.

- Install Node.js LTS from nodejs.org
- Verify it is available:

```bash
node -v
npm -v
```

If you still get `bash: npm: command not found` or `npm is not recognized`, restart your terminal after installation or reopen the terminal session.

- Remove `node_modules` and reinstall if the install is corrupted:

```bash
rm -rf node_modules
npm install
```

On Windows PowerShell:

```powershell
Remove-Item -Recurse -Force node_modules
npm install
```

### The app does not start

Check the dependency install and then rerun:

```bash
npm install
npm run dev
```

### TypeScript errors appear

Run:

```bash
npm run typecheck
```

Then fix any issues reported before continuing.

### Tests fail

Run:

```bash
npm test
```

If you want to iterate during development:

```bash
npm run test:watch
```

### Packaging commands fail

If packaging is not yet configured for your platform, ensure the OS-specific build command matches the machine you are running on. For example, do not run the macOS builder on Windows.

## Typical local workflow

For day-to-day app use during development:

```bash
npm install
npm run dev
```

From there:

1. Create house file
2. Add projects
3. Save and reopen the file
4. Run tests when making app changes
5. Run `npm run build` before a release candidate

## Notes for this repo

- This repo is set up for local developer usage and packaging, not a hosted web app.
- The project is a desktop app, so there is no remote server to start.
- The application data is local to the machine and saved in `.hom` files, not in a database service.
- The project includes roadmap notes in [planning.md](planning.md) if you want to understand the feature direction and architecture.

## Summary

If you are trying to run the application before packaging, the required commands are:

```bash
npm install
npm run dev
```

If you want to validate the project after changes, also use:

```bash
npm run typecheck
npm test
npm run build
```
