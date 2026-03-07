import { useEffect, useState } from 'react';
import { useParams, Link } from 'react-router-dom';
import { motion, useScroll, useSpring } from 'framer-motion';
import ReactMarkdown from 'react-markdown';
import remarkGfm from 'remark-gfm';

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

function ReadingProgress() {
  const { scrollYProgress } = useScroll();
  const scaleX = useSpring(scrollYProgress, { stiffness: 300, damping: 30 });
  return (
    <motion.div
      style={{ scaleX, transformOrigin: 'left' }}
      className="reading-progress"
    />
  );
}

export default function BlogPost() {
  const { slug } = useParams<{ slug: string }>();
  const [post, setPost] = useState<{ title: string; date: string; tags: string[]; content: string } | null>(null);
  const [notFound, setNotFound] = useState(false);

  useEffect(() => {
    const key = `/blog/${slug}.md`;
    const raw = blogFiles[key];
    if (!raw) {
      setNotFound(true);
      return;
    }
    const { data, content } = parseFrontmatter(raw);
    const trimmedContent = content.replace(/^#[^\n]*\n+/, '');
    setPost({
      title: (data.title as string) || slug || '',
      date:  (data.date as string) || '',
      tags:  (data.tags as string[]) || [],
      content: trimmedContent,
    });
  }, [slug]);

  if (notFound) {
    return (
      <main className="min-h-screen text-white pt-16 sm:pt-20 px-4 flex items-center justify-center">
        <div className="text-center">
          <h1 className="text-3xl sm:text-4xl font-bold mb-4 text-red-400">Post Not Found</h1>
          <Link to="/blog" className="text-cyan-400 hover:text-cyan-300">← Back to Blog</Link>
        </div>
      </main>
    );
  }

  if (!post) return null;

  return (
    <>
      <ReadingProgress />
      <main className="min-h-screen text-white pt-16 sm:pt-20">
        <div className="max-w-3xl mx-auto px-4 sm:px-6 lg:px-8 py-12 sm:py-16">
          <motion.div
            initial={{ opacity: 0, y: 24 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5, ease: 'easeOut' }}
          >
            <Link to="/blog" className="text-cyan-400 hover:text-cyan-300 text-sm mb-6 sm:mb-8 block">
              ← Back to Blog
            </Link>
            <h1 className="text-2xl sm:text-3xl md:text-4xl font-bold mb-3 text-white leading-snug">{post.title}</h1>
            <div className="flex flex-wrap items-center gap-2 sm:gap-4 mb-6 sm:mb-8">
              <time className="text-gray-500 text-xs sm:text-sm">{post.date}</time>
              <div className="flex flex-wrap gap-1.5 sm:gap-2">
                {post.tags.map((tag) => (
                  <span key={tag} className="px-2 py-0.5 sm:py-1 bg-cyan-950/60 text-cyan-400 text-xs rounded-md border border-cyan-900/50">
                    #{tag}
                  </span>
                ))}
              </div>
            </div>
            <div className="prose prose-invert prose-cyan max-w-none prose-sm sm:prose-base">
              <ReactMarkdown remarkPlugins={[remarkGfm]}>{post.content}</ReactMarkdown>
            </div>
          </motion.div>
        </div>
      </main>
    </>
  );
}
