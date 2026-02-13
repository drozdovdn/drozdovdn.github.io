/**
 * Client-side Platform API utilities
 * These functions run in the browser
 * Using CORS-friendly proxies and alternative endpoints
 */

export interface DynamicPlatformData {
  rank?: string;
  stats?: string[];
}

/**
 * LeetCode - Using alfa-leetcode-api proxy (CORS-friendly)
 * https://github.com/alfaarghya/alfa-leetcode-api
 */
export const fetchLeetCodeStats = async (username: string): Promise<DynamicPlatformData | null> => {
  try {
    // Using public CORS-friendly LeetCode API proxy
    const response = await fetch(`https://leetcode-api-faisalshohag.vercel.app/${username}`);

    if (!response.ok) return null;

    const data = await response.json();

    if (!data || data.errors) return null;

    const ranking = data.ranking || 0;
    const totalSolved = data.totalSolved || 0;
    const easySolved = data.easySolved || 0;
    const mediumSolved = data.mediumSolved || 0;
    const hardSolved = data.hardSolved || 0;
    const contestRating = Math.round(data.contestRating || 0);

    // Calculate percentile (approximate)
    const percentile = ranking > 0 ? Math.min(Math.round((ranking / 1000000) * 100), 99) : 5;

    return {
      rank: `Knight — Топ ${percentile}%`,
      stats: [
        `${totalSolved} задач решено`,
        `${mediumSolved} Medium / ${hardSolved} Hard`,
        `Рейтинг контестов: ${contestRating}`,
        `Мировой рейтинг: #${ranking.toLocaleString()}`,
      ],
    };
  } catch (error) {
    console.error('LeetCode API error:', error);
    return null;
  }
};

/**
 * TryHackMe - Using CORS proxy (THM blocks direct browser requests)
 * Alternative: Use allorigins.win or other CORS proxy
 */
export const fetchTryHackMeStats = async (username: string): Promise<DynamicPlatformData | null> => {
  try {
    // Option 1: Try direct API call (may work in some networks)
    let response = await fetch(`https://tryhackme.com/api/v2/badges/public-profile?userPublicId=${username}`, {
      headers: {
        'Accept': 'application/json',
      },
    });

    // If direct call fails with CORS, try CORS proxy
    if (!response.ok || response.status === 0) {
      console.log('Direct THM API call failed, trying CORS proxy...');
      
      // Using allorigins.win as CORS proxy
      const proxyUrl = `https://api.allorigins.win/get?url=${encodeURIComponent(`https://tryhackme.com/api/v2/badges/public-profile?userPublicId=${username}`)}`;
      
      response = await fetch(proxyUrl);
      
      if (!response.ok) return null;
      
      const proxyData = await response.json();
      
      if (!proxyData.contents) return null;
      
      const data = JSON.parse(proxyData.contents);
      
      if (!data || !data.success) return null;

      const userRank = data.userRank || 0;
      const level = data.userLevel || 0;
      const roomsCompleted = data.roomsCompleted || 0;
      const currentStreak = data.currentStreak || 0;

      const percentile = userRank > 0 ? Math.min(Math.round((userRank / 2000000) * 100), 99) : 2;

      return {
        rank: `Уровень ${level} — Топ ${percentile}%`,
        stats: [
          `${roomsCompleted}+ комнат пройдено`,
          `Текущая серия: ${currentStreak} дней`,
          `Мировой рейтинг: #${userRank.toLocaleString()}`,
          `Learning Paths: Несколько завершено`,
        ],
      };
    }

    // Process direct response
    const data = await response.json();

    if (!data || !data.success) return null;

    const userRank = data.userRank || 0;
    const level = data.userLevel || 0;
    const roomsCompleted = data.roomsCompleted || 0;
    const currentStreak = data.currentStreak || 0;

    const percentile = userRank > 0 ? Math.min(Math.round((userRank / 2000000) * 100), 99) : 2;

    return {
      rank: `Уровень ${level} — Топ ${percentile}%`,
      stats: [
        `${roomsCompleted}+ комнат пройдено`,
        `Текущая серия: ${currentStreak} дней`,
        `Мировой рейтинг: #${userRank.toLocaleString()}`,
        `Learning Paths: Несколько завершено`,
      ],
    };
  } catch (error) {
    console.error('TryHackMe API error:', error);
    return null;
  }
};

/**
 * Codewars - Public API v1 (no CORS)
 * https://dev.codewars.com/
 */
export const fetchCodewarsStats = async (username: string): Promise<DynamicPlatformData | null> => {
  try {
    const response = await fetch(`https://www.codewars.com/api/v1/users/${username}`);
    
    if (!response.ok) return null;

    const data = await response.json();

    if (!data || !data.username) return null;

    const honor = data.honor || 0;
    const totalCompleted = data.codeChallenges?.totalCompleted || 0;
    const rank = data.ranks?.overall?.name || '8 kyu';
    const leaderboardPosition = data.leaderboardPosition || 0;

    // Get top languages
    const languages = data.ranks?.languages || {};
    const topLangs = Object.keys(languages)
      .slice(0, 3)
      .join(', ') || 'JavaScript, TypeScript';

    // Calculate approximate percentile
    const percentile = leaderboardPosition > 0 ? Math.min(Math.round((leaderboardPosition / 3000000) * 100), 99) : 10;

    return {
      rank: `${rank} — Топ ${percentile}%`,
      stats: [
        `${totalCompleted}+ ката завершено`,
        `Честь: ${honor.toLocaleString()}`,
        `Языки: ${topLangs}`,
        `Фокус: Алгоритмы и структуры данных`,
      ],
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
    const response = await fetch(`https://api.github.com/users/${username}`);
    
    if (!response.ok) return null;

    const data = await response.json();

    if (!data || !data.login) return null;

    const publicRepos = data.public_repos || 0;
    const followers = data.followers || 0;
    const following = data.following || 0;

    // Fetch repos to get top languages
    const reposResponse = await fetch(`https://api.github.com/users/${username}/repos?sort=updated&per_page=10`);
    let topLanguages = 'TypeScript, React, Next.js';
    
    if (reposResponse.ok) {
      const repos = await reposResponse.json();
      const langCount: Record<string, number> = {};
      repos.forEach((repo: any) => {
        if (repo.language) {
          langCount[repo.language] = (langCount[repo.language] || 0) + 1;
        }
      });
      
      const sortedLangs = Object.entries(langCount)
        .sort((a, b) => b[1] - a[1])
        .slice(0, 3)
        .map(([lang]) => lang);
      
      if (sortedLangs.length > 0) {
        topLanguages = sortedLangs.join(', ');
      }
    }

    return {
      rank: 'Frontend Engineer',
      stats: [
        `${publicRepos} публичных репозиториев`,
        `${followers} подписчиков`,
        `Языки: ${topLanguages}`,
        `Фокус: Frontend-архитектура и производительность`,
      ],
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
