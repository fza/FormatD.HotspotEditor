# Changelog


## 3.0.0

Neos 9 compatibility. **Breaking.**

- Backend detection now uses `renderingMode` instead of the removed `documentNode.context.inBackend`
  → requires Neos CMS >= 9.0 (`neos/neos-ui: ~9.0`).
- Switched the backend-editor build from `neos-react-scripts` (webpack) to esbuild. The pre-built
  `Resources/Public/HotspotEditor/Plugin.js` is shipped, so no build step is needed on install.

**Upgrade:** require `>= 9.0`. If you override `Atom.Hotspot`, replace any `*.context.inBackend`
with `renderingMode.isEdit` / `renderingMode.isPreview`.
