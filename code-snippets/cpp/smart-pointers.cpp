/**
 * C++智能指针示例
 */
#include <iostream>
#include <memory>
#include <vector>
#include <string>
#include <functional>

// 资源管理类示例
class Resource {
private:
    std::string name;
    int* data;
    
public:
    Resource(const std::string& n) : name(n), data(new int[100]) {
        std::cout << "Resource '" << name << "' 已创建" << std::endl;
        // 初始化数据
        for (int i = 0; i < 100; ++i) {
            data[i] = i;
        }
    }
    
    ~Resource() {
        delete[] data;
        std::cout << "Resource '" << name << "' 已销毁" << std::endl;
    }
    
    void use() const {
        std::cout << "使用资源: " << name << std::endl;
    }
    
    const std::string& getName() const { return name; }
    
    // 禁用拷贝构造和赋值
    Resource(const Resource&) = delete;
    Resource& operator=(const Resource&) = delete;
};

// unique_ptr示例
void uniquePtrExample() {
    std::cout << "\n=== unique_ptr 示例 ===" << std::endl;
    
    // 创建unique_ptr
    std::unique_ptr<Resource> res1 = std::make_unique<Resource>("资源1");
    res1->use();
    
    // 移动语义
    std::unique_ptr<Resource> res2 = std::move(res1);
    if (!res1) {
        std::cout << "res1 已被移动，现在为空" << std::endl;
    }
    res2->use();
    
    // 自定义删除器
    auto customDeleter = [](Resource* r) {
        std::cout << "自定义删除器被调用" << std::endl;
        delete r;
    };
    
    std::unique_ptr<Resource, decltype(customDeleter)> res3(
        new Resource("资源3"), customDeleter);
    res3->use();
    
    // 数组版本
    std::unique_ptr<int[]> arr = std::make_unique<int[]>(10);
    for (int i = 0; i < 10; ++i) {
        arr[i] = i * i;
    }
    
    std::cout << "数组内容: ";
    for (int i = 0; i < 10; ++i) {
        std::cout << arr[i] << " ";
    }
    std::cout << std::endl;
}

// shared_ptr示例
void sharedPtrExample() {
    std::cout << "\n=== shared_ptr 示例 ===" << std::endl;
    
    std::shared_ptr<Resource> res1 = std::make_shared<Resource>("共享资源");
    std::cout << "引用计数: " << res1.use_count() << std::endl;
    
    {
        std::shared_ptr<Resource> res2 = res1;
        std::cout << "引用计数: " << res1.use_count() << std::endl;
        res2->use();
        
        std::shared_ptr<Resource> res3 = res1;
        std::cout << "引用计数: " << res1.use_count() << std::endl;
    } // res2和res3离开作用域
    
    std::cout << "引用计数: " << res1.use_count() << std::endl;
    res1->use();
}

// weak_ptr示例
class Node {
public:
    std::string name;
    std::shared_ptr<Node> next;
    std::weak_ptr<Node> parent; // 使用weak_ptr避免循环引用
    
    Node(const std::string& n) : name(n) {
        std::cout << "Node '" << name << "' 创建" << std::endl;
    }
    
    ~Node() {
        std::cout << "Node '" << name << "' 销毁" << std::endl;
    }
    
    void setParent(std::shared_ptr<Node> p) {
        parent = p;
    }
    
    void printInfo() const {
        std::cout << "节点: " << name;
        if (auto p = parent.lock()) {
            std::cout << ", 父节点: " << p->name;
        } else {
            std::cout << ", 无父节点";
        }
        std::cout << std::endl;
    }
};

void weakPtrExample() {
    std::cout << "\n=== weak_ptr 示例 ===" << std::endl;
    
    auto root = std::make_shared<Node>("根节点");
    auto child1 = std::make_shared<Node>("子节点1");
    auto child2 = std::make_shared<Node>("子节点2");
    
    // 建立父子关系
    root->next = child1;
    child1->setParent(root);
    child1->next = child2;
    child2->setParent(child1);
    
    // 打印信息
    root->printInfo();
    child1->printInfo();
    child2->printInfo();
    
    // 检查weak_ptr是否有效
    if (auto parent = child1->parent.lock()) {
        std::cout << "child1的父节点仍然有效: " << parent->name << std::endl;
    }
    
    // 当root离开作用域时，不会造成循环引用问题
}

// 工厂模式与智能指针
class Shape {
public:
    virtual ~Shape() = default;
    virtual void draw() const = 0;
    virtual std::string getType() const = 0;
};

class Circle : public Shape {
private:
    double radius;
    
public:
    Circle(double r) : radius(r) {}
    
    void draw() const override {
        std::cout << "绘制圆形，半径: " << radius << std::endl;
    }
    
    std::string getType() const override {
        return "Circle";
    }
};

class Rectangle : public Shape {
private:
    double width, height;
    
public:
    Rectangle(double w, double h) : width(w), height(h) {}
    
