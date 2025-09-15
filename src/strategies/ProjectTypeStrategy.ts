import { BaseStrategy } from './BaseStrategy';
import { ProjectTypeConfig } from './ICompletionStrategy';
import * as vscode from 'vscode';

export class ProjectTypeStrategy extends BaseStrategy {
    private projectTypes: Map<string, ProjectTypeConfig> = new Map();
    private defaultInterval: number = 5000;
    private currentFileType: string = 'default';

    constructor() {
        super('projectType', '根据项目类型和文件类型调整补全频率');
        this.initializeProjectTypes();
    }

    private initializeProjectTypes(): void {
        // 默认项目类型配置
        this.projectTypes.set('frontend', {
            patterns: ['*.jsx', '*.tsx', '*.vue', '*.svelte', '*.html', '*.css', '*.scss', '*.less'],
            interval: 3000
        });

        this.projectTypes.set('backend', {
            patterns: ['*.java', '*.py', '*.go', '*.rs', '*.rb', '*.php', '*.cs'],
            interval: 5000
        });

        this.projectTypes.set('config', {
            patterns: ['*.json', '*.yaml', '*.yml', '*.xml', '*.toml', '*.ini', '*.env'],
            interval: 10000
        });

        this.projectTypes.set('documentation', {
            patterns: ['*.md', '*.mdx', '*.rst', '*.txt', '*.adoc'],
            interval: 15000
        });

        this.projectTypes.set('test', {
            patterns: ['*.test.*', '*.spec.*', '*_test.*', '*_spec.*', 'test_*.*'],
            interval: 8000
        });

        this.projectTypes.set('database', {
            patterns: ['*.sql', '*.prisma', '*.graphql', '*.gql'],
            interval: 7000
        });
    }

    async initialize(): Promise<void> {
        // 监听活动编辑器变化
        vscode.window.onDidChangeActiveTextEditor((editor) => {
            if (editor) {
                this.updateCurrentFileType(editor.document.fileName);
            }
        });

        // 初始检测
        const activeEditor = vscode.window.activeTextEditor;
        if (activeEditor) {
            this.updateCurrentFileType(activeEditor.document.fileName);
        }
    }

    private updateCurrentFileType(fileName: string): void {
        this.currentFileType = this.detectFileType(fileName);
    }

    private detectFileType(fileName: string): string {
        if (!fileName) {
            return 'default';
        }

        const lowerFileName = fileName.toLowerCase();

        // 遍历所有项目类型，找到匹配的
        for (const [typeName, config] of this.projectTypes.entries()) {
            for (const pattern of config.patterns) {
                if (this.matchPattern(lowerFileName, pattern)) {
                    return typeName;
                }
            }
        }

        // 如果没有匹配的，尝试根据文件扩展名判断
        const extension = this.getFileExtension(lowerFileName);
        if (extension) {
            return this.getTypeByExtension(extension);
        }

        return 'default';
    }

    private matchPattern(fileName: string, pattern: string): boolean {
        // 将通配符模式转换为正则表达式
        const regexPattern = pattern
            .replace(/\./g, '\\.')
            .replace(/\*/g, '.*')
            .replace(/\?/g, '.');

        const regex = new RegExp(regexPattern + '$');
        return regex.test(fileName);
    }

    private getFileExtension(fileName: string): string {
        const lastDot = fileName.lastIndexOf('.');
        if (lastDot === -1) {
            return '';
        }
        return fileName.substring(lastDot + 1);
    }

    private getTypeByExtension(extension: string): string {
        // 基于扩展名的额外映射
        const extensionMap: Record<string, string> = {
            'js': 'frontend',
            'ts': 'frontend',
            'jsx': 'frontend',
            'tsx': 'frontend',
            'java': 'backend',
            'py': 'backend',
            'go': 'backend',
            'rs': 'backend',
            'c': 'backend',
            'cpp': 'backend',
            'cs': 'backend',
            'sql': 'database',
            'md': 'documentation'
        };

        return extensionMap[extension] || 'default';
    }

    shouldTrigger(): boolean {
        return true;
    }

    getNextInterval(): number {
        const projectType = this.projectTypes.get(this.currentFileType);
        if (projectType) {
            return projectType.interval;
        }

        // 如果是自定义配置的类型
        const customTypes = this.config.projectTypes;
        if (customTypes && customTypes[this.currentFileType]) {
            return customTypes[this.currentFileType].interval;
        }

        return this.defaultInterval;
    }

    configure(config: any): void {
        super.configure(config);

        // 更新默认间隔
        if (config.defaultInterval !== undefined) {
            this.defaultInterval = config.defaultInterval;
        }

        // 添加或覆盖项目类型配置
        if (config.projectTypes) {
            for (const [typeName, typeConfig] of Object.entries(config.projectTypes)) {
                if (typeConfig && typeof typeConfig === 'object') {
                    const projectConfig = typeConfig as any;
                    if (projectConfig.patterns && projectConfig.interval) {
                        this.projectTypes.set(typeName, {
                            patterns: projectConfig.patterns,
                            interval: projectConfig.interval
                        });
                    }
                }
            }
        }

        // 重新检测当前文件类型
        const activeEditor = vscode.window.activeTextEditor;
        if (activeEditor) {
            this.updateCurrentFileType(activeEditor.document.fileName);
        }
    }

    protected getAdditionalStatusInfo(): Record<string, any> {
        const activeEditor = vscode.window.activeTextEditor;
        const fileName = activeEditor?.document.fileName || '无文件';
        const currentInterval = this.getNextInterval();

        return {
            currentFile: fileName.split(/[\\/]/).pop() || '无文件',
            currentFileType: this.currentFileType,
            projectType: this.getProjectTypeDescription(this.currentFileType),
            currentInterval: currentInterval,
            intervalFormatted: `${currentInterval / 1000}秒`,
            supportedTypes: Array.from(this.projectTypes.keys()),
            totalTypes: this.projectTypes.size
        };
    }

    private getProjectTypeDescription(type: string): string {
        const descriptions: Record<string, string> = {
            'frontend': '前端项目',
            'backend': '后端项目',
            'config': '配置文件',
            'documentation': '文档',
            'test': '测试文件',
            'database': '数据库',
            'default': '默认'
        };

        return descriptions[type] || type;
    }
}