import * as vscode from 'vscode';
import { StatsManager } from './statsManager';
import { FileManager } from './fileManager';
import { CodeSnippetManager } from './codeSnippetManager';
import { SuggestionManager } from './suggestionManager';
import { StateManager } from './stateManager';
import { CompletionStrategyManager } from './CompletionStrategyManager';

export class AutoCompletionManager implements vscode.Disposable {
    private timer: NodeJS.Timeout | undefined;
    private nextTriggerTimeout: NodeJS.Timeout | undefined;
    private _isRunning = false;
    private config!: vscode.WorkspaceConfiguration;
    private lastSuggestionContent: string = '';
    private suggestionRetryCount: number = 0;
    private maxRetryAttempts: number = 3;
    private lastTriggerPosition: vscode.Position | null = null;
    private autoFocusOnCompletion: boolean = false;
    private stateManager: StateManager;
    private strategyManager: CompletionStrategyManager;

    public async updateConfiguration() {
        this.config = vscode.workspace.getConfiguration('autoCodeCompletion');
        this.maxRetryAttempts = this.config.get('maxRetryAttempts', 3) as number;
        this.autoFocusOnCompletion = this.config.get('autoFocusOnCompletion', false) as boolean;

        // 更新策略管理器配置
        await this.strategyManager.updateConfiguration();

        // 如果正在运行，重新安排触发
        if (this._isRunning) {
            this.rescheduleNextTrigger();
        }
    }

    constructor(
        private statsManager: StatsManager,
        private fileManager: FileManager,
        private codeSnippetManager: CodeSnippetManager,
        private suggestionManager?: SuggestionManager,
        stateManager?: StateManager
    ) {
        this.stateManager = stateManager || StateManager.getInstance();
        this.strategyManager = new CompletionStrategyManager();
        this.updateConfiguration();

        // 设置策略状态更新回调
        this.strategyManager.setStatusUpdateCallback((status) => {
            this.stateManager.updateStrategyStatus(status);
        });
    }



    public isRunning(): boolean {
        return this._isRunning;
    }

    public start() {
        if (this._isRunning) {
            return;
        }

        this._isRunning = true;
        this.stateManager.updateRunningState(true);

        // 使用策略管理器安排下次触发
        this.scheduleNextTrigger();

        const strategySummary = this.strategyManager.getStrategySummary();
        console.log(`Auto completion started with strategy: ${strategySummary.current}`);
        console.log(`Initial interval: ${strategySummary.interval}ms`);
    }

    public stop() {
        if (this.timer) {
            clearInterval(this.timer);
            this.timer = undefined;
        }
        if (this.nextTriggerTimeout) {
            clearTimeout(this.nextTriggerTimeout);
            this.nextTriggerTimeout = undefined;
        }
        this._isRunning = false;
        this.stateManager.updateRunningState(false);
        console.log('Auto completion stopped');
    }

    private scheduleNextTrigger(): void {
        if (!this._isRunning) {
            return;
        }

        const interval = this.strategyManager.getNextInterval();

        this.nextTriggerTimeout = setTimeout(async () => {
            await this.triggerCompletionOnce();
            this.strategyManager.onCompletionTriggered();

            // 递归安排下次触发
            this.scheduleNextTrigger();
        }, interval);

        // 更新UI显示下次触发时间
        const nextTriggerTime = new Date(Date.now() + interval);
        this.stateManager.updateNextTriggerTime(nextTriggerTime);

        console.log(`Next trigger scheduled in ${interval}ms (${new Date(nextTriggerTime).toLocaleTimeString()})`);
    }

    private rescheduleNextTrigger(): void {
        if (this.nextTriggerTimeout) {
            clearTimeout(this.nextTriggerTimeout);
            this.nextTriggerTimeout = undefined;
        }

        if (this._isRunning) {
            this.scheduleNextTrigger();
        }
    }

    public getStrategyManager(): CompletionStrategyManager {
        return this.strategyManager;
    }

