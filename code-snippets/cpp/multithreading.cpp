/**
 * C++多线程编程示例
 */
#include <iostream>
#include <thread>
#include <mutex>
#include <condition_variable>
#include <atomic>
#include <future>
#include <queue>
#include <vector>
#include <chrono>
#include <random>
#include <functional>

// 基础线程示例
void basicThreadExample() {
    std::cout << "\n=== 基础线程示例 ===" << std::endl;
    
    // 简单线程函数
    auto worker = [](int id, int count) {
        for (int i = 0; i < count; ++i) {
            std::cout << "线程 " << id << " 执行任务 " << i << std::endl;
            std::this_thread::sleep_for(std::chrono::milliseconds(100));
        }
    };
    
    // 创建并启动线程
    std::thread t1(worker, 1, 3);
    std::thread t2(worker, 2, 3);
    
    // 等待线程完成
    t1.join();
    t2.join();
    
    std::cout << "所有线程完成" << std::endl;
}

// 互斥锁示例
class Counter {
private:
    int count;
    mutable std::mutex mtx;
    
public:
    Counter() : count(0) {}
    
    void increment() {
        std::lock_guard<std::mutex> lock(mtx);
        ++count;
        std::cout << "计数器增加到: " << count << std::endl;
    }
    
    void decrement() {
        std::lock_guard<std::mutex> lock(mtx);
        --count;
        std::cout << "计数器减少到: " << count << std::endl;
    }
    
    int getValue() const {
        std::lock_guard<std::mutex> lock(mtx);
        return count;
    }
};

void mutexExample() {
    std::cout << "\n=== 互斥锁示例 ===" << std::endl;
    
    Counter counter;
    std::vector<std::thread> threads;
    
    // 创建多个线程同时操作计数器
    for (int i = 0; i < 5; ++i) {
        threads.emplace_back([&counter, i]() {
            for (int j = 0; j < 3; ++j) {
                if (i % 2 == 0) {
                    counter.increment();
                } else {
                    counter.decrement();
                }
                std::this_thread::sleep_for(std::chrono::milliseconds(50));
            }
        });
    }
    
    // 等待所有线程完成
    for (auto& t : threads) {
        t.join();
    }
    
    std::cout << "最终计数器值: " << counter.getValue() << std::endl;
}

// 条件变量示例 - 生产者消费者模式
class ProducerConsumer {
private:
    std::queue<int> buffer;
    std::mutex mtx;
    std::condition_variable cv;
    bool finished = false;
    const size_t maxSize = 5;
    
public:
    void producer(int id) {
        std::random_device rd;
        std::mt19937 gen(rd());
        std::uniform_int_distribution<> dis(1, 100);
        
        for (int i = 0; i < 10; ++i) {
            std::unique_lock<std::mutex> lock(mtx);
            
            // 等待缓冲区有空间
            cv.wait(lock, [this] { return buffer.size() < maxSize; });
            
            int item = dis(gen);
            buffer.push(item);
            std::cout << "生产者 " << id << " 生产: " << item 
                      << " (缓冲区大小: " << buffer.size() << ")" << std::endl;
            
            cv.notify_all();
            lock.unlock();
            
            std::this_thread::sleep_for(std::chrono::milliseconds(100));
        }
    }
    
    void consumer(int id) {
        while (true) {
            std::unique_lock<std::mutex> lock(mtx);
            
            // 等待缓冲区有数据或生产完成
            cv.wait(lock, [this] { return !buffer.empty() || finished; });
            
            if (buffer.empty() && finished) {
                break;
            }
            
            if (!buffer.empty()) {
                int item = buffer.front();
                buffer.pop();
                std::cout << "消费者 " << id << " 消费: " << item 
                          << " (缓冲区大小: " << buffer.size() << ")" << std::endl;
                
                cv.notify_all();
                lock.unlock();
                
                std::this_thread::sleep_for(std::chrono::milliseconds(150));
            }
        }
    }
    
