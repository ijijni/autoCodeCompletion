import { BaseStrategy } from './BaseStrategy';
import { WorkdayConfig } from './ICompletionStrategy';

export class WorkdayStrategy extends BaseStrategy {
    private workdays: WorkdayConfig = {
        days: ['Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday'],
        interval: 5000,
        enabled: true
    };

    private weekends: WorkdayConfig = {
        days: ['Saturday', 'Sunday'],
        interval: 30000,
        enabled: false
    };

    private holidays: string[] = [];

    constructor() {
        super('workday', '区分工作日和周末的补全策略');
    }

    shouldTrigger(): boolean {
        const today = new Date();
        const isWeekend = this.isWeekend(today);
        const isHoliday = this.isHoliday(today);

        if (isHoliday || isWeekend) {
            return this.weekends.enabled;
        }

        return this.workdays.enabled;
    }

    getNextInterval(): number {
        const today = new Date();
        const isWeekend = this.isWeekend(today);
        const isHoliday = this.isHoliday(today);

        if (isHoliday || isWeekend) {
            return this.weekends.interval;
        }

        return this.workdays.interval;
    }

    private isWeekend(date: Date): boolean {
        const dayName = date.toLocaleDateString('en-US', { weekday: 'long' });
        return this.weekends.days.includes(dayName);
    }

    private isHoliday(date: Date): boolean {
        const dateString = date.toISOString().split('T')[0];
        return this.holidays.includes(dateString);
    }

    private getDayName(date: Date): string {
        return date.toLocaleDateString('zh-CN', { weekday: 'long' });
    }

    configure(config: any): void {
        super.configure(config);
        if (config.workdays) {
            this.workdays = { ...this.workdays, ...config.workdays };
        }
        if (config.weekends) {
            this.weekends = { ...this.weekends, ...config.weekends };
        }
        this.holidays = config.holidays || [];
    }

    protected getAdditionalStatusInfo(): Record<string, any> {
        const today = new Date();
        const isWeekend = this.isWeekend(today);
        const isHoliday = this.isHoliday(today);
        const dayName = this.getDayName(today);
        const englishDayName = today.toLocaleDateString('en-US', { weekday: 'long' });

        let dayType = '工作日';
        let currentConfig = this.workdays;

        if (isHoliday) {
            dayType = '节假日';
            currentConfig = this.weekends;
        } else if (isWeekend) {
            dayType = '周末';
            currentConfig = this.weekends;
        }

        return {
            currentDay: dayName,
            currentDayEn: englishDayName,
            dayType: dayType,
            isEnabled: currentConfig.enabled,
            currentInterval: currentConfig.interval,
            intervalFormatted: `${currentConfig.interval / 1000}秒`,
            nextHoliday: this.getNextHoliday()
        };
    }

    private getNextHoliday(): string | null {
        const today = new Date();
        const todayString = today.toISOString().split('T')[0];

        const futureHolidays = this.holidays
            .filter(holiday => holiday > todayString)
            .sort();

        return futureHolidays.length > 0 ? futureHolidays[0] : null;
    }
}