    public async triggerCompletionOnce(): Promise<void> {
        try {
            // Check daily limit
            const maxPerDay = this.config.get('maxCompletionsPerDay', 100);
            const todayCount = this.statsManager.getTodayCount();

            if (todayCount >= maxPerDay) {
                console.log('Daily completion limit reached');
                return;
            }

            // Store current active editor
            const originalEditor = vscode.window.activeTextEditor;

            // Get or create a suitable file
            const editor = await this.getOrCreateEditor();
            if (!editor) {
                console.log('No suitable editor found');
                return;
            }

            // Position cursor at a good location
            await this.positionCursorForCompletion(editor);

            // Trigger completion cycle (Tab -> wait -> newline -> Tab)
            await this.triggerCompletionCycle(editor);

            // Update stats
            this.statsManager.incrementCount();

            // Restore focus to original editor if not autoFocusOnCompletion
            if (!this.autoFocusOnCompletion && originalEditor && originalEditor !== editor) {
                await vscode.window.showTextDocument(originalEditor.document, {
                    preserveFocus: false,
                    viewColumn: originalEditor.viewColumn
                });
            }

        } catch (error) {
            console.error('Error triggering completion:', error);
        }
    }

    private async triggerCompletionCycle(editor: vscode.TextEditor): Promise<void> {
        try {
            console.log('开始AI代码补全周期...');

            // 第一轮：触发AI代码补全
            await this.performAICompletion(editor, '第一轮');

            // 短暂等待后进行第二轮
            await new Promise(resolve => setTimeout(resolve, 3000));

            // 第二轮：在新位置触发AI代码补全
            await this.performAICompletion(editor, '第二轮');

            console.log('AI代码补全周期完成');

        } catch (error) {
            console.error('AI代码补全周期执行失败:', error);
        }
    }

    private async performAICompletion(editor: vscode.TextEditor, round: string): Promise<void> {
        try {
            console.log(`${round}AI代码补全开始...`);

            // 1. 写入代码片段
            await this.writeCodeSnippet(editor);

            // 2. 定位到补全触发点
            await this.positionCursorForAI(editor);

            // 3. 添加触发代码
            await this.addTriggerCode(editor);

            // 4. 关键：等待AI助手显示内联建议（不触发下拉菜单）
            const aiWaitTime = this.config.get('aiWaitTime', 5000) as number;
            console.log(`等待AI助手显示内联建议... (${aiWaitTime}ms)`);
            await new Promise(resolve => setTimeout(resolve, aiWaitTime));

            // 5. 检查是否有内联建议并接受
            const hasInlineSuggestion = await this.checkAndAcceptInlineSuggestion(editor);

            if (!hasInlineSuggestion) {
                console.log('未检测到AI内联建议，尝试不同的触发策略...');

                // 尝试移动光标到不同位置再触发
                await this.tryDifferentTriggerPosition(editor);

                // 手动触发AI
                await this.manuallyTriggerAI(editor);

                // 再次等待并检查
                await new Promise(resolve => setTimeout(resolve, 3000));
                const secondAttempt = await this.checkAndAcceptInlineSuggestion(editor);

                if (!secondAttempt) {
                    console.log('第二次尝试也未成功，可能需要更换触发代码');
                    await this.tryAlternativeTriggerCode(editor);
                }
            }

            // 6. 换行准备下一轮
            await this.insertNewLine(editor);

            console.log(`${round}AI代码补全完成`);

        } catch (error) {
            console.error(`${round}AI代码补全失败:`, error);
        }
    }

    private async getOrCreateEditor(): Promise<vscode.TextEditor | undefined> {
        // First try to use active editor
        let editor = vscode.window.activeTextEditor;
        
        if (editor && this.isSupportedLanguage(editor.document.languageId)) {
            return editor;
        }

        // Try to find an open editor with supported language
        for (const tabGroup of vscode.window.tabGroups.all) {
            for (const tab of tabGroup.tabs) {
                if (tab.input instanceof vscode.TabInputText) {
                    try {
                        // 过滤非文本文件
                        const uri = tab.input.uri;
                        const ext = uri.path.split('.').pop()?.toLowerCase();
                        // 跳过非文本文件
                        if (ext && ['rar', 'zip', '7z', 'tar', 'gz', 'exe', 'dll', 'so', 'dylib', 'pdf', 'jpg', 'jpeg', 'png', 'gif', 'bmp', 'ico', 'svg', 'mp3', 'mp4', 'avi', 'mov', 'wmv', 'flv', 'mkv'].includes(ext)) {
                            continue;
                        }
                        
                        const doc = await vscode.workspace.openTextDocument(uri);
                        if (this.isSupportedLanguage(doc.languageId)) {
                        // Only show document if autoFocusOnCompletion is true
                        if (this.autoFocusOnCompletion) {
                            editor = await vscode.window.showTextDocument(doc);
                        } else {
                            // Open document in background without focusing
                            editor = await vscode.window.showTextDocument(doc, {
                                preview: false,
                                preserveFocus: true,
                                viewColumn: vscode.ViewColumn.Beside
                            });
                        }
                        return editor;
                        }
                    } catch (error) {
                        // 忽略无法打开的文件
                        console.log(`Skipping file that cannot be opened: ${tab.input.uri.toString()}`);
                        continue;
                    }
                }
            }
        }

        // Create a new file if auto-create is enabled
        if (this.config.get('autoCreateFiles', true)) {
            return await this.fileManager.createTestFile();
        }

        return undefined;
    }

