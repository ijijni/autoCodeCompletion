// Java并发编程代码片段
// 用于测试AI代码补全功能

import java.util.*;
import java.util.concurrent.*;
import java.util.concurrent.atomic.*;
import java.util.concurrent.locks.*;
import java.util.function.*;
import java.time.*;
import java.time.format.*;
import java.util.stream.*;

// 1. 基础线程操作
// ======================

class BasicThreadDemo {
    
    // 通过继承Thread类创建线程
    static class MyThread extends Thread {
        private final String threadName;
        private final int iterations;
        
        public MyThread(String threadName, int iterations) {
            this.threadName = threadName;
            this.iterations = iterations;
            setName(threadName);
        }
        
        @Override
        public void run() {
            for (int i = 1; i <= iterations; i++) {
                System.out.printf("%s: 执行第 %d 次迭代%n", threadName, i);
                try {
                    Thread.sleep(1000); // 模拟工作
                } catch (InterruptedException e) {
                    System.out.printf("%s 被中断%n", threadName);
                    Thread.currentThread().interrupt();
                    return;
                }
            }
            System.out.printf("%s 完成所有迭代%n", threadName);
        }
    }
    
    // 通过实现Runnable接口创建线程
    static class MyRunnable implements Runnable {
        private final String taskName;
        private final CountDownLatch latch;
        
        public MyRunnable(String taskName, CountDownLatch latch) {
            this.taskName = taskName;
            this.latch = latch;
        }
        
        @Override
        public void run() {
            try {
                System.out.printf("%s 开始执行 [线程: %s]%n", taskName, Thread.currentThread().getName());
                
                // 模拟工作
                Thread.sleep((long) (Math.random() * 3000) + 1000);
                
                System.out.printf("%s 执行完成%n", taskName);
            } catch (InterruptedException e) {
                System.out.printf("%s 被中断%n", taskName);
                Thread.currentThread().interrupt();
            } finally {
                latch.countDown(); // 通知任务完成
            }
        }
    }
    
    public static void demonstrateBasicThreads() {
        System.out.println("=== 基础线程演示 ===");
        
        // 创建并启动Thread子类
        MyThread thread1 = new MyThread("线程1", 3);
        MyThread thread2 = new MyThread("线程2", 3);
        
        thread1.start();
        thread2.start();
        
        // 等待线程完成
        try {
            thread1.join();
            thread2.join();
        } catch (InterruptedException e) {
            Thread.currentThread().interrupt();
        }
        
        // 使用Runnable创建线程
        CountDownLatch latch = new CountDownLatch(3);
        
        Thread runnableThread1 = new Thread(new MyRunnable("任务A", latch), "工作线程-1");
        Thread runnableThread2 = new Thread(new MyRunnable("任务B", latch), "工作线程-2");
        Thread runnableThread3 = new Thread(new MyRunnable("任务C", latch), "工作线程-3");
        
        runnableThread1.start();
        runnableThread2.start();
        runnableThread3.start();
        
        // 等待所有任务完成
        try {
            latch.await();
            System.out.println("所有Runnable任务完成");
        } catch (InterruptedException e) {
            Thread.currentThread().interrupt();
        }
        // AI补全点
    }
    
    // Lambda表达式创建线程
    public static void demonstrateLambdaThreads() {
        System.out.println("\n=== Lambda线程演示 ===");
        
        // 使用Lambda表达式
        Thread lambdaThread = new Thread(() -> {
            for (int i = 1; i <= 5; i++) {
                System.out.printf("Lambda线程: 计数 %d%n", i);
                try {
                    Thread.sleep(500);
                } catch (InterruptedException e) {
                    Thread.currentThread().interrupt();
                    return;
                }
            }
        });
        
        lambdaThread.setName("Lambda-Thread");
        lambdaThread.start();
        
        // 等待完成
        try {
            lambdaThread.join();
        } catch (InterruptedException e) {
            Thread.currentThread().interrupt();
        }
        // AI补全点
    }
}

// 2. 线程池和Executor框架
// ======================

class ExecutorDemo {
    
    // CPU密集型任务
    static class CpuIntensiveTask implements Callable<Long> {
        private final String taskName;
        private final int iterations;
        
        public CpuIntensiveTask(String taskName, int iterations) {
            this.taskName = taskName;
            this.iterations = iterations;
        }
        
        @Override
        public Long call() throws Exception {
            System.out.printf("%s 开始执行 [线程: %s]%n", taskName, Thread.currentThread().getName());
            
            long startTime = System.currentTimeMillis();
            long sum = 0;
            
            // 模拟CPU密集型计算
            for (int i = 0; i < iterations; i++) {
                sum += Math.sqrt(i) * Math.sin(i);
                
                // 检查中断状态
                if (Thread.currentThread().isInterrupted()) {
                    throw new InterruptedException("任务被中断");
                }
            }
            
            long endTime = System.currentTimeMillis();
            System.out.printf("%s 完成，耗时: %d ms%n", taskName, endTime - startTime);
            
            return sum;
        }
    }
    
    // IO密集型任务
    static class IoIntensiveTask implements Runnable {
        private final String taskName;
        private final int delay;
        
        public IoIntensiveTask(String taskName, int delay) {
            this.taskName = taskName;
            this.delay = delay;
        }
        
        @Override
        public void run() {
            try {
                System.out.printf("%s 开始执行 [线程: %s]%n", taskName, Thread.currentThread().getName());
                
                // 模拟IO等待
                Thread.sleep(delay);
                
                System.out.printf("%s 完成%n", taskName);
            } catch (InterruptedException e) {
                System.out.printf("%s 被中断%n", taskName);
                Thread.currentThread().interrupt();
            }
        }
    }
    
    public static void demonstrateFixedThreadPool() {
        System.out.println("=== 固定线程池演示 ===");
        
        ExecutorService executor = Executors.newFixedThreadPool(4);
        
        // 提交IO密集型任务
        for (int i = 1; i <= 8; i++) {
            IoIntensiveTask task = new IoIntensiveTask("IO任务-" + i, 1000 + (i * 200));
            executor.submit(task);
        }
        
        // 关闭线程池
        executor.shutdown();
        
        try {
            // 等待所有任务完成
            if (!executor.awaitTermination(15, TimeUnit.SECONDS)) {
                System.out.println("强制关闭线程池");
                executor.shutdownNow();
            }
        } catch (InterruptedException e) {
            executor.shutdownNow();
            Thread.currentThread().interrupt();
        }
        // AI补全点
    }
    
