<?php
/**
 * PHP测试和代码质量示例
 */

// 简单的测试框架
abstract class TestCase
{
    protected array $assertions = [];
    protected int $passed = 0;
    protected int $failed = 0;

    abstract public function setUp(): void;
    abstract public function tearDown(): void;

    public function run(): void
    {
        echo "运行测试: " . get_class($this) . "\n";
        
        $methods = get_class_methods($this);
        $testMethods = array_filter($methods, fn($method) => str_starts_with($method, 'test'));
        
        foreach ($testMethods as $method) {
            $this->setUp();
            
            try {
                echo "  执行: {$method}";
                $this->$method();
                echo " ✓\n";
                $this->passed++;
            } catch (AssertionException $e) {
                echo " ✗ - {$e->getMessage()}\n";
                $this->failed++;
            } catch (Exception $e) {
                echo " ✗ - 异常: {$e->getMessage()}\n";
                $this->failed++;
            }
            
            $this->tearDown();
        }
        
        echo "结果: {$this->passed} 通过, {$this->failed} 失败\n\n";
    }

    // 断言方法
    protected function assertTrue($condition, string $message = ''): void
    {
        if (!$condition) {
            throw new AssertionException($message ?: '断言失败: 期望为true');
        }
    }

    protected function assertFalse($condition, string $message = ''): void
    {
        if ($condition) {
            throw new AssertionException($message ?: '断言失败: 期望为false');
        }
    }

    protected function assertEquals($expected, $actual, string $message = ''): void
    {
        if ($expected !== $actual) {
            $message = $message ?: "断言失败: 期望 '{$expected}', 实际 '{$actual}'";
            throw new AssertionException($message);
        }
    }

    protected function assertNotEquals($expected, $actual, string $message = ''): void
    {
        if ($expected === $actual) {
            $message = $message ?: "断言失败: 不应该等于 '{$expected}'";
            throw new AssertionException($message);
        }
    }

    protected function assertNull($value, string $message = ''): void
    {
        if ($value !== null) {
            throw new AssertionException($message ?: '断言失败: 期望为null');
        }
    }

    protected function assertNotNull($value, string $message = ''): void
    {
        if ($value === null) {
            throw new AssertionException($message ?: '断言失败: 不应该为null');
        }
    }

    protected function assertInstanceOf(string $expected, $actual, string $message = ''): void
    {
        if (!($actual instanceof $expected)) {
            $actualType = is_object($actual) ? get_class($actual) : gettype($actual);
            $message = $message ?: "断言失败: 期望 {$expected} 实例, 实际 {$actualType}";
            throw new AssertionException($message);
        }
    }

    protected function assertArrayHasKey($key, array $array, string $message = ''): void
    {
        if (!array_key_exists($key, $array)) {
            throw new AssertionException($message ?: "断言失败: 数组中不存在键 '{$key}'");
        }
    }

    protected function assertCount(int $expected, $actual, string $message = ''): void
    {
        $actualCount = is_countable($actual) ? count($actual) : 0;
        if ($expected !== $actualCount) {
            $message = $message ?: "断言失败: 期望数量 {$expected}, 实际 {$actualCount}";
            throw new AssertionException($message);
        }
    }

    protected function expectException(string $exceptionClass, callable $callback): void
    {
        try {
            $callback();
            throw new AssertionException("期望抛出异常 {$exceptionClass}, 但没有异常被抛出");
        } catch (Exception $e) {
            if (!($e instanceof $exceptionClass)) {
                throw new AssertionException("期望异常 {$exceptionClass}, 实际 " . get_class($e));
            }
        }
    }
}

class AssertionException extends Exception {}

// 被测试的类
class Calculator
{
    public function add(float $a, float $b): float
    {
        return $a + $b;
    }

    public function subtract(float $a, float $b): float
    {
        return $a - $b;
    }

    public function multiply(float $a, float $b): float
    {
        return $a * $b;
    }

    public function divide(float $a, float $b): float
    {
        if ($b === 0.0) {
            throw new InvalidArgumentException('除数不能为零');
        }
        return $a / $b;
    }

    public function power(float $base, float $exponent): float
    {
        return pow($base, $exponent);
    }

