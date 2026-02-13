---
title: "SOLID принципы в TypeScript: Практическое руководство"
description: "Разбираем все 5 SOLID принципов на практических примерах TypeScript. От теории к реальному коду."
publishedAt: 2024-03-15
tags: ["architecture", "typescript", "solid", "best-practices"]
---

SOLID — это акроним из 5 принципов объектно-ориентированного программирования, которые помогают создавать поддерживаемый и масштабируемый код.

## S — Single Responsibility Principle (SRP)

**Принцип единственной ответственности**: класс должен иметь только одну причину для изменения.

### ❌ Нарушение SRP

```typescript
class User {
  constructor(public name: string, public email: string) {}
  
  // Сохранение в БД
  save() {
    const db = Database.connect();
    db.insert('users', this);
  }
  
  // Отправка email
  sendWelcomeEmail() {
    const mailer = new Mailer();
    mailer.send(this.email, 'Welcome!');
  }
  
  // Валидация
  validate() {
    if (!this.email.includes('@')) {
      throw new Error('Invalid email');
    }
  }
}
```

**Проблема**: класс User отвечает за 3 вещи — данные, БД, email, валидацию.

### ✅ Соблюдение SRP

```typescript
// Только данные
class User {
  constructor(public name: string, public email: string) {}
}

// Только работа с БД
class UserRepository {
  save(user: User) {
    const db = Database.connect();
    db.insert('users', user);
  }
}

// Только email
class EmailService {
  sendWelcomeEmail(user: User) {
    const mailer = new Mailer();
    mailer.send(user.email, 'Welcome!');
  }
}

// Только валидация
class UserValidator {
  validate(user: User) {
    if (!user.email.includes('@')) {
      throw new Error('Invalid email');
    }
  }
}
```

## O — Open/Closed Principle (OCP)

**Принцип открытости/закрытости**: код должен быть открыт для расширения, но закрыт для модификации.

### ❌ Нарушение OCP

```typescript
class DiscountCalculator {
  calculate(customerType: string, amount: number): number {
    if (customerType === 'regular') {
      return amount * 0.05;
    } else if (customerType === 'premium') {
      return amount * 0.1;
    } else if (customerType === 'vip') {
      return amount * 0.2;
    }
    return 0;
  }
}
```

**Проблема**: для добавления нового типа клиента нужно модифицировать класс.

### ✅ Соблюдение OCP

```typescript
interface DiscountStrategy {
  calculate(amount: number): number;
}

class RegularDiscount implements DiscountStrategy {
  calculate(amount: number) {
    return amount * 0.05;
  }
}

class PremiumDiscount implements DiscountStrategy {
  calculate(amount: number) {
    return amount * 0.1;
  }
}

class VIPDiscount implements DiscountStrategy {
  calculate(amount: number) {
    return amount * 0.2;
  }
}

class DiscountCalculator {
  constructor(private strategy: DiscountStrategy) {}
  
  calculate(amount: number): number {
    return this.strategy.calculate(amount);
  }
}

// Использование
const calculator = new DiscountCalculator(new PremiumDiscount());
const discount = calculator.calculate(1000); // 100
```

## L — Liskov Substitution Principle (LSP)

**Принцип подстановки Барбары Лисков**: объекты подклассов должны вести себя как объекты суперкласса.

### ❌ Нарушение LSP

```typescript
class Bird {
  fly() {
    console.log('Flying...');
  }
}

class Penguin extends Bird {
  fly() {
    throw new Error('Penguins cannot fly!');
  }
}

function makeBirdFly(bird: Bird) {
  bird.fly(); // Упадёт для пингвина!
}
```

### ✅ Соблюдение LSP

```typescript
interface Bird {
  move(): void;
}

class FlyingBird implements Bird {
  move() {
    this.fly();
  }
  
  private fly() {
    console.log('Flying...');
  }
}

class Penguin implements Bird {
  move() {
    this.swim();
  }
  
  private swim() {
    console.log('Swimming...');
  }
}

function moveBird(bird: Bird) {
  bird.move(); // Работает для всех
}
```

## I — Interface Segregation Principle (ISP)

**Принцип разделения интерфейса**: клиенты не должны зависеть от интерфейсов, которые не используют.

### ❌ Нарушение ISP

