/**
 * C# 反射和特性示例
 */
using System;
using System.Collections.Generic;
using System.Linq;
using System.Reflection;
using System.ComponentModel.DataAnnotations;
using System.ComponentModel;

namespace ReflectionAttributes
{
    // 自定义特性
    [AttributeUsage(AttributeTargets.Class | AttributeTargets.Method | AttributeTargets.Property)]
    public class DocumentationAttribute : Attribute
    {
        public string Description { get; }
        public string Author { get; set; }
        public string Version { get; set; }
        public DateTime CreatedDate { get; set; }

        public DocumentationAttribute(string description)
        {
            Description = description;
            CreatedDate = DateTime.Now;
        }
    }

    [AttributeUsage(AttributeTargets.Method)]
    public class BenchmarkAttribute : Attribute
    {
        public int Iterations { get; set; } = 1000;
        public bool WarmUp { get; set; } = true;
    }

    [AttributeUsage(AttributeTargets.Property)]
    public class ValidateRangeAttribute : Attribute
    {
        public double Min { get; }
        public double Max { get; }

        public ValidateRangeAttribute(double min, double max)
        {
            Min = min;
            Max = max;
        }
    }

    // 示例类
    [Documentation("用户管理类", Author = "开发团队", Version = "1.0")]
    public class User
    {
        [Documentation("用户唯一标识符")]
        public int Id { get; set; }

        [Required(ErrorMessage = "用户名不能为空")]
        [StringLength(50, MinimumLength = 2, ErrorMessage = "用户名长度必须在2-50个字符之间")]
        [Documentation("用户名")]
        public string Name { get; set; }

        [Required(ErrorMessage = "邮箱不能为空")]
        [EmailAddress(ErrorMessage = "邮箱格式不正确")]
        [Documentation("用户邮箱地址")]
        public string Email { get; set; }

        [ValidateRange(0, 150)]
        [Documentation("用户年龄")]
        public int Age { get; set; }

        [Documentation("用户创建时间")]
        public DateTime CreatedAt { get; set; } = DateTime.Now;

        [Documentation("获取用户显示名称")]
        [Benchmark(Iterations = 5000)]
        public string GetDisplayName()
        {
            return $"{Name} ({Email})";
        }

        [Documentation("验证用户数据")]
        public bool IsValid()
        {
            return !string.IsNullOrEmpty(Name) && 
                   !string.IsNullOrEmpty(Email) && 
                   Age >= 0 && Age <= 150;
        }
    }

    // 反射工具类
    public static class ReflectionHelper
    {
        // 获取类型信息
        public static void AnalyzeType(Type type)
        {
            Console.WriteLine($"\n=== 分析类型: {type.Name} ===");
            
            // 基本信息
            Console.WriteLine($"命名空间: {type.Namespace}");
            Console.WriteLine($"完整名称: {type.FullName}");
            Console.WriteLine($"是否为类: {type.IsClass}");
            Console.WriteLine($"是否为接口: {type.IsInterface}");
            Console.WriteLine($"是否为抽象类: {type.IsAbstract}");
            Console.WriteLine($"是否为密封类: {type.IsSealed}");

            // 继承信息
            if (type.BaseType != null)
            {
                Console.WriteLine($"基类: {type.BaseType.Name}");
            }

            var interfaces = type.GetInterfaces();
            if (interfaces.Length > 0)
            {
                Console.WriteLine($"实现的接口: {string.Join(", ", interfaces.Select(i => i.Name))}");
            }

            // 特性信息
            var attributes = type.GetCustomAttributes();
            if (attributes.Any())
            {
                Console.WriteLine("类特性:");
                foreach (var attr in attributes)
                {
                    Console.WriteLine($"  - {attr.GetType().Name}");
                    if (attr is DocumentationAttribute doc)
                    {
                        Console.WriteLine($"    描述: {doc.Description}");
                        Console.WriteLine($"    作者: {doc.Author}");
                        Console.WriteLine($"    版本: {doc.Version}");
                    }
                }
            }
        }

        // 获取属性信息
        public static void AnalyzeProperties(Type type)
        {
            Console.WriteLine($"\n=== {type.Name} 的属性 ===");
            
            var properties = type.GetProperties(BindingFlags.Public | BindingFlags.Instance);
            
            foreach (var prop in properties)
            {
                Console.WriteLine($"\n属性: {prop.Name}");
                Console.WriteLine($"  类型: {prop.PropertyType.Name}");
                Console.WriteLine($"  可读: {prop.CanRead}");
                Console.WriteLine($"  可写: {prop.CanWrite}");

                // 特性信息
                var attributes = prop.GetCustomAttributes();
                if (attributes.Any())
                {
                    Console.WriteLine("  特性:");
                    foreach (var attr in attributes)
                    {
                        Console.WriteLine($"    - {attr.GetType().Name}");
                        
                        switch (attr)
                        {
                            case RequiredAttribute required:
                                Console.WriteLine($"      错误消息: {required.ErrorMessage}");
                                break;
                            case StringLengthAttribute stringLength:
                                Console.WriteLine($"      最小长度: {stringLength.MinimumLength}");
                                Console.WriteLine($"      最大长度: {stringLength.MaximumLength}");
                                break;
                            case ValidateRangeAttribute range:
                                Console.WriteLine($"      范围: {range.Min} - {range.Max}");
                                break;
                            case DocumentationAttribute doc:
                                Console.WriteLine($"      描述: {doc.Description}");
                                break;
                        }
                    }
                }
            }
        }

