import { useState, useEffect } from 'react';
import type { Platform } from '../data/platforms';
import { fetchPlatformData, type DynamicPlatformData, type Breakdown } from '../utils/platformApiClient';

interface Props {
  platforms: Platform[];
}

type LoadState =
  | { status: 'loading' }
  | { status: 'ok'; data: DynamicPlatformData }
  | { status: 'error' };

// Цвета сегментов — токены темы (проверены на различимость при дальтонизме)
const SEGMENT_COLORS = [
  'var(--color-series-1)',
  'var(--color-series-2)',
  'var(--color-series-3)',
];
const OTHER_COLOR = 'var(--color-series-other)';

const segmentColor = (label: string, idx: number) =>
  label === 'Другие' ? OTHER_COLOR : SEGMENT_COLORS[idx] ?? OTHER_COLOR;

const ExternalIcon = () => (
  <svg
    className="h-4 w-4 shrink-0 text-[var(--color-text-muted)] transition-transform group-hover:translate-x-1 group-hover:text-[var(--color-accent)]"
    fill="none"
    viewBox="0 0 24 24"
    stroke="currentColor"
    strokeWidth="2"
    aria-hidden="true"
  >
    <path
      strokeLinecap="round"
      strokeLinejoin="round"
      d="M10 6H6a2 2 0 00-2 2v10a2 2 0 002 2h10a2 2 0 002-2v-4M14 4h6m0 0v6m0-6L10 14"
    />
  </svg>
);

const PlatformIcon = ({ platform }: { platform: Platform }) => (
  <div
    className="flex h-10 w-10 shrink-0 items-center justify-center rounded-lg text-lg font-bold"
    style={{ backgroundColor: `${platform.color}20`, color: platform.color }}
    aria-hidden="true"
  >
    {platform.name.charAt(0)}
  </div>
);

const SectionHeading = ({ title, hint }: { title: string; hint: string }) => (
  <div className="mb-6">
    <h3 className="text-xl font-bold text-[var(--color-text-primary)]">
      <span className="text-[var(--color-accent)]">{'{ '}</span>
      {title}
      <span className="text-[var(--color-accent)]">{' }'}</span>
    </h3>
    <p className="mt-1 text-xs text-[var(--color-text-muted)]">{hint}</p>
  </div>
);

// Полоса-разбивка: сегменты через 2px зазор, подписи со значениями — в легенде
const BreakdownBar = ({ breakdown }: { breakdown: Breakdown }) => {
  const total = breakdown.segments.reduce((sum, s) => sum + s.value, 0);
  if (total === 0) return null;

  return (
    <div>
      <p className="mb-1.5 text-xs text-[var(--color-text-muted)]">{breakdown.title}</p>
      <div className="flex h-2 gap-0.5 overflow-hidden rounded" role="img" aria-label={
        `${breakdown.title}: ` + breakdown.segments.map(s => `${s.label} ${s.value}`).join(', ')
      }>
        {breakdown.segments.map((s, idx) => s.value > 0 && (
          <div
            key={s.label}
            title={`${s.label}: ${s.value.toLocaleString('ru-RU')} (${Math.round((s.value / total) * 100)}%)`}
            style={{
              flexGrow: s.value,
              flexBasis: 0,
              minWidth: '2px',
              backgroundColor: segmentColor(s.label, idx),
            }}
          />
        ))}
      </div>
      <ul className="mt-2 flex flex-wrap gap-x-3 gap-y-1">
        {breakdown.segments.map((s, idx) => (
          <li key={s.label} className="flex items-center gap-1.5 text-xs text-[var(--color-text-secondary)]">
            <span
              className="h-2 w-2 shrink-0 rounded-full"
              style={{ backgroundColor: segmentColor(s.label, idx) }}
              aria-hidden="true"
            />
            {s.label}
            <span className="font-semibold text-[var(--color-text-primary)]">{s.value.toLocaleString('ru-RU')}</span>
          </li>
        ))}
      </ul>
    </div>
  );
};

const MetricsSkeleton = () => (
  <div className="space-y-4" aria-hidden="true">
    <div className="grid grid-cols-3 gap-3">
      {[0, 1, 2].map(i => (
        <div key={i} className="space-y-1.5">
          <div className="h-6 w-12 animate-pulse rounded bg-[var(--color-bg-tertiary)]" />
          <div className="h-3 w-16 animate-pulse rounded bg-[var(--color-bg-tertiary)]" />
        </div>
      ))}
    </div>
    <div className="h-2 animate-pulse rounded bg-[var(--color-bg-tertiary)]" />
  </div>
);

const StatusLine = ({ state }: { state: LoadState }) => {
  if (state.status === 'loading') {
    return <span className="animate-pulse">○ загрузка из API…</span>;
  }
  if (state.status === 'error') {
    return <span>○ API не ответил — цифры в профиле</span>;
  }
  return (
    <span className="flex items-center gap-1.5">
      <span className="h-1.5 w-1.5 rounded-full bg-[var(--color-status-live)]" aria-hidden="true" />
      live — данные с API
    </span>
  );
};

