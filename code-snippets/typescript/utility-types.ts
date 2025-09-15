/**
 * TypeScript实用类型示例
 */

// 基础接口定义
interface User {
    id: number;
    name: string;
    email: string;
    age: number;
    isActive: boolean;
    roles: string[];
    profile?: {
        avatar: string;
        bio: string;
        website?: string;
    };
}

interface Product {
    id: number;
    name: string;
    price: number;
    category: string;
    description: string;
    inStock: boolean;
    tags: string[];
}

// 1. Partial<T> - 使所有属性可选
type PartialUser = Partial<User>;

function updateUser(id: number, updates: PartialUser): User {
    // 模拟从数据库获取用户
    const existingUser: User = {
        id,
        name: '张三',
        email: 'zhangsan@example.com',
        age: 25,
        isActive: true,
        roles: ['user']
    };
    
    return { ...existingUser, ...updates };
}

// 2. Required<T> - 使所有属性必需
type RequiredUser = Required<User>;

function createUserProfile(user: RequiredUser): string {
    return `用户: ${user.name}, 头像: ${user.profile.avatar}`;
}

// 3. Readonly<T> - 使所有属性只读
type ReadonlyUser = Readonly<User>;

function displayUser(user: ReadonlyUser): void {
    console.log(`用户信息: ${user.name} (${user.email})`);
    // user.name = '李四'; // 错误：无法分配到只读属性
}

// 4. Pick<T, K> - 选择特定属性
type UserSummary = Pick<User, 'id' | 'name' | 'email'>;

function getUserSummary(user: User): UserSummary {
    return {
        id: user.id,
        name: user.name,
        email: user.email
    };
}

// 5. Omit<T, K> - 排除特定属性
type UserWithoutSensitiveInfo = Omit<User, 'email' | 'age'>;

function getPublicUserInfo(user: User): UserWithoutSensitiveInfo {
    const { email, age, ...publicInfo } = user;
    return publicInfo;
}

// 6. Record<K, T> - 创建键值对类型
type UserRoles = Record<string, string[]>;

const rolePermissions: UserRoles = {
    admin: ['read', 'write', 'delete'],
    user: ['read'],
    moderator: ['read', 'write']
};

type StatusMessages = Record<'loading' | 'success' | 'error', string>;

const messages: StatusMessages = {
    loading: '加载中...',
    success: '操作成功',
    error: '操作失败'
};

// 7. Exclude<T, U> - 从联合类型中排除
type AllColors = 'red' | 'green' | 'blue' | 'yellow' | 'purple';
type PrimaryColors = Exclude<AllColors, 'yellow' | 'purple'>;

function isPrimaryColor(color: AllColors): color is PrimaryColors {
    return color === 'red' || color === 'green' || color === 'blue';
}

// 8. Extract<T, U> - 从联合类型中提取
type StringOrNumber = string | number | boolean;
type OnlyStringOrNumber = Extract<StringOrNumber, string | number>;

function processValue(value: OnlyStringOrNumber): string {
    return String(value);
}

// 9. NonNullable<T> - 排除null和undefined
type MaybeString = string | null | undefined;
type DefinitelyString = NonNullable<MaybeString>;

function processString(str: MaybeString): DefinitelyString | null {
    if (str === null || str === undefined) {
        return null;
    }
    return str;
}

// 10. ReturnType<T> - 获取函数返回类型
function getUser(): User {
    return {
        id: 1,
        name: '张三',
        email: 'zhangsan@example.com',
        age: 25,
        isActive: true,
        roles: ['user']
    };
}

type GetUserReturnType = ReturnType<typeof getUser>;

// 11. Parameters<T> - 获取函数参数类型
function createProduct(name: string, price: number, category: string): Product {
    return {
        id: Math.random(),
        name,
        price,
        category,
        description: '',
        inStock: true,
        tags: []
    };
}

type CreateProductParams = Parameters<typeof createProduct>;

function callCreateProduct(params: CreateProductParams): Product {
    return createProduct(...params);
}

// 12. ConstructorParameters<T> - 获取构造函数参数类型
class ApiClient {
    constructor(
        private baseUrl: string,
        private apiKey: string,
        private timeout: number = 5000
    ) {}
    
    async get(endpoint: string): Promise<any> {
        return `GET ${this.baseUrl}${endpoint}`;
    }
}

type ApiClientParams = ConstructorParameters<typeof ApiClient>;

function createApiClient(params: ApiClientParams): ApiClient {
    return new ApiClient(...params);
}

// 13. InstanceType<T> - 获取构造函数实例类型
type ApiClientInstance = InstanceType<typeof ApiClient>;

function configureClient(client: ApiClientInstance): void {
    console.log('配置API客户端');
}

// 14. ThisParameterType<T> 和 OmitThisParameter<T>
interface DatabaseConnection {
    query(sql: string): Promise<any[]>;
}

function executeQuery(this: DatabaseConnection, sql: string): Promise<any[]> {
    return this.query(sql);
}

type QueryFunction = typeof executeQuery;
type QueryThisType = ThisParameterType<QueryFunction>;
type QueryWithoutThis = OmitThisParameter<QueryFunction>;

// 15. 自定义实用类型
type DeepPartial<T> = {
    [P in keyof T]?: T[P] extends object ? DeepPartial<T[P]> : T[P];
};

type DeepPartialUser = DeepPartial<User>;

