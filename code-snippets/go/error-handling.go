// Go错误处理示例
package main

import (
	"errors"
	"fmt"
	"io"
	"os"
	"strconv"
	"time"
)

// 基础错误处理
func divide(a, b float64) (float64, error) {
	if b == 0 {
		return 0, errors.New("除数不能为零")
	}
	return a / b, nil
}

func basicErrorHandling() {
	fmt.Println("\n=== 基础错误处理 ===")

	// 正常情况
	result, err := divide(10, 2)
	if err != nil {
		fmt.Printf("错误: %v\n", err)
	} else {
		fmt.Printf("10 / 2 = %.2f\n", result)
	}

	// 错误情况
	result, err = divide(10, 0)
	if err != nil {
		fmt.Printf("错误: %v\n", err)
	} else {
		fmt.Printf("10 / 0 = %.2f\n", result)
	}
}

// 自定义错误类型
type ValidationError struct {
	Field   string
	Value   interface{}
	Message string
}

func (e *ValidationError) Error() string {
	return fmt.Sprintf("验证错误 - 字段: %s, 值: %v, 消息: %s", e.Field, e.Value, e.Message)
}

type User struct {
	Name  string
	Email string
	Age   int
}

func validateUser(user User) error {
	if user.Name == "" {
		return &ValidationError{
			Field:   "Name",
			Value:   user.Name,
			Message: "姓名不能为空",
		}
	}

	if user.Age < 0 || user.Age > 150 {
		return &ValidationError{
			Field:   "Age",
			Value:   user.Age,
			Message: "年龄必须在0-150之间",
		}
	}

	if user.Email == "" {
		return &ValidationError{
			Field:   "Email",
			Value:   user.Email,
			Message: "邮箱不能为空",
		}
	}

	return nil
}

func customErrorTypes() {
	fmt.Println("\n=== 自定义错误类型 ===")

	users := []User{
		{"张三", "zhangsan@example.com", 25},
		{"", "lisi@example.com", 30},
		{"王五", "", 35},
		{"赵六", "zhaoliu@example.com", -5},
	}

	for i, user := range users {
		err := validateUser(user)
		if err != nil {
			fmt.Printf("用户 %d 验证失败: %v\n", i+1, err)
			
			// 类型断言检查具体错误类型
			if validationErr, ok := err.(*ValidationError); ok {
				fmt.Printf("  详细信息 - 字段: %s, 值: %v\n", validationErr.Field, validationErr.Value)
			}
		} else {
			fmt.Printf("用户 %d 验证成功: %s\n", i+1, user.Name)
		}
	}
}

// 错误包装和展开
func processFile(filename string) error {
	file, err := os.Open(filename)
	if err != nil {
		return fmt.Errorf("无法打开文件 %s: %w", filename, err)
	}
	defer file.Close()

	// 模拟处理文件
	_, err = file.Read(make([]byte, 10))
	if err != nil && err != io.EOF {
		return fmt.Errorf("读取文件 %s 时出错: %w", filename, err)
	}

	return nil
}

func errorWrapping() {
	fmt.Println("\n=== 错误包装和展开 ===")

	err := processFile("nonexistent.txt")
	if err != nil {
		fmt.Printf("处理文件错误: %v\n", err)

		// 使用errors.Unwrap展开错误
		unwrapped := errors.Unwrap(err)
		if unwrapped != nil {
			fmt.Printf("原始错误: %v\n", unwrapped)
		}

		// 使用errors.Is检查错误类型
		if errors.Is(err, os.ErrNotExist) {
			fmt.Println("文件不存在")
		}
	}
}

// 多重错误处理
type MultiError struct {
	Errors []error
}

func (me *MultiError) Error() string {
	if len(me.Errors) == 0 {
		return "无错误"
	}
	
	if len(me.Errors) == 1 {
		return me.Errors[0].Error()
	}

	result := fmt.Sprintf("发生了 %d 个错误:", len(me.Errors))
	for i, err := range me.Errors {
		result += fmt.Sprintf("\n  %d. %v", i+1, err)
	}
	return result
}

func (me *MultiError) Add(err error) {
	if err != nil {
		me.Errors = append(me.Errors, err)
	}
}

func (me *MultiError) HasErrors() bool {
	return len(me.Errors) > 0
}

func validateMultipleUsers(users []User) error {
	var multiErr MultiError

	for i, user := range users {
		if err := validateUser(user); err != nil {
			wrappedErr := fmt.Errorf("用户 %d: %w", i+1, err)
			multiErr.Add(wrappedErr)
		}
	}

	if multiErr.HasErrors() {
		return &multiErr
	}
	return nil
}

func multipleErrorHandling() {
	fmt.Println("\n=== 多重错误处理 ===")

	users := []User{
		{"", "", -1},
		{"李四", "lisi@example.com", 30},
		{"", "wangwu@example.com", 200},
	}

	err := validateMultipleUsers(users)
	if err != nil {
		fmt.Printf("验证失败:\n%v\n", err)
	} else {
		fmt.Println("所有用户验证成功")
	}
}

// 错误恢复和重试
func unreliableOperation(attempt int) error {
	if attempt < 3 {
		return fmt.Errorf("操作失败 (尝试 %d)", attempt)
	}
	return nil
}

