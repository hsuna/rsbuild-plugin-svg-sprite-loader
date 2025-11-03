# @hsuna/rsbuild-plugin-svg-sprite-loader

English | [简体中文](./README.zh-CN.md)

Collect all SVG files under a directory, compile them into a single SVG Sprite, and auto-inject it into Rsbuild’s HTML so you can reference icons via `<use>`.

<p>
  <a href="https://www.npmjs.com/package/@hsuna/rsbuild-plugin-svg-sprite-loader">
   <img src="https://img.shields.io/npm/v/%40hsuna%2Frsbuild-plugin-svg-sprite-loader?style=flat-square&colorA=564341&colorB=EDED91" alt="npm version" />
  </a>
  <img src="https://img.shields.io/badge/License-MIT-blue.svg?style=flat-square&colorA=564341&colorB=EDED91" alt="license" />
  <img src="https://img.shields.io/npm/dm/%40hsuna%2Frsbuild-plugin-svg-sprite-loader?style=flat-square&colorA=564341&colorB=EDED91" alt="npm downloads" />
  <img src="https://img.shields.io/node/v/tsup?label=Node&style=flat-square&colorA=564341&colorB=EDED91" alt="node" />
</p>

## Features

- Recursively collects all `.svg` files in a folder and generates `<symbol id="...">` sprite entries
- Customizable symbol IDs: template string (e.g. `icon-[name]`) or a function `(name) => string`
- Works in both build and dev; zero runtime dependency, pure HTML injection
- Simple and predictable: only reads files and injects HTML; doesn’t change your output structure

## Install

```bash
npm i -D @hsuna/rsbuild-plugin-svg-sprite-loader
```

> Requires Rsbuild 1.x (`@rsbuild/core`).

## Quick start

Register the plugin in `rsbuild.config.ts` (recommend using absolute paths or `join(__dirname, ...)` to point to your icons directory):

```ts
// rsbuild.config.ts
import { join } from 'node:path';
import { defineConfig } from '@rsbuild/core';
import { pluginSvgSpriteLoader } from '@hsuna/rsbuild-plugin-svg-sprite-loader';

export default defineConfig({
  plugins: [
    pluginSvgSpriteLoader({
      path: join(__dirname, 'src/icons'),
      // Template is supported: default 'icon-[name]'; function also works
      symbolId: 'icon-[name]',
    }),
  ],
});
```

Use it in your page/component:

```html
<svg width="16" height="16" aria-hidden="true">
  <use xlink:href="#icon-home" />
  <!-- If symbolId is a function like (name) => `svg-${name}`, then #svg-home -->
  <!-- Chrome/Safari can also use href="#icon-home" -->
</svg>
```

> The plugin injects a hidden `<svg>` at the top of `<body>` that contains all `<symbol>` entries, so no extra network request is needed at runtime.

## Options

`SvgSpriteLoaderOptions`

- path: string (required)
  - File system path of the icons directory; recursively finds all files ending with `.svg`.
  - Prefer `join(__dirname, '...')` to build an absolute path.
- symbolId?: string | (name: string) => string (optional, default: `icon-[name]`)
  - When passing a string, placeholder `[name]` stands for the filename without extension.
  - Or pass a function for full control.

Examples:

```ts
pluginSvgSpriteLoader({
  path: join(__dirname, 'src/icons'),
  // 'icon-[name]' => home.svg produces id="icon-home"
  symbolId: 'icon-[name]',
});

pluginSvgSpriteLoader({
  path: join(__dirname, 'src/icons'),
  // Custom function form
  symbolId: (name) => `svg-${name}`,
});
```

## How it works

During build/dev, the plugin:

1. Recursively reads all `.svg` files under `path`.
2. Uses [`svg-baker`](https://github.com/kisenka/svg-baker) to convert each icon into a `<symbol>`.
3. Concatenates all `<symbol>`s into a single `<svg>` sprite and injects it at the beginning of the HTML `<body>` (hidden via inline styles by default).

Note: if different folders contain same-named files that produce the same `id`, later ones will override earlier ones. Ensure uniqueness in filenames or in your `symbolId` generation.

## Playground

This repo contains a minimal example you can try locally:

```bash
# install and build at repo root first
npm install
npm run build

# enter the example and start dev
cd playground
npm run dev
```

## Security note (dependency overrides)

This project uses `svg-baker`, whose transitive dependencies previously had advisories (e.g. `braces`, `postcss`). In this repo, we use npm `overrides` to force safe versions during development.

For your application, if you run into similar audits, add the following to your app’s `package.json`:

```json
{
  "overrides": {
    "braces": "^3.0.3",
    "micromatch": "^4.0.8",
    "postcss": ">=8.4.31"
  }
}
```

> Note: `overrides` only applies at the top-level install. Overrides in libraries don’t propagate automatically to consumers.

## License

[MIT](./LICENSE)
