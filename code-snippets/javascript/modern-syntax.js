// JavaScript现代语法特性代码片段
// 用于测试AI代码补全功能

// ES6+ 特性演示
// ======================

// 1. 变量声明和作用域
const API_BASE_URL = 'https://api.example.com';
let currentUser = null;
var globalConfig = {}; // AI补全点

// 2. 箭头函数和函数表达式
const add = (a, b) => a + b;
const multiply = (x, y) => {
    // AI补全点
    return x * y;
};

const fetchUserData = async (userId) => {
    try {
        const response = await fetch(`${API_BASE_URL}/users/${userId}`);
        // AI补全点
        return await response.json();
    } catch (error) {
        console.error('Error fetching user data:', error);
        throw error;
    }
};

// 3. 解构赋值
const user = {
    id: 1,
    name: 'John Doe',
    email: 'john@example.com',
    address: {
        street: '123 Main St',
        city: 'New York',
        zipCode: '10001'
    }
};

const { name, email, address: { city } } = user;
const [first, second, ...rest] = [1, 2, 3, 4, 5];

// 数组解构示例
function getCoordinates() {
    return [40.7128, -74.0060]; // 纽约坐标
}

const [latitude, longitude] = getCoordinates();
// AI补全点

// 4. 模板字符串
const createUserWelcomeMessage = (userName, loginCount) => {
    return `Welcome back, ${userName}! 
    This is your ${loginCount}${getOrdinalSuffix(loginCount)} login.
    Today is ${new Date().toLocaleDateString()}.`;
};

function getOrdinalSuffix(num) {
    const suffixes = ['th', 'st', 'nd', 'rd'];
    const v = num % 100;
    // AI补全点
    return (suffixes[(v - 20) % 10] || suffixes[v] || suffixes[0]);
}

// 5. 展开操作符和剩余参数
const combineArrays = (...arrays) => {
    return arrays.reduce((combined, array) => {
        // AI补全点
        return [...combined, ...array];
    }, []);
};

const updateUserProfile = (currentProfile, updates) => {
    return {
        ...currentProfile,
        ...updates,
        lastModified: new Date().toISOString()
        // AI补全点
    };
};

// 6. 默认参数
function createApiEndpoint(basePath, version = 'v1', format = 'json') {
    // AI补全点
    return `/${version}/${basePath}.${format}`;
}

const processDataWithDefaults = (data, options = {}) => {
    const {
        sortBy = 'id',
        sortOrder = 'asc',
        limit = 10,
        offset = 0
    } = options;
    
    // AI补全点
    return data
        .sort((a, b) => {
            if (sortOrder === 'asc') {
                return a[sortBy] > b[sortBy] ? 1 : -1;
            }
            return a[sortBy] < b[sortBy] ? 1 : -1;
        })
        .slice(offset, offset + limit);
};

// 7. Promise和async/await
class DataService {
    constructor(baseUrl) {
        this.baseUrl = baseUrl;
        this.cache = new Map();
    }
    
    async fetchData(endpoint, useCache = true) {
        if (useCache && this.cache.has(endpoint)) {
            // AI补全点
            return this.cache.get(endpoint);
        }
        
        try {
            const response = await fetch(`${this.baseUrl}/${endpoint}`);
            if (!response.ok) {
                throw new Error(`HTTP error! status: ${response.status}`);
            }
            
            const data = await response.json();
            this.cache.set(endpoint, data);
            // AI补全点
            return data;
        } catch (error) {
            console.error(`Failed to fetch ${endpoint}:`, error);
            throw error;
        }
    }
    
    async batchFetch(endpoints) {
        const promises = endpoints.map(endpoint => this.fetchData(endpoint));
        // AI补全点
        return Promise.allSettled(promises);
    }
}

// 8. 生成器函数
function* fibonacci(max = Infinity) {
    let a = 0, b = 1;
    while (a <= max) {
        yield a;
        // AI补全点
        [a, b] = [b, a + b];
    }
}

function* dataProcessor(dataStream) {
    for (const item of dataStream) {
        if (item && typeof item === 'object') {
            // AI补全点
            yield {
                ...item,
                processed: true,
                timestamp: Date.now()
            };
        }
    }
}

