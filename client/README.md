# UserManagementClient

This project was generated using [Angular CLI](https://github.com/angular/angular-cli) version 20.2.0 and is now powered by [Nx](https://nx.dev).

## Project Structure

This workspace follows the Nx standard folder structure:

```
client/
├── apps/
│   ├── my-app/                     # Angular application
│   │   ├── src/                    # Application source code
│   │   ├── public/                 # Public assets
│   │   ├── project.json             # Nx project configuration
│   │   ├── tsconfig.app.json        # TypeScript config for app
│   │   └── tsconfig.spec.json       # TypeScript config for tests
│   └── my-electron/                # Electron wrapper application
│       ├── src/
│       │   ├── main.ts              # Electron main process
│       │   └── preload.ts          # Preload script
│       ├── project.json             # Nx project configuration
│       └── tsconfig.json            # TypeScript configuration
├── nx.json                         # Nx workspace configuration
├── tsconfig.json                   # Root TypeScript configuration
└── package.json                    # Dependencies and scripts
```

## Development server

To start a local development server, run:

```bash
npm start
# or
nx serve my-app
```

Once the server is running, open your browser and navigate to `http://localhost:4200/`. The application will automatically reload whenever you modify any of the source files.

## Code scaffolding

Angular CLI includes powerful code scaffolding tools. To generate a new component, run:

```bash
ng generate component component-name
# or
nx generate @schematics/angular:component component-name
```

For a complete list of available schematics (such as `components`, `directives`, or `pipes`), run:

```bash
ng generate --help
# or
nx generate --help
```

## Building

To build the project run:

```bash
npm run build
# or
nx build my-app
```

This will compile your project and store the build artifacts in the `dist/` directory. By default, the production build optimizes your application for performance and speed.

Nx provides intelligent caching, so subsequent builds will be faster if nothing has changed.

## Running unit tests

To execute unit tests with the [Karma](https://karma-runner.github.io) test runner, use the following command:

```bash
npm test
# or
nx test my-app
```

Nx will cache test results, making subsequent test runs faster.

## Electron Application

This workspace includes an Electron application (`my-electron`) that can launch the Angular app (`my-app`) in a desktop window.

### Running Electron

To run the Electron app in development mode:

```bash
npm run electron
# or
npm run electron:dev
```

This will:
1. Start the Angular development server (`my-app`)
2. Wait for the server to be ready
3. Build the Electron app
4. Launch Electron with the Angular app

### Building Electron

To build the Electron app:

```bash
npm run electron:build
```


## Nx Features

This workspace is powered by Nx, which provides:

- **Intelligent Caching**: Builds and tests are cached, making subsequent runs faster
- **Project Graph**: Visualize dependencies between projects with `nx graph`
- **Task Orchestration**: Run tasks in parallel and only when needed
- **Code Generation**: Generate components, services, and more with Nx generators

### Useful Nx Commands

- `nx graph` - Visualize the project graph
- `nx show projects` - List all projects in the workspace
- `nx show project <project-name>` - Show details about a specific project
- `nx run-many --target=build --all` - Build all projects
- `nx affected:build` - Build only projects affected by changes

## Additional Resources

- [Angular CLI Overview and Command Reference](https://angular.dev/tools/cli)
- [Nx Documentation](https://nx.dev)
- [Nx Angular Plugin](https://nx.dev/nx-api/angular)
