/**
 * Rust宏和元编程示例
 */

// 声明式宏示例
macro_rules! say_hello {
    () => {
        println!("Hello, World!");
    };
    ($name:expr) => {
        println!("Hello, {}!", $name);
    };
    ($name:expr, $times:expr) => {
        for _ in 0..$times {
            println!("Hello, {}!", $name);
        }
    };
}

// 创建向量的宏
macro_rules! vec_of {
    ($elem:expr; $n:expr) => {
        {
            let mut v = Vec::new();
            for _ in 0..$n {
                v.push($elem);
            }
            v
        }
    };
    ($($elem:expr),*) => {
        {
            let mut v = Vec::new();
            $(v.push($elem);)*
            v
        }
    };
    ($($elem:expr,)*) => {
        vec_of![$($elem),*]
    };
}

// 计算宏
macro_rules! calculate {
    (eval $e:expr) => {
        {
            let val: usize = $e;
            println!("{} = {}", stringify!($e), val);
            val
        }
    };
}

// 哈希映射创建宏
macro_rules! hashmap {
    ($($key:expr => $val:expr),*) => {
        {
            let mut map = std::collections::HashMap::new();
            $(map.insert($key, $val);)*
            map
        }
    };
    ($($key:expr => $val:expr,)*) => {
        hashmap!($($key => $val),*)
    };
}

// 条件编译宏
macro_rules! debug_print {
    ($($arg:tt)*) => {
        #[cfg(debug_assertions)]
        {
            println!("[DEBUG] {}", format!($($arg)*));
        }
    };
}

// 结构体生成宏
macro_rules! create_struct {
    ($name:ident { $($field:ident: $type:ty),* }) => {
        #[derive(Debug, Clone)]
        struct $name {
            $($field: $type,)*
        }
        
        impl $name {
            fn new($($field: $type),*) -> Self {
                $name {
                    $($field,)*
                }
            }
        }
    };
}

// 枚举生成宏
macro_rules! create_enum {
    ($name:ident { $($variant:ident),* }) => {
        #[derive(Debug, Clone, PartialEq)]
        enum $name {
            $($variant,)*
        }
        
        impl $name {
            fn variants() -> Vec<&'static str> {
                vec![$(stringify!($variant)),*]
            }
            
            fn from_str(s: &str) -> Option<Self> {
                match s {
                    $(stringify!($variant) => Some($name::$variant),)*
                    _ => None,
                }
            }
        }
    };
}

// 测试生成宏
macro_rules! test_case {
    ($name:ident: $input:expr => $expected:expr) => {
        #[test]
        fn $name() {
            assert_eq!($input, $expected);
        }
    };
}

// 函数生成宏
macro_rules! impl_ops {
    ($struct_name:ident, $($op:ident),*) => {
        $(
            impl $struct_name {
                paste::paste! {
                    fn [<$op _assign>](&mut self, other: Self) {
                        self.x = self.x.$op(other.x);
                        self.y = self.y.$op(other.y);
                    }
                }
            }
        )*
    };
}

// 递归宏示例
macro_rules! count {
    () => (0usize);
    ($head:tt $($tail:tt)*) => (1usize + count!($($tail)*));
}

macro_rules! reverse {
    () => {};
    ($head:expr) => { $head };
    ($head:expr, $($tail:expr),*) => {
        reverse!($($tail),*), $head
    };
}

// 属性宏模拟（使用声明式宏）
macro_rules! benchmark {
    (fn $name:ident($($param:ident: $param_type:ty),*) -> $ret_type:ty $body:block) => {
        fn $name($($param: $param_type),*) -> $ret_type {
            let start = std::time::Instant::now();
            let result = $body;
            let duration = start.elapsed();
            println!("函数 {} 执行时间: {:?}", stringify!($name), duration);
            result
        }
    };
}

// 使用生成的结构体
create_struct!(Point { x: f64, y: f64 });
create_struct!(Person { name: String, age: u32, email: String });

// 使用生成的枚举
create_enum!(Color { Red, Green, Blue, Yellow });
create_enum!(Direction { North, South, East, West });

// DSL宏示例
macro_rules! html {
    ($tag:ident { $($content:tt)* }) => {
        format!("<{}>{}</{}>", stringify!($tag), html_content!($($content)*), stringify!($tag))
    };
    ($tag:ident) => {
        format!("<{} />", stringify!($tag))
    };
}

macro_rules! html_content {
    ($text:literal) => { $text };
    ($($element:tt)*) => {
        format!("{}", html!($($element)*))
    };
}

// 配置宏
macro_rules! config {
    ($($key:ident = $value:expr),*) => {
        {
            let mut config = std::collections::HashMap::new();
            $(config.insert(stringify!($key), $value.to_string());)*
            config
        }
    };
}

// 日志宏
macro_rules! log {
    (info: $($arg:tt)*) => {
        println!("[INFO] {}", format!($($arg)*));
    };
    (warn: $($arg:tt)*) => {
        println!("[WARN] {}", format!($($arg)*));
    };
    (error: $($arg:tt)*) => {
        eprintln!("[ERROR] {}", format!($($arg)*));
    };
}

// 单元测试宏
macro_rules! assert_approx_eq {
    ($left:expr, $right:expr, $epsilon:expr) => {
        if ($left - $right).abs() > $epsilon {
            panic!("断言失败: {} ≈ {} (误差: {})", $left, $right, $epsilon);
        }
    };
}

