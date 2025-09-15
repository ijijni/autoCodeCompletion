import * as vscode from 'vscode';

export class QAManager implements vscode.Disposable {
    private panel: vscode.WebviewPanel | undefined;
    private isVisible = false;

    constructor(private context: vscode.ExtensionContext) {}

    public toggleQA(): void {
        if (this.panel) {
            if (this.isVisible) {
                this.panel.dispose();
            } else {
                this.panel.reveal();
            }
        } else {
            this.createQAPanel();
        }
    }

    private createQAPanel(): void {
        this.panel = vscode.window.createWebviewPanel(
            'autoCompletionQA',
            'AI助手问答',
            vscode.ViewColumn.Beside,
            {
                enableScripts: true,
                retainContextWhenHidden: true
            }
        );

        this.panel.webview.html = this.getWebviewContent();
        this.isVisible = true;

        // 监听面板关闭事件
        this.panel.onDidDispose(() => {
            this.panel = undefined;
            this.isVisible = false;
        });

        // 监听面板可见性变化
        this.panel.onDidChangeViewState(() => {
            this.isVisible = this.panel?.visible || false;
        });

        // 监听来自webview的消息
        this.panel.webview.onDidReceiveMessage(
            message => {
                switch (message.command) {
                    case 'askQuestion':
                        this.handleQuestion(message.question);
                        break;
                    case 'clearChat':
                        this.clearChat();
                        break;
                }
            },
            undefined,
            this.context.subscriptions
        );
    }

    private getWebviewContent(): string {
        return `<!DOCTYPE html>
<html lang="zh-CN">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>AI助手问答</title>
    <style>
        body {
            font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif;
            margin: 0;
            padding: 20px;
            background-color: var(--vscode-editor-background);
            color: var(--vscode-editor-foreground);
        }
        .container {
            max-width: 800px;
            margin: 0 auto;
        }
        .header {
            text-align: center;
            margin-bottom: 30px;
            padding-bottom: 20px;
            border-bottom: 1px solid var(--vscode-panel-border);
        }
        .chat-container {
            height: 400px;
            overflow-y: auto;
            border: 1px solid var(--vscode-panel-border);
            border-radius: 8px;
            padding: 15px;
            margin-bottom: 20px;
            background-color: var(--vscode-input-background);
        }
        .message {
            margin-bottom: 15px;
            padding: 10px;
            border-radius: 8px;
        }
        .user-message {
            background-color: var(--vscode-button-background);
            color: var(--vscode-button-foreground);
            margin-left: 20%;
        }
        .ai-message {
            background-color: var(--vscode-textBlockQuote-background);
            margin-right: 20%;
        }
        .input-container {
            display: flex;
            gap: 10px;
        }
        .question-input {
            flex: 1;
            padding: 10px;
            border: 1px solid var(--vscode-input-border);
            border-radius: 4px;
            background-color: var(--vscode-input-background);
            color: var(--vscode-input-foreground);
            font-size: 14px;
        }
        .send-button, .clear-button {
            padding: 10px 20px;
            border: none;
            border-radius: 4px;
            background-color: var(--vscode-button-background);
            color: var(--vscode-button-foreground);
            cursor: pointer;
            font-size: 14px;
        }
        .send-button:hover, .clear-button:hover {
            background-color: var(--vscode-button-hoverBackground);
        }
        .shortcuts {
            margin-top: 20px;
            padding: 15px;
            background-color: var(--vscode-textBlockQuote-background);
            border-radius: 8px;
            font-size: 12px;
        }
        .shortcuts h3 {
            margin-top: 0;
            color: var(--vscode-textPreformat-foreground);
        }
        .shortcut-item {
            margin: 5px 0;
            display: flex;
            justify-content: space-between;
        }
        .shortcut-key {
            font-family: monospace;
            background-color: var(--vscode-textCodeBlock-background);
            padding: 2px 6px;
            border-radius: 3px;
        }
    </style>
</head>
<body>
    <div class="container">
        <div class="header">
            <h1>🤖 AI代码助手问答</h1>
            <p>快捷键: Alt+Shift+K (Win) / ⌥⇧K (Mac) 打开/关闭</p>
        </div>
        
        <div id="chatContainer" class="chat-container">
            <div class="message ai-message">
                <strong>AI助手:</strong> 您好！我是您的AI代码助手。您可以询问关于代码补全、编程问题或插件使用的任何问题。
            </div>
        </div>
        
        <div class="input-container">
            <input type="text" id="questionInput" class="question-input" 
                   placeholder="请输入您的问题..." 
                   onkeypress="handleKeyPress(event)">
            <button onclick="sendQuestion()" class="send-button">发送</button>
            <button onclick="clearChat()" class="clear-button">清空</button>
        </div>
        
        <div class="shortcuts">
            <h3>📋 快捷键说明</h3>
            <div class="shortcut-item">
                <span>采纳代码建议:</span>
                <span class="shortcut-key">Tab</span>
            </div>
            <div class="shortcut-item">
                <span>上一条建议:</span>
                <span class="shortcut-key">Alt + [</span>
            </div>
            <div class="shortcut-item">
                <span>下一条建议:</span>
                <span class="shortcut-key">Alt + ]</span>
            </div>
            <div class="shortcut-item">
                <span>手动触发补全:</span>
                <span class="shortcut-key">Ctrl + Enter</span>
            </div>
            <div class="shortcut-item">
                <span>打开/关闭问答:</span>
                <span class="shortcut-key">Alt + Shift + K</span>
            </div>
        </div>
    </div>

    <script>
        const vscode = acquireVsCodeApi();
        
        function handleKeyPress(event) {
            if (event.key === 'Enter') {
                sendQuestion();
            }
        }
        
        function sendQuestion() {
            const input = document.getElementById('questionInput');
            const question = input.value.trim();
            
            if (question) {
                addMessage('user', question);
                input.value = '';
                
                vscode.postMessage({
                    command: 'askQuestion',
                    question: question
                });
            }
        }
        
        function clearChat() {
            vscode.postMessage({
                command: 'clearChat'
            });
            
            const chatContainer = document.getElementById('chatContainer');
            chatContainer.innerHTML = \`
                <div class="message ai-message">
                    <strong>AI助手:</strong> 聊天记录已清空。您可以重新开始提问。
                </div>
            \`;
        }
        
        function addMessage(type, content) {
            const chatContainer = document.getElementById('chatContainer');
            const messageDiv = document.createElement('div');
            messageDiv.className = \`message \${type}-message\`;
            
            if (type === 'user') {
                messageDiv.innerHTML = \`<strong>您:</strong> \${content}\`;
            } else {
                messageDiv.innerHTML = \`<strong>AI助手:</strong> \${content}\`;
            }
            
            chatContainer.appendChild(messageDiv);
            chatContainer.scrollTop = chatContainer.scrollHeight;
        }
        
        // 监听来自扩展的消息
        window.addEventListener('message', event => {
            const message = event.data;
            if (message.command === 'aiResponse') {
                addMessage('ai', message.response);
            }
        });
    </script>
</body>
</html>`;
    }

