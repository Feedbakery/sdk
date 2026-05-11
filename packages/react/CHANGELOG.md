# Changelog

## 0.1.0

Initial public release.

- `<FeedbakeryBoard />` React component wrapping `@feedbakery/sdk`.
- Forwards `onReady` and `onResize`. Re-mounts the iframe when iframe-affecting props change; updates `identify` imperatively without remount.
- React 18 and 19 supported via `peerDependencies`.