```typescript
interface Worker {
  work(): void;
  eat(): void;
  sleep(): void;
}

class HumanWorker implements Worker {
  work() { console.log('Working...'); }
  eat() { console.log('Eating...'); }
  sleep() { console.log('Sleeping...'); }
}

class RobotWorker implements Worker {
  work() { console.log('Working...'); }
  eat() { throw new Error('Robots do not eat!'); }
  sleep() { throw new Error('Robots do not sleep!'); }
}
```

### ✅ Соблюдение ISP

```typescript
interface Workable {
  work(): void;
}

interface Eatable {
  eat(): void;
}

interface Sleepable {
  sleep(): void;
}

class HumanWorker implements Workable, Eatable, Sleepable {
  work() { console.log('Working...'); }
  eat() { console.log('Eating...'); }
  sleep() { console.log('Sleeping...'); }
}

class RobotWorker implements Workable {
  work() { console.log('Working...'); }
}
```

## D — Dependency Inversion Principle (DIP)

**Принцип инверсии зависимостей**: зависьте от абстракций, а не от конкретных реализаций.

### ❌ Нарушение DIP

```typescript
class MySQLDatabase {
  save(data: any) {
    console.log('Saving to MySQL...');
  }
}

class UserService {
  private db = new MySQLDatabase(); // Жёсткая зависимость!
  
  saveUser(user: User) {
    this.db.save(user);
  }
}
```

**Проблема**: нельзя заменить MySQL на PostgreSQL без изменения UserService.

### ✅ Соблюдение DIP

```typescript
interface Database {
  save(data: any): void;
}

class MySQLDatabase implements Database {
  save(data: any) {
    console.log('Saving to MySQL...');
  }
}

class PostgreSQLDatabase implements Database {
  save(data: any) {
    console.log('Saving to PostgreSQL...');
  }
}

class UserService {
  constructor(private db: Database) {} // Зависимость от абстракции
  
  saveUser(user: User) {
    this.db.save(user);
  }
}

// Использование
const mysqlDB = new MySQLDatabase();
const userService = new UserService(mysqlDB);

// Легко заменить на PostgreSQL
const postgresDB = new PostgreSQLDatabase();
const userService2 = new UserService(postgresDB);
```

## Реальный пример: Система оплаты

```typescript
// Абстракция
interface PaymentProcessor {
  processPayment(amount: number): Promise<boolean>;
}

// Конкретные реализации
class StripePayment implements PaymentProcessor {
  async processPayment(amount: number) {
    console.log(`Processing ${amount} via Stripe`);
    return true;
  }
}

class PayPalPayment implements PaymentProcessor {
  async processPayment(amount: number) {
    console.log(`Processing ${amount} via PayPal`);
    return true;
  }
}

// Сервис зависит от абстракции (DIP)
class OrderService {
  constructor(private paymentProcessor: PaymentProcessor) {}
  
  async checkout(amount: number) {
    const success = await this.paymentProcessor.processPayment(amount);
    if (success) {
      console.log('Order completed!');
    }
  }
}

// Легко менять провайдера
const stripeOrder = new OrderService(new StripePayment());
const paypalOrder = new OrderService(new PayPalPayment());
```

## SOLID в React

```typescript
// SRP: компонент только для отображения
const UserCard = ({ user }: { user: User }) => (
  <div className="card">
    <h2>{user.name}</h2>
    <p>{user.email}</p>
  </div>
);

// SRP: хук только для логики
function useUserData(userId: string) {
  const [user, setUser] = useState<User | null>(null);
  
  useEffect(() => {
    fetchUser(userId).then(setUser);
  }, [userId]);
  
  return user;
}

// OCP: расширяем через props, не модифицируем
const Button = ({ variant = 'primary', children }: ButtonProps) => (
  <button className={`btn btn-${variant}`}>
    {children}
  </button>
);
```

## Ключевые моменты

1. **SRP** — один класс = одна ответственность
2. **OCP** — расширяйте, не модифицируйте
3. **LSP** — подклассы должны работать как суперклассы
4. **ISP** — разделяйте большие интерфейсы
5. **DIP** — зависьте от абстракций, не от реализаций

SOLID делает код:
- ✅ Легче тестировать
- ✅ Проще понимать
- ✅ Удобнее расширять
- ✅ Меньше ломается при изменениях

Применяйте SOLID разумно — не переусложняйте код без необходимости!
