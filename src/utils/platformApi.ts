/**
 * Platform API utilities
 * Attempts to fetch live data from platforms, falls back to static data on failure
 */

export interface DynamicPlatformData {
  rank?: string;
  stats?: string[];
}

/**
 * LeetCode GraphQL API - publicly available
 */
export const fetchLeetCodeStats = async (username: string, lang: 'en' | 'ru'): Promise<DynamicPlatformData | null> => {
  try {
    const query = `
      query getUserProfile($username: String!) {
        matchedUser(username: $username) {
          profile {
            ranking
          }
          submitStats {
            acSubmissionNum {
              difficulty
              count
            }
          }
          userContestRanking {
            rating
          }
        }
      }
    `;

    const response = await fetch('https://leetcode.com/graphql', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        query,
        variables: { username },
      }),
    });

    if (!response.ok) return null;

    const data = await response.json();
    const user = data?.data?.matchedUser;

    if (!user) return null;

    const ranking = user.profile?.ranking || 0;
    const problems = user.submitStats?.acSubmissionNum || [];
    const contestRating = Math.round(user.userContestRanking?.rating || 0);

    const total = problems.find((p: any) => p.difficulty === 'All')?.count || 0;
    const medium = problems.find((p: any) => p.difficulty === 'Medium')?.count || 0;
    const hard = problems.find((p: any) => p.difficulty === 'Hard')?.count || 0;

    // Calculate percentile (approximate)
    const percentile = ranking > 0 ? Math.min(Math.round((ranking / 1000000) * 100), 99) : 5;

    return {
      rank: lang === 'en' 
        ? `Knight — Top ${percentile}%` 
        : `Knight — Топ ${percentile}%`,
      stats: lang === 'en' 
        ? [
            `${total} problems solved`,
            `${medium} Medium / ${hard} Hard`,
            `Contest Rating: ${contestRating}`,
            `Global Ranking: #${ranking.toLocaleString()}`,
          ]
        : [
            `${total} задач решено`,
            `${medium} Medium / ${hard} Hard`,
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
 * Root Me - No public API available
 * Would require scraping or authentication
 */
export const fetchRootMeStats = async (username: string, lang: 'en' | 'ru'): Promise<DynamicPlatformData | null> => {
  // Root Me doesn't have a public API
  // Could implement web scraping, but it's fragile and may violate ToS
  return null;
};

/**
 * Hack The Box - API available but requires authentication
 * Requires HTB API key
 */
export const fetchHackTheBoxStats = async (username: string, lang: 'en' | 'ru'): Promise<DynamicPlatformData | null> => {
  // HTB API requires authentication token
  // If you have an API key, you can implement it like:
  // const API_KEY = import.meta.env.HTB_API_KEY;
  // if (!API_KEY) return null;
  
  // For now, return null (use static data)
  return null;
};

/**
 * TryHackMe - Limited public API
 * Can try fetching basic profile data
 */
export const fetchTryHackMeStats = async (username: string, lang: 'en' | 'ru'): Promise<DynamicPlatformData | null> => {
  try {
    // THM has an unofficial API endpoint
    const response = await fetch(`https://tryhackme.com/api/user/public-profile?username=${username}`, {
      headers: {
        'Accept': 'application/json',
      },
    });
    
    if (!response.ok) return null;

    const contentType = response.headers.get('content-type');
    if (!contentType || !contentType.includes('application/json')) {
      // API returned HTML instead of JSON (likely changed or restricted)
      return null;
    }

    const data = await response.json();

    if (!data || !data.success) return null;

    const userRank = data.userRank || 0;
    const level = data.level || 0;
    const roomsCompleted = data.roomsCompleted || 0;
    const currentStreak = data.currentStreak || 0;

    // Calculate percentile (THM has ~2M users)
    const percentile = userRank > 0 ? Math.min(Math.round((userRank / 2000000) * 100), 99) : 2;

    return {
      rank: lang === 'en' 
        ? `Level ${level} — Top ${percentile}%` 
        : `Уровень ${level} — Топ ${percentile}%`,
      stats: lang === 'en' 
        ? [
            `${roomsCompleted}+ rooms completed`,
            `${currentStreak}-day current streak`,
            `Global Rank: #${userRank.toLocaleString()}`,
            `Learning Paths: Multiple completed`,
          ]
        : [
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
 * Fetches dynamic data for a platform by name
 */
export const fetchPlatformData = async (
  platformName: string,
  username: string,
  lang: 'en' | 'ru'
): Promise<DynamicPlatformData | null> => {
  switch (platformName.toLowerCase()) {
    case 'leetcode':
      return await fetchLeetCodeStats(username, lang);
    case 'root me':
      return await fetchRootMeStats(username, lang);
    case 'hack the box':
      return await fetchHackTheBoxStats(username, lang);
    case 'tryhackme':
      return await fetchTryHackMeStats(username, lang);
    default:
      return null;
  }
};
