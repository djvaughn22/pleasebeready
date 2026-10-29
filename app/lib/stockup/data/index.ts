// The line-format catalog data, parsed once at load. See parse.ts for the format.
import { go } from "./go";
import { home } from "./home";
import { life } from "./life";
import { more } from "./more";
import { parseBlock } from "./parse";
import { weather } from "./weather";

export const extra = [home, weather, go, life, more].flatMap(parseBlock);
