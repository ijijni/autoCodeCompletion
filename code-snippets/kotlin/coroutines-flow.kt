/**
 * Kotlin协程和Flow示例
 */

import kotlinx.coroutines.*
import kotlinx.coroutines.flow.*
import kotlin.random.Random
import kotlin.system.measureTimeMillis

// 基础协程示例
suspend fun basicCoroutineExample() {
    println("\n=== 基础协程示例 ===")
    
    // 简单的挂起函数
    suspend fun fetchData(id: Int): String {
        delay(1000) // 模拟网络请求
        return "数据-$id"
    }
    
    // 顺序执行
    val time1 = measureTimeMillis {
        val data1 = fetchData(1)
        val data2 = fetchData(2)
        println("顺序执行结果: $data1, $data2")
    }
    println("顺序执行耗时: ${time1}ms")
    
    // 并发执行
    val time2 = measureTimeMillis {
        val deferred1 = async { fetchData(3) }
        val deferred2 = async { fetchData(4) }
        val data1 = deferred1.await()
        val data2 = deferred2.await()
        println("并发执行结果: $data1, $data2")
    }
    println("并发执行耗时: ${time2}ms")
}

// 协程作用域和上下文
class CoroutineScopeExample {
    private val scope = CoroutineScope(Dispatchers.Default + SupervisorJob())
    
    fun startBackgroundWork() {
        println("\n=== 协程作用域示例 ===")
        
        // 在不同调度器上运行
        scope.launch(Dispatchers.IO) {
            println("IO线程工作: ${Thread.currentThread().name}")
            delay(1000)
            
            // 切换到主线程（在Android中）
            withContext(Dispatchers.Main) {
                println("主线程更新UI: ${Thread.currentThread().name}")
            }
        }
        
        // 使用SupervisorJob处理异常
        scope.launch {
            try {
                throw RuntimeException("模拟异常")
            } catch (e: Exception) {
                println("捕获异常: ${e.message}")
            }
        }
        
        scope.launch {
            println("其他协程继续运行")
        }
    }
    
    fun cleanup() {
        scope.cancel()
    }
}

// 协程取消和超时
suspend fun cancellationExample() {
    println("\n=== 协程取消和超时示例 ===")
    
    // 超时处理
    try {
        withTimeout(2000) {
            repeat(5) { i ->
                println("工作中... $i")
                delay(500)
            }
        }
    } catch (e: TimeoutCancellationException) {
        println("操作超时")
    }
    
    // 手动取消
    val job = launch {
        try {
            repeat(1000) { i ->
                if (!isActive) return@launch
                println("可取消的工作: $i")
                delay(100)
            }
        } catch (e: CancellationException) {
            println("协程被取消")
            throw e
        }
    }
    
    delay(500)
    job.cancel()
    job.join()
}

// Flow基础示例
fun basicFlowExample() {
    println("\n=== Flow基础示例 ===")
    
    runBlocking {
        // 创建Flow
        val numberFlow = flow {
            for (i in 1..5) {
                delay(500)
                emit(i)
            }
        }
        
        // 收集Flow
        numberFlow.collect { value ->
            println("收到数字: $value")
        }
        
        // 使用flowOf创建Flow
        val stringFlow = flowOf("A", "B", "C", "D")
        stringFlow.collect { value ->
            println("收到字符: $value")
        }
        
        // 从集合创建Flow
        val listFlow = listOf(1, 2, 3, 4, 5).asFlow()
        listFlow.collect { value ->
            println("收到列表元素: $value")
        }
    }
}

// Flow操作符示例
fun flowOperatorsExample() {
    println("\n=== Flow操作符示例 ===")
    
    runBlocking {
        val sourceFlow = (1..10).asFlow()
        
        // map操作符
        sourceFlow
            .map { it * it }
            .collect { println("平方: $it") }
        
        // filter操作符
        sourceFlow
            .filter { it % 2 == 0 }
            .collect { println("偶数: $it") }
        
        // transform操作符
        sourceFlow
            .transform { value ->
                emit("数字: $value")
                emit("平方: ${value * value}")
            }
            .take(6) // 只取前6个
            .collect { println(it) }
        
        // reduce操作符
        val sum = sourceFlow.reduce { acc, value -> acc + value }
        println("总和: $sum")
        
        // fold操作符
        val product = sourceFlow.fold(1) { acc, value -> acc * value }
        println("乘积: $product")
    }
}

// 异步Flow示例
class AsyncFlowExample {
    
    // 模拟API调用
    suspend fun fetchUserData(userId: Int): String {
        delay(Random.nextLong(500, 1500))
        return "用户-$userId 的数据"
    }
    
    // 创建异步Flow
    fun createUserDataFlow(userIds: List<Int>): Flow<String> = flow {
        userIds.forEach { userId ->
            val userData = fetchUserData(userId)
            emit(userData)
        }
    }
    
    // 并发处理Flow
    fun createConcurrentUserDataFlow(userIds: List<Int>): Flow<String> = 
        userIds.asFlow()
            .map { userId ->
                async { fetchUserData(userId) }
            }
            .map { deferred ->
                deferred.await()
            }
    
    suspend fun demonstrateAsyncFlow() {
        println("\n=== 异步Flow示例 ===")
        
        val userIds = listOf(1, 2, 3, 4, 5)
        
        // 顺序处理
        val time1 = measureTimeMillis {
            createUserDataFlow(userIds).collect { data ->
                println("顺序获取: $data")
            }
        }
        println("顺序处理耗时: ${time1}ms")
        
        // 并发处理
        val time2 = measureTimeMillis {
            createConcurrentUserDataFlow(userIds).collect { data ->
                println("并发获取: $data")
            }
        }
        println("并发处理耗时: ${time2}ms")
    }
}

