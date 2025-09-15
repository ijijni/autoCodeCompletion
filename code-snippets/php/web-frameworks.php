<?php
/**
 * PHP Web框架和MVC模式示例
 */

// 简单的MVC框架实现

// 路由器类
class Router
{
    private array $routes = [];
    private array $middlewares = [];

    public function get(string $path, $handler): void
    {
        $this->addRoute('GET', $path, $handler);
    }

    public function post(string $path, $handler): void
    {
        $this->addRoute('POST', $path, $handler);
    }

    public function put(string $path, $handler): void
    {
        $this->addRoute('PUT', $path, $handler);
    }

    public function delete(string $path, $handler): void
    {
        $this->addRoute('DELETE', $path, $handler);
    }

    private function addRoute(string $method, string $path, $handler): void
    {
        $this->routes[] = [
            'method' => $method,
            'path' => $path,
            'handler' => $handler,
            'middlewares' => $this->middlewares
        ];
        $this->middlewares = []; // 重置中间件
    }

    public function middleware(callable $middleware): self
    {
        $this->middlewares[] = $middleware;
        return $this;
    }

    public function dispatch(Request $request): Response
    {
        foreach ($this->routes as $route) {
            if ($this->matchRoute($route, $request)) {
                return $this->executeRoute($route, $request);
            }
        }

        return new Response(404, ['Content-Type' => 'application/json'], 
            json_encode(['error' => '路由未找到']));
    }

    private function matchRoute(array $route, Request $request): bool
    {
        if ($route['method'] !== $request->getMethod()) {
            return false;
        }

        $pattern = preg_replace('/\{([^}]+)\}/', '([^/]+)', $route['path']);
        $pattern = '#^' . $pattern . '$#';

        return preg_match($pattern, $request->getPath());
    }

    private function executeRoute(array $route, Request $request): Response
    {
        // 执行中间件
        foreach ($route['middlewares'] as $middleware) {
            $result = $middleware($request);
            if ($result instanceof Response) {
                return $result;
            }
        }

        // 提取路径参数
        $params = $this->extractParams($route['path'], $request->getPath());
        $request->setParams($params);

        // 执行处理器
        $handler = $route['handler'];
        
        if (is_string($handler) && strpos($handler, '@') !== false) {
            [$controllerClass, $method] = explode('@', $handler);
            $controller = new $controllerClass();
            return $controller->$method($request);
        }

        if (is_callable($handler)) {
            return $handler($request);
        }

        throw new Exception("无效的路由处理器");
    }

    private function extractParams(string $routePath, string $requestPath): array
    {
        $routeParts = explode('/', trim($routePath, '/'));
        $requestParts = explode('/', trim($requestPath, '/'));
        $params = [];

        foreach ($routeParts as $index => $part) {
            if (preg_match('/\{([^}]+)\}/', $part, $matches)) {
                $paramName = $matches[1];
                $params[$paramName] = $requestParts[$index] ?? null;
            }
        }

        return $params;
    }
}

// 请求类
class Request
{
    private string $method;
    private string $path;
    private array $headers;
    private string $body;
    private array $params = [];
    private array $query = [];

    public function __construct(string $method, string $path, array $headers = [], string $body = '')
    {
        $this->method = strtoupper($method);
        $this->path = $path;
        $this->headers = $headers;
        $this->body = $body;
        
        // 解析查询参数
        $urlParts = parse_url($path);
        if (isset($urlParts['query'])) {
            parse_str($urlParts['query'], $this->query);
            $this->path = $urlParts['path'];
        }
    }

    public function getMethod(): string
    {
        return $this->method;
    }

    public function getPath(): string
    {
        return $this->path;
    }

    public function getHeader(string $name): ?string
    {
        return $this->headers[$name] ?? null;
    }

    public function getBody(): string
    {
        return $this->body;
    }

    public function getJsonBody(): array
    {
        return json_decode($this->body, true) ?? [];
    }

    public function getParam(string $name): ?string
    {
        return $this->params[$name] ?? null;
    }

    public function setParams(array $params): void
    {
        $this->params = $params;
    }

    public function getQuery(string $name = null)
    {
        if ($name === null) {
            return $this->query;
        }
        return $this->query[$name] ?? null;
    }
}

