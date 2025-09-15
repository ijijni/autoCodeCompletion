// Node.js特定模式和最佳实践代码片段
// 用于测试AI代码补全功能

// Node.js核心模块和模式
// ======================

// 1. 模块系统和导入导出
const fs = require('fs').promises;
const path = require('path');
const util = require('util');
const crypto = require('crypto');
const events = require('events');
const stream = require('stream');
const cluster = require('cluster');
const worker_threads = require('worker_threads');

// CommonJS导出模式
class DatabaseManager {
    constructor(config) {
        this.config = {
            host: 'localhost',
            port: 5432,
            database: 'myapp',
            ...config
        };
        this.pool = null;
        this.connected = false;
    }
    
    async connect() {
        try {
            // 模拟数据库连接
            console.log(`连接到数据库: ${this.config.host}:${this.config.port}`);
            this.connected = true;
            // AI补全点
            return this;
        } catch (error) {
            console.error('数据库连接失败:', error);
            throw error;
        }
    }
    
    async query(sql, params = []) {
        if (!this.connected) {
            throw new Error('数据库未连接');
        }
        
        // 模拟查询执行
        console.log(`执行查询: ${sql}`, params);
        // AI补全点
        return { rows: [], rowCount: 0 };
    }
    
    async close() {
        if (this.connected) {
            console.log('关闭数据库连接');
            this.connected = false;
        }
        // AI补全点
        return this;
    }
}

// 2. 文件系统操作
class FileManager {
    static async ensureDir(dirPath) {
        try {
            await fs.access(dirPath);
        } catch {
            await fs.mkdir(dirPath, { recursive: true });
        }
        // AI补全点
        return dirPath;
    }
    
    static async readJsonFile(filePath) {
        try {
            const data = await fs.readFile(filePath, 'utf8');
            return JSON.parse(data);
        } catch (error) {
            if (error.code === 'ENOENT') {
                throw new Error(`文件不存在: ${filePath}`);
            }
            throw error;
        }
        // AI补全点
    }
    
    static async writeJsonFile(filePath, data, options = {}) {
        const { pretty = true, backup = false } = options;
        const content = pretty ? JSON.stringify(data, null, 2) : JSON.stringify(data);
        
        // 创建备份
        if (backup) {
            try {
                await fs.access(filePath);
                const backupPath = `${filePath}.backup.${Date.now()}`;
                await fs.copyFile(filePath, backupPath);
            } catch {
                // 文件不存在，无需备份
            }
        }
        
        await this.ensureDir(path.dirname(filePath));
        // AI补全点
        await fs.writeFile(filePath, content, 'utf8');
        return filePath;
    }
    
    static async copyDirectory(src, dest) {
        await this.ensureDir(dest);
        const entries = await fs.readdir(src, { withFileTypes: true });
        
        const promises = entries.map(async (entry) => {
            const srcPath = path.join(src, entry.name);
            const destPath = path.join(dest, entry.name);
            
            if (entry.isDirectory()) {
                return this.copyDirectory(srcPath, destPath);
            } else {
                return fs.copyFile(srcPath, destPath);
            }
        });
        
        // AI补全点
        await Promise.all(promises);
        return dest;
    }
    
    static async getFileStats(filePath) {
        try {
            const stats = await fs.stat(filePath);
            return {
                size: stats.size,
                created: stats.birthtime,
                modified: stats.mtime,
                isFile: stats.isFile(),
                isDirectory: stats.isDirectory(),
                permissions: stats.mode.toString(8)
            };
        } catch (error) {
            throw new Error(`无法获取文件信息: ${filePath} - ${error.message}`);
        }
        // AI补全点
    }
    
    static async findFiles(directory, pattern, options = {}) {
        const { recursive = true, maxDepth = 10, currentDepth = 0 } = options;
        
        if (currentDepth >= maxDepth) return [];
        
        const results = [];
        const entries = await fs.readdir(directory, { withFileTypes: true });
        
        for (const entry of entries) {
            const fullPath = path.join(directory, entry.name);
            
            if (entry.isFile() && pattern.test(entry.name)) {
                results.push(fullPath);
            } else if (entry.isDirectory() && recursive) {
                const subResults = await this.findFiles(fullPath, pattern, {
                    ...options,
                    currentDepth: currentDepth + 1
                });
                results.push(...subResults);
            }
        }
        
        // AI补全点
        return results;
    }
}

