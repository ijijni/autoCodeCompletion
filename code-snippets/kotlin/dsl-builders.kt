/**
 * Kotlin DSL构建器示例
 */

// HTML DSL构建器
@DslMarker
annotation class HtmlTagMarker

@HtmlTagMarker
abstract class Tag(val name: String) {
    val children = mutableListOf<Tag>()
    val attributes = mutableMapOf<String, String>()
    
    protected fun <T : Tag> initTag(tag: T, init: T.() -> Unit): T {
        tag.init()
        children.add(tag)
        return tag
    }
    
    override fun toString(): String {
        return render(StringBuilder(), "").toString()
    }
    
    private fun render(builder: StringBuilder, indent: String): StringBuilder {
        builder.append("$indent<$name")
        for ((attr, value) in attributes) {
            builder.append(" $attr=\"$value\"")
        }
        if (children.isEmpty()) {
            builder.append("/>\n")
        } else {
            builder.append(">\n")
            for (child in children) {
                child.render(builder, "$indent  ")
            }
            builder.append("$indent</$name>\n")
        }
        return builder
    }
}

abstract class TagWithText(name: String) : Tag(name) {
    operator fun String.unaryPlus() {
        children.add(TextTag(this))
    }
}

class TextTag(val text: String) : Tag("") {
    override fun toString() = text
    
    override fun render(builder: StringBuilder, indent: String): StringBuilder {
        builder.append("$indent$text\n")
        return builder
    }
}

class HTML : TagWithText("html") {
    fun head(init: Head.() -> Unit) = initTag(Head(), init)
    fun body(init: Body.() -> Unit) = initTag(Body(), init)
}

class Head : TagWithText("head") {
    fun title(init: Title.() -> Unit) = initTag(Title(), init)
    fun meta(charset: String? = null, name: String? = null, content: String? = null) {
        val tag = Meta()
        charset?.let { tag.attributes["charset"] = it }
        name?.let { tag.attributes["name"] = it }
        content?.let { tag.attributes["content"] = it }
        children.add(tag)
    }
}

class Meta : Tag("meta")
class Title : TagWithText("title")

class Body : TagWithText("body") {
    fun div(cssClass: String? = null, init: Div.() -> Unit = {}) = initTag(Div(), init).apply {
        cssClass?.let { attributes["class"] = it }
    }
    fun p(init: P.() -> Unit = {}) = initTag(P(), init)
    fun h1(init: H1.() -> Unit = {}) = initTag(H1(), init)
    fun h2(init: H2.() -> Unit = {}) = initTag(H2(), init)
    fun ul(init: UL.() -> Unit = {}) = initTag(UL(), init)
    fun a(href: String, init: A.() -> Unit = {}) = initTag(A(), init).apply {
        attributes["href"] = href
    }
}

class Div : TagWithText("div") {
    fun p(init: P.() -> Unit = {}) = initTag(P(), init)
    fun span(init: Span.() -> Unit = {}) = initTag(Span(), init)
    fun div(cssClass: String? = null, init: Div.() -> Unit = {}) = initTag(Div(), init).apply {
        cssClass?.let { attributes["class"] = it }
    }
}

class P : TagWithText("p")
class H1 : TagWithText("h1")
class H2 : TagWithText("h2")
class Span : TagWithText("span")
class A : TagWithText("a")

class UL : TagWithText("ul") {
    fun li(init: LI.() -> Unit = {}) = initTag(LI(), init)
}

class LI : TagWithText("li")

fun html(init: HTML.() -> Unit): HTML {
    val html = HTML()
    html.init()
    return html
}

// SQL DSL构建器
class SqlSelectBuilder {
    private val columns = mutableListOf<String>()
    private var tableName: String = ""
    private val joins = mutableListOf<String>()
    private val conditions = mutableListOf<String>()
    private val orderByColumns = mutableListOf<String>()
    private var limitValue: Int? = null
    
    fun select(vararg columns: String) {
        this.columns.addAll(columns)
    }
    
