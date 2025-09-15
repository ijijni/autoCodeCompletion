# Python面向对象编程和设计模式代码片段
# 用于测试AI代码补全功能

from abc import ABC, abstractmethod
from typing import Any, Dict, List, Optional, Protocol, Union, Callable, Type, TypeVar
from dataclasses import dataclass, field
from functools import wraps, singledispatch
from contextlib import contextmanager
from enum import Enum, auto
import weakref
import threading
import time
import copy
import json
from datetime import datetime, timedelta

# 1. 基础面向对象编程
# ======================

class Animal:
    """动物基类演示继承和多态"""
    
    def __init__(self, name: str, species: str):
        self._name = name  # 受保护属性
        self._species = species
        self.__birth_time = datetime.now()  # 私有属性
        self.health = 100
    
    @property
    def name(self) -> str:
        """名称属性"""
        return self._name
    
    @name.setter
    def name(self, value: str) -> None:
        """名称设置器"""
        if not value.strip():
            raise ValueError("名称不能为空")
        self._name = value.strip()
    
    @property
    def species(self) -> str:
        """物种属性"""
        return self._species
    
    @property
    def age_in_days(self) -> int:
        """计算年龄（天数）"""
        return (datetime.now() - self.__birth_time).days
    
    def eat(self, food: str) -> str:
        """吃东西"""
        self.health = min(100, self.health + 10)
        return f"{self.name}吃了{food}，健康值：{self.health}"
    
    def sleep(self, hours: int) -> str:
        """睡觉"""
        self.health = min(100, self.health + hours * 2)
        return f"{self.name}睡了{hours}小时，健康值：{self.health}"
    
    def make_sound(self) -> str:
        """发出声音 - 抽象方法"""
        return "动物发出了声音"
    
    def __str__(self) -> str:
        return f"{self.species}: {self.name} (健康值: {self.health})"
    
    def __repr__(self) -> str:
        return f"Animal(name='{self.name}', species='{self.species}')"
    
    # AI补全点

class Dog(Animal):
    """狗类 - 继承示例"""
    
    def __init__(self, name: str, breed: str):
        super().__init__(name, "Dog")
        self.breed = breed
        self.tricks = []
        self.loyalty = 100
    
    def make_sound(self) -> str:
        """重写父类方法"""
        return f"{self.name}汪汪叫！"
    
    def learn_trick(self, trick: str) -> str:
        """学习技能"""
        if trick not in self.tricks:
            self.tricks.append(trick)
            return f"{self.name}学会了{trick}！"
        return f"{self.name}已经会{trick}了"
    
    def perform_trick(self, trick: str) -> str:
        """表演技能"""
        if trick in self.tricks:
            return f"{self.name}表演了{trick}！"
        return f"{self.name}不会{trick}"
    
    def fetch(self, item: str) -> str:
        """捡东西"""
        return f"{self.name}捡回了{item}！"
    
    # AI补全点

class Cat(Animal):
    """猫类 - 继承示例"""
    
    def __init__(self, name: str, color: str):
        super().__init__(name, "Cat")
        self.color = color
        self.independence = 80
        self.hunting_skills = []
    
    def make_sound(self) -> str:
        """重写父类方法"""
        return f"{self.name}喵喵叫～"
    
    def hunt(self, prey: str) -> str:
        """狩猎"""
        if "hunt" not in self.hunting_skills:
            self.hunting_skills.append("hunt")
        return f"{self.name}抓到了{prey}！"
    
    def purr(self) -> str:
        """呼噜声"""
        return f"{self.name}发出满足的呼噜声"
    
    def climb(self, height: str) -> str:
        """爬高"""
        return f"{self.name}爬到了{height}"
    
    # AI补全点

# 2. 高级OOP特性
# ======================