    public function factorial(int $n): int
    {
        if ($n < 0) {
            throw new InvalidArgumentException('阶乘的参数不能为负数');
        }
        
        if ($n === 0 || $n === 1) {
            return 1;
        }
        
        $result = 1;
        for ($i = 2; $i <= $n; $i++) {
            $result *= $i;
        }
        
        return $result;
    }
}

class StringHelper
{
    public static function reverse(string $str): string
    {
        return strrev($str);
    }

    public static function isPalindrome(string $str): bool
    {
        $cleaned = strtolower(preg_replace('/[^a-zA-Z0-9]/', '', $str));
        return $cleaned === strrev($cleaned);
    }

    public static function wordCount(string $str): int
    {
        return str_word_count($str);
    }

    public static function truncate(string $str, int $length, string $suffix = '...'): string
    {
        if (strlen($str) <= $length) {
            return $str;
        }
        
        return substr($str, 0, $length - strlen($suffix)) . $suffix;
    }
}

class UserService
{
    private array $users = [];

    public function createUser(string $name, string $email): array
    {
        if (empty($name) || empty($email)) {
            throw new InvalidArgumentException('姓名和邮箱不能为空');
        }

        if (!filter_var($email, FILTER_VALIDATE_EMAIL)) {
            throw new InvalidArgumentException('邮箱格式无效');
        }

        $user = [
            'id' => count($this->users) + 1,
            'name' => $name,
            'email' => $email,
            'created_at' => date('Y-m-d H:i:s')
        ];

        $this->users[] = $user;
        return $user;
    }

    public function getUserById(int $id): ?array
    {
        foreach ($this->users as $user) {
            if ($user['id'] === $id) {
                return $user;
            }
        }
        return null;
    }

    public function getAllUsers(): array
    {
        return $this->users;
    }

    public function updateUser(int $id, array $data): bool
    {
        foreach ($this->users as &$user) {
            if ($user['id'] === $id) {
                $user = array_merge($user, $data);
                return true;
            }
        }
        return false;
    }

    public function deleteUser(int $id): bool
    {
        foreach ($this->users as $index => $user) {
            if ($user['id'] === $id) {
                unset($this->users[$index]);
                $this->users = array_values($this->users);
                return true;
            }
        }
        return false;
    }
}

// 测试类
class CalculatorTest extends TestCase
{
    private Calculator $calculator;

    public function setUp(): void
    {
        $this->calculator = new Calculator();
    }

    public function tearDown(): void
    {
        // 清理资源
    }

    public function testAdd(): void
    {
        $this->assertEquals(5.0, $this->calculator->add(2.0, 3.0));
        $this->assertEquals(0.0, $this->calculator->add(-1.0, 1.0));
        $this->assertEquals(-5.0, $this->calculator->add(-2.0, -3.0));
    }

    public function testSubtract(): void
    {
        $this->assertEquals(2.0, $this->calculator->subtract(5.0, 3.0));
        $this->assertEquals(-2.0, $this->calculator->subtract(3.0, 5.0));
        $this->assertEquals(0.0, $this->calculator->subtract(5.0, 5.0));
    }

    public function testMultiply(): void
    {
        $this->assertEquals(15.0, $this->calculator->multiply(3.0, 5.0));
        $this->assertEquals(0.0, $this->calculator->multiply(0.0, 5.0));
        $this->assertEquals(-15.0, $this->calculator->multiply(-3.0, 5.0));
    }

    public function testDivide(): void
    {
        $this->assertEquals(2.0, $this->calculator->divide(10.0, 5.0));
        $this->assertEquals(0.5, $this->calculator->divide(1.0, 2.0));
    }

    public function testDivideByZero(): void
    {
        $this->expectException(InvalidArgumentException::class, function() {
            $this->calculator->divide(10.0, 0.0);
        });
    }

    public function testPower(): void
    {
        $this->assertEquals(8.0, $this->calculator->power(2.0, 3.0));
        $this->assertEquals(1.0, $this->calculator->power(5.0, 0.0));
        $this->assertEquals(25.0, $this->calculator->power(5.0, 2.0));
    }

