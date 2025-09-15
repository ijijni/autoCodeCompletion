import * as vscode from 'vscode';
import * as path from 'path';
import * as fs from 'fs';

interface CodeSnippet {
    content: string;
    language: string;
    filename: string;
    completionPoints: string[];
}

export class CodeSnippetManager implements vscode.Disposable {
    private snippetsCache: Map<string, CodeSnippet[]> = new Map();
    private projectCodeCache: Map<string, CodeSnippet[]> = new Map();
    private customSnippetsCache: Map<string, CodeSnippet[]> = new Map();
    private snippetsPath: string;
    private useProjectCode: boolean = false;
    private customDirectories: string[] = [];

    constructor(private context: vscode.ExtensionContext) {
        this.snippetsPath = path.join(context.extensionPath, 'code-snippets');
        this.loadConfiguration();
        this.loadSnippets();
        this.loadCustomSnippets();
        this.detectAndLoadProjectCode();
    }

    private loadConfiguration(): void {
        const config = vscode.workspace.getConfiguration('autoCodeCompletion');
        this.customDirectories = config.get('customSnippetDirectories', []) as string[];
        console.log(`已配置 ${this.customDirectories.length} 个自定义代码片段目录:`, this.customDirectories);
    }

    public updateConfiguration(): void {
        this.loadConfiguration();
        // 重新加载自定义片段
        this.customSnippetsCache.clear();
        this.loadCustomSnippets();
    }

    private async loadSnippets(): Promise<void> {
        try {
            const languages = await this.getAvailableLanguages();
            
            for (const language of languages) {
                const languagePath = path.join(this.snippetsPath, language);
                const snippets = await this.loadLanguageSnippets(language, languagePath);
                this.snippetsCache.set(language, snippets);
                console.log(`已加载 ${language} 语言的 ${snippets.length} 个代码片段`);
            }
        } catch (error) {
            console.error('加载代码片段失败:', error);
        }
    }

    private async loadCustomSnippets(): Promise<void> {
        const config = vscode.workspace.getConfiguration('autoCodeCompletion');
        const enableCustomSnippets = config.get('enableCustomSnippets', true) as boolean;

        if (!enableCustomSnippets) {
            console.log('自定义代码片段功能已禁用');
            return;
        }

        if (this.customDirectories.length === 0) {
            console.log('未配置自定义代码片段目录');
            return;
        }

        for (const directory of this.customDirectories) {
            await this.loadCustomSnippetsFromDirectory(directory);
        }

        console.log(`自定义代码片段加载完成，共加载 ${this.getCustomSnippetStats()} 个片段`);
    }

    private async loadCustomSnippetsFromDirectory(directory: string): Promise<void> {
        try {
            const resolvedPath = this.resolveCustomDirectory(directory);

            if (!fs.existsSync(resolvedPath)) {
                console.log(`自定义代码片段目录不存在: ${resolvedPath}`);
                return;
            }

            console.log(`正在扫描自定义代码片段目录: ${resolvedPath}`);

            const stats = await fs.promises.stat(resolvedPath);
            if (!stats.isDirectory()) {
                console.log(`路径不是目录: ${resolvedPath}`);
                return;
            }

            await this.scanCustomDirectory(resolvedPath);

        } catch (error) {
            console.error(`加载自定义代码片段目录失败 ${directory}:`, error);
        }
    }

    private resolveCustomDirectory(directory: string): string {
        // 如果是绝对路径，直接使用
        if (path.isAbsolute(directory)) {
            return directory;
        }

        // 如果是相对路径，相对于工作区根目录
        const workspaceFolders = vscode.workspace.workspaceFolders;
        if (workspaceFolders && workspaceFolders.length > 0) {
            return path.resolve(workspaceFolders[0].uri.fsPath, directory);
        }

        // 如果没有工作区，相对于插件目录
        return path.resolve(this.context.extensionPath, directory);
    }

    private async scanCustomDirectory(dirPath: string, depth: number = 0): Promise<void> {
        if (depth > 3) return; // 限制扫描深度

        try {
            const items = await fs.promises.readdir(dirPath, { withFileTypes: true });

            for (const item of items) {
                const fullPath = path.join(dirPath, item.name);

                if (item.isDirectory()) {
                    // 跳过常见的非源码目录
                    if (!['node_modules', '.git', 'dist', 'build', 'target', '.vscode', '.idea'].includes(item.name)) {
                        await this.scanCustomDirectory(fullPath, depth + 1);
                    }
                } else if (item.isFile()) {
                    const language = this.detectLanguageFromFile(fullPath);
                    if (language && this.isCodeFile(item.name, language)) {
                        await this.loadCustomSnippetFile(fullPath, language);
                    }
                }
            }
        } catch (error) {
            console.error(`扫描自定义目录失败 ${dirPath}:`, error);
        }
    }

