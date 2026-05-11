# Changelog

## 0.1.1

- Added JSDoc to `FeedbakeryBoard` and `FeedbakeryBoardProps` for IDE tooltips on hover.
- README clarifies the relationship with `@feedbakery/sdk` and points non-React users back at it.
- No runtime changes — drop-in upgrade from 0.1.0.

## 0.1.0

Initial public release.

- `<FeedbakeryBoard />` React component wrapping `@feedbakery/sdk`.
- Forwards `onReady` and `onResize`. Re-mounts the iframe when iframe-affecting props change; updates `identify` imperatively without remount.
- React 18 and 19 supported via `peerDependencies`.