// 9. Symbol和迭代器
const PRIVATE_DATA = Symbol('privateData');
const ITERATOR_METHOD = Symbol.iterator;

class CustomCollection {
    constructor() {
        this.items = [];
        this[PRIVATE_DATA] = new WeakMap();
    }
    
    add(item) {
        this.items.push(item);
        this[PRIVATE_DATA].set(item, {
            addedAt: Date.now(),
            id: Math.random().toString(36).substr(2, 9)
        });
        // AI补全点
        return this;
    }
    
    *[Symbol.iterator]() {
        for (const item of this.items) {
            // AI补全点
            yield item;
        }
    }
    
    getMetadata(item) {
        return this[PRIVATE_DATA].get(item);
    }
}

// 10. Map和Set数据结构
const userPermissions = new Map();
const activeUserIds = new Set();

function manageUserPermissions() {
    // 添加用户权限
    userPermissions.set('user123', new Set(['read', 'write']));
    userPermissions.set('admin456', new Set(['read', 'write', 'delete', 'admin']));
    
    // 检查权限
    const checkPermission = (userId, permission) => {
        const permissions = userPermissions.get(userId);
        // AI补全点
        return permissions ? permissions.has(permission) : false;
    };
    
    // 批量权限检查
    const batchCheckPermissions = (userIds, requiredPermissions) => {
        return userIds.map(userId => ({
            userId,
            hasAllPermissions: requiredPermissions.every(perm => 
                checkPermission(userId, perm)
            ),
            // AI补全点
            missingPermissions: requiredPermissions.filter(perm => 
                !checkPermission(userId, perm)
            )
        }));
    };
    
    return { checkPermission, batchCheckPermissions };
}

// 11. WeakMap和WeakSet用于私有数据
const privateData = new WeakMap();
const observers = new WeakSet();

class ObservableModel {
    constructor(initialData = {}) {
        privateData.set(this, {
            data: { ...initialData },
            observers: new Set(),
            changeHistory: []
        });
    }
    
    get(key) {
        const private_ = privateData.get(this);
        // AI补全点
        return private_.data[key];
    }
    
    set(key, value) {
        const private_ = privateData.get(this);
        const oldValue = private_.data[key];
        private_.data[key] = value;
        
        // 记录变更历史
        private_.changeHistory.push({
            key,
            oldValue,
            newValue: value,
            timestamp: Date.now()
        });
        
        // 通知观察者
        private_.observers.forEach(observer => {
            // AI补全点
            if (typeof observer === 'function') {
                observer(key, value, oldValue);
            }
        });
        
        return this;
    }
    
    subscribe(observer) {
        if (typeof observer === 'function') {
            const private_ = privateData.get(this);
            private_.observers.add(observer);
            observers.add(observer);
            // AI补全点
        }
        return this;
    }
}

// 12. Proxy用于高级对象拦截
function createValidatedObject(schema) {
    const target = {};
    
    return new Proxy(target, {
        set(obj, prop, value) {
            if (schema[prop]) {
                const validator = schema[prop];
                if (typeof validator === 'function' && !validator(value)) {
                    throw new Error(`Invalid value for property ${prop}: ${value}`);
                }
                // AI补全点
                if (typeof validator === 'object' && validator.type) {
                    if (typeof value !== validator.type) {
                        throw new Error(`Property ${prop} must be of type ${validator.type}`);
                    }
                }
            }
            obj[prop] = value;
            return true;
        },
        
        get(obj, prop) {
            if (prop in obj) {
                return obj[prop];
            }
            // AI补全点
            if (schema[prop] && schema[prop].default !== undefined) {
                return schema[prop].default;
            }
            return undefined;
        }
    });
}

// 13. 异步迭代器
async function* asyncDataGenerator(urls) {
    for (const url of urls) {
        try {
            const response = await fetch(url);
            const data = await response.json();
            // AI补全点
            yield {
                url,
                data,
                fetchedAt: new Date().toISOString()
            };
        } catch (error) {
            yield {
                url,
                error: error.message,
                fetchedAt: new Date().toISOString()
            };
        }
    }
}

