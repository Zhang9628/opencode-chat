# OpenCode Chat

AI 对话 UI 界面 —— 用户抛出话题后，两个 AI（AI-A 和 AI-B）围绕话题自动展开多轮讨论，用户可随时插话干预。

## 快速开始

### 安装依赖

```bash
npm install
```

### 启动开发服务器

```bash
npm run dev
```

打开浏览器访问 `http://localhost:5173/`。

### 生产构建

```bash
npm run build
npm run preview
```

## 功能

- **多轮自动讨论**：用户输入话题后，AI-A 和 AI-B 自动来回讨论
- **回复指向**：每条消息标注 `↩ 回复 XXX`，清晰展示对话脉络
- **打字机效果**：AI 回复逐字显示，带闪烁光标
- **轮数控制**：默认 5 轮讨论，达到上限自动停止
- **随时插话**：讨论进行中用户可随时发送消息干预
- **停止按钮**：一键停止当前讨论
- **Markdown 渲染**：支持代码块语法高亮、列表、引用等格式
- **自动滚动**：新消息出现时自动滚动到底部

## 技术栈

- React 19 + TypeScript
- Vite
- Tailwind CSS
- react-markdown + react-syntax-highlighter

## 项目结构

```
src/
├── main.tsx                  入口文件
├── App.tsx                   根组件，对话流转逻辑
├── types.ts                  类型定义
├── components/
│   ├── Header.tsx            顶栏（标题、轮数、停止按钮）
│   ├── MessageList.tsx       消息列表（自动滚动）
│   ├── MessageBubble.tsx     消息气泡
│   ├── ReplyTag.tsx          回复标签
│   ├── MarkdownBody.tsx      Markdown 渲染
│   └── InputBar.tsx          输入框
├── hooks/
│   ├── useChatReducer.ts     对话状态管理
│   └── useTypewriter.ts      打字机效果
├── mock/
│   └── responses.ts          模拟 AI 回复数据
└── styles/
    └── index.css             全局样式
```

## 当前状态

第一版使用本地模拟数据驱动，后续计划对接真实 LLM API。
