---
title: "Go · Interfaces — утиная типизация без implements"
description: "В Go нет явного implements — тип реализует интерфейс автоматически, если у него есть нужные методы. Разбираю как работает утиная типизация, pointer receiver vs value receiver, и почему маленькие интерфейсы — это идиоматичный Go."
publishedAt: 2026-04-11
tags: ["go", "best-practices"]
---

В Go нет ключевого слова `implements`. Тип не объявляет что реализует интерфейс — компилятор проверяет это сам в момент использования. Следствие: тип и интерфейс могут находиться в разных пакетах, которые не знают друг о друге — и всё равно быть совместимы.

## Зачем это нужно

В TypeScript структурная типизация тоже работает неявно, но принято писать `implements` явно:

```typescript
interface Shape {
  area(): number
}

class Circle implements Shape { // явная связь
  area() { return Math.PI * this.r * this.r }
}
```

В Go ключевого слова `implements` нет. Если у типа есть метод `Area() float64` — он автоматически реализует любой интерфейс с этим методом. Это позволяет определять интерфейсы на стороне потребителя: пакет A не знает ничего о пакете B, но пакет B может принять тип из пакета A, если методы совпадают.

## Как это устроено

```go
type Shape interface {
    Area() float64
    Perimeter() float64
}

type Circle struct {
    Radius float64
}

// Circle нигде не объявляет "я реализую Shape"
func (c Circle) Area() float64      { return math.Pi * c.Radius * c.Radius }
func (c Circle) Perimeter() float64 { return 2 * math.Pi * c.Radius }
```

Компилятор проверяет соответствие при присвоении `var s Shape = Circle{}` — если методов не хватает, ошибка компиляции с чётким указанием что именно отсутствует.

Стандартная библиотека Go построена на маленьких однометодных интерфейсах:

```go
type Stringer interface { String() string }
type Reader  interface { Read(p []byte) (n int, err error) }
type Writer  interface { Write(p []byte) (n int, err error) }
```

`fmt.Println` проверяет: если аргумент реализует `Stringer` — вызовет `String()`. Никакого наследования. Любой тип с методом `Error() string` автоматически реализует встроенный `error` — это не совпадение, это архитектурный принцип.

## Как использовать

```go
type Scanner interface {
    Scan(target string) []string
}

type PortScanner struct{ Timeout time.Duration }
type DirScanner  struct{ Wordlist string }

func (s PortScanner) Scan(target string) []string {
    return []string{"80", "443"}
}

func (s DirScanner) Scan(target string) []string {
    return []string{"/admin", "/login"}
}

func runAll(scanners []Scanner, target string) {
    for _, s := range scanners {
        fmt.Printf("%T: %v\n", s, s.Scan(target))
    }
}
```

`runAll` принимает интерфейс — не знает о конкретных типах, только о методе `Scan`. Добавить новый тип сканера не требует изменений в `runAll`. Определяй интерфейс там где он используется, а не там где реализуется — это принцип Go.

## Подводные камни

**Pointer receiver реализует интерфейс только для `*T`:**

```go
type Animal interface{ Sound() string }
type Dog struct{ Name string }

func (d *Dog) Sound() string { return "Woof" } // pointer receiver

// ❌ Dog не реализует Animal — только *Dog реализует
var a Animal = Dog{Name: "Rex"}  // ошибка компиляции

// ✅ используй указатель
var a Animal = &Dog{Name: "Rex"}
```

Value receiver — наоборот, доступен и для `T` и для `*T`. Правило: если хоть один метод с pointer receiver — везде передавай указатель.

**Интерфейс не `nil`, если в нём лежит nil-указатель:**

```go
var p *Dog = nil
var a Animal = p

fmt.Println(a == nil) // false! интерфейс содержит тип (*Dog) + nil-значение
```

Интерфейс равен `nil` только когда оба компонента — тип и значение — равны `nil`. Одна из самых неожиданных ловушек Go.

**`interface{}` теряет типобезопасность:**

```go
// ❌ принимает всё — компилятор перестаёт помогать
func process(v interface{}) { ... }

// ✅ конкретный интерфейс с методами — или дженерики (Go 1.18+)
func process[T Stringer](v T) { ... }
```

`interface{}` (он же `any`) полезен для generic-контейнеров, в прикладном коде предпочитай конкретные интерфейсы.

## Лучшие практики

- **Принимай интерфейсы, возвращай конкретные типы.** Параметры функции — интерфейсы для гибкости. Возвращаемые значения — конкретные типы для ясности.
- **Определяй интерфейс на стороне потребителя.** Пакет, который использует тип, определяет нужный ему интерфейс — не пакет-поставщик.
- **1-2 метода максимум.** Большой интерфейс сложно реализовать и мокировать. `io.Reader` — эталон.
- **Проверяй соответствие явно:** `var _ Shape = Circle{}` — строка компилируется только если Circle реализует Shape. Добавь в тест или рядом с определением типа.

## Итого

- **Нет `implements`** — тип реализует интерфейс автоматически по методам. Компилятор проверяет при использовании.
- **Маленькие интерфейсы** — идиоматичный Go: 1-2 метода, легко реализовать, легко мокировать в тестах.
- **Pointer receiver только для `*T`** — если метод с `*Dog`, передавай `&Dog{}`, не `Dog{}`.
- **`interface{nil-ptr} != nil`** — интерфейс с типом внутри не равен nil, даже если значение nil.
- Дальше: `io.Reader/Writer` как основа стандартной библиотеки, embedding интерфейсов, дженерики (Go 1.18+).

## Документация

- [go.dev/ref/spec#Interface_types](https://go.dev/ref/spec#Interface_types) — спецификация: типы интерфейсов в Go
- [go.dev/doc/effective_go#interfaces](https://go.dev/doc/effective_go#interfaces) — Effective Go: интерфейсы и методы
- [pkg.go.dev/fmt#Stringer](https://pkg.go.dev/fmt#Stringer) — интерфейс Stringer из пакета fmt
- [pkg.go.dev/io](https://pkg.go.dev/io) — пакет io: Reader, Writer — эталон однометодных интерфейсов
