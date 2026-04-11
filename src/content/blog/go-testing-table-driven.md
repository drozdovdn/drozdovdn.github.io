---
title: "Go · Testing — Table-driven tests: паттерн из стандартной библиотеки"
description: "В Go нет встроенного assert — только t.Errorf. Зато есть паттерн table-driven tests, который делает тесты читаемыми и расширяемыми. Разбираю механику, соглашения и почему это лучше, чем тесты по одному."
publishedAt: 2026-04-11
tags: ["go", "best-practices"]
---

В Go нет `describe`, `it`, `expect(...).toBe(...)` — только `t.Errorf`. Но вместо внешних фреймворков Go предлагает идиому table-driven tests: один срез структур — все входы, выходы и имена кейсов. Добавить новый случай — одна строка. Увидеть что упало — конкретное имя в выводе.

## Зачем это нужно

В JS тесты запускаются через Jest, Mocha или Vitest — внешние инструменты, `npm install` перед первым тестом. В Go `go test` встроен в язык: никакой конфигурации, никакого runner'а.

Тест — функция в файле `*_test.go` с сигнатурой `func TestXxx(t *testing.T)`. `go test` запускает её автоматически. Писать отдельную функцию на каждый входной случай многословно — table-driven tests решают это: все кейсы в одном месте, логика проверки — один раз.

## Как это устроено

```go
func TestReverse(t *testing.T) {
    tests := []struct {
        name  string
        input string
        want  string
    }{
        {"простая строка", "hello",   "olleh"},
        {"палиндром",      "racecar", "racecar"},
        {"пустая строка",  "",        ""},
        {"один символ",    "a",       "a"},
    }

    for _, tt := range tests {
        t.Run(tt.name, func(t *testing.T) {
            got := Reverse(tt.input)
            if got != tt.want {
                t.Errorf("Reverse(%q) = %q, want %q", tt.input, got, tt.want)
            }
        })
    }
}
```

`tt` — соглашение для переменной в `range tests`. `t.Run(name, func)` создаёт подтест с именем. В выводе `go test -v` видно какой конкретно случай упал:

```
--- FAIL: TestReverse/простая_строка (0.00s)
    strutil_test.go:28: Reverse("hello") = "hello", want "olleh"
```

Без `t.Run` при падении видно только `TestReverse` — непонятно на каком кейсе. С `t.Run` — точное имя.

## Как использовать

**Table-driven тест для функции, возвращающей ошибку:**

```go
func TestParsePort(t *testing.T) {
    tests := []struct {
        name    string
        input   string
        want    int
        wantErr bool
    }{
        {"валидный порт",   "80",    80,    false},
        {"максимальный",   "65535", 65535, false},
        {"ноль",           "0",     0,     true},
        {"отрицательный",  "-1",    0,     true},
        {"не число",       "abc",   0,     true},
        {"выше максимума", "99999", 0,     true},
    }

    for _, tt := range tests {
        t.Run(tt.name, func(t *testing.T) {
            got, err := ParsePort(tt.input)

            if (err != nil) != tt.wantErr {
                t.Errorf("ParsePort(%q): ошибка = %v, wantErr = %v", tt.input, err, tt.wantErr)
                return
            }
            if !tt.wantErr && got != tt.want {
                t.Errorf("ParsePort(%q) = %d, want %d", tt.input, got, tt.want)
            }
        })
    }
}
```

`wantErr bool` — стандартный способ тестировать функции с ошибками. Проверяй факт ошибки, а не текст (`err.Error()`) — сообщения меняются, факт их наличия — нет.

## Подводные камни

**`package foo` vs `package foo_test`:**

```go
// ❌ package foo — белый ящик, видит неэкспортированное
package strutil

// ✅ package foo_test — чёрный ящик, тестирует публичный API
package strutil_test
```

`foo_test` — идиоматичный выбор: тестируешь то, что видит пользователь пакета.

**Забыть `t.Run` — при падении не видно какой кейс:**

```go
// ❌ при падении сообщение без имени кейса
for _, tt := range tests {
    got := Reverse(tt.input)
    if got != tt.want {
        t.Errorf(...)
    }
}

// ✅ каждый кейс — именованный подтест
for _, tt := range tests {
    t.Run(tt.name, func(t *testing.T) { ... })
}
```

**`t.Errorf` при сбое setup — тест продолжится в невалидном состоянии:**

```go
// ❌ Errorf не останавливает тест — f == nil, следующая строка запаникует
f, err := os.Create(tmpFile)
if err != nil {
    t.Errorf("не смог создать файл: %v", err)
}
f.Write(data) // паника: f == nil

// ✅ Fatalf останавливает тест при сбое setup
f, err := os.Create(tmpFile)
if err != nil {
    t.Fatalf("не смог создать файл: %v", err)
}
```

`t.Fatalf` — для setup (создание файлов, парсинг конфига). `t.Errorf` — для обычных assert: увидишь все провалы сразу, не только первый.

## Лучшие практики

- **`tt` в `range tests`** — соглашение Go. Не изобретай `tc`, `c`, `testCase`.
- **`%q` для строк в Errorf** — форматирует в кавычках, видна разница между `"hello"` и `"hell o"`.
- **Имена кейсов — описание поведения, не входа** — `"порт выше максимума"` лучше чем `"99999"`.
- **`t.Parallel()` для независимых подтестов** — ускоряет прогон при большом числе кейсов.

## Итого

- **`go test` встроен** — никакого Jest/Mocha, тестирование из коробки с первой строки.
- **`t.Run` — обязательно** — без него при падении не видно какой кейс упал.
- **`package foo_test`** — чёрный ящик, тестирует публичный API. Предпочтительный выбор для юнит-тестов.
- **`wantErr bool`** — стандартный паттерн для функций с ошибками. Проверяй факт, не текст.
- Дальше: `testify` для assert без бойлерплейта, `httptest` для тестирования HTTP-хендлеров, фаззинг через `go test -fuzz`.

## Документация

- [pkg.go.dev/testing](https://pkg.go.dev/testing) — пакет testing: T, Run, Errorf, Fatalf, Parallel
- [go.dev/blog/subtests](https://go.dev/blog/subtests) — Go Blog: подтесты и sub-benchmarks
- [go.dev/doc/code#Testing](https://go.dev/doc/code#Testing) — How to Write Go Code: тестирование пакетов