    public static void demonstrateCachedThreadPool() {
        System.out.println("\n=== 缓存线程池演示 ===");
        
        ExecutorService executor = Executors.newCachedThreadPool();
        List<Future<Long>> futures = new ArrayList<>();
        
        // 提交CPU密集型任务
        for (int i = 1; i <= 6; i++) {
            CpuIntensiveTask task = new CpuIntensiveTask("CPU任务-" + i, 1000000);
            Future<Long> future = executor.submit(task);
            futures.add(future);
        }
        
        // 收集结果
        for (int i = 0; i < futures.size(); i++) {
            try {
                Long result = futures.get(i).get(10, TimeUnit.SECONDS);
                System.out.printf("任务 %d 结果: %d%n", i + 1, result);
            } catch (ExecutionException | TimeoutException e) {
                System.err.printf("任务 %d 执行失败: %s%n", i + 1, e.getMessage());
            } catch (InterruptedException e) {
                Thread.currentThread().interrupt();
                break;
            }
        }
        
        executor.shutdown();
        // AI补全点
    }
    
    public static void demonstrateScheduledThreadPool() {
        System.out.println("\n=== 定时线程池演示 ===");
        
        ScheduledExecutorService scheduler = Executors.newScheduledThreadPool(2);
        
        // 延时执行任务
        ScheduledFuture<?> delayedTask = scheduler.schedule(() -> {
            System.out.println("延时任务执行了！[线程: " + Thread.currentThread().getName() + "]");
        }, 2, TimeUnit.SECONDS);
        
        // 固定速率执行任务
        ScheduledFuture<?> fixedRateTask = scheduler.scheduleAtFixedRate(() -> {
            System.out.println("固定速率任务 - " + LocalTime.now().format(DateTimeFormatter.ofPattern("HH:mm:ss")));
        }, 1, 3, TimeUnit.SECONDS);
        
        // 固定延迟执行任务
        ScheduledFuture<?> fixedDelayTask = scheduler.scheduleWithFixedDelay(() -> {
            System.out.println("固定延迟任务 - " + LocalTime.now().format(DateTimeFormatter.ofPattern("HH:mm:ss")));
            try {
                Thread.sleep(1000); // 模拟工作时间
            } catch (InterruptedException e) {
                Thread.currentThread().interrupt();
            }
        }, 0, 2, TimeUnit.SECONDS);
        
        // 运行一段时间后取消
        try {
            Thread.sleep(10000);
            fixedRateTask.cancel(false);
            fixedDelayTask.cancel(false);
            System.out.println("取消定时任务");
        } catch (InterruptedException e) {
            Thread.currentThread().interrupt();
        }
        
        scheduler.shutdown();
        // AI补全点
    }
    
    public static void demonstrateCustomThreadPool() {
        System.out.println("\n=== 自定义线程池演示 ===");
        
        // 创建自定义线程池
        ThreadPoolExecutor customExecutor = new ThreadPoolExecutor(
            2,                          // 核心线程数
            5,                          // 最大线程数
            60L,                        // 空闲线程保活时间
            TimeUnit.SECONDS,           // 时间单位
            new ArrayBlockingQueue<>(10), // 工作队列
            new ThreadFactory() {       // 线程工厂
                private int threadNumber = 1;
                @Override
                public Thread newThread(Runnable r) {
                    Thread t = new Thread(r, "CustomWorker-" + threadNumber++);
                    t.setDaemon(false);
                    return t;
                }
            },
            new ThreadPoolExecutor.CallerRunsPolicy() // 拒绝策略
        );
        
        // 监控线程池状态
        Thread monitorThread = new Thread(() -> {
            while (!customExecutor.isShutdown()) {
                System.out.printf("线程池状态 - 活跃线程: %d, 任务队列: %d, 完成任务: %d%n",
                                customExecutor.getActiveCount(),
                                customExecutor.getQueue().size(),
                                customExecutor.getCompletedTaskCount());
                try {
                    Thread.sleep(2000);
                } catch (InterruptedException e) {
                    Thread.currentThread().interrupt();
                    break;
                }
            }
        });
        monitorThread.setDaemon(true);
        monitorThread.start();
        
        // 提交大量任务测试线程池行为
        for (int i = 1; i <= 15; i++) {
            final int taskId = i;
            customExecutor.submit(() -> {
                System.out.printf("自定义任务 %d 开始 [线程: %s]%n", taskId, Thread.currentThread().getName());
                try {
                    Thread.sleep(2000);
                } catch (InterruptedException e) {
                    Thread.currentThread().interrupt();
                }
                System.out.printf("自定义任务 %d 完成%n", taskId);
            });
        }
        
        customExecutor.shutdown();
        try {
            customExecutor.awaitTermination(30, TimeUnit.SECONDS);
        } catch (InterruptedException e) {
            customExecutor.shutdownNow();
            Thread.currentThread().interrupt();
        }
        // AI补全点
    }
}

// 3. 同步机制和锁
// ======================

class SynchronizationDemo {
    
    // 使用synchronized的银行账户示例
    static class BankAccount {
        private double balance;
        private final String accountNumber;
        private final List<String> transactionHistory;
        
        public BankAccount(String accountNumber, double initialBalance) {
            this.accountNumber = accountNumber;
            this.balance = initialBalance;
            this.transactionHistory = new ArrayList<>();
        }
        
        public synchronized void deposit(double amount) {
            if (amount > 0) {
                balance += amount;
                String transaction = String.format("存款: %.2f, 余额: %.2f [线程: %s]", 
                                                 amount, balance, Thread.currentThread().getName());
                transactionHistory.add(transaction);
                System.out.println(transaction);
            }
        }
        
        public synchronized boolean withdraw(double amount) {
            if (amount > 0 && balance >= amount) {
                balance -= amount;
                String transaction = String.format("取款: %.2f, 余额: %.2f [线程: %s]", 
                                                 amount, balance, Thread.currentThread().getName());
                transactionHistory.add(transaction);
                System.out.println(transaction);
                return true;
            } else {
                System.out.printf("取款失败: 金额 %.2f, 余额 %.2f [线程: %s]%n", 
                                amount, balance, Thread.currentThread().getName());
                return false;
            }
        }
        
