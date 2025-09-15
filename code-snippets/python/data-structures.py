# Python数据结构和操作代码片段
# 用于测试AI代码补全功能

from collections import defaultdict, deque, Counter, namedtuple, OrderedDict
from typing import List, Dict, Set, Tuple, Optional, Union, Any, Iterator, Generator
from dataclasses import dataclass, field
from itertools import islice, chain, groupby, combinations, permutations
from functools import reduce, partial, wraps
import heapq
import bisect
import copy
import json
import pickle
from enum import Enum, auto

# 1. 基础数据结构操作
# ======================

def list_operations_demo():
    """演示列表的各种操作"""
    numbers = [1, 2, 3, 4, 5]
    names = ['Alice', 'Bob', 'Charlie', 'David']
    
    # 列表切片和索引
    first_three = numbers[:3]
    last_two = numbers[-2:]
    every_second = numbers[::2]
    reversed_list = numbers[::-1]
    
    # 列表推导式
    squares = [x**2 for x in numbers]
    even_squares = [x**2 for x in numbers if x % 2 == 0]
    
    # 嵌套列表推导式
    matrix = [[i*j for j in range(1, 4)] for i in range(1, 4)]
    flattened = [item for row in matrix for item in row]
    
    # AI补全点
    
    # 条件列表推导式
    categorized = ['even' if x % 2 == 0 else 'odd' for x in numbers]
    
    # 列表过滤和映射
    filtered_names = [name for name in names if len(name) > 4]
    uppercased = [name.upper() for name in names]
    
    # 列表排序
    sorted_names = sorted(names, key=len)
    sorted_desc = sorted(numbers, reverse=True)
    
    return {
        'original': numbers,
        'squares': squares,
        'matrix': matrix,
        'flattened': flattened,
        'categorized': categorized,
        'filtered_names': filtered_names
    }

def dictionary_operations_demo():
    """演示字典的高级操作"""
    students = {
        'Alice': {'age': 20, 'grade': 'A', 'subjects': ['Math', 'Physics']},
        'Bob': {'age': 19, 'grade': 'B', 'subjects': ['Chemistry', 'Biology']},
        'Charlie': {'age': 21, 'grade': 'A', 'subjects': ['Math', 'Chemistry']}
    }
    
    # 字典推导式
    grades_only = {name: info['grade'] for name, info in students.items()}
    honor_students = {name: info for name, info in students.items() if info['grade'] == 'A'}
    
    # 嵌套字典操作
    subject_counts = {}
    for student_info in students.values():
        for subject in student_info['subjects']:
            subject_counts[subject] = subject_counts.get(subject, 0) + 1
    
    # 使用defaultdict简化操作
    subject_students = defaultdict(list)
    for name, info in students.items():
        for subject in info['subjects']:
            subject_students[subject].append(name)
    
    # AI补全点
    
    # 字典合并
    additional_info = {'Alice': {'hobby': 'reading'}, 'Bob': {'hobby': 'gaming'}}
    
    # Python 3.9+ 合并操作符
    # merged = students | additional_info  # 需要Python 3.9+
    
    # 兼容性合并方法
    merged = copy.deepcopy(students)
    for name, info in additional_info.items():
        if name in merged:
            merged[name].update(info)
        else:
            merged[name] = info
    
    # 字典排序
    sorted_by_age = dict(sorted(students.items(), key=lambda x: x[1]['age']))
    sorted_by_grade = dict(sorted(students.items(), key=lambda x: x[1]['grade']))
    
    return {
        'grades_only': grades_only,
        'honor_students': honor_students,
        'subject_counts': dict(subject_counts),
        'subject_students': dict(subject_students),
        'merged': merged
    }

