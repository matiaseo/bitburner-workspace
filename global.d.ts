// global.d.ts
// Forces Deno to expose the game definitions globally to JSDoc strings

import { NS as BitburnerNS } from "./NetscriptDefinitions.d.ts";

declare global {
  type NS = BitburnerNS;
}

