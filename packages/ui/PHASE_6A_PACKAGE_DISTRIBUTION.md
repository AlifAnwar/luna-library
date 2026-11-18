# Phase 6A — Package Distribution

## Status

Implementation and local validation completed on 2026-11-18. The branch still
requires review and commit; no package was published and no component API was
changed.

Phase 6A implements a compiled, private package artifact for `@withalif/luna`.

The package remains marked `private` until the publication decision gate in
Phase 6D. Phase 6B must build on the distribution contract documented here.

## Audit and build decision

Luna contains both server-safe presentation modules and React client modules.
The build must preserve those module boundaries, produce Node-compatible ESM
imports, compile the Tailwind stylesheet, and ship declarations without asking
consumers to compile Luna's source.

| Approach                                              | Maintenance                                          | Output correctness                                                                      | Tree shaking and client boundaries                                               | CSS                                                         | Decision                       |
| ----------------------------------------------------- | ---------------------------------------------------- | --------------------------------------------------------------------------------------- | -------------------------------------------------------------------------------- | ----------------------------------------------------------- | ------------------------------ |
| TypeScript only                                       | Low tool count                                       | Emits declarations, but does not provide Luna's required CSS pipeline or package checks | Preserves files, but requires additional JavaScript and validation orchestration | Not handled                                                 | Rejected as the complete build |
| One bundled entry                                     | Simple archive                                       | Produces a small file set                                                               | Collapses server-safe and client modules and weakens consumer tree shaking       | Can be added                                                | Rejected                       |
| `tsdown` unbundle plus native TypeScript declarations | One JavaScript/CSS config and one declaration config | Emits ESM with explicit `.js` imports, source maps, declarations, and declaration maps  | Preserves each reachable module and its existing `"use client"` directive        | Compiles the public stylesheet through PostCSS and Tailwind | Selected                       |

`tsdown` does not generate declarations in this repository. Its declaration
plugin currently depends on TypeScript APIs that are not available in the
repository's stable TypeScript 7.0.2 toolchain. The native TypeScript CLI emits
the declaration graph quickly and without an experimental compiler version.

All relative source module specifiers use `.js`. TypeScript resolves these
specifiers to `.ts` or `.tsx` while authoring, then preserves correct ESM paths
in JavaScript and declarations. No declaration post-processing is required, so
declaration maps remain accurate.

## Public contract

The package exposes only these entry points:

| Import                        | Runtime target    | Type target       | Purpose                             |
| ----------------------------- | ----------------- | ----------------- | ----------------------------------- |
| `@withalif/luna`              | `dist/index.js`   | `dist/index.d.ts` | Components, icons, and public types |
| `@withalif/luna/styles.css`   | `dist/styles.css` | Not applicable    | Compiled global Luna styles         |
| `@withalif/luna/package.json` | `package.json`    | Not applicable    | Package metadata for tooling        |

Files below `src/` and individual files below `dist/` are private. The export
map blocks consumers from importing either path directly.

The archive allowlist contains only `dist/`, `README.md`, and generated package
metadata. Stories, tests, phase notes, source files, and repository
configuration are excluded.

## Dependency boundaries

| Classification   | Packages                                                                                                                     | Reason                                                                                                                                      |
| ---------------- | ---------------------------------------------------------------------------------------------------------------------------- | ------------------------------------------------------------------------------------------------------------------------------------------- |
| Peer             | `react`, `react-dom` at `19.2.8`                                                                                             | The consumer must provide one tested React runtime. The exact range records current evidence and may be broadened only by Phase 6C testing. |
| Runtime          | `@base-ui/react`, `@daypicker/react`, `class-variance-authority`, `cn`, `recharts`                                           | Compiled modules import these packages at runtime. They remain external to Luna's output.                                                   |
| Development only | React development copies, TypeScript, tsdown, Tailwind/PostCSS tooling, validators, icon generation, lint, and type packages | Required to author, build, or validate Luna but not imported by the shipped JavaScript.                                                     |
| Removed          | `lucide-react`, `react-is`, `shadcn`                                                                                         | Luna source does not import them directly.                                                                                                  |

`tw-animate-css` is development-only because its styles are compiled into
`dist/styles.css`. Runtime JavaScript dependencies are never bundled into Luna.

## Build outputs

`pnpm --filter @withalif/luna run build` performs these operations:

1. Clean only `packages/ui/dist` through tsdown's guarded output cleanup.
2. Emit unbundled ESM and JavaScript source maps.
3. Compile `src/styles/globals.css` to `dist/styles.css` with PostCSS, Tailwind,
   and `tw-animate-css`.
4. Emit declarations and declaration maps from `src/index.ts` and its public
   dependency graph.
5. Run strict `publint` validation against the built package metadata.

The build also checks that every public source module with `"use client"`
retains that directive in its corresponding `dist` module during archive
validation.

## Archive and isolated consumer gate

Run the lightweight archive gate with:

```sh
pnpm --filter @withalif/luna run pack:check
```

Run the complete clean consumer test with:

```sh
pnpm --filter @withalif/luna run test:package
```

The complete test creates a tarball, inspects its allowlisted contents, runs
Are the Types Wrong against the ESM entry point, and installs the archive in a
temporary directory outside the workspace. That consumer then:

- type-checks public JavaScript, component types, and the stylesheet import;
- builds a client-rendered Vite application;
- builds and executes a Vite SSR entry;
- verifies Luna and the consumer resolve the same React package;
- verifies `@withalif/luna/src/index.ts` is blocked; and
- resolves and reads the public compiled stylesheet.

Every temporary fixture is created under the operating system's temporary
directory and removed after the test. The clean command refuses to target a
path other than `packages/ui/dist`.

## Workspace integration

Turborepo declares `dist/**` as a build output. Dependent type checks, tests,
and application builds wait for dependency builds, so the docs and web apps
consume the same `dist` export map as an external consumer. The web app no
longer transpiles Luna source through Next.js.

Root development and Storybook commands build Luna before starting their
consumer. The release gate includes the isolated package test.

Storybook imports the public compiled stylesheet, then compiles utilities used
only by story markup into a later `storybook` cascade layer. Until Phase 6B
defines a public theme compiler contract, that authoring-only stylesheet
references Luna's repository theme source. This exception is not packaged and
is not used by the isolated consumer; replacing it with the approved public
theme contract is an explicit Phase 6B task.

## Validation record

The completed implementation passed:

- workspace lint and TypeScript checks;
- all 595 unit and Storybook browser tests;
- static Storybook production build;
- Next.js production builds for both workspace applications using webpack;
- strict `publint`, archive allowlist, and Are the Types Wrong checks; and
- the isolated client, SSR, React-singleton, CSS, type, and private-import
  package consumer test.

The managed execution environment blocks Turbopack's internal PostCSS worker
from binding a local port, so the default `pnpm build` command stops before
compilation in this environment. Both applications compile successfully with
`next build --webpack`; this is an environment limitation rather than a source
or package failure.

## Phase boundary

Phase 6A does not add themes, a public Tailwind theme compiler entry point, RTL
behavior, new compatibility claims, browser matrix coverage, version
automation, or publication credentials. Those remain in Phases 6B, 6C, and 6D
respectively.
