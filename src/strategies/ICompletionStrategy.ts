export interface ICompletionStrategy {
    readonly name: string;
    readonly description: string;

    initialize(): Promise<void>;
    dispose(): void;

    isEnabled(): boolean;
    shouldTrigger(): boolean;
    getNextInterval(): number;
    onCompletionTriggered(): void;
    configure(config: any): void;

    getStatus(): StrategyStatus;
}

export interface StrategyStatus {
    currentInterval: number;
    nextTriggerTime?: Date;
    additionalInfo?: Record<string, any>;
}

export enum StrategyType {
    Fixed = 'fixed',
    TimeSlot = 'timeSlot',
    Workday = 'workday',
    Activity = 'activity',
    ProjectType = 'projectType',
    Composite = 'composite'
}

export interface TimeSlot {
    start: string;
    end: string;
    interval: number;
    description?: string;
}

export interface WorkdayConfig {
    days: string[];
    interval: number;
    enabled: boolean;
}

export interface ActivityConfig {
    inactiveThreshold: number;
    activeInterval: number;
    inactiveInterval: number;
    activityWindow: number;
    minEditCount: number;
}

export interface ProjectTypeConfig {
    patterns: string[];
    interval: number;
}

export interface CompositeStrategyConfig {
    strategies: string[];
    mode: 'intersection' | 'union' | 'priority';
    priority?: string[];
}