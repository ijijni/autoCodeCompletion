/**
 * Kotlin与Java互操作性示例
 */

// Java互操作注解
@file:JvmName("KotlinUtils")
@file:JvmMultifileClass

import java.util.*
import java.util.concurrent.CompletableFuture
import java.util.function.Function
import java.util.function.Predicate
import java.util.stream.Collectors

// 1. 基础互操作
class KotlinClass {
    @JvmField
    val publicField = "这是一个公共字段"
    
    private val privateField = "私有字段"
    
    // 为Java提供getter
    fun getPrivateField(): String = privateField
    
    @JvmOverloads
    fun greet(name: String, greeting: String = "你好"): String {
        return "$greeting, $name!"
    }
    
    companion object {
        @JvmStatic
        fun createInstance(name: String): KotlinClass {
            val instance = KotlinClass()
            println("创建实例: $name")
            return instance
        }
        
        @JvmField
        val CONSTANT = "常量值"
    }
}

// 2. 函数式接口互操作
fun interface KotlinFunctionalInterface {
    fun execute(input: String): String
}

class FunctionalInteropExample {
    // 接受Java函数式接口
    fun processWithJavaFunction(input: String, processor: Function<String, String>): String {
        return processor.apply(input)
    }
    
    // 接受Java Predicate
    fun filterWithJavaPredicate(items: List<String>, predicate: Predicate<String>): List<String> {
        return items.filter { predicate.test(it) }
    }
    
    // 返回Java兼容的函数
    @JvmStatic
    fun getStringProcessor(): Function<String, String> {
        return Function { input -> input.uppercase() }
    }
    
    // 使用Kotlin函数式接口
    fun processWithKotlinInterface(input: String, processor: KotlinFunctionalInterface): String {
        return processor.execute(input)
    }
}

// 3. 集合互操作
class CollectionInteropExample {
    
    // 返回Java可变列表
    @JvmStatic
    fun createMutableList(): MutableList<String> {
        return mutableListOf("Kotlin", "Java", "互操作")
    }
    
    // 返回Java不可变列表
    @JvmStatic
    fun createImmutableList(): List<String> {
        return listOf("不可变", "列表", "示例")
    }
    
    // 处理Java集合
    fun processJavaCollection(javaList: java.util.List<String>): String {
        return javaList.joinToString(", ")
    }
    
    // 转换集合类型
    fun convertToJavaSet(kotlinList: List<String>): java.util.Set<String> {
        return kotlinList.toSet().toMutableSet()
    }
    
    // 使用Java Stream API
    fun processWithJavaStreams(items: List<String>): List<String> {
        return items.stream()
            .filter { it.length > 3 }
            .map { it.uppercase() }
            .collect(Collectors.toList())
    }
}

// 4. 异常处理互操作
class ExceptionInteropExample {
    
    // 抛出Java异常
    @Throws(IllegalArgumentException::class)
    fun validateInput(input: String): String {
        if (input.isBlank()) {
            throw IllegalArgumentException("输入不能为空")
        }
        return input.trim()
    }
    
    // 处理Java检查异常
    fun readFileContent(filename: String): String? {
        return try {
            java.io.File(filename).readText()
        } catch (e: java.io.IOException) {
            println("读取文件失败: ${e.message}")
            null
        }
    }
    
    // 自定义异常
    class KotlinCustomException(message: String) : Exception(message)
    
    @Throws(KotlinCustomException::class)
    fun riskyOperation(): String {
        if (Random().nextBoolean()) {
            throw KotlinCustomException("操作失败")
        }
        return "操作成功"
    }
}

// 5. 泛型互操作
class GenericInteropExample {
    
    // 泛型方法
    fun <T> processGeneric(item: T, processor: Function<T, String>): String {
        return processor.apply(item)
    }
    
    // 通配符类型
    fun processWildcard(items: List<out Any>): String {
        return items.joinToString { it.toString() }
    }
    
    // 有界泛型
    fun <T : Number> sumNumbers(numbers: List<T>): Double {
        return numbers.sumOf { it.toDouble() }
    }
    
    // 泛型类
    class GenericContainer<T>(private val item: T) {
        fun getItem(): T = item
        
        @JvmStatic
        fun <U> create(item: U): GenericContainer<U> {
            return GenericContainer(item)
        }
    }
}

// 6. 注解互操作
@Target(AnnotationTarget.CLASS, AnnotationTarget.FUNCTION)
@Retention(AnnotationRetention.RUNTIME)
annotation class KotlinAnnotation(
    val value: String,
    val priority: Int = 0
)

@KotlinAnnotation("示例类", priority = 1)
class AnnotatedClass {
    
    @KotlinAnnotation("示例方法")
    fun annotatedMethod(): String {
        return "带注解的方法"
    }
    