    public function testFactorial(): void
    {
        $this->assertEquals(1, $this->calculator->factorial(0));
        $this->assertEquals(1, $this->calculator->factorial(1));
        $this->assertEquals(120, $this->calculator->factorial(5));
    }

    public function testFactorialNegative(): void
    {
        $this->expectException(InvalidArgumentException::class, function() {
            $this->calculator->factorial(-1);
        });
    }
}

class StringHelperTest extends TestCase
{
    public function setUp(): void {}
    public function tearDown(): void {}

    public function testReverse(): void
    {
        $this->assertEquals('olleh', StringHelper::reverse('hello'));
        $this->assertEquals('', StringHelper::reverse(''));
        $this->assertEquals('a', StringHelper::reverse('a'));
    }

    public function testIsPalindrome(): void
    {
        $this->assertTrue(StringHelper::isPalindrome('racecar'));
        $this->assertTrue(StringHelper::isPalindrome('A man a plan a canal Panama'));
        $this->assertFalse(StringHelper::isPalindrome('hello'));
        $this->assertTrue(StringHelper::isPalindrome(''));
    }

    public function testWordCount(): void
    {
        $this->assertEquals(3, StringHelper::wordCount('hello world test'));
        $this->assertEquals(0, StringHelper::wordCount(''));
        $this->assertEquals(1, StringHelper::wordCount('hello'));
    }

    public function testTruncate(): void
    {
        $this->assertEquals('hello...', StringHelper::truncate('hello world', 8));
        $this->assertEquals('hello world', StringHelper::truncate('hello world', 20));
        $this->assertEquals('hel***', StringHelper::truncate('hello world', 6, '***'));
    }
}

class UserServiceTest extends TestCase
{
    private UserService $userService;

    public function setUp(): void
    {
        $this->userService = new UserService();
    }

    public function tearDown(): void {}

    public function testCreateUser(): void
    {
        $user = $this->userService->createUser('张三', 'zhangsan@example.com');
        
        $this->assertEquals(1, $user['id']);
        $this->assertEquals('张三', $user['name']);
        $this->assertEquals('zhangsan@example.com', $user['email']);
        $this->assertNotNull($user['created_at']);
    }

    public function testCreateUserWithEmptyName(): void
    {
        $this->expectException(InvalidArgumentException::class, function() {
            $this->userService->createUser('', 'test@example.com');
        });
    }

    public function testCreateUserWithInvalidEmail(): void
    {
        $this->expectException(InvalidArgumentException::class, function() {
            $this->userService->createUser('测试', 'invalid-email');
        });
    }

    public function testGetUserById(): void
    {
        $user = $this->userService->createUser('李四', 'lisi@example.com');
        $foundUser = $this->userService->getUserById($user['id']);
        
        $this->assertEquals($user, $foundUser);
    }

    public function testGetUserByIdNotFound(): void
    {
        $this->assertNull($this->userService->getUserById(999));
    }

    public function testGetAllUsers(): void
    {
        $this->userService->createUser('用户1', 'user1@example.com');
        $this->userService->createUser('用户2', 'user2@example.com');
        
        $users = $this->userService->getAllUsers();
        $this->assertCount(2, $users);
    }

    public function testUpdateUser(): void
    {
        $user = $this->userService->createUser('原名', 'original@example.com');
        $updated = $this->userService->updateUser($user['id'], ['name' => '新名字']);
        
        $this->assertTrue($updated);
        
        $updatedUser = $this->userService->getUserById($user['id']);
        $this->assertEquals('新名字', $updatedUser['name']);
    }

    public function testDeleteUser(): void
    {
        $user = $this->userService->createUser('待删除', 'delete@example.com');
        $deleted = $this->userService->deleteUser($user['id']);
        
        $this->assertTrue($deleted);
        $this->assertNull($this->userService->getUserById($user['id']));
    }
}

