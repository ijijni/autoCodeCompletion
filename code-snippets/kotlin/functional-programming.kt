/**
 * Kotlin函数式编程示例
 */

// 高阶函数示例
fun higherOrderFunctionExamples() {
    println("\n=== 高阶函数示例 ===")
    
    // 函数作为参数
    fun calculate(a: Int, b: Int, operation: (Int, Int) -> Int): Int {
        return operation(a, b)
    }
    
    val add = { x: Int, y: Int -> x + y }
    val multiply = { x: Int, y: Int -> x * y }
    
    println("5 + 3 = ${calculate(5, 3, add)}")
    println("5 * 3 = ${calculate(5, 3, multiply)}")
    println("5 - 3 = ${calculate(5, 3) { x, y -> x - y }}")
    
    // 返回函数的函数
    fun createMultiplier(factor: Int): (Int) -> Int {
        return { number -> number * factor }
    }
    
    val doubler = createMultiplier(2)
    val tripler = createMultiplier(3)
    
    println("doubler(5) = ${doubler(5)}")
    println("tripler(5) = ${tripler(5)}")
    
    // 函数组合
    fun <A, B, C> compose(f: (B) -> C, g: (A) -> B): (A) -> C {
        return { x -> f(g(x)) }
    }
    
    val addOne = { x: Int -> x + 1 }
    val square = { x: Int -> x * x }
    val addOneThenSquare = compose(square, addOne)
    
    println("(5 + 1)² = ${addOneThenSquare(5)}")
}

// Lambda表达式和闭包
fun lambdaAndClosureExamples() {
    println("\n=== Lambda表达式和闭包示例 ===")
    
    // 基础Lambda
    val numbers = listOf(1, 2, 3, 4, 5)
    
    val doubled = numbers.map { it * 2 }
    println("翻倍: $doubled")
    
    val evens = numbers.filter { it % 2 == 0 }
    println("偶数: $evens")
    
    // 闭包示例
    fun createCounter(initial: Int = 0): () -> Int {
        var count = initial
        return { ++count }
    }
    
    val counter1 = createCounter()
    val counter2 = createCounter(10)
    
    println("计数器1: ${counter1()}, ${counter1()}, ${counter1()}")
    println("计数器2: ${counter2()}, ${counter2()}, ${counter2()}")
    
    // 带接收者的Lambda
    fun buildString(builderAction: StringBuilder.() -> Unit): String {
        val sb = StringBuilder()
        sb.builderAction()
        return sb.toString()
    }
    
    val result = buildString {
        append("Hello")
        append(" ")
        append("World")
        append("!")
    }
    println("构建的字符串: $result")
}

// 集合函数式操作
fun collectionFunctionalOperations() {
    println("\n=== 集合函数式操作示例 ===")
    
    data class Person(val name: String, val age: Int, val city: String)
    
    val people = listOf(
        Person("张三", 25, "北京"),
        Person("李四", 30, "上海"),
        Person("王五", 35, "北京"),
        Person("赵六", 28, "广州"),
        Person("钱七", 32, "上海")
    )
    
    // map操作
    val names = people.map { it.name }
    println("姓名列表: $names")
    
    // filter操作
    val adults = people.filter { it.age >= 30 }
    println("30岁以上的人: ${adults.map { it.name }}")
    
    // groupBy操作
    val peopleByCity = people.groupBy { it.city }
    println("按城市分组:")
    peopleByCity.forEach { (city, people) ->
        println("  $city: ${people.map { it.name }}")
    }
    
    // reduce和fold操作
    val ages = people.map { it.age }
    val totalAge = ages.reduce { acc, age -> acc + age }
    val averageAge = ages.fold(0.0) { acc, age -> acc + age } / ages.size
    
    println("总年龄: $totalAge")
    println("平均年龄: $averageAge")
    
    // partition操作
    val (youngPeople, oldPeople) = people.partition { it.age < 30 }
    println("年轻人: ${youngPeople.map { it.name }}")
    println("年长者: ${oldPeople.map { it.name }}")
    
    // flatMap操作
    val words = listOf("hello world", "kotlin programming", "functional style")
    val allWords = words.flatMap { it.split(" ") }
    println("所有单词: $allWords")
    
    // 链式操作
    val result = people
        .filter { it.age >= 28 }
        .groupBy { it.city }
        .mapValues { (_, people) -> people.map { it.name } }
        .filterValues { it.size > 1 }
    
    println("28岁以上且同城人数>1的城市: $result")
}