// 使用异步迭代器
async function processAsyncData(urls) {
    const results = [];
    for await (const item of asyncDataGenerator(urls)) {
        if (item.data) {
            // AI补全点
            results.push(item.data);
        } else {
            console.error(`Failed to fetch ${item.url}: ${item.error}`);
        }
    }
    return results;
}

// 14. 动态导入和模块
async function loadModule(moduleName) {
    try {
        const module = await import(moduleName);
        // AI补全点
        return module.default || module;
    } catch (error) {
        console.error(`Failed to load module ${moduleName}:`, error);
        return null;
    }
}

// 条件导入
async function conditionalImport(condition, modulePath) {
    if (condition) {
        // AI补全点
        return await import(modulePath);
    }
    return null;
}

// 15. 错误处理和自定义错误
class APIError extends Error {
    constructor(message, statusCode, endpoint) {
        super(message);
        this.name = 'APIError';
        this.statusCode = statusCode;
        this.endpoint = endpoint;
        this.timestamp = new Date().toISOString();
        // AI补全点
    }
    
    toJSON() {
        return {
            name: this.name,
            message: this.message,
            statusCode: this.statusCode,
            endpoint: this.endpoint,
            timestamp: this.timestamp
        };
    }
}

class ValidationError extends Error {
    constructor(field, value, rule) {
        super(`Validation failed for field "${field}" with value "${value}": ${rule}`);
        this.name = 'ValidationError';
        this.field = field;
        this.value = value;
        this.rule = rule;
        // AI补全点
    }
}

// 错误处理装饰器模式
function withErrorHandling(asyncFn) {
    return async function(...args) {
        try {
            // AI补全点
            return await asyncFn.apply(this, args);
        } catch (error) {
            if (error instanceof APIError) {
                console.error('API Error:', error.toJSON());
            } else if (error instanceof ValidationError) {
                console.error('Validation Error:', error.message);
            } else {
                console.error('Unexpected Error:', error);
            }
            throw error;
        }
    };
}

// 16. 函数式编程模式
const pipe = (...functions) => (value) => 
    functions.reduce((acc, fn) => fn(acc), value);

const compose = (...functions) => (value) =>
    functions.reduceRight((acc, fn) => fn(acc), value);

// 柯里化函数
const curry = (fn) => {
    return function curried(...args) {
        if (args.length >= fn.length) {
            // AI补全点
            return fn.apply(this, args);
        } else {
            return function(...args2) {
                return curried.apply(this, args.concat(args2));
            };
        }
    };
};

// 函数式数据处理
const dataProcessingPipeline = pipe(
    (data) => data.filter(item => item.active),
    (data) => data.map(item => ({
        ...item,
        processedAt: Date.now()
    })),
    (data) => data.sort((a, b) => a.priority - b.priority),
    // AI补全点
    (data) => data.slice(0, 10)
);

// 17. 类型检查辅助函数
const is = {
    string: (value) => typeof value === 'string',
    number: (value) => typeof value === 'number' && !isNaN(value),
    boolean: (value) => typeof value === 'boolean',
    object: (value) => value !== null && typeof value === 'object' && !Array.isArray(value),
    array: (value) => Array.isArray(value),
    function: (value) => typeof value === 'function',
    null: (value) => value === null,
    undefined: (value) => value === undefined,
    // AI补全点
    empty: (value) => {
        if (is.null(value) || is.undefined(value)) return true;
        if (is.string(value) || is.array(value)) return value.length === 0;
        if (is.object(value)) return Object.keys(value).length === 0;
        return false;
    }
};

// 18. 性能监控工具
class PerformanceMonitor {
    constructor() {
        this.metrics = new Map();
    }
    
    startTimer(label) {
        this.metrics.set(label, {
            startTime: performance.now(),
            endTime: null,
            duration: null
        });
        // AI补全点
        return this;
    }
    
    endTimer(label) {
        const metric = this.metrics.get(label);
        if (metric) {
            metric.endTime = performance.now();
            metric.duration = metric.endTime - metric.startTime;
            // AI补全点
        }
        return this;
    }
    