// 性能测试
class PerformanceTest
{
    public function benchmarkStringOperations(): void
    {
        echo "=== 字符串操作性能测试 ===\n";
        
        $iterations = 10000;
        $testString = str_repeat('Hello World! ', 100);
        
        // 测试字符串反转
        $start = microtime(true);
        for ($i = 0; $i < $iterations; $i++) {
            StringHelper::reverse($testString);
        }
        $end = microtime(true);
        echo "字符串反转 ({$iterations} 次): " . round(($end - $start) * 1000, 2) . "ms\n";
        
        // 测试回文检测
        $start = microtime(true);
        for ($i = 0; $i < $iterations; $i++) {
            StringHelper::isPalindrome($testString);
        }
        $end = microtime(true);
        echo "回文检测 ({$iterations} 次): " . round(($end - $start) * 1000, 2) . "ms\n";
    }

    public function benchmarkCalculatorOperations(): void
    {
        echo "\n=== 计算器操作性能测试 ===\n";
        
        $calculator = new Calculator();
        $iterations = 100000;
        
        // 测试加法
        $start = microtime(true);
        for ($i = 0; $i < $iterations; $i++) {
            $calculator->add(rand(1, 100), rand(1, 100));
        }
        $end = microtime(true);
        echo "加法运算 ({$iterations} 次): " . round(($end - $start) * 1000, 2) . "ms\n";
        
        // 测试阶乘
        $start = microtime(true);
        for ($i = 0; $i < 1000; $i++) {
            $calculator->factorial(10);
        }
        $end = microtime(true);
        echo "阶乘运算 (1000 次): " . round(($end - $start) * 1000, 2) . "ms\n";
    }
}

// 代码覆盖率分析器（简化版）
class CodeCoverage
{
    private array $executedLines = [];
    private array $allLines = [];

    public function start(string $file): void
    {
        $this->allLines[$file] = count(file($file));
        $this->executedLines[$file] = [];
    }

    public function markExecuted(string $file, int $line): void
    {
        $this->executedLines[$file][$line] = true;
    }

    public function getReport(): array
    {
        $report = [];
        foreach ($this->allLines as $file => $totalLines) {
            $executedCount = count($this->executedLines[$file] ?? []);
            $coverage = $totalLines > 0 ? ($executedCount / $totalLines) * 100 : 0;
            
            $report[$file] = [
                'total_lines' => $totalLines,
                'executed_lines' => $executedCount,
                'coverage_percentage' => round($coverage, 2)
            ];
        }
        return $report;
    }
}

// 测试套件运行器
class TestSuite
{
    private array $testClasses = [];

    public function addTest(string $testClass): void
    {
        $this->testClasses[] = $testClass;
    }

    public function run(): void
    {
        echo "=== 运行测试套件 ===\n\n";
        
        $totalPassed = 0;
        $totalFailed = 0;
        
        foreach ($this->testClasses as $testClass) {
            $test = new $testClass();
            $test->run();
            
            $totalPassed += $test->passed;
            $totalFailed += $test->failed;
        }
        
        echo "=== 测试套件总结 ===\n";
        echo "总通过: {$totalPassed}\n";
        echo "总失败: {$totalFailed}\n";
        echo "成功率: " . round(($totalPassed / ($totalPassed + $totalFailed)) * 100, 2) . "%\n\n";
    }
}

// 运行所有测试
echo "=== PHP测试和代码质量示例 ===\n\n";

// 运行单元测试
$testSuite = new TestSuite();
$testSuite->addTest(CalculatorTest::class);
$testSuite->addTest(StringHelperTest::class);
$testSuite->addTest(UserServiceTest::class);
$testSuite->run();

// 运行性能测试
$performanceTest = new PerformanceTest();
$performanceTest->benchmarkStringOperations();
$performanceTest->benchmarkCalculatorOperations();

// 代码覆盖率示例
echo "\n=== 代码覆盖率示例 ===\n";
$coverage = new CodeCoverage();
$coverage->start(__FILE__);
$coverage->markExecuted(__FILE__, 100);
$coverage->markExecuted(__FILE__, 150);
$coverage->markExecuted(__FILE__, 200);

$report = $coverage->getReport();
foreach ($report as $file => $data) {
    echo "文件: " . basename($file) . "\n";
    echo "  总行数: {$data['total_lines']}\n";
    echo "  执行行数: {$data['executed_lines']}\n";
    echo "  覆盖率: {$data['coverage_percentage']}%\n";
}

echo "\nPHP测试和代码质量示例完成!\n";

?>
