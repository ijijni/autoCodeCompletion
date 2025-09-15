/**
 * C++模板元编程示例
 */
#include <iostream>
#include <type_traits>
#include <string>
#include <vector>
#include <memory>

// 基础模板示例
template<typename T>
class Stack {
private:
    std::vector<T> elements;
    
public:
    void push(const T& element) {
        elements.push_back(element);
    }
    
    void pop() {
        if (!elements.empty()) {
            elements.pop_back();
        }
    }
    
    T top() const {
        if (!elements.empty()) {
            return elements.back();
        }
        throw std::runtime_error("Stack is empty");
    }
    
    bool empty() const {
        return elements.empty();
    }
    
    size_t size() const {
        return elements.size();
    }
};

// 模板特化示例
template<typename T>
class Calculator {
public:
    static T add(const T& a, const T& b) {
        return a + b;
    }
    
    static T multiply(const T& a, const T& b) {
        return a * b;
    }
};

// 字符串特化
template<>
class Calculator<std::string> {
public:
    static std::string add(const std::string& a, const std::string& b) {
        return a + " + " + b;
    }
    
    static std::string multiply(const std::string& a, const std::string& b) {
        return a + " * " + b;
    }
};

// 编译时计算 - 阶乘
template<int N>
struct Factorial {
    static constexpr int value = N * Factorial<N-1>::value;
};

template<>
struct Factorial<0> {
    static constexpr int value = 1;
};

// 编译时计算 - 斐波那契数列
template<int N>
struct Fibonacci {
    static constexpr int value = Fibonacci<N-1>::value + Fibonacci<N-2>::value;
};

template<>
struct Fibonacci<0> {
    static constexpr int value = 0;
};

template<>
struct Fibonacci<1> {
    static constexpr int value = 1;
};

// SFINAE (Substitution Failure Is Not An Error) 示例
template<typename T>
typename std::enable_if<std::is_integral<T>::value, T>::type
safe_divide(T a, T b) {
    if (b == 0) {
        throw std::invalid_argument("Division by zero");
    }
    return a / b;
}

template<typename T>
typename std::enable_if<std::is_floating_point<T>::value, T>::type
safe_divide(T a, T b) {
    if (std::abs(b) < std::numeric_limits<T>::epsilon()) {
        throw std::invalid_argument("Division by near-zero");
    }
    return a / b;
}

// 类型萃取示例
template<typename T>
struct TypeTraits {
    static constexpr bool is_pointer = false;
    static constexpr bool is_reference = false;
    static constexpr bool is_const = false;
    using base_type = T;
};

template<typename T>
struct TypeTraits<T*> {
    static constexpr bool is_pointer = true;
    static constexpr bool is_reference = false;
    static constexpr bool is_const = false;
    using base_type = T;
};

template<typename T>
struct TypeTraits<T&> {
    static constexpr bool is_pointer = false;
    static constexpr bool is_reference = true;
    static constexpr bool is_const = false;
    using base_type = T;
};

template<typename T>
struct TypeTraits<const T> {
    static constexpr bool is_pointer = false;
    static constexpr bool is_reference = false;
    static constexpr bool is_const = true;
    using base_type = T;
};

// 可变参数模板示例
template<typename... Args>
void print(Args... args) {
    ((std::cout << args << " "), ...); // C++17 折叠表达式
    std::cout << std::endl;
}

// 递归版本（C++14及之前）
template<typename T>
void print_recursive(T&& t) {
    std::cout << t << std::endl;
}

template<typename T, typename... Args>
void print_recursive(T&& t, Args&&... args) {
    std::cout << t << " ";
    print_recursive(args...);
}

// 可变参数模板 - 求和
template<typename T>
T sum(T value) {
    return value;
}

template<typename T, typename... Args>
T sum(T first, Args... args) {
    return first + sum(args...);
}

// 模板元编程 - 编译时类型列表
template<typename... Types>
struct TypeList {};

template<typename List>
struct Length;

template<typename... Types>
struct Length<TypeList<Types...>> {
    static constexpr size_t value = sizeof...(Types);
};

template<size_t Index, typename List>
struct TypeAt;

template<size_t Index, typename Head, typename... Tail>
struct TypeAt<Index, TypeList<Head, Tail...>> {
    using type = typename TypeAt<Index - 1, TypeList<Tail...>>::type;
};

template<typename Head, typename... Tail>
struct TypeAt<0, TypeList<Head, Tail...>> {
    using type = Head;
};

// 概念和约束 (C++20)
#if __cplusplus >= 202002L
#include <concepts>

template<typename T>
concept Numeric = std::integral<T> || std::floating_point<T>;

template<Numeric T>
T multiply(T a, T b) {
    return a * b;
}

template<typename T>
concept Printable = requires(T t) {
    std::cout << t;
};

template<Printable T>
void print_value(const T& value) {
    std::cout << "Value: " << value << std::endl;
}
#endif

// 模板元编程 - 编译时字符串处理
template<size_t N>
struct CompileTimeString {
    char data[N];
    size_t length;
    
    constexpr CompileTimeString(const char (&str)[N]) : length(N-1) {
        for (size_t i = 0; i < N; ++i) {
            data[i] = str[i];
        }
    }
    