    void setFinished() {
        std::lock_guard<std::mutex> lock(mtx);
        finished = true;
        cv.notify_all();
    }
};

void conditionVariableExample() {
    std::cout << "\n=== 条件变量示例 ===" << std::endl;
    
    ProducerConsumer pc;
    
    std::thread producer1(&ProducerConsumer::producer, &pc, 1);
    std::thread consumer1(&ProducerConsumer::consumer, &pc, 1);
    std::thread consumer2(&ProducerConsumer::consumer, &pc, 2);
    
    producer1.join();
    pc.setFinished();
    
    consumer1.join();
    consumer2.join();
    
    std::cout << "生产者消费者示例完成" << std::endl;
}

// 原子操作示例
void atomicExample() {
    std::cout << "\n=== 原子操作示例 ===" << std::endl;
    
    std::atomic<int> atomicCounter(0);
    std::vector<std::thread> threads;
    
    // 创建多个线程同时操作原子变量
    for (int i = 0; i < 10; ++i) {
        threads.emplace_back([&atomicCounter, i]() {
            for (int j = 0; j < 1000; ++j) {
                atomicCounter.fetch_add(1);
            }
            std::cout << "线程 " << i << " 完成" << std::endl;
        });
    }
    
    // 等待所有线程完成
    for (auto& t : threads) {
        t.join();
    }
    
    std::cout << "原子计数器最终值: " << atomicCounter.load() << std::endl;
    
    // 原子操作的其他示例
    std::atomic<bool> flag(false);
    std::atomic<double> atomicDouble(0.0);
    
    std::cout << "原子布尔值: " << flag.load() << std::endl;
    flag.store(true);
    std::cout << "原子布尔值: " << flag.load() << std::endl;
    
    atomicDouble.store(3.14);
    std::cout << "原子浮点数: " << atomicDouble.load() << std::endl;
}

// Future和Promise示例
int calculateSum(int start, int end) {
    int sum = 0;
    for (int i = start; i <= end; ++i) {
        sum += i;
    }
    std::this_thread::sleep_for(std::chrono::milliseconds(100));
    return sum;
}

void futurePromiseExample() {
    std::cout << "\n=== Future和Promise示例 ===" << std::endl;
    
    // 使用std::async
    auto future1 = std::async(std::launch::async, calculateSum, 1, 1000);
    auto future2 = std::async(std::launch::async, calculateSum, 1001, 2000);
    auto future3 = std::async(std::launch::async, calculateSum, 2001, 3000);
    
    std::cout << "等待异步计算结果..." << std::endl;
    
    int result1 = future1.get();
    int result2 = future2.get();
    int result3 = future3.get();
    
    std::cout << "结果1: " << result1 << std::endl;
    std::cout << "结果2: " << result2 << std::endl;
    std::cout << "结果3: " << result3 << std::endl;
    std::cout << "总和: " << (result1 + result2 + result3) << std::endl;
    
    // 使用Promise和Future
    std::promise<std::string> promise;
    std::future<std::string> future = promise.get_future();
    
    std::thread worker([&promise]() {
        std::this_thread::sleep_for(std::chrono::seconds(1));
        promise.set_value("Hello from worker thread!");
    });
    
    std::cout << "等待Promise结果..." << std::endl;
    std::string message = future.get();
    std::cout << "收到消息: " << message << std::endl;
    
    worker.join();
}

// 线程池示例
class ThreadPool {
private:
    std::vector<std::thread> workers;
    std::queue<std::function<void()>> tasks;
    std::mutex queueMutex;
    std::condition_variable condition;
    bool stop;
    
public:
    ThreadPool(size_t numThreads) : stop(false) {
        for (size_t i = 0; i < numThreads; ++i) {
            workers.emplace_back([this] {
                while (true) {
                    std::function<void()> task;
                    
                    {
                        std::unique_lock<std::mutex> lock(queueMutex);
                        condition.wait(lock, [this] { return stop || !tasks.empty(); });
                        
                        if (stop && tasks.empty()) {
                            return;
                        }
                        
                        task = std::move(tasks.front());
                        tasks.pop();
                    }
                    
                    task();
                }
            });
        }
    }
    
