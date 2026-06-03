# GitHub Pages 项目展示框架

这个工程已经升级为 **MkDocs 展示站**，适合用来展示你的项目组合，并且风格更清新、结构更清晰。

## 当前内容

- `mkdocs.yml`：MkDocs 配置文件
- `docs/`：页面内容目录
- `docs/projects/`：三个项目的详细展示页
- `docs/css/extra.css`：定制清新风格样式
- `index.html` 与 `style.css`：原始静态展示页，可继续保留或删除

## 启动方式

1. 安装依赖：

```bash
pip install mkdocs-material
```

2. 在 `github-pages-portfolio` 目录运行：

```bash
mkdocs serve
```

3. 打开浏览器：

```text
http://127.0.0.1:8000
```

## 构建和部署

```bash
mkdocs build
mkdocs gh-deploy
```

## 说明

- 该 MkDocs 站点适合直接发布到 GitHub Pages。
- 如果你希望，我还可以继续帮你把页面改成包含项目截图和实际成果/数据指标的更完整作品集。