        public synchronized double getBalance() {
            return balance;
        }
        
        public synchronized List<String> getTransactionHistory() {
            return new ArrayList<>(transactionHistory);
        }
        
        public String getAccountNumber() {
            return accountNumber;
        }
    }
    
    // 使用ReentrantLock的计数器示例
    static class ThreadSafeCounter {
        private int count = 0;
        private final ReentrantLock lock = new ReentrantLock();
        private final Condition notZero = lock.newCondition();
        
        public void increment() {
            lock.lock();
            try {
                count++;
                System.out.printf("递增: %d [线程: %s]%n", count, Thread.currentThread().getName());
                notZero.signalAll(); // 通知等待的线程
            } finally {
                lock.unlock();
            }
        }
        
        public void decrement() {
            lock.lock();
            try {
                while (count == 0) {
                    System.out.printf("等待非零值 [线程: %s]%n", Thread.currentThread().getName());
                    notZero.await(); // 等待count变为非零
                }
                count--;
                System.out.printf("递减: %d [线程: %s]%n", count, Thread.currentThread().getName());
            } catch (InterruptedException e) {
                Thread.currentThread().interrupt();
            } finally {
                lock.unlock();
            }
        }
        
        public int getCount() {
            lock.lock();
            try {
                return count;
            } finally {
                lock.unlock();
            }
        }
        
        public boolean tryIncrementWithTimeout(long timeout, TimeUnit unit) {
            try {
                if (lock.tryLock(timeout, unit)) {
                    try {
                        count++;
                        System.out.printf("超时递增成功: %d [线程: %s]%n", count, Thread.currentThread().getName());
                        return true;
                    } finally {
                        lock.unlock();
                    }
                } else {
                    System.out.printf("超时递增失败 [线程: %s]%n", Thread.currentThread().getName());
                    return false;
                }
            } catch (InterruptedException e) {
                Thread.currentThread().interrupt();
                return false;
            }
        }
        // AI补全点
    }
    
    // 读写锁示例
    static class ReadWriteCache<K, V> {
        private final Map<K, V> cache = new HashMap<>();
        private final ReadWriteLock lock = new ReentrantReadWriteLock();
        private final Lock readLock = lock.readLock();
        private final Lock writeLock = lock.writeLock();
        
        public V get(K key) {
            readLock.lock();
            try {
                V value = cache.get(key);
                System.out.printf("读取缓存: %s -> %s [线程: %s]%n", 
                                key, value, Thread.currentThread().getName());
                return value;
            } finally {
                readLock.unlock();
            }
        }
        
        public void put(K key, V value) {
            writeLock.lock();
            try {
                cache.put(key, value);
                System.out.printf("写入缓存: %s -> %s [线程: %s]%n", 
                                key, value, Thread.currentThread().getName());
                
                // 模拟写操作耗时
                Thread.sleep(100);
            } catch (InterruptedException e) {
                Thread.currentThread().interrupt();
            } finally {
                writeLock.unlock();
            }
        }
        
        public void remove(K key) {
            writeLock.lock();
            try {
                V removed = cache.remove(key);
                System.out.printf("删除缓存: %s -> %s [线程: %s]%n", 
                                key, removed, Thread.currentThread().getName());
            } finally {
                writeLock.unlock();
            }
        }
        
        public int size() {
            readLock.lock();
            try {
                return cache.size();
            } finally {
                readLock.unlock();
            }
        }
        
        public Set<K> keySet() {
            readLock.lock();
            try {
                return new HashSet<>(cache.keySet());
            } finally {
                readLock.unlock();
            }
        }
        // AI补全点
    }
    
    public static void demonstrateSynchronizedMethods() {
        System.out.println("=== synchronized方法演示 ===");
        
        BankAccount account = new BankAccount("ACC-001", 1000.0);
        ExecutorService executor = Executors.newFixedThreadPool(5);
        
        // 并发存取款操作
        for (int i = 1; i <= 10; i++) {
            final int operationId = i;
            executor.submit(() -> {
                if (operationId % 2 == 0) {
                    account.deposit(operationId * 10);
                } else {
                    account.withdraw(operationId * 15);
                }
            });
        }
        
        executor.shutdown();
        try {
            executor.awaitTermination(10, TimeUnit.SECONDS);
        } catch (InterruptedException e) {
            Thread.currentThread().interrupt();
        }
        
        System.out.printf("最终余额: %.2f%n", account.getBalance());
        System.out.println("交易历史:");
        account.getTransactionHistory().forEach(System.out::println);
        // AI补全点
    }
    
    public static void demonstrateReentrantLock() {
        System.out.println("\n=== ReentrantLock演示 ===");
        
        ThreadSafeCounter counter = new ThreadSafeCounter();
        ExecutorService executor = Executors.newFixedThreadPool(4);
        
        // 启动递增线程
        for (int i = 0; i < 3; i++) {
            executor.submit(() -> {
                for (int j = 0; j < 5; j++) {
                    counter.increment();
                    try {
                        Thread.sleep(200);
                    } catch (InterruptedException e) {
                        Thread.currentThread().interrupt();
                        return;
                    }
                }
            });
        }
        
        // 启动递减线程
        for (int i = 0; i < 2; i++) {
            executor.submit(() -> {
                for (int j = 0; j < 7; j++) {
                    counter.decrement();
                    try {
                        Thread.sleep(300);
                    } catch (InterruptedException e) {
                        Thread.currentThread().interrupt();
                        return;
                    }
                }
            });
        }
        
        // 测试超时锁
        executor.submit(() -> {
            for (int i = 0; i < 3; i++) {
                counter.tryIncrementWithTimeout(500, TimeUnit.MILLISECONDS);
                try {
                    Thread.sleep(400);
                } catch (InterruptedException e) {
                    Thread.currentThread().interrupt();
                    return;
                }
            }
        });
        
        executor.shutdown();
        try {
            executor.awaitTermination(20, TimeUnit.SECONDS);
        } catch (InterruptedException e) {
            Thread.currentThread().interrupt();
        }
        
        System.out.printf("最终计数: %d%n", counter.getCount());
        // AI补全点
    }
    
