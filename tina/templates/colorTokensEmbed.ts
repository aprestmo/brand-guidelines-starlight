import type { Template } from "tinacms";

/**
 * "Fargevariabler"-embed for rich-text-feltet på doc-samlingen.
 * Speiler RichTextColorTokens-embedet i brand-guidelines-prosjektet: én
 * variabel per linje i en textarea (Tina støtter ikke objekt-lister inni
 * rich-text-embeds), med valgfritt visningsnavn og wildcard-overstyring.
 *
 * Navnet er bevisst små bokstaver med understreker (ikke PascalCase). Astros native
 * MDX-kompilator (@mdx-js/mdx) kompilerer PascalCase-JSX-tagger til en
 * identifikator-oppslag (`_components.Navn`) som kaster
 * "Expected component ... to be defined" når ingen `components`-prop er gitt
 * — noe som skjer for ALLE sider i denne Starlight-appen, siden
 * @astrojs/starlights routing (routes/common.astro) alltid rendrer det
 * native MDX-innholdet uavhengig av Tina, uten å sende inn `components`.
 * Små bokstaver (custom element-stil) kompilerer derimot alltid til en ren
 * streng-tag (`_jsx("color_tokens_embed", props)`), som aldri krever
 * oppslag og dermed aldri kan kaste denne feilen — verifisert direkte mot
 * @mdx-js/mdx sin kompilator. Tinas egen parser (@tinacms/mdx) bryr seg ikke
 * om navnekonvensjon og matcher fortsatt denne malen på `node.name` som før
 * (verifisert direkte mot parseMDX) — redigeringsopplevelsen er upåvirket.
 */
export const colorTokensEmbedTemplate: Template = {
	name: "color_tokens_embed",
	label: "Fargevariabler",
	ui: {
		itemProps: (item) => ({
			label: item?.title || "Fargevariabler",
		}),
	},
	fields: [
		{
			name: "title",
			label: "Tittel",
			type: "string",
			ui: {
				description: "Valgfri. La stå tom hvis seksjonsoverskriften over allerede dekker dette.",
			},
		},
		{
			name: "variableLines",
			label: "Valgte variabler",
			type: "string",
			required: true,
			ui: {
				component: "textarea",
				description:
					"Én variabel per linje. F.eks. --color-brand-primary. Bruk --color-neutral-* for alle variabler i namespacet. " +
					"Valgfritt visningsnavn etter pipe: --color-brand-primary|Primær. " +
					"Wildcard-overstyring av enkeltnivåer: --color-brand-utility-*|700=DN blå;800=Annet navn",
			},
		},
		{
			name: "whiteTextFromItem",
			label: "Hvit skrift fra nr",
			type: "number",
			ui: {
				description:
					"Fra og med dette nummeret i listen (1-basert) brukes hvit skrift for lesbarhet på mørkere bakgrunner. La stå tom for standard (svart tekst).",
			},
		},
	],
};