class PropertyDemo:
    """属性装饰器演示"""
    
    def __init__(self):
        self._temperature = 0
        self._readonly_value = "初始值"
        self._computed_cache = None
        self._last_computed = None
    
    @property
    def temperature(self) -> float:
        """温度属性（摄氏度）"""
        return self._temperature
    
    @temperature.setter
    def temperature(self, value: float) -> None:
        """温度设置器"""
        if value < -273.15:
            raise ValueError("温度不能低于绝对零度")
        self._temperature = value
        # 清除计算缓存
        self._computed_cache = None
    
    @property
    def temperature_fahrenheit(self) -> float:
        """华氏温度（只读）"""
        return self._temperature * 9/5 + 32
    
    @property
    def readonly_value(self) -> str:
        """只读属性"""
        return self._readonly_value
    
    @property
    def expensive_computation(self) -> str:
        """昂贵计算的缓存属性"""
        if (self._computed_cache is None or 
            self._last_computed is None or 
            datetime.now() - self._last_computed > timedelta(seconds=60)):
            
            # 模拟昂贵计算
            time.sleep(0.1)
            self._computed_cache = f"计算结果基于温度{self._temperature}"
            self._last_computed = datetime.now()
        
        return self._computed_cache
    
    # AI补全点

class MethodDemo:
    """方法类型演示"""
    
    class_variable = "类变量"
    
    def __init__(self, name: str):
        self.name = name
        self.instance_variable = "实例变量"
    
    def instance_method(self) -> str:
        """实例方法"""
        return f"实例方法被{self.name}调用"
    
    @classmethod
    def class_method(cls) -> str:
        """类方法"""
        return f"类方法被{cls.__name__}调用，类变量：{cls.class_variable}"
    
    @staticmethod
    def static_method() -> str:
        """静态方法"""
        return "静态方法被调用"
    
    @classmethod
    def create_default(cls) -> 'MethodDemo':
        """工厂方法"""
        return cls("默认实例")
    
    def __call__(self, message: str) -> str:
        """使对象可调用"""
        return f"{self.name}说：{message}"
    
    # AI补全点

# 3. 设计模式实现
# ======================

# 单例模式
class Singleton:
    """单例模式实现"""
    
    _instances = {}
    _lock = threading.Lock()
    
    def __new__(cls, *args, **kwargs):
        if cls not in cls._instances:
            with cls._lock:
                if cls not in cls._instances:
                    cls._instances[cls] = super().__new__(cls)
        return cls._instances[cls]
    
    def __init__(self):
        if not hasattr(self, 'initialized'):
            self.initialized = True
            self.data = {}
            self.created_at = datetime.now()
    
    def set_data(self, key: str, value: Any) -> None:
        """设置数据"""
        self.data[key] = value
    
    def get_data(self, key: str, default: Any = None) -> Any:
        """获取数据"""
        return self.data.get(key, default)
    
    # AI补全点

# 工厂模式
class VehicleFactory:
    """车辆工厂模式"""
    
    @staticmethod
    def create_vehicle(vehicle_type: str, **kwargs) -> 'Vehicle':
        """创建车辆"""
        vehicle_map = {
            'car': Car,
            'motorcycle': Motorcycle,
            'truck': Truck
        }
        
        vehicle_class = vehicle_map.get(vehicle_type.lower())
        if not vehicle_class:
            raise ValueError(f"未知的车辆类型：{vehicle_type}")
        
        return vehicle_class(**kwargs)

class Vehicle(ABC):
    """车辆抽象基类"""
    
    def __init__(self, brand: str, model: str):
        self.brand = brand
        self.model = model
        self.fuel = 100
        self.mileage = 0
    
    @abstractmethod
    def start_engine(self) -> str:
        """启动引擎"""
        pass
    
    @abstractmethod
    def get_fuel_efficiency(self) -> float:
        """获取燃油效率"""
        pass
    
    def drive(self, distance: float) -> str:
        """驾驶"""
        fuel_needed = distance / self.get_fuel_efficiency()
        if self.fuel >= fuel_needed:
            self.fuel -= fuel_needed
            self.mileage += distance
            return f"驾驶了{distance}公里，剩余燃油：{self.fuel:.2f}"
        else:
            return "燃油不足！"
    
    def refuel(self, amount: float = None) -> str:
        """加油"""
        if amount is None:
            amount = 100 - self.fuel
        self.fuel = min(100, self.fuel + amount)
        return f"加油{amount}升，当前燃油：{self.fuel:.2f}"
    
    # AI补全点

class Car(Vehicle):
    """汽车类"""
    
    def __init__(self, brand: str, model: str, doors: int = 4):
        super().__init__(brand, model)
        self.doors = doors
    
    def start_engine(self) -> str:
        return f"{self.brand} {self.model}的引擎启动了！"
    
    def get_fuel_efficiency(self) -> float:
        return 15.0  # 15公里/升
    
    def open_trunk(self) -> str:
        return f"{self.brand} {self.model}的后备箱打开了"
    
    # AI补全点

