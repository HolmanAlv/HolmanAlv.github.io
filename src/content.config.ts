import { defineCollection } from 'astro:content';
import { glob } from 'astro/loaders';
import { z } from 'astro/zod';

// One .md file per project. The file name is the id: it becomes the anchor on
// its subpage (/dev/#id) and, when the body has text, the case study URL
// (/projects/id/). Renaming a file changes both.
const projects = defineCollection({
    loader: glob({ base: './src/content/projects', pattern: '**/*.md' }),
    schema: ({ image }) =>
        z.object({
            title: z.string(),
            discipline: z.enum(['dev', 'gamedev', 'art']),
            subtitle: z.string().optional(),
            summary: z.string(),
            tags: z.array(z.string()).default([]),
            role: z.string(),
            result: z.string().optional(),
            links: z.array(z.object({ label: z.string(), url: z.url() })).default([]),
            cover: image(),
            coverAlt: z.string(),
            youtubeId: z.string().optional(),
            meta: z.record(z.string(), z.string()).optional(),
            featured: z.boolean().default(false),
            order: z.number(),
        }),
});

export const collections = { projects };
