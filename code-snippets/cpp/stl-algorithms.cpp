/**
 * C++ STL算法示例
 */
#include <iostream>
#include <vector>
#include <algorithm>
#include <numeric>
#include <functional>
#include <string>
#include <map>
#include <set>
#include <iterator>
#include <random>

// 数据结构定义
struct Student {
    std::string name;
    int age;
    double score;
    
    Student(const std::string& n, int a, double s) : name(n), age(a), score(s) {}
    
    bool operator<(const Student& other) const {
        return score > other.score; // 按分数降序排列
    }
    
    friend std::ostream& operator<<(std::ostream& os, const Student& s) {
        os << s.name << "(年龄:" << s.age << ", 分数:" << s.score << ")";
        return os;
    }
};

// 查找算法示例
void searchAlgorithms() {
    std::cout << "\n=== 查找算法 ===" << std::endl;
    
    std::vector<int> numbers = {1, 3, 5, 7, 9, 11, 13, 15, 17, 19};
    
    // find - 线性查找
    auto it = std::find(numbers.begin(), numbers.end(), 7);
    if (it != numbers.end()) {
        std::cout << "找到元素 7，位置: " << std::distance(numbers.begin(), it) << std::endl;
    }
    
    // find_if - 条件查找
    auto it2 = std::find_if(numbers.begin(), numbers.end(), 
        [](int n) { return n > 10; });
    if (it2 != numbers.end()) {
        std::cout << "第一个大于10的元素: " << *it2 << std::endl;
    }
    
    // binary_search - 二分查找（需要有序）
    bool found = std::binary_search(numbers.begin(), numbers.end(), 9);
    std::cout << "二分查找9: " << (found ? "找到" : "未找到") << std::endl;
    
    // lower_bound 和 upper_bound
    auto lower = std::lower_bound(numbers.begin(), numbers.end(), 7);
    auto upper = std::upper_bound(numbers.begin(), numbers.end(), 7);
    std::cout << "7的范围: [" << std::distance(numbers.begin(), lower) 
              << ", " << std::distance(numbers.begin(), upper) << ")" << std::endl;
    
    // count 和 count_if
    std::vector<int> data = {1, 2, 3, 2, 4, 2, 5};
    int count2 = std::count(data.begin(), data.end(), 2);
    int countEven = std::count_if(data.begin(), data.end(), 
        [](int n) { return n % 2 == 0; });
    
    std::cout << "数字2出现次数: " << count2 << std::endl;
    std::cout << "偶数个数: " << countEven << std::endl;
}

// 排序算法示例
void sortingAlgorithms() {
    std::cout << "\n=== 排序算法 ===" << std::endl;
    
    std::vector<Student> students = {
        {"张三", 20, 85.5},
        {"李四", 19, 92.0},
        {"王五", 21, 78.5},
        {"赵六", 20, 88.0},
        {"钱七", 22, 95.5}
    };
    
    std::cout << "原始顺序:" << std::endl;
    for (const auto& s : students) {
        std::cout << "  " << s << std::endl;
    }
    
    // sort - 默认排序（使用operator<）
    std::vector<Student> sorted1 = students;
    std::sort(sorted1.begin(), sorted1.end());
    
    std::cout << "\n按分数降序排序:" << std::endl;
    for (const auto& s : sorted1) {
        std::cout << "  " << s << std::endl;
    }
    
    // sort - 自定义比较器（按年龄排序）
    std::vector<Student> sorted2 = students;
    std::sort(sorted2.begin(), sorted2.end(), 
        [](const Student& a, const Student& b) {
            return a.age < b.age;
        });
    
    std::cout << "\n按年龄升序排序:" << std::endl;
    for (const auto& s : sorted2) {
        std::cout << "  " << s << std::endl;
    }
    
    // stable_sort - 稳定排序
    std::vector<Student> sorted3 = students;
    std::stable_sort(sorted3.begin(), sorted3.end(),
        [](const Student& a, const Student& b) {
            return a.age < b.age;
        });
    
    std::cout << "\n稳定排序（按年龄）:" << std::endl;
    for (const auto& s : sorted3) {
        std::cout << "  " << s << std::endl;
    }
    
    // partial_sort - 部分排序（只排序前N个元素）
    std::vector<int> numbers = {5, 2, 8, 1, 9, 3, 7, 4, 6};
    std::partial_sort(numbers.begin(), numbers.begin() + 3, numbers.end());
    
    std::cout << "\n部分排序（前3个最小元素）: ";
    for (int n : numbers) {
        std::cout << n << " ";
    }
    std::cout << std::endl;
    
    // nth_element - 第N个元素
    std::vector<int> numbers2 = {5, 2, 8, 1, 9, 3, 7, 4, 6};
    std::nth_element(numbers2.begin(), numbers2.begin() + 4, numbers2.end());
    std::cout << "第5小的元素: " << numbers2[4] << std::endl;
}

