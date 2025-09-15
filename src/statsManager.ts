import * as vscode from 'vscode';
import { StateManager } from './stateManager';

interface CompletionStats {
    totalCompletions: number;
    dailyCompletions: { [date: string]: number };
    lastCompletionDate: string;
    lastCompletionTime: string; // 添加具体时间记录
}

export class StatsManager implements vscode.Disposable {
    private stats!: CompletionStats;
    private readonly storageKey = 'autoCodeCompletion.stats';
    private stateManager: StateManager;

    constructor(private context: vscode.ExtensionContext, stateManager?: StateManager) {
        this.stateManager = stateManager || StateManager.getInstance();
        this.loadStats();
        this.updateStateManager();
    }

    private loadStats(): void {
        const savedStats = this.context.globalState.get<CompletionStats>(this.storageKey);
        
        this.stats = savedStats || {
            totalCompletions: 0,
            dailyCompletions: {},
            lastCompletionDate: '',
            lastCompletionTime: ''
        };
    }

    private saveStats(): void {
        this.context.globalState.update(this.storageKey, this.stats);
        this.updateStateManager();
    }
    
    private updateStateManager(): void {
        this.stateManager.updateStats({
            dailyCount: this.getTodayCount(),
            totalCount: this.getTotalCount(),
            weeklyCount: this.getWeeklyCount(),
            lastCompletionTime: this.stats.lastCompletionTime || ''
        });
    }

    public incrementCount(): void {
        const today = this.getTodayString();
        const now = new Date().toISOString();
        
        this.stats.totalCompletions++;
        this.stats.dailyCompletions[today] = (this.stats.dailyCompletions[today] || 0) + 1;
        this.stats.lastCompletionDate = today;
        this.stats.lastCompletionTime = now;
        
        this.saveStats();
        
        console.log(`Completion count updated: ${this.stats.dailyCompletions[today]} today, ${this.stats.totalCompletions} total`);
    }

    public getTodayCount(): number {
        const today = this.getTodayString();
        return this.stats.dailyCompletions[today] || 0;
    }

    public getTotalCount(): number {
        return this.stats.totalCompletions;
    }

    public getWeeklyCount(): number {
        const today = new Date();
        let weeklyCount = 0;
        
        for (let i = 0; i < 7; i++) {
            const date = new Date(today);
            date.setDate(today.getDate() - i);
            const dateString = this.formatDate(date);
            weeklyCount += this.stats.dailyCompletions[dateString] || 0;
        }
        
        return weeklyCount;
    }

    public getStats() {
        return {
            dailyCount: this.getTodayCount(),
            totalCount: this.getTotalCount(),
            weeklyCount: this.getWeeklyCount(),
            lastCompletionTime: this.stats.lastCompletionTime || ''
        };
    }

    public showStats(): void {
        const today = this.getTodayCount();
        const total = this.getTotalCount();
        const weekly = this.getWeeklyCount();
        
        const message = `📊 Code Completion Statistics\n\n` +
                       `Today: ${today} completions\n` +
                       `This week: ${weekly} completions\n` +
                       `Total: ${total} completions\n\n` +
                       `Last completion: ${this.stats.lastCompletionDate || 'Never'}`;

        vscode.window.showInformationMessage(message, { modal: true });
    }

    public resetStats(): void {
        this.stats = {
            totalCompletions: 0,
            dailyCompletions: {},
            lastCompletionDate: '',
            lastCompletionTime: ''
        };
        this.saveStats();
        vscode.window.showInformationMessage('Statistics reset successfully!');
    }

    public resetDailyStats(): void {
        const today = this.getTodayString();
        const todayCount = this.stats.dailyCompletions[today] || 0;

        // 从总数中减去今日的次数
        this.stats.totalCompletions = Math.max(0, this.stats.totalCompletions - todayCount);

        // 重置今日次数
        this.stats.dailyCompletions[today] = 0;

        // 如果今日是最后补全日期，则清空最后补全日期和时间
        if (this.stats.lastCompletionDate === today) {
            this.stats.lastCompletionDate = '';
            this.stats.lastCompletionTime = '';
        }

        this.saveStats();
        vscode.window.showInformationMessage(`Today's completion count has been reset! (${todayCount} completions cleared)`);
    }

    public exportStats(): string {
        return JSON.stringify(this.stats, null, 2);
    }

    private getTodayString(): string {
        return this.formatDate(new Date());
    }

    private formatDate(date: Date): string {
        return date.toISOString().split('T')[0];
    }

    public dispose(): void {
        this.saveStats();
    }
}
