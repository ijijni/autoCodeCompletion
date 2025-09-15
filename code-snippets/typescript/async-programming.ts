/**
 * TypeScript异步编程示例
 */

// 基础Promise示例
class PromiseExamples {
    // 创建Promise
    static createPromise<T>(value: T, delay: number = 1000): Promise<T> {
        return new Promise((resolve, reject) => {
            setTimeout(() => {
                if (Math.random() > 0.1) { // 90% 成功率
                    resolve(value);
                } else {
                    reject(new Error(`操作失败: ${value}`));
                }
            }, delay);
        });
    }

    // Promise链式调用
    static async demonstratePromiseChaining(): Promise<void> {
        console.log('\n=== Promise链式调用示例 ===');
        
        try {
            const result = await this.createPromise('初始值', 500)
                .then(value => {
                    console.log(`第一步: ${value}`);
                    return this.createPromise(`处理后的${value}`, 300);
                })
                .then(value => {
                    console.log(`第二步: ${value}`);
                    return `最终结果: ${value}`;
                });
            
            console.log(`链式调用结果: ${result}`);
        } catch (error) {
            console.error(`链式调用失败: ${error.message}`);
        }
    }

    // Promise.all示例
    static async demonstratePromiseAll(): Promise<void> {
        console.log('\n=== Promise.all示例 ===');
        
        const promises = [
            this.createPromise('任务1', 1000),
            this.createPromise('任务2', 800),
            this.createPromise('任务3', 1200)
        ];

        try {
            const startTime = Date.now();
            const results = await Promise.all(promises);
            const endTime = Date.now();
            
            console.log(`并行执行结果: ${results.join(', ')}`);
            console.log(`执行时间: ${endTime - startTime}ms`);
        } catch (error) {
            console.error(`Promise.all失败: ${error.message}`);
        }
    }

    // Promise.allSettled示例
    static async demonstratePromiseAllSettled(): Promise<void> {
        console.log('\n=== Promise.allSettled示例 ===');
        
        const promises = [
            this.createPromise('成功任务', 500),
            Promise.reject(new Error('失败任务')),
            this.createPromise('另一个成功任务', 300)
        ];

        const results = await Promise.allSettled(promises);
        
        results.forEach((result, index) => {
            if (result.status === 'fulfilled') {
                console.log(`任务${index + 1}成功: ${result.value}`);
            } else {
                console.log(`任务${index + 1}失败: ${result.reason.message}`);
            }
        });
    }

    // Promise.race示例
    static async demonstratePromiseRace(): Promise<void> {
        console.log('\n=== Promise.race示例 ===');
        
        const promises = [
            this.createPromise('慢任务', 2000),
            this.createPromise('快任务', 500),
            this.createPromise('中等任务', 1000)
        ];

        try {
            const winner = await Promise.race(promises);
            console.log(`最快完成的任务: ${winner}`);
        } catch (error) {
            console.error(`最快失败的任务: ${error.message}`);
        }
    }
}

// Async/Await高级模式
class AsyncAwaitPatterns {
    // 并发控制
    static async limitConcurrency<T>(
        tasks: (() => Promise<T>)[],
        limit: number
    ): Promise<T[]> {
        const results: T[] = [];
        const executing: Promise<void>[] = [];

        for (const task of tasks) {
            const promise = task().then(result => {
                results.push(result);
            });

            executing.push(promise);

            if (executing.length >= limit) {
                await Promise.race(executing);
                executing.splice(executing.findIndex(p => p === promise), 1);
            }
        }

        await Promise.all(executing);
        return results;
    }

    // 重试机制
    static async retry<T>(
        operation: () => Promise<T>,
        maxRetries: number = 3,
        delay: number = 1000
    ): Promise<T> {
        let lastError: Error;

        for (let attempt = 0; attempt <= maxRetries; attempt++) {
            try {
                return await operation();
            } catch (error) {
                lastError = error;
                console.log(`尝试 ${attempt + 1} 失败: ${error.message}`);
                
                if (attempt < maxRetries) {
                    await new Promise(resolve => setTimeout(resolve, delay));
                }
            }
        }

        throw lastError!;
    }

    // 超时控制
    static async withTimeout<T>(
        promise: Promise<T>,
        timeoutMs: number
    ): Promise<T> {
        const timeoutPromise = new Promise<never>((_, reject) => {
            setTimeout(() => reject(new Error(`操作超时: ${timeoutMs}ms`)), timeoutMs);
        });

        return Promise.race([promise, timeoutPromise]);
    }

    // 缓存装饰器
    static memoizeAsync<T extends any[], R>(
        fn: (...args: T) => Promise<R>,
        keyFn?: (...args: T) => string
    ): (...args: T) => Promise<R> {
        const cache = new Map<string, Promise<R>>();

        return async (...args: T): Promise<R> => {
            const key = keyFn ? keyFn(...args) : JSON.stringify(args);
            
            if (cache.has(key)) {
                console.log(`缓存命中: ${key}`);
                return cache.get(key)!;
            }

            console.log(`缓存未命中: ${key}`);
            const promise = fn(...args);
            cache.set(key, promise);

            try {
                const result = await promise;
                return result;
            } catch (error) {
                cache.delete(key); // 失败时清除缓存
                throw error;
            }
        };
    }