// 链式调用宏
macro_rules! chain {
    ($initial:expr) => { $initial };
    ($initial:expr, $($method:ident($($arg:expr),*)),*) => {
        {
            let mut result = $initial;
            $(result = result.$method($($arg),*);)*
            result
        }
    };
}

// 模式匹配增强宏
macro_rules! match_guard {
    ($expr:expr, {
        $($pattern:pat if $guard:expr => $result:expr),*
        $(, _ => $default:expr)?
    }) => {
        match $expr {
            $($pattern if $guard => $result,)*
            $(_ => $default)?
        }
    };
}

// 示例函数
fn declarative_macro_examples() {
    println!("\n=== 声明式宏示例 ===");
    
    // say_hello宏
    say_hello!();
    say_hello!("Rust");
    say_hello!("World", 3);
    
    // vec_of宏
    let v1 = vec_of![1, 2, 3, 4, 5];
    let v2 = vec_of![0; 5];
    let v3 = vec_of![1, 2, 3,]; // 支持尾随逗号
    
    println!("v1: {:?}", v1);
    println!("v2: {:?}", v2);
    println!("v3: {:?}", v3);
    
    // calculate宏
    calculate!(eval 2 + 3 * 4);
    calculate!(eval (5 + 3) * 2);
    
    // hashmap宏
    let map = hashmap! {
        "name" => "Rust",
        "version" => "1.70",
        "type" => "systems programming"
    };
    println!("HashMap: {:?}", map);
    
    // debug_print宏
    debug_print!("这是一个调试消息: {}", 42);
}

fn struct_enum_generation_examples() {
    println!("\n=== 结构体和枚举生成示例 ===");
    
    // 使用生成的结构体
    let point = Point::new(3.0, 4.0);
    let person = Person::new("张三".to_string(), 25, "zhangsan@example.com".to_string());
    
    println!("点: {:?}", point);
    println!("人员: {:?}", person);
    
    // 使用生成的枚举
    println!("颜色变体: {:?}", Color::variants());
    println!("方向变体: {:?}", Direction::variants());
    
    let color = Color::from_str("Red");
    println!("从字符串解析颜色: {:?}", color);
}

fn recursive_macro_examples() {
    println!("\n=== 递归宏示例 ===");
    
    // count宏
    let count1 = count!();
    let count2 = count!(a);
    let count3 = count!(a b c d e);
    
    println!("计数: {}, {}, {}", count1, count2, count3);
    
    // reverse宏（编译时反转）
    let original = vec![1, 2, 3, 4, 5];
    let reversed = vec![reverse!(1, 2, 3, 4, 5)];
    
    println!("原始: {:?}", original);
    println!("反转: {:?}", reversed);
}

// 使用benchmark宏
benchmark! {
    fn fibonacci(n: u32) -> u64 {
        match n {
            0 => 0,
            1 => 1,
            _ => fibonacci(n - 1) + fibonacci(n - 2),
        }
    }
}

fn dsl_examples() {
    println!("\n=== DSL宏示例 ===");
    
    // HTML DSL
    let html_content = html!(div {
        html!(h1 { "标题" })
    });
    println!("HTML: {}", html_content);
    
    // 配置DSL
    let app_config = config! {
        host = "localhost",
        port = 8080,
        debug = true
    };
    println!("配置: {:?}", app_config);
}

fn utility_macro_examples() {
    println!("\n=== 实用宏示例 ===");
    
    // 日志宏
    log!(info: "应用程序启动");
    log!(warn: "这是一个警告: {}", "内存使用率高");
    log!(error: "发生错误: {}", "连接失败");
    
    // 近似相等断言
    assert_approx_eq!(3.14159, 3.14160, 0.001);
    println!("近似相等断言通过");
    
    // 模式匹配增强
    let value = 42;
    let result = match_guard!(value, {
        x if x < 0 => "负数",
        x if x == 0 => "零",
        x if x > 0 && x < 100 => "正数（小于100）",
        _ => "大数"
    });
    println!("匹配结果: {}", result);
}

// 过程宏模拟示例
fn procedural_macro_simulation() {
    println!("\n=== 过程宏模拟示例 ===");
    
    // 模拟derive宏的功能
    macro_rules! auto_debug {
        (struct $name:ident { $($field:ident: $type:ty),* }) => {
            struct $name {
                $($field: $type,)*
            }
            
            impl std::fmt::Debug for $name {
                fn fmt(&self, f: &mut std::fmt::Formatter<'_>) -> std::fmt::Result {
                    f.debug_struct(stringify!($name))
                        $(.field(stringify!($field), &self.$field))*
                        .finish()
                }
            }
        };
    }
    
    auto_debug! {
        struct AutoDebugStruct {
            name: String,
            value: i32
        }
    }
    
    let instance = AutoDebugStruct {
        name: "测试".to_string(),
        value: 42,
    };
    
    println!("自动Debug: {:?}", instance);
}

fn main() {
    println!("=== Rust宏和元编程示例 ===");
    
    declarative_macro_examples();
    struct_enum_generation_examples();
    recursive_macro_examples();
    dsl_examples();
    utility_macro_examples();
    procedural_macro_simulation();
    
    // 基准测试示例
    println!("\n=== 基准测试示例 ===");
    let result = fibonacci(10);
    println!("斐波那契(10) = {}", result);
    
    println!("\n所有宏和元编程示例完成!");
}
