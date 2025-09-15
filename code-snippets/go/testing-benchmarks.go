// Go测试和基准测试示例
package main

import (
	"errors"
	"fmt"
	"math"
	"sort"
	"strings"
	"testing"
	"time"
)

// 被测试的函数
func Add(a, b int) int {
	return a + b
}

func Subtract(a, b int) int {
	return a - b
}

func Multiply(a, b int) int {
	return a * b
}

func Divide(a, b float64) (float64, error) {
	if b == 0 {
		return 0, errors.New("division by zero")
	}
	return a / b, nil
}

// 字符串处理函数
func IsPalindrome(s string) bool {
	s = strings.ToLower(strings.ReplaceAll(s, " ", ""))
	runes := []rune(s)
	for i := 0; i < len(runes)/2; i++ {
		if runes[i] != runes[len(runes)-1-i] {
			return false
		}
	}
	return true
}

func ReverseString(s string) string {
	runes := []rune(s)
	for i, j := 0, len(runes)-1; i < j; i, j = i+1, j-1 {
		runes[i], runes[j] = runes[j], runes[i]
	}
	return string(runes)
}

// 数学函数
func Factorial(n int) int {
	if n < 0 {
		return 0
	}
	if n == 0 || n == 1 {
		return 1
	}
	result := 1
	for i := 2; i <= n; i++ {
		result *= i
	}
	return result
}

func IsPrime(n int) bool {
	if n < 2 {
		return false
	}
	if n == 2 {
		return true
	}
	if n%2 == 0 {
		return false
	}
	for i := 3; i*i <= n; i += 2 {
		if n%i == 0 {
			return false
		}
	}
	return true
}

// 排序算法
func BubbleSort(arr []int) []int {
	result := make([]int, len(arr))
	copy(result, arr)
	
	n := len(result)
	for i := 0; i < n-1; i++ {
		for j := 0; j < n-i-1; j++ {
			if result[j] > result[j+1] {
				result[j], result[j+1] = result[j+1], result[j]
			}
		}
	}
	return result
}

func QuickSort(arr []int) []int {
	result := make([]int, len(arr))
	copy(result, arr)
	quickSortHelper(result, 0, len(result)-1)
	return result
}

func quickSortHelper(arr []int, low, high int) {
	if low < high {
		pi := partition(arr, low, high)
		quickSortHelper(arr, low, pi-1)
		quickSortHelper(arr, pi+1, high)
	}
}

func partition(arr []int, low, high int) int {
	pivot := arr[high]
	i := low - 1
	
	for j := low; j < high; j++ {
		if arr[j] < pivot {
			i++
			arr[i], arr[j] = arr[j], arr[i]
		}
	}
	arr[i+1], arr[high] = arr[high], arr[i+1]
	return i + 1
}

// 数据结构
type Stack struct {
	items []int
}

func (s *Stack) Push(item int) {
	s.items = append(s.items, item)
}

func (s *Stack) Pop() (int, error) {
	if len(s.items) == 0 {
		return 0, errors.New("stack is empty")
	}
	index := len(s.items) - 1
	item := s.items[index]
	s.items = s.items[:index]
	return item, nil
}

func (s *Stack) Peek() (int, error) {
	if len(s.items) == 0 {
		return 0, errors.New("stack is empty")
	}
	return s.items[len(s.items)-1], nil
}

func (s *Stack) Size() int {
	return len(s.items)
}

func (s *Stack) IsEmpty() bool {
	return len(s.items) == 0
}

// 以下是测试函数（通常放在 *_test.go 文件中）

// 基础单元测试
func TestAdd(t *testing.T) {
	tests := []struct {
		name     string
		a, b     int
		expected int
	}{
		{"正数相加", 2, 3, 5},
		{"负数相加", -2, -3, -5},
		{"正负数相加", 5, -3, 2},
		{"零相加", 0, 0, 0},
		{"与零相加", 5, 0, 5},
	}

	for _, tt := range tests {
		t.Run(tt.name, func(t *testing.T) {
			result := Add(tt.a, tt.b)
			if result != tt.expected {
				t.Errorf("Add(%d, %d) = %d; expected %d", tt.a, tt.b, result, tt.expected)
			}
		})
	}
}

func TestDivide(t *testing.T) {
	// 正常情况
	result, err := Divide(10, 2)
	if err != nil {
		t.Errorf("Divide(10, 2) returned error: %v", err)
	}
	if result != 5.0 {
		t.Errorf("Divide(10, 2) = %f; expected 5.0", result)
	}

	// 除零错误
	_, err = Divide(10, 0)
	if err == nil {
		t.Error("Divide(10, 0) should return error")
	}
}

