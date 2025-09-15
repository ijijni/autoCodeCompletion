import * as vscode from 'vscode';
import { AutoCompletionManager } from './autoCompletionManager';
import { StatsManager } from './statsManager';
import { FileManager } from './fileManager';
import { CodeSnippetManager } from './codeSnippetManager';
import { QAManager } from './qaManager';
import { SuggestionManager } from './suggestionManager';
import { ControlPanelManager } from './controlPanelManager';
import { SidebarProvider } from './sidebarProvider';
import { StateManager } from './stateManager';

let autoCompletionManager: AutoCompletionManager;
let statsManager: StatsManager;
let fileManager: FileManager;
let codeSnippetManager: CodeSnippetManager;
let qaManager: QAManager;
let suggestionManager: SuggestionManager;
let controlPanelManager: ControlPanelManager;
let sidebarProvider: SidebarProvider;
let stateManager: StateManager;

export function activate(context: vscode.ExtensionContext) {
    console.log('Auto Code Completion extension is now active!');

    // Initialize state manager first
    stateManager = StateManager.getInstance();
    
    // Initialize managers
    statsManager = new StatsManager(context, stateManager);
    fileManager = new FileManager();
    codeSnippetManager = new CodeSnippetManager(context);
    qaManager = new QAManager(context);
    suggestionManager = new SuggestionManager();
    autoCompletionManager = new AutoCompletionManager(statsManager, fileManager, codeSnippetManager, suggestionManager, stateManager);
    controlPanelManager = new ControlPanelManager(context, autoCompletionManager, statsManager, stateManager);
    
    // 创建侧边栏视图提供器
    sidebarProvider = new SidebarProvider(context.extensionUri, autoCompletionManager, statsManager, stateManager);
    
    // 注册侧边栏视图
    context.subscriptions.push(
        vscode.window.registerWebviewViewProvider(
            SidebarProvider.viewType,
            sidebarProvider
        )
    );

    // Register commands
    const startCommand = vscode.commands.registerCommand('autoCodeCompletion.start', () => {
        autoCompletionManager.start();
        vscode.window.showInformationMessage('Auto Code Completion started!');
    });

    const stopCommand = vscode.commands.registerCommand('autoCodeCompletion.stop', () => {
        autoCompletionManager.stop();
        vscode.window.showInformationMessage('Auto Code Completion stopped!');
    });

    const triggerOnceCommand = vscode.commands.registerCommand('autoCodeCompletion.triggerOnce', async () => {
        await autoCompletionManager.triggerCompletionOnce();
        vscode.window.showInformationMessage('Code completion triggered!');
    });

    const showStatsCommand = vscode.commands.registerCommand('autoCodeCompletion.showStats', () => {
        statsManager.showStats();
    });

    const resetDailyStatsCommand = vscode.commands.registerCommand('autoCodeCompletion.resetDailyStats', () => {
        statsManager.resetDailyStats();
    });

    // 新增的快捷键命令
    const toggleQACommand = vscode.commands.registerCommand('autoCodeCompletion.toggleQA', () => {
        qaManager.toggleQA();
    });

    const acceptSuggestionCommand = vscode.commands.registerCommand('autoCodeCompletion.acceptSuggestion', async () => {
        const success = await suggestionManager.acceptCurrentSuggestion();
        if (!success) {
            // 如果没有检测到建议，尝试触发一个新的补全
            await suggestionManager.manualTriggerCompletion();
        }
    });

    const previousSuggestionCommand = vscode.commands.registerCommand('autoCodeCompletion.previousSuggestion', async () => {
        await suggestionManager.previousSuggestion();
    });

    const nextSuggestionCommand = vscode.commands.registerCommand('autoCodeCompletion.nextSuggestion', async () => {
        await suggestionManager.nextSuggestion();
    });

    const manualTriggerCommand = vscode.commands.registerCommand('autoCodeCompletion.manualTrigger', async () => {
        await suggestionManager.manualTriggerCompletion();
    });

    // 控制面板命令
    const showControlPanelCommand = vscode.commands.registerCommand('autoCodeCompletion.showControlPanel', () => {
        controlPanelManager.showPanel();
    });

    // 策略相关命令
    const switchStrategyCommand = vscode.commands.registerCommand('autoCodeCompletion.switchStrategy', async () => {
        const strategyManager = autoCompletionManager.getStrategyManager();
        const strategies = strategyManager.getAvailableStrategies();
        const descriptions = strategyManager.getStrategyDescriptions();

        const items = strategies.map(strategy => ({
            label: strategy,
            description: descriptions.get(strategy),
            picked: strategy === strategyManager.getCurrentStrategyType()
        }));

        const selected = await vscode.window.showQuickPick(items, {
            placeHolder: '选择补全触发策略',
            title: '切换补全策略'
        });

        if (selected) {
            try {
                await strategyManager.switchStrategy(selected.label as any);
                vscode.window.showInformationMessage(`已切换到 ${selected.label} 策略`);
            } catch (error: any) {
                vscode.window.showErrorMessage(`切换策略失败: ${error.message}`);
            }
        }
    });

    const configureStrategyCommand = vscode.commands.registerCommand('autoCodeCompletion.configureStrategy', async () => {
        vscode.commands.executeCommand('workbench.action.openSettings', 'autoCodeCompletion.strategyConfig');
    });

    const showStrategyStatusCommand = vscode.commands.registerCommand('autoCodeCompletion.showStrategyStatus', () => {
        const strategyManager = autoCompletionManager.getStrategyManager();
        const summary = strategyManager.getStrategySummary();
        const status = strategyManager.getStatus();

        const message = `
当前策略: ${summary.current}
状态: ${summary.status}
当前间隔: ${summary.interval}ms
下次触发: ${status.nextTriggerTime ? new Date(status.nextTriggerTime).toLocaleTimeString() : '未知'}
        `.trim();

        vscode.window.showInformationMessage(message, '切换策略', '配置').then(selection => {
            if (selection === '切换策略') {
                vscode.commands.executeCommand('autoCodeCompletion.switchStrategy');
            } else if (selection === '配置') {
                vscode.commands.executeCommand('autoCodeCompletion.configureStrategy');
            }
        });
    });

    // Register disposables
    context.subscriptions.push(
        startCommand,
        stopCommand,
        triggerOnceCommand,
        showStatsCommand,
        resetDailyStatsCommand,
        toggleQACommand,
        acceptSuggestionCommand,
        previousSuggestionCommand,
        nextSuggestionCommand,
        manualTriggerCommand,
        showControlPanelCommand,
        switchStrategyCommand,
        configureStrategyCommand,
        showStrategyStatusCommand,
        autoCompletionManager,
        statsManager,
        fileManager,
        codeSnippetManager,
        qaManager,
        suggestionManager,
        controlPanelManager
    );

    // Auto-start if enabled in settings
    const config = vscode.workspace.getConfiguration('autoCodeCompletion');
    if (config.get('enabled', false)) {
        autoCompletionManager.start();
    }

    // Listen for configuration changes
    vscode.workspace.onDidChangeConfiguration(event => {
        if (event.affectsConfiguration('autoCodeCompletion')) {
            // 更新状态管理器中的设置
            stateManager.reloadSettingsFromConfig();
            
            autoCompletionManager.updateConfiguration();

            // 如果自定义代码片段配置发生变化，重新加载
            if (event.affectsConfiguration('autoCodeCompletion.customSnippetDirectories') ||
                event.affectsConfiguration('autoCodeCompletion.enableCustomSnippets') ||
                event.affectsConfiguration('autoCodeCompletion.customSnippetPriority')) {
                codeSnippetManager.updateConfiguration();
            }
        }
    });
}

export function deactivate() {
    if (autoCompletionManager) {
        autoCompletionManager.dispose();
    }
    if (statsManager) {
        statsManager.dispose();
    }
    if (fileManager) {
        fileManager.dispose();
    }
    if (codeSnippetManager) {
        codeSnippetManager.dispose();
    }
    if (controlPanelManager) {
        controlPanelManager.dispose();
    }
}