    private isSupportedLanguage(languageId: string): boolean {
        const supportedLanguages = this.config.get('supportedLanguages', []) as string[];
        return supportedLanguages.includes(languageId);
    }

    private async positionCursorForCompletion(editor: vscode.TextEditor): Promise<void> {
        const document = editor.document;
        const lineCount = document.lineCount;

        if (lineCount === 0) {
            // 空文件，添加一些示例代码
            await this.addSampleCode(editor);
            return;
        }

        // 寻找最后一行有代码的位置
        let targetLine = lineCount - 1;
        let foundCodeLine = false;

        // 从最后一行开始向上查找有代码的行
        for (let i = lineCount - 1; i >= 0; i--) {
            const lineText = document.lineAt(i).text.trim();
            if (lineText !== '' && !lineText.startsWith('//') && !lineText.startsWith('/*')) {
                targetLine = i;
                foundCodeLine = true;
                break;
            }
        }

        if (!foundCodeLine) {
            // 没有找到代码行，添加示例代码
            await this.addSampleCode(editor);
            return;
        }

        // 将光标定位到代码行的末尾
        const lineText = document.lineAt(targetLine).text;
        const targetPosition = new vscode.Position(targetLine, lineText.length);

        editor.selection = new vscode.Selection(targetPosition, targetPosition);
        editor.revealRange(new vscode.Range(targetPosition, targetPosition));
    }

