import * as vscode from 'vscode';
import { AutoCompletionManager } from './autoCompletionManager';
import { StatsManager } from './statsManager';
import { StateManager } from './stateManager';

export class ControlPanelManager implements vscode.Disposable {
    private panel: vscode.WebviewPanel | undefined;
    private context: vscode.ExtensionContext;
    private autoCompletionManager: AutoCompletionManager;
    private statsManager: StatsManager;
    private stateManager: StateManager;
    private disposables: vscode.Disposable[] = [];
    private statusBarItem: vscode.StatusBarItem | undefined;
    private statusUpdateTimer: NodeJS.Timeout | undefined;

    constructor(
        context: vscode.ExtensionContext,
        autoCompletionManager: AutoCompletionManager,
        statsManager: StatsManager,
        stateManager?: StateManager
    ) {
        this.context = context;
        this.autoCompletionManager = autoCompletionManager;
        this.statsManager = statsManager;
        this.stateManager = stateManager || StateManager.getInstance();
        this.createStatusBarItem();
        
        // 订阅状态变化
        this.disposables.push(
            this.stateManager.subscribe(state => {
                this.updateStatusBarItem();
                this.updatePanelStatus();
            })
        );
    }

    private createStatusBarItem() {
        // 创建状态栏按钮
        this.statusBarItem = vscode.window.createStatusBarItem(
            vscode.StatusBarAlignment.Right,
            100
        );
        
        // 设置图标和提示
        this.updateStatusBarItem();
        
        // 设置点击命令
        this.statusBarItem.command = 'autoCodeCompletion.showControlPanel';
        
        // 显示状态栏按钮
        this.statusBarItem.show();
    }

    private updateStatusBarItem() {
        if (!this.statusBarItem) return;
        
        const state = this.stateManager.getState();
        const isRunning = state.isRunning;
        const stats = state.stats;
        
        // 根据运行状态设置不同的图标和颜色
        if (isRunning) {
            this.statusBarItem.text = `$(sync~spin) AI补全: ${stats.dailyCount}/${stats.totalCount}`;
            this.statusBarItem.backgroundColor = new vscode.ThemeColor('statusBarItem.warningBackground');
            this.statusBarItem.tooltip = `AI自动补全运行中\n今日: ${stats.dailyCount} 次\n总计: ${stats.totalCount} 次\n点击打开控制面板`;
        } else {
            this.statusBarItem.text = `$(circle-slash) AI补全: ${stats.dailyCount}/${stats.totalCount}`;
            this.statusBarItem.backgroundColor = undefined;
            this.statusBarItem.tooltip = `AI自动补全已停止\n今日: ${stats.dailyCount} 次\n总计: ${stats.totalCount} 次\n点击打开控制面板`;
        }
    }

    public showPanel() {
        if (this.panel) {
            this.panel.reveal();
            return;
        }

        this.panel = vscode.window.createWebviewPanel(
            'autoCompletionControlPanel',
            'Auto Completion Control Panel',
            vscode.ViewColumn.Two,
            {
                enableScripts: true,
                retainContextWhenHidden: true
            }
        );

        this.panel.webview.html = this.getWebviewContent();

        this.panel.webview.onDidReceiveMessage(
            async message => {
                console.log('[ControlPanelManager] 收到WebView消息:', message);
                switch (message.command) {
                    case 'start':
                        this.autoCompletionManager.start();
                        vscode.window.showInformationMessage('自动补全已启动');
                        this.updatePanelStatus();
                        break;
                    case 'stop':
                        this.autoCompletionManager.stop();
                        vscode.window.showInformationMessage('自动补全已停止');
                        this.updatePanelStatus();
                        break;
                    case 'triggerOnce':
                        await this.autoCompletionManager.triggerCompletionOnce();
                        vscode.window.showInformationMessage('已触发一次补全');
                        break;
                    case 'showStats':
                        this.statsManager.showStats();
                        break;
                    case 'resetStats':
                        vscode.window.showWarningMessage('确定要重置统计数据吗？', '确定', '取消').then(selection => {
                            if (selection === '确定') {
                                this.statsManager.resetDailyStats();
                                vscode.window.showInformationMessage('统计数据已重置');
                                this.updatePanelStatus();
                            }
                        });
                        break;
                    case 'updateSettings':
                        await this.updateSettings(message.settings);
                        this.updatePanelStatus(); // 更新设置后立即更新状态
                        break;
                    case 'getStatus':
                        this.updatePanelStatus();
                        break;
                }
            },
            undefined,
            this.disposables
        );

        this.panel.onDidDispose(
            () => {
                this.panel = undefined;
            },
            undefined,
            this.disposables
        );

        this.updatePanelStatus();
    }

    private async updateSettings(settings: any) {
        console.log('[ControlPanelManager] 开始更新设置:', settings);
        try {
            const config = vscode.workspace.getConfiguration('autoCodeCompletion');
            const updatePromises: Thenable<void>[] = [];
            
            // 基础设置
            if (settings.enabled !== undefined) {
                updatePromises.push(config.update('enabled', settings.enabled, vscode.ConfigurationTarget.Global));
            }
            if (settings.interval !== undefined) {
                updatePromises.push(config.update('interval', settings.interval, vscode.ConfigurationTarget.Global));
            }
            if (settings.maxCompletionsPerDay !== undefined) {
                updatePromises.push(config.update('maxCompletionsPerDay', settings.maxCompletionsPerDay, vscode.ConfigurationTarget.Global));
            }
            if (settings.aiWaitTime !== undefined) {
                updatePromises.push(config.update('aiWaitTime', settings.aiWaitTime, vscode.ConfigurationTarget.Global));
            }
            
            // 高级设置
            if (settings.autoCreateFiles !== undefined) {
                updatePromises.push(config.update('autoCreateFiles', settings.autoCreateFiles, vscode.ConfigurationTarget.Global));
            }
            if (settings.avoidVSCodeSuggestions !== undefined) {
                updatePromises.push(config.update('avoidVSCodeSuggestions', settings.avoidVSCodeSuggestions, vscode.ConfigurationTarget.Global));
            }
            if (settings.useCodeSnippets !== undefined) {
                updatePromises.push(config.update('useCodeSnippets', settings.useCodeSnippets, vscode.ConfigurationTarget.Global));
            }
            if (settings.snippetMaxLines !== undefined) {
                updatePromises.push(config.update('snippetMaxLines', settings.snippetMaxLines, vscode.ConfigurationTarget.Global));
            }
            if (settings.enableProjectCodeDetection !== undefined) {
                updatePromises.push(config.update('enableProjectCodeDetection', settings.enableProjectCodeDetection, vscode.ConfigurationTarget.Global));
            }
            if (settings.maxRetryAttempts !== undefined) {
                updatePromises.push(config.update('maxRetryAttempts', settings.maxRetryAttempts, vscode.ConfigurationTarget.Global));
            }
            if (settings.projectCodeMaxFiles !== undefined) {
                updatePromises.push(config.update('projectCodeMaxFiles', settings.projectCodeMaxFiles, vscode.ConfigurationTarget.Global));
            }
            if (settings.projectCodeMaxFileSize !== undefined) {
                updatePromises.push(config.update('projectCodeMaxFileSize', settings.projectCodeMaxFileSize, vscode.ConfigurationTarget.Global));
            }
            if (settings.supportedLanguages !== undefined) {
                updatePromises.push(config.update('supportedLanguages', settings.supportedLanguages, vscode.ConfigurationTarget.Global));
            }
            if (settings.enableCustomSnippets !== undefined) {
                updatePromises.push(config.update('enableCustomSnippets', settings.enableCustomSnippets, vscode.ConfigurationTarget.Global));
            }
            if (settings.customSnippetPriority !== undefined) {
                updatePromises.push(config.update('customSnippetPriority', settings.customSnippetPriority, vscode.ConfigurationTarget.Global));
            }
            if (settings.customSnippetDirectories !== undefined) {
                updatePromises.push(config.update('customSnippetDirectories', settings.customSnippetDirectories, vscode.ConfigurationTarget.Global));
            }
            if (settings.autoFocusOnCompletion !== undefined) {
                updatePromises.push(config.update('autoFocusOnCompletion', settings.autoFocusOnCompletion, vscode.ConfigurationTarget.Global));
            }

            // 策略相关设置
            if (settings.completionStrategy !== undefined) {
                updatePromises.push(config.update('completionStrategy', settings.completionStrategy, vscode.ConfigurationTarget.Global));
            }
            if (settings.strategyConfig !== undefined) {
                updatePromises.push(config.update('strategyConfig', settings.strategyConfig, vscode.ConfigurationTarget.Global));
            }

            // 等待所有配置更新完成
            console.log('[ControlPanelManager] 正在更新配置，共', updatePromises.length, '个配置项');
            await Promise.all(updatePromises);
            
            // 配置更新后，通知状态管理器重新加载设置
            console.log('[ControlPanelManager] 配置更新完成，通知StateManager重新加载');
            this.stateManager.reloadSettingsFromConfig();
            this.autoCompletionManager.updateConfiguration();
            
            vscode.window.showInformationMessage('设置已成功更新并保存到VSCode配置');
            
            // 验证配置是否真的更新了
            const updatedConfig = vscode.workspace.getConfiguration('autoCodeCompletion');
            console.log('配置更新验证:', {
                enabled: updatedConfig.get('enabled'),
                interval: updatedConfig.get('interval'),
                maxCompletionsPerDay: updatedConfig.get('maxCompletionsPerDay')
            });
        } catch (error) {
            console.error('更新配置时发生错误:', error);
            vscode.window.showErrorMessage(`更新配置失败: ${error instanceof Error ? error.message : '未知错误'}`);
        }
    }

