# @hsuna/rsbuild-plugin-svg-sprite-loader

[English](./README.md) | 简体中文

将指定目录下的所有 SVG 文件打包为一个 SVG Sprite，并在 Rsbuild 的 HTML 中自动注入，方便通过 `<use>` 在页面中引用。

<p>
  <a href="https://www.npmjs.com/package/@hsuna/rsbuild-plugin-svg-sprite-loader">
   <img src="https://img.shields.io/npm/v/%40hsuna%2Frsbuild-plugin-svg-sprite-loader?style=flat-square&colorA=564341&colorB=EDED91" alt="npm version" />
  </a>
  <img src="https://img.shields.io/badge/License-MIT-blue.svg?style=flat-square&colorA=564341&colorB=EDED91" alt="license" />
  <img src="https://img.shields.io/npm/dm/%40hsuna%2Frsbuild-plugin-svg-sprite-loader?style=flat-square&colorA=564341&colorB=EDED91" alt="npm downloads" />
</p>

## 特性

- 递归收集目录下的所有 `.svg` 文件，并生成 `<symbol id="...">` 精灵图
- 支持自定义符号 ID：模板字符串（如 `icon-[name]`）或函数 `(name) => string`
- 构建与本地开发均生效，零运行时依赖，纯 HTML 注入
- 简单、可预测：只做文件读取与 HTML 注入，不修改你的打包产物结构

## 安装

```bash
npm i -D @hsuna/rsbuild-plugin-svg-sprite-loader
```

> 需要 Rsbuild 1.x（`@rsbuild/core`）。

## 快速上手

在 `rsbuild.config.ts` 中注册插件（推荐使用绝对路径或 `join(__dirname, ...)` 指向图标目录）：

```ts
// rsbuild.config.ts
import { join } from 'node:path';
import { defineConfig } from '@rsbuild/core';
import { pluginSvgSpriteLoader } from '@hsuna/rsbuild-plugin-svg-sprite-loader';

export default defineConfig({
  plugins: [
    pluginSvgSpriteLoader({
      path: join(__dirname, 'src/icons'),
      // 支持模板：默认 'icon-[name]'；也可传函数
      symbolId: 'icon-[name]',
    }),
  ],
});
```

在页面中使用（例如某个组件/HTML）：

```html
<svg width="16" height="16" aria-hidden="true">
  <use xlink:href="#icon-home" />
  <!-- 如果 symbolId 使用函数 (name) => `svg-${name}`，则为 #svg-home -->
  <!-- Chrome/Safari 也可使用 href="#icon-home" -->
  
</svg>
```

> 插件会在 HTML 的 `<body>` 顶部注入一个隐藏的 `<svg>`，其中包含所有收集到的 `<symbol>`，因此无需在运行时再发起额外请求。

## 配置项

`SvgSpriteLoaderOptions`

- path: string（必填）
  - 图标目录的文件系统路径；会递归查找该目录下所有以 `.svg` 结尾的文件。
  - 建议使用 `join(__dirname, '...')` 生成绝对路径。
- symbolId?: string | (name: string) => string（可选，默认：`icon-[name]`）
  - 传入字符串时，使用占位符 `[name]` 表示图标文件名（不含扩展名）。
  - 也可传函数完全控制生成规则。

示例：

```ts
pluginSvgSpriteLoader({
  path: join(__dirname, 'src/icons'),
  // 'icon-[name]' => 文件 home.svg 会得到 id="icon-home"
  symbolId: 'icon-[name]',
});

pluginSvgSpriteLoader({
  path: join(__dirname, 'src/icons'),
  // 自定义函数形式
  symbolId: (name) => `svg-${name}`,
});
```

## 工作方式

构建/开发期间，插件会：

1. 递归读取 `path` 下的所有 `.svg` 文件；
2. 使用 [`svg-baker`](https://github.com/kisenka/svg-baker) 将每个图标转换为 `<symbol>`；
3. 将所有 `<symbol>` 拼接为一个 `<svg>` 精灵图，并注入到 HTML `<body>` 开头（默认通过行内样式隐藏尺寸）。

注意：若不同目录下存在同名文件且生成的 `id` 相同，后读到的会覆盖先前的定义。建议保证文件名或生成规则的唯一性。

## Playground（示例）

本仓库提供了最小示例，可本地体验：

```bash
# 先在根目录安装与构建
npm install
npm run build

# 进入示例并启动 dev
cd playground
npm run dev
```

## 安全说明（依赖覆盖）

本项目使用 `svg-baker`，其间接依赖曾出现安全告警（例如 `braces`、`postcss`）。本仓库已通过 npm `overrides` 在开发环境中强制使用安全版本。

对于你的应用项目，如遇到相同的审计告警，可在应用的 `package.json` 中添加：

```json
{
  "overrides": {
    "braces": "^3.0.3",
    "micromatch": "^4.0.8",
    "postcss": ">=8.4.31"
  }
}
```

> 注：`overrides` 仅作用于顶层应用的安装过程，库自身的覆盖不会自动传递到使用方。

## License

[MIT](./LICENSE)