// 响应类
class Response
{
    private int $statusCode;
    private array $headers;
    private string $body;

    public function __construct(int $statusCode = 200, array $headers = [], string $body = '')
    {
        $this->statusCode = $statusCode;
        $this->headers = $headers;
        $this->body = $body;
    }

    public function getStatusCode(): int
    {
        return $this->statusCode;
    }

    public function getHeaders(): array
    {
        return $this->headers;
    }

    public function getBody(): string
    {
        return $this->body;
    }

    public function json(array $data): self
    {
        $this->headers['Content-Type'] = 'application/json';
        $this->body = json_encode($data, JSON_UNESCAPED_UNICODE);
        return $this;
    }

    public function send(): void
    {
        http_response_code($this->statusCode);
        
        foreach ($this->headers as $name => $value) {
            header("$name: $value");
        }
        
        echo $this->body;
    }
}

// 模型基类
abstract class Model
{
    protected static string $table;
    protected array $attributes = [];
    protected array $fillable = [];

    public function __construct(array $attributes = [])
    {
        $this->fill($attributes);
    }

    public function fill(array $attributes): void
    {
        foreach ($attributes as $key => $value) {
            if (in_array($key, $this->fillable)) {
                $this->attributes[$key] = $value;
            }
        }
    }

    public function __get(string $name)
    {
        return $this->attributes[$name] ?? null;
    }

    public function __set(string $name, $value): void
    {
        if (in_array($name, $this->fillable)) {
            $this->attributes[$name] = $value;
        }
    }

    public function toArray(): array
    {
        return $this->attributes;
    }

    public static function all(): array
    {
        // 模拟数据库查询
        return static::mockData();
    }

    public static function find(int $id): ?static
    {
        $data = static::mockData();
        foreach ($data as $item) {
            if ($item['id'] == $id) {
                return new static($item);
            }
        }
        return null;
    }

    public function save(): bool
    {
        // 模拟保存到数据库
        echo "保存模型到数据库: " . static::$table . "\n";
        return true;
    }

    public function delete(): bool
    {
        // 模拟从数据库删除
        echo "从数据库删除模型: " . static::$table . "\n";
        return true;
    }

    protected static function mockData(): array
    {
        return [];
    }
}

// 用户模型
class User extends Model
{
    protected static string $table = 'users';
    protected array $fillable = ['name', 'email', 'password'];

    protected static function mockData(): array
    {
        return [
            ['id' => 1, 'name' => '张三', 'email' => 'zhangsan@example.com'],
            ['id' => 2, 'name' => '李四', 'email' => 'lisi@example.com'],
            ['id' => 3, 'name' => '王五', 'email' => 'wangwu@example.com'],
        ];
    }
}

// 文章模型
class Post extends Model
{
    protected static string $table = 'posts';
    protected array $fillable = ['title', 'content', 'user_id'];

    protected static function mockData(): array
    {
        return [
            ['id' => 1, 'title' => 'PHP基础教程', 'content' => 'PHP是一种服务器端脚本语言...', 'user_id' => 1],
            ['id' => 2, 'title' => 'Web开发最佳实践', 'content' => '在Web开发中，我们需要遵循一些最佳实践...', 'user_id' => 2],
            ['id' => 3, 'title' => 'MVC架构详解', 'content' => 'MVC是一种软件架构模式...', 'user_id' => 1],
        ];
    }
}

// 控制器基类
abstract class Controller
{
    protected function json(array $data, int $status = 200): Response
    {
        return (new Response($status))->json($data);
    }

    protected function success(array $data = [], string $message = '操作成功'): Response
    {
        return $this->json([
            'success' => true,
            'message' => $message,
            'data' => $data
        ]);
    }

    protected function error(string $message = '操作失败', int $status = 400): Response
    {
        return $this->json([
            'success' => false,
            'message' => $message
        ], $status);
    }
}

// 用户控制器
class UserController extends Controller
{
    public function index(Request $request): Response
    {
        $users = User::all();
        return $this->success($users, '获取用户列表成功');
    }

    public function show(Request $request): Response
    {
        $id = (int)$request->getParam('id');
        $user = User::find($id);
        
        if (!$user) {
            return $this->error('用户不存在', 404);
        }

        return $this->success($user->toArray(), '获取用户详情成功');
    }

