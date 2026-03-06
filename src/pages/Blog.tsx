import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';

export interface BlogMeta {
  slug: string;
  title: string;
  date: string;
  description: string;
  tags: string[];
}

// Vite glob import for all markdown files in the blog folder
const blogFiles = import.meta.glob('/blog/*.md', { query: '?raw', import: 'default', eager: true }) as Record<string, string>;

function parseFrontmatter(raw: string): { data: Record<string, unknown>; content: string } {
  const match = raw.match(/^---\n([\s\S]*?)\n---\n([\s\S]*)$/);
  if (!match) return { data: {}, content: raw };
  const lines = match[1].split('\n');
  const data: Record<string, unknown> = {};
  for (const line of lines) {
    const idx = line.indexOf(':');
    if (idx === -1) continue;
    const key = line.slice(0, idx).trim();
    let val: unknown = line.slice(idx + 1).trim();
    // Handle arrays like: tags: [a, b]
    if (typeof val === 'string' && val.startsWith('[') && val.endsWith(']')) {
      val = (val as string).slice(1, -1).split(',').map((s: string) => s.trim());
    }
    data[key] = val;
  }
  return { data, content: match[2] };
}

export function getAllPosts(): BlogMeta[] {
  return Object.entries(blogFiles)
    .map(([path, raw]) => {
      const slug = path.replace('/blog/', '').replace('.md', '');
      const { data } = parseFrontmatter(raw);
      return {
        slug,
        title: (data.title as string) || slug,
        date: (data.date as string) || '',
        description: (data.description as string) || '',
        tags: (data.tags as string[]) || [],
      };
    })
    .sort((a, b) => (a.date > b.date ? -1 : 1));
}

export default function Blog() {
  const [posts, setPosts] = useState<BlogMeta[]>([]);

  useEffect(() => {
    setPosts(getAllPosts());
  }, []);

  return (
    <main className="min-h-screen bg-gray-950 text-white pt-20 px-4">
      <div className="max-w-3xl mx-auto py-16">
        <h1 className="text-4xl font-bold mb-2 text-cyan-400">📝 Blog</h1>
        <div className="w-16 h-1 bg-cyan-500 mb-4 rounded-full" />
        <p className="text-gray-400 mb-12">Thoughts on AI, web dev, Linux and more.</p>

        {posts.length === 0 ? (
          <p className="text-gray-500">No posts yet. Check back soon!</p>
        ) : (
          <div className="flex flex-col gap-6">
            {posts.map((post) => (
              <Link
                key={post.slug}
                to={`/blog/${post.slug}`}
                className="block bg-gray-900 border border-gray-800 rounded-xl p-6 hover:border-cyan-700 transition-all hover:shadow-lg hover:shadow-cyan-900/20"
              >
                <div className="flex items-start justify-between gap-4 mb-2">
                  <h2 className="text-xl font-bold text-white hover:text-cyan-400 transition-colors">
                    {post.title}
                  </h2>
                  <time className="text-gray-500 text-sm whitespace-nowrap">{post.date}</time>
                </div>
                <p className="text-gray-400 text-sm leading-relaxed mb-4">{post.description}</p>
                <div className="flex flex-wrap gap-2">
                  {post.tags.map((tag) => (
                    <span key={tag} className="px-2 py-1 bg-gray-800 text-cyan-400 text-xs rounded-md">
                      #{tag}
                    </span>
                  ))}
                </div>
              </Link>
            ))}
          </div>
        )}
      </div>
    </main>
  );
}
