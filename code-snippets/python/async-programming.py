# Python异步编程代码片段
# 用于测试AI代码补全功能

import asyncio
import aiohttp
import aiofiles
import time
import random
import json
from typing import List, Dict, Any, Optional, Callable, Awaitable, AsyncGenerator, AsyncIterator
from dataclasses import dataclass
from contextlib import asynccontextmanager
from concurrent.futures import ThreadPoolExecutor, ProcessPoolExecutor
import weakref
from datetime import datetime, timedelta
import logging

# 1. 基础异步编程
# ======================

async def basic_async_function() -> str:
    """基础异步函数"""
    print("异步函数开始执行")
    await asyncio.sleep(1)  # 模拟异步操作
    print("异步函数执行完成")
    return "异步操作结果"

async def async_with_timeout(timeout: float = 2.0) -> str:
    """带超时的异步函数"""
    try:
        # 模拟可能超时的操作
        await asyncio.sleep(random.uniform(0.5, 3.0))
        return "操作成功完成"
    except asyncio.TimeoutError:
        return "操作超时"

async def concurrent_tasks_demo():
    """并发任务演示"""
    async def task(name: str, delay: float) -> str:
        print(f"任务 {name} 开始")
        await asyncio.sleep(delay)
        print(f"任务 {name} 完成")
        return f"任务 {name} 的结果"
    
    # 创建多个并发任务
    tasks = [
        task("A", 1.0),
        task("B", 2.0),
        task("C", 1.5)
    ]
    
    # 并发执行所有任务
    results = await asyncio.gather(*tasks)
    return results
    # AI补全点

async def async_generator_demo() -> AsyncGenerator[int, None]:
    """异步生成器演示"""
    for i in range(10):
        # 模拟异步获取数据
        await asyncio.sleep(0.1)
        yield i * i
    # AI补全点

async def async_iterator_demo():
    """异步迭代器使用演示"""
    total = 0
    async for value in async_generator_demo():
        total += value
        print(f"接收到值: {value}, 累计: {total}")
    return total

# 2. 异步网络编程
# ======================

class AsyncHTTPClient:
    """异步HTTP客户端"""
    
    def __init__(self, timeout: float = 30.0):
        self.timeout = aiohttp.ClientTimeout(total=timeout)
        self.session: Optional[aiohttp.ClientSession] = None
    
    async def __aenter__(self):
        """异步上下文管理器入口"""
        self.session = aiohttp.ClientSession(timeout=self.timeout)
        return self
    
    async def __aexit__(self, exc_type, exc_val, exc_tb):
        """异步上下文管理器出口"""
        if self.session:
            await self.session.close()
    
    async def get(self, url: str, **kwargs) -> Dict[str, Any]:
        """GET请求"""
        if not self.session:
            raise RuntimeError("客户端未初始化，请在async with中使用")
        
        try:
            async with self.session.get(url, **kwargs) as response:
                response.raise_for_status()
                content_type = response.headers.get('content-type', '').lower()
                
                if 'application/json' in content_type:
                    data = await response.json()
                else:
                    data = await response.text()
                
                return {
                    'status': response.status,
                    'headers': dict(response.headers),
                    'data': data
                }
        except Exception as e:
            return {
                'error': str(e),
                'status': getattr(e, 'status', None)
            }
        # AI补全点
    
    async def post(self, url: str, data: Any = None, json_data: Any = None, **kwargs) -> Dict[str, Any]:
        """POST请求"""
        if not self.session:
            raise RuntimeError("客户端未初始化，请在async with中使用")
        
        try:
            kwargs_copy = kwargs.copy()
            if json_data is not None:
                kwargs_copy['json'] = json_data
            elif data is not None:
                kwargs_copy['data'] = data
            
            async with self.session.post(url, **kwargs_copy) as response:
                response.raise_for_status()
                content_type = response.headers.get('content-type', '').lower()
                
                if 'application/json' in content_type:
                    response_data = await response.json()
                else:
                    response_data = await response.text()
                
                return {
                    'status': response.status,
                    'headers': dict(response.headers),
                    'data': response_data
                }
        except Exception as e:
            return {
                'error': str(e),
                'status': getattr(e, 'status', None)
            }
        # AI补全点
    
    async def download_file(self, url: str, filename: str, chunk_size: int = 8192) -> Dict[str, Any]:
        """下载文件"""
        if not self.session:
            raise RuntimeError("客户端未初始化，请在async with中使用")
        
        try:
            async with self.session.get(url) as response:
                response.raise_for_status()
                
                total_size = int(response.headers.get('content-length', 0))
                downloaded = 0
                
                async with aiofiles.open(filename, 'wb') as file:
                    async for chunk in response.content.iter_chunked(chunk_size):
                        await file.write(chunk)
                        downloaded += len(chunk)
                        
                        if total_size > 0:
                            progress = (downloaded / total_size) * 100
                            print(f"下载进度: {progress:.1f}%")
                
                return {
                    'status': 'success',
                    'filename': filename,
                    'size': downloaded
                }
        except Exception as e:
            return {
                'error': str(e),
                'status': 'failed'
            }
        # AI补全点