    public refreshPanelStatus() {
        // 状态更新现在由StateManager的订阅机制自动处理
    }

    private updatePanelStatus() {
        if (!this.panel) {
            return;
        }

        const state = this.stateManager.getState();
        console.log('[ControlPanelManager] 更新面板状态:', state);

        this.panel.webview.postMessage({
            command: 'updateStatus',
            data: {
                isRunning: state.isRunning,
                settings: state.settings,
                stats: state.stats
            }
        });
    }

    private getWebviewContent(): string {
        // 读取当前配置
        const config = vscode.workspace.getConfiguration('autoCodeCompletion');
        const currentSettings = {
            enabled: config.get('enabled', false),
            interval: config.get('interval', 20000),
            maxCompletionsPerDay: config.get('maxCompletionsPerDay', 100),
            aiWaitTime: config.get('aiWaitTime', 5000),
            autoCreateFiles: config.get('autoCreateFiles', true),
            avoidVSCodeSuggestions: config.get('avoidVSCodeSuggestions', true),
            useCodeSnippets: config.get('useCodeSnippets', true),
            snippetMaxLines: config.get('snippetMaxLines', 30),
            enableProjectCodeDetection: config.get('enableProjectCodeDetection', true),
            maxRetryAttempts: config.get('maxRetryAttempts', 3),
            projectCodeMaxFiles: config.get('projectCodeMaxFiles', 50),
            projectCodeMaxFileSize: config.get('projectCodeMaxFileSize', 51200),
            supportedLanguages: config.get<string[]>('supportedLanguages', []),
            enableCustomSnippets: config.get('enableCustomSnippets', true),
            customSnippetPriority: config.get('customSnippetPriority', 'custom-first'),
            customSnippetDirectories: config.get<string[]>('customSnippetDirectories', []),
            autoFocusOnCompletion: config.get('autoFocusOnCompletion', false),
            completionStrategy: config.get('completionStrategy', 'fixed'),
            strategyConfig: config.get('strategyConfig', {})
        };
        
        return `<!DOCTYPE html>
        <html lang="zh-CN">
        <head>
            <meta charset="UTF-8">
            <meta name="viewport" content="width=device-width, initial-scale=1.0">
            <title>Auto Completion Control Panel</title>
            <style>
                body {
                    font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, 'Helvetica Neue', Arial, sans-serif;
                    padding: 20px;
                    max-width: 800px;
                    margin: 0 auto;
                    background: var(--vscode-editor-background);
                    color: var(--vscode-editor-foreground);
                }
                h1 {
                    color: var(--vscode-editor-foreground);
                    border-bottom: 2px solid var(--vscode-panel-border);
                    padding-bottom: 10px;
                }
                .control-section {
                    background: var(--vscode-editor-background);
                    border: 1px solid var(--vscode-panel-border);
                    border-radius: 6px;
                    padding: 20px;
                    margin-bottom: 20px;
                }
                .status-badge {
                    display: inline-block;
                    padding: 4px 12px;
                    border-radius: 12px;
                    font-size: 12px;
                    font-weight: 600;
                    margin-left: 10px;
                }
                .status-running {
                    background: #28a745;
                    color: white;
                }
                .status-stopped {
                    background: #dc3545;
                    color: white;
                }
                .button-group {
                    display: flex;
                    gap: 10px;
                    margin: 20px 0;
                }
                button {
                    background: var(--vscode-button-background);
                    color: var(--vscode-button-foreground);
                    border: none;
                    padding: 8px 16px;
                    border-radius: 4px;
                    cursor: pointer;
                    font-size: 14px;
                    transition: opacity 0.2s;
                }
                button:hover {
                    opacity: 0.9;
                }
                button:disabled {
                    opacity: 0.5;
                    cursor: not-allowed;
                }
                .primary {
                    background: #007acc;
                    color: white;
                }
                .danger {
                    background: #dc3545;
                    color: white;
                }
                .success {
                    background: #28a745;
                    color: white;
                }
                .stats-grid {
                    display: grid;
                    grid-template-columns: repeat(auto-fit, minmax(150px, 1fr));
                    gap: 15px;
                    margin: 20px 0;
                }
                .stat-card {
                    background: var(--vscode-editor-background);
                    border: 1px solid var(--vscode-panel-border);
                    padding: 15px;
                    border-radius: 4px;
                }
                .stat-value {
                    font-size: 24px;
                    font-weight: bold;
                    color: var(--vscode-editor-foreground);
                }
                .stat-label {
                    font-size: 12px;
                    color: var(--vscode-descriptionForeground);
                    margin-top: 5px;
                }
                .settings-form {
                    display: grid;
                    gap: 15px;
                }
                .form-group {
                    display: flex;
                    flex-direction: column;
                }
                label {
                    font-size: 14px;
                    margin-bottom: 5px;
                    color: var(--vscode-editor-foreground);
                }
                input[type="number"], input[type="checkbox"] {
                    padding: 6px;
                    border: 1px solid var(--vscode-panel-border);
                    border-radius: 4px;
                    background: var(--vscode-input-background);
                    color: var(--vscode-input-foreground);
                }
                input[type="checkbox"] {
                    width: 20px;
                    height: 20px;
                }
                .checkbox-group {
                    display: flex;
                    align-items: center;
                    gap: 10px;
                }
                .info-text {
                    font-size: 12px;
                    color: var(--vscode-descriptionForeground);
                    margin-top: 5px;
                }
                select {
                    padding: 6px;
                    border: 1px solid var(--vscode-panel-border);
                    border-radius: 4px;
                    background: var(--vscode-input-background);
                    color: var(--vscode-input-foreground);
                    width: 100%;
                }
                textarea {
                    padding: 6px;
                    border: 1px solid var(--vscode-panel-border);
                    border-radius: 4px;
                    background: var(--vscode-input-background);
                    color: var(--vscode-input-foreground);
                    width: 100%;
                    resize: vertical;
                }
                .checkbox-grid {
                    display: grid;
                    grid-template-columns: repeat(auto-fit, minmax(150px, 1fr));
                    gap: 10px;
                    margin-top: 10px;
                }
            </style>
        </head>
        <body>
            <h1>🤖 自动补全控制面板</h1>
            
            <div class="control-section">
                <h2>状态 <span id="statusBadge" class="status-badge status-stopped">已停止</span></h2>
                <div class="button-group">
                    <button id="startBtn" class="primary" onclick="startCompletion()">
                        ▶ 启动自动补全
                    </button>
                    <button id="stopBtn" class="danger" onclick="stopCompletion()" disabled>
                        ⏸ 停止自动补全
                    </button>
                    <button onclick="triggerOnce()">
                        ⚡ 触发一次补全
                    </button>
                </div>
            </div>

            <div class="control-section">
                <h2>📊 统计数据</h2>
                <div class="stats-grid">
                    <div class="stat-card">
                        <div id="dailyCount" class="stat-value">0</div>
                        <div class="stat-label">今日补全次数</div>
                    </div>
                    <div class="stat-card">
                        <div id="totalCount" class="stat-value">0</div>
                        <div class="stat-label">总补全次数</div>
                    </div>
                    <div class="stat-card">
                        <div id="lastTime" class="stat-value">--</div>
                        <div class="stat-label">最后补全时间</div>
                    </div>
                </div>
                <div class="button-group">
                    <button onclick="showStats()">📈 查看详细统计</button>
                    <button onclick="resetStats()">🔄 重置统计数据</button>
                </div>
            </div>

            <div class="control-section">
                <h2>⚙️ 基础设置</h2>
                <div class="settings-form">
                    <div class="form-group">
                        <div class="checkbox-group">
                            <input type="checkbox" id="enabledSetting" ${currentSettings.enabled ? 'checked' : ''} onchange="updateSettings()">
                            <label for="enabledSetting">启动时自动开始</label>
                        </div>
                    </div>
                    <div class="form-group">
                        <label for="intervalSetting">补全间隔（毫秒）</label>
                        <input type="number" id="intervalSetting" min="15000" value="${currentSettings.interval}" onchange="updateSettings()">
                        <div class="info-text">设置每次AI补全循环之间的时间间隔</div>
                    </div>
                    <div class="form-group">
                        <label for="maxDailySetting">每日最大补全次数</label>
                        <input type="number" id="maxDailySetting" min="1" value="${currentSettings.maxCompletionsPerDay}" onchange="updateSettings()">
                        <div class="info-text">限制每天的最大补全次数</div>
                    </div>
                    <div class="form-group">
                        <label for="aiWaitSetting">AI等待时间（毫秒）</label>
                        <input type="number" id="aiWaitSetting" min="2000" max="15000" value="${currentSettings.aiWaitTime}" onchange="updateSettings()">
                        <div class="info-text">等待AI建议出现的时间</div>
                    </div>
                </div>
            </div>

            <div class="control-section">
                <h2>🎯 补全策略设置</h2>
                <div class="settings-form">
                    <div class="form-group">
                        <label for="completionStrategy">选择补全策略</label>
                        <select id="completionStrategy" onchange="updateStrategySettings()">
                            <option value="fixed" ${currentSettings.completionStrategy === 'fixed' ? 'selected' : ''}>固定间隔</option>
                            <option value="timeSlot" ${currentSettings.completionStrategy === 'timeSlot' ? 'selected' : ''}>时间段策略</option>
                            <option value="workday" ${currentSettings.completionStrategy === 'workday' ? 'selected' : ''}>工作日策略</option>
                            <option value="activity" ${currentSettings.completionStrategy === 'activity' ? 'selected' : ''}>活跃度策略</option>
                            <option value="projectType" ${currentSettings.completionStrategy === 'projectType' ? 'selected' : ''}>项目类型策略</option>
                            <option value="composite" ${currentSettings.completionStrategy === 'composite' ? 'selected' : ''}>组合策略</option>
                        </select>
                        <div class="info-text">选择不同的触发策略来控制补全的时机和频率</div>
                    </div>

                    <div id="strategyConfigPanel" style="margin-top: 15px; padding: 15px; background: var(--vscode-editor-inactiveSelectionBackground); border-radius: 4px;">
                        <!-- 动态策略配置区域 -->
                    </div>

                    <div class="form-group" style="margin-top: 20px;">
                        <div style="
                            display: flex;
                            gap: 12px;
                            flex-wrap: wrap;
                        ">
                            <button class="button" onclick="applyStrategyTemplate()" style="
                                flex: 1;
                                min-width: 140px;
                                padding: 10px 16px;
                                background: linear-gradient(135deg, var(--vscode-button-background), var(--vscode-button-hoverBackground));
                                color: var(--vscode-button-foreground);
                                border: none;
                                border-radius: 6px;
                                cursor: pointer;
                                font-size: 14px;
                                font-weight: 500;
                                display: flex;
                                align-items: center;
                                justify-content: center;
                                gap: 8px;
                                transition: all 0.3s;
                                box-shadow: 0 2px 8px rgba(0, 0, 0, 0.1);
                            " onmouseover="
                                this.style.transform = 'translateY(-2px)';
                                this.style.boxShadow = '0 4px 12px rgba(0, 0, 0, 0.15)';
                            " onmouseout="
                                this.style.transform = 'translateY(0)';
                                this.style.boxShadow = '0 2px 8px rgba(0, 0, 0, 0.1)';
                            ">
                                <span style="font-size: 16px;">✨</span>
                                应用预设模板
                            </button>
                            <button class="button" onclick="showStrategyHelp()" style="
                                flex: 1;
                                min-width: 140px;
                                padding: 10px 16px;
                                background: transparent;
                                color: var(--vscode-button-foreground);
                                border: 1px solid var(--vscode-button-background);
                                border-radius: 6px;
                                cursor: pointer;
                                font-size: 14px;
                                font-weight: 500;
                                display: flex;
                                align-items: center;
                                justify-content: center;
                                gap: 8px;
                                transition: all 0.3s;
                            " onmouseover="
                                this.style.background = 'var(--vscode-button-background)';
                                this.style.transform = 'translateY(-2px)';
                                this.style.boxShadow = '0 4px 12px rgba(0, 0, 0, 0.15)';
                            " onmouseout="
                                this.style.background = 'transparent';
                                this.style.transform = 'translateY(0)';
                                this.style.boxShadow = 'none';
                            ">
                                <span style="font-size: 16px;">💡</span>
                                策略说明
                            </button>
                        </div>
                    </div>
                </div>
            </div>

            <div class="control-section">
                <h2>🔧 高级设置</h2>
                <div class="settings-form">
                    <div class="form-group">
                        <div class="checkbox-group">
                            <input type="checkbox" id="autoCreateFiles" ${currentSettings.autoCreateFiles ? 'checked' : ''} onchange="updateSettings()">
                            <label for="autoCreateFiles">自动创建测试文件</label>
                        </div>
                    </div>
                    <div class="form-group">
                        <div class="checkbox-group">
                            <input type="checkbox" id="avoidVSCodeSuggestions" ${currentSettings.avoidVSCodeSuggestions ? 'checked' : ''} onchange="updateSettings()">
                            <label for="avoidVSCodeSuggestions">避免触发VSCode内置建议</label>
                        </div>
                    </div>
                    <div class="form-group">
                        <div class="checkbox-group">
                            <input type="checkbox" id="autoFocusOnCompletion" ${currentSettings.autoFocusOnCompletion ? 'checked' : ''} onchange="updateSettings()">
                            <label for="autoFocusOnCompletion">补全时自动切换到补全页面</label>
                        </div>
                        <div class="info-text">默认关闭，在后台静默执行补全，不干扰当前工作</div>
                    </div>
                    <div class="form-group">
                        <div class="checkbox-group">
                            <input type="checkbox" id="useCodeSnippets" ${currentSettings.useCodeSnippets ? 'checked' : ''} onchange="updateSettings()">
                            <label for="useCodeSnippets">使用代码片段触发AI补全</label>
                        </div>
                    </div>
                    <div class="form-group">
                        <label for="snippetMaxLines">代码片段最大行数</label>
                        <input type="number" id="snippetMaxLines" min="10" max="2000" value="${currentSettings.snippetMaxLines}" onchange="updateSettings()">
                        <div class="info-text">每个代码片段使用的最大行数（10-2000行）</div>
                    </div>
                    <div class="form-group">
                        <div class="checkbox-group">
                            <input type="checkbox" id="enableProjectCodeDetection" ${currentSettings.enableProjectCodeDetection ? 'checked' : ''} onchange="updateSettings()">
                            <label for="enableProjectCodeDetection">启用项目代码检测</label>
                        </div>
                    </div>
                    <div class="form-group">
                        <label for="maxRetryAttempts">最大重试次数</label>
                        <input type="number" id="maxRetryAttempts" min="1" max="10" value="${currentSettings.maxRetryAttempts}" onchange="updateSettings()">
                        <div class="info-text">AI建议未检测到或重复时的最大重试次数</div>
                    </div>
                    <div class="form-group">
                        <label for="projectCodeMaxFiles">扫描项目文件数量</label>
                        <input type="number" id="projectCodeMaxFiles" min="10" max="200" value="${currentSettings.projectCodeMaxFiles}" onchange="updateSettings()">
                        <div class="info-text">扫描项目代码片段的最大文件数</div>
                    </div>
                    <div class="form-group">
                        <label for="projectCodeMaxFileSize">文件大小限制（字节）</label>
                        <input type="number" id="projectCodeMaxFileSize" min="10240" max="204800" value="${currentSettings.projectCodeMaxFileSize}" onchange="updateSettings()">
                        <div class="info-text">扫描项目代码片段的最大文件大小</div>
                    </div>
                </div>
            </div>
            
            <div class="control-section">
                <h2>🎯 自定义代码片段</h2>
                <div class="settings-form">
                    <div class="form-group">
                        <div class="checkbox-group">
                            <input type="checkbox" id="enableCustomSnippets" ${currentSettings.enableCustomSnippets ? 'checked' : ''} onchange="updateSettings()">
                            <label for="enableCustomSnippets">启用自定义代码片段</label>
                        </div>
                    </div>
                    <div class="form-group">
                        <label for="customSnippetPriority">代码片段优先级</label>
                        <select id="customSnippetPriority" onchange="updateSettings()">
                            <option value="custom-first" ${currentSettings.customSnippetPriority === 'custom-first' ? 'selected' : ''}>优先使用自定义</option>
                            <option value="builtin-first" ${currentSettings.customSnippetPriority === 'builtin-first' ? 'selected' : ''}>优先使用内置</option>
                            <option value="custom-only" ${currentSettings.customSnippetPriority === 'custom-only' ? 'selected' : ''}>仅使用自定义</option>
                            <option value="builtin-only" ${currentSettings.customSnippetPriority === 'builtin-only' ? 'selected' : ''}>仅使用内置</option>
                        </select>
                        <div class="info-text">选择自定义和内置代码片段的使用优先级</div>
                    </div>
                    <div class="form-group">
                        <label for="customSnippetDirectories">自定义片段目录</label>
                        <textarea id="customSnippetDirectories" rows="3" onchange="updateSettings()" placeholder="每行一个目录路径">${currentSettings.customSnippetDirectories.join("\\n")}</textarea>
                        <div class="info-text">指定加载代码片段的自定义目录（支持相对和绝对路径）</div>
                    </div>
                </div>
            </div>
            
            <div class="control-section">
                <h2>💬 支持的编程语言</h2>
                <div class="settings-form">
                    <div class="form-group">
                        <label>选择支持的编程语言：</label>
                        <div class="checkbox-grid">
                            <div class="checkbox-group">
                                <input type="checkbox" id="lang-javascript" value="javascript" ${currentSettings.supportedLanguages.includes("javascript") ? "checked" : ""} onchange="updateLanguages()">
                                <label for="lang-javascript">JavaScript</label>
                            </div>
                            <div class="checkbox-group">
                                <input type="checkbox" id="lang-typescript" value="typescript" ${currentSettings.supportedLanguages.includes("typescript") ? "checked" : ""} onchange="updateLanguages()">
                                <label for="lang-typescript">TypeScript</label>
                            </div>
                            <div class="checkbox-group">
                                <input type="checkbox" id="lang-python" value="python" ${currentSettings.supportedLanguages.includes("python") ? "checked" : ""} onchange="updateLanguages()">
                                <label for="lang-python">Python</label>
                            </div>
                            <div class="checkbox-group">
                                <input type="checkbox" id="lang-java" value="java" ${currentSettings.supportedLanguages.includes("java") ? "checked" : ""} onchange="updateLanguages()">
                                <label for="lang-java">Java</label>
                            </div>
                            <div class="checkbox-group">
                                <input type="checkbox" id="lang-csharp" value="csharp" ${currentSettings.supportedLanguages.includes("csharp") ? "checked" : ""} onchange="updateLanguages()">
                                <label for="lang-csharp">C#</label>
                            </div>
                            <div class="checkbox-group">
                                <input type="checkbox" id="lang-cpp" value="cpp" ${currentSettings.supportedLanguages.includes("cpp") ? "checked" : ""} onchange="updateLanguages()">
                                <label for="lang-cpp">C++</label>
                            </div>
                            <div class="checkbox-group">
                                <input type="checkbox" id="lang-go" value="go" ${currentSettings.supportedLanguages.includes("go") ? "checked" : ""} onchange="updateLanguages()">
                                <label for="lang-go">Go</label>
                            </div>
                            <div class="checkbox-group">
                                <input type="checkbox" id="lang-rust" value="rust" ${currentSettings.supportedLanguages.includes("rust") ? "checked" : ""} onchange="updateLanguages()">
                                <label for="lang-rust">Rust</label>
                            </div>
                            <div class="checkbox-group">
                                <input type="checkbox" id="lang-php" value="php" ${currentSettings.supportedLanguages.includes("php") ? "checked" : ""} onchange="updateLanguages()">
                                <label for="lang-php">PHP</label>
                            </div>
                            <div class="checkbox-group">
                                <input type="checkbox" id="lang-kotlin" value="kotlin" ${currentSettings.supportedLanguages.includes("kotlin") ? "checked" : ""} onchange="updateLanguages()">
                                <label for="lang-kotlin">Kotlin</label>
                            </div>
                        </div>
                    </div>
                </div>
            </div>

            <script>
                const vscode = acquireVsCodeApi();
                let isRunning = false;
                
                // 添加错误处理和重试机制
                let retryCount = 0;
                const maxRetries = 3;
                
                function sendMessage(message) {
                    try {
                        vscode.postMessage(message);
                        retryCount = 0;
                    } catch (error) {
                        console.error('发送消息失败:', error);
                        if (retryCount < maxRetries) {
                            retryCount++;
                            setTimeout(() => sendMessage(message), 1000 * retryCount);
                        }
                    }
                }

                // 将所有函数定义为全局函数，确保HTML onclick可以访问
                function startCompletion() {
                    sendMessage({ command: 'start' });
                }

                function stopCompletion() {
                    sendMessage({ command: 'stop' });
                }

                function triggerOnce() {
                    sendMessage({ command: 'triggerOnce' });
                }

                function showStats() {
                    sendMessage({ command: 'showStats' });
                }

                function resetStats() {
                    // 使用VSCode的消息API替代confirm
                    sendMessage({ command: 'resetStats' });
                }

                function updateSettings() {
                    const settings = {
                        // 基础设置
                        enabled: document.getElementById('enabledSetting').checked,
                        interval: parseInt(document.getElementById('intervalSetting').value),
                        maxCompletionsPerDay: parseInt(document.getElementById('maxDailySetting').value),
                        aiWaitTime: parseInt(document.getElementById('aiWaitSetting').value),
                        // 高级设置
                        autoCreateFiles: document.getElementById('autoCreateFiles').checked,
                        avoidVSCodeSuggestions: document.getElementById('avoidVSCodeSuggestions').checked,
                        useCodeSnippets: document.getElementById('useCodeSnippets').checked,
                        snippetMaxLines: parseInt(document.getElementById('snippetMaxLines').value),
                        enableProjectCodeDetection: document.getElementById('enableProjectCodeDetection').checked,
                        maxRetryAttempts: parseInt(document.getElementById('maxRetryAttempts').value),
                        projectCodeMaxFiles: parseInt(document.getElementById('projectCodeMaxFiles').value),
                        projectCodeMaxFileSize: parseInt(document.getElementById('projectCodeMaxFileSize').value),
                        // 自定义代码片段
                        enableCustomSnippets: document.getElementById('enableCustomSnippets').checked,
                        customSnippetPriority: document.getElementById('customSnippetPriority').value,
                        customSnippetDirectories: document.getElementById('customSnippetDirectories').value.split("\\n").filter(dir => dir.trim()),
                        autoFocusOnCompletion: document.getElementById('autoFocusOnCompletion').checked,
                        // 策略设置
                        completionStrategy: document.getElementById('completionStrategy').value,
                        strategyConfig: getStrategyConfig()
                    };
                    sendMessage({ command: 'updateSettings', settings });
                }

                function updateStrategySettings() {
                    const strategy = document.getElementById('completionStrategy').value;
                    updateStrategyConfigPanel(strategy);
                    updateSettings();
                }

                function getStrategyConfig() {
                    const strategy = document.getElementById('completionStrategy').value;
                    const config = {};

                    // 根据不同策略获取配置
                    if (strategy === 'timeSlot') {
                        const timeSlots = [];
                        document.querySelectorAll('.time-slot-item').forEach(item => {
                            timeSlots.push({
                                start: item.querySelector('.slot-start').value,
                                end: item.querySelector('.slot-end').value,
                                interval: parseInt(item.querySelector('.slot-interval').value),
                                description: item.querySelector('.slot-desc').value
                            });
                        });
                        config.timeSlots = timeSlots;
                        config.defaultInterval = parseInt(document.getElementById('timeSlotDefaultInterval')?.value || 30000);
                    } else if (strategy === 'workday') {
                        config.workdays = {
                            interval: parseInt(document.getElementById('workdayInterval')?.value || 5000),
                            enabled: document.getElementById('workdayEnabled')?.checked ?? true
                        };
                        config.weekends = {
                            interval: parseInt(document.getElementById('weekendInterval')?.value || 30000),
                            enabled: document.getElementById('weekendEnabled')?.checked ?? false
                        };
                    } else if (strategy === 'activity') {
                        config.activeInterval = parseInt(document.getElementById('activeInterval')?.value || 3000);
                        config.inactiveInterval = parseInt(document.getElementById('inactiveInterval')?.value || 30000);
                        config.inactiveThreshold = parseInt(document.getElementById('inactiveThreshold')?.value || 60000);
                    } else if (strategy === 'projectType') {
                        config.defaultInterval = parseInt(document.getElementById('projectTypeDefaultInterval')?.value || 5000);
                        config.projectTypes = {};
                        document.querySelectorAll('.project-type-item').forEach(item => {
                            const type = item.getAttribute('data-type');
                            const patterns = item.querySelector('.type-patterns').value.split(',').map(p => p.trim()).filter(p => p);
                            const interval = parseInt(item.querySelector('.type-interval').value);
                            if (type && patterns.length > 0) {
                                config.projectTypes[type] = {
                                    patterns: patterns,
                                    interval: interval
                                };
                            }
                        });
                    } else if (strategy === 'composite') {
                        config.mode = document.getElementById('compositeMode')?.value || 'priority';
                        config.strategies = [];
                        document.querySelectorAll('.composite-strategy:checked').forEach(checkbox => {
                            config.strategies.push(checkbox.value);
                        });
                        // 获取优先级顺序
                        const priorityItems = document.querySelectorAll('.priority-item');
                        if (priorityItems.length > 0) {
                            config.priority = [];
                            priorityItems.forEach(item => {
                                config.priority.push(item.getAttribute('data-strategy'));
                            });
                        } else {
                            config.priority = config.strategies;
                        }
                    }

                    return config;
                }

                function updateStrategyConfigPanel(strategy) {
                    const panel = document.getElementById('strategyConfigPanel');
                    let html = '';

                    switch (strategy) {
                        case 'timeSlot':
                            html = \`
                                <h4>时间段配置</h4>
                                <div id="timeSlotsContainer">
                                    <div class="time-slot-item">
                                        <input type="time" class="slot-start" value="09:00">
                                        <span> 至 </span>
                                        <input type="time" class="slot-end" value="12:00">
                                        <input type="number" class="slot-interval" value="3000" min="1000" style="width: 80px;">
                                        <span>ms</span>
                                        <input type="text" class="slot-desc" placeholder="描述" value="上午工作">
                                    </div>
                                    <div class="time-slot-item">
                                        <input type="time" class="slot-start" value="14:00">
                                        <span> 至 </span>
                                        <input type="time" class="slot-end" value="18:00">
                                        <input type="number" class="slot-interval" value="5000" min="1000" style="width: 80px;">
                                        <span>ms</span>
                                        <input type="text" class="slot-desc" placeholder="描述" value="下午工作">
                                    </div>
                                </div>
                                <div style="margin-top: 10px;">
                                    <label>默认间隔: </label>
                                    <input type="number" id="timeSlotDefaultInterval" value="30000" min="1000" style="width: 100px;">
                                    <span>ms</span>
                                </div>
                            \`;
                            break;

                        case 'workday':
                            html = \`
                                <h4>工作日/周末配置</h4>
                                <div style="margin-bottom: 10px;">
                                    <label>工作日 (周一至周五)</label>
                                    <div style="margin-left: 20px;">
                                        <input type="checkbox" id="workdayEnabled" checked> 启用
                                        <br>
                                        间隔: <input type="number" id="workdayInterval" value="5000" min="1000" style="width: 80px;"> ms
                                    </div>
                                </div>
                                <div>
                                    <label>周末 (周六、周日)</label>
                                    <div style="margin-left: 20px;">
                                        <input type="checkbox" id="weekendEnabled"> 启用
                                        <br>
                                        间隔: <input type="number" id="weekendInterval" value="30000" min="1000" style="width: 80px;"> ms
                                    </div>
                                </div>
                            \`;
                            break;

                        case 'activity':
                            html = \`
                                <h4>活跃度配置</h4>
                                <div>
                                    <label>活跃时间隔: </label>
                                    <input type="number" id="activeInterval" value="3000" min="1000" style="width: 80px;">
                                    <span>ms</span>
                                </div>
                                <div style="margin-top: 10px;">
                                    <label>非活跃间隔: </label>
                                    <input type="number" id="inactiveInterval" value="30000" min="1000" style="width: 80px;">
                                    <span>ms</span>
                                </div>
                                <div style="margin-top: 10px;">
                                    <label>非活跃阈值: </label>
                                    <input type="number" id="inactiveThreshold" value="60000" min="10000" style="width: 80px;">
                                    <span>ms</span>
                                </div>
                            \`;
                            break;

                        case 'projectType':
                            html = \`
                                <h4>项目类型策略配置</h4>
                                <div style="margin-bottom: 15px;">
                                    <label>默认间隔: </label>
                                    <input type="number" id="projectTypeDefaultInterval" value="5000" min="1000" style="width: 100px;">
                                    <span>ms</span>
                                </div>
                                <div id="projectTypesContainer">
                                    <h5>文件类型配置</h5>
                                    <div class="project-type-item" data-type="frontend">
                                        <label style="width: 100px; display: inline-block;">前端项目:</label>
                                        <input type="number" class="type-interval" value="3000" min="1000" style="width: 80px;">
                                        <span>ms</span>
                                        <input type="text" class="type-patterns" value="*.jsx,*.tsx,*.vue,*.html,*.css" style="width: 200px; margin-left: 10px;" placeholder="文件模式">
                                    </div>
                                    <div class="project-type-item" data-type="backend">
                                        <label style="width: 100px; display: inline-block;">后端项目:</label>
                                        <input type="number" class="type-interval" value="5000" min="1000" style="width: 80px;">
                                        <span>ms</span>
                                        <input type="text" class="type-patterns" value="*.java,*.py,*.go,*.rs,*.php" style="width: 200px; margin-left: 10px;" placeholder="文件模式">
                                    </div>
                                    <div class="project-type-item" data-type="config">
                                        <label style="width: 100px; display: inline-block;">配置文件:</label>
                                        <input type="number" class="type-interval" value="10000" min="1000" style="width: 80px;">
                                        <span>ms</span>
                                        <input type="text" class="type-patterns" value="*.json,*.yaml,*.yml,*.xml" style="width: 200px; margin-left: 10px;" placeholder="文件模式">
                                    </div>
                                    <div class="project-type-item" data-type="test">
                                        <label style="width: 100px; display: inline-block;">测试文件:</label>
                                        <input type="number" class="type-interval" value="8000" min="1000" style="width: 80px;">
                                        <span>ms</span>
                                        <input type="text" class="type-patterns" value="*.test.*,*.spec.*" style="width: 200px; margin-left: 10px;" placeholder="文件模式">
                                    </div>
                                    <div class="project-type-item" data-type="documentation">
                                        <label style="width: 100px; display: inline-block;">文档:</label>
                                        <input type="number" class="type-interval" value="15000" min="1000" style="width: 80px;">
                                        <span>ms</span>
                                        <input type="text" class="type-patterns" value="*.md,*.mdx,*.rst,*.txt" style="width: 200px; margin-left: 10px;" placeholder="文件模式">
                                    </div>
                                </div>
                                <div style="margin-top: 10px; font-size: 11px; color: var(--vscode-descriptionForeground);">
                                    提示：文件模式使用逗号分隔，支持通配符 * 和 ?
                                </div>
                            \`;
                            break;

                        case 'composite':
                            html = \`
                                <h4>组合策略配置</h4>
                                <div style="margin-bottom: 15px;">
                                    <label>组合模式: </label>
                                    <select id="compositeMode" onchange="updateSettings()" style="width: 200px;">
                                        <option value="priority">优先级模式</option>
                                        <option value="union">并集模式（最激进）</option>
                                        <option value="intersection">交集模式（最保守）</option>
                                    </select>
                                    <div style="font-size: 11px; color: var(--vscode-descriptionForeground); margin-top: 5px;">
                                        <div id="compositeModeDesc">优先级模式：按优先级顺序选择第一个可用的策略</div>
                                    </div>
                                </div>
                                <div style="margin-bottom: 15px;">
                                    <h5>选择要组合的策略</h5>
                                    <div style="display: grid; grid-template-columns: 1fr 1fr; gap: 10px;">
                                        <label style="display: flex; align-items: center;">
                                            <input type="checkbox" class="composite-strategy" value="timeSlot" onchange="updateCompositeStrategies()">
                                            <span style="margin-left: 5px;">时间段策略</span>
                                        </label>
                                        <label style="display: flex; align-items: center;">
                                            <input type="checkbox" class="composite-strategy" value="workday" onchange="updateCompositeStrategies()">
                                            <span style="margin-left: 5px;">工作日策略</span>
                                        </label>
                                        <label style="display: flex; align-items: center;">
                                            <input type="checkbox" class="composite-strategy" value="activity" onchange="updateCompositeStrategies()">
                                            <span style="margin-left: 5px;">活跃度策略</span>
                                        </label>
                                        <label style="display: flex; align-items: center;">
                                            <input type="checkbox" class="composite-strategy" value="projectType" onchange="updateCompositeStrategies()">
                                            <span style="margin-left: 5px;">项目类型策略</span>
                                        </label>
                                    </div>
                                </div>
                                <div id="compositePrioritySection" style="margin-bottom: 15px;">
                                    <h5>策略优先级（拖动排序）</h5>
                                    <div id="compositePriorityList" style="border: 1px solid var(--vscode-panel-border); border-radius: 4px; padding: 10px; min-height: 50px;">
                                        <div style="color: var(--vscode-descriptionForeground); font-size: 12px;">请先选择要组合的策略</div>
                                    </div>
                                </div>
                                <div style="margin-top: 10px; padding: 10px; background: var(--vscode-textBlockQuote-background); border-radius: 4px;">
                                    <div style="font-size: 12px; color: var(--vscode-descriptionForeground);">
                                        <strong>示例配置：</strong><br>
                                        • 工作时间高效模式：组合时间段+活跃度，使用并集模式<br>
                                        • 智能适应模式：组合项目类型+活跃度，使用优先级模式<br>
                                        • 严格控制模式：组合工作日+时间段，使用交集模式
                                    </div>
                                </div>
                            \`;
                            break;

                        default:
                            html = '<h4>固定间隔策略</h4><p>使用上方设置的固定间隔时间</p>';
                    }

                    panel.innerHTML = html;
                }

                function applyStrategyTemplate() {
                    const templates = {
                        '高效工作模式': {
                            strategy: 'timeSlot',
                            config: {
                                timeSlots: [
                                    { start: '09:00', end: '12:00', interval: 3000, description: '上午高效' },
                                    { start: '14:00', end: '17:00', interval: 3000, description: '下午高效' },
                                    { start: '19:00', end: '21:00', interval: 5000, description: '晚间编码' }
                                ],
                                defaultInterval: 60000
                            }
                        },
                        '智能活跃模式': {
                            strategy: 'activity',
                            config: {
                                activeInterval: 2000,
                                inactiveInterval: 30000,
                                inactiveThreshold: 60000
                            }
                        },
                        '工作日模式': {
                            strategy: 'workday',
                            config: {
                                workdays: { interval: 5000, enabled: true },
                                weekends: { interval: 60000, enabled: false }
                            }
                        }
                    };

                    // 使用自定义选择器替代prompt
                    showTemplateSelector(templates);
                }

                function showStrategyHelp() {
                    // 使用自定义提示框替代alert
                    showHelpDialog(\`策略说明：
- 固定间隔：使用固定的时间间隔触发补全
- 时间段策略：根据一天中不同时间段设置不同间隔
- 工作日策略：工作日和周末使用不同的补全频率
- 活跃度策略：根据您的编码活跃度动态调整
- 项目类型策略：根据编辑的文件类型自动调整
- 组合策略：可以组合多个策略使用\`);
                }

                function updateLanguages() {
                    const languages = [];
                    const checkboxes = document.querySelectorAll('[id^="lang-"]:checked');
                    checkboxes.forEach(cb => {
                        languages.push(cb.value);
                    });
                    sendMessage({ 
                        command: 'updateSettings', 
                        settings: { supportedLanguages: languages }
                    });
                }

                function updateUI(data) {
                    isRunning = data.isRunning;
                    
                    // 更新状态徽章
                    const badge = document.getElementById('statusBadge');
                    if (isRunning) {
                        badge.textContent = '运行中';
                        badge.className = 'status-badge status-running';
                        document.getElementById('startBtn').disabled = true;
                        document.getElementById('stopBtn').disabled = false;
                    } else {
                        badge.textContent = '已停止';
                        badge.className = 'status-badge status-stopped';
                        document.getElementById('startBtn').disabled = false;
                        document.getElementById('stopBtn').disabled = true;
                    }

                    // 更新统计
                    document.getElementById('dailyCount').textContent = data.stats.dailyCount;
                    document.getElementById('totalCount').textContent = data.stats.totalCount;
                    
                    const lastTime = data.stats.lastCompletionTime;
                    if (lastTime) {
                        const date = new Date(lastTime);
                        const dateStr = date.toLocaleDateString('zh-CN');
                        const timeStr = date.toLocaleTimeString('zh-CN');
                        document.getElementById('lastTime').textContent = timeStr;
                        document.getElementById('lastTime').title = dateStr + ' ' + timeStr;
                    } else {
                        document.getElementById('lastTime').textContent = '--';
                    }

                    // 更新基础设置
                    document.getElementById('enabledSetting').checked = data.settings.enabled;
                    document.getElementById('intervalSetting').value = data.settings.interval;
                    document.getElementById('maxDailySetting').value = data.settings.maxCompletionsPerDay;
                    document.getElementById('aiWaitSetting').value = data.settings.aiWaitTime;
                    
                    // 更新高级设置
                    document.getElementById('autoCreateFiles').checked = data.settings.autoCreateFiles;
                    document.getElementById('avoidVSCodeSuggestions').checked = data.settings.avoidVSCodeSuggestions;
                    document.getElementById('useCodeSnippets').checked = data.settings.useCodeSnippets;
                    document.getElementById('snippetMaxLines').value = data.settings.snippetMaxLines;
                    document.getElementById('enableProjectCodeDetection').checked = data.settings.enableProjectCodeDetection;
                    document.getElementById('maxRetryAttempts').value = data.settings.maxRetryAttempts;
                    document.getElementById('projectCodeMaxFiles').value = data.settings.projectCodeMaxFiles;
                    document.getElementById('projectCodeMaxFileSize').value = data.settings.projectCodeMaxFileSize;
                    
                    // 更新自定义代码片段设置
                    document.getElementById('enableCustomSnippets').checked = data.settings.enableCustomSnippets;
                    document.getElementById('customSnippetPriority').value = data.settings.customSnippetPriority;
                    document.getElementById('customSnippetDirectories').value = (data.settings.customSnippetDirectories || []).join("\\n");
                    document.getElementById('autoFocusOnCompletion').checked = data.settings.autoFocusOnCompletion || false;
                    
                    // 更新支持的语言
                    const supportedLangs = data.settings.supportedLanguages || [];
                    document.querySelectorAll('[id^="lang-"]').forEach(cb => {
                        cb.checked = supportedLangs.includes(cb.value);
                    });
                }

                // 监听来自扩展的消息
                window.addEventListener('message', event => {
                    const message = event.data;
                    if (message.command === 'updateStatus') {
                        updateUI(message.data);
                    }
                });

                // 初始化获取状态
                sendMessage({ command: 'getStatus' });

                // 自定义对话框实现 - 美化版
                function showHelpDialog(message) {
                    // 移除已存在的对话框
                    const existingDialog = document.getElementById('customDialog');
                    const existingOverlay = document.getElementById('dialogOverlay');
                    if (existingDialog) existingDialog.remove();
                    if (existingOverlay) existingOverlay.remove();

                    // 创建遮罩层
                    const overlay = document.createElement('div');
                    overlay.id = 'dialogOverlay';
                    overlay.style.cssText = \`
                        position: fixed;
                        top: 0;
                        left: 0;
                        right: 0;
                        bottom: 0;
                        background: rgba(0, 0, 0, 0.5);
                        backdrop-filter: blur(2px);
                        z-index: 9999;
                        animation: fadeIn 0.2s ease-in;
                    \`;

                    const dialog = document.createElement('div');
                    dialog.id = 'customDialog';
                    dialog.style.cssText = \`
                        position: fixed;
                        top: 50%;
                        left: 50%;
                        transform: translate(-50%, -50%);
                        background: var(--vscode-editor-background);
                        border: 1px solid var(--vscode-panel-border);
                        border-radius: 12px;
                        overflow: hidden;
                        max-width: 520px;
                        min-width: 420px;
                        z-index: 10000;
                        box-shadow: 0 12px 40px rgba(0, 0, 0, 0.35);
                        animation: slideIn 0.3s cubic-bezier(0.34, 1.56, 0.64, 1);
                    \`;

                    dialog.innerHTML = \`
                        <div style="
                            padding: 24px 28px 20px;
                            border-bottom: 1px solid var(--vscode-panel-border);
                            background: var(--vscode-editor-background);
                        ">
                            <h3 style="
                                margin: 0;
                                font-size: 18px;
                                font-weight: 600;
                                color: var(--vscode-editor-foreground);
                                display: flex;
                                align-items: center;
                                gap: 10px;
                            ">
                                <span style="font-size: 20px;">💡</span>
                                策略说明
                            </h3>
                        </div>
                        <div style="
                            padding: 24px 28px;
                            white-space: pre-line;
                            line-height: 1.7;
                            color: var(--vscode-editor-foreground);
                            font-size: 14px;
                            max-height: 400px;
                            overflow-y: auto;
                        ">\${message}</div>
                        <div style="
                            padding: 20px 28px;
                            border-top: 1px solid var(--vscode-panel-border);
                            text-align: right;
                            background: var(--vscode-editorWidget-background);
                        ">
                            <button onclick="
                                document.getElementById('customDialog').style.animation = 'slideOut 0.2s ease-in';
                                document.getElementById('dialogOverlay').style.animation = 'fadeOut 0.2s ease-out';
                                setTimeout(() => {
                                    document.getElementById('customDialog')?.remove();
                                    document.getElementById('dialogOverlay')?.remove();
                                }, 180);
                            " style="
                                padding: 10px 24px;
                                background: var(--vscode-button-background);
                                color: var(--vscode-button-foreground);
                                border: none;
                                border-radius: 6px;
                                cursor: pointer;
                                font-size: 14px;
                                font-weight: 500;
                                transition: all 0.2s;
                                box-shadow: 0 2px 8px rgba(0, 0, 0, 0.15);
                            " onmouseover="
                                this.style.transform = 'translateY(-1px)';
                                this.style.boxShadow = '0 4px 12px rgba(0, 0, 0, 0.2)';
                            " onmouseout="
                                this.style.transform = 'translateY(0)';
                                this.style.boxShadow = '0 2px 8px rgba(0, 0, 0, 0.15)';
                            ">
                                知道了
                            </button>
                        </div>
                    \`;

                    // 添加动画样式
                    if (!document.getElementById('dialogAnimations')) {
                        const style = document.createElement('style');
                        style.id = 'dialogAnimations';
                        style.textContent = \`
                            @keyframes fadeIn {
                                from { opacity: 0; }
                                to { opacity: 1; }
                            }
                            @keyframes fadeOut {
                                from { opacity: 1; }
                                to { opacity: 0; }
                            }
                            @keyframes slideIn {
                                from {
                                    opacity: 0;
                                    transform: translate(-50%, -45%) scale(0.95);
                                }
                                to {
                                    opacity: 1;
                                    transform: translate(-50%, -50%) scale(1);
                                }
                            }
                            @keyframes slideOut {
                                from {
                                    opacity: 1;
                                    transform: translate(-50%, -50%) scale(1);
                                }
                                to {
                                    opacity: 0;
                                    transform: translate(-50%, -52%) scale(0.95);
                                }
                            }
                        \`;
                        document.head.appendChild(style);
                    }

                    document.body.appendChild(overlay);
                    document.body.appendChild(dialog);

                    // 点击遮罩层关闭
                    overlay.onclick = () => {
                        dialog.style.animation = 'slideOut 0.2s ease-in';
                        overlay.style.animation = 'fadeOut 0.2s ease-out';
                        setTimeout(() => {
                            dialog.remove();
                            overlay.remove();
                        }, 180);
                    };
                }

                function showTemplateSelector(templates) {
                    // 移除已存在的选择器
                    const existingDialog = document.getElementById('templateSelector');
                    const existingOverlay = document.getElementById('selectorOverlay');
                    if (existingDialog) existingDialog.remove();
                    if (existingOverlay) existingOverlay.remove();

                    // 创建遮罩层
                    const overlay = document.createElement('div');
                    overlay.id = 'selectorOverlay';
                    overlay.style.cssText = \`
                        position: fixed;
                        top: 0;
                        left: 0;
                        right: 0;
                        bottom: 0;
                        background: rgba(0, 0, 0, 0.5);
                        backdrop-filter: blur(2px);
                        z-index: 9999;
                        animation: fadeIn 0.2s ease-in;
                    \`;

                    const selector = document.createElement('div');
                    selector.id = 'templateSelector';
                    selector.style.cssText = \`
                        position: fixed;
                        top: 50%;
                        left: 50%;
                        transform: translate(-50%, -50%);
                        background: var(--vscode-editor-background);
                        border: 1px solid var(--vscode-panel-border);
                        border-radius: 12px;
                        overflow: hidden;
                        max-width: 480px;
                        min-width: 420px;
                        z-index: 10000;
                        box-shadow: 0 12px 40px rgba(0, 0, 0, 0.35);
                        animation: slideIn 0.3s cubic-bezier(0.34, 1.56, 0.64, 1);
                    \`;

                    let optionsHtml = '';
                    const templateInfo = {
                        '高效工作模式': { icon: '🚀', desc: '根据工作时间段智能调整补全频率' },
                        '智能活跃模式': { icon: '⚡', desc: '根据编码活跃度动态调整' },
                        '工作日模式': { icon: '📅', desc: '工作日和周末使用不同策略' }
                    };

                    Object.keys(templates).forEach(key => {
                        const info = templateInfo[key];
                        optionsHtml += \`
                            <button onclick="applyTemplate('\${key}')" style="
                                width: 100%;
                                background: transparent;
                                border: 1px solid var(--vscode-panel-border);
                                border-radius: 8px;
                                padding: 16px 20px;
                                margin-bottom: 12px;
                                cursor: pointer;
                                text-align: left;
                                transition: all 0.2s;
                                display: flex;
                                align-items: center;
                                gap: 12px;
                            " onmouseover="
                                this.style.background = 'var(--vscode-list-hoverBackground)';
                                this.style.borderColor = 'var(--vscode-focusBorder)';
                                this.style.transform = 'translateX(2px)';
                            " onmouseout="
                                this.style.background = 'transparent';
                                this.style.borderColor = 'var(--vscode-panel-border)';
                                this.style.transform = 'translateX(0)';
                            ">
                                <span style="font-size: 24px;">\${info.icon}</span>
                                <div style="flex: 1;">
                                    <div style="
                                        font-size: 15px;
                                        font-weight: 500;
                                        color: var(--vscode-editor-foreground);
                                        margin-bottom: 4px;
                                    ">\${key}</div>
                                    <div style="
                                        font-size: 12px;
                                        color: var(--vscode-descriptionForeground);
                                    ">\${info.desc}</div>
                                </div>
                                <span style="
                                    color: var(--vscode-descriptionForeground);
                                    font-size: 18px;
                                ">›</span>
                            </button>
                        \`;
                    });

                    selector.innerHTML = \`
                        <div style="
                            padding: 24px 28px 20px;
                            border-bottom: 1px solid var(--vscode-panel-border);
                        ">
                            <h3 style="
                                margin: 0;
                                font-size: 18px;
                                font-weight: 600;
                                color: var(--vscode-editor-foreground);
                                display: flex;
                                align-items: center;
                                gap: 10px;
                            ">
                                <span style="font-size: 20px;">✨</span>
                                选择策略模板
                            </h3>
                            <p style="
                                margin: 8px 0 0;
                                font-size: 13px;
                                color: var(--vscode-descriptionForeground);
                            ">选择一个预设模板快速配置补全策略</p>
                        </div>
                        <div style="padding: 20px 28px;">
                            \${optionsHtml}
                        </div>
                        <div style="
                            padding: 16px 28px 20px;
                            border-top: 1px solid var(--vscode-panel-border);
                            text-align: right;
                            background: var(--vscode-editorWidget-background);
                        ">
                            <button onclick="
                                document.getElementById('templateSelector').style.animation = 'slideOut 0.2s ease-in';
                                document.getElementById('selectorOverlay').style.animation = 'fadeOut 0.2s ease-out';
                                setTimeout(() => {
                                    document.getElementById('templateSelector')?.remove();
                                    document.getElementById('selectorOverlay')?.remove();
                                }, 180);
                            " style="
                                background: transparent;
                                color: var(--vscode-button-foreground);
                                border: 1px solid var(--vscode-panel-border);
                                padding: 8px 20px;
                                border-radius: 6px;
                                cursor: pointer;
                                font-size: 14px;
                                transition: all 0.2s;
                            " onmouseover="
                                this.style.borderColor = 'var(--vscode-focusBorder)';
                            " onmouseout="
                                this.style.borderColor = 'var(--vscode-panel-border)';
                            ">
                                取消
                            </button>
                        </div>
                    \`;

                    document.body.appendChild(overlay);
                    document.body.appendChild(selector);

                    // 点击遮罩层关闭
                    overlay.onclick = () => {
                        selector.style.animation = 'slideOut 0.2s ease-in';
                        overlay.style.animation = 'fadeOut 0.2s ease-out';
                        setTimeout(() => {
                            selector.remove();
                            overlay.remove();
                        }, 180);
                    };
                }

                function applyTemplate(templateName) {
                    const templates = {
                        '高效工作模式': {
                            strategy: 'timeSlot',
                            config: {
                                timeSlots: [
                                    { start: '09:00', end: '12:00', interval: 3000, description: '上午高效' },
                                    { start: '14:00', end: '17:00', interval: 3000, description: '下午高效' },
                                    { start: '19:00', end: '21:00', interval: 5000, description: '晚间编码' }
                                ],
                                defaultInterval: 60000
                            }
                        },
                        '智能活跃模式': {
                            strategy: 'activity',
                            config: {
                                activeInterval: 2000,
                                inactiveInterval: 30000,
                                inactiveThreshold: 60000
                            }
                        },
                        '工作日模式': {
                            strategy: 'workday',
                            config: {
                                workdays: { interval: 5000, enabled: true },
                                weekends: { interval: 60000, enabled: false }
                            }
                        }
                    };

                    if (templates[templateName]) {
                        const template = templates[templateName];
                        document.getElementById('completionStrategy').value = template.strategy;
                        updateStrategyConfigPanel(template.strategy);
                        updateSettings();

                        // 移除选择器和遮罩层
                        const selector = document.getElementById('templateSelector');
                        const overlay = document.getElementById('selectorOverlay');
                        if (selector && overlay) {
                            selector.style.animation = 'slideOut 0.2s ease-in';
                            overlay.style.animation = 'fadeOut 0.2s ease-out';
                            setTimeout(() => {
                                selector?.remove();
                                overlay?.remove();
                            }, 180);
                        }
                    }
                }

                // 组合策略相关函数
                function updateCompositeStrategies() {
                    const selectedStrategies = [];
                    document.querySelectorAll('.composite-strategy:checked').forEach(checkbox => {
                        selectedStrategies.push({
                            value: checkbox.value,
                            name: checkbox.nextElementSibling.textContent.trim()
                        });
                    });

                    const priorityList = document.getElementById('compositePriorityList');
                    if (selectedStrategies.length === 0) {
                        priorityList.innerHTML = '<div style="color: var(--vscode-descriptionForeground); font-size: 12px;">请先选择要组合的策略</div>';
                    } else {
                        let html = '';
                        selectedStrategies.forEach((strategy, index) => {
                            html += \`
                                <div class="priority-item" data-strategy="\${strategy.value}" draggable="true" style="
                                    padding: 8px;
                                    margin-bottom: 5px;
                                    background: var(--vscode-editor-background);
                                    border: 1px solid var(--vscode-panel-border);
                                    border-radius: 4px;
                                    cursor: move;
                                    display: flex;
                                    align-items: center;
                                    justify-content: space-between;
                                ">
                                    <span>
                                        <span style="color: var(--vscode-descriptionForeground); margin-right: 10px;">\${index + 1}.</span>
                                        \${strategy.name}
                                    </span>
                                    <span style="color: var(--vscode-descriptionForeground);">⋮⋮</span>
                                </div>
                            \`;
                        });
                        priorityList.innerHTML = html;

                        // 添加拖拽功能
                        initDragAndDrop();
                    }

                    updateSettings();
                }

                function initDragAndDrop() {
                    const items = document.querySelectorAll('.priority-item');
                    let draggedItem = null;

                    items.forEach(item => {
                        item.addEventListener('dragstart', function(e) {
                            draggedItem = this;
                            this.style.opacity = '0.5';
                        });

                        item.addEventListener('dragend', function(e) {
                            this.style.opacity = '';
                        });

                        item.addEventListener('dragover', function(e) {
                            e.preventDefault();
                            const afterElement = getDragAfterElement(document.getElementById('compositePriorityList'), e.clientY);
                            if (afterElement == null) {
                                document.getElementById('compositePriorityList').appendChild(draggedItem);
                            } else {
                                document.getElementById('compositePriorityList').insertBefore(draggedItem, afterElement);
                            }
                        });
                    });
                }

                function getDragAfterElement(container, y) {
                    const draggableElements = [...container.querySelectorAll('.priority-item:not(.dragging)')];

                    return draggableElements.reduce((closest, child) => {
                        const box = child.getBoundingClientRect();
                        const offset = y - box.top - box.height / 2;

                        if (offset < 0 && offset > closest.offset) {
                            return { offset: offset, element: child };
                        } else {
                            return closest;
                        }
                    }, { offset: Number.NEGATIVE_INFINITY }).element;
                }

                // 更新组合模式描述
                document.getElementById('compositeMode')?.addEventListener('change', function() {
                    const desc = document.getElementById('compositeModeDesc');
                    const descriptions = {
                        'priority': '优先级模式：按优先级顺序选择第一个可用的策略',
                        'union': '并集模式：任一策略满足条件即触发（最激进）',
                        'intersection': '交集模式：所有策略都满足条件才触发（最保守）'
                    };
                    if (desc) {
                        desc.textContent = descriptions[this.value] || '';
                    }
                });

                // 初始化策略配置面板
                const currentStrategy = '${currentSettings.completionStrategy}';
                updateStrategyConfigPanel(currentStrategy);

                // 定时更新状态
                setInterval(() => {
                    sendMessage({ command: 'getStatus' });
                }, 3000);
            </script>
        </body>
        </html>`;
    }

    public dispose() {
        if (this.panel) {
            this.panel.dispose();
        }
        if (this.statusBarItem) {
            this.statusBarItem.dispose();
        }
        if (this.statusUpdateTimer) {
            clearInterval(this.statusUpdateTimer);
        }
        this.disposables.forEach(d => d.dispose());
    }
}