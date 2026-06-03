# 浏览器自动化 Demo

这是一个 Web UI 与浏览器自动化结合的实验性项目，适合作为自动化交互能力的展示。

## 核心功能

- 基于 Gradio 的 Web UI
- 浏览器自动化交互与任务执行
- 支持多种 LLM：OpenAI / Azure / Ollama
- 可配置自定义浏览器与会话持久化

## 技术栈

- Python
- Gradio
- Playwright
- browser-use / 浏览器自动化

## 运行方式

```bash
python webui.py --ip 127.0.0.1 --port 7788
```

打开浏览器访问：

```text
http://127.0.0.1:7788
```

## 亮点

- 适用于展示自动化产品化探索
- 兼具前端交互与自动化技术
- 可继续扩展为更完整的浏览器控制平台
