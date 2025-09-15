<?php
/**
 * PHP现代特性示例 (PHP 8.0+)
 */

declare(strict_types=1);

// 枚举 (PHP 8.1+)
enum Status: string
{
    case PENDING = 'pending';
    case APPROVED = 'approved';
    case REJECTED = 'rejected';

    public function getLabel(): string
    {
        return match($this) {
            self::PENDING => '待处理',
            self::APPROVED => '已批准',
            self::REJECTED => '已拒绝',
        };
    }

    public function canTransitionTo(Status $newStatus): bool
    {
        return match([$this, $newStatus]) {
            [self::PENDING, self::APPROVED] => true,
            [self::PENDING, self::REJECTED] => true,
            [self::APPROVED, self::REJECTED] => false,
            [self::REJECTED, self::APPROVED] => false,
            default => false,
        };
    }
}

enum Priority: int
{
    case LOW = 1;
    case MEDIUM = 2;
    case HIGH = 3;
    case URGENT = 4;

    public function getColor(): string
    {
        return match($this) {
            self::LOW => 'green',
            self::MEDIUM => 'yellow',
            self::HIGH => 'orange',
            self::URGENT => 'red',
        };
    }
}

// 联合类型和属性提升
class Task
{
    public function __construct(
        public readonly int $id,
        public string $title,
        public string $description,
        public Status $status = Status::PENDING,
        public Priority $priority = Priority::MEDIUM,
        public ?DateTime $dueDate = null,
        public array $tags = [],
        public int|float $estimatedHours = 0
    ) {}

    public function updateStatus(Status $newStatus): bool
    {
        if (!$this->status->canTransitionTo($newStatus)) {
            throw new InvalidArgumentException(
                "无法从 {$this->status->getLabel()} 转换到 {$newStatus->getLabel()}"
            );
        }

        $this->status = $newStatus;
        return true;
    }

    public function isOverdue(): bool
    {
        return $this->dueDate !== null && $this->dueDate < new DateTime();
    }

    public function getStatusInfo(): array
    {
        return [
            'status' => $this->status->value,
            'label' => $this->status->getLabel(),
            'priority' => $this->priority->value,
            'priority_color' => $this->priority->getColor(),
            'is_overdue' => $this->isOverdue()
        ];
    }
}

// 属性 (Attributes)
#[Attribute]
class Route
{
    public function __construct(
        public string $path,
        public string $method = 'GET'
    ) {}
}

#[Attribute]
class Middleware
{
    public function __construct(
        public array $middlewares
    ) {}
}

#[Attribute]
class Validate
{
    public function __construct(
        public array $rules
    ) {}
}

class UserController
{
    #[Route('/users', 'GET')]
    #[Middleware(['auth', 'logging'])]
    public function index(): array
    {
        return ['message' => '获取用户列表'];
    }

    #[Route('/users', 'POST')]
    #[Middleware(['auth'])]
    #[Validate(['name' => 'required|string', 'email' => 'required|email'])]
    public function store(array $data): array
    {
        return ['message' => '创建用户', 'data' => $data];
    }

    #[Route('/users/{id}', 'PUT')]
    #[Middleware(['auth', 'owner'])]
    public function update(int $id, array $data): array
    {
        return ['message' => "更新用户 {$id}", 'data' => $data];
    }
}

// 命名参数和可变参数
class Calculator
{
    public function calculate(
        float $a,
        float $b,
        string $operation = 'add',
        bool $round = false,
        int $precision = 2
    ): float {
        $result = match($operation) {
            'add' => $a + $b,
            'subtract' => $a - $b,
            'multiply' => $a * $b,
            'divide' => $b !== 0.0 ? $a / $b : throw new DivisionByZeroError(),
            default => throw new InvalidArgumentException("不支持的操作: {$operation}")
        };

        return $round ? round($result, $precision) : $result;
    }

    public function sum(float ...$numbers): float
    {
        return array_sum($numbers);
    }

    public function average(float ...$numbers): float
    {
        if (empty($numbers)) {
            throw new InvalidArgumentException("至少需要一个数字");
        }
        return $this->sum(...$numbers) / count($numbers);
    }
}

// Null安全操作符
class User
{
    public function __construct(
        public int $id,
        public string $name,
        public ?string $email = null,
        public ?Profile $profile = null
    ) {}
}

class Profile
{
    public function __construct(
        public string $bio,
        public ?string $website = null,
        public ?Address $address = null
    ) {}
}

