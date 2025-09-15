// Java面向对象编程和设计模式代码片段
// 用于测试AI代码补全功能

import java.util.*;
import java.util.concurrent.*;
import java.util.function.*;
import java.time.*;
import java.time.format.*;
import java.math.*;
import java.lang.reflect.*;
import java.io.*;

// 1. 基础面向对象编程概念
// ======================

// 抽象基类演示
abstract class Animal {
    protected String name;
    protected int age;
    protected String species;
    
    public Animal(String name, int age, String species) {
        this.name = name;
        this.age = age;
        this.species = species;
    }
    
    // 抽象方法
    public abstract String makeSound();
    public abstract String getMovementType();
    
    // 具体方法
    public void eat(String food) {
        System.out.println(name + " is eating " + food);
    }
    
    public void sleep(int hours) {
        System.out.println(name + " is sleeping for " + hours + " hours");
    }
    
    // 可重写的方法
    public String getDescription() {
        return String.format("%s is a %d-year-old %s", name, age, species);
    }
    
    // Getters and Setters
    public String getName() { return name; }
    public int getAge() { return age; }
    public String getSpecies() { return species; }
    
    public void setName(String name) { this.name = name; }
    public void setAge(int age) { this.age = age; }
    
    @Override
    public String toString() {
        return String.format("Animal{name='%s', age=%d, species='%s'}", name, age, species);
    }
    
    @Override
    public boolean equals(Object obj) {
        if (this == obj) return true;
        if (obj == null || getClass() != obj.getClass()) return false;
        Animal animal = (Animal) obj;
        return age == animal.age && 
               Objects.equals(name, animal.name) && 
               Objects.equals(species, animal.species);
    }
    
    @Override
    public int hashCode() {
        return Objects.hash(name, age, species);
    }
    // AI补全点
}

// 接口定义
interface Flyable {
    double getMaxAltitude();
    void fly(double altitude);
    default void land() {
        System.out.println("Landing safely");
    }
}

interface Swimmable {
    double getMaxDepth();
    void swim(double depth);
    default void surface() {
        System.out.println("Coming to surface");
    }
}

// 具体实现类
class Bird extends Animal implements Flyable {
    private double wingSpan;
    private double maxAltitude;
    
    public Bird(String name, int age, double wingSpan, double maxAltitude) {
        super(name, age, "Bird");
        this.wingSpan = wingSpan;
        this.maxAltitude = maxAltitude;
    }
    
    @Override
    public String makeSound() {
        return name + " chirps and tweets";
    }
    
    @Override
    public String getMovementType() {
        return "Flying";
    }
    
    @Override
    public double getMaxAltitude() {
        return maxAltitude;
    }
    
    @Override
    public void fly(double altitude) {
        if (altitude <= maxAltitude) {
            System.out.println(name + " is flying at " + altitude + " meters");
        } else {
            System.out.println(name + " cannot fly that high! Max altitude: " + maxAltitude);
        }
    }
    
    public void buildNest(String location) {
        System.out.println(name + " is building a nest in " + location);
    }
    
    @Override
    public String getDescription() {
        return super.getDescription() + String.format(" with %.2f cm wingspan", wingSpan);
    }
    
    // Getters
    public double getWingSpan() { return wingSpan; }
    public void setWingSpan(double wingSpan) { this.wingSpan = wingSpan; }
    // AI补全点
}

class Fish extends Animal implements Swimmable {
    private double maxDepth;
    private String waterType;
    
    public Fish(String name, int age, double maxDepth, String waterType) {
        super(name, age, "Fish");
        this.maxDepth = maxDepth;
        this.waterType = waterType;
    }
    
    @Override
    public String makeSound() {
        return name + " makes bubbling sounds";
    }
    
    @Override
    public String getMovementType() {
        return "Swimming";
    }
    
    @Override
    public double getMaxDepth() {
        return maxDepth;
    }
    
    @Override
    public void swim(double depth) {
        if (depth <= maxDepth) {
            System.out.println(name + " is swimming at " + depth + " meters depth");
        } else {
            System.out.println(name + " cannot swim that deep! Max depth: " + maxDepth);
        }
    }
    
    public void schoolUp(List<Fish> otherFish) {
        System.out.println(name + " is schooling with " + otherFish.size() + " other fish");
    }
    
    @Override
    public String getDescription() {
        return super.getDescription() + String.format(" living in %s water", waterType);
    }
    
    // Getters and Setters
    public String getWaterType() { return waterType; }
    public void setWaterType(String waterType) { this.waterType = waterType; }
    // AI补全点
}

