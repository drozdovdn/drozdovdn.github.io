# Platform API Integration (Client-Side)

Этот файл содержит функции для динамической загрузки данных с платформ **в браузере** (client-side).

## Как это работает

Данные загружаются **на клиенте** (в браузере пользователя) при каждом посещении страницы.

### Поддерживаемые платформы

1. **LeetCode** ✅ — Полностью динамическое API
   - Использует публичный **CORS-friendly прокси**: `leetcode-api-faisalshohag.vercel.app`
   - Получает: ранг, решенные задачи, contest rating
   - **Запросы видны в DevTools → Network tab**
   - Fallback: если API недоступен, используются данные из `platforms.ts`

2. **Codewars** ✅ — Динамическое API
   - Использует публичный **API v1**: `www.codewars.com/api/v1/users/{username}`
   - Получает: rank (kyu), honor, completed kata, leaderboard position
   - **Запросы видны в DevTools → Network tab**
   - Fallback: если API недоступен, используются данные из `platforms.ts`

3. **GitHub** ✅ — Динамическое API
   - Использует публичный **REST API**: `api.github.com/users/{username}`
   - Получает: public repos, followers, top languages
   - **Запросы видны в DevTools → Network tab**
   - Fallback: если API недоступен, используются данные из `platforms.ts`

4. **TryHackMe** ✅ — Динамическое API
   - Использует публичный **badge endpoint**: `tryhackme.com/api/v2/badges/public-profile`
   - Получает: уровень, пройденные комнаты, streak, ранг
   - **Запросы видны в DevTools → Network tab**
   - Fallback: если API недоступен, используются данные из `platforms.ts`

5. **Root Me** ❌ — Статические данные
   - API закрыто / требует авторизацию
   - Всегда используются данные из `platforms.ts`

6. **Hack The Box** ❌ — Статические данные
   - API есть, но требует API ключ
   - Всегда используются данные из `platforms.ts`

7. **PortSwigger Academy** ❌ — Статические данные
   - Нет публичного API
   - Всегда используются данные из `platforms.ts`

## CORS и прокси

### Проблема CORS

Многие API (включая LeetCode GraphQL) блокируют прямые запросы из браузера из-за CORS политики:

```
Access to fetch at 'https://leetcode.com/graphql' from origin 'http://localhost:4321' 
has been blocked by CORS policy
```

### Решение

Используются **публичные CORS-friendly прокси**:

- **LeetCode**: `leetcode-api-faisalshohag.vercel.app` — REST API обертка над LeetCode GraphQL
- **TryHackMe**: `tryhackme.com/api/v2/badges/public-profile` — официальный endpoint без CORS ограничений

## Архитектура

```
Browser (User visits page)
  ↓
PlatformList.tsx (React component)
  ↓ useEffect()
fetchPlatformData() (platformApiClient.ts)
  ↓
  ├─ LeetCode: fetch('https://leetcode-api-faisalshohag.vercel.app/alexcipher')
  ├─ TryHackMe: fetch('https://tryhackme.com/api/v2/badges/public-profile?userPublicId=alexcipher')
  ├─ Root Me: return null → fallback to static
  └─ Hack The Box: return null → fallback to static
  ↓
PlatformCard shows dynamic OR static data
```

## Проверка в браузере

Откройте **DevTools → Network tab**, затем перезагрузите страницу `/platforms/`:

### ✅ Что вы увидите:

1. **LeetCode API запрос**:
   ```
   Request: GET https://leetcode-api-faisalshohag.vercel.app/alexcipher
   Status: 200 OK
   Response: { totalSolved: 456, ranking: 12345, ... }
   ```

2. **TryHackMe API запрос**:
   ```
   Request: GET https://tryhackme.com/api/v2/badges/public-profile?userPublicId=alexcipher
   Status: 200 OK
   Response: { success: true, userRank: 5000, ... }
   ```

3. **Root Me & Hack The Box**: нет запросов (используются статические данные)

## Производительность

- Запросы выполняются параллельно (`Promise.all`)
- Loading state отображается во время загрузки
- Timeout обрабатывается автоматически
- При ошибке → fallback на статические данные

## Обновление данных

Данные обновляются **при каждой перезагрузке страницы** (client-side fetch).

## Альтернативные API

Если текущие прокси перестанут работать:

### LeetCode альтернативы:
- `https://alfa-leetcode-api.onrender.com/{username}`
- `https://leetcode-stats-api.herokuapp.com/{username}`

### TryHackMe альтернативы:
- Scraping публичного профиля (не рекомендуется)
- Использовать только статику

## Добавление новых платформ

Чтобы добавить динамическую загрузку для других платформ:

1. Найди CORS-friendly API или прокси
2. Добавь функцию в `src/utils/platformApiClient.ts`
3. Добавь case в `fetchPlatformData()`
4. Данные из `platforms.ts` будут fallback

Пример:
```typescript
export const fetchRootMeStats = async (username: string, lang: 'en' | 'ru'): Promise<DynamicPlatformData | null> => {
  try {
    const response = await fetch(`https://api.root-me.org/auteurs/${username}`);
    // ... обработка
  } catch {
    return null; // fallback на статику
  }
};
```