// 函数式数据结构
sealed class FunctionalList<out T> {
    object Empty : FunctionalList<Nothing>()
    data class Cons<T>(val head: T, val tail: FunctionalList<T>) : FunctionalList<T>()
    
    companion object {
        fun <T> of(vararg elements: T): FunctionalList<T> {
            return elements.foldRight(Empty as FunctionalList<T>) { element, acc ->
                Cons(element, acc)
            }
        }
    }
}

fun <T> FunctionalList<T>.size(): Int = when (this) {
    is FunctionalList.Empty -> 0
    is FunctionalList.Cons -> 1 + tail.size()
}

fun <T> FunctionalList<T>.get(index: Int): T? = when {
    index < 0 -> null
    this is FunctionalList.Empty -> null
    this is FunctionalList.Cons && index == 0 -> head
    this is FunctionalList.Cons -> tail.get(index - 1)
}

fun <T, R> FunctionalList<T>.map(transform: (T) -> R): FunctionalList<R> = when (this) {
    is FunctionalList.Empty -> FunctionalList.Empty
    is FunctionalList.Cons -> FunctionalList.Cons(transform(head), tail.map(transform))
}

fun <T> FunctionalList<T>.filter(predicate: (T) -> Boolean): FunctionalList<T> = when (this) {
    is FunctionalList.Empty -> FunctionalList.Empty
    is FunctionalList.Cons -> if (predicate(head)) {
        FunctionalList.Cons(head, tail.filter(predicate))
    } else {
        tail.filter(predicate)
    }
}

fun functionalDataStructureExample() {
    println("\n=== 函数式数据结构示例 ===")
    
    val list = FunctionalList.of(1, 2, 3, 4, 5)
    println("列表大小: ${list.size()}")
    println("索引2的元素: ${list.get(2)}")
    
    val doubled = list.map { it * 2 }
    println("翻倍后的列表:")
    for (i in 0 until doubled.size()) {
        print("${doubled.get(i)} ")
    }
    println()
    
    val evens = list.filter { it % 2 == 0 }
    println("偶数列表:")
    for (i in 0 until evens.size()) {
        print("${evens.get(i)} ")
    }
    println()
}

// 柯里化和部分应用
fun curryingAndPartialApplication() {
    println("\n=== 柯里化和部分应用示例 ===")
    
    // 柯里化函数
    fun add(x: Int): (Int) -> (Int) -> Int = { y -> { z -> x + y + z } }
    
    val add5 = add(5)
    val add5And3 = add5(3)
    val result = add5And3(2)
    
    println("柯里化结果: 5 + 3 + 2 = $result")
    
    // 部分应用
    fun multiply(x: Int, y: Int, z: Int): Int = x * y * z
    
    fun partialMultiply(x: Int): (Int, Int) -> Int = { y, z -> multiply(x, y, z) }
    
    val multiplyBy2 = partialMultiply(2)
    println("部分应用结果: 2 * 3 * 4 = ${multiplyBy2(3, 4)}")
    
    // 使用扩展函数实现柯里化
    fun <A, B, C> ((A, B) -> C).curry(): (A) -> (B) -> C = { a -> { b -> this(a, b) } }
    
    val normalAdd = { x: Int, y: Int -> x + y }
    val curriedAdd = normalAdd.curry()
    
    println("扩展函数柯里化: ${curriedAdd(10)(20)}")
}

// 函子和单子模式
sealed class Maybe<out T> {
    object None : Maybe<Nothing>()
    data class Some<T>(val value: T) : Maybe<T>()
    
    companion object {
        fun <T> of(value: T?): Maybe<T> = if (value != null) Some(value) else None
    }
}

fun <T, R> Maybe<T>.map(transform: (T) -> R): Maybe<R> = when (this) {
    is Maybe.None -> Maybe.None
    is Maybe.Some -> Maybe.Some(transform(value))
}

fun <T, R> Maybe<T>.flatMap(transform: (T) -> Maybe<R>): Maybe<R> = when (this) {
    is Maybe.None -> Maybe.None
    is Maybe.Some -> transform(value)
}