// 多接口实现
class Duck extends Animal implements Flyable, Swimmable {
    private double maxAltitude;
    private double maxDepth;
    
    public Duck(String name, int age) {
        super(name, age, "Duck");
        this.maxAltitude = 1000.0;
        this.maxDepth = 5.0;
    }
    
    @Override
    public String makeSound() {
        return name + " quacks loudly";
    }
    
    @Override
    public String getMovementType() {
        return "Flying and Swimming";
    }
    
    @Override
    public double getMaxAltitude() {
        return maxAltitude;
    }
    
    @Override
    public void fly(double altitude) {
        if (altitude <= maxAltitude) {
            System.out.println(name + " is flying at " + altitude + " meters");
        } else {
            System.out.println(name + " prefers to fly lower. Max altitude: " + maxAltitude);
        }
    }
    
    @Override
    public double getMaxDepth() {
        return maxDepth;
    }
    
    @Override
    public void swim(double depth) {
        if (depth <= maxDepth) {
            System.out.println(name + " is swimming at " + depth + " meters depth");
        } else {
            System.out.println(name + " is a surface swimmer. Max depth: " + maxDepth);
        }
    }
    
    public void waddle() {
        System.out.println(name + " is waddling on land");
    }
    
    @Override
    public String getDescription() {
        return super.getDescription() + " (amphibious)";
    }
    // AI补全点
}

// 2. 设计模式实现
// ======================

// 单例模式
class DatabaseConnection {
    private static volatile DatabaseConnection instance;
    private static final Object lock = new Object();
    
    private String connectionString;
    private boolean isConnected;
    private LocalDateTime lastConnected;
    
    private DatabaseConnection() {
        this.connectionString = "jdbc:mysql://localhost:3306/mydb";
        this.isConnected = false;
    }
    
    public static DatabaseConnection getInstance() {
        if (instance == null) {
            synchronized (lock) {
                if (instance == null) {
                    instance = new DatabaseConnection();
                }
            }
        }
        return instance;
    }
    
    public void connect() {
        if (!isConnected) {
            System.out.println("Connecting to database: " + connectionString);
            isConnected = true;
            lastConnected = LocalDateTime.now();
        } else {
            System.out.println("Already connected to database");
        }
    }
    
    public void disconnect() {
        if (isConnected) {
            System.out.println("Disconnecting from database");
            isConnected = false;
        }
    }
    
    public boolean isConnected() {
        return isConnected;
    }
    
    public String getConnectionInfo() {
        return String.format("Connection: %s, Status: %s, Last Connected: %s", 
                           connectionString, 
                           isConnected ? "Connected" : "Disconnected",
                           lastConnected != null ? lastConnected.format(DateTimeFormatter.ISO_LOCAL_DATE_TIME) : "Never");
    }
    // AI补全点
}

// 工厂模式
abstract class Vehicle {
    protected String brand;
    protected String model;
    protected int year;
    protected double price;
    
    public Vehicle(String brand, String model, int year, double price) {
        this.brand = brand;
        this.model = model;
        this.year = year;
        this.price = price;
    }
    
    public abstract void start();
    public abstract void stop();
    public abstract String getVehicleType();
    
    public void displayInfo() {
        System.out.printf("%s: %s %s (%d) - $%.2f%n", 
                         getVehicleType(), brand, model, year, price);
    }
    
    // Getters
    public String getBrand() { return brand; }
    public String getModel() { return model; }
    public int getYear() { return year; }
    public double getPrice() { return price; }
    // AI补全点
}

class Car extends Vehicle {
    private int doors;
    private String fuelType;
    
    public Car(String brand, String model, int year, double price, int doors, String fuelType) {
        super(brand, model, year, price);
        this.doors = doors;
        this.fuelType = fuelType;
    }
    
    @Override
    public void start() {
        System.out.println(brand + " " + model + " engine started");
    }
    
    @Override
    public void stop() {
        System.out.println(brand + " " + model + " engine stopped");
    }
    
    @Override
    public String getVehicleType() {
        return "Car";
    }
    
    public void openTrunk() {
        System.out.println("Trunk opened");
    }
    
    // Getters
    public int getDoors() { return doors; }
    public String getFuelType() { return fuelType; }
    // AI补全点
}

class Motorcycle extends Vehicle {
    private int engineSize;
    private boolean hasSidecar;
    
    public Motorcycle(String brand, String model, int year, double price, int engineSize, boolean hasSidecar) {
        super(brand, model, year, price);
        this.engineSize = engineSize;
        this.hasSidecar = hasSidecar;
    }
    
