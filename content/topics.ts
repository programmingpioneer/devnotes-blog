export const topics = [
  {
    slug: "frontend",
    name: "Frontend",
    description: "React, Next.js, TypeScript, CSS",
  },
  {
    slug: "backend",
    name: "Backend",
    description: "Node, NestJS, APIs, databases",
  },
  {
    slug: "devops",
    name: "DevOps",
    description: "Deployment, CI/CD, monitoring",
  },
  {
    slug: "ai",
    name: "AI Engineering",
    description: "ML, embeddings, LLM tooling",
  },
] as const;

export type Topic = (typeof topics)[number];