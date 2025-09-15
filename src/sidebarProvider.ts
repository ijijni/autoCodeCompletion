import * as vscode from 'vscode';
import { AutoCompletionManager } from './autoCompletionManager';
import { StatsManager } from './statsManager';
import { StateManager } from './stateManager';

export class SidebarProvider implements vscode.WebviewViewProvider {
    public static readonly viewType = 'autoCompletion.sidebarView';
    
    private _view?: vscode.WebviewView;
    private autoCompletionManager: AutoCompletionManager;
    private statsManager: StatsManager;
    private stateManager: StateManager;
    private stateSubscription?: vscode.Disposable;

    constructor(
        private readonly _extensionUri: vscode.Uri,
        autoCompletionManager: AutoCompletionManager,
        statsManager: StatsManager,
        stateManager?: StateManager
    ) {
        this.autoCompletionManager = autoCompletionManager;
        this.statsManager = statsManager;
        this.stateManager = stateManager || StateManager.getInstance();
    }

    public resolveWebviewView(
        webviewView: vscode.WebviewView,
        context: vscode.WebviewViewResolveContext,
        _token: vscode.CancellationToken
    ) {
        this._view = webviewView;

        webviewView.webview.options = {
            enableScripts: true,
            localResourceRoots: [this._extensionUri]
        };

        webviewView.webview.html = this._getHtmlForWebview(webviewView.webview);
        
        // 订阅状态变化
        if (this.stateSubscription) {
            this.stateSubscription.dispose();
        }
        this.stateSubscription = this.stateManager.subscribe(state => {
            this.updateWebview();
        });

        // 处理来自webview的消息
        webviewView.webview.onDidReceiveMessage(async data => {
            switch (data.command) {
                case 'start':
                    this.autoCompletionManager.start();
                    vscode.window.showInformationMessage('自动补全已启动');
                    this.updateWebview();
                    break;
                case 'stop':
                    this.autoCompletionManager.stop();
                    vscode.window.showInformationMessage('自动补全已停止');
                    this.updateWebview();
                    break;
                case 'triggerOnce':
                    await this.autoCompletionManager.triggerCompletionOnce();
                    vscode.window.showInformationMessage('已触发一次补全');
                    this.updateWebview();
                    break;
                case 'showStats':
                    this.statsManager.showStats();
                    break;
                case 'resetStats':
                    this.statsManager.resetDailyStats();
                    vscode.window.showInformationMessage('统计数据已重置');
                    this.updateWebview();
                    break;
                case 'openFullPanel':
                    vscode.commands.executeCommand('autoCodeCompletion.showControlPanel');
                    break;
                case 'openSettings':
                    vscode.commands.executeCommand('workbench.action.openSettings', 'autoCodeCompletion');
                    break;
                case 'updateSetting':
                    await this.updateSetting(data.setting, data.value);
                    this.updateWebview();
                    break;
                case 'switchStrategy':
                    await vscode.commands.executeCommand('autoCodeCompletion.switchStrategy');
                    this.updateWebview();
                    break;
                case 'getStatus':
                    this.updateWebview();
                    break;
            }
        });

        // 初始更新
        this.updateWebview();
    }

    private async updateSetting(setting: string, value: any) {
        const config = vscode.workspace.getConfiguration('autoCodeCompletion');
        await config.update(setting, value, vscode.ConfigurationTarget.Global);
        
        // 配置更新后，通知状态管理器重新加载设置
        this.stateManager.reloadSettingsFromConfig();
        this.autoCompletionManager.updateConfiguration();
        
        vscode.window.showInformationMessage(`设置已更新: ${setting}`);
    }

    public refreshStatus() {
        // 状态更新现在由StateManager的订阅机制自动处理
    }

    private updateWebview() {
        if (this._view) {
            const state = this.stateManager.getState();
            
            this._view.webview.postMessage({
                command: 'updateStatus',
                data: {
                    isRunning: state.isRunning,
                    stats: state.stats,
                    settings: {
                        autoFocusOnCompletion: state.settings.autoFocusOnCompletion
                    },
                    strategy: state.strategy
                }
            });
        }
    }
    