def set_operations_demo():
    """演示集合操作"""
    set_a = {1, 2, 3, 4, 5}
    set_b = {4, 5, 6, 7, 8}
    set_c = {3, 4, 5}
    
    # 基本集合操作
    union = set_a | set_b  # 并集
    intersection = set_a & set_b  # 交集
    difference = set_a - set_b  # 差集
    symmetric_diff = set_a ^ set_b  # 对称差集
    
    # 集合关系判断
    is_subset = set_c.issubset(set_a)
    is_superset = set_a.issuperset(set_c)
    is_disjoint = set_a.isdisjoint({9, 10, 11})
    
    # 集合推导式
    squared_evens = {x**2 for x in range(10) if x % 2 == 0}
    
    # 集合去重
    numbers_with_duplicates = [1, 2, 2, 3, 3, 3, 4, 4, 4, 4]
    unique_numbers = list(set(numbers_with_duplicates))
    
    # AI补全点
    
    # 冻结集合
    frozen_set = frozenset([1, 2, 3, 4, 5])
    
    # 实际应用：找出公共朋友
    alice_friends = {'Bob', 'Charlie', 'David', 'Eve'}
    bob_friends = {'Alice', 'Charlie', 'Frank', 'Grace'}
    common_friends = alice_friends & bob_friends
    
    return {
        'union': union,
        'intersection': intersection,
        'difference': difference,
        'symmetric_diff': symmetric_diff,
        'common_friends': common_friends,
        'squared_evens': squared_evens
    }

# 2. 高级数据结构
# ======================

@dataclass
class Person:
    """使用dataclass定义数据结构"""
    name: str
    age: int
    email: str
    hobbies: List[str] = field(default_factory=list)
    metadata: Dict[str, Any] = field(default_factory=dict)
    
    def __post_init__(self):
        """在初始化后执行的方法"""
        if '@' not in self.email:
            raise ValueError(f"Invalid email: {self.email}")
        
        # AI补全点
        self.metadata['created_at'] = str(datetime.now()) if 'datetime' in globals() else 'unknown'
    
    def add_hobby(self, hobby: str) -> None:
        """添加爱好"""
        if hobby not in self.hobbies:
            self.hobbies.append(hobby)
    
    def remove_hobby(self, hobby: str) -> bool:
        """移除爱好"""
        try:
            self.hobbies.remove(hobby)
            return True
        except ValueError:
            return False
    
    def to_dict(self) -> Dict[str, Any]:
        """转换为字典"""
        return {
            'name': self.name,
            'age': self.age,
            'email': self.email,
            'hobbies': self.hobbies.copy(),
            'metadata': self.metadata.copy()
        }

class PriorityQueue:
    """优先队列实现"""
    
    def __init__(self):
        self._queue = []
        self._index = 0
    
    def push(self, item, priority):
        """添加元素到优先队列"""
        heapq.heappush(self._queue, (priority, self._index, item))
        self._index += 1
    
    def pop(self):
        """弹出优先级最高的元素"""
        if self._queue:
            priority, index, item = heapq.heappop(self._queue)
            return item
        raise IndexError("Priority queue is empty")
    
    def peek(self):
        """查看优先级最高的元素但不移除"""
        if self._queue:
            return self._queue[0][2]
        raise IndexError("Priority queue is empty")
    
    def is_empty(self):
        """检查队列是否为空"""
        return len(self._queue) == 0
    
    def size(self):
        """获取队列大小"""
        return len(self._queue)
    
    # AI补全点

class LRUCache:
    """LRU缓存实现"""
    
    def __init__(self, capacity: int):
        self.capacity = capacity
        self.cache = OrderedDict()
    
    def get(self, key: Any) -> Any:
        """获取缓存值"""
        if key not in self.cache:
            return None
        
        # 移动到末尾表示最近使用
        self.cache.move_to_end(key)
        return self.cache[key]
    
    def put(self, key: Any, value: Any) -> None:
        """设置缓存值"""
        if key in self.cache:
            # 更新现有键值
            self.cache.move_to_end(key)
        elif len(self.cache) >= self.capacity:
            # 移除最久未使用的项
            self.cache.popitem(last=False)
        
        self.cache[key] = value
        # AI补全点
    
    def delete(self, key: Any) -> bool:
        """删除缓存项"""
        if key in self.cache:
            del self.cache[key]
            return True
        return False
    
    def clear(self) -> None:
        """清空缓存"""
        self.cache.clear()
    
    def size(self) -> int:
        """获取缓存大小"""
        return len(self.cache)
    
    def keys(self) -> List[Any]:
        """获取所有键"""
        return list(self.cache.keys())

