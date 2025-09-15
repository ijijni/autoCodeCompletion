/**
 * TypeScript函数式编程示例
 */

// 高阶函数和函数组合
namespace FunctionalProgramming {
    
    // 基础函数类型
    type Predicate<T> = (value: T) => boolean;
    type Mapper<T, R> = (value: T) => R;
    type Reducer<T, R> = (accumulator: R, current: T) => R;

    // 函数组合
    export function compose<A, B, C>(
        f: (b: B) => C,
        g: (a: A) => B
    ): (a: A) => C {
        return (a: A) => f(g(a));
    }

    export function pipe<A, B, C, D>(
        a: A,
        ab: (a: A) => B,
        bc: (b: B) => C,
        cd: (c: C) => D
    ): D;
    export function pipe<A, B, C>(
        a: A,
        ab: (a: A) => B,
        bc: (b: B) => C
    ): C;
    export function pipe<A, B>(
        a: A,
        ab: (a: A) => B
    ): B;
    export function pipe(value: any, ...fns: Function[]): any {
        return fns.reduce((acc, fn) => fn(acc), value);
    }

    // 柯里化
    export function curry<A, B, C>(
        fn: (a: A, b: B) => C
    ): (a: A) => (b: B) => C {
        return (a: A) => (b: B) => fn(a, b);
    }

    export function curry3<A, B, C, D>(
        fn: (a: A, b: B, c: C) => D
    ): (a: A) => (b: B) => (c: C) => D {
        return (a: A) => (b: B) => (c: C) => fn(a, b, c);
    }

    // 部分应用
    export function partial<A, B, C>(
        fn: (a: A, b: B) => C,
        a: A
    ): (b: B) => C {
        return (b: B) => fn(a, b);
    }

    // 记忆化
    export function memoize<T extends any[], R>(
        fn: (...args: T) => R,
        keyFn?: (...args: T) => string
    ): (...args: T) => R {
        const cache = new Map<string, R>();
        
        return (...args: T): R => {
            const key = keyFn ? keyFn(...args) : JSON.stringify(args);
            
            if (cache.has(key)) {
                return cache.get(key)!;
            }
            
            const result = fn(...args);
            cache.set(key, result);
            return result;
        };
    }

    // 函数式数据结构 - 不可变列表
    export class ImmutableList<T> {
        constructor(private readonly items: readonly T[] = []) {}

        static of<T>(...items: T[]): ImmutableList<T> {
            return new ImmutableList(items);
        }

        static from<T>(iterable: Iterable<T>): ImmutableList<T> {
            return new ImmutableList(Array.from(iterable));
        }

        get length(): number {
            return this.items.length;
        }

        get(index: number): T | undefined {
            return this.items[index];
        }

        first(): T | undefined {
            return this.items[0];
        }

        last(): T | undefined {
            return this.items[this.items.length - 1];
        }

        append(item: T): ImmutableList<T> {
            return new ImmutableList([...this.items, item]);
        }

        prepend(item: T): ImmutableList<T> {
            return new ImmutableList([item, ...this.items]);
        }

        map<R>(mapper: Mapper<T, R>): ImmutableList<R> {
            return new ImmutableList(this.items.map(mapper));
        }

        filter(predicate: Predicate<T>): ImmutableList<T> {
            return new ImmutableList(this.items.filter(predicate));
        }

        reduce<R>(reducer: Reducer<T, R>, initial: R): R {
            return this.items.reduce(reducer, initial);
        }

        find(predicate: Predicate<T>): T | undefined {
            return this.items.find(predicate);
        }

        some(predicate: Predicate<T>): boolean {
            return this.items.some(predicate);
        }

        every(predicate: Predicate<T>): boolean {
            return this.items.every(predicate);
        }

        take(count: number): ImmutableList<T> {
            return new ImmutableList(this.items.slice(0, count));
        }

        skip(count: number): ImmutableList<T> {
            return new ImmutableList(this.items.slice(count));
        }

        reverse(): ImmutableList<T> {
            return new ImmutableList([...this.items].reverse());
        }

        sort(compareFn?: (a: T, b: T) => number): ImmutableList<T> {
            return new ImmutableList([...this.items].sort(compareFn));
        }

        toArray(): T[] {
            return [...this.items];
        }

        *[Symbol.iterator](): Iterator<T> {
            yield* this.items;
        }
    }

