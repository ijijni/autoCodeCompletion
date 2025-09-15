<?php
/**
 * PHP面向对象编程和设计模式示例
 */

// 基础类和继承
abstract class Animal
{
    protected string $name;
    protected int $age;

    public function __construct(string $name, int $age)
    {
        $this->name = $name;
        $this->age = $age;
    }

    public function getName(): string
    {
        return $this->name;
    }

    public function getAge(): int
    {
        return $this->age;
    }

    abstract public function makeSound(): string;
    abstract public function getType(): string;

    public function getInfo(): string
    {
        return sprintf(
            "%s是一只%d岁的%s",
            $this->name,
            $this->age,
            $this->getType()
        );
    }
}

class Dog extends Animal
{
    private string $breed;

    public function __construct(string $name, int $age, string $breed)
    {
        parent::__construct($name, $age);
        $this->breed = $breed;
    }

    public function makeSound(): string
    {
        return "汪汪！";
    }

    public function getType(): string
    {
        return "狗";
    }

    public function getBreed(): string
    {
        return $this->breed;
    }

    public function fetch(): string
    {
        return "{$this->name}去捡球了！";
    }
}

class Cat extends Animal
{
    private bool $isIndoor;

    public function __construct(string $name, int $age, bool $isIndoor = true)
    {
        parent::__construct($name, $age);
        $this->isIndoor = $isIndoor;
    }

    public function makeSound(): string
    {
        return "喵喵！";
    }

    public function getType(): string
    {
        return "猫";
    }

    public function climb(): string
    {
        return "{$this->name}爬到了树上！";
    }
}

// 接口示例
interface Flyable
{
    public function fly(): string;
    public function getMaxAltitude(): int;
}

interface Swimmable
{
    public function swim(): string;
    public function getMaxDepth(): int;
}

class Bird extends Animal implements Flyable
{
    private int $wingspan;

    public function __construct(string $name, int $age, int $wingspan)
    {
        parent::__construct($name, $age);
        $this->wingspan = $wingspan;
    }

    public function makeSound(): string
    {
        return "啾啾！";
    }

    public function getType(): string
    {
        return "鸟";
    }

    public function fly(): string
    {
        return "{$this->name}展开{$this->wingspan}cm的翅膀飞翔！";
    }

    public function getMaxAltitude(): int
    {
        return $this->wingspan * 10; // 简单计算
    }
}

class Duck extends Animal implements Flyable, Swimmable
{
    public function makeSound(): string
    {
        return "嘎嘎！";
    }

    public function getType(): string
    {
        return "鸭子";
    }

    public function fly(): string
    {
        return "{$this->name}拍打翅膀飞起来了！";
    }

    public function getMaxAltitude(): int
    {
        return 100;
    }

    public function swim(): string
    {
        return "{$this->name}在水中游泳！";
    }

    public function getMaxDepth(): int
    {
        return 5;
    }
}

// Trait示例
trait Debuggable
{
    public function debug(): array
    {
        return [
            'class' => get_class($this),
            'properties' => get_object_vars($this)
        ];
    }

    public function dump(): void
    {
        var_dump($this->debug());
    }
}

trait Timestampable
{
    private DateTime $createdAt;
    private ?DateTime $updatedAt = null;

    public function initTimestamps(): void
    {
        $this->createdAt = new DateTime();
    }

    public function updateTimestamp(): void
    {
        $this->updatedAt = new DateTime();
    }

    public function getCreatedAt(): DateTime
    {
        return $this->createdAt;
    }

    public function getUpdatedAt(): ?DateTime
    {
        return $this->updatedAt;
    }
}

// 单例模式
class DatabaseConnection
{
    private static ?DatabaseConnection $instance = null;
    private string $connectionString;

    private function __construct()
    {
        $this->connectionString = "mysql:host=localhost;dbname=test";
        echo "数据库连接已创建\n";
    }

    public static function getInstance(): DatabaseConnection
    {
        if (self::$instance === null) {
            self::$instance = new self();
        }
        return self::$instance;
    }

    public function query(string $sql): string
    {
        return "执行SQL: {$sql}";
    }

    // 防止克隆
    private function __clone() {}

    // 防止反序列化
    public function __wakeup()
    {
        throw new Exception("不能反序列化单例");
    }
}

// 工厂模式
interface VehicleInterface
{
    public function start(): string;
    public function stop(): string;
    public function getType(): string;
}

class Car implements VehicleInterface
{
    public function start(): string
    {
        return "汽车启动了";
    }

    public function stop(): string
    {
        return "汽车停止了";
    }

    public function getType(): string
    {
        return "汽车";
    }
}

class Motorcycle implements VehicleInterface
{
    public function start(): string
    {
        return "摩托车启动了";
    }