    @Override
    public void start() {
        System.out.println(brand + " " + model + " motorcycle roars to life");
    }
    
    @Override
    public void stop() {
        System.out.println(brand + " " + model + " motorcycle engine stops");
    }
    
    @Override
    public String getVehicleType() {
        return "Motorcycle";
    }
    
    public void wheelie() {
        System.out.println("Performing a wheelie!");
    }
    
    // Getters
    public int getEngineSize() { return engineSize; }
    public boolean hasSidecar() { return hasSidecar; }
    // AI补全点
}

class Truck extends Vehicle {
    private double loadCapacity;
    private int axles;
    
    public Truck(String brand, String model, int year, double price, double loadCapacity, int axles) {
        super(brand, model, year, price);
        this.loadCapacity = loadCapacity;
        this.axles = axles;
    }
    
    @Override
    public void start() {
        System.out.println(brand + " " + model + " truck engine starts with a rumble");
    }
    
    @Override
    public void stop() {
        System.out.println(brand + " " + model + " truck engine stops");
    }
    
    @Override
    public String getVehicleType() {
        return "Truck";
    }
    
    public void loadCargo(double weight) {
        if (weight <= loadCapacity) {
            System.out.printf("Loading %.2f tons of cargo%n", weight);
        } else {
            System.out.printf("Cannot load %.2f tons. Max capacity: %.2f tons%n", weight, loadCapacity);
        }
    }
    
    // Getters
    public double getLoadCapacity() { return loadCapacity; }
    public int getAxles() { return axles; }
    // AI补全点
}

// 车辆工厂
class VehicleFactory {
    public enum VehicleType {
        CAR, MOTORCYCLE, TRUCK
    }
    
    public static Vehicle createVehicle(VehicleType type, String brand, String model, int year, double price, Object... params) {
        switch (type) {
            case CAR:
                int doors = params.length > 0 ? (Integer) params[0] : 4;
                String fuelType = params.length > 1 ? (String) params[1] : "Gasoline";
                return new Car(brand, model, year, price, doors, fuelType);
                
            case MOTORCYCLE:
                int engineSize = params.length > 0 ? (Integer) params[0] : 500;
                boolean hasSidecar = params.length > 1 ? (Boolean) params[1] : false;
                return new Motorcycle(brand, model, year, price, engineSize, hasSidecar);
                
            case TRUCK:
                double loadCapacity = params.length > 0 ? (Double) params[0] : 10.0;
                int axles = params.length > 1 ? (Integer) params[1] : 2;
                return new Truck(brand, model, year, price, loadCapacity, axles);
                
            default:
                throw new IllegalArgumentException("Unknown vehicle type: " + type);
        }
    }
    
    public static List<Vehicle> createVehicleFleet(int carCount, int motorcycleCount, int truckCount) {
        List<Vehicle> fleet = new ArrayList<>();
        
        // 创建汽车
        for (int i = 0; i < carCount; i++) {
            fleet.add(createVehicle(VehicleType.CAR, "Toyota", "Camry" + i, 2020 + i, 25000 + i * 1000));
        }
        
        // 创建摩托车
        for (int i = 0; i < motorcycleCount; i++) {
            fleet.add(createVehicle(VehicleType.MOTORCYCLE, "Honda", "CBR" + i, 2021 + i, 15000 + i * 500));
        }
        
        // 创建卡车
        for (int i = 0; i < truckCount; i++) {
            fleet.add(createVehicle(VehicleType.TRUCK, "Ford", "F-150" + i, 2019 + i, 35000 + i * 2000));
        }
        
        return fleet;
    }
    // AI补全点
}

// 观察者模式
interface Observer {
    void update(String message, Object data);
}

interface Subject {
    void addObserver(Observer observer);
    void removeObserver(Observer observer);
    void notifyObservers(String message, Object data);
}

class NewsAgency implements Subject {
    private List<Observer> observers;
    private List<String> news;
    private String agencyName;
    
    public NewsAgency(String agencyName) {
        this.agencyName = agencyName;
        this.observers = new ArrayList<>();
        this.news = new ArrayList<>();
    }
    
    @Override
    public void addObserver(Observer observer) {
        observers.add(observer);
        System.out.println("Observer added to " + agencyName);
    }
    
    @Override
    public void removeObserver(Observer observer) {
        observers.remove(observer);
        System.out.println("Observer removed from " + agencyName);
    }
    
    @Override
    public void notifyObservers(String message, Object data) {
        for (Observer observer : observers) {
            observer.update(message, data);
        }
    }
    