    // Maybe/Option 类型
    export abstract class Maybe<T> {
        abstract map<R>(mapper: (value: T) => R): Maybe<R>;
        abstract flatMap<R>(mapper: (value: T) => Maybe<R>): Maybe<R>;
        abstract filter(predicate: Predicate<T>): Maybe<T>;
        abstract getOrElse(defaultValue: T): T;
        abstract isSome(): boolean;
        abstract isNone(): boolean;

        static some<T>(value: T): Maybe<T> {
            return new Some(value);
        }

        static none<T>(): Maybe<T> {
            return new None<T>();
        }

        static fromNullable<T>(value: T | null | undefined): Maybe<T> {
            return value != null ? Maybe.some(value) : Maybe.none();
        }
    }

    class Some<T> extends Maybe<T> {
        constructor(private readonly value: T) {
            super();
        }

        map<R>(mapper: (value: T) => R): Maybe<R> {
            return Maybe.some(mapper(this.value));
        }

        flatMap<R>(mapper: (value: T) => Maybe<R>): Maybe<R> {
            return mapper(this.value);
        }

        filter(predicate: Predicate<T>): Maybe<T> {
            return predicate(this.value) ? this : Maybe.none();
        }

        getOrElse(_defaultValue: T): T {
            return this.value;
        }

        isSome(): boolean {
            return true;
        }

        isNone(): boolean {
            return false;
        }
    }

    class None<T> extends Maybe<T> {
        map<R>(_mapper: (value: T) => R): Maybe<R> {
            return Maybe.none();
        }

        flatMap<R>(_mapper: (value: T) => Maybe<R>): Maybe<R> {
            return Maybe.none();
        }

        filter(_predicate: Predicate<T>): Maybe<T> {
            return this;
        }

        getOrElse(defaultValue: T): T {
            return defaultValue;
        }

        isSome(): boolean {
            return false;
        }

        isNone(): boolean {
            return true;
        }
    }

    // Either 类型
    export abstract class Either<L, R> {
        abstract map<R2>(mapper: (value: R) => R2): Either<L, R2>;
        abstract mapLeft<L2>(mapper: (value: L) => L2): Either<L2, R>;
        abstract flatMap<R2>(mapper: (value: R) => Either<L, R2>): Either<L, R2>;
        abstract fold<T>(leftMapper: (left: L) => T, rightMapper: (right: R) => T): T;
        abstract isLeft(): boolean;
        abstract isRight(): boolean;

        static left<L, R>(value: L): Either<L, R> {
            return new Left(value);
        }

        static right<L, R>(value: R): Either<L, R> {
            return new Right(value);
        }

        static tryCatch<R>(fn: () => R): Either<Error, R> {
            try {
                return Either.right(fn());
            } catch (error) {
                return Either.left(error instanceof Error ? error : new Error(String(error)));
            }
        }
    }

    class Left<L, R> extends Either<L, R> {
        constructor(private readonly value: L) {
            super();
        }

        map<R2>(_mapper: (value: R) => R2): Either<L, R2> {
            return Either.left(this.value);
        }

        mapLeft<L2>(mapper: (value: L) => L2): Either<L2, R> {
            return Either.left(mapper(this.value));
        }

        flatMap<R2>(_mapper: (value: R) => Either<L, R2>): Either<L, R2> {
            return Either.left(this.value);
        }

        fold<T>(leftMapper: (left: L) => T, _rightMapper: (right: R) => T): T {
            return leftMapper(this.value);
        }

        isLeft(): boolean {
            return true;
        }

        isRight(): boolean {
            return false;
        }
    }

    class Right<L, R> extends Either<L, R> {
        constructor(private readonly value: R) {
            super();
        }

        map<R2>(mapper: (value: R) => R2): Either<L, R2> {
            return Either.right(mapper(this.value));
        }

        mapLeft<L2>(_mapper: (value: L) => L2): Either<L2, R> {
            return Either.right(this.value);
        }

        flatMap<R2>(mapper: (value: R) => Either<L, R2>): Either<L, R2> {
            return mapper(this.value);
        }

        fold<T>(_leftMapper: (left: L) => T, rightMapper: (right: R) => T): T {
            return rightMapper(this.value);
        }

        isLeft(): boolean {
            return false;
        }