    constexpr char operator[](size_t index) const {
        return data[index];
    }
    
    constexpr size_t size() const {
        return length;
    }
};

template<size_t N>
CompileTimeString(const char (&)[N]) -> CompileTimeString<N>;

// 模板元编程 - 编译时排序
template<int... Values>
struct IntList {};

template<typename List>
struct Sort;

template<int Head, int... Tail>
struct Sort<IntList<Head, Tail...>> {
    template<int Value, typename SortedList>
    struct Insert;
    
    template<int Value, int... SortedValues>
    struct Insert<Value, IntList<SortedValues...>> {
        using type = std::conditional_t<
            (Value <= ((sizeof...(SortedValues) > 0) ? SortedValues : Value)), // 简化的比较
            IntList<Value, SortedValues...>,
            IntList<SortedValues..., Value>
        >;
    };
    
    using type = typename Insert<Head, typename Sort<IntList<Tail...>>::type>::type;
};

template<>
struct Sort<IntList<>> {
    using type = IntList<>;
};

// 智能指针工厂
template<typename T, typename... Args>
std::unique_ptr<T> make_unique_custom(Args&&... args) {
    return std::unique_ptr<T>(new T(std::forward<Args>(args)...));
}

// 函数对象模板
template<typename Func>
class FunctionWrapper {
private:
    Func func;
    
public:
    FunctionWrapper(Func f) : func(f) {}
    
    template<typename... Args>
    auto operator()(Args&&... args) -> decltype(func(std::forward<Args>(args)...)) {
        std::cout << "调用函数包装器" << std::endl;
        return func(std::forward<Args>(args)...);
    }
};

template<typename Func>
auto make_wrapper(Func func) {
    return FunctionWrapper<Func>(func);
}

void templateMetaprogrammingExamples() {
    std::cout << "=== C++模板元编程示例 ===" << std::endl;
    
    // 1. 基础模板使用
    std::cout << "\n1. 基础模板:" << std::endl;
    Stack<int> intStack;
    intStack.push(1);
    intStack.push(2);
    intStack.push(3);
    std::cout << "栈顶元素: " << intStack.top() << std::endl;
    std::cout << "栈大小: " << intStack.size() << std::endl;
    
    // 2. 模板特化
    std::cout << "\n2. 模板特化:" << std::endl;
    std::cout << "整数计算: " << Calculator<int>::add(5, 3) << std::endl;
    std::cout << "字符串计算: " << Calculator<std::string>::add("Hello", "World") << std::endl;
    
    // 3. 编译时计算
    std::cout << "\n3. 编译时计算:" << std::endl;
    std::cout << "5的阶乘: " << Factorial<5>::value << std::endl;
    std::cout << "第10个斐波那契数: " << Fibonacci<10>::value << std::endl;
    
    // 4. SFINAE示例
    std::cout << "\n4. SFINAE示例:" << std::endl;
    try {
        std::cout << "整数除法: " << safe_divide(10, 3) << std::endl;
        std::cout << "浮点除法: " << safe_divide(10.0, 3.0) << std::endl;
    } catch (const std::exception& e) {
        std::cout << "错误: " << e.what() << std::endl;
    }
    
    // 5. 类型萃取
    std::cout << "\n5. 类型萃取:" << std::endl;
    std::cout << "int是指针: " << TypeTraits<int>::is_pointer << std::endl;
    std::cout << "int*是指针: " << TypeTraits<int*>::is_pointer << std::endl;
    std::cout << "int&是引用: " << TypeTraits<int&>::is_reference << std::endl;
    std::cout << "const int是常量: " << TypeTraits<const int>::is_const << std::endl;
    
    // 6. 可变参数模板
    std::cout << "\n6. 可变参数模板:" << std::endl;
    print("Hello", 42, 3.14, "World");
    print_recursive("Recursive:", 1, 2, 3);
    std::cout << "数字求和: " << sum(1, 2, 3, 4, 5) << std::endl;
    
    // 7. 类型列表
    std::cout << "\n7. 类型列表:" << std::endl;
    using MyTypes = TypeList<int, double, std::string>;
    std::cout << "类型列表长度: " << Length<MyTypes>::value << std::endl;
    
    // 8. 编译时字符串
    std::cout << "\n8. 编译时字符串:" << std::endl;
    constexpr auto str = CompileTimeString("Hello, Template!");
    std::cout << "编译时字符串长度: " << str.size() << std::endl;
    std::cout << "第一个字符: " << str[0] << std::endl;
    
    // 9. 函数包装器
    std::cout << "\n9. 函数包装器:" << std::endl;
    auto wrapped_add = make_wrapper([](int a, int b) { return a + b; });
    std::cout << "包装器结果: " << wrapped_add(5, 3) << std::endl;
    
#if __cplusplus >= 202002L
    // 10. 概念和约束 (C++20)
    std::cout << "\n10. 概念和约束 (C++20):" << std::endl;
    std::cout << "数值乘法: " << multiply(5, 3) << std::endl;
    print_value(42);
    print_value("Hello, Concepts!");
#endif
}

int main() {
    templateMetaprogrammingExamples();
    return 0;
}
