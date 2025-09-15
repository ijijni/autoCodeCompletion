// Go并发模式示例
package main

import (
	"context"
	"fmt"
	"math/rand"
	"sync"
	"time"
)

// Worker Pool模式
type Job struct {
	ID     int
	Data   string
	Result chan string
}

type Worker struct {
	ID         int
	JobChannel chan Job
	QuitChan   chan bool
}

func NewWorker(id int, jobChannel chan Job) Worker {
	return Worker{
		ID:         id,
		JobChannel: jobChannel,
		QuitChan:   make(chan bool),
	}
}

func (w Worker) Start() {
	go func() {
		for {
			select {
			case job := <-w.JobChannel:
				fmt.Printf("Worker %d 开始处理任务 %d\n", w.ID, job.ID)
				// 模拟工作
				time.Sleep(time.Duration(rand.Intn(1000)) * time.Millisecond)
				result := fmt.Sprintf("任务 %d 由 Worker %d 完成: %s", job.ID, w.ID, job.Data)
				job.Result <- result
				fmt.Printf("Worker %d 完成任务 %d\n", w.ID, job.ID)
			case <-w.QuitChan:
				fmt.Printf("Worker %d 停止\n", w.ID)
				return
			}
		}
	}()
}

func (w Worker) Stop() {
	go func() {
		w.QuitChan <- true
	}()
}

type WorkerPool struct {
	Workers    []Worker
	JobChannel chan Job
	NumWorkers int
}

func NewWorkerPool(numWorkers int) *WorkerPool {
	jobChannel := make(chan Job, 100)
	workers := make([]Worker, numWorkers)

	for i := 0; i < numWorkers; i++ {
		workers[i] = NewWorker(i+1, jobChannel)
	}

	return &WorkerPool{
		Workers:    workers,
		JobChannel: jobChannel,
		NumWorkers: numWorkers,
	}
}

func (wp *WorkerPool) Start() {
	for _, worker := range wp.Workers {
		worker.Start()
	}
}

func (wp *WorkerPool) Stop() {
	for _, worker := range wp.Workers {
		worker.Stop()
	}
}

func (wp *WorkerPool) AddJob(job Job) {
	wp.JobChannel <- job
}

func workerPoolExample() {
	fmt.Println("\n=== Worker Pool 模式 ===")

	pool := NewWorkerPool(3)
	pool.Start()

	// 添加任务
	results := make([]chan string, 10)
	for i := 0; i < 10; i++ {
		results[i] = make(chan string, 1)
		job := Job{
			ID:     i + 1,
			Data:   fmt.Sprintf("数据-%d", i+1),
			Result: results[i],
		}
		pool.AddJob(job)
	}

	// 收集结果
	for i := 0; i < 10; i++ {
		result := <-results[i]
		fmt.Println("收到结果:", result)
	}

	pool.Stop()
	time.Sleep(100 * time.Millisecond) // 等待worker停止
}

// Fan-in/Fan-out模式
func producer(name string, out chan<- string) {
	for i := 0; i < 5; i++ {
		message := fmt.Sprintf("%s-消息-%d", name, i+1)
		out <- message
		fmt.Printf("生产者 %s 发送: %s\n", name, message)
		time.Sleep(time.Duration(rand.Intn(500)) * time.Millisecond)
	}
	close(out)
}

func fanIn(input1, input2 <-chan string) <-chan string {
	output := make(chan string)
	go func() {
		defer close(output)
		for {
			select {
			case msg, ok := <-input1:
				if !ok {
					input1 = nil
				} else {
					output <- msg
				}
			case msg, ok := <-input2:
				if !ok {
					input2 = nil
				} else {
					output <- msg
				}
			}
			if input1 == nil && input2 == nil {
				break
			}
		}
	}()
	return output
}

func fanInFanOutExample() {
	fmt.Println("\n=== Fan-in/Fan-out 模式 ===")

	// Fan-out: 创建多个生产者
	ch1 := make(chan string)
	ch2 := make(chan string)

	go producer("生产者1", ch1)
	go producer("生产者2", ch2)

	// Fan-in: 合并多个通道
	merged := fanIn(ch1, ch2)

	// 消费合并后的消息
	for message := range merged {
		fmt.Println("消费者收到:", message)
	}
}