    public static void demonstrateReadWriteLock() {
        System.out.println("\n=== ReadWriteLock演示 ===");
        
        ReadWriteCache<String, String> cache = new ReadWriteCache<>();
        ExecutorService executor = Executors.newFixedThreadPool(6);
        
        // 初始化缓存
        cache.put("key1", "value1");
        cache.put("key2", "value2");
        cache.put("key3", "value3");
        
        // 多个读线程
        for (int i = 1; i <= 4; i++) {
            final int readerId = i;
            executor.submit(() -> {
                for (int j = 1; j <= 3; j++) {
                    String key = "key" + (j % 3 + 1);
                    cache.get(key);
                    try {
                        Thread.sleep(200);
                    } catch (InterruptedException e) {
                        Thread.currentThread().interrupt();
                        return;
                    }
                }
            });
        }
        
        // 写线程
        executor.submit(() -> {
            for (int i = 4; i <= 6; i++) {
                cache.put("key" + i, "value" + i);
                try {
                    Thread.sleep(500);
                } catch (InterruptedException e) {
                    Thread.currentThread().interrupt();
                    return;
                }
            }
        });
        
        // 删除线程
        executor.submit(() -> {
            try {
                Thread.sleep(2000);
                cache.remove("key1");
                Thread.sleep(1000);
                cache.remove("key2");
            } catch (InterruptedException e) {
                Thread.currentThread().interrupt();
            }
        });
        
        executor.shutdown();
        try {
            executor.awaitTermination(15, TimeUnit.SECONDS);
        } catch (InterruptedException e) {
            Thread.currentThread().interrupt();
        }
        
        System.out.printf("缓存大小: %d%n", cache.size());
        System.out.printf("缓存键: %s%n", cache.keySet());
        // AI补全点
    }
}

// 4. 原子类和CAS操作
// ======================

class AtomicDemo {
    
    // 使用原子类的计数器
    static class AtomicCounter {
        private final AtomicInteger count = new AtomicInteger(0);
        private final AtomicLong totalOperations = new AtomicLong(0);
        
        public int increment() {
            totalOperations.incrementAndGet();
            return count.incrementAndGet();
        }
        
        public int decrement() {
            totalOperations.incrementAndGet();
            return count.decrementAndGet();
        }
        
        public int addAndGet(int delta) {
            totalOperations.incrementAndGet();
            return count.addAndGet(delta);
        }
        
        public boolean compareAndSet(int expect, int update) {
            totalOperations.incrementAndGet();
            return count.compareAndSet(expect, update);
        }
        
        public int getAndUpdate(IntUnaryOperator updateFunction) {
            totalOperations.incrementAndGet();
            return count.getAndUpdate(updateFunction);
        }
        
        public int get() {
            return count.get();
        }
        
        public long getTotalOperations() {
            return totalOperations.get();
        }
        
        public void reset() {
            count.set(0);
            totalOperations.set(0);
        }
    }
    
    // 原子引用示例
    static class AtomicConfigManager {
        private final AtomicReference<Map<String, String>> config = 
            new AtomicReference<>(new ConcurrentHashMap<>());
        
        public void updateConfig(String key, String value) {
            config.updateAndGet(currentConfig -> {
                Map<String, String> newConfig = new HashMap<>(currentConfig);
                newConfig.put(key, value);
                System.out.printf("配置更新: %s = %s [线程: %s]%n", 
                                key, value, Thread.currentThread().getName());
                return newConfig;
            });
        }
        
        public String getConfig(String key) {
            return config.get().get(key);
        }
        
        public Map<String, String> getAllConfig() {
            return new HashMap<>(config.get());
        }
        
        public boolean replaceConfig(Map<String, String> expected, Map<String, String> newConfig) {
            boolean success = config.compareAndSet(expected, new HashMap<>(newConfig));
            if (success) {
                System.out.printf("配置替换成功 [线程: %s]%n", Thread.currentThread().getName());
            } else {
                System.out.printf("配置替换失败 [线程: %s]%n", Thread.currentThread().getName());
            }
            return success;
        }
    }
    
    // 累加器示例
    static class StatisticsCollector {
        private final LongAdder requestCount = new LongAdder();
        private final LongAdder errorCount = new LongAdder();
        private final DoubleAdder responseTimeSum = new DoubleAdder();
        private final AtomicReference<LocalDateTime> lastResetTime = 
            new AtomicReference<>(LocalDateTime.now());
        
        public void recordRequest(double responseTime, boolean isError) {
            requestCount.increment();
            responseTimeSum.add(responseTime);
            
            if (isError) {
                errorCount.increment();
            }
            
            System.out.printf("记录请求: 响应时间=%.2fms, 错误=%s [线程: %s]%n", 
                            responseTime, isError, Thread.currentThread().getName());
        }
        
        public long getRequestCount() {
            return requestCount.sum();
        }
        
        public long getErrorCount() {
            return errorCount.sum();
        }
        
        public double getErrorRate() {
            long total = getRequestCount();
            return total > 0 ? (double) getErrorCount() / total : 0.0;
        }
        
        public double getAverageResponseTime() {
            long total = getRequestCount();
            return total > 0 ? responseTimeSum.sum() / total : 0.0;
        }
        
        public void reset() {
            requestCount.reset();
            errorCount.reset();
            responseTimeSum.reset();
            lastResetTime.set(LocalDateTime.now());
            System.out.printf("统计重置 [线程: %s]%n", Thread.currentThread().getName());
        }
        
        public String getReport() {
            return String.format(
                "统计报告 - 请求数: %d, 错误数: %d, 错误率: %.2f%%, 平均响应时间: %.2fms",
                getRequestCount(), getErrorCount(), getErrorRate() * 100, getAverageResponseTime()
            );
        }
    }
    