    public function stop(): string
    {
        return "摩托车停止了";
    }

    public function getType(): string
    {
        return "摩托车";
    }
}

class VehicleFactory
{
    public static function create(string $type): VehicleInterface
    {
        switch (strtolower($type)) {
            case 'car':
                return new Car();
            case 'motorcycle':
                return new Motorcycle();
            default:
                throw new InvalidArgumentException("未知的车辆类型: {$type}");
        }
    }
}

// 观察者模式
interface ObserverInterface
{
    public function update(string $event, array $data): void;
}

interface SubjectInterface
{
    public function attach(ObserverInterface $observer): void;
    public function detach(ObserverInterface $observer): void;
    public function notify(string $event, array $data): void;
}

class NewsAgency implements SubjectInterface
{
    private array $observers = [];
    private array $news = [];

    public function attach(ObserverInterface $observer): void
    {
        $this->observers[] = $observer;
    }

    public function detach(ObserverInterface $observer): void
    {
        $key = array_search($observer, $this->observers, true);
        if ($key !== false) {
            unset($this->observers[$key]);
        }
    }

    public function notify(string $event, array $data): void
    {
        foreach ($this->observers as $observer) {
            $observer->update($event, $data);
        }
    }

    public function addNews(string $title, string $content): void
    {
        $news = [
            'title' => $title,
            'content' => $content,
            'timestamp' => date('Y-m-d H:i:s')
        ];

        $this->news[] = $news;
        $this->notify('news_added', $news);
    }
}

class EmailNotifier implements ObserverInterface
{
    private string $email;

    public function __construct(string $email)
    {
        $this->email = $email;
    }

    public function update(string $event, array $data): void
    {
        if ($event === 'news_added') {
            echo "邮件通知到 {$this->email}: 新闻《{$data['title']}》\n";
        }
    }
}

class SMSNotifier implements ObserverInterface
{
    private string $phoneNumber;

    public function __construct(string $phoneNumber)
    {
        $this->phoneNumber = $phoneNumber;
    }

    public function update(string $event, array $data): void
    {
        if ($event === 'news_added') {
            echo "短信通知到 {$this->phoneNumber}: 新闻《{$data['title']}》\n";
        }
    }
}

// 策略模式
interface PaymentStrategyInterface
{
    public function pay(float $amount): string;
}

class CreditCardPayment implements PaymentStrategyInterface
{
    private string $cardNumber;

    public function __construct(string $cardNumber)
    {
        $this->cardNumber = $cardNumber;
    }

    public function pay(float $amount): string
    {
        return "使用信用卡 {$this->cardNumber} 支付 ¥{$amount}";
    }
}

class PayPalPayment implements PaymentStrategyInterface
{
    private string $email;

    public function __construct(string $email)
    {
        $this->email = $email;
    }

    public function pay(float $amount): string
    {
        return "使用PayPal账户 {$this->email} 支付 ¥{$amount}";
    }
}

class WeChatPayment implements PaymentStrategyInterface
{
    private string $wechatId;

    public function __construct(string $wechatId)
    {
        $this->wechatId = $wechatId;
    }

    public function pay(float $amount): string
    {
        return "使用微信 {$this->wechatId} 支付 ¥{$amount}";
    }
}

class PaymentContext
{
    private PaymentStrategyInterface $strategy;

    public function setStrategy(PaymentStrategyInterface $strategy): void
    {
        $this->strategy = $strategy;
    }

    public function executePayment(float $amount): string
    {
        return $this->strategy->pay($amount);
    }
}

// 装饰器模式
interface CoffeeInterface
{
    public function getDescription(): string;
    public function getCost(): float;
}

class SimpleCoffee implements CoffeeInterface
{
    public function getDescription(): string
    {
        return "简单咖啡";
    }

    public function getCost(): float
    {
        return 10.0;
    }
}

abstract class CoffeeDecorator implements CoffeeInterface
{
    protected CoffeeInterface $coffee;

    public function __construct(CoffeeInterface $coffee)
    {
        $this->coffee = $coffee;
    }

    public function getDescription(): string
    {
        return $this->coffee->getDescription();
    }

    public function getCost(): float
    {
        return $this->coffee->getCost();
    }
}

class MilkDecorator extends CoffeeDecorator
{
    public function getDescription(): string
    {
        return $this->coffee->getDescription() . ", 牛奶";
    }

    public function getCost(): float
    {
        return $this->coffee->getCost() + 2.0;
    }
}

class SugarDecorator extends CoffeeDecorator
{
    public function getDescription(): string
    {
        return $this->coffee->getDescription() . ", 糖";
    }

    public function getCost(): float
    {
        return $this->coffee->getCost() + 1.0;
    }
}

