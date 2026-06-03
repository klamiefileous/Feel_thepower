# BBQ / Catering Lead Generation System

一个面向商家线索生成的自动化管道，组合 Serper 搜索、Google Maps/Facebook 页面解析、数据去重与 Supabase 存储。

## 核心功能

- 周定时任务抓取商家结果
- 关键字生成与搜索结果解析
- Google Maps / Facebook 页面内容提取
- 去重后插入 Supabase Postgres
- FastAPI 浏览接口：`GET /leads`、`GET /stats`

## 技术栈

- Python
- FastAPI
- APScheduler
- Supabase / Postgres
- Serper 搜索

## 运行方式

```bash
python -m venv .venv
source .venv/bin/activate
pip install -r requirements.txt
uvicorn app.main:app --reload
```

## 演示资源

- [演示视频下载：fast uvicore与supabase连接教程（对应工程facebook商家爬取）.mp4](../media/project-a/fast%20uvicore与supabase连接教程（对应工程facebook商家爬取）.mp4)
- [使用说明.docx](../media/project-a/使用说明.docx)

<video controls width="100%" style="border-radius: 12px; margin-top: 16px;">
  <source src="../media/project-a/fast%20uvicore与supabase连接教程（对应工程facebook商家爬取）.mp4" type="video/mp4">
  您的浏览器不支持 video 标签。
</video>

如果你想部署成 Docker：

```bash
docker build -t bbq-leadgen .
docker run --rm -p 8000:8000 -e SERPER_API_KEY=... -e SUPABASE_URL=... -e SUPABASE_KEY=... bbq-leadgen
```

## 亮点

- 适合商业线索采集场景
- 实现自动化定时数据管道
- 支持结构化查询与统计接口