    private async loadCustomSnippetFile(filePath: string, language: string): Promise<void> {
        try {
            const config = vscode.workspace.getConfiguration('autoCodeCompletion');
            const maxFileSize = config.get('projectCodeMaxFileSize', 51200) as number;

            const stats = await fs.promises.stat(filePath);
            if (stats.size > maxFileSize) {
                console.log(`自定义代码片段文件过大，跳过: ${filePath} (${stats.size} bytes)`);
                return;
            }

            const content = await fs.promises.readFile(filePath, 'utf-8');
            const completionPoints = this.extractCompletionPoints(content);

            const snippet: CodeSnippet = {
                content,
                language,
                filename: path.basename(filePath),
                completionPoints
            };

            if (!this.customSnippetsCache.has(language)) {
                this.customSnippetsCache.set(language, []);
            }

            this.customSnippetsCache.get(language)!.push(snippet);
            console.log(`已加载自定义代码片段: ${filePath}`);

        } catch (error) {
            console.error(`加载自定义代码片段文件失败 ${filePath}:`, error);
        }
    }

    private getCustomSnippetStats(): string {
        let total = 0;
        const stats: string[] = [];

        for (const [language, snippets] of this.customSnippetsCache.entries()) {
            total += snippets.length;
            stats.push(`${language}: ${snippets.length}`);
        }

        return `${total} (${stats.join(', ')})`;
    }

    private async getAvailableLanguages(): Promise<string[]> {
        try {
            if (!fs.existsSync(this.snippetsPath)) {
                console.log('代码片段目录不存在，将使用内置片段');
                return ['javascript', 'typescript', 'python', 'java', 'csharp', 'cpp', 'go', 'rust', 'php', 'kotlin'];
            }

            const items = await fs.promises.readdir(this.snippetsPath, { withFileTypes: true });
            return items
                .filter(item => item.isDirectory())
                .map(item => item.name);
        } catch (error) {
            console.error('获取可用语言失败:', error);
            return ['javascript', 'typescript', 'python', 'java', 'csharp', 'cpp', 'go', 'rust', 'php', 'kotlin'];
        }
    }

    private async loadLanguageSnippets(language: string, languagePath: string): Promise<CodeSnippet[]> {
        const snippets: CodeSnippet[] = [];

        try {
            if (!fs.existsSync(languagePath)) {
                console.log(`语言目录不存在: ${languagePath}，使用内置片段`);
                return this.getBuiltInSnippets(language);
            }

            const files = await fs.promises.readdir(languagePath);
            const codeFiles = files.filter(file => this.isCodeFile(file, language));

            for (const file of codeFiles) {
                const filePath = path.join(languagePath, file);
                try {
                    const content = await fs.promises.readFile(filePath, 'utf-8');
                    const completionPoints = this.extractCompletionPoints(content);
                    
                    snippets.push({
                        content,
                        language,
                        filename: file,
                        completionPoints
                    });
                } catch (error) {
                    console.error(`读取代码片段文件失败 ${filePath}:`, error);
                }
            }
        } catch (error) {
            console.error(`加载 ${language} 代码片段失败:`, error);
            return this.getBuiltInSnippets(language);
        }

        return snippets.length > 0 ? snippets : this.getBuiltInSnippets(language);
    }

    private isCodeFile(filename: string, language: string): boolean {
        const extensions: { [key: string]: string[] } = {
            'javascript': ['.js', '.jsx'],
            'typescript': ['.ts', '.tsx'],
            'python': ['.py'],
            'java': ['.java'],
            'csharp': ['.cs'],
            'cpp': ['.cpp', '.cc', '.cxx', '.h', '.hpp'],
            'go': ['.go'],
            'rust': ['.rs'],
            'php': ['.php'],
            'kotlin': ['.kt', '.kts']
        };

        const validExtensions = extensions[language] || [`.${language}`];
        return validExtensions.some(ext => filename.endsWith(ext));
    }

    private extractCompletionPoints(content: string): string[] {
        const completionPoints: string[] = [];
        const lines = content.split('\n');

        for (let i = 0; i < lines.length; i++) {
            const line = lines[i];
            
            // 查找AI补全点标记
            if (line.includes('// AI补全点:') || line.includes('# AI补全点:')) {
                const point = line.split('AI补全点:')[1]?.trim();
                if (point) {
                    completionPoints.push(point);
                }
            }

            // 查找其他可能的补全触发点
            if (this.isCompletionTriggerLine(line)) {
                completionPoints.push(`第${i + 1}行: ${line.trim()}`);
            }
        }

        return completionPoints;
    }