class VanillaDecorator extends CoffeeDecorator
{
    public function getDescription(): string
    {
        return $this->coffee->getDescription() . ", 香草";
    }

    public function getCost(): float
    {
        return $this->coffee->getCost() + 3.0;
    }
}

// 使用Trait的实体类
class User
{
    use Debuggable, Timestampable;

    private int $id;
    private string $name;
    private string $email;

    public function __construct(int $id, string $name, string $email)
    {
        $this->id = $id;
        $this->name = $name;
        $this->email = $email;
        $this->initTimestamps();
    }

    public function getId(): int
    {
        return $this->id;
    }

    public function getName(): string
    {
        return $this->name;
    }

    public function setName(string $name): void
    {
        $this->name = $name;
        $this->updateTimestamp();
    }

    public function getEmail(): string
    {
        return $this->email;
    }

    public function setEmail(string $email): void
    {
        $this->email = $email;
        $this->updateTimestamp();
    }
}

// 演示函数
function demonstrateOOP(): void
{
    echo "=== PHP面向对象编程和设计模式示例 ===\n\n";

    // 1. 基础继承和多态
    echo "1. 基础继承和多态:\n";
    $animals = [
        new Dog("旺财", 3, "金毛"),
        new Cat("咪咪", 2, true),
        new Bird("小鸟", 1, 20),
        new Duck("唐老鸭", 4)
    ];

    foreach ($animals as $animal) {
        echo $animal->getInfo() . " - " . $animal->makeSound() . "\n";
    }

    // 2. 接口实现
    echo "\n2. 接口实现:\n";
    foreach ($animals as $animal) {
        if ($animal instanceof Flyable) {
            echo $animal->fly() . " (最大高度: {$animal->getMaxAltitude()}m)\n";
        }
        if ($animal instanceof Swimmable) {
            echo $animal->swim() . " (最大深度: {$animal->getMaxDepth()}m)\n";
        }
    }

    // 3. 单例模式
    echo "\n3. 单例模式:\n";
    $db1 = DatabaseConnection::getInstance();
    $db2 = DatabaseConnection::getInstance();
    echo "两个实例是否相同: " . ($db1 === $db2 ? "是" : "否") . "\n";
    echo $db1->query("SELECT * FROM users") . "\n";

    // 4. 工厂模式
    echo "\n4. 工厂模式:\n";
    $car = VehicleFactory::create('car');
    $motorcycle = VehicleFactory::create('motorcycle');
    echo $car->start() . "\n";
    echo $motorcycle->start() . "\n";

    // 5. 观察者模式
    echo "\n5. 观察者模式:\n";
    $newsAgency = new NewsAgency();
    $emailNotifier = new EmailNotifier("user@example.com");
    $smsNotifier = new SMSNotifier("13800138000");

    $newsAgency->attach($emailNotifier);
    $newsAgency->attach($smsNotifier);
    $newsAgency->addNews("重要新闻", "这是一条重要新闻的内容");

    // 6. 策略模式
    echo "\n6. 策略模式:\n";
    $paymentContext = new PaymentContext();

    $paymentContext->setStrategy(new CreditCardPayment("1234-5678-9012-3456"));
    echo $paymentContext->executePayment(100.0) . "\n";

    $paymentContext->setStrategy(new PayPalPayment("user@paypal.com"));
    echo $paymentContext->executePayment(50.0) . "\n";

    $paymentContext->setStrategy(new WeChatPayment("wxid_123456"));
    echo $paymentContext->executePayment(75.0) . "\n";

    // 7. 装饰器模式
    echo "\n7. 装饰器模式:\n";
    $coffee = new SimpleCoffee();
    echo $coffee->getDescription() . " - ¥" . $coffee->getCost() . "\n";

    $coffee = new MilkDecorator($coffee);
    echo $coffee->getDescription() . " - ¥" . $coffee->getCost() . "\n";

    $coffee = new SugarDecorator($coffee);
    echo $coffee->getDescription() . " - ¥" . $coffee->getCost() . "\n";

    $coffee = new VanillaDecorator($coffee);
    echo $coffee->getDescription() . " - ¥" . $coffee->getCost() . "\n";

    // 8. Trait使用
    echo "\n8. Trait使用:\n";
    $user = new User(1, "张三", "zhangsan@example.com");
    echo "用户创建时间: " . $user->getCreatedAt()->format('Y-m-d H:i:s') . "\n";

    sleep(1);
    $user->setName("李四");
    echo "用户更新时间: " . $user->getUpdatedAt()->format('Y-m-d H:i:s') . "\n";

    echo "\n用户调试信息:\n";
    print_r($user->debug());
}

// 运行演示
demonstrateOOP();

?>