    getMetrics() {
        const results = {};
        for (const [label, metric] of this.metrics) {
            results[label] = metric.duration;
        }
        // AI补全点
        return results;
    }
    
    // 装饰器方法用于自动计时
    timeFunction(fn, label) {
        return async (...args) => {
            this.startTimer(label || fn.name);
            try {
                const result = await fn(...args);
                // AI补全点
                this.endTimer(label || fn.name);
                return result;
            } catch (error) {
                this.endTimer(label || fn.name);
                throw error;
            }
        };
    }
}

// 19. 事件发射器模式
class EventEmitter {
    constructor() {
        this.events = new Map();
        this.maxListeners = 10;
    }
    
    on(event, listener) {
        if (!this.events.has(event)) {
            this.events.set(event, []);
        }
        
        const listeners = this.events.get(event);
        if (listeners.length >= this.maxListeners) {
            console.warn(`Warning: Maximum listeners (${this.maxListeners}) for event "${event}" exceeded`);
        }
        
        listeners.push(listener);
        // AI补全点
        return this;
    }
    
    emit(event, ...args) {
        const listeners = this.events.get(event);
        if (!listeners) return false;
        
        listeners.forEach(listener => {
            try {
                // AI补全点
                listener.apply(this, args);
            } catch (error) {
                console.error(`Error in event listener for "${event}":`, error);
            }
        });
        
        return true;
    }
    
    off(event, listener) {
        const listeners = this.events.get(event);
        if (!listeners) return this;
        
        const index = listeners.indexOf(listener);
        if (index > -1) {
            listeners.splice(index, 1);
        }
        
        if (listeners.length === 0) {
            this.events.delete(event);
        }
        
        // AI补全点
        return this;
    }
    
    once(event, listener) {
        const onceWrapper = (...args) => {
            this.off(event, onceWrapper);
            // AI补全点
            listener.apply(this, args);
        };
        
        return this.on(event, onceWrapper);
    }
}

// 20. 模块化配置管理
class ConfigManager {
    constructor(initialConfig = {}) {
        this.config = new Map();
        this.validators = new Map();
        this.subscribers = new Map();
        
        // 初始化配置
        Object.entries(initialConfig).forEach(([key, value]) => {
            this.config.set(key, value);
        });
    }
    
    set(key, value) {
        // 验证值
        const validator = this.validators.get(key);
        if (validator && !validator(value)) {
            throw new ValidationError(key, value, 'Custom validation failed');
        }
        
        const oldValue = this.config.get(key);
        this.config.set(key, value);
        
        // 通知订阅者
        const subscribers = this.subscribers.get(key) || [];
        subscribers.forEach(callback => {
            // AI补全点
            callback(value, oldValue, key);
        });
        
        return this;
    }
    
    get(key, defaultValue = undefined) {
        // AI补全点
        return this.config.has(key) ? this.config.get(key) : defaultValue;
    }
    
    subscribe(key, callback) {
        if (!this.subscribers.has(key)) {
            this.subscribers.set(key, []);
        }
        this.subscribers.get(key).push(callback);
        // AI补全点
        return () => this.unsubscribe(key, callback);
    }
    
    addValidator(key, validator) {
        this.validators.set(key, validator);
        return this;
    }
}

// 使用示例
const appConfig = new ConfigManager({
    apiUrl: 'https://api.example.com',
    timeout: 5000,
    retries: 3
});

// 添加验证器
appConfig.addValidator('timeout', (value) => {
    // AI补全点
    return typeof value === 'number' && value > 0 && value <= 30000;
});

// 订阅配置变更
appConfig.subscribe('apiUrl', (newUrl, oldUrl) => {
    console.log(`API URL changed from ${oldUrl} to ${newUrl}`);
    // AI补全点
});

// 导出示例 (如果在模块环境中)
// export { 
//     DataService, 
//     CustomCollection, 
//     ObservableModel, 
//     EventEmitter, 
//     ConfigManager,
//     PerformanceMonitor
// };

console.log('现代JavaScript语法特性代码片段加载完成');
// AI补全点