    fun from(table: String) {
        this.tableName = table
    }
    
    fun join(table: String, on: String) {
        joins.add("JOIN $table ON $on")
    }
    
    fun leftJoin(table: String, on: String) {
        joins.add("LEFT JOIN $table ON $on")
    }
    
    fun where(condition: String) {
        conditions.add(condition)
    }
    
    fun orderBy(vararg columns: String) {
        orderByColumns.addAll(columns)
    }
    
    fun limit(count: Int) {
        limitValue = count
    }
    
    fun build(): String {
        val sql = StringBuilder()
        
        // SELECT子句
        sql.append("SELECT ")
        if (columns.isEmpty()) {
            sql.append("*")
        } else {
            sql.append(columns.joinToString(", "))
        }
        
        // FROM子句
        sql.append(" FROM $tableName")
        
        // JOIN子句
        if (joins.isNotEmpty()) {
            sql.append(" ").append(joins.joinToString(" "))
        }
        
        // WHERE子句
        if (conditions.isNotEmpty()) {
            sql.append(" WHERE ").append(conditions.joinToString(" AND "))
        }
        
        // ORDER BY子句
        if (orderByColumns.isNotEmpty()) {
            sql.append(" ORDER BY ").append(orderByColumns.joinToString(", "))
        }
        
        // LIMIT子句
        limitValue?.let {
            sql.append(" LIMIT $it")
        }
        
        return sql.toString()
    }
}

fun select(init: SqlSelectBuilder.() -> Unit): String {
    val builder = SqlSelectBuilder()
    builder.init()
    return builder.build()
}

// 配置DSL构建器
class DatabaseConfig {
    var host: String = "localhost"
    var port: Int = 5432
    var database: String = ""
    var username: String = ""
    var password: String = ""
    var maxConnections: Int = 10
    var timeout: Long = 30000
    
    fun ssl(init: SslConfig.() -> Unit) {
        val sslConfig = SslConfig()
        sslConfig.init()
        // 应用SSL配置
    }
    
    override fun toString(): String {
        return "DatabaseConfig(host='$host', port=$port, database='$database', " +
                "username='$username', maxConnections=$maxConnections, timeout=$timeout)"
    }
}

class SslConfig {
    var enabled: Boolean = false
    var certificatePath: String = ""
    var keyPath: String = ""
}

class ServerConfig {
    var port: Int = 8080
    var host: String = "0.0.0.0"
    var environment: String = "development"
    
    fun database(init: DatabaseConfig.() -> Unit) {
        val dbConfig = DatabaseConfig()
        dbConfig.init()
        println("数据库配置: $dbConfig")
    }
    
    fun logging(init: LoggingConfig.() -> Unit) {
        val loggingConfig = LoggingConfig()
        loggingConfig.init()
        println("日志配置: $loggingConfig")
    }
}

class LoggingConfig {
    var level: String = "INFO"
    var file: String? = null
    var console: Boolean = true
    
    override fun toString(): String {
        return "LoggingConfig(level='$level', file=$file, console=$console)"
    }
}

fun server(init: ServerConfig.() -> Unit): ServerConfig {
    val config = ServerConfig()
    config.init()
    return config
}

// JSON构建器DSL
class JsonObjectBuilder {
    private val properties = mutableMapOf<String, Any?>()
    
    infix fun String.to(value: Any?) {
        properties[this] = value
    }
    
    fun obj(key: String, init: JsonObjectBuilder.() -> Unit) {
        val builder = JsonObjectBuilder()
        builder.init()
        properties[key] = builder.build()
    }
    
    fun array(key: String, vararg values: Any?) {
        properties[key] = values.toList()
    }
    
    fun build(): Map<String, Any?> = properties.toMap()
    
    override fun toString(): String {
        return properties.entries.joinToString(", ", "{", "}") { (key, value) ->
            "\"$key\": ${formatValue(value)}"
        }
    }
    
