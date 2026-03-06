import { useEffect, useState } from 'react';
import { useParams, Link } from 'react-router-dom';
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
    setPost({
      title: (data.title as string) || slug || '',
      date: (data.date as string) || '',
      tags: (data.tags as string[]) || [],
      content,
    });
  }, [slug]);

  if (notFound) {
    return (
      <main className="min-h-screen bg-gray-950 text-white pt-20 px-4 flex items-center justify-center">
        <div className="text-center">
          <h1 className="text-4xl font-bold mb-4 text-red-400">Post Not Found</h1>
          <Link to="/blog" className="text-cyan-400 hover:text-cyan-300">← Back to Blog</Link>
        </div>
      </main>
    );
  }

  if (!post) return null;

  return (
    <main className="min-h-screen bg-gray-950 text-white pt-20 px-4">
      <div className="max-w-3xl mx-auto py-16">
        <Link to="/blog" className="text-cyan-400 hover:text-cyan-300 text-sm mb-8 block">
          ← Back to Blog
        </Link>
        <h1 className="text-4xl font-bold mb-3 text-white">{post.title}</h1>
        <div className="flex items-center gap-4 mb-6">
          <time className="text-gray-500 text-sm">{post.date}</time>
          <div className="flex flex-wrap gap-2">
            {post.tags.map((tag) => (
              <span key={tag} className="px-2 py-1 bg-gray-800 text-cyan-400 text-xs rounded-md">
                #{tag}
              </span>
            ))}
          </div>
        </div>
        <div className="prose prose-invert prose-cyan max-w-none">
          <ReactMarkdown remarkPlugins={[remarkGfm]}>{post.content}</ReactMarkdown>
        </div>
      </div>
    </main>
  );
}
