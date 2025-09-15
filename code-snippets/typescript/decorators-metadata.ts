/**
 * TypeScript装饰器和元数据示例
 */

// 启用实验性装饰器支持
// tsconfig.json 需要设置: "experimentalDecorators": true, "emitDecoratorMetadata": true

// 类装饰器示例
function Component(config: { selector: string; template: string }) {
    return function <T extends { new (...args: any[]): {} }>(constructor: T) {
        return class extends constructor {
            selector = config.selector;
            template = config.template;
            
            render() {
                console.log(`渲染组件: ${this.selector}`);
                console.log(`模板: ${this.template}`);
            }
        };
    };
}

@Component({
    selector: 'app-user',
    template: '<div>用户组件</div>'
})
class UserComponent {
    name: string;
    
    constructor(name: string) {
        this.name = name;
    }
    
    getName() {
        return this.name;
    }
}

// 方法装饰器示例
function Log(target: any, propertyName: string, descriptor: PropertyDescriptor) {
    const method = descriptor.value;
    
    descriptor.value = function (...args: any[]) {
        console.log(`调用方法: ${propertyName}`);
        console.log(`参数: ${JSON.stringify(args)}`);
        
        const start = performance.now();
        const result = method.apply(this, args);
        const end = performance.now();
        
        console.log(`执行时间: ${end - start}ms`);
        console.log(`返回值: ${JSON.stringify(result)}`);
        
        return result;
    };
}

function Validate(validationRules: { [key: string]: (value: any) => boolean }) {
    return function (target: any, propertyName: string, descriptor: PropertyDescriptor) {
        const method = descriptor.value;
        
        descriptor.value = function (...args: any[]) {
            // 验证参数
            const paramNames = getParameterNames(method);
            for (let i = 0; i < args.length; i++) {
                const paramName = paramNames[i];
                const rule = validationRules[paramName];
                if (rule && !rule(args[i])) {
                    throw new Error(`参数验证失败: ${paramName} = ${args[i]}`);
                }
            }
            
            return method.apply(this, args);
        };
    };
}

// 获取函数参数名的辅助函数
function getParameterNames(func: Function): string[] {
    const funcStr = func.toString();
    const match = funcStr.match(/\(([^)]*)\)/);
    if (!match) return [];
    
    return match[1]
        .split(',')
        .map(param => param.trim().split(/\s+/)[0])
        .filter(name => name.length > 0);
}

class Calculator {
    @Log
    @Validate({
        a: (value) => typeof value === 'number' && !isNaN(value),
        b: (value) => typeof value === 'number' && !isNaN(value)
    })
    add(a: number, b: number): number {
        return a + b;
    }
    
    @Log
    @Validate({
        a: (value) => typeof value === 'number' && !isNaN(value),
        b: (value) => typeof value === 'number' && value !== 0
    })
    divide(a: number, b: number): number {
        return a / b;
    }
}

// 属性装饰器示例
function Required(target: any, propertyName: string) {
    let value: any;
    
    const getter = () => {
        return value;
    };
    
    const setter = (newValue: any) => {
        if (newValue === null || newValue === undefined) {
            throw new Error(`属性 ${propertyName} 是必需的`);
        }
        value = newValue;
    };
    
    Object.defineProperty(target, propertyName, {
        get: getter,
        set: setter,
        enumerable: true,
        configurable: true
    });
}

function MinLength(length: number) {
    return function (target: any, propertyName: string) {
        let value: string;
        
        const getter = () => value;
        const setter = (newValue: string) => {
            if (typeof newValue !== 'string' || newValue.length < length) {
                throw new Error(`属性 ${propertyName} 最小长度为 ${length}`);
            }
            value = newValue;
        };
        
        Object.defineProperty(target, propertyName, {
            get: getter,
            set: setter,
            enumerable: true,
            configurable: true
        });
    };
}

function Range(min: number, max: number) {
    return function (target: any, propertyName: string) {
        let value: number;
        
        const getter = () => value;
        const setter = (newValue: number) => {
            if (typeof newValue !== 'number' || newValue < min || newValue > max) {
                throw new Error(`属性 ${propertyName} 必须在 ${min} 到 ${max} 之间`);
            }
            value = newValue;
        };
        
        Object.defineProperty(target, propertyName, {
            get: getter,
            set: setter,
            enumerable: true,
            configurable: true
        });
    };
}

