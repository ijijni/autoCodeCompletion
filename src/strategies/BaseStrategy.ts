import { ICompletionStrategy, StrategyStatus } from './ICompletionStrategy';

export abstract class BaseStrategy implements ICompletionStrategy {
    protected config: any = {};
    protected enabled: boolean = true;

    constructor(
        public readonly name: string,
        public readonly description: string
    ) {}

    async initialize(): Promise<void> {
        // 子类可重写
    }

    dispose(): void {
        // 子类可重写
    }

    isEnabled(): boolean {
        return this.enabled;
    }

    abstract shouldTrigger(): boolean;
    abstract getNextInterval(): number;

    onCompletionTriggered(): void {
        // 子类可重写
    }

    configure(config: any): void {
        this.config = config;
        this.enabled = config.enabled !== false;
    }

    getStatus(): StrategyStatus {
        return {
            currentInterval: this.getNextInterval(),
            nextTriggerTime: new Date(Date.now() + this.getNextInterval()),
            additionalInfo: this.getAdditionalStatusInfo()
        };
    }

    protected getAdditionalStatusInfo(): Record<string, any> {
        return {};
    }
}