    private async addSampleCode(editor: vscode.TextEditor): Promise<void> {
        const languageId = editor.document.languageId;
        let sampleCode = '';

        // 生成更容易触发AI建议的代码模板
        switch (languageId) {
            case 'javascript':
            case 'typescript':
                sampleCode = `// AI代码补全测试文件
// 以下代码片段设计用于触发AI代码助手

// 常见的异步函数模式
async function fetchUserData(userId) {
    try {
        const response = await fetch(\`/api/users/\${userId}\`);
        const userData = await response.json();

        // AI应该在这里建议数据处理逻辑
        return userData
    } catch (error) {
        console.error('Error fetching user data:', error);
        throw error;
    }
}

// 数组处理函数
function processUserList(users) {
    return users
        .filter(user => user.active)
        .map(user => ({
            id: user.id,
            name: user.name,
            // AI应该建议更多属性

        }))
        .sort((a, b) => a.name.localeCompare(b.name));
}

// React组件模式（如果是TypeScript）
${languageId === 'typescript' ? `
interface User {
    id: number;
    name: string;
    email: string;
    active: boolean;
}

const UserComponent: React.FC<{ user: User }> = ({ user }) => {
    const [isLoading, setIsLoading] = useState(false);

    const handleUserUpdate = async () => {
        setIsLoading(true);
        try {
            // AI应该建议API调用

        } catch (error) {
            console.error(error);
        } finally {
            setIsLoading(false);
        }
    };

    return (
        <div className="user-card">
            <h3>{user.name}</h3>
            <p>{user.email}</p>
            {/* AI应该建议更多JSX */}

        </div>
    );
};` : ''}

// 工具函数
function debounce(func, wait) {
    let timeout;
    return function executedFunction(...args) {
        const later = () => {
            clearTimeout(timeout);
            func
        };
        clearTimeout(timeout);
        timeout = setTimeout(later, wait);
    };
}

// 类定义
class DataManager {
    constructor() {
        this.data = [];
        this.listeners = [];
    }

    addData(item) {
        this.data.push(item);
        this.notifyListeners();
        // AI应该建议返回值或其他逻辑

    }

    getData() {
        return this.data
    }

    notifyListeners() {
        this.listeners.forEach(listener => {
            // AI应该建议回调逻辑

        });
    }
}

// 现代JavaScript特性
const apiClient = {
    baseURL: 'https://api.example.com',

    async get(endpoint) {
        const url = \`\${this.baseURL}\${endpoint}\`;
        const response = await fetch(url, {
            method: 'GET',
            headers: {
                'Content-Type': 'application/json',
                // AI应该建议更多headers

            }
        });

        if (!response.ok) {
            throw new Error(\`HTTP error! status: \${response.status}\`);
        }

        return response
    },

    async post(endpoint, data) {
        // AI应该建议完整的POST实现

    }
};

// 触发点：在这里AI应该建议新的函数或代码
`;
                break;

            case 'python':
                sampleCode = `# AI代码补全测试文件
# 以下代码片段设计用于触发AI代码助手

import asyncio
import json
from typing import List, Dict, Optional
from dataclasses import dataclass

@dataclass
class User:
    id: int
    name: str
    email: str
    active: bool = True

class UserManager:
    def __init__(self):
        self.users: List[User] = []

    def add_user(self, user: User) -> None:
        self.users.append(user)
        # AI应该建议日志记录或验证逻辑

    def get_active_users(self) -> List[User]:
        return [user for user in self.users if user

    def find_user_by_email(self, email: str) -> Optional[User]:
        for user in self.users:
            if user.email == email:
                return user
        # AI应该建议返回None或抛出异常

async def fetch_user_data(user_id: int) -> Dict:
    # 模拟异步API调用
    await asyncio.sleep(0.1)

    # AI应该建议API调用逻辑
    return {
        'id': user_id,
        'name': f'User {user_id}',
        # AI应该建议更多字段

    }

def process_data(data: List[Dict]) -> List[Dict]:
    processed = []
    for item in data:
        if item.get('active', True):
            processed_item = {
                'id': item['id'],
                'name': item['name'].title(),
                # AI应该建议更多处理逻辑

            }
            processed.append(processed_item)

    return processed

# 装饰器示例
def retry(max_attempts: int = 3):
    def decorator(func):
        def wrapper(*args, **kwargs):
            for attempt in range(max_attempts):
                try:
                    return func(*args, **kwargs)
                except Exception as e:
                    if attempt == max_attempts - 1:
                        raise e
                    # AI应该建议重试逻辑

        return wrapper
    return decorator

@retry(max_attempts=3)
def unreliable_function():
    # AI应该建议函数实现

# 上下文管理器
class DatabaseConnection:
    def __init__(self, connection_string: str):
        self.connection_string = connection_string
        self.connection = None

    def __enter__(self):
        # AI应该建议连接逻辑

    def __exit__(self, exc_type, exc_val, exc_tb):
        if self.connection:
            # AI应该建议清理逻辑


# 主函数
async def main():
    user_manager = UserManager()

    # 添加一些测试用户
    users = [
        User(1, "Alice", "alice@example.com"),
        User(2, "Bob", "bob@example.com", False),
        # AI应该建议更多用户

    ]

    for user in users:
        user_manager.add_user(user)

    # 获取活跃用户
    active_users = user_manager.get_active_users()
    print(f"Active users: {len(active_users)}")

    # AI应该建议更多处理逻辑


if __name__ == "__main__":
    # AI应该建议运行逻辑

`;
                break;

            default:
                sampleCode = `// AI代码补全测试文件
// 这个文件包含常见的编程模式，用于触发AI代码助手

function calculateSum(a, b) {
    return a + b;
}

function processArray(arr) {
    return arr.map(item => {
        // AI应该在这里建议处理逻辑
        return item
    }).filter(item => {
        // AI应该建议过滤条件

    });
}

// 触发点：AI应该建议新的函数
`;
        }

        const edit = new vscode.WorkspaceEdit();
        const position = new vscode.Position(editor.document.lineCount, 0);
        edit.insert(editor.document.uri, position, sampleCode);
        await vscode.workspace.applyEdit(edit);

        // 将光标定位到最后一个触发点
        const newLineCount = editor.document.lineCount;
        const lastLine = editor.document.lineAt(newLineCount - 1);
        const endPosition = new vscode.Position(newLineCount - 1, lastLine.text.length);
        editor.selection = new vscode.Selection(endPosition, endPosition);

        console.log(`已添加${languageId}语言的AI触发代码模板`);
    }



    private async moveCursorToLineEnd(editor: vscode.TextEditor): Promise<void> {
        const document = editor.document;
        const currentLine = editor.selection.active.line;
        const lineText = document.lineAt(currentLine).text;
        const endPosition = new vscode.Position(currentLine, lineText.length);

        editor.selection = new vscode.Selection(endPosition, endPosition);
        editor.revealRange(new vscode.Range(endPosition, endPosition));
    }

