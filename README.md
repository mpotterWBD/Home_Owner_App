# Home Bound Explorer

Home Bound Explorer is a desktop app for tracking home renovation and repair projects. It is built with Electron, React, TypeScript, and Vite. The app stores project data in a local `.hom` document file and keeps associated attachments in a sidecar folder next to that file.

This project is not packaged yet, so to run it you must install dependencies and launch it in development mode from the command line.

## What you need before you run it

### Prerequisites

- Node.js LTS (recommended: Node 20+ / npm 10+)
- Git
- A local terminal such as PowerShell, bash, or zsh
- A supported desktop OS:
  - Windows
  - macOS
  - Linux

### Recommended setup

Use the latest LTS version of Node.js and make sure `npm` is installed with it. If you are on Windows, PowerShell is fine for the commands below.

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

## Troubleshooting

### `npm install` fails

- Ensure Node.js LTS is installed and active in your terminal.
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