func TestIsPalindrome(t *testing.T) {
	tests := []struct {
		input    string
		expected bool
	}{
		{"racecar", true},
		{"A man a plan a canal Panama", true},
		{"race a car", false},
		{"hello", false},
		{"", true},
		{"a", true},
	}

	for _, tt := range tests {
		t.Run(tt.input, func(t *testing.T) {
			result := IsPalindrome(tt.input)
			if result != tt.expected {
				t.Errorf("IsPalindrome(%q) = %v; expected %v", tt.input, result, tt.expected)
			}
		})
	}
}

func TestFactorial(t *testing.T) {
	tests := []struct {
		input    int
		expected int
	}{
		{0, 1},
		{1, 1},
		{5, 120},
		{-1, 0},
	}

	for _, tt := range tests {
		t.Run(fmt.Sprintf("factorial_%d", tt.input), func(t *testing.T) {
			result := Factorial(tt.input)
			if result != tt.expected {
				t.Errorf("Factorial(%d) = %d; expected %d", tt.input, result, tt.expected)
			}
		})
	}
}

func TestStack(t *testing.T) {
	stack := &Stack{}

	// 测试空栈
	if !stack.IsEmpty() {
		t.Error("新栈应该为空")
	}

	if stack.Size() != 0 {
		t.Errorf("空栈大小应该为0，实际为%d", stack.Size())
	}

	// 测试空栈弹出
	_, err := stack.Pop()
	if err == nil {
		t.Error("空栈弹出应该返回错误")
	}

	// 测试压入和弹出
	stack.Push(1)
	stack.Push(2)
	stack.Push(3)

	if stack.Size() != 3 {
		t.Errorf("栈大小应该为3，实际为%d", stack.Size())
	}

	// 测试查看栈顶
	top, err := stack.Peek()
	if err != nil {
		t.Errorf("查看栈顶出错: %v", err)
	}
	if top != 3 {
		t.Errorf("栈顶应该为3，实际为%d", top)
	}

	// 测试弹出
	item, err := stack.Pop()
	if err != nil {
		t.Errorf("弹出出错: %v", err)
	}
	if item != 3 {
		t.Errorf("弹出的元素应该为3，实际为%d", item)
	}

	if stack.Size() != 2 {
		t.Errorf("弹出后栈大小应该为2，实际为%d", stack.Size())
	}
}

// 基准测试
func BenchmarkAdd(b *testing.B) {
	for i := 0; i < b.N; i++ {
		Add(123, 456)
	}
}

func BenchmarkFactorial(b *testing.B) {
	for i := 0; i < b.N; i++ {
		Factorial(10)
	}
}

func BenchmarkIsPrime(b *testing.B) {
	for i := 0; i < b.N; i++ {
		IsPrime(97)
	}
}

func BenchmarkBubbleSort(b *testing.B) {
	data := []int{64, 34, 25, 12, 22, 11, 90, 88, 76, 50, 42}
	
	b.ResetTimer()
	for i := 0; i < b.N; i++ {
		BubbleSort(data)
	}
}

func BenchmarkQuickSort(b *testing.B) {
	data := []int{64, 34, 25, 12, 22, 11, 90, 88, 76, 50, 42}
	
	b.ResetTimer()
	for i := 0; i < b.N; i++ {
		QuickSort(data)
	}
}

func BenchmarkStandardSort(b *testing.B) {
	data := []int{64, 34, 25, 12, 22, 11, 90, 88, 76, 50, 42}
	
	b.ResetTimer()
	for i := 0; i < b.N; i++ {
		sorted := make([]int, len(data))
		copy(sorted, data)
		sort.Ints(sorted)
	}
}

// 不同大小数据的基准测试
func BenchmarkSortSmall(b *testing.B) {
	data := []int{3, 1, 4, 1, 5}
	benchmarkSort(b, data)
}

func BenchmarkSortMedium(b *testing.B) {
	data := make([]int, 100)
	for i := range data {
		data[i] = 100 - i
	}
	benchmarkSort(b, data)
}

func BenchmarkSortLarge(b *testing.B) {
	data := make([]int, 1000)
	for i := range data {
		data[i] = 1000 - i
	}
	benchmarkSort(b, data)
}