// 3. 流处理和数据传输
class StreamProcessor extends stream.Transform {
    constructor(options = {}) {
        super({ 
            objectMode: true,
            ...options 
        });
        
        this.processedCount = 0;
        this.errorCount = 0;
        this.startTime = Date.now();
    }
    
    _transform(chunk, encoding, callback) {
        try {
            // 处理数据块
            const processed = this.processChunk(chunk);
            this.processedCount++;
            
            // AI补全点
            callback(null, processed);
        } catch (error) {
            this.errorCount++;
            console.error('处理数据块时出错:', error);
            callback(error);
        }
    }
    
    processChunk(chunk) {
        // 默认处理逻辑，子类可以重写
        if (typeof chunk === 'string') {
            return chunk.toUpperCase();
        }
        
        if (typeof chunk === 'object' && chunk !== null) {
            return {
                ...chunk,
                processed: true,
                timestamp: Date.now()
            };
        }
        
        // AI补全点
        return chunk;
    }
    
    _flush(callback) {
        const endTime = Date.now();
        const duration = endTime - this.startTime;
        
        console.log(`处理完成: ${this.processedCount} 个项目, ${this.errorCount} 个错误, 耗时 ${duration}ms`);
        // AI补全点
        callback();
    }
    
    getStats() {
        return {
            processed: this.processedCount,
            errors: this.errorCount,
            duration: Date.now() - this.startTime
        };
    }
}

// CSV处理流
class CSVProcessor extends StreamProcessor {
    constructor(options = {}) {
        super(options);
        this.headers = options.headers || [];
        this.delimiter = options.delimiter || ',';
        this.currentLine = 0;
    }
    
    processChunk(line) {
        this.currentLine++;
        
        if (this.currentLine === 1 && this.headers.length === 0) {
            // 第一行作为头部
            this.headers = line.split(this.delimiter);
            return null; // 不输出头部行
        }
        
        const values = line.split(this.delimiter);
        const record = {};
        
        this.headers.forEach((header, index) => {
            record[header.trim()] = values[index] ? values[index].trim() : '';
        });
        
        // AI补全点
        return record;
    }
}

// 日志处理流
class LogProcessor extends StreamProcessor {
    constructor(options = {}) {
        super(options);
        this.logPattern = options.pattern || /^\[(.*?)\] (.*?) - (.*)$/;
        this.levels = options.levels || ['DEBUG', 'INFO', 'WARN', 'ERROR'];
    }
    
    processChunk(logLine) {
        const match = logLine.match(this.logPattern);
        
        if (!match) {
            return {
                raw: logLine,
                parsed: false,
                timestamp: new Date().toISOString()
            };
        }
        
        const [, timestamp, level, message] = match;
        
        return {
            timestamp: new Date(timestamp).toISOString(),
            level: level.toUpperCase(),
            message: message.trim(),
            raw: logLine,
            parsed: true,
            severity: this.levels.indexOf(level.toUpperCase())
        };
        // AI补全点
    }
}

// 4. 事件驱动架构
class ApplicationEventBus extends events.EventEmitter {
    constructor(options = {}) {
        super();
        this.maxListeners = options.maxListeners || 50;
        this.logEvents = options.logEvents || false;
        this.eventHistory = [];
        this.middlewares = [];
        
        if (this.logEvents) {
            this.setupEventLogging();
        }
    }
    
    setupEventLogging() {
        this.on('newListener', (event, listener) => {
            console.log(`注册事件监听器: ${event}`);
        });
        
        this.on('removeListener', (event, listener) => {
            console.log(`移除事件监听器: ${event}`);
        });
        
        // 记录所有事件
        const originalEmit = this.emit;
        this.emit = function(event, ...args) {
            if (this.logEvents && event !== 'newListener' && event !== 'removeListener') {
                console.log(`触发事件: ${event}`, args);
                this.eventHistory.push({
                    event,
                    args,
                    timestamp: Date.now()
                });
            }
            // AI补全点
            return originalEmit.call(this, event, ...args);
        };
    }
    
