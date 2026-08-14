/**
 * Henter tokens.css og parser alle CSS custom properties til JSON.
 * Kjøres før build/dev slik at appen har en fersk fallback-snapshot i tilfelle
 * kjøretidsfetchen mot tokens.css feiler (f.eks. utenfor DN-nettverket).
 * Usage: node scripts/fetch-tokens.mjs
 */

const TOKENS_URL = "https://pages.dngroup.tech/css/theme/dn/tokens.css";
const OUT_PATH = new URL("../src/data/parsedTokens.json", import.meta.url);

const response = await fetch(TOKENS_URL);
if (!response.ok) throw new Error(`Fetch failed: ${response.status} ${response.statusText}`);
const css = await response.text();

const generatedMatch = css.match(/Generated on (.+?)(?:\s*\*\/|\n|$)/);
const generatedAt = generatedMatch ? generatedMatch[1].trim() : null;

const re = /(--[^:]+):\s*([^;]+);/g;
const tokens = [];
let m;
while ((m = re.exec(css)) !== null) {
	tokens.push({ name: m[1].trim(), value: m[2].trim() });
}

const output = { generatedAt, tokens };
await import("node:fs").then((fs) =>
	fs.promises.writeFile(OUT_PATH, JSON.stringify(output, null, 2), "utf8"),
);
console.log(`Wrote ${tokens.length} tokens (generatedAt: ${generatedAt}) to ${OUT_PATH.pathname}`);
