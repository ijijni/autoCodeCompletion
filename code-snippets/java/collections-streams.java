// Java集合和Stream API代码片段
// 用于测试AI代码补全功能

import java.util.*;
import java.util.concurrent.*;
import java.util.function.*;
import java.util.stream.*;
import java.time.*;
import java.time.format.*;
import java.util.regex.*;
import java.math.*;
import java.io.*;
import java.nio.file.*;

// 1. 基础集合操作演示
// ======================

public class CollectionsAndStreamsDemo {
    
    // 学生数据类
    public static class Student {
        private final String name;
        private final int age;
        private final String major;
        private final double gpa;
        private final List<String> courses;
        private final LocalDate enrollmentDate;
        
        public Student(String name, int age, String major, double gpa, List<String> courses, LocalDate enrollmentDate) {
            this.name = name;
            this.age = age;
            this.major = major;
            this.gpa = gpa;
            this.courses = new ArrayList<>(courses);
            this.enrollmentDate = enrollmentDate;
        }
        
        // Getters
        public String getName() { return name; }
        public int getAge() { return age; }
        public String getMajor() { return major; }
        public double getGpa() { return gpa; }
        public List<String> getCourses() { return new ArrayList<>(courses); }
        public LocalDate getEnrollmentDate() { return enrollmentDate; }
        
        @Override
        public String toString() {
            return String.format("Student{name='%s', age=%d, major='%s', gpa=%.2f, courses=%s}", 
                               name, age, major, gpa, courses);
        }
        
        @Override
        public boolean equals(Object obj) {
            if (this == obj) return true;
            if (obj == null || getClass() != obj.getClass()) return false;
            Student student = (Student) obj;
            return Objects.equals(name, student.name) && 
                   Objects.equals(major, student.major);
        }
        
        @Override
        public int hashCode() {
            return Objects.hash(name, major);
        }
        // AI补全点
    }
    
    // 2. List操作演示
    // ======================
    
    public static void demonstrateListOperations() {
        System.out.println("=== List操作演示 ===");
        
        // 创建和初始化List
        List<String> fruits = new ArrayList<>(Arrays.asList("苹果", "香蕉", "橘子", "葡萄"));
        List<Integer> numbers = IntStream.range(1, 11).boxed().collect(Collectors.toList());
        
        // List基本操作
        fruits.add("草莓");
        fruits.add(2, "芒果");
        fruits.remove("香蕉");
        
        System.out.println("水果列表: " + fruits);
        System.out.println("第一个水果: " + fruits.get(0));
        System.out.println("最后一个水果: " + fruits.get(fruits.size() - 1));
        
        // List排序和搜索
        List<String> sortedFruits = fruits.stream()
            .sorted()
            .collect(Collectors.toList());
        System.out.println("排序后的水果: " + sortedFruits);
        
        // List子列表操作
        List<Integer> firstFive = numbers.subList(0, 5);
        System.out.println("前五个数字: " + firstFive);
        
        // List转换操作
        List<String> numberStrings = numbers.stream()
            .map(String::valueOf)
            .collect(Collectors.toList());
        System.out.println("数字字符串: " + numberStrings);
        
        // AI补全点
    }
    
    // 3. Set操作演示
    // ======================
    
    public static void demonstrateSetOperations() {
        System.out.println("\n=== Set操作演示 ===");
        
        // 创建不同类型的Set
        Set<String> hashSet = new HashSet<>(Arrays.asList("Java", "Python", "C++", "JavaScript"));
        Set<String> linkedHashSet = new LinkedHashSet<>(Arrays.asList("HTML", "CSS", "JavaScript", "React"));
        TreeSet<Integer> treeSet = new TreeSet<>(Arrays.asList(5, 2, 8, 1, 9, 3));
        
        System.out.println("HashSet (无序): " + hashSet);
        System.out.println("LinkedHashSet (插入顺序): " + linkedHashSet);
        System.out.println("TreeSet (自然排序): " + treeSet);
        
        // Set集合运算
        Set<String> programming = new HashSet<>(Arrays.asList("Java", "Python", "C++"));
        Set<String> web = new HashSet<>(Arrays.asList("JavaScript", "HTML", "CSS", "Python"));
        
        // 并集
        Set<String> union = new HashSet<>(programming);
        union.addAll(web);
        System.out.println("并集: " + union);
        
        // 交集
        Set<String> intersection = new HashSet<>(programming);
        intersection.retainAll(web);
        System.out.println("交集: " + intersection);
        
        // 差集
        Set<String> difference = new HashSet<>(programming);
        difference.removeAll(web);
        System.out.println("差集: " + difference);
        
        // 使用Stream进行Set操作
        Set<String> filteredLanguages = hashSet.stream()
            .filter(lang -> lang.length() > 4)
            .collect(Collectors.toSet());
        System.out.println("长度大于4的语言: " + filteredLanguages);
        
        // AI补全点
    }
    