class Trie:
    """字典树（前缀树）实现"""
    
    class TrieNode:
        def __init__(self):
            self.children = {}
            self.is_end_of_word = False
            self.value = None
    
    def __init__(self):
        self.root = self.TrieNode()
        self.size = 0
    
    def insert(self, word: str, value: Any = None) -> None:
        """插入单词"""
        node = self.root
        for char in word:
            if char not in node.children:
                node.children[char] = self.TrieNode()
            node = node.children[char]
        
        if not node.is_end_of_word:
            self.size += 1
        
        node.is_end_of_word = True
        node.value = value
        # AI补全点
    
    def search(self, word: str) -> bool:
        """搜索单词是否存在"""
        node = self._find_node(word)
        return node is not None and node.is_end_of_word
    
    def starts_with(self, prefix: str) -> bool:
        """检查是否有以指定前缀开始的单词"""
        return self._find_node(prefix) is not None
    
    def _find_node(self, word: str) -> Optional['TrieNode']:
        """查找节点"""
        node = self.root
        for char in word:
            if char not in node.children:
                return None
            node = node.children[char]
        return node
    
    def get_words_with_prefix(self, prefix: str) -> List[str]:
        """获取所有以指定前缀开始的单词"""
        node = self._find_node(prefix)
        if node is None:
            return []
        
        words = []
        self._collect_words(node, prefix, words)
        return words
    
    def _collect_words(self, node: 'TrieNode', current_word: str, words: List[str]) -> None:
        """收集单词"""
        if node.is_end_of_word:
            words.append(current_word)
        
        for char, child_node in node.children.items():
            self._collect_words(child_node, current_word + char, words)
        
        # AI补全点

# 3. 生成器和迭代器
# ======================

def fibonacci_generator(n: int) -> Generator[int, None, None]:
    """斐波那契数列生成器"""
    a, b = 0, 1
    count = 0
    while count < n:
        yield a
        a, b = b, a + b
        count += 1
    # AI补全点

def prime_generator(max_num: int) -> Generator[int, None, None]:
    """质数生成器"""
    def is_prime(num):
        if num < 2:
            return False
        for i in range(2, int(num ** 0.5) + 1):
            if num % i == 0:
                return False
        return True
    
    for num in range(2, max_num + 1):
        if is_prime(num):
            yield num
    # AI补全点

def batch_generator(iterable, batch_size: int):
    """批量处理生成器"""
    iterator = iter(iterable)
    while True:
        batch = list(islice(iterator, batch_size))
        if not batch:
            break
        yield batch
    # AI补全点

def sliding_window(iterable, window_size: int):
    """滑动窗口生成器"""
    iterator = iter(iterable)
    window = deque(islice(iterator, window_size), maxlen=window_size)
    
    if len(window) == window_size:
        yield list(window)
    
    for item in iterator:
        window.append(item)
        yield list(window)
    # AI补全点

def data_pipeline(*generators):
    """数据管道生成器"""
    def pipeline(data):
        for generator in generators:
            data = generator(data)
        return data
    return pipeline

# 数据处理管道示例
def filter_even(numbers):
    """过滤偶数"""
    for num in numbers:
        if num % 2 == 0:
            yield num

def square_numbers(numbers):
    """平方数字"""
    for num in numbers:
        yield num ** 2

def limit_results(numbers, limit=10):
    """限制结果数量"""
    count = 0
    for num in numbers:
        if count >= limit:
            break
        yield num
        count += 1
    # AI补全点

# 4. 函数式编程辅助工具
# ======================

def compose(*functions):
    """函数组合"""
    return reduce(lambda f, g: lambda x: f(g(x)), functions, lambda x: x)

def curry(func):
    """柯里化装饰器"""
    @wraps(func)
    def curried(*args, **kwargs):
        if len(args) + len(kwargs) >= func.__code__.co_argcount:
            return func(*args, **kwargs)
        return partial(curried, *args, **kwargs)
    return curried

def memoize(func):
    """记忆化装饰器"""
    cache = {}
    
    @wraps(func)
    def wrapper(*args, **kwargs):
        # 创建缓存键
        key = str(args) + str(sorted(kwargs.items()))
        
        if key not in cache:
            cache[key] = func(*args, **kwargs)
        
        return cache[key]
    
    wrapper.cache = cache
    wrapper.cache_clear = lambda: cache.clear()
    return wrapper
    # AI补全点

@curry
def map_with_index(func, iterable):
    """带索引的映射"""
    return [func(i, item) for i, item in enumerate(iterable)]

@curry
def filter_with_index(predicate, iterable):
    """带索引的过滤"""
    return [item for i, item in enumerate(iterable) if predicate(i, item)]

def group_by_key(iterable, key_func):
    """按键分组"""
    groups = defaultdict(list)
    for item in iterable:
        key = key_func(item)
        groups[key].append(item)
    return dict(groups)

