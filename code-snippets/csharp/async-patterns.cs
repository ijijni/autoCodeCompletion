/**
 * C# 异步编程模式示例
 */
using System;
using System.Collections.Generic;
using System.IO;
using System.Net.Http;
using System.Threading;
using System.Threading.Tasks;
using System.Linq;
using System.Collections.Concurrent;

namespace AsyncPatterns
{
    // 基础异步操作示例
    public class BasicAsyncOperations
    {
        private static readonly HttpClient httpClient = new HttpClient();

        public static async Task<string> FetchDataAsync(string url)
        {
            try
            {
                Console.WriteLine($"开始获取数据: {url}");
                var response = await httpClient.GetStringAsync(url);
                Console.WriteLine($"数据获取完成: {url}");
                return response;
            }
            catch (Exception ex)
            {
                Console.WriteLine($"获取数据失败: {ex.Message}");
                throw;
            }
        }

        public static async Task<string> ProcessFileAsync(string filePath)
        {
            try
            {
                Console.WriteLine($"开始处理文件: {filePath}");
                var content = await File.ReadAllTextAsync(filePath);
                
                // 模拟处理时间
                await Task.Delay(1000);
                
                var processedContent = content.ToUpper();
                Console.WriteLine($"文件处理完成: {filePath}");
                return processedContent;
            }
            catch (Exception ex)
            {
                Console.WriteLine($"文件处理失败: {ex.Message}");
                throw;
            }
        }

        public static async Task SimulateWorkAsync(string taskName, int delayMs)
        {
            Console.WriteLine($"任务开始: {taskName}");
            await Task.Delay(delayMs);
            Console.WriteLine($"任务完成: {taskName}");
        }
    }

    // 并行异步操作示例
    public class ParallelAsyncOperations
    {
        public static async Task RunTasksInParallelAsync()
        {
            Console.WriteLine("\n=== 并行异步操作 ===");

            var tasks = new List<Task>
            {
                BasicAsyncOperations.SimulateWorkAsync("任务1", 1000),
                BasicAsyncOperations.SimulateWorkAsync("任务2", 1500),
                BasicAsyncOperations.SimulateWorkAsync("任务3", 800)
            };

            var startTime = DateTime.Now;
            await Task.WhenAll(tasks);
            var endTime = DateTime.Now;

            Console.WriteLine($"所有任务完成，总耗时: {(endTime - startTime).TotalMilliseconds}ms");
        }

        public static async Task RunTasksWithResultsAsync()
        {
            Console.WriteLine("\n=== 带返回值的并行任务 ===");

            var tasks = new List<Task<string>>
            {
                Task.Run(async () => { await Task.Delay(1000); return "结果1"; }),
                Task.Run(async () => { await Task.Delay(1500); return "结果2"; }),
                Task.Run(async () => { await Task.Delay(800); return "结果3"; })
            };

            var results = await Task.WhenAll(tasks);
            
            foreach (var result in results)
            {
                Console.WriteLine($"获得结果: {result}");
            }
        }

        public static async Task RunTasksWithFirstCompletedAsync()
        {
            Console.WriteLine("\n=== 等待第一个完成的任务 ===");

            var tasks = new List<Task<string>>
            {
                Task.Run(async () => { await Task.Delay(2000); return "慢任务"; }),
                Task.Run(async () => { await Task.Delay(500); return "快任务"; }),
                Task.Run(async () => { await Task.Delay(1000); return "中等任务"; })
            };

            var completedTask = await Task.WhenAny(tasks);
            var result = await completedTask;
            
            Console.WriteLine($"第一个完成的任务结果: {result}");
        }
    }

    // 取消令牌示例
    public class CancellationTokenExamples
    {
        public static async Task LongRunningTaskAsync(CancellationToken cancellationToken)
        {
            for (int i = 0; i < 10; i++)
            {
                cancellationToken.ThrowIfCancellationRequested();
                
                Console.WriteLine($"执行步骤 {i + 1}/10");
                await Task.Delay(1000, cancellationToken);
            }
            
            Console.WriteLine("长时间运行的任务完成");
        }

