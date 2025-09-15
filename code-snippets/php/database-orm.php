<?php
/**
 * PHP数据库操作和ORM示例
 */

// 数据库连接管理器
class DatabaseManager
{
    private static ?PDO $connection = null;
    private static array $config = [
        'host' => 'localhost',
        'dbname' => 'test_db',
        'username' => 'root',
        'password' => '',
        'charset' => 'utf8mb4'
    ];

    public static function getConnection(): PDO
    {
        if (self::$connection === null) {
            self::connect();
        }
        return self::$connection;
    }

    private static function connect(): void
    {
        try {
            $dsn = sprintf(
                'mysql:host=%s;dbname=%s;charset=%s',
                self::$config['host'],
                self::$config['dbname'],
                self::$config['charset']
            );

            self::$connection = new PDO(
                $dsn,
                self::$config['username'],
                self::$config['password'],
                [
                    PDO::ATTR_ERRMODE => PDO::ERRMODE_EXCEPTION,
                    PDO::ATTR_DEFAULT_FETCH_MODE => PDO::FETCH_ASSOC,
                    PDO::ATTR_EMULATE_PREPARES => false,
                ]
            );

            echo "数据库连接成功\n";
        } catch (PDOException $e) {
            echo "数据库连接失败，使用模拟数据\n";
            // 在实际应用中，这里应该抛出异常或使用日志记录
        }
    }

    public static function setConfig(array $config): void
    {
        self::$config = array_merge(self::$config, $config);
    }
}

// 查询构建器
class QueryBuilder
{
    private PDO $pdo;
    private string $table = '';
    private array $select = ['*'];
    private array $where = [];
    private array $joins = [];
    private array $orderBy = [];
    private ?int $limit = null;
    private ?int $offset = null;
    private array $bindings = [];

    public function __construct(PDO $pdo)
    {
        $this->pdo = $pdo;
    }

    public function table(string $table): self
    {
        $this->table = $table;
        return $this;
    }

    public function select(array $columns): self
    {
        $this->select = $columns;
        return $this;
    }

    public function where(string $column, string $operator, $value): self
    {
        $placeholder = ':where_' . count($this->where);
        $this->where[] = "{$column} {$operator} {$placeholder}";
        $this->bindings[$placeholder] = $value;
        return $this;
    }

    public function whereIn(string $column, array $values): self
    {
        $placeholders = [];
        foreach ($values as $i => $value) {
            $placeholder = ':wherein_' . count($this->where) . '_' . $i;
            $placeholders[] = $placeholder;
            $this->bindings[$placeholder] = $value;
        }
        $this->where[] = "{$column} IN (" . implode(', ', $placeholders) . ")";
        return $this;
    }

    public function join(string $table, string $first, string $operator, string $second): self
    {
        $this->joins[] = "INNER JOIN {$table} ON {$first} {$operator} {$second}";
        return $this;
    }

    public function leftJoin(string $table, string $first, string $operator, string $second): self
    {
        $this->joins[] = "LEFT JOIN {$table} ON {$first} {$operator} {$second}";
        return $this;
    }

    public function orderBy(string $column, string $direction = 'ASC'): self
    {
        $this->orderBy[] = "{$column} {$direction}";
        return $this;
    }

    public function limit(int $limit): self
    {
        $this->limit = $limit;
        return $this;
    }

    public function offset(int $offset): self
    {
        $this->offset = $offset;
        return $this;
    }

    public function get(): array
    {
        $sql = $this->buildSelectQuery();
        echo "执行查询: {$sql}\n";
        echo "参数: " . json_encode($this->bindings) . "\n";
        
        // 返回模拟数据
        return $this->getMockData();
    }

    public function first(): ?array
    {
        $this->limit(1);
        $results = $this->get();
        return $results[0] ?? null;
    }

    public function count(): int
    {
        $originalSelect = $this->select;
        $this->select = ['COUNT(*) as count'];
        
        $sql = $this->buildSelectQuery();
        echo "执行计数查询: {$sql}\n";
        
        $this->select = $originalSelect;
        return 5; // 模拟计数结果
    }

    public function insert(array $data): bool
    {
        $columns = array_keys($data);
        $placeholders = array_map(fn($col) => ":{$col}", $columns);
        
        $sql = "INSERT INTO {$this->table} (" . implode(', ', $columns) . ") VALUES (" . implode(', ', $placeholders) . ")";
        
        echo "执行插入: {$sql}\n";
        echo "数据: " . json_encode($data) . "\n";
        
        return true; // 模拟成功
    }

