import { BaseStrategy } from './BaseStrategy';
import { ICompletionStrategy, CompositeStrategyConfig, StrategyType } from './ICompletionStrategy';
import { FixedIntervalStrategy } from './FixedIntervalStrategy';
import { TimeSlotStrategy } from './TimeSlotStrategy';
import { WorkdayStrategy } from './WorkdayStrategy';
import { ActivityBasedStrategy } from './ActivityBasedStrategy';
import { ProjectTypeStrategy } from './ProjectTypeStrategy';

export class CompositeStrategy extends BaseStrategy {
    private strategies: Map<string, ICompletionStrategy> = new Map();
    private activeStrategies: string[] = [];
    private mode: 'intersection' | 'union' | 'priority' = 'priority';
    private priority: string[] = [];

    constructor() {
        super('composite', '组合多个策略，灵活控制补全触发');
        this.initializeStrategies();
    }

    private initializeStrategies(): void {
        // 创建所有可用的策略实例
        this.strategies.set('fixed', new FixedIntervalStrategy());
        this.strategies.set('timeSlot', new TimeSlotStrategy());
        this.strategies.set('workday', new WorkdayStrategy());
        this.strategies.set('activity', new ActivityBasedStrategy());
        this.strategies.set('projectType', new ProjectTypeStrategy());
    }

    async initialize(): Promise<void> {
        // 初始化所有活跃的策略
        for (const strategyName of this.activeStrategies) {
            const strategy = this.strategies.get(strategyName);
            if (strategy) {
                await strategy.initialize();
            }
        }
    }

    shouldTrigger(): boolean {
        if (this.activeStrategies.length === 0) {
            return true;
        }

        switch (this.mode) {
            case 'intersection':
                // 所有策略都必须同意触发
                return this.activeStrategies.every(name => {
                    const strategy = this.strategies.get(name);
                    return strategy ? strategy.shouldTrigger() : true;
                });

            case 'union':
                // 任一策略同意就触发
                return this.activeStrategies.some(name => {
                    const strategy = this.strategies.get(name);
                    return strategy ? strategy.shouldTrigger() : false;
                });

            case 'priority':
                // 按优先级找到第一个可用的策略
                const priorityStrategy = this.getFirstEnabledStrategy();
                return priorityStrategy ? priorityStrategy.shouldTrigger() : true;

            default:
                return true;
        }
    }

    getNextInterval(): number {
        if (this.activeStrategies.length === 0) {
            return 5000; // 默认间隔
        }

        switch (this.mode) {
            case 'intersection':
                // 使用最长的间隔（最保守）
                return Math.max(...this.activeStrategies.map(name => {
                    const strategy = this.strategies.get(name);
                    return strategy ? strategy.getNextInterval() : 5000;
                }));

            case 'union':
                // 使用最短的间隔（最激进）
                return Math.min(...this.activeStrategies.map(name => {
                    const strategy = this.strategies.get(name);
                    return strategy ? strategy.getNextInterval() : 5000;
                }));

            case 'priority':
                // 使用第一个启用的策略的间隔
                const priorityStrategy = this.getFirstEnabledStrategy();
                return priorityStrategy ? priorityStrategy.getNextInterval() : 5000;

            default:
                // 计算平均间隔
                const intervals = this.activeStrategies.map(name => {
                    const strategy = this.strategies.get(name);
                    return strategy ? strategy.getNextInterval() : 5000;
                });
                return Math.round(intervals.reduce((a, b) => a + b, 0) / intervals.length);
        }
    }

    private getFirstEnabledStrategy(): ICompletionStrategy | null {
        // 优先按照用户指定的优先级
        for (const strategyName of this.priority) {
            if (this.activeStrategies.includes(strategyName)) {
                const strategy = this.strategies.get(strategyName);
                if (strategy && strategy.isEnabled()) {
                    return strategy;
                }
            }
        }

        // 如果没有优先级或优先级中的策略都不可用，返回第一个活跃的策略
        for (const strategyName of this.activeStrategies) {
            const strategy = this.strategies.get(strategyName);
            if (strategy && strategy.isEnabled()) {
                return strategy;
            }
        }

        return null;
    }

    configure(config: any): void {
        super.configure(config);

        // 配置组合策略参数
        if (config.strategies) {
            this.activeStrategies = Array.isArray(config.strategies)
                ? config.strategies
                : [config.strategies];
        }

        if (config.mode) {
            this.mode = config.mode;
        }

        if (config.priority) {
            this.priority = Array.isArray(config.priority)
                ? config.priority
                : [config.priority];
        }

        // 配置各个子策略
        for (const [name, strategy] of this.strategies.entries()) {
            if (config[name]) {
                strategy.configure(config[name]);
            }
        }

        // 确保优先级列表包含所有活跃策略
        for (const strategyName of this.activeStrategies) {
            if (!this.priority.includes(strategyName)) {
                this.priority.push(strategyName);
            }
        }
    }

    onCompletionTriggered(): void {
        // 通知所有活跃策略
        for (const strategyName of this.activeStrategies) {
            const strategy = this.strategies.get(strategyName);
            if (strategy) {
                strategy.onCompletionTriggered();
            }
        }
    }

    protected getAdditionalStatusInfo(): Record<string, any> {
        const currentInterval = this.getNextInterval();
        const strategyStatuses: Record<string, any> = {};

        // 收集所有活跃策略的状态
        for (const strategyName of this.activeStrategies) {
            const strategy = this.strategies.get(strategyName);
            if (strategy) {
                const status = strategy.getStatus();
                strategyStatuses[strategyName] = {
                    interval: status.currentInterval,
                    enabled: strategy.isEnabled(),
                    shouldTrigger: strategy.shouldTrigger(),
                    info: status.additionalInfo
                };
            }
        }

        // 获取当前主导策略
        let dominantStrategy = '无';
        if (this.mode === 'priority') {
            const priorityStrategy = this.getFirstEnabledStrategy();
            dominantStrategy = priorityStrategy ? priorityStrategy.name : '无';
        }

        return {
            mode: this.getModeDescription(this.mode),
            activeStrategies: this.activeStrategies,
            totalStrategies: this.strategies.size,
            currentInterval: currentInterval,
            intervalFormatted: `${currentInterval / 1000}秒`,
            dominantStrategy: dominantStrategy,
            strategyStatuses: strategyStatuses,
            priority: this.priority
        };
    }

    private getModeDescription(mode: string): string {
        const descriptions: Record<string, string> = {
            'intersection': '交集模式（所有策略都满足）',
            'union': '并集模式（任一策略满足）',
            'priority': '优先级模式（按优先级选择）'
        };
        return descriptions[mode] || mode;
    }

    dispose(): void {
        // 释放所有子策略
        for (const strategy of this.strategies.values()) {
            strategy.dispose();
        }
        this.strategies.clear();
        super.dispose();
    }
}