import { motion } from 'framer-motion';
import { useGitHubRepos, type GitHubRepo } from '../hooks/useGitHubRepos';
import config from '../config';

const LANG_COLORS: Record<string, string> = {
  TypeScript:  'bg-blue-600',
  JavaScript:  'bg-yellow-500 text-black',
  Python:      'bg-blue-800',
  'C++':       'bg-blue-700',
  'C#':        'bg-green-700',
  Java:        'bg-orange-600',
  HTML:        'bg-red-600',
  CSS:         'bg-blue-500',
  Shell:       'bg-gray-600',
  Rust:        'bg-orange-700',
  Go:          'bg-cyan-700',
};

const LANG_DOT_COLORS: Record<string, string> = {
  TypeScript:  '#3b82f6',
  JavaScript:  '#eab308',
  Python:      '#1d4ed8',
  'C++':       '#2563eb',
  'C#':        '#16a34a',
  Java:        '#ea580c',
  HTML:        '#dc2626',
  CSS:         '#3b82f6',
  Shell:       '#4b5563',
  Rust:        '#c2410c',
  Go:          '#0e7490',
};

function langColor(lang: string | null) {
  return lang && LANG_COLORS[lang] ? LANG_COLORS[lang] : 'bg-gray-700';
}
function langDot(lang: string | null) {
  return lang && LANG_DOT_COLORS[lang] ? LANG_DOT_COLORS[lang] : '#6b7280';
}

function SkeletonCard() {
  return (
    <div className="skeleton-shimmer glass border border-white/10 rounded-xl p-5 sm:p-6 flex flex-col gap-3 h-52" />
  );
}

function RepoCard({ repo, index }: { repo: GitHubRepo; index: number }) {
  const updatedDate = new Date(repo.updated_at).toLocaleDateString('en-US', {
    year: 'numeric', month: 'short', day: 'numeric',
  });

  return (
    <motion.div
      initial={{ opacity: 0, y: 24 }}
      animate={{ opacity: 1, y: 0 }}
      viewport={{ once: true }}
      transition={{ duration: 0.4, ease: 'easeOut', delay: (index % 9) * 0.05 }}
      whileHover={{ y: -6 }}
      className="holo-card glass border border-white/10 hover:border-cyan-500/40 rounded-xl p-5 sm:p-6 flex flex-col transition-colors group"
    >
      {/* Header */}
      <div className="flex items-start justify-between gap-2 mb-2">
        <a
          href={repo.html_url}
          target="_blank"
          rel="noopener noreferrer"
          className="text-base sm:text-lg font-bold text-white group-hover:text-cyan-400 transition-colors leading-snug break-all"
        >
          {repo.name}
        </a>
        {repo.language && (
          <span className="shrink-0 flex items-center gap-1.5 text-xs font-semibold text-gray-300">
            <span
              className="w-2.5 h-2.5 rounded-full flex-shrink-0"
              style={{ backgroundColor: langDot(repo.language) }}
            />
            <span className={`px-2 py-0.5 rounded-full text-white ${langColor(repo.language)}`}>
              {repo.language}
            </span>
          </span>
        )}
      </div>

      {/* Description */}
      <p className="text-gray-400 text-sm leading-relaxed flex-1 mb-4 line-clamp-3">
        {repo.description || 'No description provided.'}
      </p>

      {/* Topics */}
      {repo.topics.length > 0 && (
        <div className="flex flex-wrap gap-1.5 mb-4">
          {repo.topics.slice(0, 5).map((t) => (
            <span key={t} className="px-2 py-0.5 bg-cyan-950/60 text-cyan-400 text-xs rounded-md font-mono border border-cyan-900/50">
              {t}
            </span>
          ))}
        </div>
      )}

      {/* Footer */}
      <div className="flex flex-wrap items-center justify-between gap-2 text-xs text-gray-500 mt-auto pt-3 border-t border-white/10">
        <div className="flex items-center gap-3">
          <span title="Stars">⭐ {repo.stargazers_count.toLocaleString()}</span>
          <span title="Forks">🍴 {repo.forks_count.toLocaleString()}</span>
          <span className="hidden sm:inline">Updated {updatedDate}</span>
        </div>
        <div className="flex items-center gap-3">
          <a
            href={repo.html_url}
            target="_blank"
            rel="noopener noreferrer"
            className="text-gray-400 hover:text-white transition-colors font-medium"
          >
            Source ↗
          </a>
          {repo.homepage && (
            <a
              href={repo.homepage}
              target="_blank"
              rel="noopener noreferrer"
              className="text-cyan-400 hover:text-cyan-300 transition-colors font-medium"
            >
              Live ↗
            </a>
          )}
        </div>
      </div>
    </motion.div>
  );
}

export default function Projects() {
  const state = useGitHubRepos(config.githubUsername);

  return (
    <main className="min-h-screen text-white pt-16 sm:pt-20">
      <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 py-12 sm:py-16">
        <motion.div
          initial={{ opacity: 0, y: 24 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5, ease: 'easeOut' }}
        >
          <h1 className="text-3xl sm:text-4xl font-bold mb-2">
            <span className="gradient-text">🚀 Projects</span>
          </h1>
          <div className="w-16 h-1 bg-cyan-500 mb-4 rounded-full" />
          <p className="text-gray-400 mb-8 sm:mb-12 text-sm sm:text-base">
            Live from GitHub — updated automatically every time the page loads.
          </p>
        </motion.div>

        {state.status === 'loading' && (
          <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-5 sm:gap-6">
            {Array.from({ length: 9 }).map((_, i) => <SkeletonCard key={i} />)}
          </div>
        )}

        {state.status === 'error' && (
          <div className="glass border border-red-800/50 rounded-xl p-6 text-center">
            <p className="text-red-400 font-semibold mb-2">Failed to load projects</p>
            <p className="text-red-500 text-sm">{state.message}</p>
            <p className="text-gray-500 text-xs mt-3">
              View all repos at{' '}
              <a href="https://github.com/soumyadipkarforma" target="_blank" rel="noopener noreferrer" className="text-cyan-400 hover:underline">
                github.com/soumyadipkarforma
              </a>
            </p>
          </div>
        )}

        {state.status === 'success' && (
          <>
            <p className="text-gray-600 text-xs mb-6">{state.data.length} public repositories</p>
            <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-5 sm:gap-6">
              {state.data.map((repo, i) => (
                <RepoCard key={repo.id} repo={repo} index={i} />
              ))}
            </div>
          </>
        )}
      </div>
    </main>
  );
}

