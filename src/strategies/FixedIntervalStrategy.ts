import { BaseStrategy } from './BaseStrategy';

export class FixedIntervalStrategy extends BaseStrategy {
    private interval: number = 5000;

    constructor() {
        super('fixed', '固定时间间隔触发补全');
    }

    shouldTrigger(): boolean {
        return true;
    }

    getNextInterval(): number {
        return this.interval;
    }

    configure(config: any): void {
        super.configure(config);
        this.interval = config.interval || 5000;
    }

    protected getAdditionalStatusInfo(): Record<string, any> {
        return {
            interval: this.interval,
            intervalFormatted: `${this.interval / 1000}秒`
        };
    }
}