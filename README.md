
# WikiSim

[![Tests](https://github.com/wikisim/wikisim-core/actions/workflows/run_tests.yaml/badge.svg)](https://github.com/wikisim/wikisim-core/actions/workflows/run_tests.yaml)


WikiSim is an open source platform for data, back of the envelope calculations, and models of complex problems.

This wikisim-core package is the core library for WikiSim, providing CRUD operations for the data, calculation and model handling code.  And in the future will provide code to run the models to power simulations.

## Dev

    pnpm install
    pnpm run dev

### Setup

If developing in VisualStudioCode you will need to set it up to use the workspace
version of typescript:
1. open a typescript file
2. open the command palette (Cmd+Shift+P on Mac)
3. type "TypeScript: Select TypeScript Version"
4. select "Use Workspace Version"
5. restart the typescript server (Cmd+Shift+P, "TypeScript: Restart TS Server")
