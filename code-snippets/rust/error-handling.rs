/**
 * Rust错误处理示例
 */

use std::fs::File;
use std::io::{self, Read, ErrorKind};
use std::num::ParseIntError;
use std::fmt;
use std::error::Error;

// 基础Result和Option示例
fn basic_result_option_examples() {
    println!("\n=== 基础Result和Option示例 ===");
    
    // Option示例
    let numbers = vec![1, 2, 3, 4, 5];
    
    match numbers.get(2) {
        Some(value) => println!("索引2的值: {}", value),
        None => println!("索引2不存在"),
    }
    
    // 使用unwrap_or提供默认值
    let value = numbers.get(10).unwrap_or(&0);
    println!("索引10的值（默认0）: {}", value);
    
    // Result示例
    let result = divide(10.0, 2.0);
    match result {
        Ok(value) => println!("10 / 2 = {}", value),
        Err(e) => println!("除法错误: {}", e),
    }
    
    let result = divide(10.0, 0.0);
    match result {
        Ok(value) => println!("10 / 0 = {}", value),
        Err(e) => println!("除法错误: {}", e),
    }
}

fn divide(a: f64, b: f64) -> Result<f64, String> {
    if b == 0.0 {
        Err("除数不能为零".to_string())
    } else {
        Ok(a / b)
    }
}

// 自定义错误类型
#[derive(Debug)]
enum MathError {
    DivisionByZero,
    NegativeSquareRoot,
    InvalidInput(String),
}

impl fmt::Display for MathError {
    fn fmt(&self, f: &mut fmt::Formatter) -> fmt::Result {
        match self {
            MathError::DivisionByZero => write!(f, "除数不能为零"),
            MathError::NegativeSquareRoot => write!(f, "负数不能开平方根"),
            MathError::InvalidInput(msg) => write!(f, "无效输入: {}", msg),
        }
    }
}

impl Error for MathError {}

fn safe_divide(a: f64, b: f64) -> Result<f64, MathError> {
    if b == 0.0 {
        Err(MathError::DivisionByZero)
    } else {
        Ok(a / b)
    }
}

fn safe_sqrt(x: f64) -> Result<f64, MathError> {
    if x < 0.0 {
        Err(MathError::NegativeSquareRoot)
    } else {
        Ok(x.sqrt())
    }
}

fn parse_and_calculate(input: &str) -> Result<f64, MathError> {
    let number: f64 = input.parse()
        .map_err(|_| MathError::InvalidInput(format!("无法解析 '{}'", input)))?;
    
    safe_sqrt(number)
}

fn custom_error_examples() {
    println!("\n=== 自定义错误类型示例 ===");
    
    // 测试除法
    match safe_divide(10.0, 2.0) {
        Ok(result) => println!("10 / 2 = {}", result),
        Err(e) => println!("错误: {}", e),
    }
    
    match safe_divide(10.0, 0.0) {
        Ok(result) => println!("10 / 0 = {}", result),
        Err(e) => println!("错误: {}", e),
    }
    
    // 测试平方根
    match safe_sqrt(16.0) {
        Ok(result) => println!("√16 = {}", result),
        Err(e) => println!("错误: {}", e),
    }
    
    match safe_sqrt(-4.0) {
        Ok(result) => println!("√(-4) = {}", result),
        Err(e) => println!("错误: {}", e),
    }
    
    // 测试解析和计算
    match parse_and_calculate("25") {
        Ok(result) => println!("√25 = {}", result),
        Err(e) => println!("错误: {}", e),
    }
    
    match parse_and_calculate("abc") {
        Ok(result) => println!("√abc = {}", result),
        Err(e) => println!("错误: {}", e),
    }
}

// 错误传播示例
fn read_username_from_file() -> Result<String, io::Error> {
    let mut f = File::open("hello.txt")?;
    let mut s = String::new();
    f.read_to_string(&mut s)?;
    Ok(s)
}

fn read_username_from_file_shorter() -> Result<String, io::Error> {
    let mut s = String::new();
    File::open("hello.txt")?.read_to_string(&mut s)?;
    Ok(s)
}

fn read_username_from_file_shortest() -> Result<String, io::Error> {
    std::fs::read_to_string("hello.txt")
}