    public function update(array $data): bool
    {
        $setParts = [];
        foreach ($data as $column => $value) {
            $placeholder = ":update_{$column}";
            $setParts[] = "{$column} = {$placeholder}";
            $this->bindings[$placeholder] = $value;
        }

        $sql = "UPDATE {$this->table} SET " . implode(', ', $setParts);
        
        if (!empty($this->where)) {
            $sql .= " WHERE " . implode(' AND ', $this->where);
        }

        echo "执行更新: {$sql}\n";
        echo "参数: " . json_encode($this->bindings) . "\n";
        
        return true; // 模拟成功
    }

    public function delete(): bool
    {
        $sql = "DELETE FROM {$this->table}";
        
        if (!empty($this->where)) {
            $sql .= " WHERE " . implode(' AND ', $this->where);
        }

        echo "执行删除: {$sql}\n";
        echo "参数: " . json_encode($this->bindings) . "\n";
        
        return true; // 模拟成功
    }

    private function buildSelectQuery(): string
    {
        $sql = "SELECT " . implode(', ', $this->select) . " FROM {$this->table}";
        
        if (!empty($this->joins)) {
            $sql .= " " . implode(' ', $this->joins);
        }
        
        if (!empty($this->where)) {
            $sql .= " WHERE " . implode(' AND ', $this->where);
        }
        
        if (!empty($this->orderBy)) {
            $sql .= " ORDER BY " . implode(', ', $this->orderBy);
        }
        
        if ($this->limit !== null) {
            $sql .= " LIMIT {$this->limit}";
        }
        
        if ($this->offset !== null) {
            $sql .= " OFFSET {$this->offset}";
        }
        
        return $sql;
    }

    private function getMockData(): array
    {
        // 根据表名返回不同的模拟数据
        switch ($this->table) {
            case 'users':
                return [
                    ['id' => 1, 'name' => '张三', 'email' => 'zhangsan@example.com', 'created_at' => '2023-01-01 10:00:00'],
                    ['id' => 2, 'name' => '李四', 'email' => 'lisi@example.com', 'created_at' => '2023-01-02 11:00:00'],
                    ['id' => 3, 'name' => '王五', 'email' => 'wangwu@example.com', 'created_at' => '2023-01-03 12:00:00'],
                ];
            case 'posts':
                return [
                    ['id' => 1, 'title' => 'PHP教程', 'content' => 'PHP基础知识...', 'user_id' => 1],
                    ['id' => 2, 'title' => 'MySQL优化', 'content' => '数据库优化技巧...', 'user_id' => 2],
                ];
            default:
                return [];
        }
    }
}

// ORM基类
abstract class Model
{
    protected static string $table;
    protected static string $primaryKey = 'id';
    protected array $fillable = [];
    protected array $hidden = [];
    protected array $attributes = [];
    protected array $original = [];
    protected bool $exists = false;

    public function __construct(array $attributes = [])
    {
        $this->fill($attributes);
    }

    public function fill(array $attributes): void
    {
        foreach ($attributes as $key => $value) {
            if (in_array($key, $this->fillable) || empty($this->fillable)) {
                $this->setAttribute($key, $value);
            }
        }
    }

    public function setAttribute(string $key, $value): void
    {
        $this->attributes[$key] = $value;
    }

    public function getAttribute(string $key)
    {
        return $this->attributes[$key] ?? null;
    }

    public function __get(string $key)
    {
        return $this->getAttribute($key);
    }

    public function __set(string $key, $value): void
    {
        $this->setAttribute($key, $value);
    }

    public function toArray(): array
    {
        $array = $this->attributes;
        
        // 隐藏指定字段
        foreach ($this->hidden as $hidden) {
            unset($array[$hidden]);
        }
        
        return $array;
    }

    public function toJson(): string
    {
        return json_encode($this->toArray(), JSON_UNESCAPED_UNICODE);
    }

    public function save(): bool
    {
        if ($this->exists) {
            return $this->performUpdate();
        } else {
            return $this->performInsert();
        }
    }

    public function delete(): bool
    {
        if (!$this->exists) {
            return false;
        }

        $query = new QueryBuilder(DatabaseManager::getConnection());
        return $query->table(static::$table)
                    ->where(static::$primaryKey, '=', $this->getAttribute(static::$primaryKey))
                    ->delete();
    }

    protected function performInsert(): bool
    {
        $query = new QueryBuilder(DatabaseManager::getConnection());
        $result = $query->table(static::$table)->insert($this->attributes);
        
        if ($result) {
            $this->exists = true;
            $this->original = $this->attributes;
            // 在实际应用中，这里应该设置自增ID
            if (!$this->getAttribute(static::$primaryKey)) {
                $this->setAttribute(static::$primaryKey, rand(1000, 9999));
            }
        }
        
        return $result;
    }