    private fun formatValue(value: Any?): String = when (value) {
        null -> "null"
        is String -> "\"$value\""
        is Map<*, *> -> value.toString()
        is List<*> -> value.joinToString(", ", "[", "]") { formatValue(it) }
        else -> value.toString()
    }
}

fun json(init: JsonObjectBuilder.() -> Unit): JsonObjectBuilder {
    val builder = JsonObjectBuilder()
    builder.init()
    return builder
}

// 测试DSL构建器
class TestSuiteBuilder {
    private val tests = mutableListOf<TestCase>()
    
    fun test(name: String, init: TestCaseBuilder.() -> Unit) {
        val builder = TestCaseBuilder(name)
        builder.init()
        tests.add(builder.build())
    }
    
    fun run() {
        println("运行测试套件...")
        var passed = 0
        var failed = 0
        
        for (test in tests) {
            try {
                test.execute()
                println("✓ ${test.name}")
                passed++
            } catch (e: AssertionError) {
                println("✗ ${test.name}: ${e.message}")
                failed++
            }
        }
        
        println("\n测试结果: $passed 通过, $failed 失败")
    }
}

class TestCaseBuilder(private val name: String) {
    private var setup: (() -> Unit)? = null
    private var teardown: (() -> Unit)? = null
    private var testBody: (() -> Unit)? = null
    
    fun setup(block: () -> Unit) {
        setup = block
    }
    
    fun teardown(block: () -> Unit) {
        teardown = block
    }
    
    fun execute(block: () -> Unit) {
        testBody = block
    }
    
    fun build(): TestCase {
        return TestCase(name, setup, teardown, testBody ?: {})
    }
}

data class TestCase(
    val name: String,
    private val setup: (() -> Unit)?,
    private val teardown: (() -> Unit)?,
    private val testBody: () -> Unit
) {
    fun execute() {
        setup?.invoke()
        try {
            testBody.invoke()
        } finally {
            teardown?.invoke()
        }
    }
}

fun testSuite(init: TestSuiteBuilder.() -> Unit): TestSuiteBuilder {
    val builder = TestSuiteBuilder()
    builder.init()
    return builder
}

// 断言DSL
infix fun <T> T.shouldBe(expected: T) {
    if (this != expected) {
        throw AssertionError("期望 $expected 但得到 $this")
    }
}

infix fun <T> T.shouldNotBe(unexpected: T) {
    if (this == unexpected) {
        throw AssertionError("不应该等于 $unexpected")
    }
}

// 路由DSL构建器
class RouteBuilder {
    private val routes = mutableListOf<Route>()
    
    fun get(path: String, handler: (Request) -> Response) {
        routes.add(Route("GET", path, handler))
    }
    
    fun post(path: String, handler: (Request) -> Response) {
        routes.add(Route("POST", path, handler))
    }
    
    fun put(path: String, handler: (Request) -> Response) {
        routes.add(Route("PUT", path, handler))
    }
    
    fun delete(path: String, handler: (Request) -> Response) {
        routes.add(Route("DELETE", path, handler))
    }
    
    fun group(prefix: String, init: RouteBuilder.() -> Unit) {
        val groupBuilder = RouteBuilder()
        groupBuilder.init()
        routes.addAll(groupBuilder.routes.map { route ->
            route.copy(path = prefix + route.path)
        })
    }
    
    fun getRoutes(): List<Route> = routes.toList()
}

data class Route(
    val method: String,
    val path: String,
    val handler: (Request) -> Response
)

data class Request(val path: String, val method: String, val body: String = "")
data class Response(val status: Int, val body: String)

fun routes(init: RouteBuilder.() -> Unit): List<Route> {
    val builder = RouteBuilder()
    builder.init()
    return builder.getRoutes()
}

