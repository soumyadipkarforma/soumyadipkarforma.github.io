import { useEffect, useState } from 'react';

export interface GitHubRepo {
  id: number;
  name: string;
  full_name: string;
  description: string | null;
  html_url: string;
  homepage: string | null;
  language: string | null;
  stargazers_count: number;
  forks_count: number;
  topics: string[];
  updated_at: string;
  fork: boolean;
  archived: boolean;
}

type FetchState<T> =
  | { status: 'loading' }
  | { status: 'success'; data: T }
  | { status: 'error'; message: string };

export function useGitHubRepos(username: string, excludeForks = true) {
  const [state, setState] = useState<FetchState<GitHubRepo[]>>({ status: 'loading' });

  useEffect(() => {
    let cancelled = false;
    setState({ status: 'loading' });

    async function fetchRepos() {
      try {
        const url = `https://api.github.com/users/${username}/repos?sort=updated&per_page=100&type=public`;
        const res = await fetch(url, {
          headers: { Accept: 'application/vnd.github.v3+json' },
        });
        if (!res.ok) throw new Error(`GitHub API returned ${res.status}`);
        const data: GitHubRepo[] = await res.json();
        const filtered = data.filter(
          (r) => (!excludeForks || !r.fork) && !r.archived,
        );
        if (!cancelled) setState({ status: 'success', data: filtered });
      } catch (err) {
        if (!cancelled)
          setState({
            status: 'error',
            message: err instanceof Error ? err.message : 'Unknown error',
          });
      }
    }

    fetchRepos();
    return () => {
      cancelled = true;
    };
  }, [username, excludeForks]);

  return state;
}