    // 4. Map操作演示
    // ======================
    
    public static void demonstrateMapOperations() {
        System.out.println("\n=== Map操作演示 ===");
        
        // 创建和初始化Map
        Map<String, Integer> ageMap = new HashMap<>();
        ageMap.put("Alice", 25);
        ageMap.put("Bob", 30);
        ageMap.put("Charlie", 35);
        ageMap.put("Diana", 28);
        
        // Map基本操作
        System.out.println("年龄映射: " + ageMap);
        System.out.println("Alice的年龄: " + ageMap.get("Alice"));
        System.out.println("是否包含Bob: " + ageMap.containsKey("Bob"));
        System.out.println("是否包含年龄30: " + ageMap.containsValue(30));
        
        // Map高级操作
        ageMap.putIfAbsent("Eve", 32);
        ageMap.compute("Alice", (key, value) -> value + 1);
        ageMap.computeIfAbsent("Frank", key -> key.length() * 5);
        ageMap.merge("Bob", 5, Integer::sum);
        
        System.out.println("操作后的年龄映射: " + ageMap);
        
        // Map遍历
        System.out.println("遍历Map:");
        ageMap.forEach((name, age) -> 
            System.out.println(name + " -> " + age + " 岁"));
        
        // Map排序
        Map<String, Integer> sortedByAge = ageMap.entrySet().stream()
            .sorted(Map.Entry.comparingByValue())
            .collect(Collectors.toLinkedHashMap(
                Map.Entry::getKey,
                Map.Entry::getValue,
                (e1, e2) -> e1,
                LinkedHashMap::new
            ));
        System.out.println("按年龄排序: " + sortedByAge);
        
        // 分组操作
        Map<String, List<String>> groupedByFirstLetter = ageMap.keySet().stream()
            .collect(Collectors.groupingBy(name -> String.valueOf(name.charAt(0))));
        System.out.println("按首字母分组: " + groupedByFirstLetter);
        
        // AI补全点
    }
    
    // 5. Stream API基础操作
    // ======================
    
    public static void demonstrateBasicStreamOperations() {
        System.out.println("\n=== Stream基础操作演示 ===");
        
        List<Integer> numbers = Arrays.asList(1, 2, 3, 4, 5, 6, 7, 8, 9, 10);
        
        // 过滤操作
        List<Integer> evenNumbers = numbers.stream()
            .filter(n -> n % 2 == 0)
            .collect(Collectors.toList());
        System.out.println("偶数: " + evenNumbers);
        
        // 映射操作
        List<Integer> squares = numbers.stream()
            .map(n -> n * n)
            .collect(Collectors.toList());
        System.out.println("平方数: " + squares);
        
        // 排序操作
        List<Integer> sortedDesc = numbers.stream()
            .sorted(Comparator.reverseOrder())
            .collect(Collectors.toList());
        System.out.println("降序排列: " + sortedDesc);
        
        // 限制和跳过
        List<Integer> middleNumbers = numbers.stream()
            .skip(3)
            .limit(4)
            .collect(Collectors.toList());
        System.out.println("中间4个数字: " + middleNumbers);
        
        // 去重
        List<Integer> duplicates = Arrays.asList(1, 2, 2, 3, 3, 3, 4, 4, 4, 4);
        List<Integer> distinct = duplicates.stream()
            .distinct()
            .collect(Collectors.toList());
        System.out.println("去重后: " + distinct);
        
        // 查找操作
        Optional<Integer> first = numbers.stream()
            .filter(n -> n > 5)
            .findFirst();
        System.out.println("第一个大于5的数: " + first.orElse(-1));
        
        Optional<Integer> any = numbers.stream()
            .filter(n -> n > 5)
            .findAny();
        System.out.println("任意一个大于5的数: " + any.orElse(-1));
        
        // 检查操作
        boolean allEven = numbers.stream().allMatch(n -> n % 2 == 0);
        boolean anyEven = numbers.stream().anyMatch(n -> n % 2 == 0);
        boolean noneNegative = numbers.stream().noneMatch(n -> n < 0);
        
        System.out.println("全部是偶数: " + allEven);
        System.out.println("存在偶数: " + anyEven);
        System.out.println("没有负数: " + noneNegative);
        
        // AI补全点
    }
    
