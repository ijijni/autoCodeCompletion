/**
 * C# 依赖注入示例
 */
using System;
using System.Collections.Generic;
using System.Linq;
using Microsoft.Extensions.DependencyInjection;
using Microsoft.Extensions.Hosting;
using Microsoft.Extensions.Logging;
using Microsoft.Extensions.Configuration;

namespace DependencyInjection
{
    // 接口定义
    public interface IRepository<T>
    {
        Task<T> GetByIdAsync(int id);
        Task<IEnumerable<T>> GetAllAsync();
        Task<T> CreateAsync(T entity);
        Task<T> UpdateAsync(T entity);
        Task<bool> DeleteAsync(int id);
    }

    public interface IUserService
    {
        Task<User> GetUserAsync(int id);
        Task<User> CreateUserAsync(string name, string email);
        Task<bool> ValidateUserAsync(User user);
    }

    public interface IEmailService
    {
        Task SendEmailAsync(string to, string subject, string body);
        Task SendWelcomeEmailAsync(User user);
    }

    public interface INotificationService
    {
        Task NotifyAsync(string message);
        Task NotifyUserCreatedAsync(User user);
    }

    public interface ICacheService
    {
        Task<T> GetAsync<T>(string key);
        Task SetAsync<T>(string key, T value, TimeSpan? expiration = null);
        Task RemoveAsync(string key);
    }

    // 实体类
    public class User
    {
        public int Id { get; set; }
        public string Name { get; set; }
        public string Email { get; set; }
        public DateTime CreatedAt { get; set; }

        public override string ToString()
        {
            return $"User(Id: {Id}, Name: {Name}, Email: {Email})";
        }
    }

    // 仓储实现
    public class InMemoryUserRepository : IRepository<User>
    {
        private readonly List<User> _users = new();
        private int _nextId = 1;
        private readonly ILogger<InMemoryUserRepository> _logger;

        public InMemoryUserRepository(ILogger<InMemoryUserRepository> logger)
        {
            _logger = logger;
        }

        public Task<User> GetByIdAsync(int id)
        {
            _logger.LogInformation("获取用户 ID: {UserId}", id);
            var user = _users.FirstOrDefault(u => u.Id == id);
            return Task.FromResult(user);
        }

        public Task<IEnumerable<User>> GetAllAsync()
        {
            _logger.LogInformation("获取所有用户");
            return Task.FromResult<IEnumerable<User>>(_users);
        }

        public Task<User> CreateAsync(User entity)
        {
            _logger.LogInformation("创建用户: {UserName}", entity.Name);
            entity.Id = _nextId++;
            entity.CreatedAt = DateTime.Now;
            _users.Add(entity);
            return Task.FromResult(entity);
        }

        public Task<User> UpdateAsync(User entity)
        {
            _logger.LogInformation("更新用户 ID: {UserId}", entity.Id);
            var existingUser = _users.FirstOrDefault(u => u.Id == entity.Id);
            if (existingUser != null)
            {
                existingUser.Name = entity.Name;
                existingUser.Email = entity.Email;
                return Task.FromResult(existingUser);
            }
            return Task.FromResult<User>(null);
        }

        public Task<bool> DeleteAsync(int id)
        {
            _logger.LogInformation("删除用户 ID: {UserId}", id);
            var user = _users.FirstOrDefault(u => u.Id == id);
            if (user != null)
            {
                _users.Remove(user);
                return Task.FromResult(true);
            }
            return Task.FromResult(false);
        }
    }

    // 缓存服务实现
    public class InMemoryCacheService : ICacheService
    {
        private readonly Dictionary<string, (object Value, DateTime Expiration)> _cache = new();
        private readonly ILogger<InMemoryCacheService> _logger;

        public InMemoryCacheService(ILogger<InMemoryCacheService> logger)
        {
            _logger = logger;
        }

        public Task<T> GetAsync<T>(string key)
        {
            _logger.LogDebug("获取缓存 Key: {CacheKey}", key);
            
            if (_cache.TryGetValue(key, out var cached))
            {
                if (cached.Expiration > DateTime.Now)
                {
                    return Task.FromResult((T)cached.Value);
                }
                else
                {
                    _cache.Remove(key);
                }
            }
            
            return Task.FromResult(default(T));
        }

        public Task SetAsync<T>(string key, T value, TimeSpan? expiration = null)
        {
            _logger.LogDebug("设置缓存 Key: {CacheKey}", key);
            
            var exp = expiration.HasValue ? DateTime.Now.Add(expiration.Value) : DateTime.MaxValue;
            _cache[key] = (value, exp);
            
            return Task.CompletedTask;
        }

        public Task RemoveAsync(string key)
        {
            _logger.LogDebug("移除缓存 Key: {CacheKey}", key);
            _cache.Remove(key);
            return Task.CompletedTask;
        }
    }