    public void publishNews(String newsItem) {
        news.add(newsItem);
        System.out.println(agencyName + " published: " + newsItem);
        notifyObservers("NEWS_PUBLISHED", newsItem);
    }
    
    public void breakingNews(String urgentNews) {
        news.add("BREAKING: " + urgentNews);
        System.out.println(agencyName + " BREAKING NEWS: " + urgentNews);
        notifyObservers("BREAKING_NEWS", urgentNews);
    }
    
    public List<String> getAllNews() {
        return new ArrayList<>(news);
    }
    
    public String getAgencyName() {
        return agencyName;
    }
    // AI补全点
}

class NewsChannel implements Observer {
    private String channelName;
    private List<String> receivedNews;
    
    public NewsChannel(String channelName) {
        this.channelName = channelName;
        this.receivedNews = new ArrayList<>();
    }
    
    @Override
    public void update(String message, Object data) {
        String newsItem = (String) data;
        receivedNews.add(newsItem);
        
        switch (message) {
            case "NEWS_PUBLISHED":
                System.out.println(channelName + " received news: " + newsItem);
                break;
            case "BREAKING_NEWS":
                System.out.println(channelName + " URGENT BROADCAST: " + newsItem);
                break;
        }
    }
    
    public void displayNews() {
        System.out.println("\n" + channelName + " News Summary:");
        for (int i = 0; i < receivedNews.size(); i++) {
            System.out.println((i + 1) + ". " + receivedNews.get(i));
        }
    }
    
    public String getChannelName() {
        return channelName;
    }
    
    public List<String> getReceivedNews() {
        return new ArrayList<>(receivedNews);
    }
    // AI补全点
}

// 策略模式
interface PaymentStrategy {
    boolean processPayment(double amount);
    String getPaymentMethod();
    double getProcessingFee(double amount);
}

class CreditCardPayment implements PaymentStrategy {
    private String cardNumber;
    private String holderName;
    private LocalDate expiryDate;
    
    public CreditCardPayment(String cardNumber, String holderName, LocalDate expiryDate) {
        this.cardNumber = cardNumber.substring(cardNumber.length() - 4); // Only store last 4 digits
        this.holderName = holderName;
        this.expiryDate = expiryDate;
    }
    
    @Override
    public boolean processPayment(double amount) {
        double fee = getProcessingFee(amount);
        double total = amount + fee;
        System.out.printf("Processing credit card payment: $%.2f (fee: $%.2f, total: $%.2f)%n", amount, fee, total);
        System.out.println("Card ending in: " + cardNumber);
        return true; // Simulate successful payment
    }
    
    @Override
    public String getPaymentMethod() {
        return "Credit Card";
    }
    
    @Override
    public double getProcessingFee(double amount) {
        return amount * 0.025; // 2.5% fee
    }
    
    public boolean isCardValid() {
        return expiryDate.isAfter(LocalDate.now());
    }
    // AI补全点
}

class PayPalPayment implements PaymentStrategy {
    private String email;
    private boolean isVerified;
    
    public PayPalPayment(String email, boolean isVerified) {
        this.email = email;
        this.isVerified = isVerified;
    }
    
    @Override
    public boolean processPayment(double amount) {
        if (!isVerified) {
            System.out.println("PayPal account not verified. Payment failed.");
            return false;
        }
        
        double fee = getProcessingFee(amount);
        double total = amount + fee;
        System.out.printf("Processing PayPal payment: $%.2f (fee: $%.2f, total: $%.2f)%n", amount, fee, total);
        System.out.println("PayPal account: " + email);
        return true;
    }
    
    @Override
    public String getPaymentMethod() {
        return "PayPal";
    }
    
    @Override
    public double getProcessingFee(double amount) {
        return amount * 0.03; // 3% fee
    }
    
    public String getEmail() {
        return email;
    }
    
    public boolean isVerified() {
        return isVerified;
    }
    // AI补全点
}

class BankTransferPayment implements PaymentStrategy {
    private String bankName;
    private String accountNumber;
    private String routingNumber;
    
    public BankTransferPayment(String bankName, String accountNumber, String routingNumber) {
        this.bankName = bankName;
        this.accountNumber = "****" + accountNumber.substring(accountNumber.length() - 4);
        this.routingNumber = routingNumber;
    }
    
    @Override
    public boolean processPayment(double amount) {
        double fee = getProcessingFee(amount);
        double total = amount + fee;
        System.out.printf("Processing bank transfer: $%.2f (fee: $%.2f, total: $%.2f)%n", amount, fee, total);
        System.out.println("Bank: " + bankName + ", Account: " + accountNumber);
        System.out.println("Transfer will take 1-3 business days");
        return true;
    }
    
