---
title: "Go · Errors — if err != nil: почему ошибка — это значение, а не исключение"
description: "Go отказался от исключений в пользу ошибок-значений. Разбираю дизайнерское решение, механику wrapping и типичные ловушки, на которые попадают разработчики из JS/TS."
publishedAt: 2026-04-11
tags: ["go", "best-practices"]
---

В Go нет `try/catch`. За этим решением стоит конкретная философия: ошибка должна быть явной частью сигнатуры функции, а не событием, которое можно случайно не поймать. `if err != nil` — не многословность, а сделка: компилятор гарантирует, что ты принял решение по каждой ошибке.

## Зачем это нужно

В большинстве языков ошибка — это событие, которое прерывает нормальный поток. В Python и JS можно бросить исключение где угодно, поймать где удобно, а между ними — ничего не делать. Молчаливо проглоченная ошибка в `Promise` или незакрытый `catch` — распространённый источник багов.

В Go `error` — обычный интерфейс:

```go
type error interface {
    Error() string
}
```

Функция возвращает `(result, error)`, вызывающий код обязан принять решение. Ошибка становится частью контракта, а не скрытым побочным эффектом.

## Как это устроено

**Базовая ошибка** — `errors.New` или `fmt.Errorf` с `%v`:

```go
func divide(a, b float64) (float64, error) {
    if b == 0 {
        return 0, errors.New("division by zero")
    }
    return a / b, nil
}
```

**Sentinel-ошибка** — именованное значение для сравнения через `errors.Is`:

```go
var ErrNotFound = errors.New("not found")
```

Sentinel нужен когда вызывающий код должен реагировать на конкретный тип ошибки, а не просто её наличие.

**Кастомный тип** — структура с данными, нужна для `errors.As`:

```go
type PermissionError struct {
    User   string
    Action string
}

func (e *PermissionError) Error() string {
    return fmt.Sprintf("permission denied: %s cannot %s", e.User, e.Action)
}
```

Кастомный тип — когда в ошибке есть поля которые вызывающий код должен прочитать.

## Как использовать

```go
var ErrNotFound = errors.New("not found")

func getFile(user, filename string) (string, error) {
    if filename == "secret.txt" && user != "admin" {
        return "", &PermissionError{User: user, Action: "read secret.txt"}
    }
    if filename == "missing.txt" {
        return "", fmt.Errorf("getFile %s: %w", filename, ErrNotFound)
    }
    return "content of " + filename, nil
}

// errors.As — распаковать тип и прочитать поля
_, err := getFile("user", "secret.txt")
var permErr *PermissionError
if errors.As(err, &permErr) {
    fmt.Println("нет доступа:", permErr.User, "→", permErr.Action)
}

// errors.Is — найти sentinel в цепочке обёрток
_, err = getFile("admin", "missing.txt")
if errors.Is(err, ErrNotFound) {
    fmt.Println("файл не найден:", err)
}
```

`errors.As` и `errors.Is` работают через всю цепочку `%w`-обёрток — можно оборачивать ошибку с контекстом на каждом уровне стека и при этом точно проверять тип наверху, без парсинга строк.

## Подводные камни

**`%v` вместо `%w` при wrapping — цепочка потеряна:**

```go
// ❌ errors.Is вернёт false — ErrNotFound потеряна в строке
return fmt.Errorf("getFile %s: %v", filename, ErrNotFound)

// ✅ errors.Is найдёт ErrNotFound через любую глубину обёрток
return fmt.Errorf("getFile %s: %w", filename, ErrNotFound)
```

Внешне строки выглядят одинаково. `%w` оборачивает оригинальную ошибку внутрь, `%v` — просто подставляет строку.

**Забыть `return` после обработки ошибки:**

```go
// ❌ программа продолжит выполнение с нулевым result
result, err := divide(10, 0)
if err != nil {
    fmt.Println("ошибка:", err)
    // return забыли
}
fmt.Println(result) // выводит 0

// ✅
if err != nil {
    return err
}
```

Go не останавливает выполнение при ошибке — только явный `return`.

**`== ErrNotFound` вместо `errors.Is`:**

```go
// ❌ не найдёт ErrNotFound если она обёрнута через %w
if err == ErrNotFound { ... }

// ✅ проходит через всю цепочку обёрток
if errors.Is(err, ErrNotFound) { ... }
```

## Лучшие практики

- **`%w`, не `%v`** — всегда при wrapping. Разница не видна в строке, но критична для `errors.Is/As`.
- **Sentinel с префиксом `Err`** — `ErrNotFound`, `ErrTimeout`. Это соглашение стандартной библиотеки Go.
- **Добавляй контекст при каждой обёртке** — `"getFile missing.txt: not found"` точнее чем просто `"not found"`. Контекст помогает найти источник в логах.
- **Sentinel для ветвления, тип для данных** — `errors.Is` когда нужно реагировать на случай; `errors.As` когда нужны поля ошибки.

## Итого

- **Ошибка — контракт** — `(result, error)` в сигнатуре. Нет скрытых исключений, нет неожиданных прерываний потока.
- **`%w` сохраняет цепочку** — `errors.Is/As` проходят через все обёртки. `%v` — только строка, цепочка теряется.
- **`errors.Is` вместо `==`** — прямое сравнение не видит обёрнутые ошибки.
- **`return` обязателен** — Go не останавливает выполнение при ошибке, только ты сам.
- Дальше: кастомный тип с `Unwrap() error` для многоуровневых цепочек, `errors.Join` (Go 1.20) для объединения нескольких ошибок.

## Документация

- [pkg.go.dev/errors](https://pkg.go.dev/errors) — пакет errors: New, Is, As, Unwrap
- [go.dev/blog/go1.13-errors](https://go.dev/blog/go1.13-errors) — Go 1.13: wrapping с %w, errors.Is и errors.As
- [go.dev/blog/error-handling-and-go](https://go.dev/blog/error-handling-and-go) — Go Blog: философия обработки ошибок