    public static void demonstrateAtomicInteger() {
        System.out.println("=== AtomicInteger演示 ===");
        
        AtomicCounter counter = new AtomicCounter();
        ExecutorService executor = Executors.newFixedThreadPool(5);
        CountDownLatch latch = new CountDownLatch(5);
        
        // 并发操作原子计数器
        for (int i = 0; i < 5; i++) {
            final int threadId = i;
            executor.submit(() -> {
                try {
                    for (int j = 0; j < 10; j++) {
                        switch (j % 4) {
                            case 0:
                                int incremented = counter.increment();
                                System.out.printf("线程%d: 递增到 %d%n", threadId, incremented);
                                break;
                            case 1:
                                int decremented = counter.decrement();
                                System.out.printf("线程%d: 递减到 %d%n", threadId, decremented);
                                break;
                            case 2:
                                int added = counter.addAndGet(threadId);
                                System.out.printf("线程%d: 添加%d到 %d%n", threadId, threadId, added);
                                break;
                            case 3:
                                int oldValue = counter.getAndUpdate(x -> x * 2);
                                System.out.printf("线程%d: 更新 %d -> %d%n", threadId, oldValue, counter.get());
                                break;
                        }
                        
                        Thread.sleep(50);
                    }
                } catch (InterruptedException e) {
                    Thread.currentThread().interrupt();
                } finally {
                    latch.countDown();
                }
            });
        }
        
        try {
            latch.await();
        } catch (InterruptedException e) {
            Thread.currentThread().interrupt();
        }
        
        System.out.printf("最终计数: %d, 总操作数: %d%n", counter.get(), counter.getTotalOperations());
        
        executor.shutdown();
        // AI补全点
    }
    
    public static void demonstrateAtomicReference() {
        System.out.println("\n=== AtomicReference演示 ===");
        
        AtomicConfigManager configManager = new AtomicConfigManager();
        ExecutorService executor = Executors.newFixedThreadPool(3);
        
        // 并发更新配置
        for (int i = 1; i <= 3; i++) {
            final int threadId = i;
            executor.submit(() -> {
                for (int j = 1; j <= 5; j++) {
                    configManager.updateConfig("key" + threadId + "_" + j, "value" + threadId + "_" + j);
                    
                    try {
                        Thread.sleep(100);
                    } catch (InterruptedException e) {
                        Thread.currentThread().interrupt();
                        return;
                    }
                }
            });
        }
        
        // 读取配置
        executor.submit(() -> {
            for (int i = 0; i < 10; i++) {
                Map<String, String> currentConfig = configManager.getAllConfig();
                System.out.printf("当前配置大小: %d [线程: %s]%n", 
                                currentConfig.size(), Thread.currentThread().getName());
                
                try {
                    Thread.sleep(200);
                } catch (InterruptedException e) {
                    Thread.currentThread().interrupt();
                    return;
                }
            }
        });
        
        executor.shutdown();
        try {
            executor.awaitTermination(10, TimeUnit.SECONDS);
        } catch (InterruptedException e) {
            Thread.currentThread().interrupt();
        }
        
        System.out.println("最终配置: " + configManager.getAllConfig());
        // AI补全点
    }
    
    public static void demonstrateLongAdder() {
        System.out.println("\n=== LongAdder演示 ===");
        
        StatisticsCollector stats = new StatisticsCollector();
        ExecutorService executor = Executors.newFixedThreadPool(8);
        
        // 模拟并发请求统计
        for (int i = 0; i < 8; i++) {
            executor.submit(() -> {
                Random random = new Random();
                for (int j = 0; j < 50; j++) {
                    double responseTime = 50 + random.nextDouble() * 200; // 50-250ms
                    boolean isError = random.nextDouble() < 0.1; // 10%错误率
                    
                    stats.recordRequest(responseTime, isError);
                    
                    try {
                        Thread.sleep(20);
                    } catch (InterruptedException e) {
                        Thread.currentThread().interrupt();
                        return;
                    }
                }
            });
        }
        
        // 定期打印统计报告
        ScheduledExecutorService scheduler = Executors.newScheduledThreadPool(1);
        scheduler.scheduleAtFixedRate(() -> {
            System.out.println(stats.getReport());
        }, 1, 2, TimeUnit.SECONDS);
        
        executor.shutdown();
        try {
            executor.awaitTermination(15, TimeUnit.SECONDS);
        } catch (InterruptedException e) {
            Thread.currentThread().interrupt();
        }
        
        scheduler.shutdown();
        
        System.out.println("最终" + stats.getReport());
        // AI补全点
    }
}

// 5. 并发集合
// ======================

class ConcurrentCollectionsDemo {
    
    // 生产者-消费者模式使用BlockingQueue
    static class ProducerConsumerExample {
        private final BlockingQueue<String> queue;
        private final AtomicBoolean running = new AtomicBoolean(true);
        
        public ProducerConsumerExample(BlockingQueue<String> queue) {
            this.queue = queue;
        }
        
        class Producer implements Runnable {
            private final String name;
            private final int itemCount;
            
            public Producer(String name, int itemCount) {
                this.name = name;
                this.itemCount = itemCount;
            }
            
            @Override
            public void run() {
                try {
                    for (int i = 1; i <= itemCount; i++) {
                        String item = name + "-Item-" + i;
                        queue.put(item);
                        System.out.printf("%s 生产: %s [队列大小: %d]%n", name, item, queue.size());
                        Thread.sleep(200);
                    }
                } catch (InterruptedException e) {
                    Thread.currentThread().interrupt();
                } finally {
                    System.out.printf("%s 生产完成%n", name);
                }
            }
        }
        
        class Consumer implements Runnable {
            private final String name;
            
            public Consumer(String name) {
                this.name = name;
            }
            
            @Override
            public void run() {
                try {
                    while (running.get() || !queue.isEmpty()) {
                        String item = queue.poll(1, TimeUnit.SECONDS);
                        if (item != null) {
                            System.out.printf("%s 消费: %s [队列大小: %d]%n", name, item, queue.size());
                            Thread.sleep(300); // 模拟处理时间
                        }
                    }
                } catch (InterruptedException e) {
                    Thread.currentThread().interrupt();
                } finally {
                    System.out.printf("%s 消费完成%n", name);
                }
            }
        }
        
        public void stop() {
            running.set(false);
        }
    }
    
    // 缓存示例使用ConcurrentHashMap
    static class ConcurrentCache<K, V> {
        private final ConcurrentHashMap<K, V> cache = new ConcurrentHashMap<>();
        private final ConcurrentHashMap<K, LocalDateTime> accessTimes = new ConcurrentHashMap<>();
        private final long maxIdleTime;
        
        public ConcurrentCache(long maxIdleTimeMinutes) {
            this.maxIdleTime = maxIdleTimeMinutes;
            
            // 启动清理线程
            ScheduledExecutorService cleaner = Executors.newScheduledThreadPool(1);
            cleaner.scheduleAtFixedRate(this::cleanExpiredEntries, 1, 1, TimeUnit.MINUTES);
        }
        