    @Override
    public String getPaymentMethod() {
        return "Bank Transfer";
    }
    
    @Override
    public double getProcessingFee(double amount) {
        return 5.0; // Flat $5 fee
    }
    
    public String getBankName() {
        return bankName;
    }
    // AI补全点
}

// 支付处理器
class PaymentProcessor {
    private PaymentStrategy paymentStrategy;
    private List<PaymentRecord> paymentHistory;
    
    public PaymentProcessor() {
        this.paymentHistory = new ArrayList<>();
    }
    
    public void setPaymentStrategy(PaymentStrategy paymentStrategy) {
        this.paymentStrategy = paymentStrategy;
        System.out.println("Payment method set to: " + paymentStrategy.getPaymentMethod());
    }
    
    public boolean processPayment(double amount, String description) {
        if (paymentStrategy == null) {
            System.out.println("No payment method selected");
            return false;
        }
        
        boolean success = paymentStrategy.processPayment(amount);
        
        PaymentRecord record = new PaymentRecord(
            paymentStrategy.getPaymentMethod(),
            amount,
            paymentStrategy.getProcessingFee(amount),
            description,
            success,
            LocalDateTime.now()
        );
        
        paymentHistory.add(record);
        return success;
    }
    
    public void displayPaymentHistory() {
        System.out.println("\n=== Payment History ===");
        for (PaymentRecord record : paymentHistory) {
            System.out.println(record);
        }
    }
    
    public double getTotalPayments() {
        return paymentHistory.stream()
            .filter(PaymentRecord::isSuccessful)
            .mapToDouble(PaymentRecord::getAmount)
            .sum();
    }
    
    public double getTotalFees() {
        return paymentHistory.stream()
            .filter(PaymentRecord::isSuccessful)
            .mapToDouble(PaymentRecord::getFee)
            .sum();
    }
    
    // 支付记录内部类
    public static class PaymentRecord {
        private final String method;
        private final double amount;
        private final double fee;
        private final String description;
        private final boolean successful;
        private final LocalDateTime timestamp;
        
        public PaymentRecord(String method, double amount, double fee, String description, boolean successful, LocalDateTime timestamp) {
            this.method = method;
            this.amount = amount;
            this.fee = fee;
            this.description = description;
            this.successful = successful;
            this.timestamp = timestamp;
        }
        
        @Override
        public String toString() {
            return String.format("%s: %s $%.2f%s - %s [%s]",
                               timestamp.format(DateTimeFormatter.ofPattern("yyyy-MM-dd HH:mm")),
                               method,
                               amount,
                               successful ? String.format(" (fee: $%.2f)", fee) : "",
                               description,
                               successful ? "SUCCESS" : "FAILED");
        }
        
        // Getters
        public String getMethod() { return method; }
        public double getAmount() { return amount; }
        public double getFee() { return fee; }
        public String getDescription() { return description; }
        public boolean isSuccessful() { return successful; }
        public LocalDateTime getTimestamp() { return timestamp; }
    }
    // AI补全点
}

// 3. 高级OOP概念
// ======================

// 泛型类示例
class GenericRepository<T> {
    private List<T> items;
    private Class<T> type;
    
    public GenericRepository(Class<T> type) {
        this.type = type;
        this.items = new ArrayList<>();
    }
    
    public void add(T item) {
        items.add(item);
        System.out.println("Added " + type.getSimpleName() + ": " + item);
    }
    
    public T findById(int index) {
        if (index >= 0 && index < items.size()) {
            return items.get(index);
        }
        return null;
    }
    
    public List<T> findAll() {
        return new ArrayList<>(items);
    }
    
    public boolean remove(T item) {
        boolean removed = items.remove(item);
        if (removed) {
            System.out.println("Removed " + type.getSimpleName() + ": " + item);
        }
        return removed;
    }
    
    public int size() {
        return items.size();
    }
    
    public void clear() {
        items.clear();
        System.out.println("Cleared " + type.getSimpleName() + " repository");
    }
    
    // 使用通配符的方法
    public void addAll(GenericRepository<? extends T> other) {
        this.items.addAll(other.items);
        System.out.println("Added all items from another repository");
    }
    
    public <U> List<U> transform(Function<T, U> transformer) {
        return items.stream()
            .map(transformer)
            .collect(ArrayList::new, ArrayList::add, ArrayList::addAll);
    }
    