    void draw() const override {
        std::cout << "绘制矩形，宽: " << width << ", 高: " << height << std::endl;
    }
    
    std::string getType() const override {
        return "Rectangle";
    }
};

class ShapeFactory {
public:
    static std::unique_ptr<Shape> createCircle(double radius) {
        return std::make_unique<Circle>(radius);
    }
    
    static std::unique_ptr<Shape> createRectangle(double width, double height) {
        return std::make_unique<Rectangle>(width, height);
    }
};

void factoryWithSmartPointers() {
    std::cout << "\n=== 工厂模式与智能指针 ===" << std::endl;
    
    std::vector<std::unique_ptr<Shape>> shapes;
    
    shapes.push_back(ShapeFactory::createCircle(5.0));
    shapes.push_back(ShapeFactory::createRectangle(10.0, 8.0));
    shapes.push_back(ShapeFactory::createCircle(3.0));
    
    for (const auto& shape : shapes) {
        std::cout << "类型: " << shape->getType() << " - ";
        shape->draw();
    }
}

// 观察者模式与智能指针
class Observer {
public:
    virtual ~Observer() = default;
    virtual void update(const std::string& message) = 0;
};

class Subject {
private:
    std::vector<std::weak_ptr<Observer>> observers;
    
public:
    void addObserver(std::shared_ptr<Observer> observer) {
        observers.push_back(observer);
    }
    
    void removeObserver(std::shared_ptr<Observer> observer) {
        observers.erase(
            std::remove_if(observers.begin(), observers.end(),
                [&](const std::weak_ptr<Observer>& weak_obs) {
                    return weak_obs.lock() == observer;
                }),
            observers.end()
        );
    }
    
    void notify(const std::string& message) {
        // 清理已失效的观察者
        observers.erase(
            std::remove_if(observers.begin(), observers.end(),
                [](const std::weak_ptr<Observer>& weak_obs) {
                    return weak_obs.expired();
                }),
            observers.end()
        );
        
        // 通知所有有效的观察者
        for (auto& weak_obs : observers) {
            if (auto obs = weak_obs.lock()) {
                obs->update(message);
            }
        }
    }
};

class ConcreteObserver : public Observer {
private:
    std::string name;
    
public:
    ConcreteObserver(const std::string& n) : name(n) {}
    
    void update(const std::string& message) override {
        std::cout << "观察者 " << name << " 收到消息: " << message << std::endl;
    }
};

void observerPatternWithSmartPointers() {
    std::cout << "\n=== 观察者模式与智能指针 ===" << std::endl;
    
    Subject subject;
    
    auto observer1 = std::make_shared<ConcreteObserver>("观察者1");
    auto observer2 = std::make_shared<ConcreteObserver>("观察者2");
    auto observer3 = std::make_shared<ConcreteObserver>("观察者3");
    
    subject.addObserver(observer1);
    subject.addObserver(observer2);
    subject.addObserver(observer3);
    
    subject.notify("第一条消息");
    
    // 移除一个观察者
    subject.removeObserver(observer2);
    
    subject.notify("第二条消息");
    
    // observer3离开作用域
    observer3.reset();
    
    subject.notify("第三条消息");
}

// RAII与智能指针
class FileManager {
private:
    std::string filename;
    FILE* file;
    
public:
    FileManager(const std::string& fname) : filename(fname), file(nullptr) {
        file = fopen(filename.c_str(), "w");
        if (file) {
            std::cout << "文件 '" << filename << "' 已打开" << std::endl;
        } else {
            throw std::runtime_error("无法打开文件: " + filename);
        }
    }
    
    ~FileManager() {
        if (file) {
            fclose(file);
            std::cout << "文件 '" << filename << "' 已关闭" << std::endl;
        }
    }
    
    void write(const std::string& content) {
        if (file) {
            fprintf(file, "%s\n", content.c_str());
            std::cout << "写入内容: " << content << std::endl;
        }
    }
    
    // 禁用拷贝
    FileManager(const FileManager&) = delete;
    FileManager& operator=(const FileManager&) = delete;
};

void raiiExample() {
    std::cout << "\n=== RAII示例 ===" << std::endl;
    
    try {
        auto fileManager = std::make_unique<FileManager>("test.txt");
        fileManager->write("Hello, RAII!");
        fileManager->write("智能指针自动管理资源");
        
        // 文件会在fileManager离开作用域时自动关闭
    } catch (const std::exception& e) {
        std::cout << "错误: " << e.what() << std::endl;
    }
}

int main() {
    std::cout << "=== C++智能指针示例 ===" << std::endl;
    
    uniquePtrExample();
    sharedPtrExample();
    weakPtrExample();
    factoryWithSmartPointers();
    observerPatternWithSmartPointers();
    raiiExample();
    
    std::cout << "\n程序结束，所有资源已自动清理" << std::endl;
    return 0;
}