        public V get(K key) {
            V value = cache.get(key);
            if (value != null) {
                accessTimes.put(key, LocalDateTime.now());
                System.out.printf("缓存命中: %s [线程: %s]%n", key, Thread.currentThread().getName());
            } else {
                System.out.printf("缓存未命中: %s [线程: %s]%n", key, Thread.currentThread().getName());
            }
            return value;
        }
        
        public V put(K key, V value) {
            accessTimes.put(key, LocalDateTime.now());
            V oldValue = cache.put(key, value);
            System.out.printf("缓存写入: %s -> %s [线程: %s]%n", key, value, Thread.currentThread().getName());
            return oldValue;
        }
        
        public V computeIfAbsent(K key, Function<K, V> mappingFunction) {
            return cache.computeIfAbsent(key, k -> {
                V value = mappingFunction.apply(k);
                accessTimes.put(k, LocalDateTime.now());
                System.out.printf("缓存计算: %s -> %s [线程: %s]%n", k, value, Thread.currentThread().getName());
                return value;
            });
        }
        
        public boolean remove(K key) {
            V removed = cache.remove(key);
            accessTimes.remove(key);
            if (removed != null) {
                System.out.printf("缓存删除: %s [线程: %s]%n", key, Thread.currentThread().getName());
                return true;
            }
            return false;
        }
        
        private void cleanExpiredEntries() {
            LocalDateTime cutoff = LocalDateTime.now().minusMinutes(maxIdleTime);
            List<K> expiredKeys = accessTimes.entrySet().stream()
                .filter(entry -> entry.getValue().isBefore(cutoff))
                .map(Map.Entry::getKey)
                .collect(Collectors.toList());
            
            for (K key : expiredKeys) {
                cache.remove(key);
                accessTimes.remove(key);
            }
            
            if (!expiredKeys.isEmpty()) {
                System.out.printf("清理过期缓存: %d 个条目%n", expiredKeys.size());
            }
        }
        
        public int size() {
            return cache.size();
        }
        
        public Set<K> keySet() {
            return cache.keySet();
        }
    }
    
    public static void demonstrateBlockingQueue() {
        System.out.println("=== BlockingQueue演示 ===");
        
        // 使用有界队列
        BlockingQueue<String> boundedQueue = new ArrayBlockingQueue<>(5);
        ProducerConsumerExample example = new ProducerConsumerExample(boundedQueue);
        
        ExecutorService executor = Executors.newFixedThreadPool(4);
        
        // 启动生产者
        executor.submit(example.new Producer("生产者1", 10));
        executor.submit(example.new Producer("生产者2", 8));
        
        // 启动消费者
        executor.submit(example.new Consumer("消费者1"));
        executor.submit(example.new Consumer("消费者2"));
        
        try {
            Thread.sleep(8000); // 运行8秒
            example.stop();
            Thread.sleep(2000); // 等待消费者处理完剩余任务
        } catch (InterruptedException e) {
            Thread.currentThread().interrupt();
        }
        
        executor.shutdown();
        System.out.printf("队列剩余: %d%n", boundedQueue.size());
        // AI补全点
    }
    
    public static void demonstrateConcurrentHashMap() {
        System.out.println("\n=== ConcurrentHashMap演示 ===");
        
        ConcurrentCache<String, String> cache = new ConcurrentCache<>(2);
        ExecutorService executor = Executors.newFixedThreadPool(6);
        
        // 并发写入
        for (int i = 1; i <= 3; i++) {
            final int threadId = i;
            executor.submit(() -> {
                for (int j = 1; j <= 5; j++) {
                    String key = "key_" + threadId + "_" + j;
                    String value = "value_" + threadId + "_" + j;
                    cache.put(key, value);
                    
                    try {
                        Thread.sleep(100);
                    } catch (InterruptedException e) {
                        Thread.currentThread().interrupt();
                        return;
                    }
                }
            });
        }
        
        // 并发读取和计算
        for (int i = 1; i <= 3; i++) {
            final int threadId = i;
            executor.submit(() -> {
                for (int j = 1; j <= 8; j++) {
                    String key = "computed_" + threadId + "_" + j;
                    
                    // 测试computeIfAbsent
                    cache.computeIfAbsent(key, k -> {
                        try {
                            Thread.sleep(50); // 模拟计算时间
                        } catch (InterruptedException e) {
                            Thread.currentThread().interrupt();
                        }
                        return "computed_" + k;
                    });
                    
                    // 随机读取
                    if (j % 2 == 0) {
                        cache.get("key_" + (threadId % 3 + 1) + "_" + (j % 5 + 1));
                    }
                    
                    try {
                        Thread.sleep(150);
                    } catch (InterruptedException e) {
                        Thread.currentThread().interrupt();
                        return;
                    }
                }
            });
        }
        
        executor.shutdown();
        try {
            executor.awaitTermination(15, TimeUnit.SECONDS);
        } catch (InterruptedException e) {
            Thread.currentThread().interrupt();
        }
        
        System.out.printf("缓存大小: %d%n", cache.size());
        System.out.printf("缓存键: %s%n", cache.keySet().stream().limit(10).collect(Collectors.toList()));
        // AI补全点
    }
    
    public static void demonstrateCopyOnWriteArrayList() {
        System.out.println("\n=== CopyOnWriteArrayList演示 ===");
        
        CopyOnWriteArrayList<String> cowList = new CopyOnWriteArrayList<>();
        ExecutorService executor = Executors.newFixedThreadPool(4);
        
        // 写线程
        executor.submit(() -> {
            for (int i = 1; i <= 10; i++) {
                String item = "Item-" + i;
                cowList.add(item);
                System.out.printf("添加: %s [大小: %d] [线程: %s]%n", 
                                item, cowList.size(), Thread.currentThread().getName());
                
                try {
                    Thread.sleep(200);
                } catch (InterruptedException e) {
                    Thread.currentThread().interrupt();
                    return;
                }
            }
        });
        
        // 多个读线程
        for (int i = 1; i <= 3; i++) {
            final int readerId = i;
            executor.submit(() -> {
                for (int j = 0; j < 15; j++) {
                    List<String> snapshot = new ArrayList<>(cowList);
                    System.out.printf("读取器%d: 读取到 %d 个元素 [线程: %s]%n", 
                                    readerId, snapshot.size(), Thread.currentThread().getName());
                    
                    // 遍历快照
                    if (!snapshot.isEmpty()) {
                        String first = snapshot.get(0);
                        String last = snapshot.size() > 1 ? snapshot.get(snapshot.size() - 1) : first;
                        System.out.printf("读取器%d: 首元素=%s, 尾元素=%s%n", readerId, first, last);
                    }
                    
                    try {
                        Thread.sleep(300);
                    } catch (InterruptedException e) {
                        Thread.currentThread().interrupt();
                        return;
                    }
                }
            });
        }
        
        executor.shutdown();
        try {
            executor.awaitTermination(10, TimeUnit.SECONDS);
        } catch (InterruptedException e) {
            Thread.currentThread().interrupt();
        }
        
        System.out.printf("最终列表: %s%n", cowList);
        // AI补全点
    }
}

