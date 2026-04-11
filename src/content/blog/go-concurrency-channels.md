---
title: "Go · Concurrency — Каналы: типобезопасная очередь с точкой синхронизации"
description: "Канал — встроенный примитив Go для передачи данных между горутинами. Разбираю буферизованные и небуферизованные каналы, worker pool и главное правило: кто пишет — тот и закрывает."
publishedAt: 2026-04-11
tags: ["go", "concurrency"]
---

В Go нет колбэков, EventEmitter или async-генераторов для передачи данных между параллельными потоками. Вместо этого — канал, примитив встроенный в язык. Небуферизованный канал работает не как очередь, а как точка синхронизации — и незнание этого отличия ведёт к дедлокам.

## Зачем это нужно

В JS асинхронные операции обмениваются данными через shared state: одна Promise записывает результат в переменную, другая читает. При нескольких потоках shared state требует мьютексов — источника ошибок.

Go предлагает другой принцип: передавай данные через каналы, а не разделяй их. Философия CSP (Communicating Sequential Processes) — горутины обмениваются сообщениями, а не обращаются к одной памяти. Результат: меньше мьютексов, явные точки взаимодействия, читаемый поток данных.

## Как это устроено

Два режима работы — два принципиально разных примитива:

**Небуферизованный (рандеву)** — отправитель и получатель должны быть готовы одновременно:

```mermaid
graph LR
  S([Sender]):::accent -->|блокируется до готовности| CH[" "]
  CH -->|блокируется до готовности| R([Receiver]):::accent
  classDef accent fill:#1a1a1a,stroke:#e8622c,color:#e5e5e5
```

**Буферизованный (cap=3)** — отправитель не блокируется пока буфер не полон:

```mermaid
graph LR
  S([Sender]):::accent -->|не блокирует пока есть место| BUF["[ 1 | 2 | 3 ]"]
  BUF -->|не блокирует пока буфер не пуст| R([Receiver]):::accent
  classDef accent fill:#1a1a1a,stroke:#e8622c,color:#e5e5e5
```

```go
ch := make(chan int)    // небуферизованный
ch := make(chan int, 3) // буферизованный, cap=3
```

Направленные каналы ограничивают операции — явная документация намерений в сигнатуре:

```go
func produce(out chan<- int) { // только запись
    out <- 42
    close(out)
}

func consume(in <-chan int) { // только чтение
    for v := range in {      // range завершится при close(in)
        fmt.Println(v)
    }
}
```

`range ch` читает из канала пока он не закрыт. Без `close` — зависнет навсегда.

## Как использовать

**Простая передача значения между горутинами:**

```go
ch := make(chan int)

go func() {
    ch <- compute()
}()

result := <-ch
```

Небуферизованный канал здесь гарантирует синхронизацию: основной поток ждёт пока горутина не отправит результат.

**Worker pool — N горутин читают задачи из одного канала:**

```go
func workerPool(ports []int, host string, workers int) []int {
    jobs    := make(chan int, len(ports))
    results := make(chan int, len(ports))
    var wg sync.WaitGroup

    for i := 0; i < workers; i++ {
        wg.Add(1)
        go func() {
            defer wg.Done()
            for port := range jobs {
                if isOpen(host, port) {
                    results <- port
                }
            }
        }()
    }

    for _, p := range ports {
        jobs <- p
    }
    close(jobs) // сигнал: задач больше нет

    go func() {
        wg.Wait()
        close(results) // закрываем когда все воркеры завершились
    }()

    var open []int
    for port := range results {
        open = append(open, port)
    }
    return open
}
```

`jobs` буферизован на `len(ports)` — все задачи подаются без блокировки. Надсмотрщик ждёт всех воркеров через `wg.Wait()` и только потом закрывает `results` — это гарантирует что `range results` увидит все результаты.

**Канал-сигнал без данных:**

```go
done := make(chan struct{}) // struct{} занимает 0 байт
go func() {
    doWork()
    close(done)
}()
<-done
```

`struct{}` вместо `bool` — явный сигнал что данные не передаются, только факт завершения.

## Подводные камни

**Закрыть канал дважды — паника:**

```go
// ❌ два воркера пытаются закрыть один канал
go func() { results <- r1; close(results) }()
go func() { results <- r2; close(results) }() // паника при втором close

// ✅ один надсмотрщик ждёт всех и закрывает
go func() {
    wg.Wait()
    close(results)
}()
```

**`wg.Wait()` перед `range` — дедлок:**

```go
// ❌ ждём завершения горутин, но они ждут чтения из results — дедлок
wg.Wait()
for r := range results { ... }

// ✅ надсмотрщик запускается параллельно с range
go func() { wg.Wait(); close(results) }()
for r := range results { ... }
```

**`defer conn.Close()` до проверки ошибки:**

```go
// ❌ если err != nil, conn == nil — Close() вызовет панику
conn, err := net.Dial("tcp", addr)
defer conn.Close()
if err != nil { return }

// ✅ defer только после успешного открытия
conn, err := net.Dial("tcp", addr)
if err != nil { return }
defer conn.Close()
```

## Лучшие практики

- **Кто пишет — тот закрывает.** Читатель никогда не вызывает `close`. Нарушение → паника.
- **Буферизуй по размеру задачи, а не наугад.** `make(chan T, len(jobs))` — канал не заблокирует отправителя пока все задачи не поданы.
- **Надсмотрщик при нескольких воркерах.** Одна горутина делает `wg.Wait(); close(ch)` — воркеры не трогают `close`.
- **`chan struct{}` для сигналов.** Если данные не нужны, `struct{}` нагляднее `chan bool` и занимает 0 байт.
- **Не закрывай канал если читатель не ждёт `range`.** Закрытый канал возвращает нулевое значение немедленно — может быть неочевидный баг.

## Итого

- **Небуферизованный канал — рандеву**: оба — отправитель и получатель — блокируются до готовности друг друга. Это синхронизация, не просто очередь.
- **CSP vs shared memory**: каналы передают владение данными — передал и забыл. С мьютексами оба имеют доступ одновременно. Разный ментальный model.
- **Закрытый канал — broadcast**: `close(ch)` разблокирует всех слушателей сразу. Это основа паттерна "сигнал завершения".
- **Worker pool = jobs + results + надсмотрщик** — три компонента всегда вместе. Без надсмотрщика `results` никогда не закроется.
- Дальше: `context` для отмены воркеров по таймауту, `errgroup` для распространения ошибок из горутин.

## Документация

- [pkg.go.dev/builtin#make](https://pkg.go.dev/builtin#make) — make: создание каналов, слайсов и мап
- [go.dev/ref/spec#Channel_types](https://go.dev/ref/spec#Channel_types) — спецификация типов каналов
- [go.dev/doc/effective_go#channels](https://go.dev/doc/effective_go#channels) — Effective Go: каналы
- [go.dev/doc/effective_go#concurrency](https://go.dev/doc/effective_go#concurrency) — Effective Go: конкурентность и CSP