    private isCompletionTriggerLine(line: string): boolean {
        const trimmed = line.trim();
        
        // 空行或只有注释的行
        if (trimmed === '' || trimmed.startsWith('//') || trimmed.startsWith('#')) {
            return false;
        }

        // 可能触发AI补全的模式
        const triggerPatterns = [
            /\{\s*$/,           // 以 { 结尾
            /=>\s*$/,           // 以 => 结尾
            /:\s*$/,            // 以 : 结尾
            /,\s*$/,            // 以 , 结尾
            /\(\s*$/,           // 以 ( 结尾
            /\[\s*$/,           // 以 [ 结尾
            /\.\s*$/,           // 以 . 结尾
            /return\s*$/,       // 以 return 结尾
            /if\s*\(\s*$/,      // if 语句开始
            /for\s*\(\s*$/,     // for 循环开始
            /function\s*\w*\s*\(\s*$/,  // 函数定义
            /async\s*$/,        // async 关键字
            /await\s*$/,        // await 关键字
            /try\s*\{\s*$/,     // try 块开始
            /catch\s*\(\s*$/,   // catch 块开始
        ];

        return triggerPatterns.some(pattern => pattern.test(trimmed));
    }

    public getRandomSnippet(language: string): CodeSnippet | null {
        const config = vscode.workspace.getConfiguration('autoCodeCompletion');
        const priority = config.get('customSnippetPriority', 'custom-first') as string;

        // 根据优先级策略选择代码片段
        switch (priority) {
            case 'custom-only':
                return this.getRandomCustomSnippet(language);

            case 'builtin-only':
                return this.getRandomBuiltinSnippet(language);

            case 'builtin-first':
                return this.getRandomBuiltinSnippet(language) ||
                       this.getRandomCustomSnippet(language) ||
                       this.getRandomProjectSnippet(language);

            case 'custom-first':
            default:
                return this.getRandomCustomSnippet(language) ||
                       this.getRandomProjectSnippet(language) ||
                       this.getRandomBuiltinSnippet(language);
        }
    }

    private getRandomCustomSnippet(language: string): CodeSnippet | null {
        const customSnippets = this.customSnippetsCache.get(language);
        if (customSnippets && customSnippets.length > 0) {
            const randomIndex = Math.floor(Math.random() * customSnippets.length);
            console.log(`使用自定义代码片段: ${customSnippets[randomIndex].filename}`);
            return customSnippets[randomIndex];
        }
        return null;
    }

    private getRandomProjectSnippet(language: string): CodeSnippet | null {
        if (this.useProjectCode) {
            const projectSnippets = this.projectCodeCache.get(language);
            if (projectSnippets && projectSnippets.length > 0) {
                const randomIndex = Math.floor(Math.random() * projectSnippets.length);
                console.log(`使用项目代码片段: ${projectSnippets[randomIndex].filename}`);
                return projectSnippets[randomIndex];
            }
        }
        return null;
    }

    private getRandomBuiltinSnippet(language: string): CodeSnippet | null {
        const snippets = this.snippetsCache.get(language);
        if (snippets && snippets.length > 0) {
            const randomIndex = Math.floor(Math.random() * snippets.length);
            console.log(`使用内置代码片段: ${snippets[randomIndex].filename}`);
            return snippets[randomIndex];
        }

        console.log(`没有找到 ${language} 语言的代码片段`);
        return null;
    }

    public getSnippetPortion(snippet: CodeSnippet, maxLines: number = 50): string {
        const lines = snippet.content.split('\n');
        
        // 如果代码片段较短，直接返回
        if (lines.length <= maxLines) {
            return snippet.content;
        }

        // 随机选择一个起始位置
        const maxStartLine = Math.max(0, lines.length - maxLines);
        const startLine = Math.floor(Math.random() * maxStartLine);
        const endLine = Math.min(startLine + maxLines, lines.length);

        const selectedLines = lines.slice(startLine, endLine);
        
        // 确保选中的部分包含至少一个补全点
        const hasCompletionPoint = selectedLines.some(line => 
            line.includes('// AI补全点:') || 
            line.includes('# AI补全点:') ||
            this.isCompletionTriggerLine(line)
        );

        if (!hasCompletionPoint && snippet.completionPoints.length > 0) {
            // 如果没有补全点，尝试找到包含补全点的部分
            return this.findPortionWithCompletionPoint(lines, maxLines);
        }

        return selectedLines.join('\n');
    }

    private findPortionWithCompletionPoint(lines: string[], maxLines: number): string {
        for (let i = 0; i < lines.length; i++) {
            const line = lines[i];
            if (line.includes('// AI补全点:') || line.includes('# AI补全点:')) {
                const startLine = Math.max(0, i - Math.floor(maxLines / 2));
                const endLine = Math.min(startLine + maxLines, lines.length);
                return lines.slice(startLine, endLine).join('\n');
            }
        }

        // 如果没有找到标记的补全点，返回前面的部分
        return lines.slice(0, maxLines).join('\n');
    }

    private getBuiltInSnippets(language: string): CodeSnippet[] {
        const builtInSnippets: { [key: string]: CodeSnippet[] } = {
            'javascript': [
                {
                    content: `// 异步数据处理函数
async function processUserData(users) {
    const results = [];
    
    for (const user of users) {
        try {
            const profile = await fetchUserProfile(user.id);
            const processedData = {
                id: user.id,
                name: user.name,
                // AI补全点: 添加更多用户数据处理
                
            };
            results.push(processedData);
        } catch (error) {
            console.error('处理用户数据失败:', error);
            // AI补全点: 错误处理逻辑
            
        }
    }
    
    return results;
}

// 事件处理器设置
function setupEventHandlers() {
    document.addEventListener('DOMContentLoaded', () => {
        const buttons = document.querySelectorAll('.action-btn');
        buttons.forEach(button => {
            button.addEventListener('click', (event) => {
                // AI补全点: 按钮点击处理逻辑
                
            });
        });
        
        // AI补全点: 更多事件监听器
        
    });
}`,
                    language: 'javascript',
                    filename: 'builtin-async.js',
                    completionPoints: ['添加更多用户数据处理', '错误处理逻辑', '按钮点击处理逻辑', '更多事件监听器']
                }
            ],
            'typescript': [
                {
                    content: `// TypeScript接口和类定义
interface UserData {
    id: number;
    name: string;
    email: string;
    // AI补全点: 添加更多用户属性
    
}

class UserManager {
    private users: UserData[] = [];
    
    async addUser(userData: Partial<UserData>): Promise<UserData> {
        const newUser: UserData = {
            id: this.generateId(),
            name: userData.name || '',
            email: userData.email || '',
            // AI补全点: 设置默认值
            
        };
        
        this.users.push(newUser);
        
        // AI补全点: 用户添加后的处理
        
        
        return newUser;
    }
    
    private generateId(): number {
        // AI补全点: ID生成逻辑
        
    }
}`,
                    language: 'typescript',
                    filename: 'builtin-types.ts',
                    completionPoints: ['添加更多用户属性', '设置默认值', '用户添加后的处理', 'ID生成逻辑']
                }
            ],
            'python': [
                {
                    content: `# Python数据处理类
class DataProcessor:
    def __init__(self, data_source):
        self.data_source = data_source
        self.processed_data = []
    
    async def process_data(self):
        """异步处理数据"""
        try:
            raw_data = await self.load_data()
            
            for item in raw_data:
                processed_item = {
                    'id': item.get('id'),
                    'name': item.get('name', '').strip(),
                    # AI补全点: 添加更多数据处理
                    
                }
                
                if self.validate_item(processed_item):
                    self.processed_data.append(processed_item)
                    
            # AI补全点: 处理完成后的操作
            
            
        except Exception as e:
            print(f"数据处理错误: {e}")
            # AI补全点: 异常处理逻辑
            
    
    def validate_item(self, item):
        """验证数据项"""
        if not item.get('id'):
            return False
            
        # AI补全点: 更多验证逻辑
        
        
        return True`,
                    language: 'python',
                    filename: 'builtin-processor.py',
                    completionPoints: ['添加更多数据处理', '处理完成后的操作', '异常处理逻辑', '更多验证逻辑']
                }
            ],
            'java': [
                {
                    content: `// Java Spring Boot服务类
@Service
@Transactional
public class UserService {

    @Autowired
    private UserRepository userRepository;

    public List<User> findAllUsers() {
        return userRepository.findAll();
    }

    public User createUser(CreateUserRequest request) {
        User user = new User();
        user.setName(request.getName());
        user.setEmail(request.getEmail());

        // AI补全点: 用户创建验证逻辑


        return userRepository.save(user);
    }

    public Optional<User> updateUser(Long id, UpdateUserRequest request) {
        // AI补全点: 用户更新逻辑

    }
}`,
                    language: 'java',
                    filename: 'builtin-service.java',
                    completionPoints: ['用户创建验证逻辑', '用户更新逻辑']
                }
            ],
            'csharp': [
                {
                    content: `// C# .NET Core服务类
public class UserService : IUserService
{
    private readonly ApplicationDbContext _context;
    private readonly ILogger<UserService> _logger;

    public UserService(ApplicationDbContext context, ILogger<UserService> logger)
    {
        _context = context;
        _logger = logger;
    }

    public async Task<List<User>> GetUsersAsync()
    {
        return await _context.Users
            .Where(u => u.Active)
            .ToListAsync();
    }

    public async Task<User> CreateUserAsync(CreateUserRequest request)
    {
        var user = new User
        {
            Name = request.Name,
            Email = request.Email,
            // AI补全点: 用户属性设置

        };

        _context.Users.Add(user);
        await _context.SaveChangesAsync();

        // AI补全点: 创建后处理


        return user;
    }
}`,
                    language: 'csharp',
                    filename: 'builtin-service.cs',
                    completionPoints: ['用户属性设置', '创建后处理']
                }
            ],
            'go': [
                {
                    content: `// Go Web服务器
package main

import (
    "encoding/json"
    "net/http"
    "github.com/gorilla/mux"
)

type User struct {
    ID    int    \`json:"id"\`
    Name  string \`json:"name"\`
    Email string \`json:"email"\`
}

func getUsersHandler(w http.ResponseWriter, r *http.Request) {
    users := []User{
        {ID: 1, Name: "Alice", Email: "alice@example.com"},
        {ID: 2, Name: "Bob", Email: "bob@example.com"},
    }

    w.Header().Set("Content-Type", "application/json")

    // AI补全点: 响应处理逻辑

}

func createUserHandler(w http.ResponseWriter, r *http.Request) {
    var user User
    if err := json.NewDecoder(r.Body).Decode(&user); err != nil {
        http.Error(w, err.Error(), http.StatusBadRequest)
        return
    }

    // AI补全点: 用户创建逻辑

}`,
                    language: 'go',
                    filename: 'builtin-server.go',
                    completionPoints: ['响应处理逻辑', '用户创建逻辑']
                }
            ],
            'rust': [
                {
                    content: `// Rust Web API
use actix_web::{web, App, HttpResponse, Result};
use serde::{Deserialize, Serialize};

#[derive(Serialize, Deserialize)]
struct User {
    id: u32,
    name: String,
    email: String,
}

async fn get_users() -> Result<HttpResponse> {
    let users = vec![
        User { id: 1, name: "Alice".to_string(), email: "alice@example.com".to_string() },
        User { id: 2, name: "Bob".to_string(), email: "bob@example.com".to_string() },
    ];

    // AI补全点: 用户数据处理


    Ok(HttpResponse::Ok().json(users))
}

async fn create_user(user: web::Json<User>) -> Result<HttpResponse> {
    // AI补全点: 用户创建验证


    Ok(HttpResponse::Created().json(&*user))
}`,
                    language: 'rust',
                    filename: 'builtin-api.rs',
                    completionPoints: ['用户数据处理', '用户创建验证']
                }
            ],
            'php': [
                {
                    content: `<?php
// PHP Laravel控制器
namespace App\\Http\\Controllers;

use App\\Models\\User;
use Illuminate\\Http\\Request;

class UserController extends Controller
{
    public function index()
    {
        $users = User::where('active', true)->get();

        // AI补全点: 用户数据转换


        return response()->json($users);
    }

    public function store(Request $request)
    {
        $validatedData = $request->validate([
            'name' => 'required|string|max:255',
            'email' => 'required|email|unique:users',
        ]);

        // AI补全点: 用户创建逻辑


        return response()->json($user, 201);
    }

    public function update(Request $request, User $user)
    {
        // AI补全点: 用户更新逻辑

    }
}`,
                    language: 'php',
                    filename: 'builtin-controller.php',
                    completionPoints: ['用户数据转换', '用户创建逻辑', '用户更新逻辑']
                }
            ],
            'kotlin': [
                {
                    content: `// Kotlin Android ViewModel
class UserViewModel : ViewModel() {
    private val repository = UserRepository()

    private val _users = MutableLiveData<List<User>>()
    val users: LiveData<List<User>> = _users

    private val _loading = MutableLiveData<Boolean>()
    val loading: LiveData<Boolean> = _loading

    fun loadUsers() {
        viewModelScope.launch {
            _loading.value = true

            try {
                val userList = repository.getUsers()
                _users.value = userList

                // AI补全点: 用户数据加载成功处理

            } catch (e: Exception) {
                // AI补全点: 错误处理逻辑

            } finally {
                _loading.value = false
            }
        }
    }

    fun createUser(name: String, email: String) {
        viewModelScope.launch {
            // AI补全点: 用户创建逻辑

        }
    }
}`,
                    language: 'kotlin',
                    filename: 'builtin-viewmodel.kt',
                    completionPoints: ['用户数据加载成功处理', '错误处理逻辑', '用户创建逻辑']
                }
            ]
        };

        return builtInSnippets[language] || [];
    }

    public getSupportedLanguages(): string[] {
        return Array.from(this.snippetsCache.keys());
    }

    public getSnippetStats(): { [language: string]: { builtin: number, custom: number, project: number, total: number } } {
        const stats: { [language: string]: { builtin: number, custom: number, project: number, total: number } } = {};

        // 收集所有语言
        const allLanguages = new Set([
            ...this.snippetsCache.keys(),
            ...this.customSnippetsCache.keys(),
            ...this.projectCodeCache.keys()
        ]);

        for (const language of allLanguages) {
            const builtin = this.snippetsCache.get(language)?.length || 0;
            const custom = this.customSnippetsCache.get(language)?.length || 0;
            const project = this.projectCodeCache.get(language)?.length || 0;

            stats[language] = {
                builtin,
                custom,
                project,
                total: builtin + custom + project
            };
        }

        return stats;
    }

    public getDetailedStats(): string {
        const stats = this.getSnippetStats();
        const lines: string[] = ['代码片段统计:'];

        let totalBuiltin = 0, totalCustom = 0, totalProject = 0;

        for (const [language, counts] of Object.entries(stats)) {
            if (counts.total > 0) {
                lines.push(`  ${language}: 内置${counts.builtin} + 自定义${counts.custom} + 项目${counts.project} = 总计${counts.total}`);
                totalBuiltin += counts.builtin;
                totalCustom += counts.custom;
                totalProject += counts.project;
            }
        }

        lines.push(`总计: 内置${totalBuiltin} + 自定义${totalCustom} + 项目${totalProject} = ${totalBuiltin + totalCustom + totalProject}`);

        const config = vscode.workspace.getConfiguration('autoCodeCompletion');
        const priority = config.get('customSnippetPriority', 'custom-first');
        lines.push(`当前优先级策略: ${priority}`);

        return lines.join('\n');
    }

    private async detectAndLoadProjectCode(): Promise<void> {
        try {
            const config = vscode.workspace.getConfiguration('autoCodeCompletion');
            const enableProjectCode = config.get('enableProjectCodeDetection', true) as boolean;

            if (!enableProjectCode) {
                console.log('项目代码检测已禁用');
                return;
            }

            const workspaceFolders = vscode.workspace.workspaceFolders;
            if (!workspaceFolders || workspaceFolders.length === 0) {
                console.log('没有打开的工作区，使用插件代码片段');
                return;
            }

            const workspaceRoot = workspaceFolders[0].uri.fsPath;
            const hasProjectCode = await this.scanForProjectCode(workspaceRoot);

            if (hasProjectCode) {
                console.log('检测到项目代码，优先使用项目代码片段');
                this.useProjectCode = true;
                await this.loadProjectCodeSnippets(workspaceRoot);
            } else {
                console.log('未检测到合适的项目代码，使用插件代码片段');
            }
        } catch (error) {
            console.error('项目代码检测失败:', error);
        }
    }

    private async scanForProjectCode(workspaceRoot: string): Promise<boolean> {
        try {
            const commonProjectFiles = [
                'package.json',
                'pom.xml',
                'Cargo.toml',
                'go.mod',
                'requirements.txt',
                'composer.json',
                '*.csproj',
                'build.gradle'
            ];

            const commonSourceDirs = [
                'src',
                'lib',
                'app',
                'source',
                'components',
                'modules',
                'services'
            ];

            // 检查项目配置文件
            for (const file of commonProjectFiles) {
                const filePath = path.join(workspaceRoot, file);
                if (fs.existsSync(filePath)) {
                    console.log(`发现项目配置文件: ${file}`);
                    return true;
                }
            }

            // 检查源代码目录
            for (const dir of commonSourceDirs) {
                const dirPath = path.join(workspaceRoot, dir);
                if (fs.existsSync(dirPath)) {
                    const files = await fs.promises.readdir(dirPath);
                    const codeFiles = files.filter(file => this.isProjectCodeFile(file));
                    if (codeFiles.length > 0) {
                        console.log(`发现源代码目录: ${dir} (${codeFiles.length} 个代码文件)`);
                        return true;
                    }
                }
            }

            // 检查根目录的代码文件
            const rootFiles = await fs.promises.readdir(workspaceRoot);
            const rootCodeFiles = rootFiles.filter(file => this.isProjectCodeFile(file));
            if (rootCodeFiles.length >= 3) { // 至少3个代码文件才认为是项目
                console.log(`根目录发现 ${rootCodeFiles.length} 个代码文件`);
                return true;
            }

            return false;
        } catch (error) {
            console.error('扫描项目代码时出错:', error);
            return false;
        }
    }

    private isProjectCodeFile(filename: string): boolean {
        const codeExtensions = [
            '.js', '.jsx', '.ts', '.tsx',
            '.py', '.java', '.cs', '.cpp', '.cc', '.cxx', '.h', '.hpp',
            '.go', '.rs', '.php', '.rb', '.kt', '.kts',
            '.vue', '.svelte', '.dart', '.swift', '.m', '.mm'
        ];

        return codeExtensions.some(ext => filename.endsWith(ext));
    }

    private async loadProjectCodeSnippets(workspaceRoot: string): Promise<void> {
        try {
            const config = vscode.workspace.getConfiguration('autoCodeCompletion');
            const maxFilesToScan = config.get('projectCodeMaxFiles', 50) as number;
            const maxFileSize = config.get('projectCodeMaxFileSize', 51200) as number;
            let scannedFiles = 0;

            const scanDirectory = async (dirPath: string, depth: number = 0): Promise<void> => {
                if (depth > 3 || scannedFiles >= maxFilesToScan) return; // 限制扫描深度和数量

                try {
                    const items = await fs.promises.readdir(dirPath, { withFileTypes: true });

                    for (const item of items) {
                        if (scannedFiles >= maxFilesToScan) break;

                        const fullPath = path.join(dirPath, item.name);

                        if (item.isDirectory()) {
                            // 跳过常见的非源码目录
                            if (!['node_modules', '.git', 'dist', 'build', 'target', '.vscode'].includes(item.name)) {
                                await scanDirectory(fullPath, depth + 1);
                            }
                        } else if (item.isFile() && this.isProjectCodeFile(item.name)) {
                            try {
                                const stats = await fs.promises.stat(fullPath);
                                if (stats.size <= maxFileSize) {
                                    await this.loadProjectCodeFile(fullPath);
                                    scannedFiles++;
                                }
                            } catch (error) {
                                console.error(`读取文件统计信息失败 ${fullPath}:`, error);
                            }
                        }
                    }
                } catch (error) {
                    console.error(`扫描目录失败 ${dirPath}:`, error);
                }
            };

            await scanDirectory(workspaceRoot);
            console.log(`成功加载 ${scannedFiles} 个项目代码文件`);

        } catch (error) {
            console.error('加载项目代码片段失败:', error);
        }
    }

    private async loadProjectCodeFile(filePath: string): Promise<void> {
        try {
            const content = await fs.promises.readFile(filePath, 'utf-8');
            const language = this.detectLanguageFromFile(filePath);

            if (!language) return;

            // 提取有意义的代码片段
            const snippets = this.extractCodeSnippetsFromContent(content, filePath, language);

            if (snippets.length > 0) {
                if (!this.projectCodeCache.has(language)) {
                    this.projectCodeCache.set(language, []);
                }
                this.projectCodeCache.get(language)!.push(...snippets);
            }

        } catch (error) {
            console.error(`加载项目代码文件失败 ${filePath}:`, error);
        }
    }

    private detectLanguageFromFile(filePath: string): string | null {
        const ext = path.extname(filePath).toLowerCase();
        const languageMap: { [key: string]: string } = {
            '.js': 'javascript',
            '.jsx': 'javascript',
            '.ts': 'typescript',
            '.tsx': 'typescript',
            '.py': 'python',
            '.java': 'java',
            '.cs': 'csharp',
            '.cpp': 'cpp',
            '.cc': 'cpp',
            '.cxx': 'cpp',
            '.h': 'cpp',
            '.hpp': 'cpp',
            '.go': 'go',
            '.rs': 'rust',
            '.php': 'php',
            '.rb': 'ruby',
            '.kt': 'kotlin',
            '.kts': 'kotlin'
        };

        return languageMap[ext] || null;
    }

    private extractCodeSnippetsFromContent(content: string, filePath: string, language: string): CodeSnippet[] {
        const snippets: CodeSnippet[] = [];
        const lines = content.split('\n');
        const minSnippetLines = 10;
        const maxSnippetLines = 50;

        // 寻找函数、类、方法等代码块
        const codeBlockPatterns = {
            javascript: [
                /^(export\s+)?(async\s+)?function\s+\w+/,
                /^(export\s+)?class\s+\w+/,
                /^\s*\w+\s*:\s*(async\s+)?function/,
                /^const\s+\w+\s*=\s*(async\s+)?\(/
            ],
            typescript: [
                /^(export\s+)?(async\s+)?function\s+\w+/,
                /^(export\s+)?class\s+\w+/,
                /^(export\s+)?interface\s+\w+/,
                /^\s*\w+\s*:\s*(async\s+)?function/
            ],
            python: [
                /^(async\s+)?def\s+\w+/,
                /^class\s+\w+/,
                /^@\w+/
            ],
            java: [
                /^\s*(public|private|protected)?\s*(static\s+)?(class|interface)\s+\w+/,
                /^\s*(public|private|protected)?\s*(static\s+)?\w+.*\s+\w+\s*\(/
            ],
            csharp: [
                /^\s*(public|private|protected)?\s*(static\s+)?(class|interface)\s+\w+/,
                /^\s*(public|private|protected)?\s*(static\s+)?\w+.*\s+\w+\s*\(/
            ]
        };

        const patterns = codeBlockPatterns[language as keyof typeof codeBlockPatterns] || [];

        for (let i = 0; i < lines.length; i++) {
            const line = lines[i];

            // 检查是否匹配代码块模式
            if (patterns.some(pattern => pattern.test(line.trim()))) {
                const startLine = i;
                let endLine = i;
                let braceCount = 0;
                let inCodeBlock = false;

                // 寻找代码块结束
                for (let j = i; j < lines.length && j < i + maxSnippetLines; j++) {
                    const currentLine = lines[j];

                    // 简单的大括号匹配
                    for (const char of currentLine) {
                        if (char === '{') {
                            braceCount++;
                            inCodeBlock = true;
                        } else if (char === '}') {
                            braceCount--;
                        }
                    }

                    endLine = j;

                    // 如果大括号匹配完成且有足够的行数
                    if (inCodeBlock && braceCount === 0 && (endLine - startLine + 1) >= minSnippetLines) {
                        break;
                    }
                }

                // 提取代码片段
                if ((endLine - startLine + 1) >= minSnippetLines) {
                    const snippetLines = lines.slice(startLine, endLine + 1);
                    const snippetContent = snippetLines.join('\n');

                    // 添加AI补全点
                    const enhancedContent = this.addAICompletionPoints(snippetContent, language);
                    const completionPoints = this.extractCompletionPoints(enhancedContent);

                    snippets.push({
                        content: enhancedContent,
                        language,
                        filename: `${path.basename(filePath)}_${startLine}-${endLine}`,
                        completionPoints
                    });

                    i = endLine; // 跳过已处理的行
                }
            }
        }

        return snippets;
    }

    private addAICompletionPoints(content: string, language: string): string {
        const lines = content.split('\n');
        const result: string[] = [];

        for (let i = 0; i < lines.length; i++) {
            const line = lines[i];
            result.push(line);

            // 在特定位置添加AI补全点
            if (this.shouldAddCompletionPoint(line, language)) {
                const indent = line.match(/^\s*/)?.[0] || '';
                const comment = language === 'python' ? '# AI补全点: ' : '// AI补全点: ';
                result.push(indent + comment + this.generateCompletionHint(line, language));
                result.push(indent);
            }
        }

        return result.join('\n');
    }

    private shouldAddCompletionPoint(line: string, language: string): boolean {
        const triggers = {
            javascript: [
                /\{\s*$/,  // 函数或对象开始
                /=>\s*\{\s*$/,  // 箭头函数
                /if\s*\([^)]*\)\s*\{\s*$/,  // if语句
                /catch\s*\([^)]*\)\s*\{\s*$/,  // catch块
                /\.then\s*\(\s*$/,  // Promise then
                /\.map\s*\(\s*$/,  // 数组map
                /\.filter\s*\(\s*$/  // 数组filter
            ],
            python: [
                /:\s*$/,  // 函数、类、if等语句结束
                /def\s+\w+.*:\s*$/,  // 函数定义
                /class\s+\w+.*:\s*$/,  // 类定义
                /if\s+.*:\s*$/,  // if语句
                /except.*:\s*$/,  // except块
                /for\s+.*:\s*$/,  // for循环
                /with\s+.*:\s*$/  // with语句
            ]
        };

        const patterns = triggers[language as keyof typeof triggers] || [];
        return patterns.some(pattern => pattern.test(line.trim()));
    }

    private generateCompletionHint(line: string, language: string): string {
        const hints = [
            '实现业务逻辑',
            '添加错误处理',
            '数据验证',
            '返回结果',
            '调用API',
            '处理数据',
            '更新状态',
            '记录日志'
        ];

        return hints[Math.floor(Math.random() * hints.length)];
    }

    public dispose(): void {
        this.snippetsCache.clear();
        this.projectCodeCache.clear();
        this.customSnippetsCache.clear();
    }
}