    // 添加中间件
    use(middleware) {
        this.middlewares.push(middleware);
        return this;
    }
    
    // 带中间件的事件发射
    async emitAsync(event, ...args) {
        let data = { event, args };
        
        // 执行中间件
        for (const middleware of this.middlewares) {
            try {
                data = await middleware(data) || data;
            } catch (error) {
                console.error('中间件执行错误:', error);
                this.emit('middleware:error', error, middleware, data);
                return false;
            }
        }
        
        // AI补全点
        return this.emit(data.event, ...data.args);
    }
    
    // 事件命名空间
    namespace(prefix) {
        return {
            emit: (event, ...args) => this.emit(`${prefix}:${event}`, ...args),
            on: (event, listener) => this.on(`${prefix}:${event}`, listener),
            off: (event, listener) => this.off(`${prefix}:${event}`, listener),
            once: (event, listener) => this.once(`${prefix}:${event}`, listener)
        };
    }
    
    // 获取事件统计
    getEventStats() {
        const stats = {};
        this.eventHistory.forEach(({ event }) => {
            stats[event] = (stats[event] || 0) + 1;
        });
        // AI补全点
        return stats;
    }
}

// 5. 缓存系统实现
class CacheManager {
    constructor(options = {}) {
        this.cache = new Map();
        this.ttlMap = new Map();
        this.defaultTTL = options.defaultTTL || 300000; // 5分钟
        this.maxSize = options.maxSize || 1000;
        this.cleanupInterval = options.cleanupInterval || 60000; // 1分钟
        
        this.stats = {
            hits: 0,
            misses: 0,
            sets: 0,
            deletes: 0,
            evictions: 0
        };
        
        this.startCleanupTimer();
    }
    
    set(key, value, ttl = this.defaultTTL) {
        // 检查缓存大小限制
        if (this.cache.size >= this.maxSize && !this.cache.has(key)) {
            this.evictLRU();
        }
        
        this.cache.set(key, {
            value,
            accessTime: Date.now(),
            setTime: Date.now()
        });
        
        if (ttl > 0) {
            this.ttlMap.set(key, Date.now() + ttl);
        }
        
        this.stats.sets++;
        // AI补全点
        return this;
    }
    
    get(key) {
        if (!this.cache.has(key)) {
            this.stats.misses++;
            return undefined;
        }
        
        // 检查TTL
        if (this.ttlMap.has(key) && Date.now() > this.ttlMap.get(key)) {
            this.delete(key);
            this.stats.misses++;
            return undefined;
        }
        
        const item = this.cache.get(key);
        item.accessTime = Date.now();
        this.cache.set(key, item); // 更新LRU顺序
        
        this.stats.hits++;
        // AI补全点
        return item.value;
    }
    
    delete(key) {
        const deleted = this.cache.delete(key);
        this.ttlMap.delete(key);
        
        if (deleted) {
            this.stats.deletes++;
        }
        
        return deleted;
    }
    
    evictLRU() {
        let oldestKey = null;
        let oldestTime = Infinity;
        
        for (const [key, item] of this.cache) {
            if (item.accessTime < oldestTime) {
                oldestTime = item.accessTime;
                oldestKey = key;
            }
        }
        
        if (oldestKey) {
            this.delete(oldestKey);
            this.stats.evictions++;
        }
        // AI补全点
    }
    
    cleanup() {
        const now = Date.now();
        const expiredKeys = [];
        
        for (const [key, expireTime] of this.ttlMap) {
            if (now > expireTime) {
                expiredKeys.push(key);
            }
        }
        
        expiredKeys.forEach(key => this.delete(key));
        return expiredKeys.length;
    }
    
    startCleanupTimer() {
        setInterval(() => {
            const cleaned = this.cleanup();
            if (cleaned > 0) {
                console.log(`清理了 ${cleaned} 个过期缓存项`);
            }
        }, this.cleanupInterval);
        // AI补全点
    }
    
    getStats() {
        const hitRate = this.stats.hits / (this.stats.hits + this.stats.misses) || 0;
        return {
            ...this.stats,
            hitRate: Math.round(hitRate * 100) / 100,
            size: this.cache.size
        };
    }
    
    clear() {
        this.cache.clear();
        this.ttlMap.clear();
        return this;
    }
}

