import * as vscode from 'vscode';
import * as path from 'path';

export class FileManager implements vscode.Disposable {
    private testFiles: vscode.Uri[] = [];
    private currentFileIndex = 0;

    public async createTestFile(): Promise<vscode.TextEditor | undefined> {
        try {
            const workspaceFolder = vscode.workspace.workspaceFolders?.[0];
            if (!workspaceFolder) {
                // Create a new untitled document
                return await this.createUntitledDocument();
            }

            const config = vscode.workspace.getConfiguration('autoCodeCompletion');
            const supportedLanguages = config.get('supportedLanguages', ['javascript']);
            const language = supportedLanguages[this.currentFileIndex % supportedLanguages.length];
            
            const fileName = `test_completion_${Date.now()}.${this.getFileExtension(language)}`;
            const filePath = path.join(workspaceFolder.uri.fsPath, '.vscode', 'auto-completion-tests', fileName);
            const fileUri = vscode.Uri.file(filePath);

            // Ensure directory exists
            await this.ensureDirectoryExists(path.dirname(filePath));

            // Create file with initial content
            const initialContent = this.getInitialContent(language);
            const edit = new vscode.WorkspaceEdit();
            edit.createFile(fileUri, { ignoreIfExists: true });
            edit.insert(fileUri, new vscode.Position(0, 0), initialContent);
            
            await vscode.workspace.applyEdit(edit);
            
            // Open the file
            const document = await vscode.workspace.openTextDocument(fileUri);
            const editor = await vscode.window.showTextDocument(document);
            
            this.testFiles.push(fileUri);
            this.currentFileIndex++;
            
            return editor;
        } catch (error) {
            console.error('Error creating test file:', error);
            return await this.createUntitledDocument();
        }
    }

    private async createUntitledDocument(): Promise<vscode.TextEditor | undefined> {
        try {
            const config = vscode.workspace.getConfiguration('autoCodeCompletion');
            const supportedLanguages = config.get('supportedLanguages', ['javascript']);
            const language = supportedLanguages[this.currentFileIndex % supportedLanguages.length];
            
            const document = await vscode.workspace.openTextDocument({
                language: language,
                content: this.getInitialContent(language)
            });
            
            const editor = await vscode.window.showTextDocument(document);
            this.currentFileIndex++;
            
            return editor;
        } catch (error) {
            console.error('Error creating untitled document:', error);
            return undefined;
        }
    }

    private async ensureDirectoryExists(dirPath: string): Promise<void> {
        try {
            const dirUri = vscode.Uri.file(dirPath);
            await vscode.workspace.fs.createDirectory(dirUri);
        } catch (error) {
            // Directory might already exist, ignore error
        }
    }

    private getFileExtension(language: string): string {
        const extensions: { [key: string]: string } = {
            'javascript': 'js',
            'typescript': 'ts',
            'python': 'py',
            'java': 'java',
            'csharp': 'cs',
            'cpp': 'cpp',
            'go': 'go',
            'rust': 'rs',
            'php': 'php',
            'ruby': 'rb'
        };
        
        return extensions[language] || 'txt';
    }

    private getInitialContent(language: string): string {
        const templates: { [key: string]: string } = {
            'javascript': `// Auto-generated test file for code completion
function calculateSum(a, b) {
    return a + b;
}

function processArray(arr) {
    return arr.map(item => {
        // Add completion trigger point here
        
    });
}

class DataProcessor {
    constructor(data) {
        this.data = data;
    }
    
    process() {
        // Completion point
        
    }
}

// More completion opportunities
const result = `,

            'typescript': `// Auto-generated test file for code completion
interface User {
    id: number;
    name: string;
    email: string;
}

class UserService {
    private users: User[] = [];
    
    addUser(user: User): void {
        // Completion point
        
    }
    
    findUser(id: number): User | undefined {
        return this.users.find(user => {
            // Completion trigger
            
        });
    }
}

function processUsers(users: User[]): string[] {
    return users.map(user => {
        // Add completion here
        
    });
}

const service = new UserService();
`,

            'python': `# Auto-generated test file for code completion
class DataProcessor:
    def __init__(self, data):
        self.data = data
    
    def process_data(self):
        # Completion point
        
    
    def filter_data(self, condition):
        return [item for item in self.data if 
                # Completion trigger
                ]

def calculate_statistics(numbers):
    total = sum(numbers)
    # Add completion here
    

def main():
    processor = DataProcessor([1, 2, 3, 4, 5])
    # Completion opportunity
    
`,

            'java': `// Auto-generated test file for code completion
public class DataProcessor {
    private List<String> data;
    
    public DataProcessor(List<String> data) {
        this.data = data;
    }
    
    public List<String> processData() {
        return data.stream()
            .filter(item -> {
                // Completion point
                
            })
            .map(item -> {
                // Another completion point
                
            })
            .collect(Collectors.toList());
    }
    
    public void printResults() {
        // Completion trigger
        
    }
}
`,

            'csharp': `// Auto-generated test file for code completion
using System;
using System.Collections.Generic;
using System.Linq;

public class DataProcessor
{
    private List<string> data;
    
    public DataProcessor(List<string> data)
    {
        this.data = data;
    }
    
    public IEnumerable<string> ProcessData()
    {
        return data.Where(item => {
            // Completion point
            
        }).Select(item => {
            // Another completion point
            
        });
    }
    
    public void PrintResults()
    {
        // Completion trigger
        
    }
}
`,

            'cpp': `// Auto-generated test file for code completion
#include <iostream>
#include <vector>
#include <algorithm>

class DataProcessor {
private:
    std::vector<int> data;
    
public:
    DataProcessor(const std::vector<int>& data) : data(data) {}
    
    void processData() {
        std::for_each(data.begin(), data.end(), [](int& item) {
            // Completion point
            
        });
    }
    
    void printResults() {
        // Completion trigger
        
    }
};

int main() {
    DataProcessor processor({1, 2, 3, 4, 5});
    // Completion opportunity
    
    return 0;
}
`,

            'go': `// Auto-generated test file for code completion
package main

import (
    "fmt"
)

type DataProcessor struct {
    data []int
}

func NewDataProcessor(data []int) *DataProcessor {
    return &DataProcessor{data: data}
}

func (dp *DataProcessor) ProcessData() []int {
    result := make([]int, 0, len(dp.data))
    for _, item := range dp.data {
        // Completion point
        
    }
    return result
}

func (dp *DataProcessor) PrintResults() {
    // Completion trigger
    
}

func main() {
    processor := NewDataProcessor([]int{1, 2, 3, 4, 5})
    // Completion opportunity
    
}
`
        };
        
        return templates[language] || `// Auto-generated test file
// Add your code here for completion testing

`;
    }

    public async cleanupTestFiles(): Promise<void> {
        for (const fileUri of this.testFiles) {
            try {
                await vscode.workspace.fs.delete(fileUri);
            } catch (error) {
                console.error('Error deleting test file:', error);
            }
        }
        this.testFiles = [];
    }

    public dispose(): void {
        // Optionally cleanup test files on dispose
        // this.cleanupTestFiles();
    }
}