func benchmarkSort(b *testing.B, data []int) {
	b.ResetTimer()
	for i := 0; i < b.N; i++ {
		b.StopTimer()
		testData := make([]int, len(data))
		copy(testData, data)
		b.StartTimer()
		
		QuickSort(testData)
	}
}

// 内存分配基准测试
func BenchmarkStringConcatenation(b *testing.B) {
	for i := 0; i < b.N; i++ {
		var result string
		for j := 0; j < 100; j++ {
			result += "hello"
		}
	}
}

func BenchmarkStringBuilder(b *testing.B) {
	for i := 0; i < b.N; i++ {
		var builder strings.Builder
		for j := 0; j < 100; j++ {
			builder.WriteString("hello")
		}
		_ = builder.String()
	}
}

// 并行基准测试
func BenchmarkIsPrimeParallel(b *testing.B) {
	b.RunParallel(func(pb *testing.PB) {
		for pb.Next() {
			IsPrime(97)
		}
	})
}

// 子基准测试
func BenchmarkMathOperations(b *testing.B) {
	b.Run("Add", func(b *testing.B) {
		for i := 0; i < b.N; i++ {
			Add(123, 456)
		}
	})
	
	b.Run("Multiply", func(b *testing.B) {
		for i := 0; i < b.N; i++ {
			Multiply(123, 456)
		}
	})
	
	b.Run("Sqrt", func(b *testing.B) {
		for i := 0; i < b.N; i++ {
			math.Sqrt(123.456)
		}
	})
}

// 示例测试
func ExampleAdd() {
	result := Add(2, 3)
	fmt.Println(result)
	// Output: 5
}

func ExampleIsPalindrome() {
	fmt.Println(IsPalindrome("racecar"))
	fmt.Println(IsPalindrome("hello"))
	// Output:
	// true
	// false
}

func ExampleReverseString() {
	result := ReverseString("hello")
	fmt.Println(result)
	// Output: olleh
}

// 模糊测试 (Go 1.18+)
func FuzzAdd(f *testing.F) {
	// 添加种子语料
	f.Add(1, 2)
	f.Add(-1, -2)
	f.Add(0, 0)
	
	f.Fuzz(func(t *testing.T, a, b int) {
		result := Add(a, b)
		// 验证加法的交换律
		if Add(a, b) != Add(b, a) {
			t.Errorf("加法交换律失败: Add(%d, %d) != Add(%d, %d)", a, b, b, a)
		}
		// 验证结果
		if result != a+b {
			t.Errorf("Add(%d, %d) = %d, expected %d", a, b, result, a+b)
		}
	})
}

// 性能比较示例
func main() {
	// 这个函数演示如何在代码中进行简单的性能测试
	fmt.Println("=== Go测试和基准测试示例 ===")
	
	// 比较不同排序算法的性能
	data := []int{64, 34, 25, 12, 22, 11, 90, 88, 76, 50, 42}
	
	// 测试冒泡排序
	start := time.Now()
	bubbleResult := BubbleSort(data)
	bubbleDuration := time.Since(start)
	
	// 测试快速排序
	start = time.Now()
	quickResult := QuickSort(data)
	quickDuration := time.Since(start)
	
	// 测试标准库排序
	standardData := make([]int, len(data))
	copy(standardData, data)
	start = time.Now()
	sort.Ints(standardData)
	standardDuration := time.Since(start)
	
	fmt.Printf("原始数据: %v\n", data)
	fmt.Printf("冒泡排序结果: %v (耗时: %v)\n", bubbleResult, bubbleDuration)
	fmt.Printf("快速排序结果: %v (耗时: %v)\n", quickResult, quickDuration)
	fmt.Printf("标准库排序结果: %v (耗时: %v)\n", standardData, standardDuration)
	
	// 测试其他函数
	fmt.Printf("\n其他函数测试:\n")
	fmt.Printf("Add(10, 20) = %d\n", Add(10, 20))
	fmt.Printf("Factorial(5) = %d\n", Factorial(5))
	fmt.Printf("IsPrime(17) = %t\n", IsPrime(17))
	fmt.Printf("IsPalindrome(\"racecar\") = %t\n", IsPalindrome("racecar"))
	fmt.Printf("ReverseString(\"hello\") = %s\n", ReverseString("hello"))
	
	fmt.Println("\n要运行测试，请使用以下命令:")
	fmt.Println("go test -v")
	fmt.Println("go test -bench=.")
	fmt.Println("go test -bench=. -benchmem")
	fmt.Println("go test -fuzz=FuzzAdd")
}
