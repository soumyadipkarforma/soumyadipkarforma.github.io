import { Link } from 'react-router-dom';
import { motion } from 'framer-motion';

export interface BlogMeta {
  slug: string;
  title: string;
  date: string;
  description: string;
  tags: string[];
  readTime: string;
}

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
    if (typeof val === 'string' && val.startsWith('[') && val.endsWith(']')) {
      val = (val as string).slice(1, -1).split(',').map((s: string) => s.trim());
    }
    data[key] = val;
  }
  return { data, content: match[2] };
}

function estimateReadTime(raw: string): string {
  const words = raw.split(/\s+/).length;
  const mins = Math.max(1, Math.round(words / 200));
  return `${mins} min read`;
}

export function getAllPosts(): BlogMeta[] {
  return Object.entries(blogFiles)
    .map(([path, raw]) => {
      const slug = path.replace('/blog/', '').replace('.md', '');
      const { data, content } = parseFrontmatter(raw);
      return {
        slug,
        title:       (data.title as string) || slug,
        date:        (data.date as string) || '',
        description: (data.description as string) || '',
        tags:        (data.tags as string[]) || [],
        readTime:    estimateReadTime(content),
      };
    })
    .sort((a, b) => (a.date > b.date ? -1 : 1));
}

export default function Blog() {
  const posts = getAllPosts();

  return (
    <main className="min-h-screen text-white pt-16 sm:pt-20">
      <div className="max-w-3xl mx-auto px-4 sm:px-6 lg:px-8 py-12 sm:py-16">
        <motion.div
          initial={{ opacity: 0, y: 24 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5, ease: 'easeOut' }}
        >
          <h1 className="text-3xl sm:text-4xl font-bold mb-2">
            <span className="gradient-text">📝 Blog</span>
          </h1>
          <div className="w-16 h-1 bg-cyan-500 mb-4 rounded-full" />
          <p className="text-gray-400 mb-10 sm:mb-12 text-sm sm:text-base">Thoughts on AI, web dev, Linux and more.</p>
        </motion.div>

        {posts.length === 0 ? (
          <p className="text-gray-500">No posts yet. Check back soon!</p>
        ) : (
          <div className="flex flex-col gap-5 sm:gap-6">
            {posts.map((post, i) => (
              <motion.div
                key={post.slug}
                initial={{ opacity: 0, y: 24 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.4, ease: 'easeOut', delay: i * 0.1 }}
                whileHover={{ borderColor: 'rgba(0,212,255,0.4)' }}
              >
                <Link
                  to={`/blog/${post.slug}`}
                  className="block glass border border-white/10 rounded-xl p-5 sm:p-6 transition-colors"
                >
                  <div className="flex flex-col sm:flex-row sm:items-start sm:justify-between gap-1 sm:gap-4 mb-2">
                    <h2 className="text-lg sm:text-xl font-bold text-white hover:text-cyan-400 transition-colors leading-snug">
                      {post.title}
                    </h2>
                    <div className="flex items-center gap-2 shrink-0">
                      <time className="text-gray-500 text-xs sm:text-sm whitespace-nowrap">{post.date}</time>
                      <span className="text-gray-600 text-xs">·</span>
                      <span className="text-cyan-500/70 text-xs whitespace-nowrap">{post.readTime}</span>
                    </div>
                  </div>
                  <p className="text-gray-400 text-sm leading-relaxed mb-4">{post.description}</p>
                  <div className="flex flex-wrap gap-1.5 sm:gap-2">
                    {post.tags.map((tag) => (
                      <span key={tag} className="px-2 py-0.5 sm:py-1 bg-cyan-950/60 text-cyan-400 text-xs rounded-md border border-cyan-900/50">
                        #{tag}
                      </span>
                    ))}
                  </div>
                </Link>
              </motion.div>
            ))}
          </div>
        )}
      </div>
    </main>
  );
}
