/**
 * C# LINQ和表达式示例
 */
using System;
using System.Collections.Generic;
using System.Linq;
using System.Linq.Expressions;
using System.Reflection;

namespace LinqExpressions
{
    // 数据模型
    public class Employee
    {
        public int Id { get; set; }
        public string Name { get; set; }
        public string Department { get; set; }
        public decimal Salary { get; set; }
        public int Age { get; set; }
        public DateTime HireDate { get; set; }
        public List<string> Skills { get; set; } = new List<string>();

        public override string ToString()
        {
            return $"Employee(Id: {Id}, Name: {Name}, Dept: {Department}, Salary: {Salary:C}, Age: {Age})";
        }
    }

    public class Project
    {
        public int Id { get; set; }
        public string Name { get; set; }
        public string Department { get; set; }
        public decimal Budget { get; set; }
        public DateTime StartDate { get; set; }
        public DateTime? EndDate { get; set; }
    }

    // LINQ查询示例
    public class LinqQueryExamples
    {
        private static List<Employee> GetEmployees()
        {
            return new List<Employee>
            {
                new Employee { Id = 1, Name = "张三", Department = "技术部", Salary = 8000, Age = 28, HireDate = new DateTime(2020, 1, 15), Skills = new List<string> { "C#", "SQL", "JavaScript" } },
                new Employee { Id = 2, Name = "李四", Department = "销售部", Salary = 6000, Age = 32, HireDate = new DateTime(2019, 3, 20), Skills = new List<string> { "销售", "客户关系" } },
                new Employee { Id = 3, Name = "王五", Department = "技术部", Salary = 12000, Age = 35, HireDate = new DateTime(2018, 6, 10), Skills = new List<string> { "C#", "架构设计", "团队管理" } },
                new Employee { Id = 4, Name = "赵六", Department = "人事部", Salary = 7000, Age = 29, HireDate = new DateTime(2021, 2, 5), Skills = new List<string> { "招聘", "培训" } },
                new Employee { Id = 5, Name = "钱七", Department = "技术部", Salary = 9500, Age = 26, HireDate = new DateTime(2020, 8, 12), Skills = new List<string> { "Python", "数据分析", "机器学习" } },
                new Employee { Id = 6, Name = "孙八", Department = "销售部", Salary = 5500, Age = 24, HireDate = new DateTime(2022, 1, 8), Skills = new List<string> { "市场营销", "数字营销" } },
                new Employee { Id = 7, Name = "周九", Department = "财务部", Salary = 8500, Age = 31, HireDate = new DateTime(2019, 11, 25), Skills = new List<string> { "会计", "财务分析" } },
                new Employee { Id = 8, Name = "吴十", Department = "技术部", Salary = 11000, Age = 33, HireDate = new DateTime(2017, 4, 18), Skills = new List<string> { "Java", "微服务", "DevOps" } }
            };
        }

        private static List<Project> GetProjects()
        {
            return new List<Project>
            {
                new Project { Id = 1, Name = "电商平台", Department = "技术部", Budget = 500000, StartDate = new DateTime(2023, 1, 1), EndDate = new DateTime(2023, 12, 31) },
                new Project { Id = 2, Name = "客户管理系统", Department = "销售部", Budget = 200000, StartDate = new DateTime(2023, 3, 1), EndDate = null },
                new Project { Id = 3, Name = "数据分析平台", Department = "技术部", Budget = 300000, StartDate = new DateTime(2023, 2, 15), EndDate = new DateTime(2023, 8, 15) },
                new Project { Id = 4, Name = "人力资源系统", Department = "人事部", Budget = 150000, StartDate = new DateTime(2023, 4, 1), EndDate = new DateTime(2023, 10, 1) }
            };
        }