    private async positionCursorForAI(editor: vscode.TextEditor): Promise<void> {
        try {
            // 查找最佳的补全触发点
            const triggerPoint = await this.findCompletionTriggerPoint(editor);

            if (triggerPoint) {
                editor.selection = new vscode.Selection(triggerPoint, triggerPoint);
                editor.revealRange(new vscode.Range(triggerPoint, triggerPoint));
                console.log(`光标定位到补全触发点: 第${triggerPoint.line + 1}行, 第${triggerPoint.character}列`);
            } else {
                // 如果没有找到触发点，定位到文档末尾
                const document = editor.document;
                const lastLine = document.lineCount - 1;
                const lastLineText = document.lineAt(lastLine).text;
                const endPosition = new vscode.Position(lastLine, lastLineText.length);

                editor.selection = new vscode.Selection(endPosition, endPosition);
                editor.revealRange(new vscode.Range(endPosition, endPosition));
                console.log('光标定位到文档末尾');
            }
        } catch (error) {
            console.error('定位光标失败:', error);
        }
    }

    private async addTriggerCode(editor: vscode.TextEditor): Promise<void> {
        const languageId = editor.document.languageId;
        let triggerText = '';

        // 使用更容易触发AI建议的代码片段（避免触发VSCode自带的IntelliSense）
        switch (languageId) {
            case 'javascript':
            case 'typescript':
                const jsPatterns = [
                    '// TODO: implement ',
                    '// Create a function to ',
                    '// Add error handling for ',
                    'function calculateTotal',
                    'const handleUserInput = ',
                    'async function fetchData',
                    'const validateInput = ',
                    '// Generate code for ',
                    'function processArray',
                    'const apiCall = async '
                ];
                triggerText = jsPatterns[Math.floor(Math.random() * jsPatterns.length)];
                break;
            case 'python':
                const pyPatterns = [
                    '# TODO: implement ',
                    '# Create a function to ',
                    'def calculate_total',
                    'def process_data',
                    'async def fetch_data',
                    'def validate_input',
                    '# Generate code for ',
                    'class DataProcessor',
                    'def handle_error',
                    '# Add implementation for '
                ];
                triggerText = pyPatterns[Math.floor(Math.random() * pyPatterns.length)];
                break;
            case 'java':
                const javaPatterns = [
                    '// TODO: implement ',
                    '// Create a method to ',
                    'public void calculateTotal',
                    'private String processData',
                    'public class DataProcessor',
                    'private void validateInput',
                    '// Generate code for ',
                    'public static void main',
                    'private final String',
                    '// Add implementation for '
                ];
                triggerText = javaPatterns[Math.floor(Math.random() * javaPatterns.length)];
                break;
            default:
                triggerText = '// TODO: implement ';
        }

        // 插入触发代码
        const edit = new vscode.WorkspaceEdit();
        edit.insert(editor.document.uri, editor.selection.active, triggerText);
        await vscode.workspace.applyEdit(edit);

        console.log(`插入AI触发代码: "${triggerText}"`);

        // 重要：移动光标到代码末尾，这是AI助手检测的关键位置
        const newPosition = new vscode.Position(
            editor.selection.active.line,
            editor.selection.active.character + triggerText.length
        );
        editor.selection = new vscode.Selection(newPosition, newPosition);
    }

