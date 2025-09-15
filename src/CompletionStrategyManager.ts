import * as vscode from 'vscode';
import { ICompletionStrategy, StrategyType, StrategyStatus } from './strategies/ICompletionStrategy';
import { FixedIntervalStrategy } from './strategies/FixedIntervalStrategy';
import { TimeSlotStrategy } from './strategies/TimeSlotStrategy';
import { WorkdayStrategy } from './strategies/WorkdayStrategy';
import { ActivityBasedStrategy } from './strategies/ActivityBasedStrategy';
import { ProjectTypeStrategy } from './strategies/ProjectTypeStrategy';
import { CompositeStrategy } from './strategies/CompositeStrategy';

export class CompletionStrategyManager {
    private strategies: Map<StrategyType, ICompletionStrategy> = new Map();
    private currentStrategy: ICompletionStrategy;
    private currentStrategyType: StrategyType = StrategyType.Fixed;
    private config: vscode.WorkspaceConfiguration;
    private statusUpdateCallback?: (status: StrategyStatus) => void;

    constructor() {
        this.config = vscode.workspace.getConfiguration('autoCodeCompletion');
        this.initializeStrategies();
        this.currentStrategy = this.loadStrategy();
    }

    private initializeStrategies(): void {
        // 创建所有策略实例
        this.strategies.set(StrategyType.Fixed, new FixedIntervalStrategy());
        this.strategies.set(StrategyType.TimeSlot, new TimeSlotStrategy());
        this.strategies.set(StrategyType.Workday, new WorkdayStrategy());
        this.strategies.set(StrategyType.Activity, new ActivityBasedStrategy());
        this.strategies.set(StrategyType.ProjectType, new ProjectTypeStrategy());
        this.strategies.set(StrategyType.Composite, new CompositeStrategy());
    }

    private loadStrategy(): ICompletionStrategy {
        // 获取配置的策略类型
        const strategyType = this.config.get<string>('completionStrategy', 'fixed') as StrategyType;
        this.currentStrategyType = strategyType;

        // 获取策略配置
        const strategyConfig = this.config.get<any>('strategyConfig', {});

        // 获取对应的策略实例
        let strategy = this.strategies.get(strategyType);
        if (!strategy) {
            console.warn(`Unknown strategy type: ${strategyType}, falling back to fixed`);
            strategy = this.strategies.get(StrategyType.Fixed)!;
            this.currentStrategyType = StrategyType.Fixed;
        }

        // 配置策略
        this.configureStrategy(strategy, strategyConfig);

        // 初始化策略
        strategy.initialize().catch(err => {
            console.error(`Failed to initialize strategy ${strategyType}:`, err);
        });

        return strategy;
    }

    private configureStrategy(strategy: ICompletionStrategy, config: any): void {
        // 对于固定间隔策略，保持向后兼容
        if (strategy.name === 'fixed') {
            const interval = this.config.get<number>('interval');
            if (interval) {
                config = { ...config, interval };
            }
        }

        // 如果配置中有针对特定策略的配置，使用它
        const specificConfig = config[strategy.name] || config;
        strategy.configure(specificConfig);
    }

    public getNextInterval(): number {
        if (!this.currentStrategy.isEnabled()) {
            // 策略被禁用，返回一个很大的间隔
            return Number.MAX_SAFE_INTEGER;
        }

        if (!this.currentStrategy.shouldTrigger()) {
            // 策略认为不应该触发，返回较长的间隔
            return this.currentStrategy.getNextInterval() * 2;
        }

        return this.currentStrategy.getNextInterval();
    }

    public onCompletionTriggered(): void {
        this.currentStrategy.onCompletionTriggered();
        this.updateStatus();
    }

    public async switchStrategy(type: StrategyType): Promise<void> {
        const newStrategy = this.strategies.get(type);
        if (!newStrategy) {
            throw new Error(`Strategy ${type} not found`);
        }

        // 释放当前策略
        this.currentStrategy.dispose();

        // 切换到新策略
        this.currentStrategy = newStrategy;
        this.currentStrategyType = type;

        // 配置新策略
        const strategyConfig = this.config.get<any>('strategyConfig', {});
        this.configureStrategy(newStrategy, strategyConfig);

        // 初始化新策略
        await newStrategy.initialize();

        // 更新配置
        await this.config.update('completionStrategy', type, vscode.ConfigurationTarget.Global);

        this.updateStatus();
    }

    public getCurrentStrategy(): ICompletionStrategy {
        return this.currentStrategy;
    }

    public getCurrentStrategyType(): StrategyType {
        return this.currentStrategyType;
    }

    public getAvailableStrategies(): StrategyType[] {
        return Array.from(this.strategies.keys());
    }

    public getStrategyDescriptions(): Map<StrategyType, string> {
        const descriptions = new Map<StrategyType, string>();
        for (const [type, strategy] of this.strategies.entries()) {
            descriptions.set(type, strategy.description);
        }
        return descriptions;
    }

    public getStatus(): StrategyStatus {
        return this.currentStrategy.getStatus();
    }

    public setStatusUpdateCallback(callback: (status: StrategyStatus) => void): void {
        this.statusUpdateCallback = callback;
    }

    private updateStatus(): void {
        if (this.statusUpdateCallback) {
            this.statusUpdateCallback(this.getStatus());
        }
    }

    public async updateConfiguration(): Promise<void> {
        this.config = vscode.workspace.getConfiguration('autoCodeCompletion');

        // 检查策略类型是否改变
        const newStrategyType = this.config.get<string>('completionStrategy', 'fixed') as StrategyType;

        if (newStrategyType !== this.currentStrategyType) {
            // 策略类型改变，切换策略
            await this.switchStrategy(newStrategyType);
        } else {
            // 只更新配置
            const strategyConfig = this.config.get<any>('strategyConfig', {});
            this.configureStrategy(this.currentStrategy, strategyConfig);
        }

        this.updateStatus();
    }

    public dispose(): void {
        // 释放所有策略
        for (const strategy of this.strategies.values()) {
            strategy.dispose();
        }
        this.strategies.clear();
    }

    // 便捷方法：获取策略的简要信息
    public getStrategySummary(): {
        current: string;
        interval: number;
        status: string;
        details: any;
    } {
        const status = this.getStatus();
        return {
            current: this.currentStrategy.name,
            interval: status.currentInterval,
            status: this.currentStrategy.isEnabled() ? '启用' : '禁用',
            details: status.additionalInfo
        };
    }

    // 便捷方法：快速配置策略
    public async quickConfigure(type: StrategyType, config: any): Promise<void> {
        await this.switchStrategy(type);

        // 更新策略配置
        const currentConfig = this.config.get<any>('strategyConfig', {});
        const newConfig = { ...currentConfig, [type]: config };

        await this.config.update('strategyConfig', newConfig, vscode.ConfigurationTarget.Global);
        this.configureStrategy(this.currentStrategy, newConfig);

        this.updateStatus();
    }
}