        isRight(): boolean {
            return false;
        }
    }

    // 函数式工具函数
    export const identity = <T>(x: T): T => x;

    export const constant = <T>(value: T) => (): T => value;

    export const flip = <A, B, C>(fn: (a: A, b: B) => C) => 
        (b: B, a: A): C => fn(a, b);

    export const not = <T>(predicate: Predicate<T>): Predicate<T> => 
        (value: T) => !predicate(value);

    export const and = <T>(...predicates: Predicate<T>[]): Predicate<T> => 
        (value: T) => predicates.every(p => p(value));

    export const or = <T>(...predicates: Predicate<T>[]): Predicate<T> => 
        (value: T) => predicates.some(p => p(value));

    // 惰性求值
    export class Lazy<T> {
        private computed = false;
        private value!: T;

        constructor(private readonly computation: () => T) {}

        get(): T {
            if (!this.computed) {
                this.value = this.computation();
                this.computed = true;
            }
            return this.value;
        }

        map<R>(mapper: (value: T) => R): Lazy<R> {
            return new Lazy(() => mapper(this.get()));
        }

        flatMap<R>(mapper: (value: T) => Lazy<R>): Lazy<R> {
            return new Lazy(() => mapper(this.get()).get());
        }

        static of<T>(value: T): Lazy<T> {
            return new Lazy(() => value);
        }
    }

    // 无限序列生成器
    export function* range(start: number = 0, step: number = 1): Generator<number> {
        let current = start;
        while (true) {
            yield current;
            current += step;
        }
    }

    export function* fibonacci(): Generator<number> {
        let [a, b] = [0, 1];
        while (true) {
            yield a;
            [a, b] = [b, a + b];
        }
    }

    export function* iterate<T>(initial: T, fn: (value: T) => T): Generator<T> {
        let current = initial;
        while (true) {
            yield current;
            current = fn(current);
        }
    }

    // 序列操作
    export function take<T>(count: number, iterable: Iterable<T>): T[] {
        const result: T[] = [];
        let taken = 0;
        
        for (const item of iterable) {
            if (taken >= count) break;
            result.push(item);
            taken++;
        }
        
        return result;
    }

    export function* map<T, R>(
        mapper: (value: T) => R,
        iterable: Iterable<T>
    ): Generator<R> {
        for (const item of iterable) {
            yield mapper(item);
        }
    }

    export function* filter<T>(
        predicate: Predicate<T>,
        iterable: Iterable<T>
    ): Generator<T> {
        for (const item of iterable) {
            if (predicate(item)) {
                yield item;
            }
        }
    }

    // 演示函数
    export function demonstrateBasicFunctions(): void {
        console.log('\n=== 基础函数式编程示例 ===');

        // 函数组合
        const add = (x: number) => x + 1;
        const multiply = (x: number) => x * 2;
        const composed = compose(multiply, add);
        
        console.log(`组合函数 (2 + 1) * 2 = ${composed(2)}`);

        // 管道操作
        const result = pipe(
            5,
            x => x + 3,
            x => x * 2,
            x => x - 1
        );
        console.log(`管道操作 ((5 + 3) * 2) - 1 = ${result}`);

        // 柯里化
        const add3 = curry3((a: number, b: number, c: number) => a + b + c);
        const addFive = add3(2)(3);
        console.log(`柯里化 2 + 3 + 4 = ${addFive(4)}`);

        // 记忆化
        const expensiveFunction = memoize((n: number): number => {
            console.log(`计算 ${n} 的平方`);
            return n * n;
        });

        console.log(`第一次调用: ${expensiveFunction(5)}`);
        console.log(`第二次调用: ${expensiveFunction(5)}`); // 从缓存获取
    }

    export function demonstrateImmutableList(): void {
        console.log('\n=== 不可变列表示例 ===');

        const list = ImmutableList.of(1, 2, 3, 4, 5);
        
        const doubled = list.map(x => x * 2);
        const evens = doubled.filter(x => x % 4 === 0);
        const sum = evens.reduce((acc, x) => acc + x, 0);

        console.log(`原列表: [${list.toArray().join(', ')}]`);
        console.log(`翻倍后: [${doubled.toArray().join(', ')}]`);
        console.log(`偶数: [${evens.toArray().join(', ')}]`);
        console.log(`求和: ${sum}`);

        // 链式操作
        const result = ImmutableList.of(1, 2, 3, 4, 5, 6, 7, 8, 9, 10)
            .filter(x => x % 2 === 0)
            .map(x => x * x)
            .take(3)
            .toArray();

        console.log(`链式操作结果: [${result.join(', ')}]`);
    }