    // 6. Stream高级操作和收集器
    // ======================
    
    public static void demonstrateAdvancedStreamOperations() {
        System.out.println("\n=== Stream高级操作演示 ===");
        
        // 创建学生数据
        List<Student> students = Arrays.asList(
            new Student("Alice", 20, "Computer Science", 3.8, 
                       Arrays.asList("Java", "Data Structures", "Algorithms"), 
                       LocalDate.of(2020, 9, 1)),
            new Student("Bob", 21, "Mathematics", 3.6, 
                       Arrays.asList("Calculus", "Linear Algebra", "Statistics"), 
                       LocalDate.of(2019, 9, 1)),
            new Student("Charlie", 19, "Computer Science", 3.9, 
                       Arrays.asList("Java", "Web Development", "Database"), 
                       LocalDate.of(2021, 9, 1)),
            new Student("Diana", 22, "Physics", 3.7, 
                       Arrays.asList("Quantum Mechanics", "Thermodynamics"), 
                       LocalDate.of(2018, 9, 1)),
            new Student("Eve", 20, "Mathematics", 3.5, 
                       Arrays.asList("Calculus", "Probability", "Statistics"), 
                       LocalDate.of(2020, 9, 1))
        );
        
        // 分组操作
        Map<String, List<Student>> studentsByMajor = students.stream()
            .collect(Collectors.groupingBy(Student::getMajor));
        System.out.println("按专业分组:");
        studentsByMajor.forEach((major, studentList) -> {
            System.out.println("  " + major + ": " + studentList.size() + " 人");
        });
        
        // 多级分组
        Map<String, Map<Boolean, List<Student>>> groupedByMajorAndAge = students.stream()
            .collect(Collectors.groupingBy(
                Student::getMajor,
                Collectors.partitioningBy(student -> student.getAge() >= 21)
            ));
        System.out.println("按专业和年龄分组: " + groupedByMajorAndAge.keySet());
        
        // 统计操作
        DoubleSummaryStatistics gpaStats = students.stream()
            .collect(Collectors.summarizingDouble(Student::getGpa));
        System.out.println("GPA统计: " + gpaStats);
        
        // 平均值计算
        OptionalDouble averageGpa = students.stream()
            .mapToDouble(Student::getGpa)
            .average();
        System.out.println("平均GPA: " + averageGpa.orElse(0.0));
        
        // 最值操作
        Optional<Student> topStudent = students.stream()
            .max(Comparator.comparing(Student::getGpa));
        System.out.println("GPA最高的学生: " + topStudent.orElse(null));
        
        Optional<Student> youngestStudent = students.stream()
            .min(Comparator.comparing(Student::getAge));
        System.out.println("年龄最小的学生: " + youngestStudent.orElse(null));
        
        // 连接操作
        String allNames = students.stream()
            .map(Student::getName)
            .collect(Collectors.joining(", ", "[", "]"));
        System.out.println("所有学生姓名: " + allNames);
        
        // 自定义收集器
        String majorSummary = students.stream()
            .collect(Collector.of(
                () -> new HashMap<String, Integer>(),
                (map, student) -> map.merge(student.getMajor(), 1, Integer::sum),
                (map1, map2) -> { map1.putAll(map2); return map1; },
                map -> map.entrySet().stream()
                    .map(entry -> entry.getKey() + "(" + entry.getValue() + ")")
                    .collect(Collectors.joining(", "))
            ));
        System.out.println("专业统计: " + majorSummary);
        
        // AI补全点
    }
    
    // 7. 并行Stream操作
    // ======================
    