// Pipeline模式
func stage1(input <-chan int) <-chan int {
	output := make(chan int)
	go func() {
		defer close(output)
		for num := range input {
			result := num * 2
			fmt.Printf("阶段1: %d -> %d\n", num, result)
			output <- result
		}
	}()
	return output
}

func stage2(input <-chan int) <-chan int {
	output := make(chan int)
	go func() {
		defer close(output)
		for num := range input {
			result := num + 10
			fmt.Printf("阶段2: %d -> %d\n", num, result)
			output <- result
		}
	}()
	return output
}

func stage3(input <-chan int) <-chan string {
	output := make(chan string)
	go func() {
		defer close(output)
		for num := range input {
			result := fmt.Sprintf("结果-%d", num)
			fmt.Printf("阶段3: %d -> %s\n", num, result)
			output <- result
		}
	}()
	return output
}

func pipelineExample() {
	fmt.Println("\n=== Pipeline 模式 ===")

	// 创建输入通道
	input := make(chan int)

	// 构建管道
	stage1Out := stage1(input)
	stage2Out := stage2(stage1Out)
	stage3Out := stage3(stage2Out)

	// 发送数据到管道
	go func() {
		defer close(input)
		for i := 1; i <= 5; i++ {
			fmt.Printf("输入: %d\n", i)
			input <- i
		}
	}()

	// 接收最终结果
	for result := range stage3Out {
		fmt.Println("最终结果:", result)
	}
}

// Context模式
func contextWorker(ctx context.Context, id int, results chan<- string) {
	for {
		select {
		case <-ctx.Done():
			fmt.Printf("Worker %d 收到取消信号: %v\n", id, ctx.Err())
			return
		default:
			// 模拟工作
			time.Sleep(100 * time.Millisecond)
			select {
			case results <- fmt.Sprintf("Worker %d 的结果", id):
				fmt.Printf("Worker %d 完成一项工作\n", id)
			case <-ctx.Done():
				fmt.Printf("Worker %d 在发送结果时被取消\n", id)
				return
			}
		}
	}
}

func contextExample() {
	fmt.Println("\n=== Context 模式 ===")

	// 创建带超时的context
	ctx, cancel := context.WithTimeout(context.Background(), 2*time.Second)
	defer cancel()

	results := make(chan string, 10)

	// 启动多个worker
	for i := 1; i <= 3; i++ {
		go contextWorker(ctx, i, results)
	}

	// 收集结果直到context被取消
	for {
		select {
		case result := <-results:
			fmt.Println("收到结果:", result)
		case <-ctx.Done():
			fmt.Println("Context 超时，停止收集结果")
			return
		}
	}
}

// Select模式 - 超时处理
func selectTimeoutExample() {
	fmt.Println("\n=== Select 超时模式 ===")

	ch := make(chan string)

	// 模拟一个可能很慢的操作
	go func() {
		time.Sleep(3 * time.Second)
		ch <- "慢操作完成"
	}()

	select {
	case result := <-ch:
		fmt.Println("收到结果:", result)
	case <-time.After(1 * time.Second):
		fmt.Println("操作超时")
	}
}

// 信号量模式
type Semaphore struct {
	ch chan struct{}
}

func NewSemaphore(capacity int) *Semaphore {
	return &Semaphore{
		ch: make(chan struct{}, capacity),
	}
}

func (s *Semaphore) Acquire() {
	s.ch <- struct{}{}
}

func (s *Semaphore) Release() {
	<-s.ch
}

func semaphoreExample() {
	fmt.Println("\n=== 信号量模式 ===")

	// 创建容量为2的信号量
	sem := NewSemaphore(2)
	var wg sync.WaitGroup

	// 启动5个goroutine，但同时只能有2个运行
	for i := 1; i <= 5; i++ {
		wg.Add(1)
		go func(id int) {
			defer wg.Done()

			sem.Acquire()
			fmt.Printf("Goroutine %d 获得资源\n", id)

			// 模拟工作
			time.Sleep(1 * time.Second)
			fmt.Printf("Goroutine %d 完成工作\n", id)

			sem.Release()
			fmt.Printf("Goroutine %d 释放资源\n", id)
		}(i)
	}

	wg.Wait()
	fmt.Println("所有goroutine完成")
}