// 示例函数
fun htmlDslExample() {
    println("=== HTML DSL示例 ===")
    
    val page = html {
        head {
            title { +"我的网页" }
            meta(charset = "UTF-8")
            meta(name = "viewport", content = "width=device-width, initial-scale=1.0")
        }
        body {
            h1 { +"欢迎来到我的网站" }
            div(cssClass = "container") {
                p { +"这是一个段落。" }
                p { +"这是另一个段落。" }
                div {
                    span { +"这是一个span元素。" }
                }
            }
            ul {
                li { +"列表项1" }
                li { +"列表项2" }
                li { 
                    +"列表项3 - "
                    a(href = "https://kotlinlang.org") { +"Kotlin官网" }
                }
            }
        }
    }
    
    println(page)
}

fun sqlDslExample() {
    println("=== SQL DSL示例 ===")
    
    val query1 = select {
        select("name", "email", "age")
        from("users")
        where("age > 18")
        orderBy("name")
        limit(10)
    }
    
    val query2 = select {
        select("u.name", "p.title")
        from("users u")
        leftJoin("posts p", "u.id = p.user_id")
        where("u.active = true")
        where("p.published = true")
        orderBy("u.name", "p.created_at DESC")
    }
    
    println("查询1: $query1")
    println("查询2: $query2")
}

fun configDslExample() {
    println("=== 配置DSL示例 ===")
    
    val config = server {
        port = 9090
        host = "localhost"
        environment = "production"
        
        database {
            host = "db.example.com"
            port = 5432
            database = "myapp"
            username = "dbuser"
            password = "secret"
            maxConnections = 20
            
            ssl {
                enabled = true
                certificatePath = "/path/to/cert.pem"
            }
        }
        
        logging {
            level = "DEBUG"
            file = "/var/log/app.log"
            console = false
        }
    }
    
    println("服务器配置完成: 端口 ${config.port}, 环境 ${config.environment}")
}

fun jsonDslExample() {
    println("=== JSON DSL示例 ===")
    
    val user = json {
        "id" to 1
        "name" to "张三"
        "email" to "zhangsan@example.com"
        "active" to true
        "age" to 25
        
        obj("address") {
            "street" to "中山路123号"
            "city" to "北京"
            "country" to "中国"
        }
        
        array("hobbies", "编程", "阅读", "旅行")
        
        obj("preferences") {
            "theme" to "dark"
            "language" to "zh-CN"
            "notifications" to true
        }
    }
    
    println("用户JSON: $user")
}

fun testDslExample() {
    println("=== 测试DSL示例 ===")
    
    val suite = testSuite {
        test("字符串连接测试") {
            setup {
                println("  设置测试环境")
            }
            
            execute {
                val result = "Hello" + " " + "World"
                result shouldBe "Hello World"
                result shouldNotBe "Hello"
            }
            
            teardown {
                println("  清理测试环境")
            }
        }
        
        test("数字计算测试") {
            execute {
                val result = 2 + 3 * 4
                result shouldBe 14
                result shouldNotBe 20
            }
        }
        
        test("列表操作测试") {
            execute {
                val list = listOf(1, 2, 3)
                list.size shouldBe 3
                list.first() shouldBe 1
                list.last() shouldBe 3
            }
        }
    }
    
    suite.run()
}

fun routeDslExample() {
    println("=== 路由DSL示例 ===")
    
    val appRoutes = routes {
        get("/") { req ->
            Response(200, "欢迎页面")
        }
        
        get("/about") { req ->
            Response(200, "关于我们")
        }
        
        group("/api") {
            get("/users") { req ->
                Response(200, "用户列表")
            }
            
            post("/users") { req ->
                Response(201, "用户已创建")
            }
            
            group("/v1") {
                get("/status") { req ->
                    Response(200, "API状态正常")
                }
            }
        }
    }
    
    println("注册的路由:")
    appRoutes.forEach { route ->
        println("  ${route.method} ${route.path}")
    }
}

fun main() {
    println("=== Kotlin DSL构建器示例 ===")
    
    htmlDslExample()
    sqlDslExample()
    configDslExample()
    jsonDslExample()
    testDslExample()
    routeDslExample()
    
    println("\n所有DSL构建器示例完成!")
}