    // 邮件服务实现
    public class EmailService : IEmailService
    {
        private readonly ILogger<EmailService> _logger;
        private readonly IConfiguration _configuration;

        public EmailService(ILogger<EmailService> logger, IConfiguration configuration)
        {
            _logger = logger;
            _configuration = configuration;
        }

        public Task SendEmailAsync(string to, string subject, string body)
        {
            _logger.LogInformation("发送邮件到: {EmailTo}, 主题: {Subject}", to, subject);
            
            // 模拟发送邮件
            Console.WriteLine($"[EMAIL] To: {to}");
            Console.WriteLine($"[EMAIL] Subject: {subject}");
            Console.WriteLine($"[EMAIL] Body: {body}");
            
            return Task.CompletedTask;
        }

        public Task SendWelcomeEmailAsync(User user)
        {
            var subject = "欢迎注册！";
            var body = $"亲爱的 {user.Name}，欢迎加入我们的平台！";
            
            return SendEmailAsync(user.Email, subject, body);
        }
    }

    // 通知服务实现
    public class NotificationService : INotificationService
    {
        private readonly IEmailService _emailService;
        private readonly ILogger<NotificationService> _logger;

        public NotificationService(IEmailService emailService, ILogger<NotificationService> logger)
        {
            _emailService = emailService;
            _logger = logger;
        }

        public Task NotifyAsync(string message)
        {
            _logger.LogInformation("发送通知: {Message}", message);
            Console.WriteLine($"[NOTIFICATION] {message}");
            return Task.CompletedTask;
        }

        public async Task NotifyUserCreatedAsync(User user)
        {
            await NotifyAsync($"新用户已创建: {user.Name}");
            await _emailService.SendWelcomeEmailAsync(user);
        }
    }

    // 用户服务实现
    public class UserService : IUserService
    {
        private readonly IRepository<User> _userRepository;
        private readonly ICacheService _cacheService;
        private readonly INotificationService _notificationService;
        private readonly ILogger<UserService> _logger;

        public UserService(
            IRepository<User> userRepository,
            ICacheService cacheService,
            INotificationService notificationService,
            ILogger<UserService> logger)
        {
            _userRepository = userRepository;
            _cacheService = cacheService;
            _notificationService = notificationService;
            _logger = logger;
        }

        public async Task<User> GetUserAsync(int id)
        {
            _logger.LogInformation("获取用户服务调用 ID: {UserId}", id);
            
            // 先尝试从缓存获取
            var cacheKey = $"user:{id}";
            var cachedUser = await _cacheService.GetAsync<User>(cacheKey);
            
            if (cachedUser != null)
            {
                _logger.LogInformation("从缓存获取用户 ID: {UserId}", id);
                return cachedUser;
            }

            // 从仓储获取
            var user = await _userRepository.GetByIdAsync(id);
            
            if (user != null)
            {
                // 缓存用户数据
                await _cacheService.SetAsync(cacheKey, user, TimeSpan.FromMinutes(10));
            }

            return user;
        }

        public async Task<User> CreateUserAsync(string name, string email)
        {
            _logger.LogInformation("创建用户: {UserName}, {Email}", name, email);
            
            var user = new User
            {
                Name = name,
                Email = email
            };

            // 验证用户
            if (!await ValidateUserAsync(user))
            {
                throw new ArgumentException("用户数据无效");
            }

            // 创建用户
            var createdUser = await _userRepository.CreateAsync(user);
            
            // 发送通知
            await _notificationService.NotifyUserCreatedAsync(createdUser);
            
            return createdUser;
        }

        public Task<bool> ValidateUserAsync(User user)
        {
            _logger.LogInformation("验证用户: {UserName}", user.Name);
            
            var isValid = !string.IsNullOrEmpty(user.Name) && 
                         !string.IsNullOrEmpty(user.Email) &&
                         user.Email.Contains("@");
            
            return Task.FromResult(isValid);
        }
    }

    // 应用程序服务
    public class ApplicationService
    {
        private readonly IUserService _userService;
        private readonly ILogger<ApplicationService> _logger;

        public ApplicationService(IUserService userService, ILogger<ApplicationService> logger)
        {
            _userService = userService;
            _logger = logger;
        }

