# 🚀 Portfolio & Resume — Frontend Developer

Современное портфолио и резюме, созданное с использованием **Astro**, **React**, и **TailwindCSS**.

**Live Demo:** [https://drozdovdn.github.io](https://drozdovdn.github.io)

## 📋 О проекте

Это персональное портфолио-сайт с резюме, демонстрирующее опыт, навыки и достижения frontend-разработчика. Проект построен на современных технологиях с акцентом на производительность и доступность.

### Основные возможности

- ✅ **Статическая генерация** — мгновенная загрузка страниц
- ✅ **React Islands** — интерактивность только там, где нужна
- ✅ **Тёмная/светлая тема** — переключение без мерцания
- ✅ **Блог с Markdown** — статьи о разработке
- ✅ **Интеграция с платформами** — LeetCode, Codewars, GitHub
- ✅ **Адаптивный дизайн** — работает на всех устройствах
- ✅ **SEO-оптимизация** — правильная мета-информация
- ✅ **Доступность (a11y)** — семантическая разметка, клавиатурная навигация

## 🛠 Технологии

- **[Astro 5](https://astro.build)** — фреймворк для статических сайтов
- **[React 18](https://react.dev)** — интерактивные компоненты
- **[TailwindCSS 4](https://tailwindcss.com)** — utility-first CSS
- **[TypeScript](https://www.typescriptlang.org)** — типизация
- **GitHub Pages** — деплой и хостинг
- **GitHub Actions** — CI/CD

## 📂 Структура проекта

```text
/
├── .github/
│   └── workflows/
│       └── deploy.yml        # GitHub Actions для деплоя
├── public/
│   ├── favicon.svg
│   └── .nojekyll             # Отключение Jekyll
├── src/
│   ├── components/
│   │   ├── layout/           # Header, Footer, Navigation
│   │   └── ui/               # Переиспользуемые UI компоненты
│   ├── content/
│   │   └── blog/             # Markdown статьи для блога
│   ├── data/                 # Данные (опыт, навыки, платформы)
│   ├── layouts/
│   │   └── BaseLayout.astro  # Основной layout
│   ├── pages/                # Страницы сайта
│   │   ├── index.astro       # Главная
│   │   ├── experience.astro  # Опыт работы
│   │   ├── skills.astro      # Навыки
│   │   ├── education.astro   # Образование
│   │   ├── platforms.astro   # Платформы (LeetCode, etc.)
│   │   ├── learning.astro    # Обучение
│   │   ├── contact.astro     # Контакты
│   │   └── blog/
│   │       ├── index.astro
│   │       ├── [slug].astro
│   │       └── tag/[tag].astro
│   └── styles/
│       └── global.css        # Глобальные стили и CSS-переменные
├── astro.config.mjs          # Конфигурация Astro
├── package.json
└── tsconfig.json
```

## 🚀 Локальный запуск

### Требования

- Node.js 20+ 
- npm 10+

### Установка и запуск

```bash
# Клонирование репозитория
git clone https://github.com/drozdovdn/drozdovdn.github.io.git
cd drozdovdn.github.io

# Установка зависимостей
npm install

# Запуск dev-сервера
npm run dev
```

Сайт будет доступен по адресу: `http://localhost:4321`

## 📦 Команды

| Команда            | Действие                                         |
|:-------------------|:-------------------------------------------------|
| `npm install`      | Установка зависимостей                           |
| `npm run dev`      | Запуск dev-сервера на `localhost:4321`           |
| `npm run build`    | Сборка production-версии в `./dist/`             |
| `npm run preview`  | Предпросмотр production-сборки локально          |
| `npm run astro`    | Запуск Astro CLI команд                          |

## 🌐 Деплой

Проект автоматически деплоится на GitHub Pages при пуше в ветку `main` через GitHub Actions.

### Настройка деплоя для вашего проекта

1. **Форкните репозиторий**
2. **Обновите `astro.config.mjs`:**
   ```javascript
   export default defineConfig({
     site: 'https://ваш-username.github.io',
     // Если репозиторий НЕ username.github.io, добавьте:
     // base: '/название-репозитория',
   });
   ```
3. **Настройте GitHub Pages:**
   - `Settings` → `Pages`
   - Source: **GitHub Actions**
4. **Запушьте изменения:**
   ```bash
   git add .
   git commit -m "Update site URL"
   git push
   ```

## 🎨 Кастомизация

### Изменение данных

- **Опыт работы:** `src/data/experience.ts`
- **Навыки:** `src/data/skills.ts`
- **Образование:** `src/data/education.ts`
- **Платформы:** `src/data/platforms.ts`

### Изменение темы

Цветовая схема настраивается через CSS-переменные в `src/styles/global.css`:

```css
:root {
  --color-bg-primary: ...
  --color-text-primary: ...
  --color-accent: ...
}
```

### Добавление статей в блог

Создайте `.md` файл в `src/content/blog/`:

```markdown
---
title: "Заголовок статьи"
description: "Описание"
pubDate: 2026-02-13
tags: ["typescript", "frontend"]
---

Содержимое статьи...
```

## 📝 Лицензия

MIT License — свободно используйте для своего портфолио.

## 🤝 Контакты

- **GitHub:** [@drozdovdn](https://github.com/drozdovdn)
- **LeetCode:** [drozdovdn](https://leetcode.com/drozdovdn)
- **Codewars:** [drozdovdn](https://www.codewars.com/users/drozdovdn)

---

Сделано с ❤️ на **Astro** + **React** + **TailwindCSS**