    public List<T> filter(Predicate<T> predicate) {
        return items.stream()
            .filter(predicate)
            .collect(ArrayList::new, ArrayList::add, ArrayList::addAll);
    }
    // AI补全点
}

// 枚举示例
enum OrderStatus {
    PENDING("Order is pending processing"),
    PROCESSING("Order is being processed"),
    SHIPPED("Order has been shipped"),
    DELIVERED("Order has been delivered"),
    CANCELLED("Order has been cancelled");
    
    private final String description;
    
    OrderStatus(String description) {
        this.description = description;
    }
    
    public String getDescription() {
        return description;
    }
    
    public boolean canTransitionTo(OrderStatus newStatus) {
        switch (this) {
            case PENDING:
                return newStatus == PROCESSING || newStatus == CANCELLED;
            case PROCESSING:
                return newStatus == SHIPPED || newStatus == CANCELLED;
            case SHIPPED:
                return newStatus == DELIVERED;
            case DELIVERED:
            case CANCELLED:
                return false;
            default:
                return false;
        }
    }
    
    public static OrderStatus fromString(String status) {
        for (OrderStatus orderStatus : values()) {
            if (orderStatus.name().equalsIgnoreCase(status)) {
                return orderStatus;
            }
        }
        throw new IllegalArgumentException("Unknown order status: " + status);
    }
    // AI补全点
}

// 订单类使用枚举
class Order {
    private static int nextId = 1;
    
    private final int orderId;
    private final String customerName;
    private final List<String> items;
    private OrderStatus status;
    private final LocalDateTime createdAt;
    private LocalDateTime lastUpdated;
    private double totalAmount;
    
    public Order(String customerName, List<String> items, double totalAmount) {
        this.orderId = nextId++;
        this.customerName = customerName;
        this.items = new ArrayList<>(items);
        this.totalAmount = totalAmount;
        this.status = OrderStatus.PENDING;
        this.createdAt = LocalDateTime.now();
        this.lastUpdated = LocalDateTime.now();
    }
    
    public boolean updateStatus(OrderStatus newStatus) {
        if (status.canTransitionTo(newStatus)) {
            OrderStatus oldStatus = this.status;
            this.status = newStatus;
            this.lastUpdated = LocalDateTime.now();
            System.out.printf("Order %d status changed from %s to %s%n", orderId, oldStatus, newStatus);
            return true;
        } else {
            System.out.printf("Cannot change order %d status from %s to %s%n", orderId, status, newStatus);
            return false;
        }
    }
    
    public void addItem(String item, double price) {
        items.add(item);
        totalAmount += price;
        lastUpdated = LocalDateTime.now();
        System.out.printf("Added item '%s' to order %d%n", item, orderId);
    }
    
    public String getOrderSummary() {
        return String.format("Order #%d: %s - %s (%.2f) - Status: %s [%s]",
                           orderId,
                           customerName,
                           String.join(", ", items),
                           totalAmount,
                           status,
                           status.getDescription());
    }
    
    // Getters
    public int getOrderId() { return orderId; }
    public String getCustomerName() { return customerName; }
    public List<String> getItems() { return new ArrayList<>(items); }
    public OrderStatus getStatus() { return status; }
    public LocalDateTime getCreatedAt() { return createdAt; }
    public LocalDateTime getLastUpdated() { return lastUpdated; }
    public double getTotalAmount() { return totalAmount; }
    
    @Override
    public String toString() {
        return getOrderSummary();
    }
    // AI补全点
}

// 4. 异常处理和自定义异常
// ======================

class CustomBusinessException extends Exception {
    private final String errorCode;
    private final LocalDateTime timestamp;
    
    public CustomBusinessException(String message, String errorCode) {
        super(message);
        this.errorCode = errorCode;
        this.timestamp = LocalDateTime.now();
    }
    
    public CustomBusinessException(String message, String errorCode, Throwable cause) {
        super(message, cause);
        this.errorCode = errorCode;
        this.timestamp = LocalDateTime.now();
    }
    
    public String getErrorCode() {
        return errorCode;
    }
    
    public LocalDateTime getTimestamp() {
        return timestamp;
    }
    
    @Override
    public String toString() {
        return String.format("CustomBusinessException[code=%s, time=%s]: %s", 
                           errorCode, 
                           timestamp.format(DateTimeFormatter.ISO_LOCAL_DATE_TIME), 
                           getMessage());
    }
    // AI补全点
}

class ValidationException extends CustomBusinessException {
    public ValidationException(String message) {
        super(message, "VALIDATION_ERROR");
    }
}