    public static void demonstrateParallelStreams() {
        System.out.println("\n=== 并行Stream演示 ===");
        
        List<Integer> largeNumbers = IntStream.range(1, 1000000)
            .boxed()
            .collect(Collectors.toList());
        
        // 串行vs并行性能比较
        long startTime, endTime;
        
        // 串行计算
        startTime = System.currentTimeMillis();
        long serialSum = largeNumbers.stream()
            .mapToLong(Integer::longValue)
            .filter(n -> n % 2 == 0)
            .map(n -> n * n)
            .sum();
        endTime = System.currentTimeMillis();
        System.out.println("串行计算结果: " + serialSum + ", 耗时: " + (endTime - startTime) + "ms");
        
        // 并行计算
        startTime = System.currentTimeMillis();
        long parallelSum = largeNumbers.parallelStream()
            .mapToLong(Integer::longValue)
            .filter(n -> n % 2 == 0)
            .map(n -> n * n)
            .sum();
        endTime = System.currentTimeMillis();
        System.out.println("并行计算结果: " + parallelSum + ", 耗时: " + (endTime - startTime) + "ms");
        
        // 并行分组
        Map<Boolean, List<Integer>> parallelGrouped = largeNumbers.parallelStream()
            .limit(1000)
            .collect(Collectors.groupingBy(n -> n % 2 == 0));
        System.out.println("并行分组 - 偶数数量: " + parallelGrouped.get(true).size());
        System.out.println("并行分组 - 奇数数量: " + parallelGrouped.get(false).size());
        
        // 并行归约
        Optional<Integer> parallelMax = largeNumbers.parallelStream()
            .limit(10000)
            .reduce(Integer::max);
        System.out.println("并行最大值: " + parallelMax.orElse(-1));
        
        // AI补全点
    }
    
    // 8. 函数式接口和Lambda表达式
    // ======================
    
    public static void demonstrateFunctionalInterfaces() {
        System.out.println("\n=== 函数式接口演示 ===");
        
        List<String> words = Arrays.asList("apple", "banana", "cherry", "date", "elderberry");
        
        // Predicate - 断言型接口
        Predicate<String> isLongWord = word -> word.length() > 5;
        Predicate<String> startsWithC = word -> word.startsWith("c");
        Predicate<String> complexPredicate = isLongWord.and(startsWithC);
        
        List<String> filteredWords = words.stream()
            .filter(complexPredicate)
            .collect(Collectors.toList());
        System.out.println("长度>5且以c开头的单词: " + filteredWords);
        
        // Function - 函数型接口
        Function<String, Integer> wordLength = String::length;
        Function<Integer, String> numberToString = Object::toString;
        Function<String, String> wordLengthString = wordLength.andThen(numberToString);
        
        List<String> lengthStrings = words.stream()
            .map(wordLengthString)
            .collect(Collectors.toList());
        System.out.println("单词长度字符串: " + lengthStrings);
        
        // Consumer - 消费型接口
        Consumer<String> printUpperCase = word -> System.out.print(word.toUpperCase() + " ");
        Consumer<String> printWithLength = word -> System.out.print("(" + word.length() + ") ");
        Consumer<String> combinedConsumer = printUpperCase.andThen(printWithLength);
        
        System.out.print("组合消费者输出: ");
        words.forEach(combinedConsumer);
        System.out.println();
        
        // Supplier - 供给型接口
        Supplier<String> randomWord = () -> words.get((int) (Math.random() * words.size()));
        System.out.println("随机单词: " + randomWord.get());
        
        // BiFunction - 双参数函数
        BiFunction<String, String, String> combineWords = (w1, w2) -> w1 + "-" + w2;
        String combined = words.stream()
            .reduce(combineWords::apply)
            .orElse("");
        System.out.println("组合单词: " + combined);
        
        // UnaryOperator - 一元操作符
        UnaryOperator<String> addPrefix = word -> "prefix_" + word;
        List<String> prefixedWords = words.stream()
            .map(addPrefix)
            .collect(Collectors.toList());
        System.out.println("添加前缀的单词: " + prefixedWords);
        
        // BinaryOperator - 二元操作符
        BinaryOperator<String> longerWord = (w1, w2) -> w1.length() >= w2.length() ? w1 : w2;
        Optional<String> longest = words.stream()
            .reduce(longerWord);
        System.out.println("最长的单词: " + longest.orElse(""));
        
        // AI补全点
    }
    
    // 9. 流的创建和操作
    // ======================
    