// 变换算法示例
void transformAlgorithms() {
    std::cout << "\n=== 变换算法 ===" << std::endl;
    
    std::vector<int> numbers = {1, 2, 3, 4, 5};
    std::vector<int> squares(numbers.size());
    
    // transform - 变换
    std::transform(numbers.begin(), numbers.end(), squares.begin(),
        [](int n) { return n * n; });
    
    std::cout << "原数组: ";
    for (int n : numbers) std::cout << n << " ";
    std::cout << std::endl;
    
    std::cout << "平方数组: ";
    for (int n : squares) std::cout << n << " ";
    std::cout << std::endl;
    
    // transform - 二元操作
    std::vector<int> numbers2 = {10, 20, 30, 40, 50};
    std::vector<int> sums(numbers.size());
    
    std::transform(numbers.begin(), numbers.end(), numbers2.begin(), sums.begin(),
        [](int a, int b) { return a + b; });
    
    std::cout << "数组1: ";
    for (int n : numbers) std::cout << n << " ";
    std::cout << std::endl;
    
    std::cout << "数组2: ";
    for (int n : numbers2) std::cout << n << " ";
    std::cout << std::endl;
    
    std::cout << "相加结果: ";
    for (int n : sums) std::cout << n << " ";
    std::cout << std::endl;
    
    // for_each - 对每个元素执行操作
    std::cout << "\nfor_each示例: ";
    std::for_each(numbers.begin(), numbers.end(),
        [](int n) { std::cout << n * 2 << " "; });
    std::cout << std::endl;
}

// 数值算法示例
void numericAlgorithms() {
    std::cout << "\n=== 数值算法 ===" << std::endl;
    
    std::vector<int> numbers = {1, 2, 3, 4, 5, 6, 7, 8, 9, 10};
    
    // accumulate - 累积
    int sum = std::accumulate(numbers.begin(), numbers.end(), 0);
    std::cout << "数组和: " << sum << std::endl;
    
    // accumulate - 自定义操作（乘积）
    int product = std::accumulate(numbers.begin(), numbers.end(), 1,
        [](int a, int b) { return a * b; });
    std::cout << "数组乘积: " << product << std::endl;
    
    // inner_product - 内积
    std::vector<int> numbers2 = {2, 2, 2, 2, 2, 2, 2, 2, 2, 2};
    int innerProd = std::inner_product(numbers.begin(), numbers.end(), 
                                       numbers2.begin(), 0);
    std::cout << "内积: " << innerProd << std::endl;
    
    // partial_sum - 部分和
    std::vector<int> partialSums(numbers.size());
    std::partial_sum(numbers.begin(), numbers.end(), partialSums.begin());
    
    std::cout << "部分和: ";
    for (int n : partialSums) std::cout << n << " ";
    std::cout << std::endl;
    
    // adjacent_difference - 相邻差值
    std::vector<int> differences(numbers.size());
    std::adjacent_difference(numbers.begin(), numbers.end(), differences.begin());
    
    std::cout << "相邻差值: ";
    for (int n : differences) std::cout << n << " ";
    std::cout << std::endl;
    
    // iota - 递增序列
    std::vector<int> sequence(10);
    std::iota(sequence.begin(), sequence.end(), 100);
    
    std::cout << "递增序列: ";
    for (int n : sequence) std::cout << n << " ";
    std::cout << std::endl;
}

