/**
 * Rust并发和异步编程示例
 */

use std::sync::{Arc, Mutex, RwLock, mpsc, Barrier};
use std::thread;
use std::time::{Duration, Instant};
use std::collections::HashMap;
use tokio::time::sleep;
use tokio::sync::{Semaphore, oneshot, broadcast};
use futures::future::join_all;

// 基础线程示例
fn basic_threading_examples() {
    println!("\n=== 基础线程示例 ===");
    
    // 创建线程
    let handle = thread::spawn(|| {
        for i in 1..=5 {
            println!("线程中的数字: {}", i);
            thread::sleep(Duration::from_millis(100));
        }
    });
    
    // 主线程工作
    for i in 1..=3 {
        println!("主线程中的数字: {}", i);
        thread::sleep(Duration::from_millis(150));
    }
    
    // 等待线程完成
    handle.join().unwrap();
    
    // 线程间数据传递
    let data = vec![1, 2, 3, 4, 5];
    let handle = thread::spawn(move || {
        let sum: i32 = data.iter().sum();
        println!("线程计算的和: {}", sum);
        sum
    });
    
    let result = handle.join().unwrap();
    println!("从线程获取的结果: {}", result);
}

// 共享状态示例
fn shared_state_examples() {
    println!("\n=== 共享状态示例 ===");
    
    // 使用Arc和Mutex
    let counter = Arc::new(Mutex::new(0));
    let mut handles = vec![];
    
    for i in 0..10 {
        let counter = Arc::clone(&counter);
        let handle = thread::spawn(move || {
            let mut num = counter.lock().unwrap();
            *num += 1;
            println!("线程 {} 增加计数器", i);
        });
        handles.push(handle);
    }
    
    for handle in handles {
        handle.join().unwrap();
    }
    
    println!("最终计数器值: {}", *counter.lock().unwrap());
    
    // 使用RwLock
    let data = Arc::new(RwLock::new(HashMap::new()));
    let mut handles = vec![];
    
    // 写入线程
    for i in 0..3 {
        let data = Arc::clone(&data);
        let handle = thread::spawn(move || {
            let mut map = data.write().unwrap();
            map.insert(format!("key{}", i), i * 10);
            println!("写入线程 {} 完成", i);
        });
        handles.push(handle);
    }
    
    // 读取线程
    for i in 0..5 {
        let data = Arc::clone(&data);
        let handle = thread::spawn(move || {
            thread::sleep(Duration::from_millis(50));
            let map = data.read().unwrap();
            println!("读取线程 {} 看到 {} 个元素", i, map.len());
        });
        handles.push(handle);
    }
    
    for handle in handles {
        handle.join().unwrap();
    }
}

// 消息传递示例
fn message_passing_examples() {
    println!("\n=== 消息传递示例 ===");
    
    // 单生产者单消费者
    let (tx, rx) = mpsc::channel();
    
    thread::spawn(move || {
        let messages = vec!["消息1", "消息2", "消息3"];
        for msg in messages {
            tx.send(msg).unwrap();
            thread::sleep(Duration::from_millis(100));
        }
    });
    
    for received in rx {
        println!("收到消息: {}", received);
    }
    
    // 多生产者单消费者
    let (tx, rx) = mpsc::channel();
    
    for i in 0..3 {
        let tx = tx.clone();
        thread::spawn(move || {
            let msg = format!("来自线程 {} 的消息", i);
            tx.send(msg).unwrap();
        });
    }
    
    drop(tx); // 关闭发送端
    
    for received in rx {
        println!("收到: {}", received);
    }
}

// 同步原语示例
fn synchronization_primitives() {
    println!("\n=== 同步原语示例 ===");
    
    // 使用Barrier
    let barrier = Arc::new(Barrier::new(3));
    let mut handles = vec![];
    
    for i in 0..3 {
        let barrier = Arc::clone(&barrier);
        let handle = thread::spawn(move || {
            println!("线程 {} 开始工作", i);
            thread::sleep(Duration::from_millis(100 * (i + 1) as u64));
            println!("线程 {} 到达屏障", i);
            
            barrier.wait();
            
            println!("线程 {} 继续执行", i);
        });
        handles.push(handle);
    }
    
    for handle in handles {
        handle.join().unwrap();
    }
}

// 异步基础示例
async fn basic_async_examples() {
    println!("\n=== 异步基础示例 ===");
    
    // 简单异步函数
    async fn fetch_data(id: u32) -> String {
        sleep(Duration::from_millis(100)).await;
        format!("数据-{}", id)
    }
    
    // 顺序执行
    let start = Instant::now();
    let data1 = fetch_data(1).await;
    let data2 = fetch_data(2).await;
    let sequential_time = start.elapsed();
    
    println!("顺序执行结果: {}, {}", data1, data2);
    println!("顺序执行时间: {:?}", sequential_time);
    
    // 并发执行
    let start = Instant::now();
    let (data3, data4) = tokio::join!(fetch_data(3), fetch_data(4));
    let concurrent_time = start.elapsed();
    
    println!("并发执行结果: {}, {}", data3, data4);
    println!("并发执行时间: {:?}", concurrent_time);
}