    protected function performUpdate(): bool
    {
        $query = new QueryBuilder(DatabaseManager::getConnection());
        return $query->table(static::$table)
                    ->where(static::$primaryKey, '=', $this->getAttribute(static::$primaryKey))
                    ->update($this->getDirty());
    }

    protected function getDirty(): array
    {
        $dirty = [];
        foreach ($this->attributes as $key => $value) {
            if (!isset($this->original[$key]) || $this->original[$key] !== $value) {
                $dirty[$key] = $value;
            }
        }
        return $dirty;
    }

    // 静态查询方法
    public static function query(): QueryBuilder
    {
        return (new QueryBuilder(DatabaseManager::getConnection()))->table(static::$table);
    }

    public static function all(): array
    {
        $results = static::query()->get();
        return array_map(fn($data) => static::newFromArray($data), $results);
    }

    public static function find($id): ?static
    {
        $result = static::query()->where(static::$primaryKey, '=', $id)->first();
        return $result ? static::newFromArray($result) : null;
    }

    public static function where(string $column, string $operator, $value): QueryBuilder
    {
        return static::query()->where($column, $operator, $value);
    }

    public static function create(array $attributes): static
    {
        $model = new static($attributes);
        $model->save();
        return $model;
    }

    protected static function newFromArray(array $data): static
    {
        $model = new static($data);
        $model->exists = true;
        $model->original = $data;
        return $model;
    }
}

// 用户模型
class User extends Model
{
    protected static string $table = 'users';
    protected array $fillable = ['name', 'email', 'password'];
    protected array $hidden = ['password'];

    public function posts(): array
    {
        // 模拟关联查询
        return Post::where('user_id', '=', $this->id)->get();
    }

    public function getFullNameAttribute(): string
    {
        return $this->name . ' (' . $this->email . ')';
    }
}

// 文章模型
class Post extends Model
{
    protected static string $table = 'posts';
    protected array $fillable = ['title', 'content', 'user_id'];

    public function user(): ?User
    {
        return User::find($this->user_id);
    }

    public function getExcerptAttribute(): string
    {
        return substr($this->content, 0, 100) . '...';
    }
}

// 数据库迁移类
class Migration
{
    protected QueryBuilder $query;

    public function __construct()
    {
        $this->query = new QueryBuilder(DatabaseManager::getConnection());
    }

    public function createUsersTable(): void
    {
        $sql = "
            CREATE TABLE IF NOT EXISTS users (
                id INT AUTO_INCREMENT PRIMARY KEY,
                name VARCHAR(255) NOT NULL,
                email VARCHAR(255) UNIQUE NOT NULL,
                password VARCHAR(255) NOT NULL,
                created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
                updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP
            )
        ";
        
        echo "创建用户表: {$sql}\n";
    }

    public function createPostsTable(): void
    {
        $sql = "
            CREATE TABLE IF NOT EXISTS posts (
                id INT AUTO_INCREMENT PRIMARY KEY,
                title VARCHAR(255) NOT NULL,
                content TEXT NOT NULL,
                user_id INT NOT NULL,
                created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
                updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
                FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE
            )
        ";
        
        echo "创建文章表: {$sql}\n";
    }
}

// 数据填充器
class Seeder
{
    public function seedUsers(): void
    {
        echo "\n=== 填充用户数据 ===\n";
        
        $users = [
            ['name' => '张三', 'email' => 'zhangsan@example.com', 'password' => password_hash('123456', PASSWORD_DEFAULT)],
            ['name' => '李四', 'email' => 'lisi@example.com', 'password' => password_hash('123456', PASSWORD_DEFAULT)],
            ['name' => '王五', 'email' => 'wangwu@example.com', 'password' => password_hash('123456', PASSWORD_DEFAULT)],
        ];

        foreach ($users as $userData) {
            $user = User::create($userData);
            echo "创建用户: {$user->name}\n";
        }
    }

    public function seedPosts(): void
    {
        echo "\n=== 填充文章数据 ===\n";
        
        $posts = [
            ['title' => 'PHP基础教程', 'content' => 'PHP是一种广泛使用的服务器端脚本语言...', 'user_id' => 1],
            ['title' => 'MySQL数据库优化', 'content' => '数据库优化是提高应用性能的重要手段...', 'user_id' => 2],
            ['title' => 'Web安全最佳实践', 'content' => '在Web开发中，安全性是至关重要的...', 'user_id' => 1],
        ];

        foreach ($posts as $postData) {
            $post = Post::create($postData);
            echo "创建文章: {$post->title}\n";
        }
    }
}

// 数据库事务管理
class Transaction
{
    private PDO $pdo;

    public function __construct()
    {
        $this->pdo = DatabaseManager::getConnection();
    }