class Motorcycle(Vehicle):
    """摩托车类"""
    
    def __init__(self, brand: str, model: str, engine_size: int):
        super().__init__(brand, model)
        self.engine_size = engine_size
    
    def start_engine(self) -> str:
        return f"{self.brand} {self.model}的{self.engine_size}cc引擎轰鸣启动！"
    
    def get_fuel_efficiency(self) -> float:
        return 25.0  # 25公里/升
    
    def wheelie(self) -> str:
        return f"{self.brand} {self.model}做了一个前轮离地！"
    
    # AI补全点

class Truck(Vehicle):
    """卡车类"""
    
    def __init__(self, brand: str, model: str, load_capacity: float):
        super().__init__(brand, model)
        self.load_capacity = load_capacity
        self.current_load = 0
    
    def start_engine(self) -> str:
        return f"{self.brand} {self.model}的重型引擎启动了！"
    
    def get_fuel_efficiency(self) -> float:
        # 燃油效率受载重影响
        load_factor = 1 + (self.current_load / self.load_capacity) * 0.5
        return 8.0 / load_factor  # 基础8公里/升
    
    def load_cargo(self, weight: float) -> str:
        if self.current_load + weight <= self.load_capacity:
            self.current_load += weight
            return f"装载了{weight}吨货物，当前载重：{self.current_load}/{self.load_capacity}吨"
        else:
            return f"超重！无法装载{weight}吨货物"
    
    def unload_cargo(self, weight: float = None) -> str:
        if weight is None:
            weight = self.current_load
        
        weight = min(weight, self.current_load)
        self.current_load -= weight
        return f"卸载了{weight}吨货物，当前载重：{self.current_load}吨"
    
    # AI补全点

# 观察者模式
class Observer(ABC):
    """观察者抽象基类"""
    
    @abstractmethod
    def update(self, subject: 'Subject', event: str, data: Any = None) -> None:
        """更新方法"""
        pass

class Subject:
    """被观察者（主题）"""
    
    def __init__(self):
        self._observers: List[Observer] = []
        self._state = {}
    
    def attach(self, observer: Observer) -> None:
        """添加观察者"""
        if observer not in self._observers:
            self._observers.append(observer)
    
    def detach(self, observer: Observer) -> None:
        """移除观察者"""
        if observer in self._observers:
            self._observers.remove(observer)
    
    def notify(self, event: str, data: Any = None) -> None:
        """通知所有观察者"""
        for observer in self._observers:
            observer.update(self, event, data)
    
    def set_state(self, key: str, value: Any) -> None:
        """设置状态"""
        old_value = self._state.get(key)
        self._state[key] = value
        self.notify('state_changed', {'key': key, 'old_value': old_value, 'new_value': value})
    
    def get_state(self, key: str, default: Any = None) -> Any:
        """获取状态"""
        return self._state.get(key, default)
    
    # AI补全点

class NewsPublisher(Subject):
    """新闻发布者"""
    
    def __init__(self, name: str):
        super().__init__()
        self.name = name
        self.articles = []
    
    def publish_article(self, title: str, content: str) -> None:
        """发布文章"""
        article = {
            'title': title,
            'content': content,
            'published_at': datetime.now(),
            'id': len(self.articles) + 1
        }
        self.articles.append(article)
        self.notify('new_article', article)
    
    def breaking_news(self, title: str, content: str) -> None:
        """突发新闻"""
        article = {
            'title': f"突发：{title}",
            'content': content,
            'published_at': datetime.now(),
            'id': len(self.articles) + 1,
            'priority': 'high'
        }
        self.articles.append(article)
        self.notify('breaking_news', article)
    
    # AI补全点

class NewsSubscriber(Observer):
    """新闻订阅者"""
    
    def __init__(self, name: str):
        self.name = name
        self.received_articles = []
        self.notifications = []
    
    def update(self, subject: Subject, event: str, data: Any = None) -> None:
        """接收更新"""
        if event == 'new_article':
            self.received_articles.append(data)
            self.notifications.append(f"收到新文章：{data['title']}")
        elif event == 'breaking_news':
            self.received_articles.append(data)
            self.notifications.append(f"突发新闻：{data['title']}")
        elif event == 'state_changed':
            self.notifications.append(f"状态变更：{data}")
    
    def get_latest_notifications(self, count: int = 5) -> List[str]:
        """获取最新通知"""
        return self.notifications[-count:]
    
    # AI补全点