fn error_propagation_examples() {
    println!("\n=== 错误传播示例 ===");
    
    // 创建一个测试文件
    std::fs::write("hello.txt", "用户名: rust_user").unwrap_or_else(|e| {
        println!("创建测试文件失败: {}", e);
    });
    
    match read_username_from_file() {
        Ok(username) => println!("读取到用户名: {}", username),
        Err(e) => println!("读取文件失败: {}", e),
    }
    
    match read_username_from_file_shorter() {
        Ok(username) => println!("读取到用户名（简化版）: {}", username),
        Err(e) => println!("读取文件失败: {}", e),
    }
    
    match read_username_from_file_shortest() {
        Ok(username) => println!("读取到用户名（最简版）: {}", username),
        Err(e) => println!("读取文件失败: {}", e),
    }
    
    // 清理测试文件
    std::fs::remove_file("hello.txt").unwrap_or_else(|e| {
        println!("删除测试文件失败: {}", e);
    });
}

// 多种错误类型的处理
#[derive(Debug)]
enum AppError {
    Io(io::Error),
    Parse(ParseIntError),
    Math(MathError),
}

impl fmt::Display for AppError {
    fn fmt(&self, f: &mut fmt::Formatter) -> fmt::Result {
        match self {
            AppError::Io(e) => write!(f, "IO错误: {}", e),
            AppError::Parse(e) => write!(f, "解析错误: {}", e),
            AppError::Math(e) => write!(f, "数学错误: {}", e),
        }
    }
}

impl Error for AppError {
    fn source(&self) -> Option<&(dyn Error + 'static)> {
        match self {
            AppError::Io(e) => Some(e),
            AppError::Parse(e) => Some(e),
            AppError::Math(e) => Some(e),
        }
    }
}

impl From<io::Error> for AppError {
    fn from(error: io::Error) -> Self {
        AppError::Io(error)
    }
}

impl From<ParseIntError> for AppError {
    fn from(error: ParseIntError) -> Self {
        AppError::Parse(error)
    }
}

impl From<MathError> for AppError {
    fn from(error: MathError) -> Self {
        AppError::Math(error)
    }
}

fn complex_operation(input: &str) -> Result<f64, AppError> {
    // 尝试解析输入
    let number: i32 = input.parse()?;
    
    // 转换为浮点数并进行数学运算
    let float_number = number as f64;
    let result = safe_sqrt(float_number)?;
    
    Ok(result)
}

fn multiple_error_types_examples() {
    println!("\n=== 多种错误类型处理示例 ===");
    
    let test_inputs = vec!["16", "-4", "abc", "25"];
    
    for input in test_inputs {
        match complex_operation(input) {
            Ok(result) => println!("输入 '{}' 的平方根: {}", input, result),
            Err(e) => {
                println!("处理输入 '{}' 时出错: {}", input, e);
                
                // 检查错误的具体类型
                match e {
                    AppError::Parse(_) => println!("  这是一个解析错误"),
                    AppError::Math(MathError::NegativeSquareRoot) => println!("  不能对负数开平方根"),
                    AppError::Io(_) => println!("  这是一个IO错误"),
                    _ => println!("  其他类型的错误"),
                }
            }
        }
    }
}

// panic!和unwrap的使用
fn panic_and_unwrap_examples() {
    println!("\n=== panic!和unwrap示例 ===");
    
    // 安全的unwrap替代方案
    let numbers = vec![1, 2, 3];
    
    // 使用expect提供更好的错误信息
    let value = numbers.get(1).expect("索引1应该存在");
    println!("索引1的值: {}", value);
    
    // 使用unwrap_or提供默认值
    let value = numbers.get(10).unwrap_or(&0);
    println!("索引10的值（默认0）: {}", value);
    
    // 使用unwrap_or_else进行懒计算
    let value = numbers.get(10).unwrap_or_else(|| {
        println!("索引10不存在，返回默认值");
        &-1
    });
    println!("索引10的值（懒计算默认值）: {}", value);
    
    // 条件性panic
    let condition = true;
    if !condition {
        panic!("条件不满足！");
    }
    
    println!("条件检查通过");
}