const LivePlatformCard = ({ platform, state, index }: { platform: Platform; state: LoadState; index: number }) => {
  const data = state.status === 'ok' ? state.data : undefined;

  return (
    <a
      href={platform.url}
      target="_blank"
      rel="noopener noreferrer"
      className="scroll-reveal group flex flex-col rounded-lg border border-[var(--color-border)] bg-[var(--color-bg-card)] p-4 transition-all duration-300 hover:border-[var(--color-border-hover)] hover:-translate-y-1 hover:shadow-lg sm:p-5"
      style={{ transitionDelay: `${index * 100}ms` }}
      aria-label={`${platform.name} profile — ${platform.username}`}
      aria-busy={state.status === 'loading'}
    >
      {/* Header */}
      <div className="mb-3 flex items-start justify-between gap-2">
        <div className="flex min-w-0 items-center gap-3">
          <PlatformIcon platform={platform} />
          <div className="min-w-0">
            <h4 className="truncate font-bold text-[var(--color-text-primary)] transition-colors group-hover:text-[var(--color-accent)]">
              {platform.name}
            </h4>
            <p className="truncate text-xs text-[var(--color-text-muted)]">@{platform.username}</p>
          </div>
        </div>
        <ExternalIcon />
      </div>

      {platform.description && (
        <p className="mb-3 text-xs text-[var(--color-text-secondary)]">{platform.description}</p>
      )}

      {data?.rank && (
        <span
          className="mb-4 self-start rounded-full px-2.5 py-0.5 text-xs font-semibold"
          style={{
            backgroundColor: `${platform.color}15`,
            color: platform.color,
            border: `1px solid ${platform.color}30`,
          }}
        >
          {data.rank}
        </span>
      )}

      {/* Body */}
      <div className="mb-4 flex-1">
        {state.status === 'loading' && <MetricsSkeleton />}

        {state.status === 'error' && (
          <p className="text-sm text-[var(--color-text-muted)]">
            Не удалось получить статистику. Открой профиль, чтобы посмотреть актуальные данные.
          </p>
        )}

        {data && (
          <div className="space-y-4">
            <dl className="flex flex-wrap gap-x-6 gap-y-3">
              {data.metrics.map(m => (
                <div key={m.label} className="flex flex-col-reverse">
                  <dt className="whitespace-nowrap text-xs leading-snug text-[var(--color-text-muted)]">{m.label}</dt>
                  <dd className="whitespace-nowrap text-lg font-bold leading-tight text-[var(--color-text-primary)] sm:text-xl">
                    {m.value}
                  </dd>
                </div>
              ))}
            </dl>
            {data.breakdown && <BreakdownBar breakdown={data.breakdown} />}
          </div>
        )}
      </div>

      {/* Footer */}
      <div className="border-t border-[var(--color-border)] pt-3 text-xs text-[var(--color-text-muted)]">
        <StatusLine state={state} />
      </div>
    </a>
  );
};

const StaticPlatformCard = ({ platform, index }: { platform: Platform; index: number }) => (
  <a
    href={platform.url}
    target="_blank"
    rel="noopener noreferrer"
    className="scroll-reveal group flex items-center gap-3 rounded-lg border border-[var(--color-border)] bg-[var(--color-bg-card)] p-4 transition-all duration-300 hover:border-[var(--color-border-hover)] hover:-translate-y-1"
    style={{ transitionDelay: `${index * 100}ms` }}
    aria-label={`${platform.name} profile — ${platform.username}`}
  >
    <PlatformIcon platform={platform} />
    <div className="min-w-0 flex-1">
      <div className="flex flex-wrap items-baseline gap-x-2">
        <h4 className="font-bold text-[var(--color-text-primary)] transition-colors group-hover:text-[var(--color-accent)]">
          {platform.name}
        </h4>
        <span className="truncate text-xs text-[var(--color-text-muted)]">@{platform.username}</span>
      </div>
      {platform.description && (
        <p className="text-xs text-[var(--color-text-secondary)]">{platform.description}</p>
      )}
    </div>
    <ExternalIcon />
  </a>
);

export default function PlatformList({ platforms }: Props) {
  const visiblePlatforms = platforms.filter(p => p.visible);
  const livePlatforms = visiblePlatforms.filter(p => p.hasApi);
  const staticPlatforms = visiblePlatforms.filter(p => !p.hasApi);

  // Состояние по имени платформы, а не по индексу — порядок в массиве не важен
  const [states, setStates] = useState<Record<string, LoadState>>(() =>
    Object.fromEntries(livePlatforms.map(p => [p.name, { status: 'loading' } as LoadState]))
  );

  useEffect(() => {
    let cancelled = false;

    livePlatforms.forEach(async platform => {
      let next: LoadState;
      try {
        const data = await fetchPlatformData(platform.name, platform.username);
        next = data ? { status: 'ok', data } : { status: 'error' };
      } catch {
        next = { status: 'error' };
      }
      if (!cancelled) {
        setStates(prev => ({ ...prev, [platform.name]: next }));
      }
    });

    return () => {
      cancelled = true;
    };
  }, [platforms]);

  if (visiblePlatforms.length === 0) {
    return (
      <div className="rounded-lg border border-[var(--color-border)] bg-[var(--color-bg-card)] p-8 text-center">
        <p className="text-[var(--color-text-muted)]">Платформы не найдены</p>
      </div>
    );
  }

  const coding = livePlatforms.filter(p => p.category === 'coding');
  const security = staticPlatforms.filter(p => p.category === 'security');

  return (
    <div className="space-y-12">
      {coding.length > 0 && (
        <section>
          <SectionHeading
            title="Кодинг и разработка"
            hint="Цифры загружаются из публичных API при открытии страницы. Наведи на полосу — увидишь доли."
          />
          <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
            {coding.map((platform, i) => (
              <LivePlatformCard
                key={platform.name}
                platform={platform}
                state={states[platform.name] ?? { status: 'loading' }}
                index={i}
              />
            ))}
          </div>
        </section>
      )}

      {security.length > 0 && (
        <section>
          <SectionHeading
            title="Безопасность и пентестинг"
            hint="У этих платформ нет публичного API — прогресс смотри в профиле."
          />
          <div className="grid gap-4 sm:grid-cols-2">
            {security.map((platform, i) => (
              <StaticPlatformCard key={platform.name} platform={platform} index={i} />
            ))}
          </div>
        </section>
      )}
    </div>
  );
}