# 策略模式
class PaymentStrategy(ABC):
    """支付策略抽象基类"""
    
    @abstractmethod
    def pay(self, amount: float) -> str:
        """支付方法"""
        pass
    
    @abstractmethod
    def get_fee(self, amount: float) -> float:
        """获取手续费"""
        pass

class CreditCardPayment(PaymentStrategy):
    """信用卡支付策略"""
    
    def __init__(self, card_number: str, expiry_date: str):
        self.card_number = card_number[-4:]  # 只保留后4位
        self.expiry_date = expiry_date
    
    def pay(self, amount: float) -> str:
        fee = self.get_fee(amount)
        total = amount + fee
        return f"使用信用卡(****{self.card_number})支付{total:.2f}元（含手续费{fee:.2f}元）"
    
    def get_fee(self, amount: float) -> float:
        return amount * 0.025  # 2.5%手续费
    
    # AI补全点

class PayPalPayment(PaymentStrategy):
    """PayPal支付策略"""
    
    def __init__(self, email: str):
        self.email = email
    
    def pay(self, amount: float) -> str:
        fee = self.get_fee(amount)
        total = amount + fee
        return f"使用PayPal({self.email})支付{total:.2f}元（含手续费{fee:.2f}元）"
    
    def get_fee(self, amount: float) -> float:
        return amount * 0.03  # 3%手续费
    
    # AI补全点

class CryptoPayment(PaymentStrategy):
    """加密货币支付策略"""
    
    def __init__(self, wallet_address: str):
        self.wallet_address = wallet_address[:8] + "..."  # 只显示前8位
    
    def pay(self, amount: float) -> str:
        fee = self.get_fee(amount)
        total = amount + fee
        return f"使用加密货币({self.wallet_address})支付{total:.2f}元（含矿工费{fee:.2f}元）"
    
    def get_fee(self, amount: float) -> float:
        return 5.0  # 固定5元矿工费
    
    # AI补全点

class PaymentProcessor:
    """支付处理器"""
    
    def __init__(self):
        self.payment_strategy: Optional[PaymentStrategy] = None
        self.transaction_history = []
    
    def set_payment_strategy(self, strategy: PaymentStrategy) -> None:
        """设置支付策略"""
        self.payment_strategy = strategy
    
    def process_payment(self, amount: float, description: str = "") -> str:
        """处理支付"""
        if not self.payment_strategy:
            raise ValueError("未设置支付策略")
        
        result = self.payment_strategy.pay(amount)
        
        # 记录交易历史
        transaction = {
            'amount': amount,
            'description': description,
            'payment_method': self.payment_strategy.__class__.__name__,
            'timestamp': datetime.now(),
            'result': result
        }
        self.transaction_history.append(transaction)
        
        return result
    
    def get_transaction_history(self) -> List[Dict]:
        """获取交易历史"""
        return self.transaction_history.copy()
    
    # AI补全点

# 4. 装饰器模式和元编程
# ======================

def timing_decorator(func):
    """计时装饰器"""
    @wraps(func)
    def wrapper(*args, **kwargs):
        start_time = time.time()
        result = func(*args, **kwargs)
        end_time = time.time()
        print(f"{func.__name__} 执行时间: {end_time - start_time:.4f}秒")
        return result
    return wrapper

def retry_decorator(max_attempts: int = 3, delay: float = 1.0):
    """重试装饰器"""
    def decorator(func):
        @wraps(func)
        def wrapper(*args, **kwargs):
            for attempt in range(max_attempts):
                try:
                    return func(*args, **kwargs)
                except Exception as e:
                    if attempt == max_attempts - 1:
                        raise e
                    print(f"{func.__name__} 第{attempt + 1}次尝试失败: {e}")
                    time.sleep(delay)
            return None
        return wrapper
    return decorator

def cache_decorator(maxsize: int = 128):
    """缓存装饰器"""
    def decorator(func):
        cache = {}
        cache_info = {'hits': 0, 'misses': 0}
        
        @wraps(func)
        def wrapper(*args, **kwargs):
            # 创建缓存键
            key = str(args) + str(sorted(kwargs.items()))
            
            if key in cache:
                cache_info['hits'] += 1
                return cache[key]
            
            cache_info['misses'] += 1
            result = func(*args, **kwargs)
            
            # 限制缓存大小
            if len(cache) >= maxsize:
                # 移除最老的条目（简单LRU）
                oldest_key = next(iter(cache))
                del cache[oldest_key]
            
            cache[key] = result
            return result
        
        wrapper.cache_info = lambda: cache_info.copy()
        wrapper.cache_clear = lambda: cache.clear()
        return wrapper
    return decorator