class User {
    @Required
    @MinLength(2)
    name!: string;
    
    @Required
    email!: string;
    
    @Range(0, 150)
    age!: number;
}

// 参数装饰器示例
function LogParameter(target: any, propertyName: string, parameterIndex: number) {
    const existingLoggedParameters: number[] = Reflect.getMetadata('logged_parameters', target, propertyName) || [];
    existingLoggedParameters.push(parameterIndex);
    Reflect.defineMetadata('logged_parameters', existingLoggedParameters, target, propertyName);
}

function LogParameters(target: any, propertyName: string, descriptor: PropertyDescriptor) {
    const method = descriptor.value;
    const loggedParameters: number[] = Reflect.getMetadata('logged_parameters', target, propertyName) || [];
    
    descriptor.value = function (...args: any[]) {
        loggedParameters.forEach(index => {
            console.log(`参数 ${index}: ${JSON.stringify(args[index])}`);
        });
        
        return method.apply(this, args);
    };
}

class Service {
    @LogParameters
    processData(@LogParameter data: any, @LogParameter options: any, callback: Function) {
        console.log('处理数据...');
        callback(data, options);
    }
}

// 装饰器工厂示例
function Throttle(delay: number) {
    return function (target: any, propertyName: string, descriptor: PropertyDescriptor) {
        const method = descriptor.value;
        let lastCallTime = 0;
        
        descriptor.value = function (...args: any[]) {
            const now = Date.now();
            if (now - lastCallTime >= delay) {
                lastCallTime = now;
                return method.apply(this, args);
            } else {
                console.log(`方法 ${propertyName} 被节流限制`);
            }
        };
    };
}

function Debounce(delay: number) {
    return function (target: any, propertyName: string, descriptor: PropertyDescriptor) {
        const method = descriptor.value;
        let timeoutId: NodeJS.Timeout;
        
        descriptor.value = function (...args: any[]) {
            clearTimeout(timeoutId);
            timeoutId = setTimeout(() => {
                method.apply(this, args);
            }, delay);
        };
    };
}

function Cache(ttl: number = 60000) { // 默认缓存1分钟
    return function (target: any, propertyName: string, descriptor: PropertyDescriptor) {
        const method = descriptor.value;
        const cache = new Map<string, { value: any; timestamp: number }>();
        
        descriptor.value = function (...args: any[]) {
            const key = JSON.stringify(args);
            const cached = cache.get(key);
            const now = Date.now();
            
            if (cached && (now - cached.timestamp) < ttl) {
                console.log(`缓存命中: ${propertyName}`);
                return cached.value;
            }
            
            const result = method.apply(this, args);
            cache.set(key, { value: result, timestamp: now });
            console.log(`缓存存储: ${propertyName}`);
            
            return result;
        };
    };
}

class ApiService {
    @Throttle(1000)
    sendRequest(url: string) {
        console.log(`发送请求到: ${url}`);
        return `响应来自 ${url}`;
    }
    
    @Debounce(500)
    search(query: string) {
        console.log(`搜索: ${query}`);
        return `搜索结果: ${query}`;
    }
    
    @Cache(5000)
    fetchData(id: number) {
        console.log(`获取数据: ${id}`);
        // 模拟API调用
        return { id, data: `数据-${id}`, timestamp: Date.now() };
    }
}

// 元数据示例
const METADATA_KEY = {
    ROUTE: Symbol('route'),
    MIDDLEWARE: Symbol('middleware'),
    VALIDATION: Symbol('validation')
};

function Route(path: string, method: string = 'GET') {
    return function (target: any, propertyName: string) {
        Reflect.defineMetadata(METADATA_KEY.ROUTE, { path, method }, target, propertyName);
    };
}

function Middleware(middlewares: string[]) {
    return function (target: any, propertyName: string) {
        Reflect.defineMetadata(METADATA_KEY.MIDDLEWARE, middlewares, target, propertyName);
    };
}