    // Java Bean风格的属性
    @get:JvmName("getSpecialProperty")
    @set:JvmName("setSpecialProperty")
    var specialProperty: String = "特殊属性"
}

// 7. 数据类互操作
data class Person(
    val name: String,
    val age: Int,
    val email: String? = null
) {
    // 为Java提供构造函数
    @JvmOverloads
    constructor(name: String, age: Int) : this(name, age, null)
    
    // Java Bean风格的方法
    fun getName(): String = name
    fun getAge(): Int = age
    fun getEmail(): String? = email
}

// 8. 密封类和枚举互操作
sealed class Result<out T> {
    data class Success<T>(val data: T) : Result<T>()
    data class Error(val message: String) : Result<Nothing>()
    object Loading : Result<Nothing>()
    
    // 为Java提供类型检查方法
    fun isSuccess(): Boolean = this is Success
    fun isError(): Boolean = this is Error
    fun isLoading(): Boolean = this is Loading
    
    // 获取数据的Java友好方法
    fun getDataOrNull(): T? = when (this) {
        is Success -> data
        else -> null
    }
}

enum class Status(val code: Int, val message: String) {
    ACTIVE(1, "活跃"),
    INACTIVE(0, "非活跃"),
    PENDING(2, "待处理");
    
    // 为Java提供静态方法
    companion object {
        @JvmStatic
        fun fromCode(code: Int): Status? {
            return values().find { it.code == code }
        }
    }
}

// 9. 扩展函数互操作
// 扩展函数不能直接从Java调用，需要包装
object StringExtensions {
    @JvmStatic
    fun reverse(str: String): String {
        return str.reversed()
    }
    
    @JvmStatic
    fun isPalindrome(str: String): Boolean {
        val cleaned = str.lowercase().replace(Regex("[^a-z0-9]"), "")
        return cleaned == cleaned.reversed()
    }
    
    @JvmStatic
    fun wordCount(str: String): Int {
        return str.split(Regex("\\s+")).filter { it.isNotBlank() }.size
    }
}

// Kotlin扩展函数
fun String.kotlinReverse(): String = this.reversed()

// 10. 协程与Java Future互操作
class CoroutineInteropExample {
    
    // 将协程转换为CompletableFuture
    fun fetchDataAsync(id: Int): CompletableFuture<String> {
        return kotlinx.coroutines.future.future {
            kotlinx.coroutines.delay(1000) // 模拟异步操作
            "数据-$id"
        }
    }
    
    // 从CompletableFuture创建协程
    suspend fun processJavaFuture(future: CompletableFuture<String>): String {
        return future.await()
    }
    
    // 协程与回调互操作
    fun fetchDataWithCallback(id: Int, callback: (String) -> Unit) {
        kotlinx.coroutines.GlobalScope.launch {
            kotlinx.coroutines.delay(500)
            callback("回调数据-$id")
        }
    }
}

// 11. 平台类型处理
class PlatformTypeExample {
    
    // 处理可能为null的Java返回值
    fun processJavaString(javaString: String?): String {
        // 使用安全调用操作符
        return javaString?.uppercase() ?: "默认值"
    }
    
    // 处理Java集合
    fun processJavaList(javaList: java.util.List<String>?): List<String> {
        return javaList?.toList() ?: emptyList()
    }
    
    // 断言非空
    fun requireNonNull(value: String?): String {
        return value!! // 在确定非空时使用
    }
}

// 12. 内联类互操作
@JvmInline
value class UserId(val value: Long) {
    // 为Java提供访问方法
    fun getValue(): Long = value
    
    companion object {
        @JvmStatic
        fun create(value: Long): UserId = UserId(value)
    }
}

// 演示函数
fun demonstrateBasicInterop() {
    println("=== 基础互操作示例 ===")
    
    val kotlinClass = KotlinClass()
    println("公共字段: ${kotlinClass.publicField}")
    println("私有字段: ${kotlinClass.getPrivateField()}")
    println("问候: ${kotlinClass.greet("世界")}")
    println("带默认参数: ${kotlinClass.greet("Kotlin", "欢迎")}")
    
    val staticInstance = KotlinClass.createInstance("静态创建")
    println("常量: ${KotlinClass.CONSTANT}")
}

fun demonstrateFunctionalInterop() {
    println("\n=== 函数式接口互操作示例 ===")
    
    val example = FunctionalInteropExample()
    
    // 使用Java Function
    val javaFunction = Function<String, String> { it.lowercase() }
    val result1 = example.processWithJavaFunction("HELLO", javaFunction)
    println("Java Function结果: $result1")
    
    // 使用Java Predicate
    val javaPredicate = Predicate<String> { it.length > 3 }
    val items = listOf("a", "hello", "hi", "world")
    val filtered = example.filterWithJavaPredicate(items, javaPredicate)
    println("过滤结果: $filtered")
    
    // 使用Kotlin函数式接口
    val kotlinInterface = KotlinFunctionalInterface { "处理: $it" }
    val result2 = example.processWithKotlinInterface("测试", kotlinInterface)
    println("Kotlin接口结果: $result2")
}

