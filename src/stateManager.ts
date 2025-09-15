import * as vscode from 'vscode';
import { StrategyStatus } from './strategies/ICompletionStrategy';

export interface ExtensionState {
    isRunning: boolean;
    stats: {
        dailyCount: number;
        totalCount: number;
        weeklyCount: number;
        lastCompletionTime: string;
    };
    settings: {
        enabled: boolean;
        interval: number;
        maxCompletionsPerDay: number;
        aiWaitTime: number;
        autoCreateFiles: boolean;
        avoidVSCodeSuggestions: boolean;
        useCodeSnippets: boolean;
        snippetMaxLines: number;
        enableProjectCodeDetection: boolean;
        maxRetryAttempts: number;
        projectCodeMaxFiles: number;
        projectCodeMaxFileSize: number;
        supportedLanguages: string[];
        enableCustomSnippets: boolean;
        customSnippetPriority: string;
        customSnippetDirectories: string[];
        autoFocusOnCompletion: boolean;
        completionStrategy?: string;
        strategyConfig?: any;
    };
    strategy?: {
        current: string;
        status: StrategyStatus;
        nextTriggerTime?: Date;
    };
}

export class StateManager {
    private static instance: StateManager;
    private state: ExtensionState;
    private listeners: Set<(state: ExtensionState) => void> = new Set();
    private updateDebounceTimer: NodeJS.Timeout | undefined;

    private constructor() {
        const config = vscode.workspace.getConfiguration('autoCodeCompletion');
        this.state = {
            isRunning: false,
            stats: {
                dailyCount: 0,
                totalCount: 0,
                weeklyCount: 0,
                lastCompletionTime: ''
            },
            settings: this.loadSettingsFromConfig(config)
        };
    }

    public static getInstance(): StateManager {
        if (!StateManager.instance) {
            StateManager.instance = new StateManager();
        }
        return StateManager.instance;
    }

    private loadSettingsFromConfig(config: vscode.WorkspaceConfiguration): ExtensionState['settings'] {
        return {
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
    }

    public getState(): ExtensionState {
        return { ...this.state };
    }

    public updateRunningState(isRunning: boolean): void {
        console.log('[StateManager] 更新运行状态:', isRunning);
        if (this.state.isRunning !== isRunning) {
            this.state.isRunning = isRunning;
            this.notifyListeners();
        }
    }

    public updateStats(stats: Partial<ExtensionState['stats']>): void {
        console.log('[StateManager] 更新统计数据:', stats);
        this.state.stats = { ...this.state.stats, ...stats };
        this.notifyListeners();
    }

    public updateStrategyStatus(status: StrategyStatus): void {
        this.state.strategy = {
            current: this.state.settings.completionStrategy || 'fixed',
            status: status,
            nextTriggerTime: this.state.strategy?.nextTriggerTime
        };
        this.notifyListeners();
    }

    public updateNextTriggerTime(time: Date): void {
        if (!this.state.strategy) {
            this.state.strategy = {
                current: this.state.settings.completionStrategy || 'fixed',
                status: { currentInterval: 0 },
                nextTriggerTime: time
            };
        } else {
            this.state.strategy.nextTriggerTime = time;
        }
        this.notifyListeners();
    }

    public updateSettings(settings: Partial<ExtensionState['settings']>): void {
        this.state.settings = { ...this.state.settings, ...settings };
        this.notifyListeners();
    }

    public reloadSettingsFromConfig(): void {
        console.log('[StateManager] 从VSCode配置重新加载设置');
        const config = vscode.workspace.getConfiguration('autoCodeCompletion');
        this.state.settings = this.loadSettingsFromConfig(config);
        console.log('[StateManager] 新设置:', this.state.settings);
        this.notifyListeners();
    }

    public subscribe(listener: (state: ExtensionState) => void): vscode.Disposable {
        this.listeners.add(listener);
        // 立即发送当前状态给新订阅者
        listener(this.getState());
        
        return new vscode.Disposable(() => {
            this.listeners.delete(listener);
        });
    }

    private notifyListeners(): void {
        // 使用防抖避免频繁更新
        if (this.updateDebounceTimer) {
            clearTimeout(this.updateDebounceTimer);
        }
        
        this.updateDebounceTimer = setTimeout(() => {
            const currentState = this.getState();
            console.log('[StateManager] 通知', this.listeners.size, '个监听器，当前状态:', {
                isRunning: currentState.isRunning,
                dailyCount: currentState.stats.dailyCount,
                settingsEnabled: currentState.settings.enabled
            });
            this.listeners.forEach(listener => {
                try {
                    listener(currentState);
                } catch (error) {
                    console.error('Error notifying state listener:', error);
                }
            });
        }, 100);
    }

    public dispose(): void {
        if (this.updateDebounceTimer) {
            clearTimeout(this.updateDebounceTimer);
        }
        this.listeners.clear();
    }
}