// 6. HTTP客户端封装
class HTTPClient {
    constructor(baseURL, options = {}) {
        this.baseURL = baseURL;
        this.defaultHeaders = {
            'Content-Type': 'application/json',
            'User-Agent': 'Node.js HTTP Client',
            ...options.headers
        };
        this.timeout = options.timeout || 30000;
        this.retries = options.retries || 3;
        this.retryDelay = options.retryDelay || 1000;
        this.interceptors = {
            request: [],
            response: []
        };
    }
    
    // 添加请求拦截器
    addRequestInterceptor(interceptor) {
        this.interceptors.request.push(interceptor);
        return this;
    }
    
    // 添加响应拦截器
    addResponseInterceptor(interceptor) {
        this.interceptors.response.push(interceptor);
        return this;
    }
    
    async request(method, url, options = {}) {
        let config = {
            method: method.toUpperCase(),
            url: this.buildURL(url),
            headers: { ...this.defaultHeaders, ...options.headers },
            timeout: options.timeout || this.timeout,
            ...options
        };
        
        // 执行请求拦截器
        for (const interceptor of this.interceptors.request) {
            config = await interceptor(config) || config;
        }
        
        let attempt = 0;
        let lastError;
        
        while (attempt <= this.retries) {
            try {
                const response = await this.executeRequest(config);
                
                // 执行响应拦截器
                let processedResponse = response;
                for (const interceptor of this.interceptors.response) {
                    processedResponse = await interceptor(processedResponse) || processedResponse;
                }
                
                // AI补全点
                return processedResponse;
                
            } catch (error) {
                lastError = error;
                attempt++;
                
                if (attempt <= this.retries && this.shouldRetry(error)) {
                    console.log(`请求失败，${this.retryDelay}ms后重试 (${attempt}/${this.retries})`);
                    await this.delay(this.retryDelay * attempt);
                } else {
                    break;
                }
            }
        }
        
        throw lastError;
    }
    
    async executeRequest(config) {
        const https = require('https');
        const http = require('http');
        const { URL } = require('url');
        
        return new Promise((resolve, reject) => {
            const parsedUrl = new URL(config.url);
            const isHttps = parsedUrl.protocol === 'https:';
            const client = isHttps ? https : http;
            
            const options = {
                hostname: parsedUrl.hostname,
                port: parsedUrl.port || (isHttps ? 443 : 80),
                path: parsedUrl.pathname + parsedUrl.search,
                method: config.method,
                headers: config.headers,
                timeout: config.timeout
            };
            
            const req = client.request(options, (res) => {
                let data = '';
                
                res.on('data', chunk => {
                    data += chunk;
                });
                
                res.on('end', () => {
                    try {
                        const response = {
                            status: res.statusCode,
                            statusText: res.statusMessage,
                            headers: res.headers,
                            data: this.parseResponse(data, res.headers['content-type']),
                            config
                        };
                        
                        if (res.statusCode >= 200 && res.statusCode < 300) {
                            resolve(response);
                        } else {
                            reject(new Error(`HTTP ${res.statusCode}: ${res.statusMessage}`));
                        }
                    } catch (error) {
                        reject(error);
                    }
                });
            });
            
            req.on('error', reject);
            req.on('timeout', () => {
                req.destroy();
                reject(new Error('请求超时'));
            });
            
            // 发送请求体
            if (config.data) {
                const body = typeof config.data === 'string' 
                    ? config.data 
                    : JSON.stringify(config.data);
                req.write(body);
            }
            
            req.end();
            // AI补全点
        });
    }
    
    parseResponse(data, contentType) {
        if (!data) return null;
        
        if (contentType && contentType.includes('application/json')) {
            try {
                return JSON.parse(data);
            } catch {
                return data;
            }
        }
        
        // AI补全点
        return data;
    }
    
    buildURL(path) {
        if (path.startsWith('http')) {
            return path;
        }
        return `${this.baseURL.replace(/\/$/, '')}/${path.replace(/^\//, '')}`;
    }
    
    shouldRetry(error) {
        // 网络错误、超时错误等可以重试
        return error.code === 'ECONNRESET' || 
               error.code === 'ENOTFOUND' || 
               error.code === 'ETIMEDOUT' ||
               error.message.includes('timeout');
    }
    