    public function execute(callable $callback)
    {
        try {
            $this->pdo->beginTransaction();
            echo "开始事务\n";
            
            $result = $callback();
            
            $this->pdo->commit();
            echo "提交事务\n";
            
            return $result;
        } catch (Exception $e) {
            $this->pdo->rollBack();
            echo "回滚事务: {$e->getMessage()}\n";
            throw $e;
        }
    }
}

// 演示函数
function demonstrateQueryBuilder(): void
{
    echo "\n=== 查询构建器示例 ===\n";
    
    $query = new QueryBuilder(DatabaseManager::getConnection());
    
    // 基础查询
    $users = $query->table('users')->get();
    echo "用户数量: " . count($users) . "\n";
    
    // 条件查询
    $query = new QueryBuilder(DatabaseManager::getConnection());
    $activeUsers = $query->table('users')
                         ->where('name', '=', '张三')
                         ->where('email', 'LIKE', '%@example.com')
                         ->get();
    
    // 连接查询
    $query = new QueryBuilder(DatabaseManager::getConnection());
    $userPosts = $query->table('users')
                       ->select(['users.name', 'posts.title'])
                       ->leftJoin('posts', 'users.id', '=', 'posts.user_id')
                       ->orderBy('users.name')
                       ->get();
    
    // 分页查询
    $query = new QueryBuilder(DatabaseManager::getConnection());
    $paginatedUsers = $query->table('users')
                           ->orderBy('created_at', 'DESC')
                           ->limit(10)
                           ->offset(0)
                           ->get();
}

function demonstrateORM(): void
{
    echo "\n=== ORM模型示例 ===\n";
    
    // 创建用户
    $user = new User([
        'name' => '新用户',
        'email' => 'newuser@example.com',
        'password' => password_hash('password', PASSWORD_DEFAULT)
    ]);
    $user->save();
    echo "创建用户: {$user->toJson()}\n";
    
    // 查找用户
    $foundUser = User::find(1);
    if ($foundUser) {
        echo "找到用户: {$foundUser->name}\n";
    }
    
    // 查询所有用户
    $allUsers = User::all();
    echo "所有用户数量: " . count($allUsers) . "\n";
    
    // 条件查询
    $emailUsers = User::where('email', 'LIKE', '%@example.com')->get();
    echo "邮箱用户数量: " . count($emailUsers) . "\n";
    
    // 更新用户
    if ($foundUser) {
        $foundUser->name = '更新的用户名';
        $foundUser->save();
        echo "用户已更新\n";
    }
    
    // 创建文章
    $post = Post::create([
        'title' => '新文章标题',
        'content' => '这是文章的内容...',
        'user_id' => 1
    ]);
    echo "创建文章: {$post->title}\n";
}

function demonstrateRelationships(): void
{
    echo "\n=== 模型关联示例 ===\n";
    
    $user = User::find(1);
    if ($user) {
        echo "用户: {$user->name}\n";
        
        // 获取用户的文章
        $posts = $user->posts();
        echo "用户文章数量: " . count($posts) . "\n";
        
        foreach ($posts as $post) {
            echo "  - {$post['title']}\n";
        }
    }
    
    $post = Post::find(1);
    if ($post) {
        echo "\n文章: {$post->title}\n";
        
        // 获取文章作者
        $author = $post->user();
        if ($author) {
            echo "作者: {$author->name}\n";
        }
    }
}

function demonstrateTransactions(): void
{
    echo "\n=== 事务示例 ===\n";
    
    $transaction = new Transaction();
    
    try {
        $transaction->execute(function() {
            // 创建用户和文章
            $user = User::create([
                'name' => '事务用户',
                'email' => 'transaction@example.com',
                'password' => password_hash('password', PASSWORD_DEFAULT)
            ]);
            
            $post = Post::create([
                'title' => '事务文章',
                'content' => '在事务中创建的文章',
                'user_id' => $user->id
            ]);
            
            echo "在事务中创建了用户和文章\n";
            
            // 模拟可能的错误
            if (rand(0, 1)) {
                throw new Exception("模拟错误");
            }
            
            return ['user' => $user, 'post' => $post];
        });
    } catch (Exception $e) {
        echo "事务执行失败\n";
    }
}

// 运行示例
echo "=== PHP数据库操作和ORM示例 ===\n";

// 初始化数据库
$migration = new Migration();
$migration->createUsersTable();
$migration->createPostsTable();

// 填充数据
$seeder = new Seeder();
$seeder->seedUsers();
$seeder->seedPosts();

// 演示各种功能
demonstrateQueryBuilder();
demonstrateORM();
demonstrateRelationships();
demonstrateTransactions();

echo "\nPHP数据库操作和ORM示例完成!\n";

?>