    public static void demonstrateStreamCreation() {
        System.out.println("\n=== Stream创建方式演示 ===");
        
        // 从集合创建
        List<String> list = Arrays.asList("a", "b", "c");
        Stream<String> fromCollection = list.stream();
        System.out.println("从集合创建: " + fromCollection.collect(Collectors.toList()));
        
        // 从数组创建
        String[] array = {"x", "y", "z"};
        Stream<String> fromArray = Arrays.stream(array);
        System.out.println("从数组创建: " + fromArray.collect(Collectors.toList()));
        
        // 使用Stream.of()
        Stream<Integer> fromValues = Stream.of(1, 2, 3, 4, 5);
        System.out.println("使用Stream.of: " + fromValues.collect(Collectors.toList()));
        
        // 无限流
        Stream<Integer> infiniteStream = Stream.iterate(0, n -> n + 2);
        List<Integer> evenNumbers = infiniteStream
            .limit(10)
            .collect(Collectors.toList());
        System.out.println("无限流(前10个偶数): " + evenNumbers);
        
        // 使用generate创建
        Stream<Double> randomNumbers = Stream.generate(Math::random);
        List<Double> randomList = randomNumbers
            .limit(5)
            .collect(Collectors.toList());
        System.out.println("随机数流: " + randomList);
        
        // 范围流
        IntStream range = IntStream.range(1, 6);
        System.out.println("范围流: " + range.boxed().collect(Collectors.toList()));
        
        IntStream rangeClosed = IntStream.rangeClosed(1, 5);
        System.out.println("闭区间范围流: " + rangeClosed.boxed().collect(Collectors.toList()));
        
        // 从文件创建(模拟)
        try {
            // 创建临时文件用于演示
            Path tempFile = Files.createTempFile("demo", ".txt");
            Files.write(tempFile, Arrays.asList("line1", "line2", "line3"));
            
            Stream<String> fromFile = Files.lines(tempFile);
            List<String> lines = fromFile.collect(Collectors.toList());
            System.out.println("从文件创建: " + lines);
            
            // 清理临时文件
            Files.deleteIfExists(tempFile);
        } catch (IOException e) {
            System.err.println("文件操作错误: " + e.getMessage());
        }
        
        // 条件流
        Stream<String> conditionalStream = Stream.of("hello", "", "world", null, "java")
            .filter(Objects::nonNull)
            .filter(s -> !s.isEmpty());
        System.out.println("条件过滤流: " + conditionalStream.collect(Collectors.toList()));
        
        // AI补全点
    }
    
    // 10. 复杂的数据处理场景
    // ======================
    