fun demonstrateCollectionInterop() {
    println("\n=== 集合互操作示例 ===")
    
    val example = CollectionInteropExample()
    
    val mutableList = CollectionInteropExample.createMutableList()
    mutableList.add("新元素")
    println("可变列表: $mutableList")
    
    val immutableList = CollectionInteropExample.createImmutableList()
    println("不可变列表: $immutableList")
    
    val javaList = java.util.ArrayList<String>()
    javaList.addAll(listOf("Java", "集合", "示例"))
    val processed = example.processJavaCollection(javaList)
    println("处理Java集合: $processed")
    
    val kotlinList = listOf("kotlin", "java", "互操作", "示例")
    val javaSet = example.convertToJavaSet(kotlinList)
    println("转换为Java Set: $javaSet")
    
    val streamResult = example.processWithJavaStreams(kotlinList)
    println("Java Stream处理: $streamResult")
}

fun demonstrateExceptionInterop() {
    println("\n=== 异常处理互操作示例 ===")
    
    val example = ExceptionInteropExample()
    
    try {
        val validated = example.validateInput("  有效输入  ")
        println("验证结果: '$validated'")
    } catch (e: IllegalArgumentException) {
        println("验证失败: ${e.message}")
    }
    
    try {
        example.validateInput("")
    } catch (e: IllegalArgumentException) {
        println("捕获异常: ${e.message}")
    }
    
    try {
        val result = example.riskyOperation()
        println("操作结果: $result")
    } catch (e: ExceptionInteropExample.KotlinCustomException) {
        println("自定义异常: ${e.message}")
    }
}

fun demonstrateGenericInterop() {
    println("\n=== 泛型互操作示例 ===")
    
    val example = GenericInteropExample()
    
    val stringProcessor = Function<String, String> { "处理: $it" }
    val result = example.processGeneric("测试", stringProcessor)
    println("泛型处理结果: $result")
    
    val numbers = listOf(1, 2, 3, 4, 5)
    val sum = example.sumNumbers(numbers)
    println("数字求和: $sum")
    
    val container = GenericInteropExample.GenericContainer.create("容器内容")
    println("泛型容器: ${container.getItem()}")
}

fun demonstrateDataClassInterop() {
    println("\n=== 数据类互操作示例 ===")
    
    val person1 = Person("张三", 25, "zhangsan@example.com")
    val person2 = Person("李四", 30)
    
    println("人员1: ${person1.getName()}, ${person1.getAge()}, ${person1.getEmail()}")
    println("人员2: ${person2.getName()}, ${person2.getAge()}, ${person2.getEmail()}")
    
    // 使用数据类方法
    println("人员1字符串: $person1")
    println("人员相等性: ${person1 == person2}")
}

fun demonstrateSealedClassInterop() {
    println("\n=== 密封类和枚举互操作示例 ===")
    
    val results = listOf(
        Result.Success("成功数据"),
        Result.Error("错误信息"),
        Result.Loading
    )
    
    results.forEach { result ->
        println("结果类型: 成功=${result.isSuccess()}, 错误=${result.isError()}, 加载中=${result.isLoading()}")
        println("数据: ${result.getDataOrNull()}")
    }
    
    val status = Status.fromCode(1)
    println("状态: ${status?.name} - ${status?.message}")
}

fun demonstrateStringExtensions() {
    println("\n=== 扩展函数互操作示例 ===")
    
    val text = "Hello World"
    
    // 使用包装的静态方法（Java可调用）
    println("反转: ${StringExtensions.reverse(text)}")
    println("是否回文: ${StringExtensions.isPalindrome("racecar")}")
    println("单词数: ${StringExtensions.wordCount(text)}")
    
    // 使用Kotlin扩展函数
    println("Kotlin扩展反转: ${text.kotlinReverse()}")
}

suspend fun main() {
    println("=== Kotlin与Java互操作性示例 ===")
    
    demonstrateBasicInterop()
    demonstrateFunctionalInterop()
    demonstrateCollectionInterop()
    demonstrateExceptionInterop()
    demonstrateGenericInterop()
    demonstrateDataClassInterop()
    demonstrateSealedClassInterop()
    demonstrateStringExtensions()
    
    // 协程互操作示例
    println("\n=== 协程互操作示例 ===")
    val coroutineExample = CoroutineInteropExample()
    
    val future = coroutineExample.fetchDataAsync(123)
    println("CompletableFuture结果: ${future.get()}")
    
    coroutineExample.fetchDataWithCallback(456) { data ->
        println("回调结果: $data")
    }
    
    kotlinx.coroutines.delay(1000) // 等待回调完成
    
    println("\n所有Kotlin与Java互操作示例完成!")
}
