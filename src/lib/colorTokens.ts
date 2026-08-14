/**
 * Fargevariabler fra tokens.css — parsing og utvalg for "Fargevariabler"-embedet.
 * Speiler logikken i den React-baserte ColorTokensCard (brand-guidelines-prosjektet),
 * portert til rammeverksuavhengig TypeScript for bruk i en vanlig Astro-komponent.
 *
 * Kilde: https://pages.dngroup.tech/css/theme/dn/tokens.css
 */
import parsedTokensJson from "../data/parsedTokens.json";

export type ColorToken = { name: string; value: string };
type ParsedTokens = { generatedAt?: string | null; tokens: ColorToken[] };

const { generatedAt: bundledGeneratedAt, tokens: bundledTokensList } =
	parsedTokensJson as ParsedTokens;

/** Genereringstidspunkt for den bundlede snapshotten (fra "Generated on"-kommentaren i tokens.css). */
export const tokensGeneratedAt: string | null = bundledGeneratedAt ?? null;

/** Bundlet snapshot: variabelnavn -> verdi. Brukes som build-time fallback. */
export const tokensByName: Record<string, string> = Object.fromEntries(
	bundledTokensList.map((t) => [t.name, t.value]),
);

const TOKENS_URL = "https://pages.dngroup.tech/css/theme/dn/tokens.css";

/** Parser rå CSS-tekst fra tokens.css til et navn->verdi-oppslag + genereringsdato. */
export function parseTokensFromCss(css: string): {
	tokens: Record<string, string>;
	generatedAt: string | null;
} {
	const generatedMatch = css.match(/Generated on (.+?)(?:\s*\*\/|\n|$)/);
	const generatedAt = generatedMatch ? generatedMatch[1].trim() : null;
	const re = /(--[^:]+):\s*([^;]+);/g;
	const tokens: Record<string, string> = {};
	for (const match of css.matchAll(re)) {
		tokens[match[1].trim()] = match[2].trim();
	}
	return { tokens, generatedAt };
}

type ResolvedTokens = { tokensByName: Record<string, string>; tokensGeneratedAt: string | null };

const CACHE_TTL_MS = 5 * 60 * 1000;
let cache: { at: number; promise: Promise<ResolvedTokens> } | null = null;

async function fetchTokens(): Promise<ResolvedTokens> {
	try {
		const res = await fetch(TOKENS_URL);
		if (!res.ok) throw new Error(`Fetch failed: ${res.status}`);
		const css = await res.text();
		const { tokens, generatedAt } = parseTokensFromCss(css);
		if (Object.keys(tokens).length === 0) throw new Error("Ingen tokens funnet");
		return { tokensByName: tokens, tokensGeneratedAt: generatedAt };
	} catch {
		return { tokensByName, tokensGeneratedAt };
	}
}

/**
 * Henter ferske tokens fra TOKENS_URL server-side (SSR/on-demand-siden i denne
 * Starlight-appen kjører alltid server-side). Faller tilbake til den bundlede
 * snapshotten hvis nettverket feiler eller responsen ikke er ok. Resultatet
 * caches i prosessminnet noen minutter, slik at flere embeds på samme side
 * (eller påfølgende requests) ikke trigger én fetch hver.
 */
export function resolveTokens(): Promise<ResolvedTokens> {
	if (!cache || Date.now() - cache.at > CACHE_TTL_MS) {
		cache = { at: Date.now(), promise: fetchTokens() };
	}
	return cache.promise;
}

/** E.g. --color-brand-utility-500 -> "500" */
function suffixAfterLastDash(name: string): string {
	const idx = name.lastIndexOf("-");
	return idx >= 0 ? name.slice(idx + 1) : name;
}

/** Sorterer nøkler slik at numeriske suffikser kommer i rekkefølge (--x-0, --x-50, --x-100, …). */
function sortVariableKeys(keys: string[]): string[] {
	return [...keys].sort((a, b) => {
		const numA = a.match(/-(\d+)$/)?.[1];
		const numB = b.match(/-(\d+)$/)?.[1];
		if (numA != null && numB != null) return Number(numA) - Number(numB);
		return a.localeCompare(b);
	});
}

export type ColorTokensListItem = {
	variableName: string;
	/** Suffix + evt. ": visningsnavn" */
	label: string;
	value: string;
};

/**
 * Parser "Valgte variabler"-textareaen (én rad per variabel):
 *
 * - `--color-brand-primary` — enkeltvariabel, viser suffix som label.
 * - `--color-brand-primary|Primær` — enkeltvariabel med eget visningsnavn.
 * - `--color-neutral-*` — wildcard, ekspanderes til alle variabler i namespacet.
 * - `--color-brand-utility-*|700=DN blå;800=Annet navn` — wildcard med
 *   visningsnavn-overstyring per suffix (semikolon-separert `suffix=navn`).
 */
export function expandVariableLines(
	variableLines: string | null | undefined,
	lookup: Record<string, string>,
): ColorTokensListItem[] {
	if (!variableLines) return [];
	const out: ColorTokensListItem[] = [];
	for (const raw of variableLines.split("\n")) {
		const line = raw.trim();
		if (!line) continue;
		const pipeIdx = line.indexOf("|");
		const variableName = (pipeIdx >= 0 ? line.slice(0, pipeIdx) : line).trim();
		const extra = pipeIdx >= 0 ? line.slice(pipeIdx + 1).trim() : "";
		if (!variableName) continue;

		if (variableName.endsWith("*")) {
			const prefix = variableName.slice(0, -1);
			const overrides = new Map<string, string>();
			if (extra) {
				for (const pair of extra.split(";")) {
					const eqIdx = pair.indexOf("=");
					if (eqIdx < 0) continue;
					const suffix = pair.slice(0, eqIdx).trim();
					const displayName = pair.slice(eqIdx + 1).trim();
					if (suffix && displayName) overrides.set(suffix, displayName);
				}
			}
			const keys = Object.keys(lookup).filter((k) => k.startsWith(prefix));
			for (const key of sortVariableKeys(keys)) {
				const suffix = suffixAfterLastDash(key);
				const override = overrides.get(suffix);
				const label = override ? `${suffix} ${override}` : suffix;
				out.push({ variableName: key, label, value: lookup[key] });
			}
			continue;
		}

		const value = lookup[variableName];
		if (value == null) continue;
		const suffix = suffixAfterLastDash(variableName);
		const label = extra || suffix;
		out.push({ variableName, label, value });
	}
	return out;
}

/** Konverterer en HTTP-dato ("Fri, 06 Mar 2026 11:50:57 GMT") til norsk format (Europe/Oslo). */
export function toNorwegianDateTime(dateString: string): string {
	const date = new Date(dateString);
	if (Number.isNaN(date.getTime())) return dateString;
	return date.toLocaleString("nb-NO", {
		day: "numeric",
		month: "long",
		year: "numeric",
		hour: "2-digit",
		minute: "2-digit",
		second: "2-digit",
		hour12: false,
		timeZone: "Europe/Oslo",
	});
}