    public dispose() {
        if (this.stateSubscription) {
            this.stateSubscription.dispose();
        }
    }

    private _getHtmlForWebview(webview: vscode.Webview) {
        return `<!DOCTYPE html>
        <html lang="zh-CN">
        <head>
            <meta charset="UTF-8">
            <meta name="viewport" content="width=device-width, initial-scale=1.0">
            <title>AI代码补全</title>
            <style>
                body {
                    padding: 10px;
                    font-family: var(--vscode-font-family);
                    font-size: var(--vscode-font-size);
                    color: var(--vscode-foreground);
                    background-color: transparent;
                }
                
                .header {
                    display: flex;
                    align-items: center;
                    margin-bottom: 15px;
                    padding-bottom: 10px;
                    border-bottom: 1px solid var(--vscode-panel-border);
                }
                
                .header-icon {
                    font-size: 20px;
                    margin-right: 10px;
                }
                
                .header-title {
                    font-size: 14px;
                    font-weight: 600;
                }
                
                .status-section {
                    margin-bottom: 20px;
                }
                
                .status-indicator {
                    display: flex;
                    align-items: center;
                    padding: 8px;
                    border-radius: 4px;
                    background: var(--vscode-editor-background);
                    margin-bottom: 10px;
                }
                
                .status-dot {
                    width: 8px;
                    height: 8px;
                    border-radius: 50%;
                    margin-right: 8px;
                    animation: pulse 2s infinite;
                }
                
                .status-running {
                    background-color: #28a745;
                }
                
                .status-stopped {
                    background-color: #dc3545;
                }
                
                @keyframes pulse {
                    0% { opacity: 1; }
                    50% { opacity: 0.5; }
                    100% { opacity: 1; }
                }
                
                .status-text {
                    font-size: 13px;
                }
                
                .stats-grid {
                    display: grid;
                    grid-template-columns: 1fr 1fr;
                    gap: 10px;
                    margin-bottom: 20px;
                }
                
                .stat-card {
                    background: var(--vscode-editor-background);
                    padding: 10px;
                    border-radius: 4px;
                    text-align: center;
                }
                
                .stat-value {
                    font-size: 18px;
                    font-weight: bold;
                    color: var(--vscode-editor-foreground);
                }
                
                .stat-label {
                    font-size: 11px;
                    color: var(--vscode-descriptionForeground);
                    margin-top: 4px;
                }
                
                .control-buttons {
                    display: flex;
                    flex-direction: column;
                    gap: 8px;
                    margin-bottom: 15px;
                }
                
                .btn {
                    padding: 6px 12px;
                    border: 1px solid var(--vscode-button-border);
                    background: var(--vscode-button-background);
                    color: var(--vscode-button-foreground);
                    border-radius: 4px;
                    cursor: pointer;
                    font-size: 12px;
                    text-align: center;
                    transition: opacity 0.2s;
                }
                
                .btn:hover {
                    opacity: 0.9;
                }
                
                .btn:disabled {
                    opacity: 0.5;
                    cursor: not-allowed;
                }
                
                .btn-primary {
                    background: #007acc;
                    color: white;
                    border-color: #007acc;
                }
                
                .btn-danger {
                    background: #dc3545;
                    color: white;
                    border-color: #dc3545;
                }
                
                .btn-success {
                    background: #28a745;
                    color: white;
                    border-color: #28a745;
                }
                
                .quick-actions {
                    margin-top: 15px;
                    padding-top: 15px;
                    border-top: 1px solid var(--vscode-panel-border);
                }
                
                .action-link {
                    display: flex;
                    align-items: center;
                    padding: 6px 0;
                    color: var(--vscode-textLink-foreground);
                    text-decoration: none;
                    font-size: 12px;
                    cursor: pointer;
                }
                
                .action-link:hover {
                    text-decoration: underline;
                }
                
                .action-icon {
                    margin-right: 6px;
                }
            </style>
        </head>
        <body>
            <div class="header">
                <span class="header-icon">🤖</span>
                <span class="header-title">AI代码补全控制</span>
            </div>
            
            <div class="status-section">
                <div class="status-indicator">
                    <span id="statusDot" class="status-dot status-stopped"></span>
                    <span id="statusText" class="status-text">已停止</span>
                </div>
            </div>
            
            <div class="stats-grid">
                <div class="stat-card">
                    <div id="dailyCount" class="stat-value">0</div>
                    <div class="stat-label">今日补全</div>
                </div>
                <div class="stat-card">
                    <div id="totalCount" class="stat-value">0</div>
                    <div class="stat-label">总计补全</div>
                </div>
            </div>

            <div class="strategy-section" style="margin: 15px 0; padding: 12px; background: var(--vscode-editor-background); border-radius: 8px; border-left: 3px solid var(--vscode-button-background);">
                <div style="display: flex; justify-content: space-between; align-items: center; margin-bottom: 8px;">
                    <span style="font-weight: 600; color: var(--vscode-foreground);">补全策略</span>
                    <button class="btn" style="padding: 2px 8px; font-size: 11px;" onclick="switchStrategy()">切换</button>
                </div>
                <div style="font-size: 12px; color: var(--vscode-descriptionForeground);">
                    <div style="margin-bottom: 4px;">
                        当前策略: <span id="currentStrategy" style="color: var(--vscode-foreground);">固定间隔</span>
                    </div>
                    <div style="margin-bottom: 4px;">
                        当前间隔: <span id="currentInterval" style="color: var(--vscode-foreground);">5秒</span>
                    </div>
                    <div id="nextTriggerRow" style="display: none;">
                        下次触发: <span id="nextTrigger" style="color: var(--vscode-foreground);">--:--:--</span>
                    </div>
                    <div id="strategyDetails" style="margin-top: 8px; padding-top: 8px; border-top: 1px solid var(--vscode-widget-border);"></div>
                </div>
            </div>
            
            <div class="control-buttons">
                <button id="toggleBtn" class="btn btn-primary" onclick="toggleCompletion()">
                    启动自动补全
                </button>
                <button class="btn" onclick="triggerOnce()">
                    触发一次补全
                </button>
                <button class="btn" onclick="showStats()">
                    查看统计详情
                </button>
            </div>
            
            <div class="quick-actions">
                <div style="margin-bottom: 10px; padding: 8px; background: var(--vscode-editor-background); border-radius: 4px;">
                    <label style="display: flex; align-items: center; cursor: pointer; font-size: 12px;">
                        <input type="checkbox" id="autoFocusSwitch" onchange="toggleAutoFocus()" style="margin-right: 8px;">
                        <span>补全时自动切换页面</span>
                    </label>
                    <div style="font-size: 11px; color: var(--vscode-descriptionForeground); margin-top: 4px; margin-left: 20px;">
                        关闭时在后台静默执行
                    </div>
                </div>
                <a class="action-link" onclick="openFullPanel()">
                    <span class="action-icon">📊</span>
                    打开完整控制面板
                </a>
                <a class="action-link" onclick="openSettings()">
                    <span class="action-icon">⚙️</span>
                    打开高级设置
                </a>
                <a class="action-link" onclick="resetStats()">
                    <span class="action-icon">🔄</span>
                    重置今日统计
                </a>
            </div>
            
            <script>
                const vscode = acquireVsCodeApi();
                let isRunning = false;
                
                function toggleCompletion() {
                    if (isRunning) {
                        vscode.postMessage({ command: 'stop' });
                    } else {
                        vscode.postMessage({ command: 'start' });
                    }
                }
                
                function triggerOnce() {
                    vscode.postMessage({ command: 'triggerOnce' });
                }
                
                function showStats() {
                    vscode.postMessage({ command: 'showStats' });
                }
                
                function resetStats() {
                    if (confirm('确定要重置今日统计数据吗？')) {
                        vscode.postMessage({ command: 'resetStats' });
                    }
                }
                
                function openFullPanel() {
                    vscode.postMessage({ command: 'openFullPanel' });
                }
                
                function openSettings() {
                    vscode.postMessage({ command: 'openSettings' });
                }

                function switchStrategy() {
                    vscode.postMessage({ command: 'switchStrategy' });
                }

                function toggleAutoFocus() {
                    const checkbox = document.getElementById('autoFocusSwitch');
                    vscode.postMessage({ 
                        command: 'updateSetting', 
                        setting: 'autoFocusOnCompletion',
                        value: checkbox.checked 
                    });
                }
                
                function updateUI(data) {
                    isRunning = data.isRunning;
                    
                    // 更新状态指示器
                    const statusDot = document.getElementById('statusDot');
                    const statusText = document.getElementById('statusText');
                    const toggleBtn = document.getElementById('toggleBtn');
                    
                    if (isRunning) {
                        statusDot.className = 'status-dot status-running';
                        statusText.textContent = '运行中';
                        toggleBtn.textContent = '停止自动补全';
                        toggleBtn.className = 'btn btn-danger';
                    } else {
                        statusDot.className = 'status-dot status-stopped';
                        statusText.textContent = '已停止';
                        toggleBtn.textContent = '启动自动补全';
                        toggleBtn.className = 'btn btn-success';
                    }
                    
                    // 更新统计数据
                    document.getElementById('dailyCount').textContent = data.stats.dailyCount;
                    document.getElementById('totalCount').textContent = data.stats.totalCount;
                    
                    // 更新设置状态
                    if (data.settings) {
                        document.getElementById('autoFocusSwitch').checked = data.settings.autoFocusOnCompletion || false;
                    }

                    // 更新策略信息
                    if (data.strategy) {
                        const strategyMap = {
                            'fixed': '固定间隔',
                            'timeSlot': '时间段',
                            'workday': '工作日',
                            'activity': '活跃度',
                            'projectType': '项目类型',
                            'composite': '组合策略'
                        };

                        document.getElementById('currentStrategy').textContent = strategyMap[data.strategy.current] || data.strategy.current;

                        if (data.strategy.status) {
                            const interval = data.strategy.status.currentInterval;
                            document.getElementById('currentInterval').textContent = \`\${(interval / 1000).toFixed(1)}秒\`;

                            // 显示下次触发时间
                            if (data.strategy.nextTriggerTime && isRunning) {
                                document.getElementById('nextTriggerRow').style.display = 'block';
                                const nextTime = new Date(data.strategy.nextTriggerTime);
                                document.getElementById('nextTrigger').textContent = nextTime.toLocaleTimeString();
                            } else {
                                document.getElementById('nextTriggerRow').style.display = 'none';
                            }

                            // 显示策略详情
                            const detailsDiv = document.getElementById('strategyDetails');
                            if (data.strategy.status.additionalInfo) {
                                const info = data.strategy.status.additionalInfo;
                                let detailsHTML = '';

                                // 根据不同策略显示不同信息
                                if (data.strategy.current === 'activity' && info.activityLevel) {
                                    detailsHTML = \`活跃度: \${info.activityLevel}\`;
                                } else if (data.strategy.current === 'timeSlot' && info.currentTimeSlot) {
                                    detailsHTML = \`当前时段: \${info.currentTimeSlot}\`;
                                } else if (data.strategy.current === 'workday' && info.dayType) {
                                    detailsHTML = \`今日类型: \${info.dayType}\`;
                                } else if (data.strategy.current === 'projectType' && info.currentFileType) {
                                    detailsHTML = \`文件类型: \${info.projectType}\`;
                                } else if (data.strategy.current === 'composite' && info.activeStrategies) {
                                    detailsHTML = \`活跃策略: \${info.activeStrategies.join(', ')}\`;
                                }

                                detailsDiv.innerHTML = detailsHTML;
                                detailsDiv.style.display = detailsHTML ? 'block' : 'none';
                            } else {
                                detailsDiv.style.display = 'none';
                            }
                        }
                    }
                }
                
                // 监听来自扩展的消息
                window.addEventListener('message', event => {
                    const message = event.data;
                    if (message.command === 'updateStatus') {
                        updateUI(message.data);
                    }
                });
                
                // 初始化获取状态
                vscode.postMessage({ command: 'getStatus' });
            </script>
        </body>
        </html>`;
    }
}