async def fetch_multiple_urls(urls: List[str], max_concurrent: int = 5) -> List[Dict[str, Any]]:
    """并发获取多个URL"""
    semaphore = asyncio.Semaphore(max_concurrent)
    
    async def fetch_with_semaphore(client: AsyncHTTPClient, url: str) -> Dict[str, Any]:
        async with semaphore:
            result = await client.get(url)
            result['url'] = url
            return result
    
    async with AsyncHTTPClient() as client:
        tasks = [fetch_with_semaphore(client, url) for url in urls]
        results = await asyncio.gather(*tasks, return_exceptions=True)
        
        # 处理异常结果
        processed_results = []
        for result in results:
            if isinstance(result, Exception):
                processed_results.append({'error': str(result), 'url': 'unknown'})
            else:
                processed_results.append(result)
        
        return processed_results
    # AI补全点

# 3. 异步文件操作
# ======================

class AsyncFileManager:
    """异步文件管理器"""
    
    @staticmethod
    async def read_file(filename: str, encoding: str = 'utf-8') -> str:
        """异步读取文件"""
        try:
            async with aiofiles.open(filename, 'r', encoding=encoding) as file:
                content = await file.read()
                return content
        except FileNotFoundError:
            raise FileNotFoundError(f"文件不存在: {filename}")
        except Exception as e:
            raise Exception(f"读取文件失败: {e}")
        # AI补全点
    
    @staticmethod
    async def write_file(filename: str, content: str, encoding: str = 'utf-8', append: bool = False) -> bool:
        """异步写入文件"""
        try:
            mode = 'a' if append else 'w'
            async with aiofiles.open(filename, mode, encoding=encoding) as file:
                await file.write(content)
                return True
        except Exception as e:
            print(f"写入文件失败: {e}")
            return False
        # AI补全点
    
    @staticmethod
    async def read_json_file(filename: str) -> Dict[str, Any]:
        """异步读取JSON文件"""
        content = await AsyncFileManager.read_file(filename)
        return json.loads(content)
    
    @staticmethod
    async def write_json_file(filename: str, data: Dict[str, Any], indent: int = 2) -> bool:
        """异步写入JSON文件"""
        content = json.dumps(data, indent=indent, ensure_ascii=False)
        return await AsyncFileManager.write_file(filename, content)
    
    @staticmethod
    async def copy_file(source: str, destination: str, chunk_size: int = 8192) -> bool:
        """异步复制文件"""
        try:
            async with aiofiles.open(source, 'rb') as src:
                async with aiofiles.open(destination, 'wb') as dst:
                    while True:
                        chunk = await src.read(chunk_size)
                        if not chunk:
                            break
                        await dst.write(chunk)
            return True
        except Exception as e:
            print(f"复制文件失败: {e}")
            return False
        # AI补全点
    
    @staticmethod
    async def process_large_file(filename: str, processor: Callable[[str], str], 
                                chunk_size: int = 1024) -> int:
        """异步处理大文件"""
        processed_lines = 0
        try:
            async with aiofiles.open(filename, 'r') as file:
                async for line in file:
                    processed_line = processor(line.strip())
                    # 这里可以将处理后的行写入另一个文件
                    processed_lines += 1
                    
                    # 每处理一定数量的行就让出控制权
                    if processed_lines % chunk_size == 0:
                        await asyncio.sleep(0)
            
            return processed_lines
        except Exception as e:
            print(f"处理文件失败: {e}")
            return 0
        # AI补全点

