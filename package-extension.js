const fs = require('fs');
const path = require('path');
const archiver = require('archiver');
const crypto = require('crypto');

// 生成UUID
function generateUUID() {
    return crypto.randomUUID();
}

// 创建VSIX包
async function createVSIXPackage() {
    const packageJson = JSON.parse(fs.readFileSync('package.json', 'utf8'));
    const vsixName = `${packageJson.name}-${packageJson.version}.vsix`;
    
    console.log(`Creating VSIX package: ${vsixName}`);
    
    // 删除旧的vsix文件
    if (fs.existsSync(vsixName)) {
        fs.unlinkSync(vsixName);
        console.log(`Removed old ${vsixName}`);
    }
    
    // 创建输出流
    const output = fs.createWriteStream(vsixName);
    const archive = archiver('zip', {
        zlib: { level: 9 }
    });
    
    output.on('close', function() {
        console.log(`VSIX package created successfully: ${vsixName}`);
        console.log(`Package size: ${(archive.pointer() / 1024).toFixed(2)} KB`);
        console.log('\nTo install the extension:');
        console.log(`1. Open VSCode`);
        console.log(`2. Press Ctrl+Shift+P`);
        console.log(`3. Type "Extensions: Install from VSIX"`);
        console.log(`4. Select the file: ${vsixName}`);
    });
    
    archive.on('error', function(err) {
        throw err;
    });
    
    archive.pipe(output);
    
    // 创建extension.vsixmanifest
    const manifestContent = `<?xml version="1.0" encoding="utf-8"?>
<PackageManifest Version="2.0.0" xmlns="http://schemas.microsoft.com/developer/vsx-schema/2011" xmlns:d="http://schemas.microsoft.com/developer/vsx-schema-design/2011">
  <Metadata>
    <Identity Language="en-US" Id="${packageJson.name}" Version="${packageJson.version}" Publisher="${packageJson.publisher || 'unknown'}" />
    <DisplayName>${packageJson.displayName || packageJson.name}</DisplayName>
    <Description xml:space="preserve">${packageJson.description || ''}</Description>
    <Tags>${(packageJson.keywords || []).join(',')}</Tags>
    <Categories>Other</Categories>
    <GalleryFlags>Public</GalleryFlags>
    <Badges></Badges>
    <Properties>
      <Property Id="Microsoft.VisualStudio.Code.Engine" Value="${packageJson.engines?.vscode || '^1.60.0'}" />
      <Property Id="Microsoft.VisualStudio.Code.ExtensionDependencies" Value="" />
      <Property Id="Microsoft.VisualStudio.Code.ExtensionPack" Value="" />
      <Property Id="Microsoft.VisualStudio.Code.ExtensionKind" Value="workspace" />
      <Property Id="Microsoft.VisualStudio.Code.LocalizedLanguages" Value="" />
      <Property Id="Microsoft.VisualStudio.Services.Links.Source" Value="${packageJson.repository?.url || ''}" />
      <Property Id="Microsoft.VisualStudio.Services.Links.Repository" Value="${packageJson.repository?.url || ''}" />
      <Property Id="Microsoft.VisualStudio.Services.Links.GitHub" Value="${packageJson.repository?.url || ''}" />
    </Properties>
    ${packageJson.icon ? `<Icon>extension/${packageJson.icon}</Icon>` : ''}
  </Metadata>
  <Installation>
    <InstallationTarget Id="Microsoft.VisualStudio.Code"/>
  </Installation>
  <Dependencies/>
  <Assets>
    <Asset Type="Microsoft.VisualStudio.Code.Manifest" Path="extension/package.json" Addressable="true" />
    <Asset Type="Microsoft.VisualStudio.Services.Content.Details" Path="extension/README.md" Addressable="true" />
  </Assets>
</PackageManifest>`;
    
    archive.append(manifestContent, { name: 'extension.vsixmanifest' });
    
    // 创建[Content_Types].xml
    const contentTypes = `<?xml version="1.0" encoding="utf-8"?>
<Types xmlns="http://schemas.openxmlformats.org/package/2006/content-types">
  <Default Extension=".json" ContentType="application/json"/>
  <Default Extension=".vsixmanifest" ContentType="text/xml"/>
  <Default Extension=".md" ContentType="text/markdown"/>
  <Default Extension=".js" ContentType="application/javascript"/>
  <Default Extension=".ts" ContentType="text/plain"/>
  <Default Extension=".py" ContentType="text/plain"/>
  <Default Extension=".java" ContentType="text/plain"/>
  <Default Extension=".cpp" ContentType="text/plain"/>
  <Default Extension=".cs" ContentType="text/plain"/>
  <Default Extension=".go" ContentType="text/plain"/>
  <Default Extension=".rs" ContentType="text/plain"/>
  <Default Extension=".php" ContentType="text/plain"/>
  <Default Extension=".kt" ContentType="text/plain"/>
  <Default Extension=".png" ContentType="image/png"/>
  <Default Extension=".jpg" ContentType="image/jpg"/>
  <Default Extension=".jpeg" ContentType="image/jpeg"/>
  <Default Extension=".gif" ContentType="image/gif"/>
  <Default Extension=".svg" ContentType="image/svg+xml"/>
</Types>`;
    
    archive.append(contentTypes, { name: '[Content_Types].xml' });
    
    // 添加package.json
    archive.file('package.json', { name: 'extension/package.json' });
    
    // 添加README文件
    if (fs.existsSync('README.md')) {
        archive.file('README.md', { name: 'extension/README.md' });
    } else if (fs.existsSync('INSTALLATION_AND_USAGE.md')) {
        archive.file('INSTALLATION_AND_USAGE.md', { name: 'extension/README.md' });
    }
    
    // 添加LICENSE文件（如果存在）
    if (fs.existsSync('LICENSE')) {
        archive.file('LICENSE', { name: 'extension/LICENSE' });
    }
    
    // 添加CHANGELOG文件（如果存在）
    if (fs.existsSync('CHANGELOG.md')) {
        archive.file('CHANGELOG.md', { name: 'extension/CHANGELOG.md' });
    }
    
    // 添加图标文件（如果存在）
    if (packageJson.icon && fs.existsSync(packageJson.icon)) {
        archive.file(packageJson.icon, { name: `extension/${packageJson.icon}` });
    }
    
    // 添加编译后的JS文件
    if (fs.existsSync('out')) {
        archive.directory('out/', 'extension/out/', { date: new Date() });
    }
    
    // 添加代码片段目录
    if (fs.existsSync('code-snippets')) {
        archive.directory('code-snippets/', 'extension/code-snippets/', { date: new Date() });
    }
    
    // 添加webview资源（如果存在）
    if (fs.existsSync('webview')) {
        archive.directory('webview/', 'extension/webview/', { date: new Date() });
    }
    
    // 添加media资源（如果存在）
    if (fs.existsSync('media')) {
        archive.directory('media/', 'extension/media/', { date: new Date() });
    }
    
    // 添加resources资源（如果存在）
    if (fs.existsSync('resources')) {
        archive.directory('resources/', 'extension/resources/', { date: new Date() });
    }
    
    // 添加snippets（如果存在）
    if (fs.existsSync('snippets')) {
        archive.directory('snippets/', 'extension/snippets/', { date: new Date() });
    }
    
    // 添加syntaxes（如果存在）
    if (fs.existsSync('syntaxes')) {
        archive.directory('syntaxes/', 'extension/syntaxes/', { date: new Date() });
    }
    
    // 添加themes（如果存在）
    if (fs.existsSync('themes')) {
        archive.directory('themes/', 'extension/themes/', { date: new Date() });
    }
    
    // 完成打包
    await archive.finalize();
}

// 主函数
async function main() {
    // 检查是否有编译后的文件
    if (!fs.existsSync('out')) {
        console.error('Error: out directory not found.');
        console.log('Compiling TypeScript files...');
        const { execSync } = require('child_process');
        try {
            execSync('npx tsc -p .', { stdio: 'inherit' });
            console.log('Compilation completed successfully.\n');
        } catch (compileError) {
            console.error('Failed to compile TypeScript files.');
            process.exit(1);
        }
    }
    
    // 检查并安装archiver
    try {
        require('archiver');
    } catch (e) {
        console.log('Installing archiver...');
        const { execSync } = require('child_process');
        try {
            execSync('npm install archiver', { stdio: 'inherit' });
            console.log('Archiver installed successfully.\n');
        } catch (installError) {
            console.error('Failed to install archiver. Please run: npm install archiver');
            process.exit(1);
        }
    }
    
    // 创建VSIX包
    try {
        await createVSIXPackage();
    } catch (error) {
        console.error('Error creating VSIX package:', error.message);
        process.exit(1);
    }
}

// 运行主函数
main().catch(error => {
    console.error('Unexpected error:', error);
    process.exit(1);
});