/* 
Copied form esbuild https://esbuild.github.io/
MIT License
Copyright (c) 2020 Evan Wallace
*/

export interface Tsconfig {
  alwaysStrict?: boolean;
  baseUrl?: string;
  experimentalDecorators?: boolean;
  importsNotUsedAsValues?: "remove" | "preserve" | "error";
  jsx?: "preserve" | "react-native" | "react" | "react-jsx" | "react-jsxdev";
  jsxFactory?: string;
  jsxFragmentFactory?: string;
  jsxImportSource?: string;
  paths?: Record<string, string[]>;
  preserveValueImports?: boolean;
  strict?: boolean;
  useDefineForClassFields?: boolean;
  verbatimModuleSyntax?: boolean;
}
////