# 4. 异步数据库操作模拟
# ======================

class AsyncDatabase:
    """异步数据库模拟"""
    
    def __init__(self, connection_string: str):
        self.connection_string = connection_string
        self.connected = False
        self.data_store = {}  # 模拟数据存储
        self.connection_pool_size = 5
        self.active_connections = 0
    
    async def connect(self) -> bool:
        """连接数据库"""
        print(f"连接到数据库: {self.connection_string}")
        await asyncio.sleep(0.1)  # 模拟连接延迟
        self.connected = True
        return True
    
    async def disconnect(self) -> bool:
        """断开数据库连接"""
        print("断开数据库连接")
        await asyncio.sleep(0.1)  # 模拟断开延迟
        self.connected = False
        return True
    
    @asynccontextmanager
    async def get_connection(self):
        """获取数据库连接"""
        if not self.connected:
            await self.connect()
        
        if self.active_connections >= self.connection_pool_size:
            await asyncio.sleep(0.1)  # 等待连接可用
        
        self.active_connections += 1
        try:
            yield self
        finally:
            self.active_connections -= 1
            await asyncio.sleep(0.01)  # 模拟释放连接
        # AI补全点
    
    async def execute_query(self, query: str, params: List[Any] = None) -> Dict[str, Any]:
        """执行查询"""
        if not self.connected:
            raise RuntimeError("数据库未连接")
        
        # 模拟查询执行时间
        await asyncio.sleep(random.uniform(0.1, 0.5))
        
        # 简单的查询模拟
        if query.lower().startswith('select'):
            return {'rows': [], 'count': 0}
        elif query.lower().startswith('insert'):
            return {'inserted_id': random.randint(1, 1000), 'affected_rows': 1}
        elif query.lower().startswith('update'):
            return {'affected_rows': random.randint(0, 10)}
        elif query.lower().startswith('delete'):
            return {'affected_rows': random.randint(0, 5)}
        else:
            return {'result': 'unknown query type'}
        # AI补全点
    
    async def execute_transaction(self, queries: List[str]) -> Dict[str, Any]:
        """执行事务"""
        if not self.connected:
            raise RuntimeError("数据库未连接")
        
        results = []
        try:
            print("开始事务")
            for query in queries:
                result = await self.execute_query(query)
                results.append(result)
            
            print("提交事务")
            return {'status': 'committed', 'results': results}
        except Exception as e:
            print(f"回滚事务: {e}")
            return {'status': 'rolled_back', 'error': str(e)}
        # AI补全点
    
    async def batch_insert(self, table: str, records: List[Dict[str, Any]]) -> Dict[str, Any]:
        """批量插入"""
        batch_size = 100
        inserted_count = 0
        
        for i in range(0, len(records), batch_size):
            batch = records[i:i + batch_size]
            
            # 模拟批量插入
            await asyncio.sleep(0.1)
            inserted_count += len(batch)
            
            print(f"批量插入进度: {inserted_count}/{len(records)}")
        
        return {'inserted_count': inserted_count, 'total_records': len(records)}
        # AI补全点

# 5. 异步任务队列
# ======================

@dataclass
class Task:
    """任务数据类"""
    id: str
    func: Callable
    args: tuple
    kwargs: dict
    priority: int = 0
    created_at: datetime = None
    max_retries: int = 3
    current_retry: int = 0
    
    def __post_init__(self):
        if self.created_at is None:
            self.created_at = datetime.now()