        // 获取方法信息
        public static void AnalyzeMethods(Type type)
        {
            Console.WriteLine($"\n=== {type.Name} 的方法 ===");
            
            var methods = type.GetMethods(BindingFlags.Public | BindingFlags.Instance | BindingFlags.DeclaredOnly);
            
            foreach (var method in methods)
            {
                Console.WriteLine($"\n方法: {method.Name}");
                Console.WriteLine($"  返回类型: {method.ReturnType.Name}");
                
                var parameters = method.GetParameters();
                if (parameters.Length > 0)
                {
                    Console.WriteLine("  参数:");
                    foreach (var param in parameters)
                    {
                        Console.WriteLine($"    {param.ParameterType.Name} {param.Name}");
                    }
                }

                // 特性信息
                var attributes = method.GetCustomAttributes();
                if (attributes.Any())
                {
                    Console.WriteLine("  特性:");
                    foreach (var attr in attributes)
                    {
                        Console.WriteLine($"    - {attr.GetType().Name}");
                        
                        if (attr is BenchmarkAttribute benchmark)
                        {
                            Console.WriteLine($"      迭代次数: {benchmark.Iterations}");
                            Console.WriteLine($"      预热: {benchmark.WarmUp}");
                        }
                        else if (attr is DocumentationAttribute doc)
                        {
                            Console.WriteLine($"      描述: {doc.Description}");
                        }
                    }
                }
            }
        }

        // 动态创建实例
        public static object CreateInstance(Type type, params object[] args)
        {
            try
            {
                return Activator.CreateInstance(type, args);
            }
            catch (Exception ex)
            {
                Console.WriteLine($"创建实例失败: {ex.Message}");
                return null;
            }
        }

        // 动态调用方法
        public static object InvokeMethod(object instance, string methodName, params object[] args)
        {
            try
            {
                var type = instance.GetType();
                var method = type.GetMethod(methodName);
                
                if (method == null)
                {
                    Console.WriteLine($"方法 {methodName} 不存在");
                    return null;
                }

                return method.Invoke(instance, args);
            }
            catch (Exception ex)
            {
                Console.WriteLine($"调用方法失败: {ex.Message}");
                return null;
            }
        }

        // 动态设置属性
        public static void SetProperty(object instance, string propertyName, object value)
        {
            try
            {
                var type = instance.GetType();
                var property = type.GetProperty(propertyName);
                
                if (property == null)
                {
                    Console.WriteLine($"属性 {propertyName} 不存在");
                    return;
                }

                if (!property.CanWrite)
                {
                    Console.WriteLine($"属性 {propertyName} 不可写");
                    return;
                }

                property.SetValue(instance, value);
            }
            catch (Exception ex)
            {
                Console.WriteLine($"设置属性失败: {ex.Message}");
            }
        }

        // 动态获取属性
        public static object GetProperty(object instance, string propertyName)
        {
            try
            {
                var type = instance.GetType();
                var property = type.GetProperty(propertyName);
                
                if (property == null)
                {
                    Console.WriteLine($"属性 {propertyName} 不存在");
                    return null;
                }

                if (!property.CanRead)
                {
                    Console.WriteLine($"属性 {propertyName} 不可读");
                    return null;
                }

                return property.GetValue(instance);
            }
            catch (Exception ex)
            {
                Console.WriteLine($"获取属性失败: {ex.Message}");
                return null;
            }
        }
    }

