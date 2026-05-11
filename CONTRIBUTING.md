# Contributing

Thank you for your interest in contributing to the Feedbakery SDK.

## Quick start

```bash
git clone https://github.com/feedbakery/sdk.git
cd sdk
pnpm install
pnpm verify   # typecheck + test + build + publish-readiness gate
```

## Filing issues

Use the templates:

- **Bug report** — include SDK version, framework (vanilla / React / web component / `<script>`), a minimal reproduction (CodeSandbox or StackBlitz preferred), expected vs. actual behavior, and any console errors.
- **Feature request** — describe the use case before the proposed API. We are deliberately conservative about expanding the SDK's surface.

For **security issues**, please email `security@feedbakery.io` rather than opening a public issue.

## Opening a PR

1. **Open an issue first** for anything beyond a typo, doc fix, or trivial bug. We may have context on whether the change is in scope.
2. **Keep the diff small.** One concern per PR.
3. **Run the gates locally:** `pnpm verify` must pass.
4. **Add tests** for any runtime behavior change. See `packages/sdk/src/**/*.test.ts` for patterns.
5. **Do not bump versions or edit `CHANGELOG.md`.** Releases are handled by maintainers.

## In scope

- Bug fixes in iframe loading, `postMessage` handling, URL building, the web component, or the React wrapper.
- Compatibility fixes for new browser, React, or bundler versions.
- Documentation improvements.
- Test coverage improvements.

## Out of scope

- **New runtime dependencies for `@feedbakery/sdk`.** It currently has zero, and that is a feature.
- **New framework wrappers** (Vue, Svelte, Solid). If demand grows we may add them ourselves, but we are not accepting PRs that add new wrappers at this time.
- **Direct API access from the SDK.** The SDK is intentionally a thin iframe loader and will stay that way.
- **Changes to the `feedbakery:*` `postMessage` protocol.** These are versioned and changed only via a major release.

## Code style

- TypeScript, strict mode, no semicolons, single quotes, 2-space indent.
- Named exports only (`export const Thing = ...`), no default exports except where required by a framework convention.
- Tests in `*.test.ts` alongside the source file (jsdom + vitest).
- The public message protocol (`feedbakery:ready` / `:resize` / `:identify`) is a frozen contract — additive changes only.

## Releases

Maintainers cut releases by:

1. Bumping `version` in the package(s) and the `VERSION` const in `packages/sdk/src/index.ts`.
2. Adding a `## <version>` entry to the package's `CHANGELOG.md`.
3. Tagging the merged commit: `git tag sdk-v0.1.1` or `react-v0.1.1`.
4. Pushing the tag — CI runs the quality gate and publishes to npm with provenance.

## Questions

Open a [Discussion](https://github.com/feedbakery/sdk/discussions).