        public async Task RunDemoAsync()
        {
            _logger.LogInformation("开始运行依赖注入演示");

            try
            {
                // 创建用户
                var user1 = await _userService.CreateUserAsync("张三", "zhangsan@example.com");
                Console.WriteLine($"创建用户1: {user1}");

                var user2 = await _userService.CreateUserAsync("李四", "lisi@example.com");
                Console.WriteLine($"创建用户2: {user2}");

                // 获取用户（第一次从数据库）
                var retrievedUser1 = await _userService.GetUserAsync(user1.Id);
                Console.WriteLine($"获取用户1: {retrievedUser1}");

                // 再次获取用户（从缓存）
                var cachedUser1 = await _userService.GetUserAsync(user1.Id);
                Console.WriteLine($"缓存用户1: {cachedUser1}");

                // 尝试创建无效用户
                try
                {
                    await _userService.CreateUserAsync("", "invalid-email");
                }
                catch (ArgumentException ex)
                {
                    Console.WriteLine($"创建无效用户失败: {ex.Message}");
                }
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, "运行演示时发生错误");
            }

            _logger.LogInformation("依赖注入演示完成");
        }
    }

    // 主机服务
    public class DemoHostedService : BackgroundService
    {
        private readonly ApplicationService _applicationService;
        private readonly ILogger<DemoHostedService> _logger;

        public DemoHostedService(ApplicationService applicationService, ILogger<DemoHostedService> logger)
        {
            _applicationService = applicationService;
            _logger = logger;
        }

        protected override async Task ExecuteAsync(CancellationToken stoppingToken)
        {
            _logger.LogInformation("后台服务开始执行");
            
            await _applicationService.RunDemoAsync();
            
            _logger.LogInformation("后台服务执行完成");
        }
    }

    // 程序入口
    public class Program
    {
        public static async Task Main(string[] args)
        {
            Console.WriteLine("=== C# 依赖注入示例 ===");

            // 创建主机构建器
            var hostBuilder = Host.CreateDefaultBuilder(args)
                .ConfigureServices((context, services) =>
                {
                    // 注册服务
                    services.AddSingleton<ICacheService, InMemoryCacheService>();
                    services.AddScoped<IRepository<User>, InMemoryUserRepository>();
                    services.AddScoped<IEmailService, EmailService>();
                    services.AddScoped<INotificationService, NotificationService>();
                    services.AddScoped<IUserService, UserService>();
                    services.AddScoped<ApplicationService>();
                    
                    // 注册后台服务
                    services.AddHostedService<DemoHostedService>();
                })
                .ConfigureLogging(logging =>
                {
                    logging.ClearProviders();
                    logging.AddConsole();
                    logging.SetMinimumLevel(LogLevel.Information);
                });

            // 构建并运行主机
            var host = hostBuilder.Build();

            try
            {
                await host.RunAsync();
            }
            catch (Exception ex)
            {
                Console.WriteLine($"应用程序运行失败: {ex.Message}");
            }

            Console.WriteLine("\n依赖注入示例完成!");
        }
    }

    // 手动依赖注入容器示例
    public class SimpleContainer
    {
        private readonly Dictionary<Type, Func<object>> _services = new();
        private readonly Dictionary<Type, object> _singletons = new();

        public void RegisterTransient<TInterface, TImplementation>()
            where TImplementation : class, TInterface
        {
            _services[typeof(TInterface)] = () => CreateInstance(typeof(TImplementation));
        }

        public void RegisterSingleton<TInterface, TImplementation>()
            where TImplementation : class, TInterface
        {
            _services[typeof(TInterface)] = () =>
            {
                if (!_singletons.ContainsKey(typeof(TInterface)))
                {
                    _singletons[typeof(TInterface)] = CreateInstance(typeof(TImplementation));
                }
                return _singletons[typeof(TInterface)];
            };
        }

        public T Resolve<T>()
        {
            return (T)Resolve(typeof(T));
        }

        public object Resolve(Type type)
        {
            if (_services.TryGetValue(type, out var factory))
            {
                return factory();
            }

            throw new InvalidOperationException($"服务 {type.Name} 未注册");
        }

        private object CreateInstance(Type type)
        {
            var constructors = type.GetConstructors();
            var constructor = constructors.OrderByDescending(c => c.GetParameters().Length).First();
            var parameters = constructor.GetParameters();
            var args = new object[parameters.Length];

            for (int i = 0; i < parameters.Length; i++)
            {
                args[i] = Resolve(parameters[i].ParameterType);
            }

            return Activator.CreateInstance(type, args);
        }
    }

    // 简单容器演示
    public static class SimpleContainerDemo
    {
        public static void RunDemo()
        {
            Console.WriteLine("\n=== 简单容器演示 ===");

            var container = new SimpleContainer();

            // 注册服务（需要手动处理依赖关系）
            container.RegisterSingleton<ICacheService, InMemoryCacheService>();
            
            // 由于简单容器的限制，这里只演示基本功能
            var cacheService = container.Resolve<ICacheService>();
            Console.WriteLine($"解析缓存服务: {cacheService.GetType().Name}");

            // 再次解析单例服务
            var cacheService2 = container.Resolve<ICacheService>();
            Console.WriteLine($"单例验证: {ReferenceEquals(cacheService, cacheService2)}");
        }
    }
}