        public static void BasicLinqQueries()
        {
            Console.WriteLine("\n=== 基础LINQ查询 ===");
            var employees = GetEmployees();

            // Where - 过滤
            var techEmployees = employees.Where(e => e.Department == "技术部").ToList();
            Console.WriteLine($"技术部员工数量: {techEmployees.Count}");

            // Select - 投影
            var employeeNames = employees.Select(e => e.Name).ToList();
            Console.WriteLine($"所有员工姓名: {string.Join(", ", employeeNames)}");

            // OrderBy - 排序
            var sortedBySalary = employees.OrderByDescending(e => e.Salary).ToList();
            Console.WriteLine("按薪资降序排列:");
            sortedBySalary.Take(3).ToList().ForEach(e => Console.WriteLine($"  {e.Name}: {e.Salary:C}"));

            // GroupBy - 分组
            var groupedByDepartment = employees.GroupBy(e => e.Department).ToList();
            Console.WriteLine("\n按部门分组:");
            foreach (var group in groupedByDepartment)
            {
                Console.WriteLine($"  {group.Key}: {group.Count()}人");
            }

            // Aggregate - 聚合
            var totalSalary = employees.Sum(e => e.Salary);
            var averageSalary = employees.Average(e => e.Salary);
            var maxSalary = employees.Max(e => e.Salary);
            var minSalary = employees.Min(e => e.Salary);

            Console.WriteLine($"\n薪资统计:");
            Console.WriteLine($"  总薪资: {totalSalary:C}");
            Console.WriteLine($"  平均薪资: {averageSalary:C}");
            Console.WriteLine($"  最高薪资: {maxSalary:C}");
            Console.WriteLine($"  最低薪资: {minSalary:C}");
        }

        public static void AdvancedLinqQueries()
        {
            Console.WriteLine("\n=== 高级LINQ查询 ===");
            var employees = GetEmployees();
            var projects = GetProjects();

            // Join - 连接
            var employeeProjects = employees
                .Join(projects,
                    emp => emp.Department,
                    proj => proj.Department,
                    (emp, proj) => new { Employee = emp.Name, Project = proj.Name, Department = emp.Department })
                .ToList();

            Console.WriteLine("员工项目匹配:");
            employeeProjects.ForEach(ep => Console.WriteLine($"  {ep.Employee} -> {ep.Project} ({ep.Department})"));

            // GroupJoin - 分组连接
            var departmentInfo = employees
                .GroupBy(e => e.Department)
                .GroupJoin(projects,
                    empGroup => empGroup.Key,
                    proj => proj.Department,
                    (empGroup, projGroup) => new
                    {
                        Department = empGroup.Key,
                        EmployeeCount = empGroup.Count(),
                        AverageSalary = empGroup.Average(e => e.Salary),
                        Projects = projGroup.Select(p => p.Name).ToList()
                    })
                .ToList();

            Console.WriteLine("\n部门信息:");
            foreach (var dept in departmentInfo)
            {
                Console.WriteLine($"  {dept.Department}:");
                Console.WriteLine($"    员工数: {dept.EmployeeCount}");
                Console.WriteLine($"    平均薪资: {dept.AverageSalary:C}");
                Console.WriteLine($"    项目: {string.Join(", ", dept.Projects)}");
            }

            // SelectMany - 扁平化
            var allSkills = employees.SelectMany(e => e.Skills).Distinct().ToList();
            Console.WriteLine($"\n所有技能: {string.Join(", ", allSkills)}");

            // 复杂查询 - 查找拥有特定技能的高薪员工
            var seniorDevelopers = employees
                .Where(e => e.Skills.Any(s => s.Contains("C#") || s.Contains("Java")))
                .Where(e => e.Salary > 8000)
                .OrderByDescending(e => e.Salary)
                .Select(e => new { e.Name, e.Salary, TechSkills = e.Skills.Where(s => s.Contains("C#") || s.Contains("Java")) })
                .ToList();

            Console.WriteLine("\n高薪技术员工:");
            seniorDevelopers.ForEach(dev => 
                Console.WriteLine($"  {dev.Name}: {dev.Salary:C} - 技能: {string.Join(", ", dev.TechSkills)}"));
        }

        public static void LinqMethodChaining()
        {
            Console.WriteLine("\n=== LINQ方法链 ===");
            var employees = GetEmployees();

            // 复杂的方法链
            var result = employees
                .Where(e => e.Age >= 25 && e.Age <= 35)
                .GroupBy(e => e.Department)
                .Where(g => g.Count() >= 2)
                .Select(g => new
                {
                    Department = g.Key,
                    EmployeeCount = g.Count(),
                    AverageSalary = g.Average(e => e.Salary),
                    TopEarner = g.OrderByDescending(e => e.Salary).First().Name,
                    TotalSkills = g.SelectMany(e => e.Skills).Distinct().Count()
                })
                .OrderByDescending(d => d.AverageSalary)
                .ToList();

            Console.WriteLine("部门分析 (25-35岁员工，至少2人):");
            foreach (var dept in result)
            {
                Console.WriteLine($"  {dept.Department}:");
                Console.WriteLine($"    员工数: {dept.EmployeeCount}");
                Console.WriteLine($"    平均薪资: {dept.AverageSalary:C}");
                Console.WriteLine($"    最高薪资员工: {dept.TopEarner}");
                Console.WriteLine($"    技能种类数: {dept.TotalSkills}");
            }
        }
    }

