import { useEffect, useState } from 'react';

export interface GitHubOrg {
  id: number;
  login: string;
  avatar_url: string;
  description: string | null;
  url: string;
}

type FetchState<T> =
  | { status: 'loading' }
  | { status: 'success'; data: T }
  | { status: 'error'; message: string };

export function useGitHubOrgs(username: string) {
  const [state, setState] = useState<FetchState<GitHubOrg[]>>({ status: 'loading' });

  useEffect(() => {
    let cancelled = false;
    setState({ status: 'loading' });

    async function fetchOrgs() {
      try {
        const res = await fetch(
          `https://api.github.com/users/${username}/orgs`,
          { headers: { Accept: 'application/vnd.github.v3+json' } },
        );
        if (!res.ok) throw new Error(`GitHub API returned ${res.status}`);
        const data: GitHubOrg[] = await res.json();
        if (!cancelled) setState({ status: 'success', data });
      } catch (err) {
        if (!cancelled)
          setState({
            status: 'error',
            message: err instanceof Error ? err.message : 'Unknown error',
          });
      }
    }

    fetchOrgs();
    return () => {
      cancelled = true;
    };
  }, [username]);

  return state;
}