    private async checkAndAcceptInlineSuggestion(editor: vscode.TextEditor): Promise<boolean> {
        try {
            // 记录当前文档状态用于检测变化
            const beforeContent = editor.document.getText();
            const currentPosition = editor.selection.active;

            // 检查是否在同一位置重复触发
            if (this.lastTriggerPosition &&
                this.lastTriggerPosition.line === currentPosition.line &&
                this.lastTriggerPosition.character === currentPosition.character) {
                this.suggestionRetryCount++;
                console.log(`在相同位置重试第 ${this.suggestionRetryCount} 次`);

                if (this.suggestionRetryCount >= this.maxRetryAttempts) {
                    console.log('达到最大重试次数，跳过此位置');
                    this.resetSuggestionState();
                    return false;
                }
            } else {
                this.resetSuggestionState();
                this.lastTriggerPosition = currentPosition;
            }

            // 方法1: 尝试接受内联建议（GitHub Copilot的主要方式）
            let suggestionAccepted = false;
            try {
                await vscode.commands.executeCommand('editor.action.inlineSuggest.commit');
                console.log('成功接受内联建议 (inlineSuggest.commit)');
                suggestionAccepted = true;
            } catch (e) {
                console.log('inlineSuggest.commit 不可用');
            }

            // 方法2: 尝试GitHub Copilot特定命令
            if (!suggestionAccepted) {
                try {
                    await vscode.commands.executeCommand('github.copilot.acceptInlineSuggestion');
                    console.log('成功接受GitHub Copilot内联建议');
                    suggestionAccepted = true;
                } catch (e) {
                    console.log('GitHub Copilot内联建议命令不可用');
                }
            }

            // 方法3: 模拟Tab键（最通用的方法）
            if (!suggestionAccepted) {
                try {
                    const currentLine = editor.document.lineAt(currentPosition.line).text;
                    await vscode.commands.executeCommand('type', { text: '\t' });
                    console.log('模拟Tab键接受建议');

                    // 等待一下看是否有变化
                    await new Promise(resolve => setTimeout(resolve, 500));

                    const newLine = editor.document.lineAt(currentPosition.line).text;
                    if (newLine !== currentLine) {
                        console.log('检测到代码变化，可能成功接受了建议');
                        suggestionAccepted = true;
                    }
                } catch (e) {
                    console.log('Tab键模拟失败');
                }
            }

            // 方法4: 尝试其他可能的内联建议命令
            if (!suggestionAccepted) {
                const inlineCommands = [
                    'editor.action.inlineSuggest.accept',
                    'acceptSelectedSuggestion',
                    'tab'
                ];

                for (const command of inlineCommands) {
                    try {
                        await vscode.commands.executeCommand(command);
                        console.log(`成功执行内联命令: ${command}`);
                        suggestionAccepted = true;
                        break;
                    } catch (e) {
                        console.log(`内联命令 ${command} 不可用`);
                    }
                }
            }

            // 检测内容变化以确认建议是否被接受
            const afterContent = editor.document.getText();
            const contentChanged = beforeContent !== afterContent;

            if (contentChanged) {
                const newSuggestionContent = afterContent.substring(beforeContent.length);

                // 检查是否是重复的建议
                if (newSuggestionContent === this.lastSuggestionContent && newSuggestionContent.trim() !== '') {
                    console.log('检测到重复建议，尝试触发不同的AI建议');
                    this.suggestionRetryCount++;
                    return false;
                }

                this.lastSuggestionContent = newSuggestionContent;
                this.resetSuggestionState();

                // 记录建议到suggestionManager
                if (this.suggestionManager && newSuggestionContent.trim()) {
                    this.suggestionManager.addSuggestion(newSuggestionContent, currentPosition);
                }

                console.log('成功接受新的AI建议');
                return true;
            }

            return false;
        } catch (error) {
            console.error('检查和接受内联建议失败:', error);
            return false;
        }
    }

    private resetSuggestionState(): void {
        this.suggestionRetryCount = 0;
        this.lastTriggerPosition = null;
    }

    private async tryDifferentTriggerPosition(editor: vscode.TextEditor): Promise<void> {
        try {
            const currentPosition = editor.selection.active;
            const currentLine = editor.document.lineAt(currentPosition.line);

            // 尝试移动到行末
            if (currentPosition.character < currentLine.text.length) {
                const endPosition = new vscode.Position(currentPosition.line, currentLine.text.length);
                editor.selection = new vscode.Selection(endPosition, endPosition);
                console.log('移动光标到行末');
                return;
            }

            // 尝试移动到下一行开始
            if (currentPosition.line < editor.document.lineCount - 1) {
                const nextLinePosition = new vscode.Position(currentPosition.line + 1, 0);
                editor.selection = new vscode.Selection(nextLinePosition, nextLinePosition);
                console.log('移动光标到下一行');
                return;
            }

            // 添加新行
            await this.insertNewLine(editor);
            console.log('添加新行并移动光标');

        } catch (error) {
            console.error('尝试不同触发位置时出错:', error);
        }
    }

    private async tryAlternativeTriggerCode(editor: vscode.TextEditor): Promise<void> {
        try {
            const alternativeTriggers = [
                'function ',
                'const ',
                'if (',
                '// TODO: ',
                'return ',
                'console.log('
            ];

            const randomTrigger = alternativeTriggers[Math.floor(Math.random() * alternativeTriggers.length)];

            const edit = new vscode.WorkspaceEdit();
            edit.insert(editor.document.uri, editor.selection.active, randomTrigger);
            await vscode.workspace.applyEdit(edit);

            // 移动光标到触发代码末尾
            const newPosition = new vscode.Position(
                editor.selection.active.line,
                editor.selection.active.character + randomTrigger.length
            );
            editor.selection = new vscode.Selection(newPosition, newPosition);

            console.log(`尝试替代触发代码: "${randomTrigger}"`);

        } catch (error) {
            console.error('尝试替代触发代码时出错:', error);
        }
    }