class AsyncTaskQueue:
    """异步任务队列"""
    
    def __init__(self, max_workers: int = 5, max_queue_size: int = 100):
        self.max_workers = max_workers
        self.max_queue_size = max_queue_size
        self.queue = asyncio.PriorityQueue(maxsize=max_queue_size)
        self.workers = []
        self.running = False
        self.completed_tasks = []
        self.failed_tasks = []
        self.stats = {
            'processed': 0,
            'succeeded': 0,
            'failed': 0,
            'retried': 0
        }
    
    async def add_task(self, task: Task) -> bool:
        """添加任务到队列"""
        try:
            # 使用负优先级因为PriorityQueue是最小堆
            await self.queue.put((-task.priority, task))
            return True
        except asyncio.QueueFull:
            print("任务队列已满")
            return False
        # AI补全点
    
    async def start(self) -> None:
        """启动任务队列"""
        if self.running:
            return
        
        self.running = True
        self.workers = [
            asyncio.create_task(self._worker(f"worker-{i}"))
            for i in range(self.max_workers)
        ]
        print(f"启动了{self.max_workers}个工作进程")
    
    async def stop(self) -> None:
        """停止任务队列"""
        self.running = False
        
        # 等待所有工作进程完成
        if self.workers:
            await asyncio.gather(*self.workers, return_exceptions=True)
        
        print("任务队列已停止")
    
    async def _worker(self, worker_name: str) -> None:
        """工作进程"""
        print(f"{worker_name} 开始工作")
        
        while self.running:
            try:
                # 等待任务，超时后继续循环检查running状态
                priority, task = await asyncio.wait_for(
                    self.queue.get(), timeout=1.0
                )
                
                await self._execute_task(task, worker_name)
                self.queue.task_done()
                
            except asyncio.TimeoutError:
                continue  # 超时后继续检查是否还在运行
            except Exception as e:
                print(f"{worker_name} 遇到异常: {e}")
        
        print(f"{worker_name} 停止工作")
        # AI补全点
    
    async def _execute_task(self, task: Task, worker_name: str) -> None:
        """执行任务"""
        try:
            print(f"{worker_name} 开始执行任务 {task.id}")
            
            # 执行任务函数
            if asyncio.iscoroutinefunction(task.func):
                result = await task.func(*task.args, **task.kwargs)
            else:
                result = task.func(*task.args, **task.kwargs)
            
            # 任务成功
            self.completed_tasks.append({
                'task': task,
                'result': result,
                'worker': worker_name,
                'completed_at': datetime.now()
            })
            
            self.stats['processed'] += 1
            self.stats['succeeded'] += 1
            
            print(f"{worker_name} 完成任务 {task.id}")
            
        except Exception as e:
            # 任务失败，尝试重试
            task.current_retry += 1
            
            if task.current_retry <= task.max_retries:
                print(f"任务 {task.id} 失败，准备重试 ({task.current_retry}/{task.max_retries}): {e}")
                
                # 重新加入队列
                await self.add_task(task)
                self.stats['retried'] += 1
            else:
                print(f"任务 {task.id} 最终失败: {e}")
                
                self.failed_tasks.append({
                    'task': task,
                    'error': str(e),
                    'worker': worker_name,
                    'failed_at': datetime.now()
                })
                
                self.stats['processed'] += 1
                self.stats['failed'] += 1
        # AI补全点
    
    def get_stats(self) -> Dict[str, Any]:
        """获取统计信息"""
        return {
            **self.stats,
            'queue_size': self.queue.qsize(),
            'running': self.running,
            'workers': len(self.workers),
            'completed_tasks': len(self.completed_tasks),
            'failed_tasks': len(self.failed_tasks)
        }

# 6. 异步Web服务器模拟
# ======================

