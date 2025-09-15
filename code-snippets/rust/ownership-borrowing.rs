/**
 * Rust所有权和借用示例
 */

use std::collections::HashMap;
use std::rc::Rc;
use std::cell::RefCell;

// 基础所有权示例
fn basic_ownership_examples() {
    println!("\n=== 基础所有权示例 ===");
    
    // 所有权转移
    let s1 = String::from("Hello");
    let s2 = s1; // s1的所有权转移给s2
    // println!("{}", s1); // 错误：s1已经失效
    println!("s2: {}", s2);
    
    // 克隆避免所有权转移
    let s3 = String::from("World");
    let s4 = s3.clone(); // 深拷贝
    println!("s3: {}, s4: {}", s3, s4);
    
    // 基本类型的复制
    let x = 5;
    let y = x; // 复制，不是移动
    println!("x: {}, y: {}", x, y);
    
    // 函数调用中的所有权转移
    let s = String::from("hello");
    takes_ownership(s); // s的所有权转移给函数
    // println!("{}", s); // 错误：s已经失效
    
    let x = 5;
    makes_copy(x); // x被复制，原值仍然有效
    println!("x is still valid: {}", x);
}

fn takes_ownership(some_string: String) {
    println!("函数接收到: {}", some_string);
} // some_string在这里被丢弃

fn makes_copy(some_integer: i32) {
    println!("函数接收到: {}", some_integer);
} // some_integer在这里超出作用域，但没有特殊处理

// 借用示例
fn borrowing_examples() {
    println!("\n=== 借用示例 ===");
    
    let s1 = String::from("hello");
    
    // 不可变借用
    let len = calculate_length(&s1);
    println!("字符串 '{}' 的长度是 {}", s1, len);
    
    // 可变借用
    let mut s2 = String::from("hello");
    change(&mut s2);
    println!("修改后的字符串: {}", s2);
    
    // 多个不可变借用
    let r1 = &s1;
    let r2 = &s1;
    println!("r1: {}, r2: {}", r1, r2);
    
    // 借用规则演示
    let mut s3 = String::from("hello");
    {
        let r1 = &mut s3; // 可变借用
        println!("r1: {}", r1);
    } // r1在这里超出作用域
    
    let r2 = &s3; // 现在可以创建不可变借用
    println!("r2: {}", r2);
}

fn calculate_length(s: &String) -> usize {
    s.len()
} // s超出作用域，但因为它不拥有引用的值，所以什么也不会发生

fn change(some_string: &mut String) {
    some_string.push_str(", world");
}

// 切片示例
fn slice_examples() {
    println!("\n=== 切片示例 ===");
    
    let s = String::from("hello world");
    
    // 字符串切片
    let hello = &s[0..5];
    let world = &s[6..11];
    println!("hello: {}, world: {}", hello, world);
    
    // 使用函数返回切片
    let word = first_word(&s);
    println!("第一个单词: {}", word);
    
    // 数组切片
    let a = [1, 2, 3, 4, 5];
    let slice = &a[1..3];
    println!("数组切片: {:?}", slice);
    
    // 字符串字面量就是切片
    let s = "Hello, world!";
    let word = first_word(s);
    println!("字面量的第一个单词: {}", word);
}

fn first_word(s: &str) -> &str {
    let bytes = s.as_bytes();
    
    for (i, &item) in bytes.iter().enumerate() {
        if item == b' ' {
            return &s[0..i];
        }
    }
    
    &s[..]
}

// 结构体中的所有权
#[derive(Debug)]
struct User {
    username: String,
    email: String,
    sign_in_count: u64,
    active: bool,
}

#[derive(Debug)]
struct UserRef<'a> {
    username: &'a str,
    email: &'a str,
    sign_in_count: u64,
    active: bool,
}

fn struct_ownership_examples() {
    println!("\n=== 结构体所有权示例 ===");
    
    // 拥有数据的结构体
    let user1 = User {
        email: String::from("someone@example.com"),
        username: String::from("someusername123"),
        active: true,
        sign_in_count: 1,
    };
    
    println!("用户1: {:?}", user1);
    
    // 使用结构体更新语法
    let user2 = User {
        email: String::from("another@example.com"),
        username: String::from("anotherusername567"),
        ..user1 // 注意：这会移动user1中的某些字段
    };
    
    println!("用户2: {:?}", user2);
    // println!("{:?}", user1); // 错误：user1的部分字段已被移动
    
    // 使用引用的结构体
    let username = "user123";
    let email = "user@example.com";
    
    let user_ref = UserRef {
        username,
        email,
        active: true,
        sign_in_count: 1,
    };
    
    println!("引用用户: {:?}", user_ref);
}

// 枚举中的所有权
#[derive(Debug)]
enum Message {
    Quit,
    Move { x: i32, y: i32 },
    Write(String),
    ChangeColor(i32, i32, i32),
}

fn enum_ownership_examples() {
    println!("\n=== 枚举所有权示例 ===");
    
    let msg1 = Message::Write(String::from("hello"));
    let msg2 = Message::Move { x: 10, y: 20 };
    let msg3 = Message::ChangeColor(255, 0, 0);
    
    process_message(msg1); // 所有权转移
    process_message(msg2); // 所有权转移
    process_message(msg3); // 所有权转移
    
    // 使用引用避免所有权转移
    let msg4 = Message::Write(String::from("world"));
    process_message_ref(&msg4);
    println!("msg4仍然有效: {:?}", msg4);
}