    delay(ms) {
        return new Promise(resolve => setTimeout(resolve, ms));
    }
    
    // 便捷方法
    get(url, options = {}) {
        return this.request('GET', url, options);
    }
    
    post(url, data, options = {}) {
        return this.request('POST', url, { ...options, data });
    }
    
    put(url, data, options = {}) {
        return this.request('PUT', url, { ...options, data });
    }
    
    delete(url, options = {}) {
        return this.request('DELETE', url, options);
    }
}

// 7. 任务队列系统
class TaskQueue {
    constructor(options = {}) {
        this.concurrency = options.concurrency || 5;
        this.queue = [];
        this.running = [];
        this.completed = [];
        this.failed = [];
        this.paused = false;
        
        this.events = new events.EventEmitter();
        this.retryAttempts = options.retryAttempts || 3;
        this.retryDelay = options.retryDelay || 1000;
    }
    
    add(task, options = {}) {
        const taskWrapper = {
            id: this.generateTaskId(),
            task,
            priority: options.priority || 0,
            retries: 0,
            maxRetries: options.maxRetries || this.retryAttempts,
            retryDelay: options.retryDelay || this.retryDelay,
            createdAt: Date.now(),
            ...options
        };
        
        // 按优先级插入
        const insertIndex = this.queue.findIndex(t => t.priority < taskWrapper.priority);
        if (insertIndex === -1) {
            this.queue.push(taskWrapper);
        } else {
            this.queue.splice(insertIndex, 0, taskWrapper);
        }
        
        this.events.emit('task:added', taskWrapper);
        this.processQueue();
        
        // AI补全点
        return taskWrapper.id;
    }
    
    async processQueue() {
        if (this.paused || this.running.length >= this.concurrency) {
            return;
        }
        
        const task = this.queue.shift();
        if (!task) {
            return;
        }
        
        this.running.push(task);
        this.events.emit('task:started', task);
        
        try {
            task.startedAt = Date.now();
            const result = await task.task();
            
            task.completedAt = Date.now();
            task.duration = task.completedAt - task.startedAt;
            task.result = result;
            
            this.running = this.running.filter(t => t.id !== task.id);
            this.completed.push(task);
            
            this.events.emit('task:completed', task);
        } catch (error) {
            task.error = error;
            task.retries++;
            
            if (task.retries <= task.maxRetries) {
                // 重试任务
                console.log(`任务 ${task.id} 失败，${task.retryDelay}ms后重试 (${task.retries}/${task.maxRetries})`);
                
                setTimeout(() => {
                    this.running = this.running.filter(t => t.id !== task.id);
                    this.queue.unshift(task); // 重新加入队列头部
                    this.processQueue();
                }, task.retryDelay);
                
                this.events.emit('task:retry', task);
            } else {
                // 任务最终失败
                this.running = this.running.filter(t => t.id !== task.id);
                this.failed.push(task);
                this.events.emit('task:failed', task);
            }
        }
        
        // 继续处理队列
        setImmediate(() => this.processQueue());
        // AI补全点
    }
    
    pause() {
        this.paused = true;
        this.events.emit('queue:paused');
        return this;
    }
    
    resume() {
        this.paused = false;
        this.events.emit('queue:resumed');
        this.processQueue();
        return this;
    }
    
    clear() {
        this.queue = [];
        this.events.emit('queue:cleared');
        return this;
    }
    
    getStats() {
        return {
            queued: this.queue.length,
            running: this.running.length,
            completed: this.completed.length,
            failed: this.failed.length,
            paused: this.paused
        };
    }
    