    // 演示并发控制
    static async demonstrateConcurrencyControl(): Promise<void> {
        console.log('\n=== 并发控制示例 ===');

        const tasks = Array.from({ length: 10 }, (_, i) => 
            () => PromiseExamples.createPromise(`任务${i + 1}`, Math.random() * 1000 + 500)
        );

        const startTime = Date.now();
        const results = await this.limitConcurrency(tasks, 3);
        const endTime = Date.now();

        console.log(`限制并发(3)完成: ${results.length}个任务`);
        console.log(`执行时间: ${endTime - startTime}ms`);
    }

    // 演示重试机制
    static async demonstrateRetry(): Promise<void> {
        console.log('\n=== 重试机制示例 ===');

        const unreliableOperation = () => {
            if (Math.random() < 0.7) { // 70% 失败率
                return Promise.reject(new Error('随机失败'));
            }
            return Promise.resolve('操作成功');
        };

        try {
            const result = await this.retry(unreliableOperation, 5, 500);
            console.log(`重试成功: ${result}`);
        } catch (error) {
            console.error(`重试最终失败: ${error.message}`);
        }
    }

    // 演示超时控制
    static async demonstrateTimeout(): Promise<void> {
        console.log('\n=== 超时控制示例 ===');

        const slowOperation = PromiseExamples.createPromise('慢操作', 3000);

        try {
            const result = await this.withTimeout(slowOperation, 2000);
            console.log(`操作完成: ${result}`);
        } catch (error) {
            console.error(`操作失败: ${error.message}`);
        }
    }
}

// 异步迭代器和生成器
class AsyncIteratorExamples {
    // 异步生成器
    static async* asyncNumberGenerator(count: number): AsyncGenerator<number> {
        for (let i = 0; i < count; i++) {
            await new Promise(resolve => setTimeout(resolve, 100));
            yield i;
        }
    }

    // 异步迭代器
    static async* fetchDataStream(urls: string[]): AsyncGenerator<string> {
        for (const url of urls) {
            try {
                // 模拟HTTP请求
                await new Promise(resolve => setTimeout(resolve, 200));
                yield `数据来自: ${url}`;
            } catch (error) {
                console.error(`获取 ${url} 失败: ${error.message}`);
            }
        }
    }

    // 异步管道操作
    static async* map<T, R>(
        source: AsyncIterable<T>,
        mapper: (item: T) => R | Promise<R>
    ): AsyncGenerator<R> {
        for await (const item of source) {
            yield await mapper(item);
        }
    }

    static async* filter<T>(
        source: AsyncIterable<T>,
        predicate: (item: T) => boolean | Promise<boolean>
    ): AsyncGenerator<T> {
        for await (const item of source) {
            if (await predicate(item)) {
                yield item;
            }
        }
    }

    static async* take<T>(
        source: AsyncIterable<T>,
        count: number
    ): AsyncGenerator<T> {
        let taken = 0;
        for await (const item of source) {
            if (taken >= count) break;
            yield item;
            taken++;
        }
    }

    // 演示异步迭代器
    static async demonstrateAsyncIterators(): Promise<void> {
        console.log('\n=== 异步迭代器示例 ===');

        // 基础异步生成器
        console.log('异步数字生成器:');
        for await (const num of this.asyncNumberGenerator(5)) {
            console.log(`生成数字: ${num}`);
        }

        // 数据流处理
        console.log('\n数据流处理:');
        const urls = ['api/users', 'api/posts', 'api/comments'];
        const dataStream = this.fetchDataStream(urls);

        for await (const data of dataStream) {
            console.log(data);
        }

        // 管道操作
        console.log('\n管道操作:');
        const numbers = this.asyncNumberGenerator(10);
        const doubled = this.map(numbers, x => x * 2);
        const evens = this.filter(doubled, x => x % 4 === 0);
        const limited = this.take(evens, 3);

        for await (const result of limited) {
            console.log(`管道结果: ${result}`);
        }
    }
}

// 响应式编程模式
class ReactivePatterns {
    // 简单的Observable实现
    static class Observable<T> {
        private subscribers: ((value: T) => void)[] = [];

        constructor(private producer: (observer: { next: (value: T) => void }) => void) {}

        subscribe(callback: (value: T) => void): () => void {
            this.subscribers.push(callback);
            
            this.producer({
                next: (value: T) => {
                    this.subscribers.forEach(sub => sub(value));
                }
            });

            return () => {
                const index = this.subscribers.indexOf(callback);
                if (index > -1) {
                    this.subscribers.splice(index, 1);
                }
            };
        }