function ValidateBody(schema: any) {
    return function (target: any, propertyName: string) {
        Reflect.defineMetadata(METADATA_KEY.VALIDATION, schema, target, propertyName);
    };
}

class UserController {
    @Route('/users', 'GET')
    @Middleware(['auth', 'logging'])
    getUsers() {
        return '获取用户列表';
    }
    
    @Route('/users', 'POST')
    @Middleware(['auth'])
    @ValidateBody({ name: 'string', email: 'string', age: 'number' })
    createUser() {
        return '创建用户';
    }
    
    @Route('/users/:id', 'PUT')
    @Middleware(['auth', 'validation'])
    updateUser() {
        return '更新用户';
    }
}

// 元数据读取器
function getRouteMetadata(target: any, propertyName: string) {
    return Reflect.getMetadata(METADATA_KEY.ROUTE, target, propertyName);
}

function getMiddlewareMetadata(target: any, propertyName: string) {
    return Reflect.getMetadata(METADATA_KEY.MIDDLEWARE, target, propertyName);
}

function getValidationMetadata(target: any, propertyName: string) {
    return Reflect.getMetadata(METADATA_KEY.VALIDATION, target, propertyName);
}

// 路由注册器
function registerRoutes(controller: any) {
    const prototype = Object.getPrototypeOf(controller);
    const methodNames = Object.getOwnPropertyNames(prototype).filter(
        name => name !== 'constructor' && typeof prototype[name] === 'function'
    );
    
    methodNames.forEach(methodName => {
        const route = getRouteMetadata(prototype, methodName);
        const middlewares = getMiddlewareMetadata(prototype, methodName);
        const validation = getValidationMetadata(prototype, methodName);
        
        if (route) {
            console.log(`注册路由: ${route.method} ${route.path} -> ${methodName}`);
            if (middlewares) {
                console.log(`  中间件: ${middlewares.join(', ')}`);
            }
            if (validation) {
                console.log(`  验证规则: ${JSON.stringify(validation)}`);
            }
        }
    });
}

// 演示函数
function demonstrateDecorators() {
    console.log('=== TypeScript装饰器和元数据示例 ===');
    
    // 1. 类装饰器
    console.log('\n1. 类装饰器:');
    const userComponent = new UserComponent('张三');
    (userComponent as any).render();
    console.log('用户名:', userComponent.getName());
    
    // 2. 方法装饰器
    console.log('\n2. 方法装饰器:');
    const calculator = new Calculator();
    try {
        console.log('计算结果:', calculator.add(5, 3));
        console.log('除法结果:', calculator.divide(10, 2));
        // calculator.divide(10, 0); // 这会抛出验证错误
    } catch (error) {
        console.error('错误:', error.message);
    }
    
    // 3. 属性装饰器
    console.log('\n3. 属性装饰器:');
    const user = new User();
    try {
        user.name = '李四';
        user.email = 'lisi@example.com';
        user.age = 25;
        console.log('用户创建成功:', { name: user.name, email: user.email, age: user.age });
    } catch (error) {
        console.error('属性验证错误:', error.message);
    }
    
    // 4. 参数装饰器
    console.log('\n4. 参数装饰器:');
    const service = new Service();
    service.processData({ id: 1 }, { format: 'json' }, (data: any, options: any) => {
        console.log('回调执行:', data, options);
    });
    
    // 5. 装饰器工厂
    console.log('\n5. 装饰器工厂:');
    const apiService = new ApiService();
    
    // 测试节流
    apiService.sendRequest('/api/data');
    apiService.sendRequest('/api/data'); // 被节流
    
    setTimeout(() => {
        apiService.sendRequest('/api/data'); // 1秒后可以执行
    }, 1100);
    
    // 测试防抖
    apiService.search('test1');
    apiService.search('test2');
    apiService.search('test3'); // 只有最后一个会执行
    
    // 测试缓存
    console.log(apiService.fetchData(1));
    console.log(apiService.fetchData(1)); // 缓存命中
    
    // 6. 元数据
    console.log('\n6. 元数据:');
    const userController = new UserController();
    registerRoutes(userController);
}

// 运行演示
demonstrateDecorators();