// Flow异常处理
suspend fun flowExceptionHandling() {
    println("\n=== Flow异常处理示例 ===")
    
    val problematicFlow = flow {
        for (i in 1..5) {
            if (i == 3) {
                throw RuntimeException("在数字3处发生错误")
            }
            emit(i)
        }
    }
    
    // 使用catch操作符
    problematicFlow
        .catch { e ->
            println("捕获异常: ${e.message}")
            emit(-1) // 发出默认值
        }
        .collect { value ->
            println("收到值: $value")
        }
    
    // 使用try-catch
    try {
        problematicFlow.collect { value ->
            println("收到值: $value")
        }
    } catch (e: Exception) {
        println("在collect中捕获异常: ${e.message}")
    }
}

// 热流和冷流
class HotColdFlowExample {
    
    // 冷流示例
    fun createColdFlow(): Flow<Int> = flow {
        println("冷流开始")
        for (i in 1..3) {
            delay(1000)
            emit(i)
        }
    }
    
    // 热流示例 - SharedFlow
    private val _sharedFlow = MutableSharedFlow<String>()
    val sharedFlow: SharedFlow<String> = _sharedFlow.asSharedFlow()
    
    // 热流示例 - StateFlow
    private val _stateFlow = MutableStateFlow("初始状态")
    val stateFlow: StateFlow<String> = _stateFlow.asStateFlow()
    
    fun emitToSharedFlow(value: String) {
        _sharedFlow.tryEmit(value)
    }
    
    fun updateStateFlow(value: String) {
        _stateFlow.value = value
    }
    
    suspend fun demonstrateHotColdFlow() {
        println("\n=== 热流和冷流示例 ===")
        
        // 冷流演示
        println("冷流演示:")
        val coldFlow = createColdFlow()
        
        launch {
            coldFlow.collect { value ->
                println("收集器1收到: $value")
            }
        }
        
        delay(2000)
        
        launch {
            coldFlow.collect { value ->
                println("收集器2收到: $value")
            }
        }
        
        delay(5000)
        
        // 热流演示
        println("\n热流演示:")
        
        // SharedFlow
        launch {
            sharedFlow.collect { value ->
                println("SharedFlow收集器1: $value")
            }
        }
        
        launch {
            sharedFlow.collect { value ->
                println("SharedFlow收集器2: $value")
            }
        }
        
        delay(100)
        emitToSharedFlow("消息1")
        emitToSharedFlow("消息2")
        
        // StateFlow
        launch {
            stateFlow.collect { value ->
                println("StateFlow收集器1: $value")
            }
        }
        
        delay(100)
        updateStateFlow("新状态1")
        updateStateFlow("新状态2")
        
        delay(1000)
    }
}

// Flow背压处理
suspend fun flowBackpressureExample() {
    println("\n=== Flow背压处理示例 ===")
    
    val fastProducer = flow {
        for (i in 1..10) {
            delay(100) // 快速生产
            emit(i)
        }
    }
    
    // buffer操作符
    fastProducer
        .buffer(capacity = 3)
        .collect { value ->
            delay(500) // 慢速消费
            println("缓冲收集: $value")
        }
    
    // conflate操作符 - 只保留最新值
    fastProducer
        .conflate()
        .collect { value ->
            delay(500)
            println("合并收集: $value")
        }
    
    // collectLatest操作符 - 取消之前的收集
    fastProducer
        .collectLatest { value ->
            println("开始处理: $value")
            delay(500)
            println("完成处理: $value")
        }
}

// 实际应用示例 - 数据仓库模式
class UserRepository {
    private val users = mutableMapOf<Int, String>()
    
    suspend fun getUser(id: Int): String {
        delay(500) // 模拟网络请求
        return users[id] ?: "用户-$id"
    }
    
    suspend fun saveUser(id: Int, name: String) {
        delay(300) // 模拟保存操作
        users[id] = name
    }
    
    fun observeUser(id: Int): Flow<String> = flow {
        while (true) {
            emit(getUser(id))
            delay(2000) // 每2秒更新一次
        }
    }
}

class UserService(private val repository: UserRepository) {
    
    fun getUserFlow(id: Int): Flow<String> = 
        repository.observeUser(id)
            .map { userData ->
                "处理后的$userData"
            }
            .catch { e ->
                emit("获取用户失败: ${e.message}")
            }
    
    suspend fun updateUser(id: Int, name: String) {
        repository.saveUser(id, name)
    }
}

suspend fun repositoryPatternExample() {
    println("\n=== 数据仓库模式示例 ===")
    
    val repository = UserRepository()
    val userService = UserService(repository)
    
    // 观察用户数据
    val job = launch {
        userService.getUserFlow(1).collect { userData ->
            println("用户数据更新: $userData")
        }
    }
    
    delay(3000)
    
    // 更新用户数据
    userService.updateUser(1, "张三")
    
    delay(3000)
    job.cancel()
}

// 主函数
suspend fun main() {
    println("=== Kotlin协程和Flow示例 ===")
    
    runBlocking {
        basicCoroutineExample()
        
        val scopeExample = CoroutineScopeExample()
        scopeExample.startBackgroundWork()
        delay(2000)
        scopeExample.cleanup()
        
        cancellationExample()
    }
    
    basicFlowExample()
    flowOperatorsExample()
    
    runBlocking {
        val asyncFlowExample = AsyncFlowExample()
        asyncFlowExample.demonstrateAsyncFlow()
        
        flowExceptionHandling()
        
        val hotColdExample = HotColdFlowExample()
        hotColdExample.demonstrateHotColdFlow()
        
        flowBackpressureExample()
        
        repositoryPatternExample()
    }
    
    println("\n所有协程和Flow示例完成!")
}
