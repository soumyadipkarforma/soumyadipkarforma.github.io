import { useGitHubRepos, type GitHubRepo } from '../hooks/useGitHubRepos';
import config from '../config';

const LANG_COLORS: Record<string, string> = {
  TypeScript: 'bg-blue-600',
  JavaScript: 'bg-yellow-500 text-black',
  Python: 'bg-blue-800',
  'C++': 'bg-blue-700',
  'C#': 'bg-green-700',
  Java: 'bg-orange-600',
  HTML: 'bg-red-600',
  CSS: 'bg-blue-500',
  Shell: 'bg-gray-600',
  Rust: 'bg-orange-700',
  Go: 'bg-cyan-700',
};

function langColor(lang: string | null) {
  return lang && LANG_COLORS[lang] ? LANG_COLORS[lang] : 'bg-gray-700';
}

function SkeletonCard() {
  return (
    <div className="bg-gray-900 border border-gray-800 rounded-xl p-5 sm:p-6 flex flex-col gap-3 animate-pulse">
      <div className="h-5 w-3/4 bg-gray-700 rounded" />
      <div className="h-3 w-full bg-gray-800 rounded" />
      <div className="h-3 w-5/6 bg-gray-800 rounded" />
      <div className="flex gap-2 mt-2">
        <div className="h-5 w-16 bg-gray-700 rounded-full" />
        <div className="h-5 w-20 bg-gray-700 rounded-full" />
      </div>
    </div>
  );
}

function RepoCard({ repo }: { repo: GitHubRepo }) {
  const updatedDate = new Date(repo.updated_at).toLocaleDateString('en-US', {
    year: 'numeric',
    month: 'short',
    day: 'numeric',
  });

  return (
    <div className="bg-gray-900 border border-gray-800 rounded-xl p-5 sm:p-6 flex flex-col hover:border-cyan-700 transition-all hover:shadow-lg hover:shadow-cyan-900/30 group">
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
          <span className={`shrink-0 text-xs font-semibold px-2 py-0.5 rounded-full text-white ${langColor(repo.language)}`}>
            {repo.language}
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
            <span key={t} className="px-2 py-0.5 bg-cyan-950 text-cyan-400 text-xs rounded-md font-mono">
              {t}
            </span>
          ))}
        </div>
      )}

      {/* Footer: stars, forks, date, links */}
      <div className="flex flex-wrap items-center justify-between gap-2 text-xs text-gray-500 mt-auto pt-3 border-t border-gray-800">
        <div className="flex items-center gap-3">
          <span title="Stars" className="flex items-center gap-1">
            ⭐ {repo.stargazers_count.toLocaleString()}
          </span>
          <span title="Forks" className="flex items-center gap-1">
            🍴 {repo.forks_count.toLocaleString()}
          </span>
          <span title="Last updated" className="hidden sm:inline">Updated {updatedDate}</span>
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
    </div>
  );
}

export default function Projects() {
  const state = useGitHubRepos(config.githubUsername);

  return (
    <main className="min-h-screen bg-gray-950 text-white pt-16 sm:pt-20">
      <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 py-12 sm:py-16">
        <h1 className="text-3xl sm:text-4xl font-bold mb-2 text-cyan-400">🚀 Projects</h1>
        <div className="w-16 h-1 bg-cyan-500 mb-4 rounded-full" />
        <p className="text-gray-400 mb-8 sm:mb-12 text-sm sm:text-base">
          Live from GitHub — updated automatically every time the page loads.
        </p>

        {/* Loading */}
        {state.status === 'loading' && (
          <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-5 sm:gap-6">
            {Array.from({ length: 9 }).map((_, i) => (
              <SkeletonCard key={i} />
            ))}
          </div>
        )}

        {/* Error */}
        {state.status === 'error' && (
          <div className="bg-red-950/50 border border-red-800 rounded-xl p-6 text-center">
            <p className="text-red-400 font-semibold mb-2">Failed to load projects</p>
            <p className="text-red-500 text-sm">{state.message}</p>
            <p className="text-gray-500 text-xs mt-3">
              You can view all repositories at{' '}
              <a
                href="https://github.com/soumyadipkarforma"
                target="_blank"
                rel="noopener noreferrer"
                className="text-cyan-400 hover:underline"
              >
                github.com/soumyadipkarforma
              </a>
            </p>
          </div>
        )}

        {/* Repos */}
        {state.status === 'success' && (
          <>
            <p className="text-gray-600 text-xs mb-6">
              {state.data.length} public repositories
            </p>
            <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-5 sm:gap-6">
              {state.data.map((repo) => (
                <RepoCard key={repo.id} repo={repo} />
              ))}
            </div>
          </>
        )}
      </div>
    </main>
  );
}
