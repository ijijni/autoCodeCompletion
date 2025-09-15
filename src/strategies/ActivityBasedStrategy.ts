import { BaseStrategy } from './BaseStrategy';
import { ActivityConfig } from './ICompletionStrategy';
import { ActivityMonitor } from '../ActivityMonitor';

export class ActivityBasedStrategy extends BaseStrategy {
    private activityMonitor: ActivityMonitor;
    protected config: ActivityConfig = {
        inactiveThreshold: 60000,  // 1分钟无活动视为不活跃
        activeInterval: 3000,       // 活跃时3秒触发
        inactiveInterval: 30000,    // 不活跃时30秒触发
        activityWindow: 300000,     // 5分钟活动窗口
        minEditCount: 5             // 最少编辑次数
    };

    constructor() {
        super('activity', '根据编码活跃度动态调整补全频率');
        this.activityMonitor = ActivityMonitor.getInstance();
    }

    shouldTrigger(): boolean {
        // 如果完全空闲，可以选择不触发
        const activityLevel = this.activityMonitor.getActivityLevel();
        if (activityLevel === 'idle') {
            // 空闲超过5分钟，降低触发频率
            return this.activityMonitor.getTimeSinceLastActivity() < 300000;
        }
        return true;
    }

    getNextInterval(): number {
        const activityLevel = this.activityMonitor.getActivityLevel();
        const timeSinceActivity = this.activityMonitor.getTimeSinceLastActivity();
        const recentEdits = this.activityMonitor.getRecentEditCount(60000);

        // 动态计算间隔
        let interval = this.config.activeInterval;

        switch (activityLevel) {
            case 'high':
                // 高度活跃，使用最短间隔
                interval = this.config.activeInterval;
                break;

            case 'medium':
                // 中等活跃，使用中等间隔
                interval = (this.config.activeInterval + this.config.inactiveInterval) / 2;
                break;

            case 'low':
                // 低活跃度，使用较长间隔
                interval = this.config.inactiveInterval * 0.8;
                break;

            case 'idle':
                // 空闲状态，使用最长间隔
                interval = this.config.inactiveInterval;

                // 如果空闲超过阈值，进一步延长间隔
                if (timeSinceActivity > this.config.inactiveThreshold * 2) {
                    interval = this.config.inactiveInterval * 2;
                }
                break;
        }

        // 根据最近编辑次数微调
        if (recentEdits < this.config.minEditCount && activityLevel !== 'high') {
            interval = interval * 1.5;
        }

        return Math.round(interval);
    }

    configure(config: any): void {
        super.configure(config);
        if (config.inactiveThreshold !== undefined) {
            this.config.inactiveThreshold = config.inactiveThreshold;
        }
        if (config.activeInterval !== undefined) {
            this.config.activeInterval = config.activeInterval;
        }
        if (config.inactiveInterval !== undefined) {
            this.config.inactiveInterval = config.inactiveInterval;
        }
        if (config.activityWindow !== undefined) {
            this.config.activityWindow = config.activityWindow;
        }
        if (config.minEditCount !== undefined) {
            this.config.minEditCount = config.minEditCount;
        }
    }

    protected getAdditionalStatusInfo(): Record<string, any> {
        const metrics = this.activityMonitor.getActivityMetrics();
        const currentInterval = this.getNextInterval();

        return {
            activityLevel: metrics.level,
            editCount: metrics.editCount,
            recentEdits: metrics.recentEdits,
            timeSinceActivity: Math.round(metrics.timeSinceActivity / 1000) + '秒',
            isActive: metrics.isActive,
            currentInterval: currentInterval,
            intervalFormatted: `${currentInterval / 1000}秒`,
            adaptiveMode: this.getAdaptiveMode(metrics.level)
        };
    }

    private getAdaptiveMode(level: string): string {
        switch (level) {
            case 'high':
                return '高频模式';
            case 'medium':
                return '正常模式';
            case 'low':
                return '低频模式';
            case 'idle':
                return '空闲模式';
            default:
                return '未知模式';
        }
    }

    dispose(): void {
        // 活跃度监控器是单例，不在这里释放
        super.dispose();
    }
}