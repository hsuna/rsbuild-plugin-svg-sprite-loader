declare module 'svg-baker' {
  export interface AddSymbolInput {
    path: string;
    content: string;
    id?: string;
  }

  export class SpriteSymbol {
    id: string;
    viewBox?: string | null;
    readonly useId: string;
    render(): string;
  }

  export default class SVGCompiler {
    addSymbol(input: AddSymbolInput): Promise<SpriteSymbol>;
    compile(): Promise<unknown>;
  }
}