class Address
{
    public function __construct(
        public string $street,
        public string $city,
        public string $country
    ) {}
}

class UserService
{
    public function getUserWebsite(User $user): ?string
    {
        // Null安全操作符
        return $user->profile?->website;
    }

    public function getUserCity(User $user): ?string
    {
        return $user->profile?->address?->city;
    }

    public function getUserInfo(User $user): array
    {
        return [
            'id' => $user->id,
            'name' => $user->name,
            'email' => $user->email ?? '未设置',
            'bio' => $user->profile?->bio ?? '无个人简介',
            'website' => $this->getUserWebsite($user) ?? '无网站',
            'city' => $this->getUserCity($user) ?? '未知城市'
        ];
    }
}

// 匿名类和闭包
class EventManager
{
    private array $listeners = [];

    public function addEventListener(string $event, callable $listener): void
    {
        $this->listeners[$event][] = $listener;
    }

    public function dispatchEvent(string $event, array $data = []): void
    {
        foreach ($this->listeners[$event] ?? [] as $listener) {
            $listener($data);
        }
    }

    public function createLogger(string $prefix): callable
    {
        return function(array $data) use ($prefix): void {
            echo "[{$prefix}] " . json_encode($data) . "\n";
        };
    }

    public function createValidator(array $rules): object
    {
        return new class($rules) {
            public function __construct(private array $rules) {}

            public function validate(array $data): bool
            {
                foreach ($this->rules as $field => $rule) {
                    if ($rule === 'required' && !isset($data[$field])) {
                        return false;
                    }
                }
                return true;
            }

            public function getRules(): array
            {
                return $this->rules;
            }
        };
    }
}

// 生成器和迭代器
class DataProcessor
{
    public function processLargeDataset(array $data): \Generator
    {
        foreach ($data as $index => $item) {
            // 模拟处理时间
            usleep(1000);
            
            yield $index => [
                'original' => $item,
                'processed' => strtoupper($item),
                'timestamp' => time()
            ];
        }
    }

    public function fibonacci(int $limit): \Generator
    {
        $a = 0;
        $b = 1;
        
        yield $a;
        yield $b;
        
        while ($b < $limit) {
            $next = $a + $b;
            if ($next > $limit) break;
            
            yield $next;
            $a = $b;
            $b = $next;
        }
    }

    public function readFileLines(string $filename): \Generator
    {
        $file = fopen($filename, 'r');
        if (!$file) {
            throw new RuntimeException("无法打开文件: {$filename}");
        }

        try {
            while (($line = fgets($file)) !== false) {
                yield trim($line);
            }
        } finally {
            fclose($file);
        }
    }
}

// 类型声明和返回类型
class TypedClass
{
    public function processString(string $input): string
    {
        return strtoupper(trim($input));
    }

    public function processArray(array $items): array
    {
        return array_map('strtolower', $items);
    }

    public function processNumbers(int|float ...$numbers): array
    {
        return [
            'sum' => array_sum($numbers),
            'average' => array_sum($numbers) / count($numbers),
            'max' => max($numbers),
            'min' => min($numbers)
        ];
    }

    public function processCallback(callable $callback, mixed $data): mixed
    {
        return $callback($data);
    }

    public function createUser(string $name, string $email): User
    {
        return new User(
            id: random_int(1, 1000),
            name: $name,
            email: $email
        );
    }
}

// 反射和属性读取
class AttributeReader
{
    public function getRouteInfo(string $className): array
    {
        $reflection = new ReflectionClass($className);
        $routes = [];

        foreach ($reflection->getMethods() as $method) {
            $attributes = $method->getAttributes(Route::class);
            
            foreach ($attributes as $attribute) {
                $route = $attribute->newInstance();
                $middlewares = [];
                $validation = [];

                // 获取中间件
                $middlewareAttrs = $method->getAttributes(Middleware::class);
                foreach ($middlewareAttrs as $attr) {
                    $middleware = $attr->newInstance();
                    $middlewares = array_merge($middlewares, $middleware->middlewares);
                }

                // 获取验证规则
                $validateAttrs = $method->getAttributes(Validate::class);
                foreach ($validateAttrs as $attr) {
                    $validate = $attr->newInstance();
                    $validation = array_merge($validation, $validate->rules);
                }

                $routes[] = [
                    'method' => $route->method,
                    'path' => $route->path,
                    'handler' => $method->getName(),
                    'middlewares' => $middlewares,
                    'validation' => $validation
                ];
            }
        }

        return $routes;
    }
}