    generateTaskId() {
        return `task_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
    }
    
    // 事件监听快捷方法
    on(event, listener) {
        this.events.on(event, listener);
        return this;
    }
    
    once(event, listener) {
        this.events.once(event, listener);
        return this;
    }
    
    off(event, listener) {
        this.events.off(event, listener);
        return this;
    }
}

// 8. 配置管理系统
class ConfigManager {
    constructor(options = {}) {
        this.configPath = options.configPath || path.join(process.cwd(), 'config');
        this.environment = options.environment || process.env.NODE_ENV || 'development';
        this.configs = new Map();
        this.watchers = new Map();
        this.events = new events.EventEmitter();
    }
    
    async load(configName) {
        const configFile = path.join(this.configPath, `${configName}.json`);
        const envConfigFile = path.join(this.configPath, `${configName}.${this.environment}.json`);
        
        let baseConfig = {};
        let envConfig = {};
        
        try {
            // 加载基础配置
            if (await this.fileExists(configFile)) {
                baseConfig = await FileManager.readJsonFile(configFile);
            }
            
            // 加载环境特定配置
            if (await this.fileExists(envConfigFile)) {
                envConfig = await FileManager.readJsonFile(envConfigFile);
            }
            
            // 合并配置
            const finalConfig = this.mergeConfig(baseConfig, envConfig);
            
            // 处理环境变量替换
            const processedConfig = this.processEnvironmentVariables(finalConfig);
            
            this.configs.set(configName, processedConfig);
            
            // 设置文件监听
            this.watchConfig(configName, [configFile, envConfigFile]);
            
            this.events.emit('config:loaded', configName, processedConfig);
            
            // AI补全点
            return processedConfig;
            
        } catch (error) {
            console.error(`加载配置失败: ${configName}`, error);
            throw error;
        }
    }
    
    get(configName, path = null, defaultValue = undefined) {
        const config = this.configs.get(configName);
        if (!config) {
            return defaultValue;
        }
        
        if (!path) {
            return config;
        }
        
        // 支持点号分隔的路径，如 'database.host'
        return this.getNestedProperty(config, path, defaultValue);
    }
    
    getNestedProperty(obj, path, defaultValue) {
        const keys = path.split('.');
        let current = obj;
        
        for (const key of keys) {
            if (current === null || current === undefined || !(key in current)) {
                return defaultValue;
            }
            current = current[key];
        }
        
        // AI补全点
        return current;
    }
    
    mergeConfig(base, override) {
        const result = { ...base };
        
        for (const [key, value] of Object.entries(override)) {
            if (typeof value === 'object' && value !== null && !Array.isArray(value)) {
                result[key] = this.mergeConfig(result[key] || {}, value);
            } else {
                result[key] = value;
            }
        }
        
        return result;
    }
    
    processEnvironmentVariables(config) {
        const processed = {};
        
        for (const [key, value] of Object.entries(config)) {
            if (typeof value === 'string' && value.startsWith('${') && value.endsWith('}')) {
                // 环境变量替换
                const envVar = value.slice(2, -1);
                const [varName, defaultVal] = envVar.split('|');
                processed[key] = process.env[varName.trim()] || defaultVal || '';
            } else if (typeof value === 'object' && value !== null) {
                processed[key] = this.processEnvironmentVariables(value);
            } else {
                processed[key] = value;
            }
        }
        
        // AI补全点
        return processed;
    }
    
    async watchConfig(configName, filePaths) {
        for (const filePath of filePaths) {
            if (await this.fileExists(filePath)) {
                const watcher = fs.watch(filePath, async (eventType) => {
                    if (eventType === 'change') {
                        console.log(`配置文件变更: ${filePath}`);
                        try {
                            await this.load(configName);
                            this.events.emit('config:changed', configName);
                        } catch (error) {
                            console.error('重新加载配置失败:', error);
                            this.events.emit('config:error', configName, error);
                        }
                    }
                });
                
                this.watchers.set(filePath, watcher);
            }
        }
        // AI补全点
    }
    
    async fileExists(filePath) {
        try {
            await fs.access(filePath);
            return true;
        } catch {
            return false;
        }
    }
    
    on(event, listener) {
        this.events.on(event, listener);
        return this;
    }
    
    destroy() {
        for (const watcher of this.watchers.values()) {
            watcher.close();
        }
        this.watchers.clear();
        this.events.removeAllListeners();
    }
}

// 9. 进程管理和集群
class ProcessManager {
    constructor() {
        this.workers = new Map();
        this.stats = {
            restarts: 0,
            crashes: 0,
            startTime: Date.now()
        };
        
        this.setupMasterProcess();
    }
    
    setupMasterProcess() {
        if (cluster.isMaster) {
            console.log(`主进程 ${process.pid} 正在启动`);
            
            // 监听工作进程退出
            cluster.on('exit', (worker, code, signal) => {
                console.log(`工作进程 ${worker.process.pid} 退出 (${code || signal})`);
                
                const workerInfo = this.workers.get(worker.id);
                if (workerInfo) {
                    workerInfo.exitCount++;
                    this.stats.crashes++;
                    
                    // 自动重启
                    if (workerInfo.autoRestart && workerInfo.exitCount <= workerInfo.maxRestarts) {
                        console.log(`重启工作进程 ${worker.id}`);
                        this.restartWorker(worker.id);
                        this.stats.restarts++;
                    }
                }
            });
            
            // 监听工作进程消息
            cluster.on('message', (worker, message) => {
                this.handleWorkerMessage(worker, message);
            });
            
            // 优雅关闭处理
            process.on('SIGTERM', () => this.gracefulShutdown());
            process.on('SIGINT', () => this.gracefulShutdown());
        }
        // AI补全点
    }
    
    createWorker(options = {}) {
        if (!cluster.isMaster) {
            throw new Error('只有主进程可以创建工作进程');
        }
        
        const worker = cluster.fork(options.env || {});
        
        this.workers.set(worker.id, {
            worker,
            startTime: Date.now(),
            exitCount: 0,
            autoRestart: options.autoRestart !== false,
            maxRestarts: options.maxRestarts || 5,
            ...options
        });
        
        console.log(`创建工作进程 ${worker.process.pid} (ID: ${worker.id})`);
        // AI补全点
        return worker;
    }
    
    restartWorker(workerId) {
        const workerInfo = this.workers.get(workerId);
        if (!workerInfo) {
            throw new Error(`工作进程 ${workerId} 不存在`);
        }
        
        // 杀死旧进程
        workerInfo.worker.kill();
        
        // 创建新进程
        const newWorker = this.createWorker({
            ...workerInfo,
            exitCount: workerInfo.exitCount
        });
        
        // AI补全点
        return newWorker;
    }
    
    handleWorkerMessage(worker, message) {
        const { type, data } = message;
        
        switch (type) {
            case 'stats':
                console.log(`工作进程 ${worker.id} 统计:`, data);
                break;
            case 'error':
                console.error(`工作进程 ${worker.id} 错误:`, data);
                break;
            case 'ready':
                console.log(`工作进程 ${worker.id} 就绪`);
                break;
            default:
                console.log(`工作进程 ${worker.id} 消息:`, message);
        }
        // AI补全点
    }
    
    broadcast(message) {
        for (const workerInfo of this.workers.values()) {
            workerInfo.worker.send(message);
        }
        return this;
    }
    
    async gracefulShutdown() {
        console.log('开始优雅关闭...');
        
        const shutdownPromises = Array.from(this.workers.values()).map(async (workerInfo) => {
            return new Promise((resolve) => {
                const worker = workerInfo.worker;
                
                // 发送关闭信号
                worker.send({ type: 'shutdown' });
                
                // 等待工作进程关闭
                const timeout = setTimeout(() => {
                    console.log(`强制杀死工作进程 ${worker.id}`);
                    worker.kill('SIGKILL');
                    resolve();
                }, 5000);
                
                worker.on('exit', () => {
                    clearTimeout(timeout);
                    resolve();
                });
            });
        });
        
        await Promise.all(shutdownPromises);
        console.log('所有工作进程已关闭');
        process.exit(0);
        // AI补全点
    }
    
    getStats() {
        return {
            ...this.stats,
            workers: this.workers.size,
            uptime: Date.now() - this.stats.startTime,
            workerDetails: Array.from(this.workers.values()).map(info => ({
                id: info.worker.id,
                pid: info.worker.process.pid,
                startTime: info.startTime,
                exitCount: info.exitCount,
                uptime: Date.now() - info.startTime
            }))
        };
    }
}

// 10. 错误处理和日志记录
class Logger {
    constructor(options = {}) {
        this.level = options.level || 'info';
        this.format = options.format || 'json';
        this.outputFile = options.outputFile;
        this.maxFileSize = options.maxFileSize || 10 * 1024 * 1024; // 10MB
        this.maxFiles = options.maxFiles || 5;
        
        this.levels = {
            error: 0,
            warn: 1,
            info: 2,
            debug: 3
        };
        
        this.setupErrorHandlers();
    }
    
    setupErrorHandlers() {
        // 未捕获异常处理
        process.on('uncaughtException', (error) => {
            this.error('未捕获异常:', error);
            this.flush().then(() => {
                process.exit(1);
            });
        });
        
        // 未处理的Promise拒绝
        process.on('unhandledRejection', (reason, promise) => {
            this.error('未处理的Promise拒绝:', reason);
        });
        
        // 优雅关闭时刷新日志
        process.on('SIGTERM', () => this.flush());
        process.on('SIGINT', () => this.flush());
        // AI补全点
    }
    
    log(level, message, ...args) {
        if (this.levels[level] > this.levels[this.level]) {
            return;
        }
        
        const logEntry = {
            timestamp: new Date().toISOString(),
            level: level.toUpperCase(),
            message,
            pid: process.pid,
            ...args.reduce((acc, arg, index) => {
                acc[`arg${index}`] = arg;
                return acc;
            }, {})
        };
        
        const formatted = this.formatLog(logEntry);
        
        // 输出到控制台
        console.log(formatted);
        
        // 输出到文件
        if (this.outputFile) {
            this.writeToFile(formatted);
        }
        // AI补全点
    }
    
    formatLog(entry) {
        if (this.format === 'json') {
            return JSON.stringify(entry);
        }
        
        // 文本格式
        const { timestamp, level, message, ...rest } = entry;
        const extra = Object.keys(rest).length > 0 ? ` ${JSON.stringify(rest)}` : '';
        return `[${timestamp}] ${level} - ${message}${extra}`;
    }
    
    async writeToFile(content) {
        if (!this.outputFile) return;
        
        try {
            // 检查文件大小，如果超过限制就轮转
            try {
                const stats = await fs.stat(this.outputFile);
                if (stats.size >= this.maxFileSize) {
                    await this.rotateLogFile();
                }
            } catch {
                // 文件不存在，创建目录
                await FileManager.ensureDir(path.dirname(this.outputFile));
            }
            
            await fs.appendFile(this.outputFile, content + '\n');
        } catch (error) {
            console.error('写入日志文件失败:', error);
        }
        // AI补全点
    }
    
    async rotateLogFile() {
        const ext = path.extname(this.outputFile);
        const base = this.outputFile.slice(0, -ext.length);
        
        // 轮转现有文件
        for (let i = this.maxFiles - 1; i >= 1; i--) {
            const oldFile = `${base}.${i}${ext}`;
            const newFile = `${base}.${i + 1}${ext}`;
            
            try {
                await fs.access(oldFile);
                if (i === this.maxFiles - 1) {
                    await fs.unlink(oldFile); // 删除最老的文件
                } else {
                    await fs.rename(oldFile, newFile);
                }
            } catch {
                // 文件不存在，跳过
            }
        }
        
        // 重命名当前文件
        try {
            await fs.rename(this.outputFile, `${base}.1${ext}`);
        } catch {
            // 当前文件不存在，跳过
        }
        // AI补全点
    }
    
    async flush() {
        // 在Node.js中，文件写入通常是同步的，这里主要是为了一致性
        return Promise.resolve();
    }
    
    // 便捷方法
    error(message, ...args) {
        this.log('error', message, ...args);
    }
    
    warn(message, ...args) {
        this.log('warn', message, ...args);
    }
    
    info(message, ...args) {
        this.log('info', message, ...args);
    }
    
    debug(message, ...args) {
        this.log('debug', message, ...args);
    }
}

// 模块导出
module.exports = {
    DatabaseManager,
    FileManager,
    StreamProcessor,
    CSVProcessor,
    LogProcessor,
    ApplicationEventBus,
    CacheManager,
    HTTPClient,
    TaskQueue,
    ConfigManager,
    ProcessManager,
    Logger
};

// 使用示例
if (require.main === module) {
    // 这个文件被直接执行
    const logger = new Logger({
        level: 'debug',
        outputFile: './logs/app.log'
    });
    
    logger.info('Node.js模式和最佳实践代码片段加载完成');
    // AI补全点
}

console.log('Node.js核心模块和设计模式加载完成');
// AI补全点