    private async manuallyTriggerAI(editor: vscode.TextEditor): Promise<void> {
        const avoidVSCodeSuggestions = this.config.get('avoidVSCodeSuggestions', true) as boolean;

        console.log(`手动触发AI助手, 避免VSCode建议: ${avoidVSCodeSuggestions}`);

        // 尝试所有可能的AI助手内联建议命令
        const copilotSuccess = await this.tryTriggerCopilotInline();
        if (copilotSuccess) return;

        const tabnineSuccess = await this.tryTriggerTabnineInline();
        if (tabnineSuccess) return;

        const codewhispererSuccess = await this.tryTriggerCodeWhispererInline();
        if (codewhispererSuccess) return;

        // 通用内联建议触发（避免下拉菜单）
        const inlineTriggerCommands = [
            'editor.action.inlineSuggest.trigger',
            'editor.action.inlineSuggest.show'
        ];

        for (const command of inlineTriggerCommands) {
            try {
                await vscode.commands.executeCommand(command);
                console.log(`成功触发通用内联建议: ${command}`);
                return;
            } catch (e) {
                console.log(`内联触发命令 ${command} 不可用`);
            }
        }

        // 只有在允许的情况下才触发VSCode自带建议
        if (!avoidVSCodeSuggestions) {
            try {
                await vscode.commands.executeCommand('editor.action.triggerSuggest');
                console.log('触发VSCode自带建议作为后备');
            } catch (e) {
                console.log('VSCode自带建议触发失败');
            }
        } else {
            console.log('已配置避免VSCode自带建议，跳过触发');
        }
    }

    private async tryTriggerCopilotInline(): Promise<boolean> {
        const copilotCommands = [
            'github.copilot.generate',
            'github.copilot.triggerInlineCompletion',
            'editor.action.inlineSuggest.trigger'
        ];

        for (const command of copilotCommands) {
            try {
                await vscode.commands.executeCommand(command);
                console.log(`成功触发GitHub Copilot内联: ${command}`);
                return true;
            } catch (e) {
                console.log(`GitHub Copilot内联命令 ${command} 不可用`);
            }
        }
        return false;
    }

    private async tryTriggerTabnineInline(): Promise<boolean> {
        const tabnineCommands = [
            'tabnine.triggerCompletion',
            'TabNine::config'
        ];

        for (const command of tabnineCommands) {
            try {
                await vscode.commands.executeCommand(command);
                console.log(`成功触发Tabnine内联: ${command}`);
                return true;
            } catch (e) {
                console.log(`Tabnine内联命令 ${command} 不可用`);
            }
        }
        return false;
    }

    private async tryTriggerCodeWhispererInline(): Promise<boolean> {
        const codewhispererCommands = [
            'aws.amazonq.invokeInlineCompletion',
            'aws.codeWhisperer.invokeInlineCompletion'
        ];

        for (const command of codewhispererCommands) {
            try {
                await vscode.commands.executeCommand(command);
                console.log(`成功触发AWS CodeWhisperer内联: ${command}`);
                return true;
            } catch (e) {
                console.log(`AWS CodeWhisperer内联命令 ${command} 不可用`);
            }
        }
        return false;
    }

    private async tryTriggerCopilot(waitTime: number): Promise<void> {
        const copilotCommands = [
            'github.copilot.generate',
            'github.copilot.triggerInlineCompletion',
            'editor.action.inlineSuggest.trigger'
        ];

        for (const command of copilotCommands) {
            try {
                await vscode.commands.executeCommand(command);
                console.log(`成功触发GitHub Copilot: ${command}`);
                await new Promise(resolve => setTimeout(resolve, waitTime));
                return;
            } catch (e) {
                console.log(`GitHub Copilot命令 ${command} 不可用`);
            }
        }
    }

    private async tryTriggerTabnine(waitTime: number): Promise<void> {
        const tabnineCommands = [
            'tabnine.triggerCompletion',
            'tabnine.openHub',
            'TabNine::config'
        ];

        for (const command of tabnineCommands) {
            try {
                await vscode.commands.executeCommand(command);
                console.log(`成功触发Tabnine: ${command}`);
                await new Promise(resolve => setTimeout(resolve, Math.min(waitTime, 1000)));
                return;
            } catch (e) {
                console.log(`Tabnine命令 ${command} 不可用`);
            }
        }
    }