class AsyncWebServer:
    """异步Web服务器模拟"""
    
    def __init__(self, host: str = 'localhost', port: int = 8080):
        self.host = host
        self.port = port
        self.routes = {}
        self.middleware = []
        self.server = None
    
    def route(self, path: str, methods: List[str] = None):
        """路由装饰器"""
        if methods is None:
            methods = ['GET']
        
        def decorator(func):
            self.routes[path] = {
                'handler': func,
                'methods': methods
            }
            return func
        return decorator
    
    def middleware_func(self, func):
        """中间件装饰器"""
        self.middleware.append(func)
        return func
    
    async def handle_request(self, request_data: Dict[str, Any]) -> Dict[str, Any]:
        """处理请求"""
        path = request_data.get('path', '/')
        method = request_data.get('method', 'GET')
        
        # 执行中间件
        for middleware in self.middleware:
            request_data = await middleware(request_data)
            if request_data.get('response'):
                return request_data['response']
        
        # 查找路由
        if path in self.routes:
            route_info = self.routes[path]
            if method in route_info['methods']:
                try:
                    handler = route_info['handler']
                    if asyncio.iscoroutinefunction(handler):
                        response = await handler(request_data)
                    else:
                        response = handler(request_data)
                    
                    return {
                        'status': 200,
                        'body': response,
                        'headers': {'Content-Type': 'application/json'}
                    }
                except Exception as e:
                    return {
                        'status': 500,
                        'body': {'error': str(e)},
                        'headers': {'Content-Type': 'application/json'}
                    }
            else:
                return {
                    'status': 405,
                    'body': {'error': 'Method not allowed'},
                    'headers': {'Content-Type': 'application/json'}
                }
        else:
            return {
                'status': 404,
                'body': {'error': 'Not found'},
                'headers': {'Content-Type': 'application/json'}
            }
        # AI补全点
    
    async def simulate_request(self, path: str, method: str = 'GET', 
                             data: Dict[str, Any] = None) -> Dict[str, Any]:
        """模拟请求"""
        request_data = {
            'path': path,
            'method': method,
            'data': data or {},
            'headers': {'User-Agent': 'AsyncClient/1.0'},
            'timestamp': datetime.now()
        }
        
        return await self.handle_request(request_data)

# 7. 混合并发（多线程/多进程）
# ======================

class HybridConcurrency:
    """混合并发处理器"""
    
    def __init__(self, max_thread_workers: int = 4, max_process_workers: int = 2):
        self.thread_executor = ThreadPoolExecutor(max_workers=max_thread_workers)
        self.process_executor = ProcessPoolExecutor(max_workers=max_process_workers)
    
    async def run_in_thread(self, func: Callable, *args, **kwargs) -> Any:
        """在线程池中运行函数"""
        loop = asyncio.get_event_loop()
        return await loop.run_in_executor(self.thread_executor, func, *args, **kwargs)
    
    async def run_in_process(self, func: Callable, *args, **kwargs) -> Any:
        """在进程池中运行函数"""
        loop = asyncio.get_event_loop()
        return await loop.run_in_executor(self.process_executor, func, *args, **kwargs)
    
    async def parallel_io_tasks(self, urls: List[str]) -> List[Dict[str, Any]]:
        """并行IO任务（适合线程池）"""
        async def fetch_url_in_thread(url: str) -> Dict[str, Any]:
            # 模拟同步HTTP请求
            def sync_fetch(url):
                import time
                time.sleep(random.uniform(0.5, 2.0))  # 模拟网络延迟
                return {'url': url, 'status': 200, 'data': f'Data from {url}'}
            
            return await self.run_in_thread(sync_fetch, url)
        
        tasks = [fetch_url_in_thread(url) for url in urls]
        return await asyncio.gather(*tasks)
        # AI补全点
    
    async def parallel_cpu_tasks(self, numbers: List[int]) -> List[int]:
        """并行CPU密集型任务（适合进程池）"""
        def cpu_intensive_task(n: int) -> int:
            # 模拟CPU密集型计算
            result = 0
            for i in range(n * 1000):
                result += i ** 2
            return result
        
        tasks = [self.run_in_process(cpu_intensive_task, num) for num in numbers]
        return await asyncio.gather(*tasks)
        # AI补全点
    
    def cleanup(self):
        """清理资源"""
        self.thread_executor.shutdown(wait=True)
        self.process_executor.shutdown(wait=True)

# 8. 异步生产者-消费者模式
# ======================