// 演示函数
function demonstrateModernFeatures(): void
{
    echo "=== PHP现代特性示例 ===\n\n";

    // 1. 枚举使用
    echo "1. 枚举使用:\n";
    $task = new Task(
        id: 1,
        title: "完成项目文档",
        description: "编写项目的技术文档",
        status: Status::PENDING,
        priority: Priority::HIGH,
        dueDate: new DateTime('+3 days'),
        tags: ['文档', '重要'],
        estimatedHours: 8.5
    );

    echo "任务状态: " . $task->status->getLabel() . "\n";
    echo "优先级颜色: " . $task->priority->getColor() . "\n";
    print_r($task->getStatusInfo());

    try {
        $task->updateStatus(Status::APPROVED);
        echo "状态更新成功: " . $task->status->getLabel() . "\n";
    } catch (InvalidArgumentException $e) {
        echo "状态更新失败: " . $e->getMessage() . "\n";
    }

    // 2. 命名参数
    echo "\n2. 命名参数:\n";
    $calculator = new Calculator();
    
    $result1 = $calculator->calculate(a: 10.5, b: 3.2, operation: 'multiply', round: true);
    echo "10.5 * 3.2 (四舍五入) = {$result1}\n";

    $result2 = $calculator->calculate(15.7, 4.3, round: true, precision: 1);
    echo "15.7 + 4.3 (四舍五入到1位) = {$result2}\n";

    $sum = $calculator->sum(1.5, 2.3, 3.7, 4.1, 5.9);
    echo "数字求和: {$sum}\n";

    $average = $calculator->average(10, 20, 30, 40, 50);
    echo "平均值: {$average}\n";

    // 3. Null安全操作符
    echo "\n3. Null安全操作符:\n";
    $userService = new UserService();

    $user1 = new User(1, "张三", "zhangsan@example.com");
    $user2 = new User(
        2, 
        "李四", 
        "lisi@example.com",
        new Profile(
            "我是一名开发者",
            "https://example.com",
            new Address("中山路123号", "北京", "中国")
        )
    );

    echo "用户1信息:\n";
    print_r($userService->getUserInfo($user1));

    echo "用户2信息:\n";
    print_r($userService->getUserInfo($user2));

    // 4. 事件管理器和匿名类
    echo "\n4. 事件管理器和匿名类:\n";
    $eventManager = new EventManager();

    $logger = $eventManager->createLogger("APP");
    $eventManager->addEventListener('user.created', $logger);

    $validator = $eventManager->createValidator(['name' => 'required', 'email' => 'required']);
    echo "验证规则: " . json_encode($validator->getRules()) . "\n";

    $eventManager->dispatchEvent('user.created', ['id' => 1, 'name' => '新用户']);

    // 5. 生成器
    echo "\n5. 生成器:\n";
    $processor = new DataProcessor();

    echo "斐波那契数列 (限制100):\n";
    foreach ($processor->fibonacci(100) as $number) {
        echo $number . " ";
    }
    echo "\n";

    echo "处理数据集:\n";
    $data = ['apple', 'banana', 'cherry'];
    foreach ($processor->processLargeDataset($data) as $index => $result) {
        echo "索引 {$index}: {$result['original']} -> {$result['processed']}\n";
    }

    // 6. 类型声明
    echo "\n6. 类型声明:\n";
    $typedClass = new TypedClass();

    echo "处理字符串: " . $typedClass->processString("  hello world  ") . "\n";
    print_r($typedClass->processArray(['APPLE', 'BANANA', 'CHERRY']));
    print_r($typedClass->processNumbers(1, 2.5, 3, 4.7, 5));

    $user = $typedClass->createUser(name: "王五", email: "wangwu@example.com");
    echo "创建用户: {$user->name} ({$user->email})\n";

    // 7. 属性读取
    echo "\n7. 属性读取:\n";
    $attributeReader = new AttributeReader();
    $routes = $attributeReader->getRouteInfo(UserController::class);

    echo "控制器路由信息:\n";
    foreach ($routes as $route) {
        echo "  {$route['method']} {$route['path']} -> {$route['handler']}\n";
        if (!empty($route['middlewares'])) {
            echo "    中间件: " . implode(', ', $route['middlewares']) . "\n";
        }
        if (!empty($route['validation'])) {
            echo "    验证: " . json_encode($route['validation']) . "\n";
        }
    }
}

// 运行演示
demonstrateModernFeatures();

?>
