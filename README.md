# PageGPT 🤖

> 智能网页对话助手，让AI帮你理解任何网页内容

PageGPT是一个现代化的Chrome浏览器插件，通过AI对话的方式帮助用户深度理解和分析网页内容。只需点击插件图标，就能与AI助手开始关于当前页面的智能对话。

## ✨ 核心特性

### 🧠 智能页面理解
- **自动分析**: 智能提取页面标题、内容和关键信息
- **上下文对话**: 基于页面内容进行相关性回答
- **多轮问答**: 支持连续对话，AI记住对话历史

### ⚡ 流式对话体验
- **实时响应**: SSE流式输出，AI回复实时显示
- **打字效果**: 自然的打字动画，提供真实对话感
- **即时交互**: 无需等待，边思考边回复

### 📝 丰富内容展示
- **Markdown渲染**: 完整支持Markdown语法
- **代码高亮**: 集成highlight.js，支持多种编程语言
- **格式化内容**: 支持表格、列表、引用等复杂格式

### � 智能记忆系统
- **按页面分组**: 不同页面的聊天记录独立保存
- **持久化存储**: 关闭插件后重新打开，聊天记录自动恢复
- **智能清理**: 自动清理30天前的旧记录

### ⚙️ 灵活配置
- **多AI服务**: 支持OpenAI、Azure OpenAI等多种服务
- **自定义模型**: 可选择GPT-3.5、GPT-4等不同模型
- **个性化设置**: 自定义系统提示词调整AI行为风格

## � 快速开始

### 1. 安装插件
```bash
# 1. 下载项目
git clone https://github.com/your-username/PageGPT.git
cd PageGPT

# 2. 在Chrome中加载
# - 打开 chrome://extensions/
# - 开启"开发者模式"
# - 点击"加载已解压的扩展程序"
# - 选择项目文件夹
```

