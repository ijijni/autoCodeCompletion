/**
 * Rust特征和泛型示例
 */

use std::fmt::{Debug, Display};
use std::ops::{Add, Mul};
use std::cmp::{PartialOrd, Ordering};

// 基础特征定义
trait Drawable {
    fn draw(&self);
    fn area(&self) -> f64;
    
    // 默认实现
    fn description(&self) -> String {
        format!("这是一个面积为 {:.2} 的图形", self.area())
    }
}

trait Colorable {
    fn set_color(&mut self, color: String);
    fn get_color(&self) -> &str;
}

// 结构体定义
#[derive(Debug, Clone)]
struct Circle {
    radius: f64,
    color: String,
}

#[derive(Debug, Clone)]
struct Rectangle {
    width: f64,
    height: f64,
    color: String,
}

#[derive(Debug, Clone)]
struct Triangle {
    base: f64,
    height: f64,
    color: String,
}

// 为结构体实现特征
impl Drawable for Circle {
    fn draw(&self) {
        println!("绘制一个半径为 {} 的{}圆形", self.radius, self.color);
    }
    
    fn area(&self) -> f64 {
        std::f64::consts::PI * self.radius * self.radius
    }
}

impl Colorable for Circle {
    fn set_color(&mut self, color: String) {
        self.color = color;
    }
    
    fn get_color(&self) -> &str {
        &self.color
    }
}

impl Drawable for Rectangle {
    fn draw(&self) {
        println!("绘制一个 {}x{} 的{}矩形", self.width, self.height, self.color);
    }
    
    fn area(&self) -> f64 {
        self.width * self.height
    }
}

impl Colorable for Rectangle {
    fn set_color(&mut self, color: String) {
        self.color = color;
    }
    
    fn get_color(&self) -> &str {
        &self.color
    }
}

impl Drawable for Triangle {
    fn draw(&self) {
        println!("绘制一个底边 {} 高 {} 的{}三角形", self.base, self.height, self.color);
    }
    
    fn area(&self) -> f64 {
        0.5 * self.base * self.height
    }
}

impl Colorable for Triangle {
    fn set_color(&mut self, color: String) {
        self.color = color;
    }
    
    fn get_color(&self) -> &str {
        &self.color
    }
}

// 特征对象示例
fn draw_shapes(shapes: &[Box<dyn Drawable>]) {
    println!("\n=== 绘制图形 ===");
    for shape in shapes {
        shape.draw();
        println!("  {}", shape.description());
    }
}

// 泛型函数示例
fn print_info<T: Debug + Display>(item: T) {
    println!("Debug: {:?}", item);
    println!("Display: {}", item);
}

fn compare_and_print<T: PartialOrd + Debug>(a: T, b: T) {
    println!("比较 {:?} 和 {:?}:", a, b);
    match a.partial_cmp(&b) {
        Some(Ordering::Less) => println!("  第一个更小"),
        Some(Ordering::Greater) => println!("  第一个更大"),
        Some(Ordering::Equal) => println!("  两个相等"),
        None => println!("  无法比较"),
    }
}

// 泛型结构体
#[derive(Debug)]
struct Point<T> {
    x: T,
    y: T,
}

impl<T> Point<T> {
    fn new(x: T, y: T) -> Self {
        Point { x, y }
    }
    
    fn x(&self) -> &T {
        &self.x
    }
    
    fn y(&self) -> &T {
        &self.y
    }
}

impl<T: Add<Output = T> + Copy> Point<T> {
    fn add(&self, other: &Point<T>) -> Point<T> {
        Point {
            x: self.x + other.x,
            y: self.y + other.y,
        }
    }
}

impl<T: Display> Display for Point<T> {
    fn fmt(&self, f: &mut std::fmt::Formatter<'_>) -> std::fmt::Result {
        write!(f, "({}, {})", self.x, self.y)
    }
}

// 泛型枚举
#[derive(Debug)]
enum Result<T, E> {
    Ok(T),
    Err(E),
}

impl<T, E> Result<T, E> {
    fn is_ok(&self) -> bool {
        matches!(self, Result::Ok(_))
    }
    
    fn is_err(&self) -> bool {
        matches!(self, Result::Err(_))
    }
    