    export function demonstrateMaybe(): void {
        console.log('\n=== Maybe类型示例 ===');

        const safeDivide = (a: number, b: number): Maybe<number> => 
            b === 0 ? Maybe.none() : Maybe.some(a / b);

        const result1 = safeDivide(10, 2)
            .map(x => x * 2)
            .map(x => x + 1)
            .getOrElse(0);

        const result2 = safeDivide(10, 0)
            .map(x => x * 2)
            .map(x => x + 1)
            .getOrElse(0);

        console.log(`10 / 2 处理结果: ${result1}`);
        console.log(`10 / 0 处理结果: ${result2}`);

        // 链式操作
        const user = Maybe.fromNullable({ name: '张三', age: 25 });
        const greeting = user
            .map(u => u.name)
            .map(name => `你好, ${name}!`)
            .getOrElse('用户不存在');

        console.log(`问候语: ${greeting}`);
    }

    export function demonstrateEither(): void {
        console.log('\n=== Either类型示例 ===');

        const parseNumber = (str: string): Either<string, number> => {
            const num = parseFloat(str);
            return isNaN(num) ? Either.left(`无法解析: ${str}`) : Either.right(num);
        };

        const calculate = (a: string, b: string): Either<string, number> => 
            parseNumber(a).flatMap(numA =>
                parseNumber(b).map(numB => numA + numB)
            );

        const result1 = calculate('10', '20');
        const result2 = calculate('10', 'abc');

        console.log(`计算 '10' + '20': ${result1.fold(
            error => `错误: ${error}`,
            value => `结果: ${value}`
        )}`);

        console.log(`计算 '10' + 'abc': ${result2.fold(
            error => `错误: ${error}`,
            value => `结果: ${value}`
        )}`);

        // 错误处理
        const safeOperation = Either.tryCatch(() => {
            throw new Error('模拟错误');
        });

        console.log(`安全操作: ${safeOperation.fold(
            error => `捕获错误: ${error.message}`,
            value => `成功: ${value}`
        )}`);
    }

    export function demonstrateLazyEvaluation(): void {
        console.log('\n=== 惰性求值示例 ===');

        const expensiveComputation = new Lazy(() => {
            console.log('执行昂贵的计算...');
            return Array.from({ length: 1000000 }, (_, i) => i).reduce((a, b) => a + b, 0);
        });

        console.log('惰性值已创建，但尚未计算');
        
        const result = expensiveComputation
            .map(x => x / 1000000)
            .map(x => Math.round(x));

        console.log('变换已定义，但仍未计算');
        console.log(`最终结果: ${result.get()}`);
        console.log(`再次获取: ${result.get()}`); // 不会重新计算
    }

    export function demonstrateInfiniteSequences(): void {
        console.log('\n=== 无限序列示例 ===');

        // 斐波那契数列前10项
        const fibNumbers = take(10, fibonacci());
        console.log(`斐波那契数列前10项: [${fibNumbers.join(', ')}]`);

        // 偶数序列
        const evenNumbers = take(5, filter(x => x % 2 === 0, range(0)));
        console.log(`前5个偶数: [${evenNumbers.join(', ')}]`);

        // 平方数序列
        const squares = take(8, map(x => x * x, range(1)));
        console.log(`前8个平方数: [${squares.join(', ')}]`);

        // 迭代序列
        const powers = take(6, iterate(2, x => x * 2));
        console.log(`2的幂次: [${powers.join(', ')}]`);
    }
}

// 主演示函数
function main(): void {
    console.log('=== TypeScript函数式编程示例 ===');

    FunctionalProgramming.demonstrateBasicFunctions();
    FunctionalProgramming.demonstrateImmutableList();
    FunctionalProgramming.demonstrateMaybe();
    FunctionalProgramming.demonstrateEither();
    FunctionalProgramming.demonstrateLazyEvaluation();
    FunctionalProgramming.demonstrateInfiniteSequences();

    console.log('\n所有函数式编程示例完成!');
}

// 运行示例
main();
