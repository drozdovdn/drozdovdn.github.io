---
title: "TypeScript: Conditional Types для продвинутых разработчиков"
description: "Изучаем условные типы в TypeScript — мощный инструмент для создания гибких и безопасных API."
publishedAt: 2024-02-01
tags: ["typescript", "types", "advanced"]
---

Условные типы (Conditional Types) — одна из самых мощных фич TypeScript, которая позволяет создавать типы, зависящие от условий. Разберём, как их использовать на практике.

## Базовый синтаксис

Условные типы работают как тернарный оператор:

```typescript
T extends U ? X : Y
```

Если тип `T` можно присвоить типу `U`, то результат — `X`, иначе — `Y`.

## Простой пример

```typescript
type IsString<T> = T extends string ? true : false;

type A = IsString<string>;  // true
type B = IsString<number>;  // false
type C = IsString<"hello">; // true (строковый литерал)
```

## Практический пример: Безопасный API

Представим API, где метод возвращает разные типы в зависимости от параметра:

```typescript
type ApiResponse<T extends 'user' | 'post'> = 
  T extends 'user' 
    ? { id: number; name: string; email: string }
    : { id: number; title: string; content: string };

function fetchData<T extends 'user' | 'post'>(
  type: T
): ApiResponse<T> {
  if (type === 'user') {
    return {
      id: 1,
      name: 'John',
      email: 'john@example.com'
    } as ApiResponse<T>;
  }
  
  return {
    id: 1,
    title: 'Post title',
    content: 'Content here'
  } as ApiResponse<T>;
}

// TypeScript знает точный тип!
const user = fetchData('user');   // { id, name, email }
const post = fetchData('post');   // { id, title, content }

console.log(user.name);   // ✅ OK
console.log(user.title);  // ❌ Error: Property 'title' does not exist
```

## Встроенные условные типы

TypeScript предоставляет полезные встроенные условные типы:

### Exclude — исключить типы

```typescript
type T1 = Exclude<'a' | 'b' | 'c', 'a'>;  // 'b' | 'c'
type T2 = Exclude<string | number, string>; // number
```

### Extract — извлечь типы

```typescript
type T1 = Extract<'a' | 'b' | 'c', 'a' | 'b'>;  // 'a' | 'b'
type T2 = Extract<string | number, number>;     // number
```

### NonNullable — убрать null и undefined

```typescript
type T1 = NonNullable<string | null | undefined>;  // string
```

## Продвинутый пример: Generic Form Handler

Создадим типобезопасный обработчик форм:

```typescript
type FormField = {
  type: 'text' | 'number' | 'email' | 'checkbox';
  value: string | number | boolean;
};

// Условный тип для определения типа значения по типу поля
type FieldValue<T extends FormField['type']> =
  T extends 'text' ? string :
  T extends 'email' ? string :
  T extends 'number' ? number :
  T extends 'checkbox' ? boolean :
  never;

// Типобезопасная функция для получения значения
function getFieldValue<T extends FormField['type']>(
  type: T,
  rawValue: string
): FieldValue<T> {
  if (type === 'number') {
    return Number(rawValue) as FieldValue<T>;
  }
  if (type === 'checkbox') {
    return (rawValue === 'true') as FieldValue<T>;
  }
  return rawValue as FieldValue<T>;
}

const textValue = getFieldValue('text', 'Hello');      // string
const numberValue = getFieldValue('number', '42');     // number
const checkValue = getFieldValue('checkbox', 'true');  // boolean
```

## Infer — выведение типов

Ключевое слово `infer` позволяет извлекать типы из других типов:

```typescript
// Извлечь тип возвращаемого значения функции
type ReturnType<T> = T extends (...args: any[]) => infer R ? R : never;

function getUser() {
  return { id: 1, name: 'John' };
}

type User = ReturnType<typeof getUser>;  // { id: number; name: string }

// Извлечь тип элемента массива
type ArrayElement<T> = T extends (infer U)[] ? U : never;

type Numbers = ArrayElement<number[]>;  // number
type Strings = ArrayElement<string[]>;  // string
```

## Распределённые условные типы

Условные типы автоматически распределяются по union-типам:

```typescript
type ToArray<T> = T extends any ? T[] : never;

type A = ToArray<string | number>;  
// string[] | number[] (не (string | number)[])
```

## Реальный кейс: API Client с type safety

```typescript
interface Endpoints {
  '/users': { id: number; name: string }[];
  '/posts': { id: number; title: string }[];
  '/user/:id': { id: number; name: string; email: string };
}

type ApiClient = {
  [K in keyof Endpoints]: (
    params?: K extends `/user/${string}` ? { id: number } : never
  ) => Promise<Endpoints[K]>;
};

const api: ApiClient = {
  '/users': async () => {
    return [{ id: 1, name: 'John' }];
  },
  '/posts': async () => {
    return [{ id: 1, title: 'Post' }];
  },
  '/user/:id': async (params) => {
    // params.id типизирован!
    return { id: params.id, name: 'John', email: 'john@test.com' };
  },
};

// Использование
const users = await api['/users']();          // { id, name }[]
const user = await api['/user/:id']({ id: 1 }); // { id, name, email }
```

## Ключевые моменты

1. **Условные типы** = `T extends U ? X : Y`
2. **infer** позволяет извлекать типы
3. **Распределение** работает автоматически для union-типов
4. Используйте встроенные утилиты: `Exclude`, `Extract`, `NonNullable`
5. Применяйте для создания type-safe API

Условные типы делают TypeScript по-настоящему мощным инструментом для создания безопасного и гибкого кода!