// 6. CompletableFuture异步编程
// ======================

class CompletableFutureDemo {
    
    // 模拟异步服务
    static class AsyncService {
        private final Random random = new Random();
        private final ExecutorService executor = Executors.newFixedThreadPool(4);
        
        public CompletableFuture<String> fetchUserData(String userId) {
            return CompletableFuture.supplyAsync(() -> {
                System.out.printf("获取用户数据: %s [线程: %s]%n", userId, Thread.currentThread().getName());
                
                // 模拟网络延迟
                try {
                    Thread.sleep(1000 + random.nextInt(1000));
                } catch (InterruptedException e) {
                    Thread.currentThread().interrupt();
                    throw new RuntimeException("获取用户数据被中断", e);
                }
                
                // 模拟偶尔失败
                if (random.nextDouble() < 0.1) {
                    throw new RuntimeException("用户数据获取失败: " + userId);
                }
                
                return String.format("用户数据: {id: %s, name: User_%s, email: %s@example.com}", 
                                   userId, userId, userId);
            }, executor);
        }
        
        public CompletableFuture<String> fetchUserPreferences(String userId) {
            return CompletableFuture.supplyAsync(() -> {
                System.out.printf("获取用户偏好: %s [线程: %s]%n", userId, Thread.currentThread().getName());
                
                try {
                    Thread.sleep(500 + random.nextInt(500));
                } catch (InterruptedException e) {
                    Thread.currentThread().interrupt();
                    throw new RuntimeException("获取用户偏好被中断", e);
                }
                
                return String.format("用户偏好: {userId: %s, theme: dark, language: zh-CN}", userId);
            }, executor);
        }
        
        public CompletableFuture<String> generateRecommendations(String userData, String preferences) {
            return CompletableFuture.supplyAsync(() -> {
                System.out.printf("生成推荐内容 [线程: %s]%n", Thread.currentThread().getName());
                
                try {
                    Thread.sleep(800 + random.nextInt(400));
                } catch (InterruptedException e) {
                    Thread.currentThread().interrupt();
                    throw new RuntimeException("生成推荐被中断", e);
                }
                
                return String.format("推荐内容: {基于: %s 和 %s}", 
                                   userData.substring(0, Math.min(20, userData.length())),
                                   preferences.substring(0, Math.min(20, preferences.length())));
            }, executor);
        }
        
        public void shutdown() {
            executor.shutdown();
        }
    }
    
    public static void demonstrateBasicCompletableFuture() {
        System.out.println("=== CompletableFuture基础演示 ===");
        
        // 简单的异步任务
        CompletableFuture<String> future1 = CompletableFuture.supplyAsync(() -> {
            System.out.printf("异步任务1开始 [线程: %s]%n", Thread.currentThread().getName());
            try {
                Thread.sleep(2000);
            } catch (InterruptedException e) {
                Thread.currentThread().interrupt();
            }
            return "任务1结果";
        });
        
        // 链式操作
        CompletableFuture<String> chainedFuture = future1
            .thenApply(result -> {
                System.out.printf("处理结果: %s [线程: %s]%n", result, Thread.currentThread().getName());
                return result.toUpperCase();
            })
            .thenApply(result -> {
                System.out.printf("进一步处理: %s [线程: %s]%n", result, Thread.currentThread().getName());
                return "处理后的" + result;
            });
        
        // 异步链式操作
        CompletableFuture<String> asyncChainedFuture = chainedFuture
            .thenApplyAsync(result -> {
                System.out.printf("异步处理: %s [线程: %s]%n", result, Thread.currentThread().getName());
                try {
                    Thread.sleep(1000);
                } catch (InterruptedException e) {
                    Thread.currentThread().interrupt();
                }
                return "最终结果: " + result;
            });
        
        // 等待结果
        try {
            String finalResult = asyncChainedFuture.get(10, TimeUnit.SECONDS);
            System.out.println("最终结果: " + finalResult);
        } catch (Exception e) {
            System.err.println("获取结果失败: " + e.getMessage());
        }
        // AI补全点
    }
    
    public static void demonstrateComposition() {
        System.out.println("\n=== CompletableFuture组合演示 ===");
        
        AsyncService service = new AsyncService();
        String userId = "12345";
        
        // 组合异步操作
        CompletableFuture<String> userDataFuture = service.fetchUserData(userId);
        CompletableFuture<String> preferencesFuture = service.fetchUserPreferences(userId);
        
        // 等待两个任务都完成，然后组合结果
        CompletableFuture<String> combinedFuture = userDataFuture
            .thenCombine(preferencesFuture, (userData, preferences) -> {
                System.out.printf("组合数据 [线程: %s]%n", Thread.currentThread().getName());
                return "组合结果: " + userData + " + " + preferences;
            });
        
        // 基于组合结果生成推荐
        CompletableFuture<String> recommendationFuture = userDataFuture
            .thenCompose(userData -> 
                preferencesFuture.thenCompose(preferences ->
                    service.generateRecommendations(userData, preferences)
                )
            );
        
        // 等待所有结果
        try {
            String combinedResult = combinedFuture.get(5, TimeUnit.SECONDS);
            System.out.println("组合结果: " + combinedResult);
            
            String recommendation = recommendationFuture.get(5, TimeUnit.SECONDS);
            System.out.println("推荐结果: " + recommendation);
        } catch (Exception e) {
            System.err.println("获取组合结果失败: " + e.getMessage());
        }
        
        service.shutdown();
        // AI补全点
    }
    
