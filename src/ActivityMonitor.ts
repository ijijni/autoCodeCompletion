import * as vscode from 'vscode';

export class ActivityMonitor {
    private static instance: ActivityMonitor | null = null;
    private lastActivityTime: number = Date.now();
    private editCount: number = 0;
    private activityWindow: number = 300000; // 5分钟
    private disposables: vscode.Disposable[] = [];
    private editHistory: number[] = [];
    private historyMaxSize: number = 100;

    private constructor() {
        this.startMonitoring();
    }

    public static getInstance(): ActivityMonitor {
        if (!ActivityMonitor.instance) {
            ActivityMonitor.instance = new ActivityMonitor();
        }
        return ActivityMonitor.instance;
    }

    private startMonitoring(): void {
        // 监听文本变化
        this.disposables.push(
            vscode.workspace.onDidChangeTextDocument((event) => {
                // 只记录用户的编辑，不记录程序化的修改
                if (event.contentChanges.length > 0) {
                    this.recordActivity();
                    this.editCount++;
                    this.addToHistory();
                }
            })
        );

        // 监听文件打开
        this.disposables.push(
            vscode.workspace.onDidOpenTextDocument(() => {
                this.recordActivity();
            })
        );

        // 监听文件保存
        this.disposables.push(
            vscode.workspace.onDidSaveTextDocument(() => {
                this.recordActivity();
            })
        );

        // 监听编辑器焦点变化
        this.disposables.push(
            vscode.window.onDidChangeActiveTextEditor(() => {
                this.recordActivity();
            })
        );

        // 定期清理计数（衰减机制）
        setInterval(() => {
            this.editCount = Math.floor(this.editCount * 0.95); // 每分钟衰减5%
        }, 60000);

        // 清理过期的历史记录
        setInterval(() => {
            this.cleanupHistory();
        }, 30000);
    }

    private recordActivity(): void {
        this.lastActivityTime = Date.now();
    }

    private addToHistory(): void {
        const now = Date.now();
        this.editHistory.push(now);

        // 限制历史记录大小
        if (this.editHistory.length > this.historyMaxSize) {
            this.editHistory.shift();
        }
    }

    private cleanupHistory(): void {
        const cutoffTime = Date.now() - this.activityWindow;
        this.editHistory = this.editHistory.filter(time => time > cutoffTime);
    }

    public isActive(threshold: number = 60000): boolean {
        return (Date.now() - this.lastActivityTime) < threshold;
    }

    public getActivityLevel(): 'high' | 'medium' | 'low' | 'idle' {
        const timeSinceActivity = Date.now() - this.lastActivityTime;
        const recentEdits = this.getRecentEditCount(60000); // 最近1分钟的编辑数

        if (timeSinceActivity < 10000 && recentEdits > 20) {
            return 'high';
        } else if (timeSinceActivity < 30000 && recentEdits > 5) {
            return 'medium';
        } else if (timeSinceActivity < 120000 && recentEdits > 0) {
            return 'low';
        } else {
            return 'idle';
        }
    }

    public getRecentEditCount(timeWindow: number): number {
        const cutoffTime = Date.now() - timeWindow;
        return this.editHistory.filter(time => time > cutoffTime).length;
    }

    public getEditCount(): number {
        return this.editCount;
    }

    public getLastActivityTime(): number {
        return this.lastActivityTime;
    }

    public getTimeSinceLastActivity(): number {
        return Date.now() - this.lastActivityTime;
    }

    public getActivityMetrics(): {
        level: string;
        editCount: number;
        recentEdits: number;
        timeSinceActivity: number;
        isActive: boolean;
    } {
        return {
            level: this.getActivityLevel(),
            editCount: this.editCount,
            recentEdits: this.getRecentEditCount(60000),
            timeSinceActivity: this.getTimeSinceLastActivity(),
            isActive: this.isActive()
        };
    }

    public reset(): void {
        this.editCount = 0;
        this.editHistory = [];
        this.lastActivityTime = Date.now();
    }

    public dispose(): void {
        this.disposables.forEach(d => d.dispose());
        this.disposables = [];
        ActivityMonitor.instance = null;
    }
}