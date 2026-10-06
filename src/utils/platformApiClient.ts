/**
 * Client-side Platform API utilities
 * These functions run in the browser
 * Using CORS-friendly proxies and alternative endpoints
 *
 * Возвращаем только то, что реально пришло из API: никаких вычисленных
 * «Топ X%» и запасных цифр. Нет данных → null, карточка покажет «API не ответил».
 */

export interface Metric {
  label: string;
  value: string;
}

export interface Segment {
  label: string;
  value: number;
}

export interface Breakdown {
  title: string;
  segments: Segment[];
}

export interface DynamicPlatformData {
  rank?: string;
  metrics: Metric[];
  breakdown?: Breakdown;
}

const fetchWithTimeout = (url: string, options: RequestInit = {}, timeoutMs = 6000): Promise<Response> => {
  const controller = new AbortController();
  const id = setTimeout(() => controller.abort(), timeoutMs);
  return fetch(url, { ...options, signal: controller.signal }).finally(() => clearTimeout(id));
};

const formatNumber = (n: number): string => n.toLocaleString('ru-RU');

/**
 * Топ-N сегментов по убыванию, остальное сворачиваем в «Другие».
 * Больше трёх цветов на полосе не различить — см. токены --color-series-*.
 */
const topSegments = (entries: Segment[], limit = 3): Segment[] => {
  const sorted = entries.filter(e => e.value > 0).sort((a, b) => b.value - a.value);
  const top = sorted.slice(0, limit);
  const rest = sorted.slice(limit).reduce((sum, e) => sum + e.value, 0);
  return rest > 0 ? [...top, { label: 'Другие', value: rest }] : top;
};

/**
 * LeetCode - Using public CORS-friendly proxy
 */
export const fetchLeetCodeStats = async (username: string): Promise<DynamicPlatformData | null> => {
  try {
    const response = await fetchWithTimeout(`https://leetcode-api-faisalshohag.vercel.app/${username}`);

    if (!response.ok) return null;

    const data = await response.json();

    if (!data || data.errors || typeof data.totalSolved !== 'number') return null;

    const metrics: Metric[] = [{ label: 'решено', value: formatNumber(data.totalSolved) }];

    const contestRating = Math.round(data.contestRating || 0);
    if (contestRating > 0) {
      metrics.push({ label: 'рейтинг контестов', value: formatNumber(contestRating) });
    }

    const ranking = data.ranking || 0;
    if (ranking > 0) {
      metrics.push({ label: 'место в мире', value: `#${formatNumber(ranking)}` });
    }

    // Порядок фиксирован (Easy → Medium → Hard), не сортируем: это шкала сложности
    const segments: Segment[] = [
      { label: 'Easy', value: data.easySolved || 0 },
      { label: 'Medium', value: data.mediumSolved || 0 },
      { label: 'Hard', value: data.hardSolved || 0 },
    ];

    return {
      metrics,
      breakdown: data.totalSolved > 0 ? { title: 'По сложности', segments } : undefined,
    };
  } catch (error) {
    console.error('LeetCode API error:', error);
    return null;
  }
};

/**
 * Codewars - Public API v1 (no CORS)
 * https://dev.codewars.com/
 */
export const fetchCodewarsStats = async (username: string): Promise<DynamicPlatformData | null> => {
  try {
    const response = await fetchWithTimeout(`https://www.codewars.com/api/v1/users/${username}`);

    if (!response.ok) return null;

    const data = await response.json();

    if (!data || !data.username) return null;

    const metrics: Metric[] = [
      { label: 'ката решено', value: formatNumber(data.codeChallenges?.totalCompleted || 0) },
      { label: 'честь', value: formatNumber(data.honor || 0) },
    ];

    const leaderboardPosition = data.leaderboardPosition || 0;
    if (leaderboardPosition > 0) {
      metrics.push({ label: 'место в рейтинге', value: `#${formatNumber(leaderboardPosition)}` });
    }

    const languages: Record<string, { score?: number }> = data.ranks?.languages || {};
    const segments = topSegments(
      Object.entries(languages).map(([lang, info]) => ({
        label: lang.charAt(0).toUpperCase() + lang.slice(1),
        value: info.score || 0,
      }))
    );

    return {
      rank: data.ranks?.overall?.name,
      metrics,
      breakdown: segments.length > 0 ? { title: 'Языки, очки', segments } : undefined,
    };
  } catch (error) {
    console.error('Codewars API error:', error);
    return null;
  }
};

/**
 * GitHub - Public REST API (no authentication needed for public data)
 * https://docs.github.com/en/rest
 */
export const fetchGitHubStats = async (username: string): Promise<DynamicPlatformData | null> => {
  try {
    const response = await fetchWithTimeout(`https://api.github.com/users/${username}`);

    if (!response.ok) return null;

    const data = await response.json();

    if (!data || !data.login) return null;

    const metrics: Metric[] = [{ label: 'репозиториев', value: formatNumber(data.public_repos || 0) }];

    let breakdown: Breakdown | undefined;

    const reposResponse = await fetchWithTimeout(
      `https://api.github.com/users/${username}/repos?type=owner&per_page=100`
    );

    if (reposResponse.ok) {
      const repos: Array<{ fork: boolean; language: string | null; stargazers_count: number }> =
        await reposResponse.json();
      const ownRepos = repos.filter(repo => !repo.fork);

      const stars = ownRepos.reduce((sum, repo) => sum + (repo.stargazers_count || 0), 0);
      metrics.push({ label: 'звёзд', value: formatNumber(stars) });

      const langCount: Record<string, number> = {};
      ownRepos.forEach(repo => {
        if (repo.language) {
          langCount[repo.language] = (langCount[repo.language] || 0) + 1;
        }
      });

      const segments = topSegments(Object.entries(langCount).map(([label, value]) => ({ label, value })));
      if (segments.length > 0) {
        breakdown = { title: 'Языки по репозиториям', segments };
      }
    }

    metrics.push({ label: 'подписчиков', value: formatNumber(data.followers || 0) });

    const createdYear = data.created_at ? new Date(data.created_at).getFullYear() : undefined;

    return {
      rank: createdYear ? `на GitHub с ${createdYear}` : undefined,
      metrics,
      breakdown,
    };
  } catch (error) {
    console.error('GitHub API error:', error);
    return null;
  }
};

/**
 * Fetches dynamic data for a platform by name
 * Only for platforms with public API: LeetCode, Codewars, GitHub
 */
export const fetchPlatformData = async (
  platformName: string,
  username: string
): Promise<DynamicPlatformData | null> => {
  switch (platformName.toLowerCase()) {
    case 'leetcode':
      return await fetchLeetCodeStats(username);
    case 'codewars':
      return await fetchCodewarsStats(username);
    case 'github':
      return await fetchGitHubStats(username);
    default:
      return null;
  }
};