    public static void demonstrateErrorHandling() {
        System.out.println("\n=== CompletableFuture错误处理演示 ===");
        
        // 可能失败的任务
        CompletableFuture<String> riskyTask = CompletableFuture.supplyAsync(() -> {
            System.out.printf("执行风险任务 [线程: %s]%n", Thread.currentThread().getName());
            
            if (Math.random() < 0.5) {
                throw new RuntimeException("任务执行失败");
            }
            
            return "任务成功完成";
        });
        
        // 错误处理和恢复
        CompletableFuture<String> handledTask = riskyTask
            .exceptionally(throwable -> {
                System.out.printf("处理异常: %s [线程: %s]%n", 
                                throwable.getMessage(), Thread.currentThread().getName());
                return "默认结果（从异常中恢复）";
            })
            .thenApply(result -> {
                System.out.printf("后续处理: %s [线程: %s]%n", result, Thread.currentThread().getName());
                return "最终结果: " + result;
            });
        
        // 使用handle方法同时处理成功和失败
        CompletableFuture<String> handledTask2 = CompletableFuture.supplyAsync(() -> {
            if (Math.random() < 0.3) {
                throw new RuntimeException("另一个任务失败");
            }
            return "另一个任务成功";
        }).handle((result, throwable) -> {
            if (throwable != null) {
                System.out.printf("handle处理异常: %s [线程: %s]%n", 
                                throwable.getMessage(), Thread.currentThread().getName());
                return "handle恢复结果";
            } else {
                System.out.printf("handle处理成功: %s [线程: %s]%n", 
                                result, Thread.currentThread().getName());
                return "handle处理: " + result;
            }
        });
        
        // 等待结果
        try {
            String result1 = handledTask.get(3, TimeUnit.SECONDS);
            String result2 = handledTask2.get(3, TimeUnit.SECONDS);
            
            System.out.println("处理结果1: " + result1);
            System.out.println("处理结果2: " + result2);
        } catch (Exception e) {
            System.err.println("获取处理结果失败: " + e.getMessage());
        }
        // AI补全点
    }
    
    public static void demonstrateAllOfAnyOf() {
        System.out.println("\n=== CompletableFuture.allOf/anyOf演示 ===");
        
        // 创建多个异步任务
        List<CompletableFuture<String>> futures = IntStream.range(1, 6)
            .mapToObj(i -> CompletableFuture.supplyAsync(() -> {
                try {
                    int delay = (int) (Math.random() * 2000) + 500;
                    Thread.sleep(delay);
                    
                    if (i == 3 && Math.random() < 0.3) {
                        throw new RuntimeException("任务" + i + "失败");
                    }
                    
                    String result = "任务" + i + "完成";
                    System.out.printf("%s [线程: %s, 耗时: %dms]%n", 
                                    result, Thread.currentThread().getName(), delay);
                    return result;
                } catch (InterruptedException e) {
                    Thread.currentThread().interrupt();
                    throw new RuntimeException("任务" + i + "被中断", e);
                }
            }))
            .collect(Collectors.toList());
        
        // 等待任意一个完成
        CompletableFuture<Object> anyOfFuture = CompletableFuture.anyOf(
            futures.toArray(new CompletableFuture[0])
        );
        
        anyOfFuture.thenAccept(result -> {
            System.out.printf("第一个完成的任务: %s [线程: %s]%n", 
                            result, Thread.currentThread().getName());
        });
        
        // 等待所有任务完成
        CompletableFuture<Void> allOfFuture = CompletableFuture.allOf(
            futures.toArray(new CompletableFuture[0])
        );
        
        CompletableFuture<List<String>> allResultsFuture = allOfFuture.thenApply(v -> {
            List<String> results = new ArrayList<>();
            for (CompletableFuture<String> future : futures) {
                try {
                    results.add(future.get());
                } catch (Exception e) {
                    results.add("错误: " + e.getMessage());
                }
            }
            return results;
        });
        
        try {
            // 等待第一个完成
            Object firstResult = anyOfFuture.get(5, TimeUnit.SECONDS);
            System.out.println("anyOf结果: " + firstResult);
            
            // 等待所有完成
            List<String> allResults = allResultsFuture.get(10, TimeUnit.SECONDS);
            System.out.println("allOf结果: " + allResults);
        } catch (Exception e) {
            System.err.println("获取批量结果失败: " + e.getMessage());
        }
        // AI补全点
    }
}

// 7. 主演示类
// ======================

public class ConcurrencyDemo {
    
    public static void main(String[] args) {
        System.out.println("Java并发编程演示开始\n");
        
        try {
            // 基础线程演示
            BasicThreadDemo.demonstrateBasicThreads();
            BasicThreadDemo.demonstrateLambdaThreads();
            
            // 线程池演示
            ExecutorDemo.demonstrateFixedThreadPool();
            ExecutorDemo.demonstrateCachedThreadPool();
            ExecutorDemo.demonstrateScheduledThreadPool();
            ExecutorDemo.demonstrateCustomThreadPool();
            
            // 同步机制演示
            SynchronizationDemo.demonstrateSynchronizedMethods();
            SynchronizationDemo.demonstrateReentrantLock();
            SynchronizationDemo.demonstrateReadWriteLock();
            
            // 原子类演示
            AtomicDemo.demonstrateAtomicInteger();
            AtomicDemo.demonstrateAtomicReference();
            AtomicDemo.demonstrateLongAdder();
            
            // 并发集合演示
            ConcurrentCollectionsDemo.demonstrateBlockingQueue();
            ConcurrentCollectionsDemo.demonstrateConcurrentHashMap();
            ConcurrentCollectionsDemo.demonstrateCopyOnWriteArrayList();
            
            // CompletableFuture演示
            CompletableFutureDemo.demonstrateBasicCompletableFuture();
            CompletableFutureDemo.demonstrateComposition();
            CompletableFutureDemo.demonstrateErrorHandling();
            CompletableFutureDemo.demonstrateAllOfAnyOf();
            
        } catch (Exception e) {
            System.err.println("演示过程中发生错误: " + e.getMessage());
            e.printStackTrace();
        }
        
        System.out.println("\nJava并发编程演示完成");
        // AI补全点
    }
}

// AI补全点