def flatten_nested(nested_list):
    """展平嵌套列表"""
    result = []
    for item in nested_list:
        if isinstance(item, (list, tuple)):
            result.extend(flatten_nested(item))
        else:
            result.append(item)
    return result
    # AI补全点

# 5. 数据分析工具
# ======================

class DataAnalyzer:
    """数据分析工具类"""
    
    def __init__(self, data: List[Dict[str, Any]]):
        self.data = data
        self.cache = {}
    
    def filter(self, predicate) -> 'DataAnalyzer':
        """过滤数据"""
        filtered_data = [item for item in self.data if predicate(item)]
        return DataAnalyzer(filtered_data)
    
    def map(self, mapper) -> 'DataAnalyzer':
        """映射数据"""
        mapped_data = [mapper(item) for item in self.data]
        return DataAnalyzer(mapped_data)
    
    def group_by(self, key_func) -> Dict[Any, 'DataAnalyzer']:
        """按键分组"""
        groups = group_by_key(self.data, key_func)
        return {key: DataAnalyzer(items) for key, items in groups.items()}
    
    def sort_by(self, key_func, reverse=False) -> 'DataAnalyzer':
        """排序"""
        sorted_data = sorted(self.data, key=key_func, reverse=reverse)
        return DataAnalyzer(sorted_data)
    
    def aggregate(self, **aggregators) -> Dict[str, Any]:
        """聚合计算"""
        result = {}
        for name, agg_func in aggregators.items():
            if callable(agg_func):
                result[name] = agg_func(self.data)
            else:
                result[name] = agg_func
        return result
        # AI补全点
    
    def distinct(self, key_func=None) -> 'DataAnalyzer':
        """去重"""
        if key_func is None:
            # 简单去重
            seen = set()
            unique_data = []
            for item in self.data:
                item_str = str(item)
                if item_str not in seen:
                    seen.add(item_str)
                    unique_data.append(item)
        else:
            # 按键去重
            seen = set()
            unique_data = []
            for item in self.data:
                key = key_func(item)
                if key not in seen:
                    seen.add(key)
                    unique_data.append(item)
        
        return DataAnalyzer(unique_data)
    
    def take(self, n: int) -> 'DataAnalyzer':
        """取前n个元素"""
        return DataAnalyzer(self.data[:n])
    
    def skip(self, n: int) -> 'DataAnalyzer':
        """跳过前n个元素"""
        return DataAnalyzer(self.data[n:])
    
    def count(self) -> int:
        """计数"""
        return len(self.data)
    
    def to_list(self) -> List[Dict[str, Any]]:
        """转换为列表"""
        return self.data.copy()
    
    def to_dict(self, key_func) -> Dict[Any, Dict[str, Any]]:
        """转换为字典"""
        return {key_func(item): item for item in self.data}
    
    # 统计函数
    def sum(self, key_func) -> Union[int, float]:
        """求和"""
        return sum(key_func(item) for item in self.data)
    
    def avg(self, key_func) -> float:
        """平均值"""
        values = [key_func(item) for item in self.data]
        return sum(values) / len(values) if values else 0
    
    def min(self, key_func) -> Any:
        """最小值"""
        return min(self.data, key=key_func) if self.data else None
    
    def max(self, key_func) -> Any:
        """最大值"""
        return max(self.data, key=key_func) if self.data else None
        # AI补全点

# 6. 算法实现
# ======================

def binary_search(arr: List[int], target: int) -> int:
    """二分搜索"""
    left, right = 0, len(arr) - 1
    
    while left <= right:
        mid = (left + right) // 2
        
        if arr[mid] == target:
            return mid
        elif arr[mid] < target:
            left = mid + 1
        else:
            right = mid - 1
    
    return -1
    # AI补全点