    public function store(Request $request): Response
    {
        $data = $request->getJsonBody();
        
        // 验证数据
        if (empty($data['name']) || empty($data['email'])) {
            return $this->error('姓名和邮箱不能为空');
        }

        $user = new User($data);
        $user->save();

        return $this->success($user->toArray(), '创建用户成功');
    }

    public function update(Request $request): Response
    {
        $id = (int)$request->getParam('id');
        $user = User::find($id);
        
        if (!$user) {
            return $this->error('用户不存在', 404);
        }

        $data = $request->getJsonBody();
        $user->fill($data);
        $user->save();

        return $this->success($user->toArray(), '更新用户成功');
    }

    public function destroy(Request $request): Response
    {
        $id = (int)$request->getParam('id');
        $user = User::find($id);
        
        if (!$user) {
            return $this->error('用户不存在', 404);
        }

        $user->delete();
        return $this->success([], '删除用户成功');
    }
}

// 文章控制器
class PostController extends Controller
{
    public function index(Request $request): Response
    {
        $posts = Post::all();
        return $this->success($posts, '获取文章列表成功');
    }

    public function show(Request $request): Response
    {
        $id = (int)$request->getParam('id');
        $post = Post::find($id);
        
        if (!$post) {
            return $this->error('文章不存在', 404);
        }

        return $this->success($post->toArray(), '获取文章详情成功');
    }

    public function store(Request $request): Response
    {
        $data = $request->getJsonBody();
        
        if (empty($data['title']) || empty($data['content'])) {
            return $this->error('标题和内容不能为空');
        }

        $post = new Post($data);
        $post->save();

        return $this->success($post->toArray(), '创建文章成功');
    }
}

// 中间件
class AuthMiddleware
{
    public function __invoke(Request $request): ?Response
    {
        $token = $request->getHeader('Authorization');
        
        if (!$token || $token !== 'Bearer valid-token') {
            return (new Response(401))->json([
                'error' => '未授权访问'
            ]);
        }

        return null; // 继续执行
    }
}

class LoggingMiddleware
{
    public function __invoke(Request $request): ?Response
    {
        echo "[" . date('Y-m-d H:i:s') . "] {$request->getMethod()} {$request->getPath()}\n";
        return null;
    }
}

class CorsMiddleware
{
    public function __invoke(Request $request): ?Response
    {
        // 在实际应用中，这里会设置CORS头
        echo "设置CORS头\n";
        return null;
    }
}

// 应用程序类
class Application
{
    private Router $router;

    public function __construct()
    {
        $this->router = new Router();
        $this->registerRoutes();
    }

    private function registerRoutes(): void
    {
        // 公共路由
        $this->router->middleware(new LoggingMiddleware())
                    ->middleware(new CorsMiddleware())
                    ->get('/', function(Request $request) {
                        return (new Response())->json([
                            'message' => '欢迎使用PHP Web框架',
                            'version' => '1.0.0'
                        ]);
                    });

        // 用户路由
        $this->router->get('/users', 'UserController@index');
        $this->router->get('/users/{id}', 'UserController@show');
        
        // 需要认证的路由
        $this->router->middleware(new AuthMiddleware())
                    ->post('/users', 'UserController@store');
        
        $this->router->middleware(new AuthMiddleware())
                    ->put('/users/{id}', 'UserController@update');
        
        $this->router->middleware(new AuthMiddleware())
                    ->delete('/users/{id}', 'UserController@destroy');

        // 文章路由
        $this->router->get('/posts', 'PostController@index');
        $this->router->get('/posts/{id}', 'PostController@show');
        
        $this->router->middleware(new AuthMiddleware())
                    ->post('/posts', 'PostController@store');
    }

    public function run(): void
    {
        // 模拟HTTP请求
        $this->simulateRequests();
    }

