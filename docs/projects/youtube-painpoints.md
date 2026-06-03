# YouTube Pain Point Pipeline

基于关键字抓取候选视频、评论采集与 LLM 过滤，最终生成痛点分析与商业输出建议。

## 核心功能

- 候选视频列表按互动得分排序
- LLM 二次筛选 TOP 视频
- Top / Latest / 痛点关键词评论采样
- 评论分类：pain_point / positive / neutral
- 批次分析与最终商业报告
- 支持 CSV 导出和 Supabase 持久化

## 技术栈

- Python
- Playwright
- Ollama / OpenAI API
- Supabase

## 运行方式

```bash
pip install -r requirements.txt
python run_server.py --reload
# 或者：
uvicorn main:app --reload --host 127.0.0.1 --port 8899
```

### 运行提示

- 复制 `.env.example` 为 `.env` 并配置 LLM 与 Supabase
- 若在 Windows 上出现端口冲突，可指定不同端口

## 演示资源

- [最终效果文档下载：实际最终效果.doc](../media/project-c/实际最终效果.doc)

## 亮点

- 将 YouTube 评论数据与 LLM 分析结合
- 输出商业洞察与广告文案方向
- 适合选品、内容策划与用户需求分析