class BusinessLogicException extends CustomBusinessException {
    public BusinessLogicException(String message) {
        super(message, "BUSINESS_LOGIC_ERROR");
    }
}

// 业务服务类演示异常处理
class OrderService {
    private GenericRepository<Order> orderRepository;
    
    public OrderService() {
        this.orderRepository = new GenericRepository<>(Order.class);
    }
    
    public Order createOrder(String customerName, List<String> items, double totalAmount) 
            throws ValidationException {
        
        // 验证输入
        if (customerName == null || customerName.trim().isEmpty()) {
            throw new ValidationException("Customer name cannot be null or empty");
        }
        
        if (items == null || items.isEmpty()) {
            throw new ValidationException("Order must contain at least one item");
        }
        
        if (totalAmount <= 0) {
            throw new ValidationException("Total amount must be positive");
        }
        
        Order order = new Order(customerName, items, totalAmount);
        orderRepository.add(order);
        return order;
    }
    
    public void processOrder(int orderId) throws BusinessLogicException {
        Order order = findOrderById(orderId);
        if (order == null) {
            throw new BusinessLogicException("Order not found: " + orderId);
        }
        
        if (!order.updateStatus(OrderStatus.PROCESSING)) {
            throw new BusinessLogicException("Cannot process order in current status: " + order.getStatus());
        }
    }
    
    public void shipOrder(int orderId) throws BusinessLogicException {
        Order order = findOrderById(orderId);
        if (order == null) {
            throw new BusinessLogicException("Order not found: " + orderId);
        }
        
        if (!order.updateStatus(OrderStatus.SHIPPED)) {
            throw new BusinessLogicException("Cannot ship order in current status: " + order.getStatus());
        }
    }
    
    private Order findOrderById(int orderId) {
        return orderRepository.findAll().stream()
            .filter(order -> order.getOrderId() == orderId)
            .findFirst()
            .orElse(null);
    }
    
    public List<Order> getAllOrders() {
        return orderRepository.findAll();
    }
    
    public List<Order> getOrdersByStatus(OrderStatus status) {
        return orderRepository.filter(order -> order.getStatus() == status);
    }
    
    public double getTotalRevenue() {
        return orderRepository.findAll().stream()
            .filter(order -> order.getStatus() == OrderStatus.DELIVERED)
            .mapToDouble(Order::getTotalAmount)
            .sum();
    }
    // AI补全点
}

// 5. 主演示类
// ======================

public class OOPDesignDemo {
    
    public static void demonstrateInheritanceAndPolymorphism() {
        System.out.println("=== 继承和多态演示 ===");
        
        // 创建不同类型的动物
        List<Animal> animals = Arrays.asList(
            new Bird("Eagle", 5, 2.3, 3000.0),
            new Fish("Goldfish", 2, 1.0, "Fresh"),
            new Duck("Donald", 3)
        );
        
        // 多态演示
        for (Animal animal : animals) {
            System.out.println(animal.getDescription());
            System.out.println("Sound: " + animal.makeSound());
            System.out.println("Movement: " + animal.getMovementType());
            
            // 接口多态
            if (animal instanceof Flyable) {
                ((Flyable) animal).fly(100);
            }
            if (animal instanceof Swimmable) {
                ((Swimmable) animal).swim(2);
            }
            
            System.out.println();
        }
        // AI补全点
    }
    
    public static void demonstrateDesignPatterns() {
        System.out.println("=== 设计模式演示 ===");
        
        // 单例模式
        DatabaseConnection db1 = DatabaseConnection.getInstance();
        DatabaseConnection db2 = DatabaseConnection.getInstance();
        System.out.println("单例验证: " + (db1 == db2));
        db1.connect();
        System.out.println(db1.getConnectionInfo());
        
        // 工厂模式
        List<Vehicle> fleet = VehicleFactory.createVehicleFleet(2, 2, 1);
        System.out.println("\n工厂创建的车队:");
        fleet.forEach(Vehicle::displayInfo);
        
        // 观察者模式
        NewsAgency cnn = new NewsAgency("CNN");
        NewsChannel channel1 = new NewsChannel("Channel 1");
        NewsChannel channel2 = new NewsChannel("Channel 2");
        
        cnn.addObserver(channel1);
        cnn.addObserver(channel2);
        
        cnn.publishNews("Technology stocks rise 5%");
        cnn.breakingNews("Major earthquake hits coastal region");
        
        channel1.displayNews();
        
        // 策略模式
        PaymentProcessor processor = new PaymentProcessor();
        
        processor.setPaymentStrategy(new CreditCardPayment("1234567890123456", "John Doe", LocalDate.of(2025, 12, 31)));
        processor.processPayment(100.0, "Online purchase");
        
        processor.setPaymentStrategy(new PayPalPayment("john@example.com", true));
        processor.processPayment(200.0, "Service subscription");
        
        processor.setPaymentStrategy(new BankTransferPayment("Chase Bank", "123456789", "021000021"));
        processor.processPayment(500.0, "Large purchase");
        
        processor.displayPaymentHistory();
        System.out.printf("Total payments: $%.2f, Total fees: $%.2f%n", 
                         processor.getTotalPayments(), processor.getTotalFees());
        // AI补全点
    }
    