        public static async Task DemonstrateCancellationAsync()
        {
            Console.WriteLine("\n=== 取消令牌示例 ===");

            using var cts = new CancellationTokenSource();
            
            // 5秒后自动取消
            cts.CancelAfter(TimeSpan.FromSeconds(5));

            try
            {
                await LongRunningTaskAsync(cts.Token);
            }
            catch (OperationCanceledException)
            {
                Console.WriteLine("任务被取消");
            }
        }

        public static async Task ManualCancellationAsync()
        {
            Console.WriteLine("\n=== 手动取消示例 ===");

            using var cts = new CancellationTokenSource();

            var task = LongRunningTaskAsync(cts.Token);

            // 模拟用户在3秒后取消操作
            _ = Task.Run(async () =>
            {
                await Task.Delay(3000);
                Console.WriteLine("用户请求取消操作");
                cts.Cancel();
            });

            try
            {
                await task;
            }
            catch (OperationCanceledException)
            {
                Console.WriteLine("任务被用户取消");
            }
        }
    }

    // 异步流示例 (IAsyncEnumerable)
    public class AsyncStreamExamples
    {
        public static async IAsyncEnumerable<int> GenerateNumbersAsync(
            int count, 
            [System.Runtime.CompilerServices.EnumeratorCancellation] CancellationToken cancellationToken = default)
        {
            for (int i = 0; i < count; i++)
            {
                cancellationToken.ThrowIfCancellationRequested();
                
                await Task.Delay(500, cancellationToken);
                yield return i;
            }
        }

        public static async IAsyncEnumerable<string> ProcessDataStreamAsync(IAsyncEnumerable<int> source)
        {
            await foreach (var number in source)
            {
                var processed = $"处理后的数据: {number * 2}";
                yield return processed;
            }
        }

        public static async Task DemonstrateAsyncStreamsAsync()
        {
            Console.WriteLine("\n=== 异步流示例 ===");

            var numbers = GenerateNumbersAsync(5);
            var processedData = ProcessDataStreamAsync(numbers);

            await foreach (var data in processedData)
            {
                Console.WriteLine(data);
            }
        }
    }

    // 生产者-消费者模式
    public class ProducerConsumerPattern
    {
        private readonly ConcurrentQueue<string> _queue = new ConcurrentQueue<string>();
        private readonly SemaphoreSlim _semaphore = new SemaphoreSlim(0);
        private volatile bool _isCompleted = false;

        public async Task ProduceAsync(string producerName, int itemCount)
        {
            for (int i = 0; i < itemCount; i++)
            {
                var item = $"{producerName}-项目-{i + 1}";
                _queue.Enqueue(item);
                _semaphore.Release();
                
                Console.WriteLine($"生产者 {producerName} 生产: {item}");
                await Task.Delay(500);
            }
        }

        public async Task ConsumeAsync(string consumerName, CancellationToken cancellationToken)
        {
            while (!_isCompleted || !_queue.IsEmpty)
            {
                try
                {
                    await _semaphore.WaitAsync(1000, cancellationToken);
                    
                    if (_queue.TryDequeue(out var item))
                    {
                        Console.WriteLine($"消费者 {consumerName} 消费: {item}");
                        await Task.Delay(800, cancellationToken);
                    }
                }
                catch (OperationCanceledException)
                {
                    Console.WriteLine($"消费者 {consumerName} 被取消");
                    break;
                }
            }
        }

        public void Complete()
        {
            _isCompleted = true;
        }

        public static async Task DemonstrateProducerConsumerAsync()
        {
            Console.WriteLine("\n=== 生产者-消费者模式 ===");

            var pattern = new ProducerConsumerPattern();
            using var cts = new CancellationTokenSource();

            var tasks = new List<Task>
            {
                pattern.ProduceAsync("生产者1", 5),
                pattern.ProduceAsync("生产者2", 3),
                pattern.ConsumeAsync("消费者1", cts.Token),
                pattern.ConsumeAsync("消费者2", cts.Token)
            };

            // 等待生产者完成
            await Task.WhenAll(tasks.Take(2));
            pattern.Complete();

            // 等待消费者处理完剩余项目
            await Task.Delay(3000);
            cts.Cancel();

            try
            {
                await Task.WhenAll(tasks);
            }
            catch (OperationCanceledException)
            {
                Console.WriteLine("生产者-消费者演示完成");
            }
        }
    }

