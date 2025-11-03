import { readFileSync, readdirSync } from 'node:fs';
import { join } from 'node:path';
import type { RsbuildPlugin } from '@rsbuild/core';
import SVGCompiler from 'svg-baker';

export type SvgSpriteLoaderOptions = {
  path: string;
  // default: icon-[name]
  symbolId?: string | ((name: string) => string);
};

// 查找并处理 SVG 文件
type Compiler = InstanceType<typeof SVGCompiler>;

async function svgFind(
  compiler: Compiler,
  directoryPath: string,
  idPrefix: (name: string) => string,
): Promise<string[]> {
  const svgs: string[] = [];
  const directs = readdirSync(directoryPath, { withFileTypes: true });

  for (const dirent of directs) {
    if (dirent.isDirectory()) {
      const nested = await svgFind(
        compiler,
        join(directoryPath, dirent.name),
        idPrefix,
      );
      svgs.push(...nested);
    } else if (dirent.name.endsWith('.svg')) {
      const id = idPrefix(dirent.name.replace('.svg', ''));
      const path = join(directoryPath, dirent.name);
      const content = readFileSync(path, 'utf-8');

      const symbol = await compiler.addSymbol({ id, content, path });
      svgs.push(symbol.render());
    }
  }

  return svgs;
}

// 创建 SVG 字符串
async function createSvg(
  dirPath: string,
  symbolId?: string | ((name: string) => string),
): Promise<string> {
  if (!dirPath) return '';

  const prefix =
    typeof symbolId === 'function'
      ? symbolId
      : typeof symbolId === 'string'
        ? (name: string) => symbolId.replace('[name]', name)
        : (name: string) => `icon-${name}`;

  const compiler = new SVGCompiler();
  const symbols = await svgFind(compiler, dirPath, prefix);
  return symbols.join('');
}

export const pluginSvgSpriteLoader = (
  options: SvgSpriteLoaderOptions,
): RsbuildPlugin => ({
  name: 'plugin-svg-sprite-loader',

  setup(api) {
    api.modifyHTMLTags(async ({ headTags, bodyTags }) => {
      const str = await createSvg(options.path, options.symbolId);
      bodyTags.unshift({
        tag: 'svg',
        attrs: {
          xmlns: 'http://www.w3.org/2000/svg',
          'xmlns:xlink': 'http://www.w3.org/1999/xlink',
          style: 'position: absolute; width: 0; height: 0',
        },
        children: str,
      });

      return { headTags, bodyTags };
    });
  },
});
