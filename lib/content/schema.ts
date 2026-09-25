import { z } from "zod";

export const postFrontmatterSchema = z.object({
  title: z.string().min(1, "Title required"),
  excerpt: z.string().min(1, "Excerpt required"),
  date: z.string().regex(/^\d{4}-\d{2}-\d{2}$/, "Date must be YYYY-MM-DD"),
  tags: z.array(z.string()).default([]),
  pillar: z.string().optional(),
  draft: z.boolean().default(false),
});

export type PostFrontmatter = z.infer<typeof postFrontmatterSchema>;