    public static void demonstrateComplexDataProcessing() {
        System.out.println("\n=== 复杂数据处理演示 ===");
        
        // 模拟订单数据
        List<Order> orders = Arrays.asList(
            new Order("O001", "Alice", Arrays.asList(
                new OrderItem("P001", "笔记本电脑", 5999.0, 1),
                new OrderItem("P002", "鼠标", 99.0, 2)
            ), LocalDate.of(2023, 1, 15)),
            new Order("O002", "Bob", Arrays.asList(
                new OrderItem("P003", "键盘", 299.0, 1),
                new OrderItem("P004", "显示器", 1999.0, 1)
            ), LocalDate.of(2023, 2, 20)),
            new Order("O003", "Charlie", Arrays.asList(
                new OrderItem("P001", "笔记本电脑", 5999.0, 2),
                new OrderItem("P005", "打印机", 899.0, 1)
            ), LocalDate.of(2023, 3, 10))
        );
        
        // 计算每个客户的总消费
        Map<String, Double> customerTotalSpending = orders.stream()
            .collect(Collectors.groupingBy(
                Order::getCustomerName,
                Collectors.summingDouble(order -> order.getItems().stream()
                    .mapToDouble(item -> item.getPrice() * item.getQuantity())
                    .sum())
            ));
        System.out.println("客户总消费: " + customerTotalSpending);
        
        // 找出最受欢迎的产品
        Map<String, Integer> productPopularity = orders.stream()
            .flatMap(order -> order.getItems().stream())
            .collect(Collectors.groupingBy(
                OrderItem::getProductName,
                Collectors.summingInt(OrderItem::getQuantity)
            ));
        
        Optional<Map.Entry<String, Integer>> mostPopular = productPopularity.entrySet().stream()
            .max(Map.Entry.comparingByValue());
        System.out.println("最受欢迎的产品: " + mostPopular.map(entry -> 
            entry.getKey() + " (销量: " + entry.getValue() + ")").orElse("无"));
        
        // 按月份统计订单数量
        Map<Integer, Long> ordersByMonth = orders.stream()
            .collect(Collectors.groupingBy(
                order -> order.getOrderDate().getMonthValue(),
                Collectors.counting()
            ));
        System.out.println("按月份统计订单: " + ordersByMonth);
        
        // 计算平均订单价值
        OptionalDouble averageOrderValue = orders.stream()
            .mapToDouble(order -> order.getItems().stream()
                .mapToDouble(item -> item.getPrice() * item.getQuantity())
                .sum())
            .average();
        System.out.println("平均订单价值: " + averageOrderValue.orElse(0.0));
        
        // 找出高价值客户(消费>8000)
        Set<String> highValueCustomers = orders.stream()
            .collect(Collectors.groupingBy(
                Order::getCustomerName,
                Collectors.summingDouble(order -> order.getItems().stream()
                    .mapToDouble(item -> item.getPrice() * item.getQuantity())
                    .sum())
            ))
            .entrySet().stream()
            .filter(entry -> entry.getValue() > 8000)
            .map(Map.Entry::getKey)
            .collect(Collectors.toSet());
        System.out.println("高价值客户: " + highValueCustomers);
        
        // 创建详细的销售报告
        String salesReport = orders.stream()
            .sorted(Comparator.comparing(Order::getOrderDate))
            .map(order -> String.format("订单%s: %s在%s购买了%.2f元的商品", 
                order.getOrderId(), 
                order.getCustomerName(),
                order.getOrderDate().format(DateTimeFormatter.ofPattern("yyyy-MM-dd")),
                order.getItems().stream().mapToDouble(item -> item.getPrice() * item.getQuantity()).sum()))
            .collect(Collectors.joining("\n"));
        System.out.println("销售报告:\n" + salesReport);
        
        // AI补全点
    }
    
    // 订单相关的数据类
    public static class Order {
        private final String orderId;
        private final String customerName;
        private final List<OrderItem> items;
        private final LocalDate orderDate;
        
        public Order(String orderId, String customerName, List<OrderItem> items, LocalDate orderDate) {
            this.orderId = orderId;
            this.customerName = customerName;
            this.items = new ArrayList<>(items);
            this.orderDate = orderDate;
        }
        
        public String getOrderId() { return orderId; }
        public String getCustomerName() { return customerName; }
        public List<OrderItem> getItems() { return new ArrayList<>(items); }
        public LocalDate getOrderDate() { return orderDate; }
        
        @Override
        public String toString() {
            return String.format("Order{id='%s', customer='%s', items=%d, date=%s}", 
                               orderId, customerName, items.size(), orderDate);
        }
    }
    
    public static class OrderItem {
        private final String productId;
        private final String productName;
        private final double price;
        private final int quantity;
        
        public OrderItem(String productId, String productName, double price, int quantity) {
            this.productId = productId;
            this.productName = productName;
            this.price = price;
            this.quantity = quantity;
        }
        
        public String getProductId() { return productId; }
        public String getProductName() { return productName; }
        public double getPrice() { return price; }
        public int getQuantity() { return quantity; }
        
        @Override
        public String toString() {
            return String.format("OrderItem{product='%s', price=%.2f, qty=%d}", 
                               productName, price, quantity);
        }
    }
    
    // 11. 主函数和演示
    // ======================
    
    public static void main(String[] args) {
        System.out.println("Java集合和Stream API演示开始\n");
        
        try {
            demonstrateListOperations();
            demonstrateSetOperations();
            demonstrateMapOperations();
            demonstrateBasicStreamOperations();
            demonstrateAdvancedStreamOperations();
            demonstrateParallelStreams();
            demonstrateFunctionalInterfaces();
            demonstrateStreamCreation();
            demonstrateComplexDataProcessing();
        } catch (Exception e) {
            System.err.println("演示过程中发生错误: " + e.getMessage());
            e.printStackTrace();
        }
        
        System.out.println("\nJava集合和Stream API演示完成");
        // AI补全点
    }
}

// AI补全点