    private async tryTriggerCodeWhisperer(waitTime: number): Promise<void> {
        const codewhispererCommands = [
            'aws.amazonq.invokeInlineCompletion',
            'aws.codeWhisperer.invokeInlineCompletion',
            'amazonq.invokeInlineCompletion'
        ];

        for (const command of codewhispererCommands) {
            try {
                await vscode.commands.executeCommand(command);
                console.log(`成功触发AWS CodeWhisperer: ${command}`);
                await new Promise(resolve => setTimeout(resolve, waitTime));
                return;
            } catch (e) {
                console.log(`AWS CodeWhisperer命令 ${command} 不可用`);
            }
        }
    }

    private async insertNewLine(editor: vscode.TextEditor): Promise<void> {
        const edit = new vscode.WorkspaceEdit();
        edit.insert(editor.document.uri, editor.selection.active, '\n');
        await vscode.workspace.applyEdit(edit);

        // 更新光标位置到新行
        const newPosition = new vscode.Position(editor.selection.active.line + 1, 0);
        editor.selection = new vscode.Selection(newPosition, newPosition);
    }

    private async writeCodeSnippet(editor: vscode.TextEditor): Promise<void> {
        try {
            const languageId = editor.document.languageId;
            console.log(`为 ${languageId} 语言选择代码片段...`);

            // 获取随机代码片段
            const snippet = this.codeSnippetManager.getRandomSnippet(languageId);
            if (!snippet) {
                console.log(`没有找到 ${languageId} 语言的代码片段，使用默认代码`);
                await this.addSampleCode(editor);
                return;
            }

            // 获取代码片段的一部分（避免文件过大）
            const maxLines = this.config.get('snippetMaxLines', 30) as number;
            const snippetPortion = this.codeSnippetManager.getSnippetPortion(snippet, maxLines);

            console.log(`选择了代码片段: ${snippet.filename} (${snippetPortion.split('\n').length} 行)`);

            // 在文档末尾添加代码片段
            const document = editor.document;
            const lastLine = document.lineCount - 1;
            const lastLineText = document.lineAt(lastLine).text;
            const insertPosition = new vscode.Position(lastLine, lastLineText.length);

            // 添加分隔符和代码片段
            const separator = '\n\n// ==================== 新的代码片段 ====================\n';
            const fullContent = separator + snippetPortion + '\n';

            const edit = new vscode.WorkspaceEdit();
            edit.insert(editor.document.uri, insertPosition, fullContent);
            await vscode.workspace.applyEdit(edit);

            console.log('代码片段已添加到文档');

        } catch (error) {
            console.error('写入代码片段失败:', error);
            // 回退到默认代码
            await this.addSampleCode(editor);
        }
    }

    private async findCompletionTriggerPoint(editor: vscode.TextEditor): Promise<vscode.Position | null> {
        const document = editor.document;
        const lineCount = document.lineCount;

        // 从最后几行开始查找补全触发点
        const searchLines = Math.min(50, lineCount);
        const startLine = Math.max(0, lineCount - searchLines);

        for (let i = lineCount - 1; i >= startLine; i--) {
            const line = document.lineAt(i);
            const text = line.text;

            // 查找AI补全点标记
            if (text.includes('// AI补全点:') || text.includes('# AI补全点:')) {
                // 定位到标记后的位置
                const markIndex = text.indexOf('AI补全点:');
                if (markIndex !== -1) {
                    const afterMark = markIndex + 'AI补全点:'.length;
                    return new vscode.Position(i, Math.min(afterMark + 1, text.length));
                }
            }

            // 查找其他可能的触发点
            if (this.isCompletionTriggerLine(text)) {
                return new vscode.Position(i, text.length);
            }
        }

        // 如果没有找到特定的触发点，返回文档末尾
        const lastLine = document.lineAt(lineCount - 1);
        return new vscode.Position(lineCount - 1, lastLine.text.length);
    }

    private isCompletionTriggerLine(line: string): boolean {
        const trimmed = line.trim();

        // 空行或只有注释的行不是触发点
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
            /def\s+\w+\s*\(\s*$/,       // Python函数定义
            /class\s+\w+\s*:\s*$/,      // Python类定义
            /if\s+.*:\s*$/,             // Python if语句
            /for\s+.*:\s*$/,            // Python for循环
            /with\s+.*:\s*$/,           // Python with语句
        ];

        return triggerPatterns.some(pattern => pattern.test(trimmed));
    }

    public dispose() {
        this.stop();
        this.strategyManager.dispose();
    }
}