        map<R>(mapper: (value: T) => R): Observable<R> {
            return new Observable<R>(observer => {
                this.subscribe(value => {
                    observer.next(mapper(value));
                });
            });
        }

        filter(predicate: (value: T) => boolean): Observable<T> {
            return new Observable<T>(observer => {
                this.subscribe(value => {
                    if (predicate(value)) {
                        observer.next(value);
                    }
                });
            });
        }
    }

    // 事件流
    static createEventStream<T>(): {
        observable: ReactivePatterns.Observable<T>;
        emit: (value: T) => void;
    } {
        let emit: (value: T) => void;

        const observable = new this.Observable<T>(observer => {
            emit = observer.next;
        });

        return { observable, emit: emit! };
    }

    // 演示响应式模式
    static async demonstrateReactivePatterns(): Promise<void> {
        console.log('\n=== 响应式编程示例 ===');

        const { observable, emit } = this.createEventStream<number>();

        // 订阅原始流
        const unsubscribe1 = observable.subscribe(value => {
            console.log(`原始值: ${value}`);
        });

        // 订阅转换后的流
        const unsubscribe2 = observable
            .map(x => x * 2)
            .filter(x => x > 10)
            .subscribe(value => {
                console.log(`转换后的值: ${value}`);
            });

        // 发射一些值
        for (let i = 1; i <= 10; i++) {
            emit(i);
            await new Promise(resolve => setTimeout(resolve, 100));
        }

        // 清理订阅
        unsubscribe1();
        unsubscribe2();
    }
}

// 错误处理模式
class ErrorHandlingPatterns {
    // 结果类型
    static class Result<T, E = Error> {
        constructor(
            private readonly value?: T,
            private readonly error?: E
        ) {}

        static ok<T>(value: T): Result<T> {
            return new Result(value);
        }

        static err<E>(error: E): Result<never, E> {
            return new Result(undefined, error);
        }

        isOk(): boolean {
            return this.error === undefined;
        }

        isErr(): boolean {
            return this.error !== undefined;
        }

        unwrap(): T {
            if (this.error) {
                throw this.error;
            }
            return this.value!;
        }

        unwrapOr(defaultValue: T): T {
            return this.error ? defaultValue : this.value!;
        }

        map<R>(mapper: (value: T) => R): Result<R, E> {
            if (this.error) {
                return Result.err(this.error);
            }
            return Result.ok(mapper(this.value!));
        }

        mapErr<R>(mapper: (error: E) => R): Result<T, R> {
            if (this.error) {
                return Result.err(mapper(this.error));
            }
            return Result.ok(this.value!);
        }

        andThen<R>(mapper: (value: T) => Result<R, E>): Result<R, E> {
            if (this.error) {
                return Result.err(this.error);
            }
            return mapper(this.value!);
        }
    }

    // 安全的异步操作
    static async safeAsync<T>(
        operation: () => Promise<T>
    ): Promise<ErrorHandlingPatterns.Result<T>> {
        try {
            const result = await operation();
            return ErrorHandlingPatterns.Result.ok(result);
        } catch (error) {
            return ErrorHandlingPatterns.Result.err(error);
        }
    }

    // 演示错误处理
    static async demonstrateErrorHandling(): Promise<void> {
        console.log('\n=== 错误处理模式示例 ===');

        const operations = [
            () => PromiseExamples.createPromise('成功操作', 300),
            () => Promise.reject(new Error('失败操作')),
            () => PromiseExamples.createPromise('另一个成功操作', 200)
        ];

        for (const [index, operation] of operations.entries()) {
            const result = await this.safeAsync(operation);
            
            if (result.isOk()) {
                console.log(`操作${index + 1}成功: ${result.unwrap()}`);
            } else {
                console.log(`操作${index + 1}失败: ${result.unwrapOr('默认值')}`);
            }
        }

        // 链式操作
        const chainResult = await this.safeAsync(() => 
            PromiseExamples.createPromise('链式输入', 200)
        );

        const finalResult = chainResult
            .map(value => `处理: ${value}`)
            .map(value => value.toUpperCase())
            .unwrapOr('链式操作失败');

        console.log(`链式结果: ${finalResult}`);
    }
}

// 主演示函数
async function main(): Promise<void> {
    console.log('=== TypeScript异步编程示例 ===');

    await PromiseExamples.demonstratePromiseChaining();
    await PromiseExamples.demonstratePromiseAll();
    await PromiseExamples.demonstratePromiseAllSettled();
    await PromiseExamples.demonstratePromiseRace();

    await AsyncAwaitPatterns.demonstrateConcurrencyControl();
    await AsyncAwaitPatterns.demonstrateRetry();
    await AsyncAwaitPatterns.demonstrateTimeout();

    await AsyncIteratorExamples.demonstrateAsyncIterators();
    await ReactivePatterns.demonstrateReactivePatterns();
    await ErrorHandlingPatterns.demonstrateErrorHandling();

    console.log('\n所有异步编程示例完成!');
}

// 运行示例
main().catch(console.error);
