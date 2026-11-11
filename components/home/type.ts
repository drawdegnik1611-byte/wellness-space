export type PostSummary = {
    id: string | number;
    slug: string;
    title: string;
    coverImage: string | null;
    category: string | null;
    excerpt: string | null;
    createdAt: Date;
  };