    fn unwrap(self) -> T 
    where 
        E: Debug 
    {
        match self {
            Result::Ok(value) => value,
            Result::Err(error) => panic!("调用unwrap时出错: {:?}", error),
        }
    }
    
    fn map<U, F>(self, f: F) -> Result<U, E>
    where
        F: FnOnce(T) -> U,
    {
        match self {
            Result::Ok(value) => Result::Ok(f(value)),
            Result::Err(error) => Result::Err(error),
        }
    }
}

// 关联类型示例
trait Iterator {
    type Item;
    
    fn next(&mut self) -> Option<Self::Item>;
    
    fn collect<C: FromIterator<Self::Item>>(self) -> C
    where
        Self: Sized,
    {
        FromIterator::from_iter(self)
    }
}

trait FromIterator<T> {
    fn from_iter<I: Iterator<Item = T>>(iter: I) -> Self;
}

struct Counter {
    current: usize,
    max: usize,
}

impl Counter {
    fn new(max: usize) -> Counter {
        Counter { current: 0, max }
    }
}

impl Iterator for Counter {
    type Item = usize;
    
    fn next(&mut self) -> Option<Self::Item> {
        if self.current < self.max {
            let current = self.current;
            self.current += 1;
            Some(current)
        } else {
            None
        }
    }
}

// 生命周期和特征
trait Summarizable {
    fn summarize(&self) -> String;
    
    fn summarize_author(&self) -> String;
    
    fn summarize_with_author(&self) -> String {
        format!("(作者: {}) {}", self.summarize_author(), self.summarize())
    }
}

struct Article<'a> {
    title: &'a str,
    content: &'a str,
    author: &'a str,
}

impl<'a> Summarizable for Article<'a> {
    fn summarize(&self) -> String {
        format!("{}: {}", self.title, &self.content[..50.min(self.content.len())])
    }
    
    fn summarize_author(&self) -> String {
        self.author.to_string()
    }
}

// 特征边界和where子句
fn complex_function<T, U>(t: T, u: U) -> String
where
    T: Display + Clone + Debug,
    U: Display + Clone,
{
    format!("T: {} (debug: {:?}), U: {}", t, t, u)
}

// 条件实现
struct Pair<T> {
    x: T,
    y: T,
}

impl<T> Pair<T> {
    fn new(x: T, y: T) -> Self {
        Self { x, y }
    }
}

impl<T: Display + PartialOrd> Pair<T> {
    fn cmp_display(&self) {
        if self.x >= self.y {
            println!("最大值是 x = {}", self.x);
        } else {
            println!("最大值是 y = {}", self.y);
        }
    }
}

// 高阶特征边界
fn apply_to_all<T, F>(items: &mut [T], f: F)
where
    F: Fn(&mut T),
{
    for item in items {
        f(item);
    }
}

// 特征对象和动态分发
trait Animal {
    fn name(&self) -> &str;
    fn noise(&self) -> &str;
    
    fn talk(&self) {
        println!("{} 说: {}", self.name(), self.noise());
    }
}

struct Dog {
    name: String,
}

struct Cat {
    name: String,
}

impl Animal for Dog {
    fn name(&self) -> &str {
        &self.name
    }
    
    fn noise(&self) -> &str {
        "汪汪"
    }
}

impl Animal for Cat {
    fn name(&self) -> &str {
        &self.name
    }
    
    fn noise(&self) -> &str {
        "喵喵"
    }
}

// 操作符重载
#[derive(Debug, Clone, Copy)]
struct Vector2D {
    x: f64,
    y: f64,
}

impl Add for Vector2D {
    type Output = Vector2D;
    
    fn add(self, other: Vector2D) -> Vector2D {
        Vector2D {
            x: self.x + other.x,
            y: self.y + other.y,
        }
    }
}

impl Mul<f64> for Vector2D {
    type Output = Vector2D;
    
    fn mul(self, scalar: f64) -> Vector2D {
        Vector2D {
            x: self.x * scalar,
            y: self.y * scalar,
        }
    }
}

impl Display for Vector2D {
    fn fmt(&self, f: &mut std::fmt::Formatter<'_>) -> std::fmt::Result {
        write!(f, "({:.2}, {:.2})", self.x, self.y)
    }
}