    private function simulateRequests(): void
    {
        echo "=== PHP Web框架和MVC模式示例 ===\n\n";

        $requests = [
            new Request('GET', '/'),
            new Request('GET', '/users'),
            new Request('GET', '/users/1'),
            new Request('POST', '/users', ['Authorization' => 'Bearer valid-token'], 
                json_encode(['name' => '新用户', 'email' => 'newuser@example.com'])),
            new Request('PUT', '/users/1', ['Authorization' => 'Bearer valid-token'], 
                json_encode(['name' => '更新的用户名'])),
            new Request('GET', '/posts'),
            new Request('GET', '/posts/1'),
            new Request('POST', '/posts', ['Authorization' => 'Bearer valid-token'], 
                json_encode(['title' => '新文章', 'content' => '文章内容', 'user_id' => 1])),
            new Request('DELETE', '/users/1', ['Authorization' => 'Bearer invalid-token']),
        ];

        foreach ($requests as $request) {
            echo "处理请求: {$request->getMethod()} {$request->getPath()}\n";
            $response = $this->router->dispatch($request);
            echo "响应状态: {$response->getStatusCode()}\n";
            echo "响应内容: {$response->getBody()}\n";
            echo str_repeat('-', 50) . "\n";
        }
    }
}

// 视图渲染器
class ViewRenderer
{
    private string $viewsPath;

    public function __construct(string $viewsPath = 'views')
    {
        $this->viewsPath = $viewsPath;
    }

    public function render(string $template, array $data = []): string
    {
        // 简单的模板渲染
        $content = $this->getTemplate($template);
        
        foreach ($data as $key => $value) {
            $placeholder = '{{' . $key . '}}';
            $content = str_replace($placeholder, $value, $content);
        }

        return $content;
    }

    private function getTemplate(string $template): string
    {
        // 模拟模板内容
        $templates = [
            'user/index' => '<h1>用户列表</h1><p>共有 {{count}} 个用户</p>',
            'user/show' => '<h1>用户详情</h1><p>姓名: {{name}}</p><p>邮箱: {{email}}</p>',
            'post/index' => '<h1>文章列表</h1><p>共有 {{count}} 篇文章</p>',
        ];

        return $templates[$template] ?? '<h1>模板不存在</h1>';
    }
}

// 服务容器
class Container
{
    private array $bindings = [];
    private array $instances = [];

    public function bind(string $abstract, callable $concrete): void
    {
        $this->bindings[$abstract] = $concrete;
    }

    public function singleton(string $abstract, callable $concrete): void
    {
        $this->bind($abstract, function() use ($concrete, $abstract) {
            if (!isset($this->instances[$abstract])) {
                $this->instances[$abstract] = $concrete();
            }
            return $this->instances[$abstract];
        });
    }

    public function resolve(string $abstract)
    {
        if (isset($this->bindings[$abstract])) {
            return $this->bindings[$abstract]();
        }

        throw new Exception("无法解析 {$abstract}");
    }
}

// 演示服务容器
function demonstrateContainer(): void
{
    echo "\n=== 服务容器示例 ===\n";

    $container = new Container();

    // 绑定服务
    $container->bind('database', function() {
        return new class {
            public function query(string $sql): array {
                echo "执行SQL: {$sql}\n";
                return ['result' => 'data'];
            }
        };
    });

    $container->singleton('logger', function() {
        return new class {
            public function log(string $message): void {
                echo "[LOG] {$message}\n";
            }
        };
    });

    // 使用服务
    $db = $container->resolve('database');
    $db->query('SELECT * FROM users');

    $logger1 = $container->resolve('logger');
    $logger2 = $container->resolve('logger');
    
    echo "Logger是单例: " . ($logger1 === $logger2 ? '是' : '否') . "\n";
    $logger1->log('这是一条日志消息');
}

// 演示视图渲染
function demonstrateViewRenderer(): void
{
    echo "\n=== 视图渲染示例 ===\n";

    $renderer = new ViewRenderer();

    $userHtml = $renderer->render('user/show', [
        'name' => '张三',
        'email' => 'zhangsan@example.com'
    ]);

    echo "渲染的HTML:\n{$userHtml}\n";

    $postListHtml = $renderer->render('post/index', [
        'count' => 5
    ]);

    echo "文章列表HTML:\n{$postListHtml}\n";
}

// 运行应用程序
$app = new Application();
$app->run();

demonstrateContainer();
demonstrateViewRenderer();

echo "\nPHP Web框架和MVC模式示例完成!\n";

?>