// 异步任务管理
async fn async_task_management() {
    println!("\n=== 异步任务管理 ===");
    
    // 使用JoinHandle
    let handle1 = tokio::spawn(async {
        sleep(Duration::from_millis(100)).await;
        "任务1完成"
    });
    
    let handle2 = tokio::spawn(async {
        sleep(Duration::from_millis(200)).await;
        "任务2完成"
    });
    
    let results = tokio::try_join!(handle1, handle2).unwrap();
    println!("任务结果: {:?}", results);
    
    // 使用join_all处理多个任务
    let tasks: Vec<_> = (0..5)
        .map(|i| {
            tokio::spawn(async move {
                sleep(Duration::from_millis(50 * i)).await;
                format!("任务 {} 完成", i)
            })
        })
        .collect();
    
    let results = join_all(tasks).await;
    for result in results {
        match result {
            Ok(msg) => println!("{}", msg),
            Err(e) => println!("任务失败: {:?}", e),
        }
    }
}

// 异步同步原语
async fn async_synchronization() {
    println!("\n=== 异步同步原语 ===");
    
    // 使用Semaphore限制并发
    let semaphore = Arc::new(Semaphore::new(2));
    let mut handles = vec![];
    
    for i in 0..5 {
        let semaphore = Arc::clone(&semaphore);
        let handle = tokio::spawn(async move {
            let _permit = semaphore.acquire().await.unwrap();
            println!("任务 {} 获得许可", i);
            sleep(Duration::from_millis(1000)).await;
            println!("任务 {} 完成", i);
        });
        handles.push(handle);
    }
    
    for handle in handles {
        handle.join().unwrap();
    }
}

// 异步通道示例
async fn async_channels() {
    println!("\n=== 异步通道示例 ===");
    
    // oneshot通道
    let (tx, rx) = oneshot::channel();
    
    tokio::spawn(async move {
        sleep(Duration::from_millis(100)).await;
        tx.send("oneshot消息").unwrap();
    });
    
    let msg = rx.await.unwrap();
    println!("收到oneshot消息: {}", msg);
    
    // broadcast通道
    let (tx, mut rx1) = broadcast::channel(16);
    let mut rx2 = tx.subscribe();
    let mut rx3 = tx.subscribe();
    
    tokio::spawn(async move {
        for i in 0..3 {
            tx.send(format!("广播消息 {}", i)).unwrap();
            sleep(Duration::from_millis(100)).await;
        }
    });
    
    // 多个接收者
    let handle1 = tokio::spawn(async move {
        while let Ok(msg) = rx1.recv().await {
            println!("接收者1: {}", msg);
        }
    });
    
    let handle2 = tokio::spawn(async move {
        while let Ok(msg) = rx2.recv().await {
            println!("接收者2: {}", msg);
        }
    });
    
    let handle3 = tokio::spawn(async move {
        while let Ok(msg) = rx3.recv().await {
            println!("接收者3: {}", msg);
        }
    });
    
    tokio::try_join!(handle1, handle2, handle3).unwrap();
}

// 异步流处理
async fn async_stream_processing() {
    println!("\n=== 异步流处理 ===");
    
    use tokio_stream::{self as stream, StreamExt};
    
    // 创建异步流
    let mut stream = stream::iter(1..=5)
        .map(|x| async move {
            sleep(Duration::from_millis(100)).await;
            x * 2
        })
        .buffer_unordered(3); // 并发处理最多3个项目
    
    while let Some(result) = stream.next().await {
        println!("流处理结果: {}", result);
    }
}

// 错误处理和超时
async fn error_handling_and_timeout() {
    println!("\n=== 错误处理和超时 ===");
    
    // 超时处理
    async fn slow_operation() -> Result<String, &'static str> {
        sleep(Duration::from_millis(2000)).await;
        Ok("慢操作完成".to_string())
    }
    
    match tokio::time::timeout(Duration::from_millis(1000), slow_operation()).await {
        Ok(Ok(result)) => println!("操作成功: {}", result),
        Ok(Err(e)) => println!("操作失败: {}", e),
        Err(_) => println!("操作超时"),
    }
    
    // 错误传播
    async fn fallible_operation(should_fail: bool) -> Result<i32, String> {
        if should_fail {
            Err("操作失败".to_string())
        } else {
            Ok(42)
        }
    }
    
    let results = futures::future::join_all(vec![
        fallible_operation(false),
        fallible_operation(true),
        fallible_operation(false),
    ]).await;
    
    for (i, result) in results.into_iter().enumerate() {
        match result {
            Ok(value) => println!("操作 {} 成功: {}", i, value),
            Err(e) => println!("操作 {} 失败: {}", i, e),
        }
    }
}

// 工作窃取和任务调度
async fn work_stealing_example() {
    println!("\n=== 工作窃取示例 ===");
    
    // CPU密集型任务
    fn cpu_intensive_task(n: u64) -> u64 {
        (0..n).map(|i| i * i).sum()
    }
    
    // 在不同的任务中运行CPU密集型工作
    let tasks: Vec<_> = (0..4)
        .map(|i| {
            tokio::task::spawn_blocking(move || {
                let result = cpu_intensive_task(1000000);
                println!("CPU任务 {} 完成，结果: {}", i, result);
                result
            })
        })
        .collect();
    
    let results = futures::future::join_all(tasks).await;
    let total: u64 = results.into_iter().map(|r| r.unwrap()).sum();
    println!("所有CPU任务总和: {}", total);
}

// 主函数
#[tokio::main]
async fn main() {
    println!("=== Rust并发和异步编程示例 ===");
    
    // 线程示例
    basic_threading_examples();
    shared_state_examples();
    message_passing_examples();
    synchronization_primitives();
    
    // 异步示例
    basic_async_examples().await;
    async_task_management().await;
    async_synchronization().await;
    async_channels().await;
    async_stream_processing().await;
    error_handling_and_timeout().await;
    work_stealing_example().await;
    
    println!("\n所有并发和异步示例完成!");
}