function updateUserDeep(id: number, updates: DeepPartialUser): User {
    const existingUser: User = {
        id,
        name: '张三',
        email: 'zhangsan@example.com',
        age: 25,
        isActive: true,
        roles: ['user'],
        profile: {
            avatar: 'default.jpg',
            bio: '这是一个用户'
        }
    };
    
    // 深度合并逻辑（简化版）
    return { ...existingUser, ...updates };
}

// 16. 键值映射类型
type Getters<T> = {
    [K in keyof T as `get${Capitalize<string & K>}`]: () => T[K];
};

type UserGetters = Getters<Pick<User, 'name' | 'email' | 'age'>>;

class UserService implements UserGetters {
    constructor(private user: User) {}
    
    getName(): string {
        return this.user.name;
    }
    
    getEmail(): string {
        return this.user.email;
    }
    
    getAge(): number {
        return this.user.age;
    }
}

// 17. 条件类型
type IsArray<T> = T extends any[] ? true : false;

type StringIsArray = IsArray<string>; // false
type NumberArrayIsArray = IsArray<number[]>; // true

type ArrayElementType<T> = T extends (infer U)[] ? U : never;

type StringArrayElement = ArrayElementType<string[]>; // string
type NumberArrayElement = ArrayElementType<number[]>; // number

// 18. 模板字面量类型
type EventName<T extends string> = `on${Capitalize<T>}`;
type ClickEvent = EventName<'click'>; // 'onClick'
type HoverEvent = EventName<'hover'>; // 'onHover'

type HttpMethod = 'GET' | 'POST' | 'PUT' | 'DELETE';
type ApiEndpoint<T extends string> = `/api/${T}`;
type UserEndpoint = ApiEndpoint<'users'>; // '/api/users'

// 19. 递归类型
type JSONValue = 
    | string
    | number
    | boolean
    | null
    | JSONValue[]
    | { [key: string]: JSONValue };

interface TreeNode<T> {
    value: T;
    children?: TreeNode<T>[];
}

type FlattenTree<T> = T extends TreeNode<infer U> 
    ? U | (T['children'] extends TreeNode<U>[] ? FlattenTree<T['children'][number]> : never)
    : never;

// 20. 品牌类型
type Brand<T, B> = T & { __brand: B };

type UserId = Brand<number, 'UserId'>;
type ProductId = Brand<number, 'ProductId'>;

function getUserById(id: UserId): User | null {
    // 实现获取用户逻辑
    return null;
}

function createUserId(id: number): UserId {
    return id as UserId;
}

// 演示函数
function demonstrateUtilityTypes(): void {
    console.log('=== TypeScript实用类型示例 ===');
    
    // 1. Partial 示例
    console.log('\n1. Partial<T>:');
    const updatedUser = updateUser(1, { name: '李四', age: 30 });
    console.log('更新后的用户:', updatedUser);
    
    // 2. Pick 示例
    console.log('\n2. Pick<T, K>:');
    const userSummary = getUserSummary(updatedUser);
    console.log('用户摘要:', userSummary);
    
    // 3. Omit 示例
    console.log('\n3. Omit<T, K>:');
    const publicInfo = getPublicUserInfo(updatedUser);
    console.log('公开信息:', publicInfo);
    
    // 4. Record 示例
    console.log('\n4. Record<K, T>:');
    console.log('角色权限:', rolePermissions);
    console.log('状态消息:', messages);
    
    // 5. 联合类型操作
    console.log('\n5. 联合类型操作:');
    const color: AllColors = 'red';
    console.log(`${color} 是主要颜色:`, isPrimaryColor(color));
    
    // 6. 函数类型提取
    console.log('\n6. 函数类型提取:');
    const params: CreateProductParams = ['笔记本电脑', 5999, '电子产品'];
    const product = callCreateProduct(params);
    console.log('创建的产品:', product);
    
    // 7. 构造函数类型
    console.log('\n7. 构造函数类型:');
    const clientParams: ApiClientParams = ['https://api.example.com', 'secret-key'];
    const client = createApiClient(clientParams);
    configureClient(client);
    
    // 8. 深度部分类型
    console.log('\n8. 深度部分类型:');
    const deepUpdate: DeepPartialUser = {
        profile: {
            bio: '更新的个人简介'
        }
    };
    const deepUpdatedUser = updateUserDeep(1, deepUpdate);
    console.log('深度更新后的用户:', deepUpdatedUser);
    
    // 9. Getter 类型
    console.log('\n9. Getter 类型:');
    const userService = new UserService(updatedUser);
    console.log('用户名:', userService.getName());
    console.log('邮箱:', userService.getEmail());
    
    // 10. 品牌类型
    console.log('\n10. 品牌类型:');
    const userId = createUserId(123);
    const user = getUserById(userId);
    console.log('通过ID获取用户:', user);
    
    // 类型检查示例
    console.log('\n类型检查示例:');
    
    // 条件类型
    const isStringArray: StringIsArray = false;
    const isNumberArrayArray: NumberArrayIsArray = true;
    console.log('string是数组:', isStringArray);
    console.log('number[]是数组:', isNumberArrayArray);
    
    // 模板字面量类型
    const clickEventName: ClickEvent = 'onClick';
    const userApiEndpoint: UserEndpoint = '/api/users';
    console.log('点击事件名:', clickEventName);
    console.log('用户API端点:', userApiEndpoint);
}

// 运行演示
demonstrateUtilityTypes();