    // 异步锁示例
    public class AsyncLockExample
    {
        private readonly SemaphoreSlim _semaphore = new SemaphoreSlim(1, 1);
        private int _counter = 0;

        public async Task<int> IncrementAsync(string taskName)
        {
            await _semaphore.WaitAsync();
            try
            {
                Console.WriteLine($"{taskName} 获得锁");
                var currentValue = _counter;
                
                // 模拟异步操作
                await Task.Delay(1000);
                
                _counter = currentValue + 1;
                Console.WriteLine($"{taskName} 计数器更新为: {_counter}");
                
                return _counter;
            }
            finally
            {
                Console.WriteLine($"{taskName} 释放锁");
                _semaphore.Release();
            }
        }

        public static async Task DemonstrateAsyncLockAsync()
        {
            Console.WriteLine("\n=== 异步锁示例 ===");

            var lockExample = new AsyncLockExample();

            var tasks = new List<Task<int>>
            {
                lockExample.IncrementAsync("任务1"),
                lockExample.IncrementAsync("任务2"),
                lockExample.IncrementAsync("任务3")
            };

            var results = await Task.WhenAll(tasks);
            Console.WriteLine($"最终结果: {string.Join(", ", results)}");
        }
    }

    // 重试模式
    public class RetryPattern
    {
        public static async Task<T> RetryAsync<T>(
            Func<Task<T>> operation,
            int maxRetries = 3,
            TimeSpan delay = default)
        {
            if (delay == default)
                delay = TimeSpan.FromSeconds(1);

            Exception lastException = null;

            for (int attempt = 0; attempt <= maxRetries; attempt++)
            {
                try
                {
                    Console.WriteLine($"尝试 {attempt + 1}/{maxRetries + 1}");
                    return await operation();
                }
                catch (Exception ex)
                {
                    lastException = ex;
                    Console.WriteLine($"尝试 {attempt + 1} 失败: {ex.Message}");

                    if (attempt < maxRetries)
                    {
                        Console.WriteLine($"等待 {delay.TotalSeconds} 秒后重试...");
                        await Task.Delay(delay);
                    }
                }
            }

            throw new Exception($"操作在 {maxRetries + 1} 次尝试后仍然失败", lastException);
        }

        public static async Task<string> UnreliableOperationAsync()
        {
            var random = new Random();
            if (random.NextDouble() < 0.7) // 70% 失败率
            {
                throw new Exception("模拟的操作失败");
            }

            await Task.Delay(500);
            return "操作成功";
        }

        public static async Task DemonstrateRetryAsync()
        {
            Console.WriteLine("\n=== 重试模式示例 ===");

            try
            {
                var result = await RetryAsync(
                    UnreliableOperationAsync,
                    maxRetries: 5,
                    delay: TimeSpan.FromSeconds(2)
                );
                
                Console.WriteLine($"最终结果: {result}");
            }
            catch (Exception ex)
            {
                Console.WriteLine($"重试失败: {ex.Message}");
            }
        }
    }

    // 主程序
    public class Program
    {
        public static async Task Main(string[] args)
        {
            Console.WriteLine("=== C# 异步编程模式示例 ===");

            try
            {
                await ParallelAsyncOperations.RunTasksInParallelAsync();
                await ParallelAsyncOperations.RunTasksWithResultsAsync();
                await ParallelAsyncOperations.RunTasksWithFirstCompletedAsync();
                
                await CancellationTokenExamples.DemonstrateCancellationAsync();
                await CancellationTokenExamples.ManualCancellationAsync();
                
                await AsyncStreamExamples.DemonstrateAsyncStreamsAsync();
                
                await ProducerConsumerPattern.DemonstrateProducerConsumerAsync();
                
                await AsyncLockExample.DemonstrateAsyncLockAsync();
                
                await RetryPattern.DemonstrateRetryAsync();
            }
            catch (Exception ex)
            {
                Console.WriteLine($"程序执行出错: {ex.Message}");
            }

            Console.WriteLine("\n所有异步模式演示完成!");
        }
    }
}
