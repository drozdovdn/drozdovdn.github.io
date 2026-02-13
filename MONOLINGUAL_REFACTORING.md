# Refactoring: Переход на монолингвальный режим (только русский язык)

## Выполненные изменения

### 1. Конфигурация Astro
- ✅ Удалена i18n конфигурация из `astro.config.mjs`
- ✅ Убраны настройки `defaultLocale`, `locales`, `routing`

### 2. Структура данных
- ✅ Упрощены типы в `src/data/`:
  - `personal.ts` - `role` теперь просто `string`
  - `experience.ts` - `role` и `description` без `Record<Lang, ...>`
  - `education.ts` - `degree` и `description` без `Record<Lang, ...>`
  - `platforms.ts` - `rank` и `stats` без `Record<Lang, ...>`
- ✅ Все данные теперь на русском языке

### 3. Удаление i18n системы
- ✅ Удалена папка `src/i18n/` (ui.ts, utils.ts)
- ✅ Удалены все импорты `getLangFromUrl`, `t`, `getLocalizedPath`, `switchLangPath`

### 4. Структура страниц
- ✅ Удалены папки `src/pages/en/` и `src/pages/ru/`
- ✅ Все страницы перенесены в корень `src/pages/`:
  - `index.astro`
  - `experience.astro`
  - `skills.astro`
  - `contact.astro`
  - `education.astro`
  - `platforms.astro`
  - `blog/index.astro`
  - `blog/[slug].astro`

### 5. Компоненты
- ✅ **Header.astro** - удалён `<LangSwitcher />`
- ✅ **Navigation.astro** - прямые пути без i18n (`/`, `/experience/`, ...)
- ✅ **Footer.astro** - жёстко заданные русские тексты
- ✅ **LangSwitcher.astro** - полностью удалён
- ✅ **PlatformList.tsx** - убран параметр `lang`
- ✅ **BaseLayout.astro** - `lang="ru"` жёстко задан

### 6. API клиенты
- ✅ **platformApiClient.ts** - убран параметр `lang` из всех функций
- ✅ Все API возвращают только русские тексты

### 7. Контент (blog)
- ✅ Удалено поле `lang` из схемы в `content/config.ts`
- ✅ Удалено поле `lang` из frontmatter статьи `typescript-conditional-types-ru.md`
- ✅ Удалены англоязычные статьи

### 8. Все тексты
Заменены вызовы `t(lang, 'key')` на жёстко заданные русские строки:
- `'Главная'`, `'Опыт'`, `'Навыки'`, `'Платформы'`, `'Блог'`, `'Образование'`, `'Контакты'`
- Все UI тексты теперь на русском без системы переводов

## Результат

### До
- Двуязычный сайт (EN/RU)
- Маршруты: `/en/`, `/ru/`
- Переключатель языка
- i18n система с переводами

### После
- Полностью русскоязычный сайт
- Маршруты: `/`, `/experience/`, `/skills/` и т.д.
- Без переключателя языка
- Упрощённая структура данных

## Сборка
```bash
npm run build
```

Результат: **8 страниц успешно собрано** 🎉

## Проверка
Все страницы работают корректно:
- `/` - главная
- `/experience/` - опыт работы
- `/skills/` - навыки
- `/platforms/` - платформы
- `/education/` - образование
- `/contact/` - контакты
- `/blog/` - список статей
- `/blog/typescript-conditional-types-ru/` - статья