    template<class F, class... Args>
    auto enqueue(F&& f, Args&&... args) 
        -> std::future<typename std::result_of<F(Args...)>::type> {
        
        using return_type = typename std::result_of<F(Args...)>::type;
        
        auto task = std::make_shared<std::packaged_task<return_type()>>(
            std::bind(std::forward<F>(f), std::forward<Args>(args)...)
        );
        
        std::future<return_type> result = task->get_future();
        
        {
            std::unique_lock<std::mutex> lock(queueMutex);
            
            if (stop) {
                throw std::runtime_error("enqueue on stopped ThreadPool");
            }
            
            tasks.emplace([task]() { (*task)(); });
        }
        
        condition.notify_one();
        return result;
    }
    
    ~ThreadPool() {
        {
            std::unique_lock<std::mutex> lock(queueMutex);
            stop = true;
        }
        
        condition.notify_all();
        
        for (std::thread& worker : workers) {
            worker.join();
        }
    }
};

void threadPoolExample() {
    std::cout << "\n=== 线程池示例 ===" << std::endl;
    
    ThreadPool pool(4);
    std::vector<std::future<int>> results;
    
    // 提交任务到线程池
    for (int i = 0; i < 8; ++i) {
        results.emplace_back(
            pool.enqueue([i] {
                std::cout << "任务 " << i << " 在线程 " 
                          << std::this_thread::get_id() << " 中执行" << std::endl;
                std::this_thread::sleep_for(std::chrono::milliseconds(100));
                return i * i;
            })
        );
    }
    
    // 获取结果
    for (auto& result : results) {
        std::cout << "任务结果: " << result.get() << std::endl;
    }
}

// 读写锁示例
class ReadWriteLock {
private:
    mutable std::shared_mutex mtx;
    std::string data;
    
public:
    ReadWriteLock() : data("初始数据") {}
    
    std::string read() const {
        std::shared_lock<std::shared_mutex> lock(mtx);
        std::cout << "读取数据: " << data << " (线程: " 
                  << std::this_thread::get_id() << ")" << std::endl;
        std::this_thread::sleep_for(std::chrono::milliseconds(100));
        return data;
    }
    
    void write(const std::string& newData) {
        std::unique_lock<std::shared_mutex> lock(mtx);
        std::cout << "写入数据: " << newData << " (线程: " 
                  << std::this_thread::get_id() << ")" << std::endl;
        data = newData;
        std::this_thread::sleep_for(std::chrono::milliseconds(200));
    }
};

void readWriteLockExample() {
    std::cout << "\n=== 读写锁示例 ===" << std::endl;
    
    ReadWriteLock rwLock;
    std::vector<std::thread> threads;
    
    // 创建多个读线程
    for (int i = 0; i < 5; ++i) {
        threads.emplace_back([&rwLock, i]() {
            rwLock.read();
        });
    }
    
    // 创建写线程
    threads.emplace_back([&rwLock]() {
        rwLock.write("新数据1");
    });
    
    // 再创建一些读线程
    for (int i = 0; i < 3; ++i) {
        threads.emplace_back([&rwLock, i]() {
            rwLock.read();
        });
    }
    
    // 再创建一个写线程
    threads.emplace_back([&rwLock]() {
        rwLock.write("新数据2");
    });
    
    // 等待所有线程完成
    for (auto& t : threads) {
        t.join();
    }
}

int main() {
    std::cout << "=== C++多线程编程示例 ===" << std::endl;
    
    basicThreadExample();
    mutexExample();
    conditionVariableExample();
    atomicExample();
    futurePromiseExample();
    threadPoolExample();
    readWriteLockExample();
    
    std::cout << "\n所有多线程示例完成!" << std::endl;
    return 0;
}