fun <T> Maybe<T>.getOrElse(default: T): T = when (this) {
    is Maybe.None -> default
    is Maybe.Some -> value
}

fun functorMonadExample() {
    println("\n=== 函子和单子模式示例 ===")
    
    val maybe1 = Maybe.of("hello")
    val maybe2 = Maybe.of<String>(null)
    
    // 函子操作
    val result1 = maybe1.map { it.uppercase() }
    val result2 = maybe2.map { it.uppercase() }
    
    println("函子操作结果1: ${result1.getOrElse("默认值")}")
    println("函子操作结果2: ${result2.getOrElse("默认值")}")
    
    // 单子操作
    fun safeDivide(x: Int, y: Int): Maybe<Int> = 
        if (y != 0) Maybe.Some(x / y) else Maybe.None
    
    val number = Maybe.of(20)
    val divisionResult = number.flatMap { safeDivide(it, 4) }
    
    println("安全除法结果: ${divisionResult.getOrElse(0)}")
    
    // 链式操作
    val chainResult = Maybe.of("42")
        .map { it.toIntOrNull() }
        .flatMap { Maybe.of(it) }
        .map { it * 2 }
        .getOrElse(0)
    
    println("链式操作结果: $chainResult")
}

// 尾递归优化
tailrec fun factorial(n: Long, accumulator: Long = 1): Long {
    return if (n <= 1) accumulator else factorial(n - 1, n * accumulator)
}

tailrec fun fibonacci(n: Int, a: Long = 0, b: Long = 1): Long {
    return when (n) {
        0 -> a
        1 -> b
        else -> fibonacci(n - 1, b, a + b)
    }
}

fun tailRecursionExample() {
    println("\n=== 尾递归优化示例 ===")
    
    println("10的阶乘: ${factorial(10)}")
    println("第20个斐波那契数: ${fibonacci(20)}")
    
    // 尾递归列表处理
    tailrec fun <T> reverseList(list: List<T>, accumulator: List<T> = emptyList()): List<T> {
        return if (list.isEmpty()) accumulator else reverseList(list.drop(1), listOf(list.first()) + accumulator)
    }
    
    val originalList = listOf(1, 2, 3, 4, 5)
    val reversedList = reverseList(originalList)
    println("原列表: $originalList")
    println("反转列表: $reversedList")
}

// 惰性求值
class LazySequence<T>(private val generator: () -> Sequence<T>) {
    private val sequence by lazy { generator() }
    
    fun take(n: Int): List<T> = sequence.take(n).toList()
    fun filter(predicate: (T) -> Boolean): LazySequence<T> = 
        LazySequence { sequence.filter(predicate) }
    fun map(transform: (T) -> T): LazySequence<T> = 
        LazySequence { sequence.map(transform) }
}

fun lazyEvaluationExample() {
    println("\n=== 惰性求值示例 ===")
    
    // 使用Kotlin的Sequence
    val infiniteNumbers = generateSequence(1) { it + 1 }
    val result = infiniteNumbers
        .filter { it % 2 == 0 }
        .map { it * it }
        .take(5)
        .toList()
    
    println("无限序列的前5个偶数的平方: $result")
    
    // 自定义惰性序列
    val lazyFibonacci = LazySequence {
        generateSequence(Pair(0L, 1L)) { (a, b) -> Pair(b, a + b) }
            .map { it.first }
    }
    
    val fibNumbers = lazyFibonacci.take(10)
    println("斐波那契数列前10项: $fibNumbers")
    
    // 惰性属性
    class ExpensiveResource {
        val data: String by lazy {
            println("计算昂贵的资源...")
            Thread.sleep(1000)
            "昂贵的数据"
        }
    }
    
    val resource = ExpensiveResource()
    println("资源创建完成")
    println("第一次访问: ${resource.data}")
    println("第二次访问: ${resource.data}")
}

// 主函数
fun main() {
    println("=== Kotlin函数式编程示例 ===")
    
    higherOrderFunctionExamples()
    lambdaAndClosureExamples()
    collectionFunctionalOperations()
    functionalDataStructureExample()
    curryingAndPartialApplication()
    functorMonadExample()
    tailRecursionExample()
    lazyEvaluationExample()
    
    println("\n所有函数式编程示例完成!")
}