def validate_types(*expected_types):
    """类型验证装饰器"""
    def decorator(func):
        @wraps(func)
        def wrapper(*args, **kwargs):
            # 验证位置参数
            for i, (arg, expected_type) in enumerate(zip(args, expected_types)):
                if not isinstance(arg, expected_type):
                    raise TypeError(f"参数{i+1}应该是{expected_type.__name__}类型，但得到了{type(arg).__name__}")
            
            return func(*args, **kwargs)
        return wrapper
    return decorator

# AI补全点

class ClassDecorator:
    """类装饰器示例"""
    
    def __init__(self, prefix: str = ""):
        self.prefix = prefix
    
    def __call__(self, cls):
        """装饰类"""
        original_init = cls.__init__
        
        def new_init(self_inner, *args, **kwargs):
            original_init(self_inner, *args, **kwargs)
            if hasattr(self_inner, 'name'):
                self_inner.name = f"{self.prefix}{self_inner.name}"
        
        cls.__init__ = new_init
        return cls

# 元类示例
class SingletonMeta(type):
    """单例元类"""
    
    _instances = {}
    
    def __call__(cls, *args, **kwargs):
        if cls not in cls._instances:
            cls._instances[cls] = super().__call__(*args, **kwargs)
        return cls._instances[cls]

class DatabaseConnection(metaclass=SingletonMeta):
    """使用元类的单例数据库连接"""
    
    def __init__(self):
        self.connection_string = "localhost:5432"
        self.is_connected = False
    
    def connect(self) -> str:
        self.is_connected = True
        return f"连接到数据库: {self.connection_string}"
    
    def disconnect(self) -> str:
        self.is_connected = False
        return "断开数据库连接"
    
    # AI补全点

# 5. 上下文管理器
# ======================

class FileManager:
    """文件管理器上下文管理器"""
    
    def __init__(self, filename: str, mode: str = 'r'):
        self.filename = filename
        self.mode = mode
        self.file = None
    
    def __enter__(self):
        print(f"打开文件: {self.filename}")
        self.file = open(self.filename, self.mode)
        return self.file
    
    def __exit__(self, exc_type, exc_val, exc_tb):
        if self.file:
            print(f"关闭文件: {self.filename}")
            self.file.close()
        
        if exc_type is not None:
            print(f"发生异常: {exc_type.__name__}: {exc_val}")
        
        return False  # 不抑制异常
    
    # AI补全点

@contextmanager
def timer_context(name: str):
    """计时上下文管理器"""
    print(f"开始计时: {name}")
    start_time = time.time()
    
    try:
        yield
    finally:
        end_time = time.time()
        print(f"结束计时: {name}, 耗时: {end_time - start_time:.4f}秒")

@contextmanager
def database_transaction():
    """数据库事务上下文管理器"""
    print("开始事务")
    try:
        # 模拟事务开始
        yield
        print("提交事务")
    except Exception as e:
        print(f"回滚事务: {e}")
        raise
    finally:
        print("清理资源")

# 6. 协议和类型提示
# ======================

class Drawable(Protocol):
    """可绘制协议"""
    
    def draw(self) -> str:
        """绘制方法"""
        ...
    
    def get_area(self) -> float:
        """获取面积"""
        ...

class Circle:
    """圆形类 - 实现Drawable协议"""
    
    def __init__(self, radius: float):
        self.radius = radius
    
    def draw(self) -> str:
        return f"绘制半径为{self.radius}的圆形"
    
    def get_area(self) -> float:
        return 3.14159 * self.radius ** 2
    
    # AI补全点

class Rectangle:
    """矩形类 - 实现Drawable协议"""
    
    def __init__(self, width: float, height: float):
        self.width = width
        self.height = height
    
    def draw(self) -> str:
        return f"绘制{self.width}x{self.height}的矩形"
    
    def get_area(self) -> float:
        return self.width * self.height
    
    # AI补全点

def draw_shape(shape: Drawable) -> str:
    """绘制形状 - 使用协议类型提示"""
    return f"{shape.draw()}, 面积: {shape.get_area():.2f}"

