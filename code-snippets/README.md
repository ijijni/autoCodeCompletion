# 编程语言代码片段集合

这是一个全面的编程语言代码片段集合，涵盖了多种主流编程语言的核心特性、高级概念和最佳实践。每种语言都包含5个精心设计的示例文件，展示了该语言的独特特性和编程范式。

## 📁 目录结构

```
code-snippets/
├── cpp/                    # C++示例 (5个文件)
├── go/                     # Go语言示例 (5个文件)
├── typescript/             # TypeScript示例 (5个文件)
├── csharp/                 # C#示例 (5个文件)
├── rust/                   # Rust示例 (5个文件)
├── php/                    # PHP示例 (5个文件)
├── kotlin/                 # Kotlin示例 (5个文件)
└── README.md              # 本文件
```

**总计：7种编程语言，每种语言5个示例文件，共35个代码示例文件。**

## 🚀 语言特性覆盖

### C++ (cpp/)
1. **stl-algorithms.cpp** - STL算法和容器操作
2. **template-metaprogramming.cpp** - 模板元编程和编译时计算
3. **multithreading.cpp** - 多线程编程和并发控制
4. **memory-management.cpp** - 内存管理和智能指针
5. **design-patterns.cpp** - 设计模式实现

### Go (go/)
1. **concurrency-patterns.go** - 并发模式和Goroutine
2. **interfaces-generics.go** - 接口设计和泛型编程
3. **error-handling.go** - 错误处理最佳实践
4. **testing-benchmarks.go** - 测试和性能基准
5. **web-microservices.go** - Web服务和微服务架构

### TypeScript (typescript/)
1. **decorators-metadata.ts** - 装饰器和元数据编程
2. **utility-types.ts** - 实用类型和类型操作
3. **advanced-patterns.ts** - 高级设计模式
4. **async-programming.ts** - 异步编程和Promise
5. **functional-programming.ts** - 函数式编程范式

### C# (csharp/)
1. **async-patterns.cs** - 异步编程模式
2. **linq-expressions.cs** - LINQ查询和表达式树
3. **reflection-attributes.cs** - 反射和特性编程
4. **dependency-injection.cs** - 依赖注入和IoC容器
5. **generics-collections.cs** - 泛型和集合操作

### Rust (rust/)
1. **ownership-borrowing.rs** - 所有权和借用系统
2. **error-handling.rs** - 错误处理和Result类型
3. **concurrency-async.rs** - 并发和异步编程
4. **traits-generics.rs** - 特征和泛型系统
5. **macros-metaprogramming.rs** - 宏和元编程

### PHP (php/)
1. **oop-patterns.php** - 面向对象编程和设计模式
2. **modern-features.php** - 现代PHP特性(PHP 8.0+)
3. **web-frameworks.php** - Web框架和MVC模式
4. **database-orm.php** - 数据库操作和ORM
5. **testing-quality.php** - 测试和代码质量

### Kotlin (kotlin/)
1. **coroutines-flow.kt** - 协程和Flow响应式编程
2. **functional-programming.kt** - 函数式编程特性
3. **dsl-builders.kt** - DSL构建器和类型安全
4. **android-patterns.kt** - Android开发模式
5. **interop-java.kt** - Java互操作性

## 🎯 学习目标

每个代码片段都旨在展示：

- **语言核心特性** - 语法、类型系统、内存模型
- **编程范式** - 面向对象、函数式、过程式编程
- **并发编程** - 线程、协程、异步编程模式
- **错误处理** - 异常处理、错误传播、恢复策略
- **设计模式** - 常用设计模式的实现
- **最佳实践** - 代码组织、测试、性能优化
- **现代特性** - 最新语言特性和工具

## 🛠️ 使用方法

### 运行示例

每个文件都是独立的可执行示例：

```bash
# C++
g++ -std=c++17 cpp/stl-algorithms.cpp -o stl_demo && ./stl_demo

# Go
go run go/concurrency-patterns.go

# TypeScript
npx ts-node typescript/decorators-metadata.ts

# C#
dotnet run csharp/async-patterns.cs

# Rust
rustc rust/ownership-borrowing.rs && ./ownership-borrowing

# PHP
php php/oop-patterns.php

# Kotlin
kotlinc kotlin/coroutines-flow.kt -include-runtime -d coroutines.jar && java -jar coroutines.jar
```

### 学习建议

1. **按语言学习** - 选择一种语言，完整学习所有5个示例
2. **按主题学习** - 比较不同语言中的并发编程实现
3. **实践练习** - 修改示例代码，添加新功能
4. **性能对比** - 运行基准测试，比较不同语言的性能

## 📚 代码特点

### 注释详细
- 中文注释，便于理解
- 解释设计思路和实现原理
- 提供使用场景和最佳实践

### 实用性强
- 真实项目中的常见场景
- 可直接应用的代码模式
- 完整的错误处理和边界情况

### 现代化
- 使用各语言的最新特性
- 遵循现代编程最佳实践
- 包含性能优化技巧

## 🔧 依赖要求

### C++
- C++17或更高版本
- 支持STL和多线程的编译器

### Go
- Go 1.18+ (支持泛型)
- 标准库即可运行大部分示例

### TypeScript
- TypeScript 4.5+
- Node.js 16+
- 部分示例需要reflect-metadata

### C#
- .NET 6.0+
- Microsoft.Extensions.* 包

### Rust
- Rust 1.70+
- tokio, futures等异步运行时

### PHP
- PHP 8.0+
- Composer用于依赖管理

### Kotlin
- Kotlin 1.7+
- kotlinx.coroutines库

## 🤝 贡献指南

欢迎贡献新的代码示例或改进现有代码：

1. 保持代码风格一致
2. 添加详细的中文注释
3. 确保代码可以独立运行
4. 包含错误处理和边界情况
5. 遵循各语言的最佳实践

## 📄 许可证

本项目采用MIT许可证，可自由使用、修改和分发。

## 🎉 致谢

感谢所有编程语言社区的贡献者，这些示例汇集了各语言生态系统的精华。

---

**Happy Coding! 🚀**
