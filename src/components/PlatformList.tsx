import { useState, useEffect } from 'react';
import type { Platform } from '../data/platforms';
import { fetchPlatformData } from '../utils/platformApiClient';

interface Props {
  platforms: Platform[];
}

interface PlatformWithData extends Platform {
  dynamicRank?: string;
  dynamicStats?: string[];
  isLoading: boolean;
}

export default function PlatformList({ platforms }: Props) {
  console.log('PlatformList received:', platforms);
  console.log('Platforms length:', platforms?.length);
  
  // Фильтруем только видимые платформы
  const visiblePlatforms = platforms.filter(p => p.visible);
  
  // Проверка на пустой массив
  if (!visiblePlatforms || visiblePlatforms.length === 0) {
    return (
      <div className="rounded-lg border border-[var(--color-border)] bg-[var(--color-bg-card)] p-8 text-center">
        <p className="text-[var(--color-text-muted)]">Платформы не найдены</p>
      </div>
    );
  }
  
  // Разделяем платформы на те, у которых есть API и те, у которых нет
  const platformsWithApi = visiblePlatforms.filter(p => p.hasApi);
  const platformsWithoutApi = visiblePlatforms.filter(p => !p.hasApi);

  const [platformsData, setPlatformsData] = useState<PlatformWithData[]>(
    platformsWithApi.map(p => ({ ...p, isLoading: true }))
  );

  useEffect(() => {
    console.log('PlatformList mounted with', platformsWithApi.length, 'platforms with API');
    
    const loadPlatformData = async () => {
      // Загружаем данные только для платформ с API
      platformsWithApi.forEach(async (platform, index) => {
        try {
          const dynamicData = await fetchPlatformData(platform.name, platform.username);
          
          // Обновляем только эту конкретную платформу
          setPlatformsData(prev => 
            prev.map((p, i) => 
              i === index 
                ? {
                    ...p,
                    dynamicRank: dynamicData?.rank,
                    dynamicStats: dynamicData?.stats,
                    isLoading: false,
                  }
                : p
            )
          );
        } catch (error) {
          console.error(`Error loading ${platform.name}:`, error);
          
          // Помечаем как загруженную даже при ошибке
          setPlatformsData(prev => 
            prev.map((p, i) => 
              i === index 
                ? { ...p, isLoading: false }
                : p
            )
          );
        }
      });
    };

    loadPlatformData();
  }, [platforms]);

  // Группируем платформы по категориям
  const codingPlatformsWithApi = platformsData.filter(p => p.category === 'coding');
  const allSecurityPlatformsWithoutApi = platformsWithoutApi.filter(p => p.category === 'security');

  const renderPlatformCard = (platform: PlatformWithData, i: number) => {
    const displayRank = platform.dynamicRank || platform.rank;
    const displayStats = platform.dynamicStats || platform.stats;

    return (
      <a
        key={platform.name}
        href={platform.url}
        target="_blank"
        rel="noopener noreferrer"
        className="scroll-reveal group block rounded-lg border border-[var(--color-border)] bg-[var(--color-bg-card)] p-4 transition-all duration-300 hover:border-[var(--color-border-hover)] hover:-translate-y-1 hover:shadow-lg sm:p-5"
        style={{ transitionDelay: `${i * 100}ms` }}
        aria-label={`${platform.name} profile — ${platform.username}`}
      >
        {/* Header */}
        <div className="mb-3 flex items-center justify-between sm:mb-4">
          <div className="flex items-center gap-2 sm:gap-3">
            <div
              className="flex h-9 w-9 items-center justify-center rounded-lg text-base font-bold sm:h-10 sm:w-10 sm:text-lg"
              style={{
                backgroundColor: `${platform.color}20`,
                color: platform.color,
              }}
            >
              {platform.name.charAt(0)}
            </div>
            <div className="min-w-0">
              <h3 className="truncate text-sm font-bold text-[var(--color-text-primary)] transition-colors group-hover:text-[var(--color-accent)] sm:text-base">
                {platform.name}
              </h3>
              <p className="truncate text-xs text-[var(--color-text-muted)]">@{platform.username}</p>
            </div>
          </div>
          <svg
            className="h-4 w-4 shrink-0 text-[var(--color-text-muted)] transition-transform group-hover:translate-x-1 group-hover:text-[var(--color-accent)]"
            fill="none"
            viewBox="0 0 24 24"
            stroke="currentColor"
            strokeWidth="2"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              d="M10 6H6a2 2 0 00-2 2v10a2 2 0 002 2h10a2 2 0 002-2v-4M14 4h6m0 0v6m0-6L10 14"
            />
          </svg>
        </div>

        {/* Rank badge */}
        <div
          className="mb-3 inline-block rounded-full px-2.5 py-0.5 text-xs font-semibold sm:mb-4 sm:px-3 sm:py-1"
          style={{
            backgroundColor: `${platform.color}15`,
            color: platform.color,
            border: `1px solid ${platform.color}30`,
          }}
        >
          {platform.isLoading ? (
            <span className="inline-flex items-center gap-1">
              <span className="animate-pulse">Получение данных...</span>
            </span>
          ) : (
            displayRank
          )}
        </div>

        {/* Stats */}
        <ul className="space-y-1.5">
          {platform.isLoading ? (
            <>
              {[...Array(3)].map((_, idx) => (
                <li key={idx} className="flex items-start gap-2 text-xs text-[var(--color-text-secondary)] sm:text-sm">
                  <span
                    className="mt-1 h-1 w-1 shrink-0 rounded-full sm:mt-1.5"
                    style={{ backgroundColor: platform.color }}
                  ></span>
                  <span className="animate-pulse text-[var(--color-text-muted)]">Загрузка статистики...</span>
                </li>
              ))}
            </>
          ) : (
            displayStats.map((stat, idx) => (
              <li key={idx} className="flex items-start gap-2 text-xs text-[var(--color-text-secondary)] sm:text-sm">
                <span
                  className="mt-1 h-1 w-1 shrink-0 rounded-full sm:mt-1.5"
                  style={{ backgroundColor: platform.color }}
                ></span>
                {stat}
              </li>
            ))
          )}
        </ul>
      </a>
    );
  };

  // Компактная карточка для платформ без API
  const renderCompactPlatformLink = (platform: Platform, i: number) => {
    return (
      <a
        key={platform.name}
        href={platform.url}
        target="_blank"
        rel="noopener noreferrer"
        className="scroll-reveal group flex items-center gap-3 rounded-lg border border-[var(--color-border)] bg-[var(--color-bg-card)] p-4 transition-all duration-300 hover:border-[var(--color-border-hover)] hover:-translate-y-1"
        style={{ transitionDelay: `${i * 100}ms` }}
        aria-label={`${platform.name} profile — ${platform.username}`}
      >
        <div
          className="flex h-10 w-10 shrink-0 items-center justify-center rounded-lg text-lg font-bold"
          style={{
            backgroundColor: `${platform.color}20`,
            color: platform.color,
          }}
        >
          {platform.name.charAt(0)}
        </div>
        <div className="flex-1">
          <h3 className="font-bold text-[var(--color-text-primary)] transition-colors group-hover:text-[var(--color-accent)]">
            {platform.name}
          </h3>
          <p className="text-xs text-[var(--color-text-muted)]">{platform.description}</p>
        </div>
        <svg
          className="h-4 w-4 shrink-0 text-[var(--color-text-muted)] transition-transform group-hover:translate-x-1 group-hover:text-[var(--color-accent)]"
          fill="none"
          viewBox="0 0 24 24"
          stroke="currentColor"
          strokeWidth="2"
        >
          <path
            strokeLinecap="round"
            strokeLinejoin="round"
            d="M10 6H6a2 2 0 00-2 2v10a2 2 0 002 2h10a2 2 0 002-2v-4M14 4h6m0 0v6m0-6L10 14"
          />
        </svg>
      </a>
    );
  };

  return (
    <div className="space-y-12">
      {/* Coding & Development (с API) */}
      {codingPlatformsWithApi.length > 0 && (
        <div>
          <h3 className="mb-6 text-xl font-bold text-[var(--color-text-primary)]">
            <span className="text-[var(--color-accent)]">{'{ '}</span>
            Кодинг и разработка
            <span className="text-[var(--color-accent)]">{' }'}</span>
          </h3>
          <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
            {codingPlatformsWithApi.map((platform, i) => renderPlatformCard(platform, i))}
          </div>
        </div>
      )}

      {/* Security Platforms (компактные ссылки) */}
      {allSecurityPlatformsWithoutApi.length > 0 && (
        <div>
          <h3 className="mb-6 text-xl font-bold text-[var(--color-text-primary)]">
            <span className="text-[var(--color-accent)]">{'{ '}</span>
            Безопасность и пентестинг
            <span className="text-[var(--color-accent)]">{' }'}</span>
          </h3>
          <div className="grid gap-4 sm:grid-cols-2">
            {allSecurityPlatformsWithoutApi.map((platform, i) => renderCompactPlatformLink(platform, i))}
          </div>
        </div>
      )}
    </div>
  );
};
