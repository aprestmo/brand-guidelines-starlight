import { defineCollection } from 'astro:content';
import { z } from 'astro/zod';
import { docsLoader } from '@astrojs/starlight/loaders';
import { docsSchema } from '@astrojs/starlight/schema';

export const collections = {
	docs: defineCollection({
		loader: docsLoader(),
		schema: docsSchema({
			extend: z.object({
				cards: z
					.array(
						z.object({
							title: z.string(),
							icon: z.string(),
							body: z.string(),
						}),
					)
					.optional(),
			}),
		}),
	}),
};