class AsyncProducerConsumer:
    """异步生产者-消费者模式"""
    
    def __init__(self, queue_size: int = 10):
        self.queue = asyncio.Queue(maxsize=queue_size)
        self.producers = []
        self.consumers = []
        self.running = False
        self.stats = {
            'produced': 0,
            'consumed': 0,
            'errors': 0
        }
    
    async def producer(self, name: str, item_generator: AsyncGenerator) -> None:
        """生产者"""
        print(f"生产者 {name} 开始工作")
        
        try:
            async for item in item_generator:
                if not self.running:
                    break
                
                await self.queue.put({
                    'data': item,
                    'producer': name,
                    'timestamp': datetime.now()
                })
                
                self.stats['produced'] += 1
                print(f"生产者 {name} 生产了: {item}")
                
        except Exception as e:
            print(f"生产者 {name} 遇到错误: {e}")
            self.stats['errors'] += 1
        
        print(f"生产者 {name} 停止工作")
        # AI补全点
    
    async def consumer(self, name: str, processor: Callable) -> None:
        """消费者"""
        print(f"消费者 {name} 开始工作")
        
        while self.running:
            try:
                # 等待队列中的项目
                item = await asyncio.wait_for(self.queue.get(), timeout=1.0)
                
                # 处理项目
                if asyncio.iscoroutinefunction(processor):
                    result = await processor(item)
                else:
                    result = processor(item)
                
                self.stats['consumed'] += 1
                print(f"消费者 {name} 处理了: {item['data']} -> {result}")
                
                self.queue.task_done()
                
            except asyncio.TimeoutError:
                continue  # 超时后继续检查running状态
            except Exception as e:
                print(f"消费者 {name} 遇到错误: {e}")
                self.stats['errors'] += 1
        
        print(f"消费者 {name} 停止工作")
        # AI补全点
    
    async def start(self, producer_configs: List[Dict], consumer_configs: List[Dict]) -> None:
        """启动生产者和消费者"""
        self.running = True
        
        # 启动生产者
        for config in producer_configs:
            producer_task = asyncio.create_task(
                self.producer(config['name'], config['generator'])
            )
            self.producers.append(producer_task)
        
        # 启动消费者
        for config in consumer_configs:
            consumer_task = asyncio.create_task(
                self.consumer(config['name'], config['processor'])
            )
            self.consumers.append(consumer_task)
        
        print(f"启动了 {len(self.producers)} 个生产者和 {len(self.consumers)} 个消费者")
    
    async def stop(self) -> None:
        """停止生产者和消费者"""
        self.running = False
        
        # 等待所有任务完成
        all_tasks = self.producers + self.consumers
        if all_tasks:
            await asyncio.gather(*all_tasks, return_exceptions=True)
        
        print("生产者-消费者系统已停止")
    
    def get_stats(self) -> Dict[str, Any]:
        """获取统计信息"""
        return {
            **self.stats,
            'queue_size': self.queue.qsize(),
            'running': self.running,
            'producers': len(self.producers),
            'consumers': len(self.consumers)
        }

# 9. 使用示例和演示
# ======================

