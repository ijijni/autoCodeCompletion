// Go接口和泛型示例
package main

import (
	"fmt"
	"sort"
	"strings"
)

// 基础接口示例
type Shape interface {
	Area() float64
	Perimeter() float64
	String() string
}

type Circle struct {
	Radius float64
}

func (c Circle) Area() float64 {
	return 3.14159 * c.Radius * c.Radius
}

func (c Circle) Perimeter() float64 {
	return 2 * 3.14159 * c.Radius
}

func (c Circle) String() string {
	return fmt.Sprintf("圆形(半径: %.2f)", c.Radius)
}

type Rectangle struct {
	Width, Height float64
}

func (r Rectangle) Area() float64 {
	return r.Width * r.Height
}

func (r Rectangle) Perimeter() float64 {
	return 2 * (r.Width + r.Height)
}

func (r Rectangle) String() string {
	return fmt.Sprintf("矩形(宽: %.2f, 高: %.2f)", r.Width, r.Height)
}

func printShapeInfo(s Shape) {
	fmt.Printf("%s - 面积: %.2f, 周长: %.2f\n", s.String(), s.Area(), s.Perimeter())
}

func basicInterfaceExample() {
	fmt.Println("\n=== 基础接口示例 ===")

	shapes := []Shape{
		Circle{Radius: 5},
		Rectangle{Width: 4, Height: 6},
		Circle{Radius: 3},
		Rectangle{Width: 2, Height: 8},
	}

	for _, shape := range shapes {
		printShapeInfo(shape)
	}
}

// 空接口示例
func printAnything(value interface{}) {
	switch v := value.(type) {
	case int:
		fmt.Printf("整数: %d\n", v)
	case string:
		fmt.Printf("字符串: %s\n", v)
	case bool:
		fmt.Printf("布尔值: %t\n", v)
	case []int:
		fmt.Printf("整数切片: %v\n", v)
	case Shape:
		fmt.Printf("形状: %s\n", v.String())
	default:
		fmt.Printf("未知类型: %T, 值: %v\n", v, v)
	}
}

func emptyInterfaceExample() {
	fmt.Println("\n=== 空接口示例 ===")

	values := []interface{}{
		42,
		"Hello, Go!",
		true,
		[]int{1, 2, 3, 4, 5},
		Circle{Radius: 2.5},
		3.14159,
	}

	for _, value := range values {
		printAnything(value)
	}
}

// 接口组合示例
type Reader interface {
	Read() string
}

type Writer interface {
	Write(data string)
}

type ReadWriter interface {
	Reader
	Writer
}

type File struct {
	name    string
	content string
}

func (f *File) Read() string {
	fmt.Printf("从文件 %s 读取: %s\n", f.name, f.content)
	return f.content
}

func (f *File) Write(data string) {
	fmt.Printf("向文件 %s 写入: %s\n", f.name, data)
	f.content = data
}

func processReadWriter(rw ReadWriter) {
	rw.Write("Hello, Interface!")
	content := rw.Read()
	fmt.Printf("处理的内容: %s\n", content)
}

func interfaceCompositionExample() {
	fmt.Println("\n=== 接口组合示例 ===")

	file := &File{name: "test.txt"}
	processReadWriter(file)
}

// 泛型函数示例 (Go 1.18+)
func Max[T comparable](a, b T) T {
	if a > b {
		return a
	}
	return b
}

func Min[T comparable](a, b T) T {
	if a < b {
		return a
	}
	return b
}

// 泛型切片操作
func Map[T, U any](slice []T, fn func(T) U) []U {
	result := make([]U, len(slice))
	for i, v := range slice {
		result[i] = fn(v)
	}
	return result
}

func Filter[T any](slice []T, predicate func(T) bool) []T {
	var result []T
	for _, v := range slice {
		if predicate(v) {
			result = append(result, v)
		}
	}
	return result
}

func Reduce[T, U any](slice []T, initial U, fn func(U, T) U) U {
	result := initial
	for _, v := range slice {
		result = fn(result, v)
	}
	return result
}

func genericFunctionsExample() {
	fmt.Println("\n=== 泛型函数示例 ===")

	// 比较函数
	fmt.Printf("Max(10, 20): %d\n", Max(10, 20))
	fmt.Printf("Max(3.14, 2.71): %.2f\n", Max(3.14, 2.71))
	fmt.Printf("Max(\"apple\", \"banana\"): %s\n", Max("apple", "banana"))

	// 切片操作
	numbers := []int{1, 2, 3, 4, 5}
	
	// Map: 将数字转换为字符串
	strings := Map(numbers, func(n int) string {
		return fmt.Sprintf("数字-%d", n)
	})
	fmt.Printf("Map结果: %v\n", strings)

	// Filter: 过滤偶数
	evens := Filter(numbers, func(n int) bool {
		return n%2 == 0
	})
	fmt.Printf("偶数: %v\n", evens)

	// Reduce: 求和
	sum := Reduce(numbers, 0, func(acc, n int) int {
		return acc + n
	})
	fmt.Printf("求和: %d\n", sum)
}

// 泛型类型示例
type Stack[T any] struct {
	items []T
}

func NewStack[T any]() *Stack[T] {
	return &Stack[T]{
		items: make([]T, 0),
	}
}

func (s *Stack[T]) Push(item T) {
	s.items = append(s.items, item)
}

func (s *Stack[T]) Pop() (T, bool) {
	if len(s.items) == 0 {
		var zero T
		return zero, false
	}
	
	index := len(s.items) - 1
	item := s.items[index]
	s.items = s.items[:index]
	return item, true
}