def quicksort(arr: List[int]) -> List[int]:
    """快速排序"""
    if len(arr) <= 1:
        return arr
    
    pivot = arr[len(arr) // 2]
    left = [x for x in arr if x < pivot]
    middle = [x for x in arr if x == pivot]
    right = [x for x in arr if x > pivot]
    
    return quicksort(left) + middle + quicksort(right)
    # AI补全点

def merge_sort(arr: List[int]) -> List[int]:
    """归并排序"""
    if len(arr) <= 1:
        return arr
    
    mid = len(arr) // 2
    left = merge_sort(arr[:mid])
    right = merge_sort(arr[mid:])
    
    return merge(left, right)

def merge(left: List[int], right: List[int]) -> List[int]:
    """合并两个有序数组"""
    result = []
    i = j = 0
    
    while i < len(left) and j < len(right):
        if left[i] <= right[j]:
            result.append(left[i])
            i += 1
        else:
            result.append(right[j])
            j += 1
    
    result.extend(left[i:])
    result.extend(right[j:])
    return result
    # AI补全点

def dijkstra(graph: Dict[str, Dict[str, int]], start: str) -> Dict[str, int]:
    """Dijkstra最短路径算法"""
    distances = {node: float('infinity') for node in graph}
    distances[start] = 0
    
    pq = PriorityQueue()
    pq.push(start, 0)
    visited = set()
    
    while not pq.is_empty():
        current = pq.pop()
        
        if current in visited:
            continue
        
        visited.add(current)
        
        for neighbor, weight in graph.get(current, {}).items():
            distance = distances[current] + weight
            
            if distance < distances[neighbor]:
                distances[neighbor] = distance
                pq.push(neighbor, distance)
    
    return distances
    # AI补全点

# 7. 使用示例和测试
# ======================

def demonstrate_data_structures():
    """演示数据结构的使用"""
    print("=== 基础数据结构操作 ===")
    
    # 列表操作
    list_demo = list_operations_demo()
    print(f"列表推导式结果: {list_demo['squares']}")
    
    # 字典操作
    dict_demo = dictionary_operations_demo()
    print(f"优秀学生: {dict_demo['honor_students']}")
    
    # 集合操作
    set_demo = set_operations_demo()
    print(f"集合交集: {set_demo['intersection']}")
    
    print("\n=== 高级数据结构 ===")
    
    # 优先队列
    pq = PriorityQueue()
    pq.push("任务1", 3)
    pq.push("任务2", 1)
    pq.push("任务3", 2)
    
    print(f"优先级最高的任务: {pq.pop()}")
    
    # LRU缓存
    cache = LRUCache(3)
    cache.put("key1", "value1")
    cache.put("key2", "value2")
    cache.put("key3", "value3")
    cache.put("key4", "value4")  # 这会移除key1
    
    print(f"缓存大小: {cache.size()}")
    print(f"缓存键: {cache.keys()}")
    
    # AI补全点
    
    # 字典树
    trie = Trie()
    words = ["apple", "app", "application", "apply", "banana", "band"]
    for word in words:
        trie.insert(word)
    
    print(f"以'app'开头的单词: {trie.get_words_with_prefix('app')}")
    
    print("\n=== 生成器演示 ===")
    
    # 斐波那契数列
    fib_numbers = list(fibonacci_generator(10))
    print(f"前10个斐波那契数: {fib_numbers}")
    
    # 质数生成器
    primes = list(prime_generator(30))
    print(f"30以内的质数: {primes}")
    
    # 批量处理
    numbers = list(range(1, 21))
    batches = list(batch_generator(numbers, 5))
    print(f"批量处理结果: {batches}")
    
    print("\n=== 数据分析演示 ===")
    
    # 模拟数据
    students_data = [
        {"name": "Alice", "age": 20, "grade": 85, "subject": "Math"},
        {"name": "Bob", "age": 19, "grade": 92, "subject": "Physics"},
        {"name": "Charlie", "age": 21, "grade": 78, "subject": "Math"},
        {"name": "David", "age": 20, "grade": 88, "subject": "Physics"},
        {"name": "Eve", "age": 22, "grade": 95, "subject": "Chemistry"}
    ]
    
    analyzer = DataAnalyzer(students_data)
    
    # 链式操作
    result = (analyzer
              .filter(lambda x: x["age"] >= 20)
              .filter(lambda x: x["grade"] >= 80)
              .sort_by(lambda x: x["grade"], reverse=True)
              .take(3)
              .to_list())
    
    print(f"年龄>=20且成绩>=80的前3名学生: {result}")
    
    # 分组统计
    by_subject = analyzer.group_by(lambda x: x["subject"])
    for subject, group in by_subject.items():
        avg_grade = group.avg(lambda x: x["grade"])
        print(f"{subject}学科平均成绩: {avg_grade:.2f}")
    
    # AI补全点

if __name__ == "__main__":
    demonstrate_data_structures()

# AI补全点
print("Python数据结构和操作代码片段加载完成")