### 2. 配置API
1. 获取OpenAI API密钥：访问 [platform.openai.com](https://platform.openai.com/)
2. 点击插件图标，进入"设置"页面
3. 填入API密钥和相关配置
4. 点击"保存设置"

### 3. 开始对话
1. 在任意网页点击插件图标
2. 切换到"对话"页面
3. 向PageGPT提问关于当前页面的任何问题

## 💡 使用场景

### 📚 学习助手
```
"帮我总结这篇文章的要点"
"这个技术文档的核心概念是什么？"
"给我解释一下这个页面的代码示例"
```

### 🛍️ 购物顾问
```
"分析这个商品的优缺点"
"这个价格合理吗？"
"有什么需要注意的地方？"
```

### 📰 新闻分析
```
"这篇新闻的主要观点是什么？"
"帮我分析不同角度的看法"
"相关的背景信息有哪些？"
```

### 🔍 研究助手
```
"这个页面的可信度如何？"
"帮我找出关键数据和统计信息"
"总结这个研究的方法和结论"
```

## ⚙️ 高级配置

### API服务配置
支持多种AI服务提供商：

**OpenAI 标准配置**
```
Base URL: https://api.openai.com/v1/chat/completions
模型: gpt-3.5-turbo, gpt-4, gpt-4-turbo
```

**Azure OpenAI 配置**
```
Base URL: https://your-resource.openai.azure.com/openai/deployments/your-deployment/chat/completions?api-version=2023-05-15
模型: gpt-35-turbo (注意Azure中的命名格式)
```

### 自定义提示词示例
```javascript
// 幽默风格
"你是PageGPT，一个幽默风趣的网页助手。请用轻松有趣的方式分析页面内容。"

// 专业分析师
"你是PageGPT，一个专业的内容分析师。请提供深度、客观的页面分析。"

// 学习导师
"你是PageGPT，一个耐心的学习导师。请帮助用户理解页面内容并提供学习建议。"
```

## 🏗️ 项目结构

```
PageGPT/
├── 📄 manifest.json          # 插件配置文件
├── 🎨 popup.html             # 主界面 (设置+对话)
├── ⚡ popup.js               # 主逻辑 (SSE+Markdown)
├── 📝 popup-simple.html      # 简化版界面
├── 🔧 popup-simple.js        # 简化版逻辑
├── 🌐 content.js             # 页面内容提取
├── 💄 content.css            # 页面样式
├── 🔄 background.js          # 后台服务
├── 📊 markdown-renderer.js   # Markdown渲染器
├── 🖼️ icons/                 # 插件图标
├── 🧪 测试页面/
│   ├── chat-test.html
│   ├── debug-test.html
│   └── markdown-test.html
└── 📚 文档/
    ├── README.md
    ├── INSTALL.md
    └── CHANGELOG.md
```

## 🔧 技术栈

- **Chrome Extension Manifest V3** - 最新扩展API
- **Vanilla JavaScript (ES6+)** - 现代JS语法
- **Server-Sent Events (SSE)** - 流式响应
- **Markdown + highlight.js** - 富文本渲染
- **Chrome Storage API** - 本地数据存储
- **CSS3 + Flexbox** - 响应式设计

## ⚠️ 注意事项

- 🔑 **API密钥**: 需要有效的OpenAI API密钥
- 💰 **费用**: API调用会产生费用，请注意使用量
- 🛡️ **安全**: API密钥仅存储在本地，不会上传
- 🌐 **兼容性**: 某些网站的CSP策略可能影响功能
- 🔒 **隐私**: 插件不会收集或存储个人数据

## 🔧 故障排除

### 常见问题

**❌ API调用失败**
```
解决方案：
✅ 检查API密钥格式 (应以sk-开头)
✅ 确认OpenAI账户余额充足
✅ 验证网络连接正常
✅ 检查API使用限制
```

**❌ 插件无法加载**
```
解决方案：
✅ 确认开启了"开发者模式"
✅ 检查所有文件在正确位置
✅ 重新加载插件
✅ 查看控制台错误信息
```

**❌ 对话无响应**
```
解决方案：
✅ 确认已保存API设置
✅ 检查当前页面是否支持
✅ 刷新页面后重试
✅ 查看浏览器控制台
```

### 调试技巧
1. **查看控制台**: 按F12打开开发者工具
2. **检查网络**: 在Network标签查看API请求
3. **验证存储**: 检查Chrome存储中的设置
4. **测试页面**: 使用项目中的测试页面

## 🤝 贡献指南

欢迎参与PageGPT的开发！

### 开发环境
```bash
# 1. Fork并克隆项目
git clone https://github.com/your-username/PageGPT.git

# 2. 创建功能分支
git checkout -b feature/your-feature

# 3. 在Chrome中加载插件进行测试
# 4. 提交更改并创建Pull Request
```

### 贡献方式
- 🐛 **报告Bug**: 提交详细的Issue
- 💡 **功能建议**: 分享你的想法
- 📝 **改进文档**: 完善说明文档
- 🔧 **代码贡献**: 提交Pull Request

## 📄 许可证

MIT License - 详见 [LICENSE](LICENSE) 文件

## 📈 更新日志

### 🎉 v3.0.0 (当前版本) - PageGPT重大更新
- 🏷️ **品牌升级**: 重命名为PageGPT，更响亮的名字
- 🧹 **界面精简**: 移除环境检查功能，专注核心对话体验
- � **优化问候**: 简化助手问候语，更加简洁友好
- 🎨 **现代化设计**: 全新的界面设计和用户体验

### v2.2.0 - 智能记忆系统
- �💾 **聊天记录持久化**: 自动保存和恢复聊天历史
- 📄 **按页面分组**: 不同页面的聊天记录独立保存
- 🗑️ **智能清理**: 自动清理30天前的旧记录
- 📊 **聊天统计**: 显示消息数量、时间等统计信息
- ⚠️ **确认对话**: 清空聊天时显示确认提示

### v2.1.0 - 流式体验升级
- 🎉 **SSE流式输出**: 支持Server-Sent Events实时响应
- 📝 **Markdown渲染**: 完整支持Markdown格式和代码高亮
- ⚡ **流畅体验**: 打字光标动画和实时内容更新
- 🔧 **错误处理**: 增强的错误提示和恢复机制

### v2.0.0 - 对话界面重构
- 💬 **对话界面**: 重新设计为聊天式交互
- 🔄 **连续对话**: 支持多轮问答和上下文记忆
- ⚙️ **灵活配置**: 支持多种AI服务和自定义设置
- 🎨 **现代化UI**: 双页面设计和美观的聊天界面

### v1.0.0 - 初始版本
- 🚀 **基础功能**: AI分析和弹窗功能
- 🎛️ **自定义提示**: 支持自定义提示词
- 🎨 **现代UI**: 现代化界面设计

---

## 🌟 Star History

如果PageGPT对你有帮助，请给我们一个⭐️！

## 🔗 相关链接

- 📖 **详细文档**: [INSTALL.md](INSTALL.md)
- 🔄 **更新日志**: [CHANGELOG.md](CHANGELOG.md)
- 🐛 **问题反馈**: [GitHub Issues](https://github.com/your-username/PageGPT/issues)
- 💬 **讨论交流**: [GitHub Discussions](https://github.com/your-username/PageGPT/discussions)

---

<div align="center">

**PageGPT** - 让AI帮你理解任何网页 🤖✨

Made with ❤️ by the PageGPT Team

</div>