    // 验证器类
    public class Validator
    {
        public static List<string> ValidateObject(object obj)
        {
            var errors = new List<string>();
            var type = obj.GetType();
            var properties = type.GetProperties();

            foreach (var property in properties)
            {
                var value = property.GetValue(obj);
                var attributes = property.GetCustomAttributes();

                foreach (var attribute in attributes)
                {
                    switch (attribute)
                    {
                        case RequiredAttribute required:
                            if (value == null || (value is string str && string.IsNullOrEmpty(str)))
                            {
                                errors.Add(required.ErrorMessage ?? $"{property.Name} 是必需的");
                            }
                            break;

                        case StringLengthAttribute stringLength:
                            if (value is string stringValue)
                            {
                                if (stringValue.Length < stringLength.MinimumLength || 
                                    stringValue.Length > stringLength.MaximumLength)
                                {
                                    errors.Add(stringLength.ErrorMessage ?? 
                                        $"{property.Name} 长度必须在 {stringLength.MinimumLength}-{stringLength.MaximumLength} 之间");
                                }
                            }
                            break;

                        case EmailAddressAttribute email:
                            if (value is string emailValue && !IsValidEmail(emailValue))
                            {
                                errors.Add(email.ErrorMessage ?? $"{property.Name} 不是有效的邮箱地址");
                            }
                            break;

                        case ValidateRangeAttribute range:
                            if (value is IComparable comparable)
                            {
                                var doubleValue = Convert.ToDouble(value);
                                if (doubleValue < range.Min || doubleValue > range.Max)
                                {
                                    errors.Add($"{property.Name} 必须在 {range.Min}-{range.Max} 范围内");
                                }
                            }
                            break;
                    }
                }
            }

            return errors;
        }

        private static bool IsValidEmail(string email)
        {
            try
            {
                var addr = new System.Net.Mail.MailAddress(email);
                return addr.Address == email;
            }
            catch
            {
                return false;
            }
        }
    }

    // 性能测试器
    public class BenchmarkRunner
    {
        public static void RunBenchmarks(object instance)
        {
            var type = instance.GetType();
            var methods = type.GetMethods(BindingFlags.Public | BindingFlags.Instance);

            foreach (var method in methods)
            {
                var benchmarkAttr = method.GetCustomAttribute<BenchmarkAttribute>();
                if (benchmarkAttr != null)
                {
                    Console.WriteLine($"\n运行基准测试: {method.Name}");
                    
                    if (benchmarkAttr.WarmUp)
                    {
                        // 预热
                        for (int i = 0; i < 100; i++)
                        {
                            method.Invoke(instance, null);
                        }
                    }

                    var stopwatch = System.Diagnostics.Stopwatch.StartNew();
                    
                    for (int i = 0; i < benchmarkAttr.Iterations; i++)
                    {
                        method.Invoke(instance, null);
                    }
                    
                    stopwatch.Stop();
                    
                    var avgTime = stopwatch.ElapsedMilliseconds / (double)benchmarkAttr.Iterations;
                    Console.WriteLine($"  迭代次数: {benchmarkAttr.Iterations}");
                    Console.WriteLine($"  总时间: {stopwatch.ElapsedMilliseconds}ms");
                    Console.WriteLine($"  平均时间: {avgTime:F4}ms");
                }
            }
        }
    }

    // 程序入口
    public class Program
    {
        public static void Main(string[] args)
        {
            Console.WriteLine("=== C# 反射和特性示例 ===");

            // 1. 类型分析
            var userType = typeof(User);
            ReflectionHelper.AnalyzeType(userType);
            ReflectionHelper.AnalyzeProperties(userType);
            ReflectionHelper.AnalyzeMethods(userType);

            // 2. 动态创建和操作实例
            Console.WriteLine("\n=== 动态实例操作 ===");
            var user = ReflectionHelper.CreateInstance(userType) as User;
            
            if (user != null)
            {
                ReflectionHelper.SetProperty(user, "Name", "张三");
                ReflectionHelper.SetProperty(user, "Email", "zhangsan@example.com");
                ReflectionHelper.SetProperty(user, "Age", 25);

                Console.WriteLine($"用户名: {ReflectionHelper.GetProperty(user, "Name")}");
                Console.WriteLine($"邮箱: {ReflectionHelper.GetProperty(user, "Email")}");
                Console.WriteLine($"年龄: {ReflectionHelper.GetProperty(user, "Age")}");

                var displayName = ReflectionHelper.InvokeMethod(user, "GetDisplayName");
                Console.WriteLine($"显示名称: {displayName}");
            }

            // 3. 验证示例
            Console.WriteLine("\n=== 验证示例 ===");
            var validUser = new User
            {
                Name = "李四",
                Email = "lisi@example.com",
                Age = 30
            };

            var invalidUser = new User
            {
                Name = "",
                Email = "invalid-email",
                Age = 200
            };

            var validErrors = Validator.ValidateObject(validUser);
            var invalidErrors = Validator.ValidateObject(invalidUser);

            Console.WriteLine($"有效用户验证错误数: {validErrors.Count}");
            Console.WriteLine($"无效用户验证错误数: {invalidErrors.Count}");
            
            if (invalidErrors.Any())
            {
                Console.WriteLine("验证错误:");
                foreach (var error in invalidErrors)
                {
                    Console.WriteLine($"  - {error}");
                }
            }

            // 4. 性能测试
            Console.WriteLine("\n=== 性能测试 ===");
            BenchmarkRunner.RunBenchmarks(validUser);

            Console.WriteLine("\n反射和特性示例完成!");
        }
    }
}