// 错误恢复策略
fn error_recovery_strategies() {
    println!("\n=== 错误恢复策略示例 ===");
    
    // 策略1：重试机制
    let result = retry_operation(3, || {
        use std::sync::atomic::{AtomicUsize, Ordering};
        static COUNTER: AtomicUsize = AtomicUsize::new(0);
        
        let count = COUNTER.fetch_add(1, Ordering::SeqCst);
        if count < 2 {
            Err("模拟失败".to_string())
        } else {
            Ok("成功！".to_string())
        }
    });
    
    match result {
        Ok(value) => println!("重试成功: {}", value),
        Err(e) => println!("重试失败: {}", e),
    }
    
    // 策略2：降级处理
    let result = get_data_with_fallback();
    println!("获取数据结果: {}", result);
    
    // 策略3：错误聚合
    let results = process_multiple_items();
    println!("处理结果: {:?}", results);
}

fn retry_operation<T, E, F>(max_retries: usize, mut operation: F) -> Result<T, E>
where
    F: FnMut() -> Result<T, E>,
{
    let mut last_error = None;
    
    for attempt in 0..=max_retries {
        match operation() {
            Ok(value) => {
                if attempt > 0 {
                    println!("第{}次尝试成功", attempt + 1);
                }
                return Ok(value);
            }
            Err(e) => {
                println!("第{}次尝试失败", attempt + 1);
                last_error = Some(e);
            }
        }
    }
    
    Err(last_error.unwrap())
}

fn get_data_with_fallback() -> String {
    // 尝试从主要来源获取数据
    match get_primary_data() {
        Ok(data) => data,
        Err(_) => {
            println!("主要数据源失败，使用备用数据源");
            get_fallback_data()
        }
    }
}

fn get_primary_data() -> Result<String, &'static str> {
    Err("主要数据源不可用")
}

fn get_fallback_data() -> String {
    "备用数据".to_string()
}

fn process_multiple_items() -> (Vec<String>, Vec<String>) {
    let items = vec!["1", "abc", "3", "def", "5"];
    let mut successes = Vec::new();
    let mut errors = Vec::new();
    
    for item in items {
        match item.parse::<i32>() {
            Ok(number) => successes.push(format!("解析成功: {}", number)),
            Err(e) => errors.push(format!("解析失败 '{}': {}", item, e)),
        }
    }
    
    (successes, errors)
}

// 函数式错误处理
fn functional_error_handling() {
    println!("\n=== 函数式错误处理示例 ===");
    
    let numbers = vec!["1", "2", "abc", "4", "def"];
    
    // 使用filter_map过滤错误
    let parsed_numbers: Vec<i32> = numbers
        .iter()
        .filter_map(|s| s.parse().ok())
        .collect();
    
    println!("成功解析的数字: {:?}", parsed_numbers);
    
    // 使用partition分离成功和失败
    let results: Vec<Result<i32, _>> = numbers
        .iter()
        .map(|s| s.parse::<i32>())
        .collect();
    
    let (successes, errors): (Vec<_>, Vec<_>) = results
        .into_iter()
        .partition(Result::is_ok);
    
    let successes: Vec<i32> = successes.into_iter().map(Result::unwrap).collect();
    let errors: Vec<_> = errors.into_iter().map(Result::unwrap_err).collect();
    
    println!("成功: {:?}", successes);
    println!("错误: {:?}", errors);
    
    // 链式操作
    let result = "42"
        .parse::<i32>()
        .and_then(|n| safe_divide(n as f64, 2.0).map_err(|_| "除法错误".parse::<i32>().unwrap_err()))
        .and_then(|n| if n > 20.0 { Ok(n) } else { Err("结果太小".parse::<i32>().unwrap_err()) });
    
    match result {
        Ok(value) => println!("链式操作结果: {}", value),
        Err(e) => println!("链式操作错误: {}", e),
    }
}

fn main() {
    println!("=== Rust错误处理示例 ===");
    
    basic_result_option_examples();
    custom_error_examples();
    error_propagation_examples();
    multiple_error_types_examples();
    panic_and_unwrap_examples();
    error_recovery_strategies();
    functional_error_handling();
    
    println!("\n所有错误处理示例完成!");
}