func (s *Stack[T]) Peek() (T, bool) {
	if len(s.items) == 0 {
		var zero T
		return zero, false
	}
	return s.items[len(s.items)-1], true
}

func (s *Stack[T]) Size() int {
	return len(s.items)
}

func (s *Stack[T]) IsEmpty() bool {
	return len(s.items) == 0
}

func genericTypesExample() {
	fmt.Println("\n=== 泛型类型示例 ===")

	// 整数栈
	intStack := NewStack[int]()
	intStack.Push(1)
	intStack.Push(2)
	intStack.Push(3)

	fmt.Printf("整数栈大小: %d\n", intStack.Size())
	
	if value, ok := intStack.Pop(); ok {
		fmt.Printf("弹出整数: %d\n", value)
	}

	// 字符串栈
	stringStack := NewStack[string]()
	stringStack.Push("Hello")
	stringStack.Push("World")
	stringStack.Push("Go")

	fmt.Printf("字符串栈大小: %d\n", stringStack.Size())
	
	if value, ok := stringStack.Peek(); ok {
		fmt.Printf("栈顶字符串: %s\n", value)
	}
}

// 类型约束示例
type Ordered interface {
	~int | ~int8 | ~int16 | ~int32 | ~int64 |
		~uint | ~uint8 | ~uint16 | ~uint32 | ~uint64 | ~uintptr |
		~float32 | ~float64 |
		~string
}

func Sort[T Ordered](slice []T) {
	sort.Slice(slice, func(i, j int) bool {
		return slice[i] < slice[j]
	})
}

func FindMax[T Ordered](slice []T) T {
	if len(slice) == 0 {
		var zero T
		return zero
	}
	
	max := slice[0]
	for _, v := range slice[1:] {
		if v > max {
			max = v
		}
	}
	return max
}

func typeConstraintsExample() {
	fmt.Println("\n=== 类型约束示例 ===")

	// 整数切片排序
	ints := []int{64, 34, 25, 12, 22, 11, 90}
	fmt.Printf("排序前: %v\n", ints)
	Sort(ints)
	fmt.Printf("排序后: %v\n", ints)
	fmt.Printf("最大值: %d\n", FindMax(ints))

	// 字符串切片排序
	strings := []string{"banana", "apple", "cherry", "date"}
	fmt.Printf("排序前: %v\n", strings)
	Sort(strings)
	fmt.Printf("排序后: %v\n", strings)
	fmt.Printf("最大值: %s\n", FindMax(strings))
}

// 接口与泛型结合示例
type Comparable[T any] interface {
	CompareTo(other T) int
}

type Person struct {
	Name string
	Age  int
}

func (p Person) CompareTo(other Person) int {
	if p.Age < other.Age {
		return -1
	} else if p.Age > other.Age {
		return 1
	}
	return strings.Compare(p.Name, other.Name)
}

func (p Person) String() string {
	return fmt.Sprintf("%s(%d岁)", p.Name, p.Age)
}

func SortComparable[T Comparable[T]](slice []T) {
	sort.Slice(slice, func(i, j int) bool {
		return slice[i].CompareTo(slice[j]) < 0
	})
}

func interfaceWithGenericsExample() {
	fmt.Println("\n=== 接口与泛型结合示例 ===")

	people := []Person{
		{"张三", 25},
		{"李四", 30},
		{"王五", 25},
		{"赵六", 35},
	}

	fmt.Println("排序前:")
	for _, p := range people {
		fmt.Printf("  %s\n", p.String())
	}

	SortComparable(people)

	fmt.Println("排序后:")
	for _, p := range people {
		fmt.Printf("  %s\n", p.String())
	}
}

// 泛型方法示例
type Container[T any] struct {
	items []T
}

func (c *Container[T]) Add(item T) {
	c.items = append(c.items, item)
}

func (c *Container[T]) Get(index int) (T, bool) {
	if index < 0 || index >= len(c.items) {
		var zero T
		return zero, false
	}
	return c.items[index], true
}

func (c *Container[T]) Size() int {
	return len(c.items)
}

func (c *Container[T]) ForEach(fn func(T)) {
	for _, item := range c.items {
		fn(item)
	}
}

func (c *Container[T]) Transform[U any](fn func(T) U) *Container[U] {
	result := &Container[U]{}
	for _, item := range c.items {
		result.Add(fn(item))
	}
	return result
}

func genericMethodsExample() {
	fmt.Println("\n=== 泛型方法示例 ===")

	// 创建整数容器
	intContainer := &Container[int]{}
	intContainer.Add(1)
	intContainer.Add(2)
	intContainer.Add(3)

	fmt.Printf("整数容器大小: %d\n", intContainer.Size())

	// 遍历容器
	fmt.Print("容器内容: ")
	intContainer.ForEach(func(item int) {
		fmt.Printf("%d ", item)
	})
	fmt.Println()

	// 转换容器类型
	stringContainer := intContainer.Transform(func(n int) string {
		return fmt.Sprintf("数字-%d", n)
	})

	fmt.Print("转换后的容器: ")
	stringContainer.ForEach(func(item string) {
		fmt.Printf("%s ", item)
	})
	fmt.Println()
}

func main() {
	fmt.Println("=== Go接口和泛型示例 ===")

	basicInterfaceExample()
	emptyInterfaceExample()
	interfaceCompositionExample()
	genericFunctionsExample()
	genericTypesExample()
	typeConstraintsExample()
	interfaceWithGenericsExample()
	genericMethodsExample()

	fmt.Println("\n所有接口和泛型示例完成!")
}