    private async handleQuestion(question: string): Promise<void> {
        // 这里可以集成真实的AI服务，现在先提供一些预设回答
        const response = this.generateResponse(question);
        
        if (this.panel) {
            this.panel.webview.postMessage({
                command: 'aiResponse',
                response: response
            });
        }
    }

    private generateResponse(question: string): string {
        const lowerQuestion = question.toLowerCase();
        
        if (lowerQuestion.includes('快捷键') || lowerQuestion.includes('shortcut')) {
            return `以下是插件的主要快捷键：
• Tab: 采纳代码建议
• Alt + [: 查看上一条补全建议  
• Alt + ]: 查看下一条补全建议
• Ctrl + Enter: 手动发起补全请求
• Alt + Shift + K: 打开/关闭问答面板

Mac用户请将Alt替换为⌥，Ctrl替换为⌘。`;
        }
        
        if (lowerQuestion.includes('如何使用') || lowerQuestion.includes('怎么用')) {
            return `插件使用步骤：
1. 确保已安装AI代码助手（如GitHub Copilot）
2. 按Ctrl+Shift+P打开命令面板
3. 输入"Start Auto Completion"启动自动补全
4. 插件会自动在代码中触发AI建议
5. 使用Tab键采纳建议，或使用快捷键导航

更多详细说明请查看README.md文档。`;
        }
        
        if (lowerQuestion.includes('配置') || lowerQuestion.includes('设置')) {
            return `主要配置项：
• autoCodeCompletion.enabled: 启用插件
• autoCodeCompletion.interval: 补全间隔时间
• autoCodeCompletion.aiWaitTime: AI响应等待时间
• autoCodeCompletion.maxCompletionsPerDay: 每日最大补全次数

在VSCode设置中搜索"Auto Code Completion"进行配置。`;
        }
        
        if (lowerQuestion.includes('不工作') || lowerQuestion.includes('问题') || lowerQuestion.includes('错误')) {
            return `常见问题解决：
1. 确认AI助手（如Copilot）已正确安装并登录
2. 检查插件是否已启用：设置中搜索"Auto Code Completion"
3. 尝试重启VSCode
4. 查看开发者控制台是否有错误信息
5. 确认当前文件类型在支持的语言列表中

如果问题持续，请查看文档中的故障排除部分。`;
        }
        
        return `感谢您的问题！这是一个AI代码补全插件，主要功能包括：
• 自动触发AI代码建议
• 支持10种编程语言
• 智能代码片段系统
• 完整的快捷键支持

如果您有具体的使用问题，请详细描述，我会尽力帮助您解决。您也可以询问关于快捷键、配置、故障排除等方面的问题。`;
    }

    private clearChat(): void {
        // 清空聊天记录的逻辑已在webview中处理
        console.log('Chat cleared');
    }

    public dispose(): void {
        if (this.panel) {
            this.panel.dispose();
        }
    }
}
