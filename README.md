# CodexMonitor 中文语言包

> 💡 这是 CodexMonitor 的中文语言 mod，基于原项目 Fork 并添加中文翻译。

## 📦 简介

这是一个 **中文语言包 mod**，为 [CodexMonitor](https://github.com/Dimillian/CodexMonitor) 添加简体中文支持。

## 🚀 如何使用

### 方法 1: Fork 后构建

1. **Fork 本仓库** 到你的 GitHub 账户
2. **克隆到本地**:
   ```bash
   git clone https://github.com/YOUR_USERNAME/codex-monitor-i18n-zh.git
   cd codex-monitor-i18n-zh
   ```
3. **安装依赖**:
   ```bash
   npm install
   ```
4. **开发模式运行** (需要修复 Tauri 编译环境):
   ```bash
   npm run tauri:dev
   ```
5. **构建 Release 版本** (需要 MSVC 工具链):
   ```bash
   cd src-tauri
   cargo build --release
   ```

### 方法 2: 作为参考

如果你只想给原项目添加中文翻译，可以：

1. 克隆原项目: `git clone https://github.com/Dimillian/CodexMonitor.git`
2. 将 `src/i18n/translations.ts` 中的中文翻译复制到你的项目中

## 📝 翻译内容

- ✅ 所有设置页面中文翻译
- ✅ 18+ 个 UI 组件中文支持
- ✅ 57+ 个中文翻译键

## 🔧 环境要求

| 工具 | 说明 |
|------|------|
| Node.js | 18+ |
| Rust | 1.70+ |
| MSVC | Windows 编译需要 (Build Tools 2022) |

## 📚 相关资源

- **原项目**: https://github.com/Dimillian/CodexMonitor
- **i18n 库**: https://github.com/glei4134-collab/react-simple-i18n

## 📄 许可证

MIT License - 与原项目相同