import * as vscode from 'vscode';

export interface SuggestionItem {
    text: string;
    position: vscode.Position;
    timestamp: number;
}

export class SuggestionManager implements vscode.Disposable {
    private suggestions: SuggestionItem[] = [];
    private currentIndex: number = -1;
    private maxSuggestions: number = 10;
    private lastPosition: vscode.Position | null = null;

    constructor() {}

    public addSuggestion(text: string, position: vscode.Position): void {
        const suggestion: SuggestionItem = {
            text,
            position,
            timestamp: Date.now()
        };

        // 避免重复添加相同的建议
        const isDuplicate = this.suggestions.some(s => 
            s.text === text && 
            s.position.line === position.line && 
            s.position.character === position.character
        );

        if (!isDuplicate) {
            this.suggestions.unshift(suggestion);
            
            // 限制建议数量
            if (this.suggestions.length > this.maxSuggestions) {
                this.suggestions = this.suggestions.slice(0, this.maxSuggestions);
            }
            
            this.currentIndex = 0;
        }
    }

    public async previousSuggestion(): Promise<void> {
        if (this.suggestions.length === 0) {
            vscode.window.showInformationMessage('暂无可用的代码建议');
            return;
        }

        this.currentIndex = (this.currentIndex + 1) % this.suggestions.length;
        await this.applySuggestion(this.currentIndex);
    }

    public async nextSuggestion(): Promise<void> {
        if (this.suggestions.length === 0) {
            vscode.window.showInformationMessage('暂无可用的代码建议');
            return;
        }

        this.currentIndex = this.currentIndex <= 0 ? 
            this.suggestions.length - 1 : 
            this.currentIndex - 1;
        await this.applySuggestion(this.currentIndex);
    }

    private async applySuggestion(index: number): Promise<void> {
        if (index < 0 || index >= this.suggestions.length) {
            return;
        }

        const suggestion = this.suggestions[index];
        const editor = vscode.window.activeTextEditor;

        if (!editor) {
            vscode.window.showWarningMessage('没有活动的编辑器');
            return;
        }

        try {
            // 显示建议信息
            const message = `建议 ${index + 1}/${this.suggestions.length}: ${suggestion.text.substring(0, 50)}${suggestion.text.length > 50 ? '...' : ''}`;
            vscode.window.showInformationMessage(message);

            // 尝试触发内联建议
            await this.triggerInlineSuggestion(editor, suggestion);

        } catch (error) {
            console.error('应用建议时出错:', error);
            vscode.window.showErrorMessage('应用代码建议失败');
        }
    }

    private async triggerInlineSuggestion(editor: vscode.TextEditor, suggestion: SuggestionItem): Promise<void> {
        // 移动光标到建议位置
        const position = suggestion.position;
        editor.selection = new vscode.Selection(position, position);

        // 尝试触发内联建议
        const commands = [
            'editor.action.inlineSuggest.trigger',
            'github.copilot.generate',
            'editor.action.triggerSuggest'
        ];

        for (const command of commands) {
            try {
                await vscode.commands.executeCommand(command);
                console.log(`成功触发建议命令: ${command}`);
                break;
            } catch (e) {
                console.log(`建议命令 ${command} 不可用`);
            }
        }
    }

    public async acceptCurrentSuggestion(): Promise<boolean> {
        const editor = vscode.window.activeTextEditor;
        if (!editor) {
            return false;
        }

        try {
            // 记录当前内容
            const beforeContent = editor.document.getText();
            const currentPosition = editor.selection.active;

            // 尝试多种接受建议的方法
            const acceptCommands = [
                'editor.action.inlineSuggest.commit',
                'github.copilot.acceptInlineSuggestion',
                'acceptSelectedSuggestion'
            ];

            let suggestionAccepted = false;

            for (const command of acceptCommands) {
                try {
                    await vscode.commands.executeCommand(command);
                    console.log(`成功执行接受命令: ${command}`);
                    
                    // 等待一下看是否有变化
                    await new Promise(resolve => setTimeout(resolve, 300));
                    
                    const afterContent = editor.document.getText();
                    if (afterContent !== beforeContent) {
                        suggestionAccepted = true;
                        
                        // 记录这个成功的建议
                        const newContent = afterContent.substring(beforeContent.length);
                        if (newContent.trim()) {
                            this.addSuggestion(newContent, currentPosition);
                        }
                        break;
                    }
                } catch (e) {
                    console.log(`接受命令 ${command} 执行失败`);
                }
            }

            // 如果上述方法都失败，尝试模拟Tab键
            if (!suggestionAccepted) {
                try {
                    await vscode.commands.executeCommand('type', { text: '\t' });
                    
                    await new Promise(resolve => setTimeout(resolve, 300));
                    
                    const finalContent = editor.document.getText();
                    if (finalContent !== beforeContent) {
                        suggestionAccepted = true;
                        console.log('通过Tab键成功接受建议');
                    }
                } catch (e) {
                    console.log('Tab键模拟失败');
                }
            }

            if (suggestionAccepted) {
                vscode.window.showInformationMessage('✅ 代码建议已采纳');
                return true;
            } else {
                vscode.window.showWarningMessage('⚠️ 未检测到可采纳的代码建议');
                return false;
            }

        } catch (error) {
            console.error('接受建议时出错:', error);
            vscode.window.showErrorMessage('接受代码建议失败');
            return false;
        }
    }

    public async manualTriggerCompletion(): Promise<void> {
        const editor = vscode.window.activeTextEditor;
        if (!editor) {
            vscode.window.showWarningMessage('没有活动的编辑器');
            return;
        }

        try {
            vscode.window.showInformationMessage('🚀 正在手动触发代码补全...');

            // 尝试多种触发方式
            const triggerCommands = [
                'editor.action.inlineSuggest.trigger',
                'github.copilot.generate',
                'github.copilot.triggerInlineCompletion',
                'tabnine.triggerCompletion',
                'aws.codeWhisperer.invokeInlineCompletion'
            ];

            let triggered = false;

            for (const command of triggerCommands) {
                try {
                    await vscode.commands.executeCommand(command);
                    console.log(`成功触发补全命令: ${command}`);
                    triggered = true;
                    break;
                } catch (e) {
                    console.log(`补全命令 ${command} 不可用`);
                }
            }

            if (triggered) {
                vscode.window.showInformationMessage('✅ 代码补全已触发，请等待AI建议');
            } else {
                // 如果所有命令都失败，尝试通用的建议触发
                try {
                    await vscode.commands.executeCommand('editor.action.triggerSuggest');
                    vscode.window.showInformationMessage('✅ 已触发代码建议');
                } catch (e) {
                    vscode.window.showWarningMessage('⚠️ 无法触发代码补全，请检查AI助手是否正确安装');
                }
            }

        } catch (error) {
            console.error('手动触发补全时出错:', error);
            vscode.window.showErrorMessage('手动触发代码补全失败');
        }
    }

    public getSuggestionCount(): number {
        return this.suggestions.length;
    }

    public getCurrentIndex(): number {
        return this.currentIndex;
    }

    public clearSuggestions(): void {
        this.suggestions = [];
        this.currentIndex = -1;
        console.log('建议历史已清空');
    }

    public getSuggestionHistory(): SuggestionItem[] {
        return [...this.suggestions];
    }

    public dispose(): void {
        this.clearSuggestions();
    }
}