func retryOperation(maxAttempts int, operation func(int) error) error {
	var lastErr error
	
	for attempt := 1; attempt <= maxAttempts; attempt++ {
		err := operation(attempt)
		if err == nil {
			fmt.Printf("操作在第 %d 次尝试时成功\n", attempt)
			return nil
		}
		
		lastErr = err
		fmt.Printf("第 %d 次尝试失败: %v\n", attempt, err)
		
		if attempt < maxAttempts {
			waitTime := time.Duration(attempt) * time.Second
			fmt.Printf("等待 %v 后重试...\n", waitTime)
			time.Sleep(waitTime)
		}
	}
	
	return fmt.Errorf("所有 %d 次尝试都失败了，最后错误: %w", maxAttempts, lastErr)
}

func errorRecoveryAndRetry() {
	fmt.Println("\n=== 错误恢复和重试 ===")

	err := retryOperation(5, unreliableOperation)
	if err != nil {
		fmt.Printf("最终失败: %v\n", err)
	}
}

// 错误处理的最佳实践
type DatabaseError struct {
	Operation string
	Table     string
	Err       error
}

func (e *DatabaseError) Error() string {
	return fmt.Sprintf("数据库错误 - 操作: %s, 表: %s, 错误: %v", e.Operation, e.Table, e.Err)
}

func (e *DatabaseError) Unwrap() error {
	return e.Err
}

// 模拟数据库操作
func queryUser(id int) (*User, error) {
	if id <= 0 {
		return nil, &ValidationError{
			Field:   "ID",
			Value:   id,
			Message: "用户ID必须大于0",
		}
	}

	if id == 999 {
		return nil, &DatabaseError{
			Operation: "SELECT",
			Table:     "users",
			Err:       errors.New("连接超时"),
		}
	}

	// 模拟成功查询
	return &User{
		Name:  fmt.Sprintf("用户%d", id),
		Email: fmt.Sprintf("user%d@example.com", id),
		Age:   20 + id%50,
	}, nil
}

func handleUserQuery(id int) {
	user, err := queryUser(id)
	if err != nil {
		// 根据错误类型进行不同处理
		switch e := err.(type) {
		case *ValidationError:
			fmt.Printf("输入验证错误: %v\n", e)
		case *DatabaseError:
			fmt.Printf("数据库操作错误: %v\n", e)
			// 可以根据具体的数据库错误进行重试或其他处理
		default:
			fmt.Printf("未知错误: %v\n", e)
		}
		return
	}

	fmt.Printf("查询成功: %s (%s, %d岁)\n", user.Name, user.Email, user.Age)
}

func errorHandlingBestPractices() {
	fmt.Println("\n=== 错误处理最佳实践 ===")

	testIDs := []int{1, 0, 999, 5}
	
	for _, id := range testIDs {
		fmt.Printf("\n查询用户ID %d:\n", id)
		handleUserQuery(id)
	}
}

// 函数式错误处理
type Result[T any] struct {
	value T
	err   error
}

func NewResult[T any](value T, err error) Result[T] {
	return Result[T]{value: value, err: err}
}

func (r Result[T]) IsOk() bool {
	return r.err == nil
}

func (r Result[T]) IsErr() bool {
	return r.err != nil
}

func (r Result[T]) Unwrap() T {
	if r.err != nil {
		panic(fmt.Sprintf("尝试展开错误结果: %v", r.err))
	}
	return r.value
}

func (r Result[T]) UnwrapOr(defaultValue T) T {
	if r.err != nil {
		return defaultValue
	}
	return r.value
}

func (r Result[T]) Map[U any](fn func(T) U) Result[U] {
	if r.err != nil {
		return Result[U]{err: r.err}
	}
	return NewResult(fn(r.value), nil)
}

func (r Result[T]) AndThen[U any](fn func(T) Result[U]) Result[U] {
	if r.err != nil {
		return Result[U]{err: r.err}
	}
	return fn(r.value)
}

func parseAndDouble(s string) Result[int] {
	num, err := strconv.Atoi(s)
	if err != nil {
		return NewResult(0, fmt.Errorf("解析失败: %w", err))
	}
	return NewResult(num*2, nil)
}

func functionalErrorHandling() {
	fmt.Println("\n=== 函数式错误处理 ===")

	inputs := []string{"10", "abc", "25", "xyz"}

	for _, input := range inputs {
		result := parseAndDouble(input)
		
		if result.IsOk() {
			fmt.Printf("输入 '%s' -> 结果: %d\n", input, result.Unwrap())
		} else {
			fmt.Printf("输入 '%s' -> 错误: %v\n", input, result.err)
		}

		// 使用UnwrapOr提供默认值
		value := result.UnwrapOr(-1)
		fmt.Printf("  使用默认值: %d\n", value)
	}

	// 链式操作
	fmt.Println("\n链式操作示例:")
	chainResult := NewResult("5", nil).
		AndThen(func(s string) Result[int] {
			num, err := strconv.Atoi(s)
			return NewResult(num, err)
		}).
		Map(func(n int) int {
			return n * n
		}).
		Map(func(n int) string {
			return fmt.Sprintf("平方结果: %d", n)
		})

	if chainResult.IsOk() {
		fmt.Println(chainResult.Unwrap())
	} else {
		fmt.Printf("链式操作失败: %v\n", chainResult.err)
	}
}

func main() {
	fmt.Println("=== Go错误处理示例 ===")

	basicErrorHandling()
	customErrorTypes()
	errorWrapping()
	multipleErrorHandling()
	errorRecoveryAndRetry()
	errorHandlingBestPractices()
	functionalErrorHandling()

	fmt.Println("\n所有错误处理示例完成!")
}