fn process_message(msg: Message) {
    match msg {
        Message::Quit => println!("退出消息"),
        Message::Move { x, y } => println!("移动到 ({}, {})", x, y),
        Message::Write(text) => println!("写入文本: {}", text),
        Message::ChangeColor(r, g, b) => println!("改变颜色为 RGB({}, {}, {})", r, g, b),
    }
}

fn process_message_ref(msg: &Message) {
    match msg {
        Message::Quit => println!("退出消息"),
        Message::Move { x, y } => println!("移动到 ({}, {})", x, y),
        Message::Write(text) => println!("写入文本: {}", text),
        Message::ChangeColor(r, g, b) => println!("改变颜色为 RGB({}, {}, {})", r, g, b),
    }
}

// 智能指针示例
fn smart_pointer_examples() {
    println!("\n=== 智能指针示例 ===");
    
    // Box<T> - 堆分配
    let b = Box::new(5);
    println!("Box中的值: {}", b);
    
    // Rc<T> - 引用计数
    let data = Rc::new(String::from("共享数据"));
    println!("引用计数: {}", Rc::strong_count(&data));
    
    let data1 = Rc::clone(&data);
    println!("引用计数: {}", Rc::strong_count(&data));
    
    let data2 = Rc::clone(&data);
    println!("引用计数: {}", Rc::strong_count(&data));
    
    drop(data1);
    println!("引用计数: {}", Rc::strong_count(&data));
    
    // RefCell<T> - 内部可变性
    let value = Rc::new(RefCell::new(5));
    
    let a = Rc::clone(&value);
    let b = Rc::clone(&value);
    
    *a.borrow_mut() += 10;
    *b.borrow_mut() += 20;
    
    println!("最终值: {}", value.borrow());
}

// 生命周期示例
fn lifetime_examples() {
    println!("\n=== 生命周期示例 ===");
    
    let string1 = String::from("abcd");
    let string2 = "xyz";
    
    let result = longest(string1.as_str(), string2);
    println!("最长的字符串是: {}", result);
    
    // 生命周期在结构体中的应用
    let novel = String::from("Call me Ishmael. Some years ago...");
    let first_sentence = novel.split('.').next().expect("Could not find a '.'");
    let i = ImportantExcerpt {
        part: first_sentence,
    };
    println!("重要摘录: {}", i.part);
}

fn longest<'a>(x: &'a str, y: &'a str) -> &'a str {
    if x.len() > y.len() {
        x
    } else {
        y
    }
}

#[derive(Debug)]
struct ImportantExcerpt<'a> {
    part: &'a str,
}

impl<'a> ImportantExcerpt<'a> {
    fn level(&self) -> i32 {
        3
    }
    
    fn announce_and_return_part(&self, announcement: &str) -> &str {
        println!("注意！{}", announcement);
        self.part
    }
}

// 复杂的所有权场景
fn complex_ownership_scenarios() {
    println!("\n=== 复杂所有权场景 ===");
    
    // 向量中的所有权
    let mut v = Vec::new();
    v.push(String::from("hello"));
    v.push(String::from("world"));
    
    // 迭代时的借用
    for item in &v {
        println!("项目: {}", item);
    }
    
    // 仍然可以使用v
    println!("向量长度: {}", v.len());
    
    // 哈希映射中的所有权
    let mut map = HashMap::new();
    
    let field_name = String::from("Favorite color");
    let field_value = String::from("Blue");
    
    map.insert(field_name, field_value);
    // field_name和field_value现在无效
    
    // 使用引用避免所有权转移
    let mut map2 = HashMap::new();
    let key = String::from("team");
    let value = String::from("blue");
    
    map2.insert(&key, &value);
    println!("key: {}, value: {}", key, value); // 仍然有效
    
    // 闭包中的所有权
    let x = vec![1, 2, 3];
    let equal_to_x = move |z| z == x; // x被移动到闭包中
    
    // println!("can't use x here: {:?}", x); // 错误：x已被移动
    
    let y = vec![1, 2, 3];
    assert!(equal_to_x(y));
}

// 所有权模式和最佳实践
fn ownership_patterns() {
    println!("\n=== 所有权模式和最佳实践 ===");
    
    // 模式1：返回所有权
    let s = create_string();
    println!("创建的字符串: {}", s);
    
    // 模式2：借用参数，返回新值
    let s1 = String::from("hello");
    let s2 = add_suffix(&s1, " world");
    println!("原字符串: {}, 新字符串: {}", s1, s2);
    
    // 模式3：可变借用修改
    let mut s3 = String::from("hello");
    append_suffix(&mut s3, " rust");
    println!("修改后的字符串: {}", s3);
    
    // 模式4：消费并返回
    let s4 = String::from("hello");
    let s5 = transform_string(s4);
    println!("转换后的字符串: {}", s5);
}

fn create_string() -> String {
    String::from("新创建的字符串")
}

fn add_suffix(s: &str, suffix: &str) -> String {
    format!("{}{}", s, suffix)
}

fn append_suffix(s: &mut String, suffix: &str) {
    s.push_str(suffix);
}

fn transform_string(mut s: String) -> String {
    s.push_str(" - 已转换");
    s.to_uppercase()
}

fn main() {
    println!("=== Rust所有权和借用示例 ===");
    
    basic_ownership_examples();
    borrowing_examples();
    slice_examples();
    struct_ownership_examples();
    enum_ownership_examples();
    smart_pointer_examples();
    lifetime_examples();
    complex_ownership_scenarios();
    ownership_patterns();
    
    println!("\n所有所有权和借用示例完成!");
}
