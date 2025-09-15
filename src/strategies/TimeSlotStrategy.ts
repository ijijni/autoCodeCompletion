import { BaseStrategy } from './BaseStrategy';
import { TimeSlot } from './ICompletionStrategy';

export class TimeSlotStrategy extends BaseStrategy {
    private timeSlots: TimeSlot[] = [];
    private defaultInterval: number = 30000;
    private timezone: string = 'Asia/Shanghai';

    constructor() {
        super('timeSlot', '根据时间段调整补全频率');
    }

    shouldTrigger(): boolean {
        return true;
    }

    getNextInterval(): number {
        const currentSlot = this.getCurrentTimeSlot();
        return currentSlot ? currentSlot.interval : this.defaultInterval;
    }

    private getCurrentTimeSlot(): TimeSlot | null {
        const now = new Date();
        const currentTime = this.formatTime(now);

        for (const slot of this.timeSlots) {
            if (this.isTimeInSlot(currentTime, slot)) {
                return slot;
            }
        }

        return null;
    }

    private formatTime(date: Date): string {
        const hours = date.getHours().toString().padStart(2, '0');
        const minutes = date.getMinutes().toString().padStart(2, '0');
        return `${hours}:${minutes}`;
    }

    private isTimeInSlot(time: string, slot: TimeSlot): boolean {
        // 处理跨天的时间段（如 22:00 到 02:00）
        if (slot.start > slot.end) {
            return time >= slot.start || time <= slot.end;
        }
        return time >= slot.start && time <= slot.end;
    }

    configure(config: any): void {
        super.configure(config);
        this.timeSlots = config.timeSlots || [];
        this.defaultInterval = config.defaultInterval || 30000;
        this.timezone = config.timezone || 'Asia/Shanghai';
    }

    protected getAdditionalStatusInfo(): Record<string, any> {
        const currentSlot = this.getCurrentTimeSlot();
        const now = new Date();

        return {
            currentTime: this.formatTime(now),
            currentTimeSlot: currentSlot?.description || '默认时段',
            currentInterval: currentSlot?.interval || this.defaultInterval,
            intervalFormatted: `${(currentSlot?.interval || this.defaultInterval) / 1000}秒`,
            timezone: this.timezone,
            totalSlots: this.timeSlots.length
        };
    }
}