    // 表达式树示例
    public class ExpressionTreeExamples
    {
        public static void BasicExpressionTrees()
        {
            Console.WriteLine("\n=== 基础表达式树 ===");

            // 手动构建表达式树: x => x * 2
            var parameter = Expression.Parameter(typeof(int), "x");
            var constant = Expression.Constant(2);
            var multiply = Expression.Multiply(parameter, constant);
            var lambda = Expression.Lambda<Func<int, int>>(multiply, parameter);

            var compiled = lambda.Compile();
            Console.WriteLine($"表达式 x => x * 2, x=5: {compiled(5)}");

            // 从Lambda表达式创建表达式树
            Expression<Func<int, bool>> predicate = x => x > 10;
            Console.WriteLine($"表达式树: {predicate}");

            var compiledPredicate = predicate.Compile();
            Console.WriteLine($"x > 10, x=15: {compiledPredicate(15)}");
            Console.WriteLine($"x > 10, x=5: {compiledPredicate(5)}");
        }

        public static void ExpressionTreeAnalysis()
        {
            Console.WriteLine("\n=== 表达式树分析 ===");

            Expression<Func<Employee, bool>> employeeFilter = emp => emp.Salary > 8000 && emp.Department == "技术部";

            Console.WriteLine("分析表达式树结构:");
            AnalyzeExpression(employeeFilter.Body, 0);

            // 修改表达式树
            var modifiedExpression = ModifyExpression(employeeFilter);
            Console.WriteLine($"\n修改后的表达式: {modifiedExpression}");

            var employees = LinqQueryExamples.GetEmployees();
            var originalResults = employees.Where(employeeFilter.Compile()).ToList();
            var modifiedResults = employees.Where(modifiedExpression.Compile()).ToList();

            Console.WriteLine($"\n原始过滤结果: {originalResults.Count}人");
            Console.WriteLine($"修改后过滤结果: {modifiedResults.Count}人");
        }

        private static void AnalyzeExpression(Expression expression, int depth)
        {
            var indent = new string(' ', depth * 2);
            Console.WriteLine($"{indent}{expression.NodeType}: {expression.Type.Name}");

            switch (expression)
            {
                case BinaryExpression binary:
                    Console.WriteLine($"{indent}  Left:");
                    AnalyzeExpression(binary.Left, depth + 2);
                    Console.WriteLine($"{indent}  Right:");
                    AnalyzeExpression(binary.Right, depth + 2);
                    break;

                case MemberExpression member:
                    Console.WriteLine($"{indent}  Member: {member.Member.Name}");
                    if (member.Expression != null)
                    {
                        Console.WriteLine($"{indent}  Expression:");
                        AnalyzeExpression(member.Expression, depth + 2);
                    }
                    break;

                case ConstantExpression constant:
                    Console.WriteLine($"{indent}  Value: {constant.Value}");
                    break;

                case ParameterExpression parameter:
                    Console.WriteLine($"{indent}  Parameter: {parameter.Name}");
                    break;
            }
        }

        private static Expression<Func<Employee, bool>> ModifyExpression(Expression<Func<Employee, bool>> original)
        {
            // 将薪资条件从 > 8000 改为 > 7000
            var visitor = new SalaryModifierVisitor();
            var modifiedBody = visitor.Visit(original.Body);
            return Expression.Lambda<Func<Employee, bool>>(modifiedBody, original.Parameters);
        }

        private class SalaryModifierVisitor : ExpressionVisitor
        {
            protected override Expression VisitBinary(BinaryExpression node)
            {
                if (node.NodeType == ExpressionType.GreaterThan &&
                    node.Left is MemberExpression member &&
                    member.Member.Name == "Salary" &&
                    node.Right is ConstantExpression constant &&
                    constant.Value.Equals(8000m))
                {
                    // 将8000改为7000
                    var newConstant = Expression.Constant(7000m);
                    return Expression.GreaterThan(node.Left, newConstant);
                }

                return base.VisitBinary(node);
            }
        }
    }