# 泛型示例
T = TypeVar('T')

class Stack:
    """泛型栈实现"""
    
    def __init__(self):
        self._items: List[T] = []
    
    def push(self, item: T) -> None:
        """入栈"""
        self._items.append(item)
    
    def pop(self) -> T:
        """出栈"""
        if not self._items:
            raise IndexError("栈为空")
        return self._items.pop()
    
    def peek(self) -> T:
        """查看栈顶元素"""
        if not self._items:
            raise IndexError("栈为空")
        return self._items[-1]
    
    def is_empty(self) -> bool:
        """检查栈是否为空"""
        return len(self._items) == 0
    
    def size(self) -> int:
        """获取栈大小"""
        return len(self._items)
    
    # AI补全点

# 7. 使用示例和演示
# ======================

def demonstrate_oop_patterns():
    """演示面向对象编程和设计模式"""
    print("=== 基础OOP演示 ===")
    
    # 创建动物实例
    dog = Dog("旺财", "金毛")
    cat = Cat("小咪", "橘色")
    
    print(dog.make_sound())
    print(cat.make_sound())
    print(dog.learn_trick("握手"))
    print(dog.perform_trick("握手"))
    
    # 多态演示
    animals = [dog, cat]
    for animal in animals:
        print(f"{animal.name}: {animal.make_sound()}")
    
    print("\n=== 设计模式演示 ===")
    
    # 单例模式
    singleton1 = Singleton()
    singleton2 = Singleton()
    print(f"单例模式验证: {singleton1 is singleton2}")
    
    # 工厂模式
    car = VehicleFactory.create_vehicle('car', brand='丰田', model='卡罗拉')
    motorcycle = VehicleFactory.create_vehicle('motorcycle', brand='雅马哈', model='R1', engine_size=1000)
    
    print(car.start_engine())
    print(motorcycle.start_engine())
    
    # 观察者模式
    publisher = NewsPublisher("科技日报")
    subscriber1 = NewsSubscriber("张三")
    subscriber2 = NewsSubscriber("李四")
    
    publisher.attach(subscriber1)
    publisher.attach(subscriber2)
    
    publisher.publish_article("AI技术突破", "人工智能取得重大进展...")
    publisher.breaking_news("火星发现生命", "科学家在火星发现微生物...")
    
    print(f"张三的通知: {subscriber1.get_latest_notifications()}")
    
    # 策略模式
    processor = PaymentProcessor()
    
    # 信用卡支付
    credit_card = CreditCardPayment("1234567890123456", "12/25")
    processor.set_payment_strategy(credit_card)
    print(processor.process_payment(100.0, "购买商品"))
    
    # PayPal支付
    paypal = PayPalPayment("user@example.com")
    processor.set_payment_strategy(paypal)
    print(processor.process_payment(200.0, "在线服务"))
    
    # AI补全点
    
    print("\n=== 装饰器演示 ===")
    
    @timing_decorator
    @cache_decorator(maxsize=10)
    @validate_types(int, int)
    def fibonacci(n: int, m: int = 1) -> int:
        """斐波那契数列（带装饰器）"""
        if n <= 1:
            return n * m
        return fibonacci(n-1, m) + fibonacci(n-2, m)
    
    print(f"斐波那契数列第10项: {fibonacci(10)}")
    print(f"缓存信息: {fibonacci.cache_info()}")
    
    print("\n=== 上下文管理器演示 ===")
    
    with timer_context("测试操作"):
        time.sleep(0.1)  # 模拟耗时操作
    
    with database_transaction():
        print("执行数据库操作...")
    
    print("\n=== 协议和类型提示演示 ===")
    
    circle = Circle(5)
    rectangle = Rectangle(4, 6)
    
    shapes = [circle, rectangle]
    for shape in shapes:
        print(draw_shape(shape))
    
    # 泛型栈演示
    int_stack = Stack()
    int_stack.push(1)
    int_stack.push(2)
    int_stack.push(3)
    
    print(f"栈顶元素: {int_stack.peek()}")
    print(f"出栈: {int_stack.pop()}")
    print(f"栈大小: {int_stack.size()}")
    
    # AI补全点

if __name__ == "__main__":
    demonstrate_oop_patterns()

# AI补全点
print("Python面向对象编程和设计模式代码片段加载完成")