// 发布-订阅模式
type PubSub struct {
	mu          sync.RWMutex
	subscribers map[string][]chan string
}

func NewPubSub() *PubSub {
	return &PubSub{
		subscribers: make(map[string][]chan string),
	}
}

func (ps *PubSub) Subscribe(topic string) <-chan string {
	ps.mu.Lock()
	defer ps.mu.Unlock()

	ch := make(chan string, 10)
	ps.subscribers[topic] = append(ps.subscribers[topic], ch)
	return ch
}

func (ps *PubSub) Publish(topic, message string) {
	ps.mu.RLock()
	defer ps.mu.RUnlock()

	for _, ch := range ps.subscribers[topic] {
		select {
		case ch <- message:
		default:
			// 如果通道满了，跳过这个订阅者
		}
	}
}

func pubSubExample() {
	fmt.Println("\n=== 发布-订阅模式 ===")

	pubsub := NewPubSub()

	// 创建订阅者
	sub1 := pubsub.Subscribe("news")
	sub2 := pubsub.Subscribe("news")
	sub3 := pubsub.Subscribe("sports")

	var wg sync.WaitGroup

	// 启动订阅者goroutine
	wg.Add(3)
	go func() {
		defer wg.Done()
		for msg := range sub1 {
			fmt.Println("订阅者1收到新闻:", msg)
		}
	}()

	go func() {
		defer wg.Done()
		for msg := range sub2 {
			fmt.Println("订阅者2收到新闻:", msg)
		}
	}()

	go func() {
		defer wg.Done()
		for msg := range sub3 {
			fmt.Println("订阅者3收到体育:", msg)
		}
	}()

	// 发布消息
	time.Sleep(100 * time.Millisecond)
	pubsub.Publish("news", "重要新闻1")
	pubsub.Publish("news", "重要新闻2")
	pubsub.Publish("sports", "体育新闻1")

	time.Sleep(100 * time.Millisecond)

	// 关闭订阅通道
	ps := pubsub
	ps.mu.Lock()
	for _, subs := range ps.subscribers {
		for _, ch := range subs {
			close(ch)
		}
	}
	ps.mu.Unlock()

	wg.Wait()
}

// 限流器模式
type RateLimiter struct {
	tokens chan struct{}
	ticker *time.Ticker
}

func NewRateLimiter(rate int, burst int) *RateLimiter {
	rl := &RateLimiter{
		tokens: make(chan struct{}, burst),
		ticker: time.NewTicker(time.Second / time.Duration(rate)),
	}

	// 初始填满令牌桶
	for i := 0; i < burst; i++ {
		rl.tokens <- struct{}{}
	}

	// 定期添加令牌
	go func() {
		for range rl.ticker.C {
			select {
			case rl.tokens <- struct{}{}:
			default:
				// 令牌桶已满
			}
		}
	}()

	return rl
}

func (rl *RateLimiter) Allow() bool {
	select {
	case <-rl.tokens:
		return true
	default:
		return false
	}
}

func (rl *RateLimiter) Stop() {
	rl.ticker.Stop()
}

func rateLimiterExample() {
	fmt.Println("\n=== 限流器模式 ===")

	// 创建限流器：每秒2个请求，突发容量3
	limiter := NewRateLimiter(2, 3)
	defer limiter.Stop()

	// 模拟请求
	for i := 1; i <= 10; i++ {
		if limiter.Allow() {
			fmt.Printf("请求 %d 被允许\n", i)
		} else {
			fmt.Printf("请求 %d 被限流\n", i)
		}
		time.Sleep(200 * time.Millisecond)
	}
}

func main() {
	fmt.Println("=== Go并发模式示例 ===")

	rand.Seed(time.Now().UnixNano())

	workerPoolExample()
	fanInFanOutExample()
	pipelineExample()
	contextExample()
	selectTimeoutExample()
	semaphoreExample()
	pubSubExample()
	rateLimiterExample()

	fmt.Println("\n所有并发模式示例完成!")
}