    // 动态查询构建器
    public class DynamicQueryBuilder
    {
        public static Expression<Func<Employee, bool>> BuildDynamicFilter(
            string department = null,
            decimal? minSalary = null,
            decimal? maxSalary = null,
            int? minAge = null,
            int? maxAge = null,
            List<string> requiredSkills = null)
        {
            var parameter = Expression.Parameter(typeof(Employee), "emp");
            Expression body = Expression.Constant(true); // 开始条件为true

            // 部门条件
            if (!string.IsNullOrEmpty(department))
            {
                var departmentProperty = Expression.Property(parameter, nameof(Employee.Department));
                var departmentConstant = Expression.Constant(department);
                var departmentCondition = Expression.Equal(departmentProperty, departmentConstant);
                body = Expression.AndAlso(body, departmentCondition);
            }

            // 最低薪资条件
            if (minSalary.HasValue)
            {
                var salaryProperty = Expression.Property(parameter, nameof(Employee.Salary));
                var minSalaryConstant = Expression.Constant(minSalary.Value);
                var minSalaryCondition = Expression.GreaterThanOrEqual(salaryProperty, minSalaryConstant);
                body = Expression.AndAlso(body, minSalaryCondition);
            }

            // 最高薪资条件
            if (maxSalary.HasValue)
            {
                var salaryProperty = Expression.Property(parameter, nameof(Employee.Salary));
                var maxSalaryConstant = Expression.Constant(maxSalary.Value);
                var maxSalaryCondition = Expression.LessThanOrEqual(salaryProperty, maxSalaryConstant);
                body = Expression.AndAlso(body, maxSalaryCondition);
            }

            // 年龄范围条件
            if (minAge.HasValue)
            {
                var ageProperty = Expression.Property(parameter, nameof(Employee.Age));
                var minAgeConstant = Expression.Constant(minAge.Value);
                var minAgeCondition = Expression.GreaterThanOrEqual(ageProperty, minAgeConstant);
                body = Expression.AndAlso(body, minAgeCondition);
            }

            if (maxAge.HasValue)
            {
                var ageProperty = Expression.Property(parameter, nameof(Employee.Age));
                var maxAgeConstant = Expression.Constant(maxAge.Value);
                var maxAgeCondition = Expression.LessThanOrEqual(ageProperty, maxAgeConstant);
                body = Expression.AndAlso(body, maxAgeCondition);
            }

            // 技能条件
            if (requiredSkills != null && requiredSkills.Any())
            {
                var skillsProperty = Expression.Property(parameter, nameof(Employee.Skills));
                
                foreach (var skill in requiredSkills)
                {
                    var containsMethod = typeof(List<string>).GetMethod("Contains", new[] { typeof(string) });
                    var skillConstant = Expression.Constant(skill);
                    var containsCall = Expression.Call(skillsProperty, containsMethod, skillConstant);
                    body = Expression.AndAlso(body, containsCall);
                }
            }

            return Expression.Lambda<Func<Employee, bool>>(body, parameter);
        }

        public static void DemonstrateDynamicQueries()
        {
            Console.WriteLine("\n=== 动态查询构建 ===");
            var employees = LinqQueryExamples.GetEmployees();

            // 查询1: 技术部，薪资8000-12000
            var filter1 = BuildDynamicFilter(
                department: "技术部",
                minSalary: 8000,
                maxSalary: 12000
            );

            var result1 = employees.Where(filter1.Compile()).ToList();
            Console.WriteLine($"技术部薪资8000-12000的员工: {result1.Count}人");
            result1.ForEach(e => Console.WriteLine($"  {e.Name}: {e.Salary:C}"));

            // 查询2: 年龄25-30，拥有C#技能
            var filter2 = BuildDynamicFilter(
                minAge: 25,
                maxAge: 30,
                requiredSkills: new List<string> { "C#" }
            );

            var result2 = employees.Where(filter2.Compile()).ToList();
            Console.WriteLine($"\n年龄25-30且拥有C#技能的员工: {result2.Count}人");
            result2.ForEach(e => Console.WriteLine($"  {e.Name}: {e.Age}岁, 技能: {string.Join(", ", e.Skills)}"));

            Console.WriteLine($"\n动态生成的表达式1: {filter1}");
            Console.WriteLine($"动态生成的表达式2: {filter2}");
        }
    }

    // 主程序
    public class Program
    {
        public static void Main(string[] args)
        {
            Console.WriteLine("=== C# LINQ和表达式示例 ===");

            LinqQueryExamples.BasicLinqQueries();
            LinqQueryExamples.AdvancedLinqQueries();
            LinqQueryExamples.LinqMethodChaining();

            ExpressionTreeExamples.BasicExpressionTrees();
            ExpressionTreeExamples.ExpressionTreeAnalysis();

            DynamicQueryBuilder.DemonstrateDynamicQueries();

            Console.WriteLine("\n所有LINQ和表达式示例完成!");
        }
    }
}