async def demonstrate_async_programming():
    """演示异步编程"""
    print("=== 基础异步编程演示 ===")
    
    # 基础异步函数
    result = await basic_async_function()
    print(f"基础异步函数结果: {result}")
    
    # 并发任务
    concurrent_results = await concurrent_tasks_demo()
    print(f"并发任务结果: {concurrent_results}")
    
    # 异步迭代器
    total = await async_iterator_demo()
    print(f"异步迭代器总和: {total}")
    
    print("\n=== 异步网络编程演示 ===")
    
    # 模拟URL列表
    urls = [
        "https://httpbin.org/delay/1",
        "https://httpbin.org/delay/2",
        "https://jsonplaceholder.typicode.com/posts/1"
    ]
    
    try:
        # 并发获取多个URL（注意：这个可能会因为网络问题失败）
        print("开始并发获取URL...")
        # results = await fetch_multiple_urls(urls[:2], max_concurrent=2)
        # print(f"获取结果数量: {len(results)}")
    except Exception as e:
        print(f"网络请求演示跳过: {e}")
    
    print("\n=== 异步文件操作演示 ===")
    
    # 创建测试文件
    test_data = {"name": "测试", "data": [1, 2, 3, 4, 5]}
    await AsyncFileManager.write_json_file("test_async.json", test_data)
    
    # 读取文件
    read_data = await AsyncFileManager.read_json_file("test_async.json")
    print(f"读取的数据: {read_data}")
    
    print("\n=== 异步数据库操作演示 ===")
    
    # 数据库操作
    db = AsyncDatabase("postgresql://localhost:5432/testdb")
    await db.connect()
    
    # 执行查询
    result = await db.execute_query("SELECT * FROM users")
    print(f"查询结果: {result}")
    
    # 批量插入
    records = [{"id": i, "name": f"user{i}"} for i in range(10)]
    batch_result = await db.batch_insert("users", records)
    print(f"批量插入结果: {batch_result}")
    
    await db.disconnect()
    
    print("\n=== 异步任务队列演示 ===")
    
    # 创建任务队列
    task_queue = AsyncTaskQueue(max_workers=3)
    await task_queue.start()
    
    # 添加任务
    async def async_task(name: str, delay: float) -> str:
        await asyncio.sleep(delay)
        return f"任务 {name} 完成"
    
    def sync_task(name: str, multiplier: int) -> str:
        result = multiplier * 10
        return f"任务 {name} 计算结果: {result}"
    
    # 添加异步任务
    for i in range(5):
        task = Task(
            id=f"async-task-{i}",
            func=async_task,
            args=(f"async-{i}", random.uniform(0.5, 2.0)),
            kwargs={},
            priority=random.randint(1, 5)
        )
        await task_queue.add_task(task)
    
    # 添加同步任务
    for i in range(3):
        task = Task(
            id=f"sync-task-{i}",
            func=sync_task,
            args=(f"sync-{i}", i + 1),
            kwargs={},
            priority=random.randint(1, 5)
        )
        await task_queue.add_task(task)
    
    # 等待任务完成
    await asyncio.sleep(3)
    print(f"任务队列统计: {task_queue.get_stats()}")
    
    await task_queue.stop()
    
    print("\n=== 异步Web服务器演示 ===")
    
    # 创建Web服务器
    server = AsyncWebServer()
    
    @server.route('/')
    async def index(request):
        return {'message': '欢迎访问异步Web服务器', 'timestamp': str(datetime.now())}
    
    @server.route('/users', ['GET', 'POST'])
    async def users(request):
        if request['method'] == 'GET':
            return {'users': ['用户1', '用户2', '用户3']}
        else:
            return {'message': '用户创建成功', 'data': request.get('data', {})}
    
    @server.middleware_func
    async def logging_middleware(request):
        print(f"请求: {request['method']} {request['path']}")
        return request
    
    # 模拟请求
    response1 = await server.simulate_request('/')
    print(f"GET / 响应: {response1}")
    
    response2 = await server.simulate_request('/users', 'POST', {'name': '新用户'})
    print(f"POST /users 响应: {response2}")
    
    print("\n=== 生产者-消费者模式演示 ===")
    
    # 创建生产者-消费者系统
    pc_system = AsyncProducerConsumer(queue_size=5)
    
    # 生产者生成器
    async def data_generator(start: int, count: int):
        for i in range(start, start + count):
            await asyncio.sleep(0.2)  # 模拟生产延迟
            yield f"数据-{i}"
    
    # 消费者处理器
    async def data_processor(item):
        await asyncio.sleep(0.1)  # 模拟处理延迟
        return f"处理后的-{item['data']}"
    
    # 配置生产者和消费者
    producer_configs = [
        {'name': '生产者1', 'generator': data_generator(1, 5)},
        {'name': '生产者2', 'generator': data_generator(6, 5)}
    ]
    
    consumer_configs = [
        {'name': '消费者1', 'processor': data_processor},
        {'name': '消费者2', 'processor': data_processor}
    ]
    
    # 启动系统
    await pc_system.start(producer_configs, consumer_configs)
    
    # 运行一段时间
    await asyncio.sleep(3)
    print(f"生产者-消费者统计: {pc_system.get_stats()}")
    
    await pc_system.stop()
    
    # AI补全点

async def main():
    """主函数"""
    try:
        await demonstrate_async_programming()
    except KeyboardInterrupt:
        print("\n程序被用户中断")
    except Exception as e:
        print(f"程序执行出错: {e}")
    finally:
        print("异步编程演示完成")

if __name__ == "__main__":
    # 配置日志
    logging.basicConfig(level=logging.INFO)
    
    # 运行主函数
    asyncio.run(main())
    # AI补全点

# AI补全点
print("Python异步编程代码片段加载完成")