// 集合算法示例
void setAlgorithms() {
    std::cout << "\n=== 集合算法 ===" << std::endl;
    
    std::vector<int> set1 = {1, 2, 3, 4, 5, 6};
    std::vector<int> set2 = {4, 5, 6, 7, 8, 9};
    
    std::cout << "集合1: ";
    for (int n : set1) std::cout << n << " ";
    std::cout << std::endl;
    
    std::cout << "集合2: ";
    for (int n : set2) std::cout << n << " ";
    std::cout << std::endl;
    
    // set_union - 并集
    std::vector<int> unionResult;
    std::set_union(set1.begin(), set1.end(), set2.begin(), set2.end(),
                   std::back_inserter(unionResult));
    
    std::cout << "并集: ";
    for (int n : unionResult) std::cout << n << " ";
    std::cout << std::endl;
    
    // set_intersection - 交集
    std::vector<int> intersectionResult;
    std::set_intersection(set1.begin(), set1.end(), set2.begin(), set2.end(),
                          std::back_inserter(intersectionResult));
    
    std::cout << "交集: ";
    for (int n : intersectionResult) std::cout << n << " ";
    std::cout << std::endl;
    
    // set_difference - 差集
    std::vector<int> differenceResult;
    std::set_difference(set1.begin(), set1.end(), set2.begin(), set2.end(),
                        std::back_inserter(differenceResult));
    
    std::cout << "差集(1-2): ";
    for (int n : differenceResult) std::cout << n << " ";
    std::cout << std::endl;
    
    // set_symmetric_difference - 对称差集
    std::vector<int> symDiffResult;
    std::set_symmetric_difference(set1.begin(), set1.end(), set2.begin(), set2.end(),
                                  std::back_inserter(symDiffResult));
    
    std::cout << "对称差集: ";
    for (int n : symDiffResult) std::cout << n << " ";
    std::cout << std::endl;
}

// 堆算法示例
void heapAlgorithms() {
    std::cout << "\n=== 堆算法 ===" << std::endl;
    
    std::vector<int> numbers = {4, 1, 3, 2, 16, 9, 10, 14, 8, 7};
    
    std::cout << "原数组: ";
    for (int n : numbers) std::cout << n << " ";
    std::cout << std::endl;
    
    // make_heap - 创建堆
    std::make_heap(numbers.begin(), numbers.end());
    std::cout << "创建最大堆: ";
    for (int n : numbers) std::cout << n << " ";
    std::cout << std::endl;
    
    // push_heap - 添加元素到堆
    numbers.push_back(15);
    std::push_heap(numbers.begin(), numbers.end());
    std::cout << "添加15后: ";
    for (int n : numbers) std::cout << n << " ";
    std::cout << std::endl;
    
    // pop_heap - 从堆中移除最大元素
    std::pop_heap(numbers.begin(), numbers.end());
    int max_element = numbers.back();
    numbers.pop_back();
    std::cout << "移除最大元素 " << max_element << " 后: ";
    for (int n : numbers) std::cout << n << " ";
    std::cout << std::endl;
    
    // sort_heap - 堆排序
    std::sort_heap(numbers.begin(), numbers.end());
    std::cout << "堆排序后: ";
    for (int n : numbers) std::cout << n << " ";
    std::cout << std::endl;
    
    // is_heap - 检查是否为堆
    bool isHeap = std::is_heap(numbers.begin(), numbers.end());
    std::cout << "是否为堆: " << (isHeap ? "是" : "否") << std::endl;
}

// 排列算法示例
void permutationAlgorithms() {
    std::cout << "\n=== 排列算法 ===" << std::endl;
    
    std::vector<int> numbers = {1, 2, 3};
    
    std::cout << "所有排列:" << std::endl;
    do {
        for (int n : numbers) std::cout << n << " ";
        std::cout << std::endl;
    } while (std::next_permutation(numbers.begin(), numbers.end()));
    
    // 重置为最小排列
    std::sort(numbers.begin(), numbers.end());
    
    std::cout << "\n前5个排列:" << std::endl;
    for (int i = 0; i < 5; ++i) {
        for (int n : numbers) std::cout << n << " ";
        std::cout << std::endl;
        if (!std::next_permutation(numbers.begin(), numbers.end())) {
            break;
        }
    }
}

int main() {
    std::cout << "=== C++ STL算法示例 ===" << std::endl;
    
    searchAlgorithms();
    sortingAlgorithms();
    transformAlgorithms();
    numericAlgorithms();
    setAlgorithms();
    heapAlgorithms();
    permutationAlgorithms();
    
    return 0;
}