    public static void demonstrateGenericsAndEnums() {
        System.out.println("\n=== 泛型和枚举演示 ===");
        
        // 泛型仓库
        GenericRepository<String> stringRepo = new GenericRepository<>(String.class);
        stringRepo.add("Hello");
        stringRepo.add("World");
        stringRepo.add("Java");
        
        GenericRepository<Integer> intRepo = new GenericRepository<>(Integer.class);
        intRepo.add(1);
        intRepo.add(2);
        intRepo.add(3);
        
        // 转换操作
        List<Integer> lengths = stringRepo.transform(String::length);
        System.out.println("字符串长度: " + lengths);
        
        List<String> filtered = stringRepo.filter(s -> s.length() > 4);
        System.out.println("长度>4的字符串: " + filtered);
        
        // 枚举和订单处理
        try {
            OrderService orderService = new OrderService();
            
            Order order1 = orderService.createOrder("Alice", Arrays.asList("Laptop", "Mouse"), 1299.99);
            Order order2 = orderService.createOrder("Bob", Arrays.asList("Keyboard", "Monitor"), 499.99);
            
            System.out.println("创建的订单:");
            orderService.getAllOrders().forEach(System.out::println);
            
            // 处理订单状态变更
            orderService.processOrder(order1.getOrderId());
            orderService.shipOrder(order1.getOrderId());
            order1.updateStatus(OrderStatus.DELIVERED);
            
            System.out.println("\n按状态查询订单:");
            System.out.println("待处理订单: " + orderService.getOrdersByStatus(OrderStatus.PENDING).size());
            System.out.println("已发货订单: " + orderService.getOrdersByStatus(OrderStatus.SHIPPED).size());
            System.out.println("总收入: $" + orderService.getTotalRevenue());
            
        } catch (ValidationException | BusinessLogicException e) {
            System.err.println("业务异常: " + e);
        }
        // AI补全点
    }
    
    public static void demonstrateExceptionHandling() {
        System.out.println("\n=== 异常处理演示 ===");
        
        OrderService orderService = new OrderService();
        
        // 测试各种异常情况
        try {
            orderService.createOrder("", Arrays.asList("Item1"), 100.0);
        } catch (ValidationException e) {
            System.out.println("捕获验证异常: " + e.getMessage());
        }
        
        try {
            orderService.createOrder("Customer", new ArrayList<>(), 100.0);
        } catch (ValidationException e) {
            System.out.println("捕获验证异常: " + e.getMessage());
        }
        
        try {
            orderService.createOrder("Customer", Arrays.asList("Item1"), -50.0);
        } catch (ValidationException e) {
            System.out.println("捕获验证异常: " + e.getMessage());
        }
        
        try {
            orderService.processOrder(999); // 不存在的订单ID
        } catch (BusinessLogicException e) {
            System.out.println("捕获业务逻辑异常: " + e.getMessage());
        }
        
        // 成功案例
        try {
            Order validOrder = orderService.createOrder("Valid Customer", Arrays.asList("Valid Item"), 99.99);
            System.out.println("成功创建订单: " + validOrder);
            orderService.processOrder(validOrder.getOrderId());
            System.out.println("成功处理订单");
        } catch (ValidationException | BusinessLogicException e) {
            System.err.println("意外异常: " + e);
        }
        // AI补全点
    }
    
    public static void main(String[] args) {
        System.out.println("Java面向对象编程和设计模式演示开始\n");
        
        try {
            demonstrateInheritanceAndPolymorphism();
            demonstrateDesignPatterns();
            demonstrateGenericsAndEnums();
            demonstrateExceptionHandling();
        } catch (Exception e) {
            System.err.println("演示过程中发生错误: " + e.getMessage());
            e.printStackTrace();
        }
        
        System.out.println("\nJava面向对象编程和设计模式演示完成");
        // AI补全点
    }
}

// AI补全点