// 示例函数
fn trait_examples() {
    println!("\n=== 特征示例 ===");
    
    let mut circle = Circle { radius: 5.0, color: "红色".to_string() };
    let mut rectangle = Rectangle { width: 4.0, height: 6.0, color: "蓝色".to_string() };
    let mut triangle = Triangle { base: 3.0, height: 4.0, color: "绿色".to_string() };
    
    // 使用特征方法
    circle.draw();
    rectangle.draw();
    triangle.draw();
    
    println!("圆形面积: {:.2}", circle.area());
    println!("矩形面积: {:.2}", rectangle.area());
    println!("三角形面积: {:.2}", triangle.area());
    
    // 修改颜色
    circle.set_color("黄色".to_string());
    println!("圆形新颜色: {}", circle.get_color());
    
    // 特征对象
    let shapes: Vec<Box<dyn Drawable>> = vec![
        Box::new(circle),
        Box::new(rectangle),
        Box::new(triangle),
    ];
    
    draw_shapes(&shapes);
}

fn generic_examples() {
    println!("\n=== 泛型示例 ===");
    
    // 泛型点
    let int_point = Point::new(5, 10);
    let float_point = Point::new(1.5, 2.5);
    
    println!("整数点: {}", int_point);
    println!("浮点数点: {}", float_point);
    
    let sum_point = int_point.add(&Point::new(3, 4));
    println!("点相加: {}", sum_point);
    
    // 比较函数
    compare_and_print(5, 10);
    compare_and_print("hello", "world");
    
    // 自定义Result
    let success: Result<i32, String> = Result::Ok(42);
    let failure: Result<i32, String> = Result::Err("错误".to_string());
    
    println!("成功结果: {:?}", success);
    println!("失败结果: {:?}", failure);
    
    let mapped = success.map(|x| x * 2);
    println!("映射后的结果: {:?}", mapped);
}

fn iterator_examples() {
    println!("\n=== 迭代器示例 ===");
    
    let mut counter = Counter::new(5);
    
    println!("计数器输出:");
    while let Some(value) = counter.next() {
        println!("  {}", value);
    }
}

fn lifetime_trait_examples() {
    println!("\n=== 生命周期和特征示例 ===");
    
    let article = Article {
        title: "Rust编程",
        content: "Rust是一种系统编程语言，专注于安全、速度和并发性。它通过所有权系统来管理内存，避免了垃圾回收的开销。",
        author: "Rust开发者",
    };
    
    println!("文章摘要: {}", article.summarize());
    println!("带作者的摘要: {}", article.summarize_with_author());
}

fn operator_overloading_examples() {
    println!("\n=== 操作符重载示例 ===");
    
    let v1 = Vector2D { x: 1.0, y: 2.0 };
    let v2 = Vector2D { x: 3.0, y: 4.0 };
    
    let sum = v1 + v2;
    let scaled = v1 * 2.5;
    
    println!("向量1: {}", v1);
    println!("向量2: {}", v2);
    println!("向量相加: {}", sum);
    println!("向量缩放: {}", scaled);
}

fn trait_object_examples() {
    println!("\n=== 特征对象示例 ===");
    
    let animals: Vec<Box<dyn Animal>> = vec![
        Box::new(Dog { name: "旺财".to_string() }),
        Box::new(Cat { name: "咪咪".to_string() }),
        Box::new(Dog { name: "小黑".to_string() }),
    ];
    
    for animal in animals {
        animal.talk();
    }
}

fn main() {
    println!("=== Rust特征和泛型示例 ===");
    
    trait_examples();
    generic_examples();
    iterator_examples();
    lifetime_trait_examples();
    operator_overloading_examples();
    trait_object_examples();
    
    // 复杂函数示例
    println!("\n=== 复杂函数示例 ===");
    let result = complex_function("Hello".to_string(), 42);
    println!("复杂函数结果: {}", result);
    
    // 条件实现示例
    let pair = Pair::new(10, 20);
    pair.cmp_display();
    
    // 高阶函数示例
    let mut numbers = vec![1, 2, 3, 4, 5];
    apply_to_all(&mut numbers, |x| *x *= 2);
    println!("应用函数后的数组: {:?}", numbers);
    
    println!("\n所有特征和泛型示例完成!");
}
