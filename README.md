# Auto Code Completion - VSCode Extension

![Version](https://img.shields.io/badge/version-1.21.0-blue)
![VS Code](https://img.shields.io/badge/VS%20Code-^1.74.0-green)
![License](https://img.shields.io/badge/license-MIT-yellow)

## 📚 目录

- [项目介绍](#项目介绍)
- [核心特性](#核心特性)
- [安装指南](#安装指南)
- [快速开始](#快速开始)
- [配置说明](#配置说明)
- [使用教程](#使用教程)
- [开发指南](#开发指南)
- [故障排除](#故障排除)
- [版本历史](#版本历史)
- [贡献指南](#贡献指南)
- [许可证](#许可证)

## 项目介绍

### 🎯 项目背景

Auto Code Completion 是一款功能强大的 VSCode 扩展插件，专为测试和评估 AI 代码补全助手（如 GitHub Copilot、Tabnine、CodeWhisperer 等）而设计。通过自动化触发真实代码片段的补全，帮助开发者和研究人员评估 AI 代码助手的性能和准确性。

在现代软件开发中，AI代码助手已成为开发者的重要工具。为了评估和提升这些AI工具的代码补全质量，需要进行系统化的测试和评估。本插件正是为了解决这一需求而开发的，它能够自动化地触发AI代码补全，用于测试AI模型的代码理解能力、补全准确性和响应速度。

### ✨ 应用场景

**企业团队**
- 质量测试：系统化测试AI代码补全的准确性和实用性
- 技能提升：通过观察AI生成的代码学习新的编程模式
- 效率提升：在实际开发中更好地利用AI代码助手

**个人开发者**
- 学习工具：通过AI建议学习不同语言的最佳实践
- 开发效率：在日常开发中提高代码编写速度
- 技术探索：探索AI代码助手在不同场景下的能力

**教育培训**
- 教学辅助：帮助学生了解AI代码助手的使用方法
- 实践练习：提供丰富的代码场景进行练习
- 技能评估：通过统计数据评估AI工具使用效果

## 核心特性

### 🤖 AI代码助手集成
- **多AI支持** - 兼容 GitHub Copilot、Tabnine、CodeWhisperer 等主流 AI 代码助手
- **智能触发** - 专门触发AI内联建议而非VSCode自带的下拉建议

### 🎯 智能补全策略系统（新功能）
- **固定间隔策略** - 使用固定时间间隔触发补全
- **时间段策略** - 根据一天中不同时间段调整补全频率
- **工作日策略** - 区分工作日和周末的补全策略
- **活跃度策略** - 根据编码活跃度动态调整补全频率
- **项目类型策略** - 根据文件类型自动调整补全频率
- **组合策略** - 灵活组合多种策略使用
- **自动接受** - 多种方法自动接受AI生成的代码建议

### 🌍 多语言支持
支持10种主流编程语言，每种语言都包含专门设计的代码片段：

| 语言 | 代码片段数 | 主要场景 |
|------|-----------|----------|
| **JavaScript** | 3个 | 异步函数、React组件、Node.js服务器 |
| **TypeScript** | 1个 | 高级类型、泛型、接口定义 |
| **Python** | 3个 | 数据处理、Web API、机器学习 |
| **Java** | 1个 | Spring Boot API、服务层、JPA |
| **C#** | 1个 | .NET Core API、Entity Framework |
| **C++** | 1个 | 现代C++、智能指针、并发编程 |
| **Go** | 1个 | Web服务器、GORM、并发处理 |
| **Rust** | 1个 | Actix-web、SQLx、异步编程 |
| **PHP** | 1个 | Laravel API、Eloquent ORM |
| **Kotlin** | 1个 | Android应用、Jetpack Compose |

### 📚 智能代码片段系统
- **真实场景** - 基于实际项目的代码片段，提供丰富的业务上下文
- **精准补全点** - 在代码的关键位置标记"AI补全点"，提高触发成功率
- **随机选择** - 从代码片段库中随机选择，避免重复和单调
- **项目代码优先** - 自动检测用户项目代码，优先使用项目代码而非插件片段
- **自定义代码片段** - 支持用户配置多个自定义代码片段目录，灵活的优先级策略

### 🎛️ 可视化控制面板
- **侧边栏面板** - 直观的侧边栏 WebView 界面，实时监控补全状态
- **状态栏监控** - 底部状态栏实时显示运行状态和统计数据
- **高级设置管理** - 在控制面板中直接调整所有配置
- **主题适配** - 自动适配VSCode的亮色/暗色主题

### 📊 统计分析
- **实时统计** - 记录每日、每周、总计的AI补全次数
- **持久化存储** - 数据保存在VSCode全局状态中
- **智能重试** - 检测重复建议并自动切换触发策略
- **可视化显示** - 通过弹窗显示详细的统计信息

### ⚡ 灵活配置
- **触发间隔** - 可配置的补全周期间隔时间
- **每日限制** - 设置每日最大补全次数
- **AI偏好** - 选择首选的AI代码助手
- **等待时间** - 调节等待AI响应的时间
- **自定义片段目录** - 配置多个自定义代码片段目录
- **片段优先级** - 灵活的代码片段使用优先级策略

## 安装指南

### 系统要求

- **VSCode版本**: >= 1.74.0
- **Node.js**: >= 14.x（仅开发需要）
- **AI代码助手**: 需要安装至少一个（GitHub Copilot、Tabnine、CodeWhisperer等）

### 方式一：从 VSIX 文件安装（推荐）

1. **下载插件包**
   - 获取最新的 `auto-code-completion-1.20.1.vsix` 文件

2. **安装插件**
   ```
   1. 打开VSCode
   2. 按 Ctrl+Shift+P 打开命令面板
   3. 输入 "Extensions: Install from VSIX"
   4. 选择下载的 auto-code-completion-1.20.1.vsix 文件
   5. 等待安装完成，重启VSCode
   ```

3. **验证安装**
   - 按 `Ctrl+Shift+P`
   - 输入 "Auto Completion"
   - 应该能看到插件相关命令

### 方式二：从源码构建

```bash
# 克隆仓库
git clone https://github.com/ijijni/autoCodeCompletion.git
cd autoCodeCompletion

# 安装依赖
npm install

# 编译项目
npm run compile

# 打包扩展
node package-extension.js
```

## 快速开始

### ⚙️ 前置要求

#### 必须安装AI代码助手
插件需要配合以下任一AI代码助手使用：
- **GitHub Copilot** (推荐)
- **Tabnine**
- **AWS CodeWhisperer**
- **其他支持Tab键接受建议的AI助手**

#### 验证AI助手工作状态
在使用插件前，请确认AI助手正常工作：

1. **创建测试文件**（如 `test.js`）
2. **输入代码**：
   ```javascript
   function calculateSum(a, b) {
       return // 停止输入，等待AI建议
   ```
3. **等待3-5秒**，应该看到灰色的内联AI建议
4. **按Tab键**，应该能接受AI建议

### 🎯 基础使用

#### 1. 启动插件
- **方法一**：点击VSCode左侧活动栏的 **🤖 AI代码补全** 图标
- **方法二**：按 `Ctrl+Shift+P` → 输入 "Start Auto Completion"
- **方法三**：点击底部状态栏的 **AI补全: 0/0** 状态指示器

#### 2. 控制补全
```
启动：Ctrl+Shift+P → "Start Auto Completion"
停止：Ctrl+Shift+P → "Stop Auto Completion"
手动触发：Ctrl+Shift+P → "Trigger Completion Once"
查看统计：Ctrl+Shift+P → "Show Completion Stats"
重置统计：Ctrl+Shift+P → "Reset Daily Stats"
```

#### 3. 使用快捷键

| 功能 | Windows/Linux | macOS |
|------|--------------|-------|
| 手动触发补全 | `Ctrl+Enter` | `Cmd+Enter` |
| 接受建议 | `Tab` | `Tab` |
| 上一个建议 | `Alt+[` | `Alt+[` |
| 下一个建议 | `Alt+]` | `Alt+]` |
| 切换问答面板 | `Alt+Shift+K` | `Alt+Shift+K` |
| 打开控制面板 | `Ctrl+Shift+P` | `Cmd+Shift+P` |

## 配置说明

打开VSCode设置（`Ctrl+,`），搜索 "Auto Code Completion"：

### 核心配置

```json
{
  "autoCodeCompletion.enabled": false,              // 启用自动补全
  "autoCodeCompletion.interval": 20000,             // 补全周期间隔（毫秒）
  "autoCodeCompletion.maxCompletionsPerDay": 100,   // 每日最大补全次数
  "autoCodeCompletion.aiWaitTime": 5000,            // 等待 AI 响应时间（毫秒）
  "autoCodeCompletion.supportedLanguages": [        // 支持的编程语言
    "javascript", "typescript", "python", "java"
  ]
}
```

### 补全策略配置（新功能）

```json
{
  "autoCodeCompletion.completionStrategy": "fixed",     // 选择补全策略
  "autoCodeCompletion.strategyConfig": {                // 策略配置参数
    // 时间段策略示例
    "timeSlot": {
      "timeSlots": [
        { "start": "09:00", "end": "12:00", "interval": 3000, "description": "上午工作" },
        { "start": "14:00", "end": "18:00", "interval": 5000, "description": "下午工作" }
      ],
      "defaultInterval": 30000
    },
    // 工作日策略示例
    "workday": {
      "workdays": { "interval": 5000, "enabled": true },
      "weekends": { "interval": 30000, "enabled": false }
    },
    // 活跃度策略示例
    "activity": {
      "activeInterval": 3000,
      "inactiveInterval": 30000,
      "inactiveThreshold": 60000
    }
  }
}
```

**可用策略类型：**
- `fixed` - 固定间隔策略
- `timeSlot` - 时间段策略
- `workday` - 工作日策略
- `activity` - 活跃度策略
- `projectType` - 项目类型策略
- `composite` - 组合策略

### 代码片段配置

```json
{
  "autoCodeCompletion.useCodeSnippets": true,                    // 使用内置代码片段
  "autoCodeCompletion.enableProjectCodeDetection": true,         // 启用项目代码检测
  "autoCodeCompletion.enableCustomSnippets": true,               // 启用自定义片段
  "autoCodeCompletion.customSnippetDirectories": [               // 自定义片段目录
    "./code-snippets",
    "./custom-snippets"
  ],
  "autoCodeCompletion.customSnippetPriority": "custom-first"     // 片段优先级策略
}
```

### 高级配置

```json
{
  "autoCodeCompletion.autoFocusOnCompletion": false,  // 触发时是否自动聚焦
  "autoCodeCompletion.maxRetryAttempts": 3,           // 最大重试次数
  "autoCodeCompletion.projectCodeMaxFiles": 50,       // 项目代码最大扫描文件数
  "autoCodeCompletion.projectCodeMaxFileSize": 51200, // 文件大小限制（字节）
  "autoCodeCompletion.snippetMaxLines": 30            // 片段最大行数
}
```

### 推荐配置（针对不同AI助手）

**GitHub Copilot用户：**
```json
{
  "autoCodeCompletion.aiWaitTime": 3000,
  "autoCodeCompletion.interval": 20000
}
```

**Tabnine用户：**
```json
{
  "autoCodeCompletion.aiWaitTime": 5000,
  "autoCodeCompletion.interval": 25000
}
```

**CodeWhisperer用户：**
```json
{
  "autoCodeCompletion.aiWaitTime": 4000,
  "autoCodeCompletion.interval": 22000
}
```

## 使用教程

### 🆕 控制面板功能

#### 访问控制面板的多种方式

1. **侧边栏面板（推荐）**
   - 点击VSCode左侧活动栏的 **🤖 AI代码补全** 图标
   - 在侧边栏中直接操作控制面板
   - 无需打开新窗口，随时可用

2. **状态栏快捷入口**
   - 查看VSCode底部状态栏右侧
   - 点击 **AI补全: 0/0** 状态指示器
   - 实时显示运行状态和统计数据

3. **通过命令**
   ```
   Ctrl+Shift+P → "Show Control Panel"
   ```

#### 控制面板功能介绍

**状态监控**
- 实时显示插件运行状态（运行中/已停止）
- 查看今日补全次数、总补全次数
- 显示最后补全时间

**快速控制**
- 启动/停止按钮：一键控制自动补全的启动和停止
- 触发一次补全：立即执行一次代码补全
- 查看详细统计：弹出统计信息窗口
- 重置统计数据：清空今日的补全计数

**设置管理**
直接在控制面板中调整所有配置，修改后立即生效，无需重启。

### 🆕 自定义代码片段功能

#### 配置自定义目录
1. **打开VSCode设置** (`Ctrl+,`)
2. **搜索** "Auto Code Completion"
3. **找到** "Custom Snippet Directories" 配置项
4. **添加目录路径**：
   ```json
   [
     "./my-snippets",           // 相对于工作区根目录
     "./templates/code",        // 支持子目录
     "C:/MyCodeTemplates",      // 绝对路径(Windows)
     "/home/user/snippets"      // 绝对路径(Linux/Mac)
   ]
   ```

#### 目录结构建议
推荐按语言组织您的自定义代码片段：
```
my-snippets/
├── javascript/
│   ├── react-hooks.js
│   ├── async-patterns.js
│   └── api-client.js
├── python/
│   ├── data-analysis.py
│   ├── web-scraping.py
│   └── ml-models.py
├── typescript/
│   ├── interfaces.ts
│   └── generics.ts
└── java/
    └── spring-controllers.java
```

#### 代码片段编写技巧
1. **添加AI补全点**：在代码中添加注释标记
   ```javascript
   function processData(data) {
       // AI补全点: 数据验证逻辑
       
       const result = data.map(item => {
           // AI补全点: 数据转换逻辑
           
       });
       
       // AI补全点: 返回处理结果
       
   }
   ```

2. **保持代码完整性**：确保代码片段是完整的、可运行的代码块
3. **包含业务上下文**：添加有意义的变量名和注释
4. **适当的代码长度**：建议每个片段10-50行代码

#### 优先级策略
通过 `customSnippetPriority` 配置控制代码片段的使用优先级：
- **custom-first** (默认): 自定义 → 项目代码 → 内置片段
- **builtin-first**: 内置片段 → 自定义 → 项目代码
- **custom-only**: 仅使用自定义片段
- **builtin-only**: 仅使用内置片段

### 📈 使用建议

#### 日常使用策略
1. **设定目标**：设置每日补全次数
2. **分时段运行**：工作日分几个时段运行
3. **监控进度**：定期查看统计数据
4. **质量检查**：偶尔查看生成的代码质量
5. **快速访问**：选择最适合的访问方式（侧边栏、状态栏、控制面板）
6. **熟练快捷键**：提高操作效率

#### 注意事项
- 遵守公司AI工具使用政策
- 不要过度依赖自动化
- 保持代码质量和学习态度
- 定期检查生成的代码内容

## 开发指南

### 环境要求

- Node.js >= 14.x
- VSCode >= 1.74.0
- TypeScript >= 4.9.4

### 项目结构

```
auto-code-completion/
├── src/                          # TypeScript源代码
│   ├── extension.ts              # 插件入口文件
│   ├── autoCompletionManager.ts  # 自动补全管理器（核心）
│   ├── codeSnippetManager.ts     # 代码片段管理器
│   ├── controlPanelManager.ts    # 控制面板管理器
│   ├── sidebarProvider.ts        # 侧边栏提供器
│   ├── stateManager.ts           # 状态管理器
│   ├── statsManager.ts           # 统计管理器
│   ├── fileManager.ts            # 文件管理器
│   ├── qaManager.ts              # 问答管理器
│   └── suggestionManager.ts      # 建议管理器
├── out/                          # 编译输出目录
├── code-snippets/                # 内置代码片段库
│   ├── javascript/               # JavaScript片段（3个文件）
│   ├── typescript/               # TypeScript片段
│   ├── python/                   # Python片段（3个文件）
│   └── ...                       # 其他语言片段
├── package.json                  # 插件配置文件
├── tsconfig.json                 # TypeScript配置
└── package-extension.js          # 自定义打包脚本
```

### 核心组件说明

#### AutoCompletionManager（自动补全管理器）
**文件**: `src/autoCompletionManager.ts`  
**职责**:
- 管理自动补全的启动/停止
- 协调整个补全流程
- 处理AI触发和建议接受
- 管理定时器和补全周期

#### CodeSnippetManager（代码片段管理器）
**文件**: `src/codeSnippetManager.ts`  
**职责**:
- 管理三种代码片段来源（内置、项目、自定义）
- 随机选择代码片段
- 解析AI补全点标记
- 支持多语言代码片段加载

#### SidebarProvider（侧边栏提供器）
**文件**: `src/sidebarProvider.ts`  
**职责**:
- 提供WebView侧边栏界面
- 实时显示补全状态
- 提供控制按钮交互
- 显示统计信息

#### StateManager（状态管理器）
**文件**: `src/stateManager.ts`  
**职责**:
- 管理全局状态（单例模式）
- 同步配置设置
- 处理状态更新通知
- 管理运行状态

### 开发流程

```bash
# 安装依赖
npm install

# 编译项目（监听模式）
npm run watch

# 在 VSCode 中按 F5 启动调试

# 编译项目
npx tsc -p .

# 打包插件
node package-extension.js
```

### 打包流程

#### 自动打包（推荐）
```bash
# 编译TypeScript
npx tsc -p .

# 执行自动打包
node package-extension.js
```

打包脚本会自动：
1. 创建临时目录结构
2. 复制必要的文件（package.json、编译后的JS文件、代码片段）
3. 生成 `auto-code-completion-x.x.x.vsix` 文件
4. 清理临时文件

#### 手动打包
```bash
# 安装vsce工具
npm install -g vsce

# 打包插件
vsce package
```

### 代码规范

1. **文件大小限制**: 每个TypeScript文件不超过300行
2. **使用严格模式**: `"strict": true` 在tsconfig.json中启用
3. **模块化设计**: 每个管理器负责单一职责
4. **类型安全**: 充分利用TypeScript类型系统

### 架构原则

1. **单例模式**: StateManager使用单例模式确保状态一致性
2. **事件驱动**: 通过VSCode事件系统协调组件间通信
3. **配置驱动**: 所有行为通过配置项控制
4. **异步处理**: 使用async/await处理异步操作

## 故障排除

### 常见问题

#### 问题1：只看到下拉菜单，没有AI建议
**原因**：触发了VSCode自带建议而非AI助手  
**解决**：
- 设置 `"avoidVSCodeSuggestions": true`
- 增加 `aiWaitTime` 到8000毫秒
- 确认AI助手正常工作

#### 问题2：AI建议出现但不被接受
**解决**：
- 检查AI助手是否支持Tab键接受
- 增加等待时间
- 查看开发者控制台错误信息

#### 问题3：插件不工作
**解决**：
- 确认插件已启用：`"enabled": true`
- 重启VSCode
- 检查当前文件语言是否支持

#### 问题4：代码片段不加载
**解决**：
- 确认 `"useCodeSnippets": true`
- 检查代码片段目录是否存在
- 查看控制台错误信息

#### 问题5：重复的AI建议
**现象**：AI一直补全同一个建议  
**解决**：
- 插件已自动检测重复建议并切换触发策略
- 可调整 `"maxRetryAttempts"` 控制重试次数
- 检查AI助手是否正常工作

#### 问题6：项目代码未被使用
**现象**：插件仍使用内置代码片段而非项目代码  
**解决**：
- 确认 `"enableProjectCodeDetection": true`
- 检查项目是否包含足够的代码文件
- 查看控制台日志了解检测结果

#### 问题7：快捷键不工作
**现象**：快捷键按下后没有反应  
**解决**：
- 确认当前焦点在编辑器中
- 检查是否有其他插件占用了相同快捷键
- 在VSCode设置中搜索"keyboard shortcuts"检查冲突
- 尝试重启VSCode

#### 问题8：控制面板无法打开
**现象**：无法打开控制面板或面板显示异常  
**解决**：
- 确认插件版本为1.11.0或更高
- 使用命令面板执行"Show Control Panel"
- 检查VSCode版本是否≥1.74.0
- 查看开发者控制台(F12)是否有错误信息

#### 问题9：自定义代码片段未加载
**现象**：配置了自定义目录但插件仍使用内置片段  
**解决**：
- 确认 `"enableCustomSnippets": true`
- 检查目录路径是否正确（支持相对和绝对路径）
- 确认目录中包含有效的代码文件
- 查看开发者控制台的加载日志

### 调试方法

1. **开启开发者工具**：`帮助 → 切换开发人员工具`
2. **查看控制台**：搜索 "Auto Completion" 相关日志
3. **手动测试**：使用 "Trigger Completion Once" 测试
4. **检查配置**：确认所有配置项正确

### 日志信息
插件会在控制台输出详细的运行日志：
- 代码片段选择过程
- AI补全点识别
- 触发和接受过程
- 错误信息和异常

## 版本历史

查看完整的版本更新历史，请访问 [CHANGELOG.md](./CHANGELOG.md)

## 贡献指南

感谢您对 Auto Code Completion 项目的关注！我们欢迎并感激所有形式的贡献。

### 行为准则

参与本项目即表示您同意遵守我们的行为准则：
- 使用友善和包容的语言
- 尊重不同的观点和经验
- 优雅地接受建设性批评
- 关注对社区最有利的事情
- 对其他社区成员表示同情

### 如何贡献

#### 报告 Bug

在创建 bug 报告之前，请先搜索现有的 issues，看看是否已有人报告了相同的问题。

创建 bug 报告时，请包含：
- **清晰的标题和描述**
- **重现步骤**
- **预期行为** vs **实际行为**
- **截图**（如果适用）
- **环境信息**：VSCode 版本、插件版本、操作系统、AI 助手类型

#### 提出新功能

功能建议通过 GitHub Discussions 进行讨论。在提出新功能之前：
1. 检查是否已有类似的建议
2. 考虑这个功能是否符合项目的范围和目标
3. 提供详细的用例说明

#### Pull Request 流程

1. **Fork 项目**

2. **创建分支**
   ```bash
   git checkout -b feature/YourFeatureName
   # 或
   git checkout -b fix/YourBugFix
   ```

3. **编码规范**
   - 遵循现有的代码风格
   - 每个 TypeScript 文件不超过 300 行
   - 使用有意义的变量和函数名
   - 添加必要的注释
   - 确保代码通过 TypeScript 编译

4. **提交信息规范**
   ```
   <type>(<scope>): <subject>
   
   <body>
   
   <footer>
   ```
   
   类型（type）：
   - `feat`: 新功能
   - `fix`: Bug 修复
   - `docs`: 文档更新
   - `style`: 代码格式调整
   - `refactor`: 代码重构
   - `test`: 测试相关
   - `chore`: 构建过程或辅助工具的变动

5. **测试**
   - 确保所有现有测试通过
   - 为新功能添加测试
   - 手动测试您的更改

6. **更新文档**
   - 更新 README.md（如果需要）
   - 更新配置说明（如果添加了新配置）
   - 更新 CHANGELOG.md

7. **提交 Pull Request**
   - 清晰描述您的更改
   - 链接相关的 issue
   - 包含测试截图或 GIF（如果适用）

### 开发环境设置

```bash
# 克隆您的 fork
git clone https://github.com/yourusername/auto-code-completion.git
cd auto-code-completion

# 添加上游仓库
git remote add upstream https://github.com/ijijni/autoCodeCompletion.git

# 安装依赖
npm install

# 创建分支
git checkout -b your-feature-branch

# 开始开发
npm run watch
```

### 代码审查流程

所有提交都需要代码审查。我们会关注：
- **代码质量**：是否遵循编码规范
- **功能完整性**：是否完全实现了预期功能
- **测试覆盖**：是否有适当的测试
- **文档**：是否更新了相关文档
- **向后兼容性**：是否保持了向后兼容

### 发布流程

1. 更新版本号（package.json）
2. 更新 CHANGELOG.md
3. 创建 git tag
4. 构建并测试
5. 发布到 VSCode Marketplace

## 技术支持

### 获取帮助

- **问题反馈**：[GitHub Issues](https://github.com/ijijni/autoCodeCompletion/issues)
- **功能建议**：[GitHub Discussions](https://github.com/ijijni/autoCodeCompletion/discussions)
- **使用文档**：查看本README文档
- **开发文档**：查看源码中的注释

### 项目信息

- **项目类型**: VSCode扩展插件
- **主要用途**: AI代码补全测试工具
- **目标用户**: 开发团队、AI研究人员
- **维护重点**: 稳定性、兼容性、易用性

## 路线图

### 短期计划
- [ ] 支持更多编程语言（Swift、Dart、Scala）
- [ ] 支持更多 AI 助手（Codeium、Amazon Q）
- [ ] 添加代码片段质量评分机制
- [ ] 实现统计报告导出功能

### 长期愿景
- [ ] AI学习：分析用户使用模式，优化代码片段选择
- [ ] 团队协作：支持团队共享代码片段和统计数据
- [ ] 集成生态：与更多开发工具和平台集成
- [ ] 性能优化：优化大文件处理性能

## 许可证

本项目采用 MIT 许可证 - 查看 [LICENSE](LICENSE) 文件了解详情

## 致谢

感谢所有贡献者和使用者的支持！特别感谢：
- VSCode团队提供的优秀扩展API
- 各AI代码助手提供商的创新产品
- 开源社区的宝贵建议和贡献

---

**注意**：本工具仅用于测试和研究目的，请确保您有权使用相关的 AI 代码助手服务。

**最后更新时间**: 2025年9月15日  
**文档版本**: 2.0.0  
**适用插件版本**: 1.20.1+